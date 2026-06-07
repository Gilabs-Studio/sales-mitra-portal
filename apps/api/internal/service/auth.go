package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/httpx"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	store *store.Store
	cfg   config.Config
}

type RegisterInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type CreateAdminInput struct {
	Name     string `json:"name"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResult struct {
	Token string      `json:"token"`
	User  domain.User `json:"user"`
}

type Claims struct {
	Role domain.Role `json:"role"`
	jwt.RegisteredClaims
}

func NewAuthService(repository *store.Store, cfg config.Config) *AuthService {
	return &AuthService{store: repository, cfg: cfg}
}

func (s *AuthService) EnsureUser(ctx context.Context, name string, username string, email string, password string, role domain.Role) error {
	return s.ensureUser(ctx, name, username, email, password, role)
}

func (s *AuthService) RegisterPartner(ctx context.Context, input RegisterInput) (AuthResult, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if input.Name == "" || input.Email == "" || len(input.Password) < 8 {
		return AuthResult{}, httpx.Validation("Data registrasi belum valid", "Nama, email, dan password minimal 8 karakter wajib diisi.")
	}

	hash, err := hashPassword(input.Password)
	if err != nil {
		return AuthResult{}, err
	}

	user := domain.User{
		ID:          uuid.NewString(),
		Name:        input.Name,
		Email:       input.Email,
		Role:        domain.RolePartner,
		PartnerCode: uniquePartnerCode(input.Name, s.cfg.ReferralCodeSeed),
		CreatedAt:   time.Now().UTC(),
	}

	if err := s.store.CreateUser(ctx, user, hash); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return AuthResult{}, httpx.Conflict("Email sudah terdaftar")
		}
		return AuthResult{}, err
	}

	if err := s.createDefaultReferrals(ctx, user); err != nil {
		return AuthResult{}, err
	}

	token, err := s.issueToken(user)
	if err != nil {
		return AuthResult{}, err
	}

	return AuthResult{Token: token, User: user}, nil
}

func (s *AuthService) CreateAdmin(ctx context.Context, input CreateAdminInput) (domain.User, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Username = strings.ToLower(strings.TrimSpace(input.Username))
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	if input.Name == "" || input.Username == "" || input.Email == "" || len(input.Password) < 8 {
		return domain.User{}, httpx.Validation("Data admin belum valid", "Nama, username, email, dan password minimal 8 karakter wajib diisi.")
	}

	hash, err := hashPassword(input.Password)
	if err != nil {
		return domain.User{}, err
	}

	user := domain.User{
		ID:        uuid.NewString(),
		Name:      input.Name,
		Username:  input.Username,
		Email:     input.Email,
		Role:      domain.RoleAdmin,
		CreatedAt: time.Now().UTC(),
	}

	if err := s.store.CreateUser(ctx, user, hash); err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return domain.User{}, httpx.Conflict("Email atau username admin sudah terdaftar")
		}
		return domain.User{}, err
	}

	return user, nil
}

func (s *AuthService) Login(ctx context.Context, input LoginInput) (AuthResult, error) {
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if input.Email == "" || input.Password == "" {
		return AuthResult{}, httpx.Validation("Email atau username dan password wajib diisi", "")
	}

	authUser, err := s.store.GetUserByLogin(ctx, input.Email)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return AuthResult{}, httpx.Unauthorized("Email, username, atau password salah")
		}
		return AuthResult{}, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(authUser.PasswordHash), []byte(input.Password)); err != nil {
		return AuthResult{}, httpx.Unauthorized("Email, username, atau password salah")
	}

	token, err := s.issueToken(authUser.User)
	if err != nil {
		return AuthResult{}, err
	}

	return AuthResult{Token: token, User: authUser.User}, nil
}

func (s *AuthService) Me(ctx context.Context, userID string) (domain.User, error) {
	user, err := s.store.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return domain.User{}, httpx.Unauthorized("Sesi tidak ditemukan")
		}
		return domain.User{}, err
	}
	return user, nil
}

func (s *AuthService) ParseToken(tokenValue string) (Claims, error) {
	parsed, err := jwt.ParseWithClaims(tokenValue, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return Claims{}, httpx.Unauthorized("Token tidak valid")
	}

	claims, ok := parsed.Claims.(*Claims)
	if !ok || !parsed.Valid || claims.Subject == "" {
		return Claims{}, httpx.Unauthorized("Token tidak valid")
	}

	return *claims, nil
}

func (s *AuthService) ensureUser(ctx context.Context, name string, username string, email string, password string, role domain.Role) error {
	if !role.IsValid() {
		return fmt.Errorf("role tidak valid: %s", role)
	}

	if authUser, err := s.store.GetUserByEmail(ctx, email); err == nil {
		username = strings.ToLower(strings.TrimSpace(username))
		if username != "" && authUser.Username == "" {
			if err := s.store.SetUsernameByEmail(ctx, email, username); err != nil {
				return err
			}
		}
		if authUser.Role != role {
			return s.store.SetRoleByEmail(ctx, email, role)
		}
		return nil
	} else if !errors.Is(err, store.ErrNotFound) {
		return err
	}

	hash, err := hashPassword(password)
	if err != nil {
		return err
	}

	partnerCode := ""
	if role == domain.RolePartner {
		partnerCode = uniquePartnerCode(name, s.cfg.ReferralCodeSeed)
	}

	user := domain.User{
		ID:          uuid.NewString(),
		Name:        name,
		Username:    strings.ToLower(strings.TrimSpace(username)),
		Email:       strings.ToLower(email),
		Role:        role,
		PartnerCode: partnerCode,
		CreatedAt:   time.Now().UTC(),
	}

	if err := s.store.CreateUser(ctx, user, hash); err != nil {
		return err
	}
	if role == domain.RolePartner {
		return s.createDefaultReferrals(ctx, user)
	}
	return nil
}

func (s *AuthService) createDefaultReferrals(ctx context.Context, user domain.User) error {
	products := []string{"SalesView", "Company Profile", "Custom Software"}
	for _, product := range products {
		referral := domain.Referral{
			ID:         uuid.NewString(),
			PartnerID:  user.ID,
			Product:    product,
			Code:       fmt.Sprintf("%s-%s", user.PartnerCode, referralSuffix(product)),
			UsageCount: 0,
			CreatedAt:  time.Now().UTC(),
		}
		if err := s.store.CreateReferral(ctx, referral); err != nil {
			return err
		}
	}
	return nil
}

func (s *AuthService) issueToken(user domain.User) (string, error) {
	now := time.Now().UTC()
	claims := Claims{
		Role: user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			ExpiresAt: jwt.NewNumericDate(now.Add(s.cfg.JWTExpiresIn)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func uniquePartnerCode(name string, seed string) string {
	return fmt.Sprintf("%s-%s", store.PartnerCode(name, seed), strings.ToUpper(uuid.NewString()[:6]))
}

func referralSuffix(product string) string {
	cleaned := strings.ToUpper(strings.ReplaceAll(product, " ", ""))
	if len(cleaned) > 5 {
		return cleaned[:5]
	}
	return cleaned
}
