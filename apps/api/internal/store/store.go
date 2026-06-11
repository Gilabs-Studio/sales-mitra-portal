package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

var ErrNotFound = errors.New("record not found")

type Store struct {
	db *sql.DB
}

type CreateLeadInput struct {
	PartnerID          string
	CompanyName        string
	ContactName        string
	ContactEmail       string
	ContactPhone       string
	ServiceType        domain.ServiceType
	Budget             int64
	NeedSummary        string
	Notes              string
	Status             domain.LeadStatus
	QualificationScore int
	QualificationNote  string
}

type LeadFilters struct {
	Status      string
	ServiceType string
	Limit       int
	Offset      int
}

type ServiceRuleInput struct {
	Type              domain.ServiceType
	Label             string
	Description       string
	MinimumBudget     int64
	RequiresDiscovery bool
	IsActive          bool
}

func Open(databaseURL string) (*sql.DB, error) {
	if strings.HasPrefix(databaseURL, "file:") && !strings.Contains(databaseURL, "mode=memory") {
		path := strings.TrimPrefix(databaseURL, "file:")
		if queryIndex := strings.Index(path, "?"); queryIndex >= 0 {
			path = path[:queryIndex]
		}
		if path != "" {
			if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
				return nil, err
			}
		}
	}

	db, err := sql.Open("sqlite", databaseURL)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)

	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}

func New(db *sql.DB) *Store {
	return &Store{db: db}
}

func (s *Store) Migrate() error {
	tables := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			username TEXT NOT NULL DEFAULT '',
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'partner', 'client')),
			partner_code TEXT NOT NULL DEFAULT '',
			is_suspended INTEGER NOT NULL DEFAULT 0,
			suspended_reason TEXT NOT NULL DEFAULT '',
			suspended_at TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS password_reset_tokens (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token_hash TEXT NOT NULL UNIQUE,
			expires_at TEXT NOT NULL,
			used_at TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS service_catalog (
			type TEXT PRIMARY KEY,
			label TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			minimum_budget INTEGER NOT NULL DEFAULT 0,
			requires_discovery INTEGER NOT NULL DEFAULT 0,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS leads (
			id TEXT PRIMARY KEY,
			partner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			company_name TEXT NOT NULL,
			contact_name TEXT NOT NULL,
			contact_email TEXT NOT NULL,
			contact_phone TEXT NOT NULL DEFAULT '',
			service_type TEXT NOT NULL,
			budget INTEGER NOT NULL DEFAULT 0,
			need_summary TEXT NOT NULL DEFAULT '',
			notes TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL,
			qualification_score INTEGER NOT NULL DEFAULT 0,
			qualification_note TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS lead_events (
			id TEXT PRIMARY KEY,
			lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
			actor_id TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL,
			note TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS referrals (
			id TEXT PRIMARY KEY,
			partner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			product TEXT NOT NULL,
			code TEXT NOT NULL UNIQUE,
			usage_count INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS lead_messages (
			id TEXT PRIMARY KEY,
			lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
			sender_id TEXT NOT NULL,
			sender_name TEXT NOT NULL DEFAULT '',
			sender_role TEXT NOT NULL DEFAULT '',
			message TEXT NOT NULL,
			is_read INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS knowledge_articles (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			category TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS lead_payouts (
			id TEXT PRIMARY KEY,
			lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
			amount_paid INTEGER NOT NULL,
			commission_paid INTEGER NOT NULL,
			evidence_url TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS client_projects (
			id TEXT PRIMARY KEY,
			client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			pic_name TEXT NOT NULL DEFAULT '',
			pic_email TEXT NOT NULL DEFAULT '',
			start_date TEXT NOT NULL DEFAULT '',
			target_end_date TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL,
			progress_percent INTEGER NOT NULL DEFAULT 0,
			website_url TEXT NOT NULL DEFAULT '',
			staging_url TEXT NOT NULL DEFAULT '',
			credential_note TEXT NOT NULL DEFAULT '',
			documentation_url TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS project_progress (
			id TEXT PRIMARY KEY,
			project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			status TEXT NOT NULL,
			percentage INTEGER NOT NULL DEFAULT 0,
			note TEXT NOT NULL DEFAULT '',
			document_url TEXT NOT NULL DEFAULT '',
			updated_by_id TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS project_documents (
			id TEXT PRIMARY KEY,
			project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			category TEXT NOT NULL DEFAULT 'other',
			url TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			uploaded_by_id TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS maintenance_plans (
			id TEXT PRIMARY KEY,
			project_id TEXT NOT NULL UNIQUE REFERENCES client_projects(id) ON DELETE CASCADE,
			type TEXT NOT NULL,
			period_start TEXT NOT NULL DEFAULT '',
			period_end TEXT NOT NULL DEFAULT '',
			quota_total INTEGER NOT NULL DEFAULT 0,
			is_active INTEGER NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS maintenance_logs (
			id TEXT PRIMARY KEY,
			project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
			request_date TEXT NOT NULL,
			description TEXT NOT NULL,
			status TEXT NOT NULL,
			pic_name TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS project_invoices (
			id TEXT PRIMARY KEY,
			project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
			number TEXT NOT NULL,
			amount INTEGER NOT NULL DEFAULT 0,
			status TEXT NOT NULL,
			issued_at TEXT NOT NULL DEFAULT '',
			due_at TEXT NOT NULL DEFAULT '',
			paid_at TEXT NOT NULL DEFAULT '',
			document_url TEXT NOT NULL DEFAULT '',
			payment_note TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS project_activities (
			id TEXT PRIMARY KEY,
			project_id TEXT NOT NULL REFERENCES client_projects(id) ON DELETE CASCADE,
			actor_id TEXT NOT NULL DEFAULT '',
			action TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
		)`,
	}

	indexes := []string{
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username) WHERE username <> ''`,
		`CREATE INDEX IF NOT EXISTS idx_service_catalog_active_label ON service_catalog(is_active, label)`,
		`CREATE INDEX IF NOT EXISTS idx_leads_partner_status_created ON leads(partner_id, status, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_leads_status_service_created ON leads(status, service_type, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_lead_events_lead_created ON lead_events(lead_id, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_lead_messages_lead_created ON lead_messages(lead_id, created_at ASC)`,
		`CREATE INDEX IF NOT EXISTS idx_lead_messages_unread ON lead_messages(lead_id, is_read)`,
		`CREATE INDEX IF NOT EXISTS idx_referrals_partner ON referrals(partner_id)`,
		`CREATE INDEX IF NOT EXISTS idx_lead_payouts_lead ON lead_payouts(lead_id)`,
		`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_client_projects_client_status ON client_projects(client_id, status, updated_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_project_progress_project_updated ON project_progress(project_id, updated_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_project_documents_project_category ON project_documents(project_id, category, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_maintenance_logs_project_date ON maintenance_logs(project_id, request_date DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_project_invoices_project_status ON project_invoices(project_id, status, due_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_project_activities_project_created ON project_activities(project_id, created_at DESC)`,
	}

	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, statement := range tables {
		if _, err := tx.Exec(statement); err != nil {
			return err
		}
	}

	if err := addColumnIfMissing(tx, "users", "username", "TEXT NOT NULL DEFAULT ''"); err != nil {
		return err
	}
	if err := addColumnIfMissing(tx, "users", "is_suspended", "INTEGER NOT NULL DEFAULT 0"); err != nil {
		return err
	}
	if err := addColumnIfMissing(tx, "users", "suspended_reason", "TEXT NOT NULL DEFAULT ''"); err != nil {
		return err
	}
	if err := addColumnIfMissing(tx, "users", "suspended_at", "TEXT NOT NULL DEFAULT ''"); err != nil {
		return err
	}

	if err := updateUsersRoleConstraint(tx); err != nil {
		return err
	}

	if err := addColumnIfMissing(tx, "leads", "commission_rate", "REAL NOT NULL DEFAULT 0.0"); err != nil {
		return err
	}

	if err := addColumnIfMissing(tx, "leads", "deal_amount", "INTEGER NOT NULL DEFAULT 0"); err != nil {
		return err
	}

	for _, statement := range indexes {
		if _, err := tx.Exec(statement); err != nil {
			return err
		}
	}

	return tx.Commit()
}

func updateUsersRoleConstraint(tx *sql.Tx) error {
	var schemaSQL string
	if err := tx.QueryRow(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'`).Scan(&schemaSQL); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil
		}
		return err
	}

	if strings.Contains(schemaSQL, "'super_admin'") && strings.Contains(schemaSQL, "'client'") {
		return nil
	}

	updatedSchema := schemaSQL
	updatedSchema = strings.Replace(updatedSchema, "CHECK (role IN ('admin', 'partner'))", "CHECK (role IN ('super_admin', 'admin', 'partner', 'client'))", 1)
	updatedSchema = strings.Replace(updatedSchema, "CHECK (role IN ('super_admin', 'admin', 'partner'))", "CHECK (role IN ('super_admin', 'admin', 'partner', 'client'))", 1)
	if updatedSchema == schemaSQL {
		return fmt.Errorf("gagal memperbarui constraint role users")
	}

	if _, err := tx.Exec(`PRAGMA writable_schema = ON`); err != nil {
		return err
	}
	if _, err := tx.Exec(`UPDATE sqlite_master SET sql = ? WHERE type = 'table' AND name = 'users'`, updatedSchema); err != nil {
		_, _ = tx.Exec(`PRAGMA writable_schema = OFF`)
		return err
	}

	var schemaVersion int
	if err := tx.QueryRow(`PRAGMA schema_version`).Scan(&schemaVersion); err != nil {
		_, _ = tx.Exec(`PRAGMA writable_schema = OFF`)
		return err
	}
	if _, err := tx.Exec(fmt.Sprintf(`PRAGMA schema_version = %d`, schemaVersion+1)); err != nil {
		_, _ = tx.Exec(`PRAGMA writable_schema = OFF`)
		return err
	}
	if _, err := tx.Exec(`PRAGMA writable_schema = OFF`); err != nil {
		return err
	}

	return nil
}

func addColumnIfMissing(tx *sql.Tx, table string, column string, definition string) error {
	if !isSafeIdentifier(table) || !isSafeIdentifier(column) {
		return fmt.Errorf("unsafe migration identifier")
	}
	rows, err := tx.Query(`PRAGMA table_info(` + table + `)`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var cid int
		var name string
		var columnType string
		var notNull int
		var defaultValue sql.NullString
		var primaryKey int
		if err := rows.Scan(&cid, &name, &columnType, &notNull, &defaultValue, &primaryKey); err != nil {
			return err
		}
		if name == column {
			return nil
		}
	}
	if err := rows.Err(); err != nil {
		return err
	}

	_, err = tx.Exec(`ALTER TABLE ` + table + ` ADD COLUMN ` + column + ` ` + definition)
	return err
}

func isSafeIdentifier(value string) bool {
	if value == "" {
		return false
	}
	for _, char := range value {
		if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '_' {
			continue
		}
		return false
	}
	return true
}

func (s *Store) SeedKnowledge(ctx context.Context) error {
	now := nowString()
	articles := []domain.KnowledgeArticle{
		{
			ID:       "knw-company-profile",
			Title:    "Company Profile",
			Category: "Layanan",
			Content:  "Company Profile membantu klien membangun kredibilitas digital, menjelaskan positioning, menampilkan layanan/produk, dan membuka funnel kontak yang lebih siap dikonversi. Sales perlu menggali target audiens, pembeda bisnis, trust builder, CTA utama, aset konten, dan kebutuhan maintenance.",
		},
		{
			ID:       "knw-website-app",
			Title:    "Website dan Aplikasi Sederhana",
			Category: "Layanan",
			Content:  "Website atau aplikasi sederhana mencakup portal ringan, katalog, booking, dashboard dasar, MVP, workflow internal, dan integrasi standar. Lead ideal mulai Rp15 juta, dengan scope, user role, alur approval, data utama, dan prioritas fase pertama yang cukup jelas.",
		},
		{
			ID:       "knw-custom-software",
			Title:    "Custom Software, ERP, dan Sistem Kompleks",
			Category: "Discovery",
			Content:  "Custom software, ERP, dan sistem kompleks wajib melalui discovery untuk memetakan masalah bisnis, proses as-is/to-be, stakeholder, modul prioritas, integrasi, migrasi data, timeline, risiko, dan budget range. Jika budget belum jelas, mitra perlu melengkapi ringkasan kebutuhan proyek.",
		},
		{
			ID:       "knw-salesview",
			Title:    "SalesView",
			Category: "Produk",
			Content:  "SalesView adalah suite modular untuk POS, CRM, ERP, HR, Finance, pipeline sales, dan referral tracking. Mitra dapat memulai percakapan dari pain point operasional paling terasa lalu menawarkan modul yang paling relevan sebagai langkah pertama.",
		},
		{
			ID:       "knw-sop-software-development",
			Title:    "SOP Standard Software Development",
			Category: "SOP",
			Content:  "SOP development GiLabs menjaga kualitas dari discovery sampai live: requirement alignment, scope, desain flow/UX, sprint development, code review, QA/testing, staging, UAT, deployment, handover, dokumentasi, dan maintenance. Untuk sales, SOP ini adalah bukti bahwa proyek punya kontrol kualitas dan risiko yang jelas.",
		},
	}

	for _, article := range articles {
		if _, err := s.db.ExecContext(
			ctx,
			`INSERT INTO knowledge_articles (id, title, category, content, created_at)
			 VALUES (?, ?, ?, ?, ?)
			 ON CONFLICT(id) DO UPDATE SET
				title = excluded.title,
				category = excluded.category,
				content = excluded.content`,
			article.ID,
			article.Title,
			article.Category,
			article.Content,
			now,
		); err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) CreateUser(ctx context.Context, user domain.User, passwordHash string) error {
	_, err := s.db.ExecContext(
		ctx,
		`INSERT INTO users (id, name, username, email, password_hash, role, partner_code, is_suspended, suspended_reason, suspended_at, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		user.ID,
		user.Name,
		strings.ToLower(user.Username),
		strings.ToLower(user.Email),
		passwordHash,
		user.Role,
		user.PartnerCode,
		boolToInt(user.IsSuspended),
		user.SuspendedReason,
		formatOptionalTime(user.SuspendedAt),
		formatTime(user.CreatedAt),
	)
	return err
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (domain.UserAuth, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT id, name, username, email, password_hash, role, partner_code, is_suspended, suspended_reason, suspended_at, created_at
		 FROM users
		 WHERE email = ?`,
		strings.ToLower(email),
	)
	return scanUserAuth(row)
}

func (s *Store) GetUserByLogin(ctx context.Context, login string) (domain.UserAuth, error) {
	login = strings.ToLower(strings.TrimSpace(login))
	row := s.db.QueryRowContext(
		ctx,
		`SELECT id, name, username, email, password_hash, role, partner_code, is_suspended, suspended_reason, suspended_at, created_at
		 FROM users
		 WHERE email = ? OR username = ?`,
		login,
		login,
	)
	return scanUserAuth(row)
}

func (s *Store) GetUserAuthByID(ctx context.Context, id string) (domain.UserAuth, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT id, name, username, email, password_hash, role, partner_code, is_suspended, suspended_reason, suspended_at, created_at
		 FROM users
		 WHERE id = ?`,
		id,
	)
	return scanUserAuth(row)
}

func (s *Store) GetUserByID(ctx context.Context, id string) (domain.User, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT id, name, username, email, role, partner_code, is_suspended, suspended_reason, suspended_at, created_at
		 FROM users
		 WHERE id = ?`,
		id,
	)

	var user domain.User
	var isSuspended int
	var suspendedAt string
	var createdAt string
	if err := row.Scan(&user.ID, &user.Name, &user.Username, &user.Email, &user.Role, &user.PartnerCode, &isSuspended, &user.SuspendedReason, &suspendedAt, &createdAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.User{}, ErrNotFound
		}
		return domain.User{}, err
	}
	user.IsSuspended = intToBool(isSuspended)
	user.SuspendedAt = parseOptionalTime(suspendedAt)
	user.CreatedAt = parseTime(createdAt)
	return user, nil
}

func (s *Store) ListUsersByRole(ctx context.Context, role domain.Role) ([]domain.User, error) {
	return s.ListUsersByRoles(ctx, role)
}

func (s *Store) ListUsersByRoles(ctx context.Context, roles ...domain.Role) ([]domain.User, error) {
	if len(roles) == 0 {
		return []domain.User{}, nil
	}

	placeholders := make([]string, 0, len(roles))
	args := make([]interface{}, 0, len(roles))
	for _, role := range roles {
		placeholders = append(placeholders, "?")
		args = append(args, role)
	}

	rows, err := s.db.QueryContext(
		ctx,
		fmt.Sprintf(
			`SELECT id, name, username, email, role, partner_code, is_suspended, suspended_reason, suspended_at, created_at
			 FROM users
			 WHERE role IN (%s)
			 ORDER BY created_at ASC`,
			strings.Join(placeholders, ", "),
		),
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []domain.User{}
	for rows.Next() {
		var user domain.User
		var isSuspended int
		var suspendedAt string
		var createdAt string
		if err := rows.Scan(&user.ID, &user.Name, &user.Username, &user.Email, &user.Role, &user.PartnerCode, &isSuspended, &user.SuspendedReason, &suspendedAt, &createdAt); err != nil {
			return nil, err
		}
		user.IsSuspended = intToBool(isSuspended)
		user.SuspendedAt = parseOptionalTime(suspendedAt)
		user.CreatedAt = parseTime(createdAt)
		users = append(users, user)
	}

	return users, rows.Err()
}

func (s *Store) SetUsernameByEmail(ctx context.Context, email string, username string) error {
	_, err := s.db.ExecContext(
		ctx,
		`UPDATE users
		 SET username = ?
		 WHERE email = ?`,
		strings.ToLower(strings.TrimSpace(username)),
		strings.ToLower(strings.TrimSpace(email)),
	)
	return err
}

func (s *Store) SetRoleByEmail(ctx context.Context, email string, role domain.Role) error {
	_, err := s.db.ExecContext(
		ctx,
		`UPDATE users
		 SET role = ?
		 WHERE email = ?`,
		role,
		strings.ToLower(strings.TrimSpace(email)),
	)
	return err
}

func (s *Store) UpdateUserProfile(ctx context.Context, userID string, name string, email string) (domain.User, error) {
	result, err := s.db.ExecContext(
		ctx,
		`UPDATE users
		 SET name = ?, email = ?
		 WHERE id = ?`,
		strings.TrimSpace(name),
		strings.ToLower(strings.TrimSpace(email)),
		userID,
	)
	if err != nil {
		return domain.User{}, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return domain.User{}, err
	}
	if affected == 0 {
		return domain.User{}, ErrNotFound
	}
	return s.GetUserByID(ctx, userID)
}

func (s *Store) UpdateUserPassword(ctx context.Context, userID string, passwordHash string) error {
	result, err := s.db.ExecContext(
		ctx,
		`UPDATE users
		 SET password_hash = ?
		 WHERE id = ?`,
		passwordHash,
		userID,
	)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) UpdateUserSuspension(ctx context.Context, userID string, isSuspended bool, reason string) error {
	suspendedAt := ""
	if isSuspended {
		suspendedAt = formatTime(time.Now().UTC())
	}

	result, err := s.db.ExecContext(
		ctx,
		`UPDATE users
		 SET is_suspended = ?, suspended_reason = ?, suspended_at = ?
		 WHERE id = ?`,
		boolToInt(isSuspended),
		strings.TrimSpace(reason),
		suspendedAt,
		userID,
	)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) CreatePasswordResetToken(ctx context.Context, userID string, tokenHash string, expiresAt time.Time) error {
	now := time.Now().UTC()
	_, err := s.db.ExecContext(
		ctx,
		`INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at)
		 VALUES (?, ?, ?, ?, '', ?)`,
		uuid.NewString(),
		userID,
		tokenHash,
		formatTime(expiresAt),
		formatTime(now),
	)
	return err
}

func (s *Store) MarkPasswordResetTokensUsedByUser(ctx context.Context, userID string) error {
	_, err := s.db.ExecContext(
		ctx,
		`UPDATE password_reset_tokens
		 SET used_at = ?
		 WHERE user_id = ? AND used_at = ''`,
		formatTime(time.Now().UTC()),
		userID,
	)
	return err
}

func (s *Store) GetPasswordResetToken(ctx context.Context, tokenHash string) (domain.User, string, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT u.id, u.name, u.username, u.email, u.role, u.partner_code, u.is_suspended, u.suspended_reason, u.suspended_at, u.created_at,
			t.id, t.expires_at, t.used_at
		FROM password_reset_tokens t
		INNER JOIN users u ON u.id = t.user_id
		WHERE t.token_hash = ?`,
		tokenHash,
	)

	var user domain.User
	var tokenID string
	var isSuspended int
	var suspendedAt string
	var createdAt string
	var expiresAt string
	var usedAt string
	if err := row.Scan(&user.ID, &user.Name, &user.Username, &user.Email, &user.Role, &user.PartnerCode, &isSuspended, &user.SuspendedReason, &suspendedAt, &createdAt, &tokenID, &expiresAt, &usedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.User{}, "", ErrNotFound
		}
		return domain.User{}, "", err
	}

	user.IsSuspended = intToBool(isSuspended)
	user.SuspendedAt = parseOptionalTime(suspendedAt)
	user.CreatedAt = parseTime(createdAt)

	if usedAt != "" {
		return domain.User{}, "", ErrNotFound
	}
	if parseTime(expiresAt).Before(time.Now().UTC()) {
		return domain.User{}, "", ErrNotFound
	}

	return user, tokenID, nil
}

func (s *Store) MarkPasswordResetTokenUsed(ctx context.Context, tokenID string) error {
	result, err := s.db.ExecContext(
		ctx,
		`UPDATE password_reset_tokens
		 SET used_at = ?
		 WHERE id = ? AND used_at = ''`,
		formatTime(time.Now().UTC()),
		tokenID,
	)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) SeedServiceCatalog(ctx context.Context, services []domain.ServiceRule) error {
	for _, service := range services {
		if _, err := s.db.ExecContext(
			ctx,
			`INSERT INTO service_catalog (
				type, label, description, minimum_budget, requires_discovery, is_active, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(type) DO NOTHING`,
			service.Type,
			service.Label,
			service.Description,
			service.MinimumBudget,
			boolToInt(service.RequiresDiscovery),
			boolToInt(service.IsActive),
			formatTime(service.CreatedAt),
			formatTime(service.UpdatedAt),
		); err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) ListServiceCatalog(ctx context.Context, includeInactive bool) ([]domain.ServiceRule, error) {
	query := `SELECT type, label, description, minimum_budget, requires_discovery, is_active, created_at, updated_at
		FROM service_catalog`
	args := []interface{}{}
	if !includeInactive {
		query += " WHERE is_active = ?"
		args = append(args, 1)
	}
	query += " ORDER BY label ASC"

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	services := []domain.ServiceRule{}
	for rows.Next() {
		service, err := scanServiceRule(rows)
		if err != nil {
			return nil, err
		}
		services = append(services, service)
	}
	return services, rows.Err()
}

func (s *Store) GetServiceRule(ctx context.Context, serviceType domain.ServiceType) (domain.ServiceRule, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT type, label, description, minimum_budget, requires_discovery, is_active, created_at, updated_at
		 FROM service_catalog
		 WHERE type = ?`,
		serviceType,
	)
	return scanServiceRule(row)
}

func (s *Store) UpsertServiceRule(ctx context.Context, input ServiceRuleInput) (domain.ServiceRule, error) {
	now := time.Now().UTC()
	_, err := s.db.ExecContext(
		ctx,
		`INSERT INTO service_catalog (
			type, label, description, minimum_budget, requires_discovery, is_active, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(type) DO UPDATE SET
			label = excluded.label,
			description = excluded.description,
			minimum_budget = excluded.minimum_budget,
			requires_discovery = excluded.requires_discovery,
			is_active = excluded.is_active,
			updated_at = excluded.updated_at`,
		input.Type,
		input.Label,
		input.Description,
		input.MinimumBudget,
		boolToInt(input.RequiresDiscovery),
		boolToInt(input.IsActive),
		formatTime(now),
		formatTime(now),
	)
	if err != nil {
		return domain.ServiceRule{}, err
	}
	return s.GetServiceRule(ctx, input.Type)
}

func (s *Store) DeleteServiceRule(ctx context.Context, serviceType domain.ServiceType) error {
	result, err := s.db.ExecContext(ctx, `DELETE FROM service_catalog WHERE type = ?`, serviceType)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) CreateReferral(ctx context.Context, referral domain.Referral) error {
	_, err := s.db.ExecContext(
		ctx,
		`INSERT OR IGNORE INTO referrals (id, partner_id, product, code, usage_count, created_at)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		referral.ID,
		referral.PartnerID,
		referral.Product,
		referral.Code,
		referral.UsageCount,
		formatTime(referral.CreatedAt),
	)
	return err
}

func (s *Store) CreateLead(ctx context.Context, input CreateLeadInput) (domain.Lead, error) {
	now := time.Now().UTC()
	lead := domain.Lead{
		ID:                 uuid.NewString(),
		PartnerID:          input.PartnerID,
		CompanyName:        input.CompanyName,
		ContactName:        input.ContactName,
		ContactEmail:       strings.ToLower(input.ContactEmail),
		ContactPhone:       input.ContactPhone,
		ServiceType:        input.ServiceType,
		Budget:             input.Budget,
		NeedSummary:        input.NeedSummary,
		Notes:              input.Notes,
		Status:             input.Status,
		QualificationScore: input.QualificationScore,
		QualificationNote:  input.QualificationNote,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.Lead{}, err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO leads (
			id, partner_id, company_name, contact_name, contact_email, contact_phone,
			service_type, budget, need_summary, notes, status, qualification_score,
			qualification_note, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		lead.ID,
		lead.PartnerID,
		lead.CompanyName,
		lead.ContactName,
		lead.ContactEmail,
		lead.ContactPhone,
		lead.ServiceType,
		lead.Budget,
		lead.NeedSummary,
		lead.Notes,
		lead.Status,
		lead.QualificationScore,
		lead.QualificationNote,
		formatTime(lead.CreatedAt),
		formatTime(lead.UpdatedAt),
	); err != nil {
		return domain.Lead{}, err
	}

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO lead_events (id, lead_id, actor_id, status, note, created_at)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		uuid.NewString(),
		lead.ID,
		lead.PartnerID,
		lead.Status,
		lead.QualificationNote,
		formatTime(now),
	); err != nil {
		return domain.Lead{}, err
	}

	if err := tx.Commit(); err != nil {
		return domain.Lead{}, err
	}

	return lead, nil
}

func (s *Store) ListPartnerLeads(ctx context.Context, partnerID string, filters LeadFilters) ([]domain.Lead, int, error) {
	limit := normalizeLimit(filters.Limit)
	offset := filters.Offset

	countQuery := `SELECT COUNT(*) FROM leads WHERE partner_id = ?`
	countArgs := []interface{}{partnerID}
	if filters.Status != "" {
		countQuery += " AND status = ?"
		countArgs = append(countArgs, filters.Status)
	}
	if filters.ServiceType != "" {
		countQuery += " AND service_type = ?"
		countArgs = append(countArgs, filters.ServiceType)
	}
	var total int
	if err := s.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `SELECT l.id, l.partner_id, l.company_name, l.contact_name, l.contact_email, l.contact_phone,
			l.service_type, l.budget, l.need_summary, l.notes, l.status, l.qualification_score,
			l.qualification_note, l.created_at, l.updated_at,
			l.commission_rate, l.deal_amount,
			COALESCE((SELECT COUNT(*) FROM lead_messages m WHERE m.lead_id = l.id AND m.is_read = 0 AND m.sender_role = 'admin'), 0) AS unread_count,
			COALESCE((SELECT COUNT(*) FROM lead_messages m WHERE m.lead_id = l.id), 0) AS message_count,
			COALESCE((SELECT message FROM lead_messages m WHERE m.lead_id = l.id AND m.message LIKE '📅 Jadwal meeting diatur:%' ORDER BY m.created_at DESC LIMIT 1), '') AS meeting_message
		FROM leads l
		WHERE l.partner_id = ?`
	args := []interface{}{partnerID}

	if filters.Status != "" {
		query += " AND l.status = ?"
		args = append(args, filters.Status)
	}
	if filters.ServiceType != "" {
		query += " AND l.service_type = ?"
		args = append(args, filters.ServiceType)
	}

	query += " ORDER BY COALESCE((SELECT MAX(created_at) FROM lead_messages m WHERE m.lead_id = l.id), l.created_at) DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	leads, err := scanLeadsWithCount(rows)
	return leads, total, err
}

func (s *Store) ListAdminLeads(ctx context.Context, filters LeadFilters) ([]domain.LeadWithPartner, int, error) {
	limit := normalizeLimit(filters.Limit)
	offset := filters.Offset

	countQuery := `SELECT COUNT(*) FROM leads l WHERE 1 = 1`
	countArgs := []interface{}{}
	if filters.Status != "" {
		countQuery += " AND l.status = ?"
		countArgs = append(countArgs, filters.Status)
	}
	if filters.ServiceType != "" {
		countQuery += " AND l.service_type = ?"
		countArgs = append(countArgs, filters.ServiceType)
	}
	var total int
	if err := s.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `SELECT l.id, l.partner_id, l.company_name, l.contact_name, l.contact_email, l.contact_phone,
			l.service_type, l.budget, l.need_summary, l.notes, l.status, l.qualification_score,
			l.qualification_note, l.created_at, l.updated_at, u.name, u.email, u.partner_code, u.is_suspended,
			l.commission_rate, l.deal_amount,
			COALESCE((SELECT COUNT(*) FROM lead_messages m WHERE m.lead_id = l.id AND m.is_read = 0 AND m.sender_role = 'partner'), 0) AS unread_count,
			COALESCE((SELECT COUNT(*) FROM lead_messages m WHERE m.lead_id = l.id), 0) AS message_count,
			COALESCE((SELECT message FROM lead_messages m WHERE m.lead_id = l.id AND m.message LIKE '📅 Jadwal meeting diatur:%' ORDER BY m.created_at DESC LIMIT 1), '') AS meeting_message
		FROM leads l
		INNER JOIN users u ON u.id = l.partner_id
		WHERE 1 = 1`
	args := []interface{}{}

	if filters.Status != "" {
		query += " AND l.status = ?"
		args = append(args, filters.Status)
	}
	if filters.ServiceType != "" {
		query += " AND l.service_type = ?"
		args = append(args, filters.ServiceType)
	}

	query += " ORDER BY COALESCE((SELECT MAX(created_at) FROM lead_messages m WHERE m.lead_id = l.id), l.created_at) DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	leads, err := scanLeadWithPartnersWithCount(rows)
	return leads, total, err
}

func (s *Store) UpdateLeadStatus(ctx context.Context, leadID string, actorID string, status domain.LeadStatus, note string) (domain.LeadWithPartner, error) {
	now := time.Now().UTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.LeadWithPartner{}, err
	}
	defer tx.Rollback()

	result, err := tx.ExecContext(
		ctx,
		`UPDATE leads
		 SET status = ?, notes = CASE WHEN ? = '' THEN notes ELSE ? END, updated_at = ?
		 WHERE id = ?`,
		status,
		note,
		note,
		formatTime(now),
		leadID,
	)
	if err != nil {
		return domain.LeadWithPartner{}, err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return domain.LeadWithPartner{}, err
	}
	if affected == 0 {
		return domain.LeadWithPartner{}, ErrNotFound
	}

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO lead_events (id, lead_id, actor_id, status, note, created_at)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		uuid.NewString(),
		leadID,
		actorID,
		status,
		note,
		formatTime(now),
	); err != nil {
		return domain.LeadWithPartner{}, err
	}

	if err := tx.Commit(); err != nil {
		return domain.LeadWithPartner{}, err
	}

	return s.GetLeadWithPartner(ctx, leadID)
}

func (s *Store) GetLeadByID(ctx context.Context, leadID string, partnerID string) (domain.Lead, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT l.id, l.partner_id, l.company_name, l.contact_name, l.contact_email, l.contact_phone,
			l.service_type, l.budget, l.need_summary, l.notes, l.status, l.qualification_score,
			l.qualification_note, l.created_at, l.updated_at,
			l.commission_rate, l.deal_amount,
			COALESCE((SELECT COUNT(*) FROM lead_messages m WHERE m.lead_id = l.id AND m.is_read = 0 AND m.sender_role = 'admin'), 0),
			COALESCE((SELECT COUNT(*) FROM lead_messages m WHERE m.lead_id = l.id), 0),
			COALESCE((SELECT message FROM lead_messages m WHERE m.lead_id = l.id AND m.message LIKE '📅 Jadwal meeting diatur:%' ORDER BY m.created_at DESC LIMIT 1), '') AS meeting_message
		 FROM leads l
		 WHERE l.id = ? AND l.partner_id = ?`,
		leadID,
		partnerID,
	)
	return scanLeadWithCount(row)
}

func (s *Store) GetLeadWithPartner(ctx context.Context, leadID string) (domain.LeadWithPartner, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT l.id, l.partner_id, l.company_name, l.contact_name, l.contact_email, l.contact_phone,
			l.service_type, l.budget, l.need_summary, l.notes, l.status, l.qualification_score,
			l.qualification_note, l.created_at, l.updated_at, u.name, u.email, u.partner_code, u.is_suspended,
			l.commission_rate, l.deal_amount,
			COALESCE((SELECT COUNT(*) FROM lead_messages m WHERE m.lead_id = l.id AND m.is_read = 0 AND m.sender_role = 'partner'), 0),
			COALESCE((SELECT COUNT(*) FROM lead_messages m WHERE m.lead_id = l.id), 0),
			COALESCE((SELECT message FROM lead_messages m WHERE m.lead_id = l.id AND m.message LIKE '📅 Jadwal meeting diatur:%' ORDER BY m.created_at DESC LIMIT 1), '') AS meeting_message
		FROM leads l
		INNER JOIN users u ON u.id = l.partner_id
		WHERE l.id = ?`,
		leadID,
	)
	return scanLeadWithPartnerRowWithCount(row)
}

func (s *Store) GetPartnerDashboard(ctx context.Context, partnerID string) (domain.PartnerDashboard, error) {
	statusBreakdown, err := s.groupCounts(ctx, `SELECT status, status, COUNT(*) FROM leads WHERE partner_id = ? GROUP BY status`, partnerID)
	if err != nil {
		return domain.PartnerDashboard{}, err
	}
	serviceBreakdown, err := s.groupCounts(ctx, `SELECT service_type, service_type, COUNT(*) FROM leads WHERE partner_id = ? GROUP BY service_type`, partnerID)
	if err != nil {
		return domain.PartnerDashboard{}, err
	}
	recentLeads, _, err := s.ListPartnerLeads(ctx, partnerID, LeadFilters{Limit: 6})
	if err != nil {
		return domain.PartnerDashboard{}, err
	}
	referrals, err := s.ListReferrals(ctx, partnerID)
	if err != nil {
		return domain.PartnerDashboard{}, err
	}

	row := s.db.QueryRowContext(
		ctx,
		`SELECT COUNT(*),
			COALESCE(SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END), 0)
		 FROM leads
		 WHERE partner_id = ?`,
		partnerID,
	)

	var total, qualified, won, rejected int64
	if err := row.Scan(&total, &qualified, &won, &rejected); err != nil {
		return domain.PartnerDashboard{}, err
	}

	return domain.PartnerDashboard{
		Summary: []domain.MetricCard{
			{Label: "Total Lead", Value: total},
			{Label: "Qualified", Value: qualified},
			{Label: "Won", Value: won},
			{Label: "Rejected", Value: rejected},
		},
		StatusBreakdown:  labelStatuses(statusBreakdown),
		ServiceBreakdown: labelServices(serviceBreakdown),
		RecentLeads:      recentLeads,
		Referrals:        referrals,
	}, nil
}

func (s *Store) GetAdminDashboard(ctx context.Context) (domain.AdminDashboard, error) {
	statusBreakdown, err := s.groupCounts(ctx, `SELECT status, status, COUNT(*) FROM leads GROUP BY status`)
	if err != nil {
		return domain.AdminDashboard{}, err
	}
	serviceBreakdown, err := s.groupCounts(ctx, `SELECT service_type, service_type, COUNT(*) FROM leads GROUP BY service_type`)
	if err != nil {
		return domain.AdminDashboard{}, err
	}
	recentLeads, _, err := s.ListAdminLeads(ctx, LeadFilters{Limit: 8})
	if err != nil {
		return domain.AdminDashboard{}, err
	}

	row := s.db.QueryRowContext(
		ctx,
		`SELECT COUNT(*),
			COALESCE(SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END), 0),
			COALESCE(SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END), 0),
			(SELECT COUNT(*) FROM users WHERE role = 'partner')
		 FROM leads`,
	)

	var totalLeads, qualifiedLeads, wonLeads, totalPartners int64
	if err := row.Scan(&totalLeads, &qualifiedLeads, &wonLeads, &totalPartners); err != nil {
		return domain.AdminDashboard{}, err
	}

	return domain.AdminDashboard{
		Summary: []domain.MetricCard{
			{Label: "Total Lead", Value: totalLeads},
			{Label: "Qualified", Value: qualifiedLeads},
			{Label: "Won", Value: wonLeads},
			{Label: "Mitra Aktif", Value: totalPartners},
		},
		StatusBreakdown:  labelStatuses(statusBreakdown),
		ServiceBreakdown: labelServices(serviceBreakdown),
		RecentLeads:      recentLeads,
	}, nil
}

func (s *Store) ListPartnersWithStats(ctx context.Context, limit, offset int) ([]domain.PartnerWithStats, int, error) {
	var total int
	countQuery := `SELECT COUNT(*) FROM users WHERE role = 'partner'`
	if err := s.db.QueryRowContext(ctx, countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := s.db.QueryContext(
		ctx,
		`SELECT u.id, u.name, u.username, u.email, u.role, u.partner_code, u.is_suspended, u.suspended_reason, u.created_at,
			COUNT(l.id) AS total_leads,
			COALESCE(SUM(CASE WHEN l.status = 'qualified' THEN 1 ELSE 0 END), 0) AS qualified_leads,
			COALESCE(SUM(CASE WHEN l.status = 'won' THEN 1 ELSE 0 END), 0) AS won_leads,
			COALESCE(SUM(CASE WHEN l.status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_leads
		FROM users u
		LEFT JOIN leads l ON l.partner_id = u.id
		WHERE u.role = 'partner'
		GROUP BY u.id
		ORDER BY total_leads DESC, u.created_at DESC
		LIMIT ? OFFSET ?`,
		limit,
		offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	partners := []domain.PartnerWithStats{}
	for rows.Next() {
		var partner domain.PartnerWithStats
		var createdAt string
		var isSuspended int
		if err := rows.Scan(
			&partner.ID,
			&partner.Name,
			&partner.Username,
			&partner.Email,
			&partner.Role,
			&partner.PartnerCode,
			&isSuspended,
			&partner.SuspendedReason,
			&createdAt,
			&partner.TotalLeads,
			&partner.QualifiedLeads,
			&partner.WonLeads,
			&partner.RejectedLeads,
		); err != nil {
			return nil, 0, err
		}
		partner.IsSuspended = intToBool(isSuspended)
		partner.CreatedAt = parseTime(createdAt)
		partners = append(partners, partner)
	}
	return partners, total, rows.Err()
}

func (s *Store) ListLeadEvents(ctx context.Context, leadID string) ([]domain.LeadEvent, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT e.id, e.lead_id, e.actor_id, COALESCE(u.name, e.actor_id), e.status, e.note, e.created_at
		 FROM lead_events e
		 LEFT JOIN users u ON u.id = e.actor_id
		 WHERE e.lead_id = ?
		 ORDER BY e.created_at ASC`,
		leadID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []domain.LeadEvent{}
	for rows.Next() {
		var ev domain.LeadEvent
		var createdAt string
		if err := rows.Scan(&ev.ID, &ev.LeadID, &ev.ActorID, &ev.ActorName, &ev.Status, &ev.Note, &createdAt); err != nil {
			return nil, err
		}
		ev.CreatedAt = parseTime(createdAt)
		events = append(events, ev)
	}
	return events, rows.Err()
}

func (s *Store) ListMessages(ctx context.Context, leadID string, limit, offset int) ([]domain.LeadMessage, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT id, lead_id, sender_id, sender_name, sender_role, message, is_read, created_at
		 FROM lead_messages
		 WHERE lead_id = ?
		 ORDER BY created_at DESC
		 LIMIT ? OFFSET ?`,
		leadID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	msgs := []domain.LeadMessage{}
	for rows.Next() {
		var msg domain.LeadMessage
		var isRead int
		var createdAt string
		if err := rows.Scan(&msg.ID, &msg.LeadID, &msg.SenderID, &msg.SenderName, &msg.SenderRole, &msg.Message, &isRead, &createdAt); err != nil {
			return nil, err
		}
		msg.IsRead = intToBool(isRead)
		msg.CreatedAt = parseTime(createdAt)
		msgs = append(msgs, msg)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Reverse slice to restore chronological order (ASC)
	for i, j := 0, len(msgs)-1; i < j; i, j = i+1, j-1 {
		msgs[i], msgs[j] = msgs[j], msgs[i]
	}

	return msgs, nil
}

func (s *Store) SendMessage(ctx context.Context, msg domain.LeadMessage) (domain.LeadMessage, error) {
	now := time.Now().UTC()
	msg.ID = uuid.NewString()
	msg.CreatedAt = now
	_, err := s.db.ExecContext(
		ctx,
		`INSERT INTO lead_messages (id, lead_id, sender_id, sender_name, sender_role, message, is_read, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
		msg.ID, msg.LeadID, msg.SenderID, msg.SenderName, msg.SenderRole, msg.Message, formatTime(now),
	)
	return msg, err
}

func (s *Store) MarkMessagesRead(ctx context.Context, leadID string, readerRole string) error {
	// Mark messages NOT sent by readerRole as read (i.e., admin reading partner messages or vice versa)
	_, err := s.db.ExecContext(
		ctx,
		`UPDATE lead_messages SET is_read = 1 WHERE lead_id = ? AND sender_role != ?`,
		leadID,
		readerRole,
	)
	return err
}

func (s *Store) ListReferrals(ctx context.Context, partnerID string) ([]domain.Referral, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT id, partner_id, product, code, usage_count, created_at
		 FROM referrals
		 WHERE partner_id = ?
		 ORDER BY created_at DESC`,
		partnerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	referrals := []domain.Referral{}
	for rows.Next() {
		var referral domain.Referral
		var createdAt string
		if err := rows.Scan(
			&referral.ID,
			&referral.PartnerID,
			&referral.Product,
			&referral.Code,
			&referral.UsageCount,
			&createdAt,
		); err != nil {
			return nil, err
		}
		referral.CreatedAt = parseTime(createdAt)
		referrals = append(referrals, referral)
	}
	return referrals, rows.Err()
}

func (s *Store) ListKnowledge(ctx context.Context) ([]domain.KnowledgeArticle, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT id, title, category, content, created_at
		 FROM knowledge_articles
		 ORDER BY category ASC, title ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	articles := []domain.KnowledgeArticle{}
	for rows.Next() {
		var article domain.KnowledgeArticle
		var createdAt string
		if err := rows.Scan(&article.ID, &article.Title, &article.Category, &article.Content, &createdAt); err != nil {
			return nil, err
		}
		article.CreatedAt = parseTime(createdAt)
		articles = append(articles, article)
	}
	return articles, rows.Err()
}

func (s *Store) groupCounts(ctx context.Context, query string, args ...interface{}) ([]domain.BreakdownItem, error) {
	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []domain.BreakdownItem{}
	for rows.Next() {
		var item domain.BreakdownItem
		if err := rows.Scan(&item.Key, &item.Label, &item.Count); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

type userAuthScanner interface {
	Scan(dest ...interface{}) error
}

func scanUserAuth(row userAuthScanner) (domain.UserAuth, error) {
	var user domain.UserAuth
	var isSuspended int
	var suspendedAt string
	var createdAt string
	if err := row.Scan(
		&user.ID,
		&user.Name,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.PartnerCode,
		&isSuspended,
		&user.SuspendedReason,
		&suspendedAt,
		&createdAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.UserAuth{}, ErrNotFound
		}
		return domain.UserAuth{}, err
	}
	user.IsSuspended = intToBool(isSuspended)
	user.SuspendedAt = parseOptionalTime(suspendedAt)
	user.CreatedAt = parseTime(createdAt)
	return user, nil
}

func scanServiceRule(row userAuthScanner) (domain.ServiceRule, error) {
	var service domain.ServiceRule
	var requiresDiscovery int
	var isActive int
	var createdAt string
	var updatedAt string
	if err := row.Scan(
		&service.Type,
		&service.Label,
		&service.Description,
		&service.MinimumBudget,
		&requiresDiscovery,
		&isActive,
		&createdAt,
		&updatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.ServiceRule{}, ErrNotFound
		}
		return domain.ServiceRule{}, err
	}
	service.RequiresDiscovery = intToBool(requiresDiscovery)
	service.IsActive = intToBool(isActive)
	service.CreatedAt = parseTime(createdAt)
	service.UpdatedAt = parseTime(updatedAt)
	return service, nil
}

func scanLeads(rows *sql.Rows) ([]domain.Lead, error) {
	leads := []domain.Lead{}
	for rows.Next() {
		lead, err := scanLead(rows)
		if err != nil {
			return nil, err
		}
		leads = append(leads, lead)
	}
	return leads, rows.Err()
}

func scanLead(rows userAuthScanner) (domain.Lead, error) {
	var lead domain.Lead
	var createdAt string
	var updatedAt string
	if err := rows.Scan(
		&lead.ID,
		&lead.PartnerID,
		&lead.CompanyName,
		&lead.ContactName,
		&lead.ContactEmail,
		&lead.ContactPhone,
		&lead.ServiceType,
		&lead.Budget,
		&lead.NeedSummary,
		&lead.Notes,
		&lead.Status,
		&lead.QualificationScore,
		&lead.QualificationNote,
		&createdAt,
		&updatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Lead{}, ErrNotFound
		}
		return domain.Lead{}, err
	}
	lead.CreatedAt = parseTime(createdAt)
	lead.UpdatedAt = parseTime(updatedAt)
	return lead, nil
}

// scanLeadWithCount scans a lead row that includes unread_count and message_count columns.
func scanLeadWithCount(row userAuthScanner) (domain.Lead, error) {
	var lead domain.Lead
	var createdAt, updatedAt string
	if err := row.Scan(
		&lead.ID, &lead.PartnerID, &lead.CompanyName, &lead.ContactName,
		&lead.ContactEmail, &lead.ContactPhone, &lead.ServiceType, &lead.Budget,
		&lead.NeedSummary, &lead.Notes, &lead.Status,
		&lead.QualificationScore, &lead.QualificationNote,
		&createdAt, &updatedAt,
		&lead.CommissionRate, &lead.DealAmount,
		&lead.UnreadCount, &lead.MessageCount, &lead.MeetingMessage,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.Lead{}, ErrNotFound
		}
		return domain.Lead{}, err
	}
	lead.CreatedAt = parseTime(createdAt)
	lead.UpdatedAt = parseTime(updatedAt)
	return lead, nil
}

func scanLeadsWithCount(rows *sql.Rows) ([]domain.Lead, error) {
	leads := []domain.Lead{}
	for rows.Next() {
		lead, err := scanLeadWithCount(rows)
		if err != nil {
			return nil, err
		}
		leads = append(leads, lead)
	}
	return leads, rows.Err()
}

func scanLeadWithPartnersWithCount(rows *sql.Rows) ([]domain.LeadWithPartner, error) {
	leads := []domain.LeadWithPartner{}
	for rows.Next() {
		lead, err := scanLeadWithPartnerRowWithCount(rows)
		if err != nil {
			return nil, err
		}
		leads = append(leads, lead)
	}
	return leads, rows.Err()
}

func scanLeadWithPartnerRowWithCount(row userAuthScanner) (domain.LeadWithPartner, error) {
	var item domain.LeadWithPartner
	var partnerSuspended int
	var createdAt, updatedAt string
	if err := row.Scan(
		&item.ID, &item.PartnerID, &item.CompanyName, &item.ContactName,
		&item.ContactEmail, &item.ContactPhone, &item.ServiceType, &item.Budget,
		&item.NeedSummary, &item.Notes, &item.Status,
		&item.QualificationScore, &item.QualificationNote,
		&createdAt, &updatedAt,
		&item.PartnerName, &item.PartnerEmail, &item.PartnerCode, &partnerSuspended,
		&item.CommissionRate, &item.DealAmount,
		&item.UnreadCount, &item.MessageCount, &item.MeetingMessage,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.LeadWithPartner{}, ErrNotFound
		}
		return domain.LeadWithPartner{}, err
	}
	item.PartnerSuspended = intToBool(partnerSuspended)
	item.CreatedAt = parseTime(createdAt)
	item.UpdatedAt = parseTime(updatedAt)
	return item, nil
}

func scanLeadWithPartners(rows *sql.Rows) ([]domain.LeadWithPartner, error) {
	leads := []domain.LeadWithPartner{}
	for rows.Next() {
		lead, err := scanLeadWithPartnerRow(rows)
		if err != nil {
			return nil, err
		}
		leads = append(leads, lead)
	}
	return leads, rows.Err()
}

func scanLeadWithPartnerRow(row userAuthScanner) (domain.LeadWithPartner, error) {
	var item domain.LeadWithPartner
	var partnerSuspended int
	var createdAt string
	var updatedAt string
	if err := row.Scan(
		&item.ID,
		&item.PartnerID,
		&item.CompanyName,
		&item.ContactName,
		&item.ContactEmail,
		&item.ContactPhone,
		&item.ServiceType,
		&item.Budget,
		&item.NeedSummary,
		&item.Notes,
		&item.Status,
		&item.QualificationScore,
		&item.QualificationNote,
		&createdAt,
		&updatedAt,
		&item.PartnerName,
		&item.PartnerEmail,
		&item.PartnerCode,
		&partnerSuspended,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.LeadWithPartner{}, ErrNotFound
		}
		return domain.LeadWithPartner{}, err
	}
	item.PartnerSuspended = intToBool(partnerSuspended)
	item.CreatedAt = parseTime(createdAt)
	item.UpdatedAt = parseTime(updatedAt)
	return item, nil
}

func normalizeLimit(limit int) int {
	if limit <= 0 {
		return 20
	}
	if limit > 100 {
		return 100
	}
	return limit
}

func nowString() string {
	return formatTime(time.Now().UTC())
}

func formatTime(value time.Time) string {
	return value.UTC().Format(time.RFC3339Nano)
}

func parseTime(value string) time.Time {
	parsed, err := time.Parse(time.RFC3339Nano, value)
	if err != nil {
		return time.Time{}
	}
	return parsed
}

func parseOptionalTime(value string) time.Time {
	if strings.TrimSpace(value) == "" {
		return time.Time{}
	}
	return parseTime(value)
}

func labelStatuses(items []domain.BreakdownItem) []domain.BreakdownItem {
	labels := map[string]string{
		string(domain.LeadStatusSubmitted): "Submitted",
		string(domain.LeadStatusQualified): "Qualified",
		string(domain.LeadStatusContacted): "Contacted",
		string(domain.LeadStatusWon):       "Won",
		string(domain.LeadStatusLost):      "Lost",
		string(domain.LeadStatusRejected):  "Rejected",
	}
	return labelBreakdowns(items, labels)
}

func labelServices(items []domain.BreakdownItem) []domain.BreakdownItem {
	labels := map[string]string{
		string(domain.ServiceCompanyProfile): "Company Profile",
		string(domain.ServiceWebsiteApp):     "Website/App",
		string(domain.ServiceCustomSoftware): "Custom Software",
		string(domain.ServiceSalesView):      "SalesView",
		string(domain.ServiceOther):          "Lainnya",
	}
	return labelBreakdowns(items, labels)
}

func labelBreakdowns(items []domain.BreakdownItem, labels map[string]string) []domain.BreakdownItem {
	for index := range items {
		if label, ok := labels[items[index].Key]; ok {
			items[index].Label = label
		}
	}
	return items
}

func PartnerCode(name string, seed string) string {
	normalized := strings.ToUpper(strings.TrimSpace(name))
	normalized = strings.ReplaceAll(normalized, " ", "")
	if len(normalized) > 6 {
		normalized = normalized[:6]
	}
	if normalized == "" {
		normalized = "MITRA"
	}
	return fmt.Sprintf("%s-%s", strings.ToUpper(seed), normalized)
}

func boolToInt(value bool) int {
	if value {
		return 1
	}
	return 0
}

func intToBool(value int) bool {
	return value == 1
}

func formatOptionalTime(value time.Time) string {
	if value.IsZero() {
		return ""
	}
	return formatTime(value)
}

func (s *Store) Cleanup(ctx context.Context) error {
	tables := []string{
		"project_activities",
		"project_invoices",
		"maintenance_logs",
		"maintenance_plans",
		"project_documents",
		"project_progress",
		"client_projects",
		"lead_payouts",
		"lead_messages",
		"lead_events",
		"password_reset_tokens",
		"leads",
		"referrals",
		"users",
		"service_catalog",
		"knowledge_articles",
	}
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, "PRAGMA foreign_keys = OFF"); err != nil {
		return err
	}

	for _, table := range tables {
		if _, err := tx.ExecContext(ctx, fmt.Sprintf("DELETE FROM %s", table)); err != nil {
			return err
		}
	}

	if _, err := tx.ExecContext(ctx, "PRAGMA foreign_keys = ON"); err != nil {
		return err
	}

	return tx.Commit()
}

func (s *Store) CreatePayout(ctx context.Context, payout domain.LeadPayout) (domain.LeadPayout, error) {
	if payout.ID == "" {
		payout.ID = uuid.NewString()
	}
	if payout.CreatedAt.IsZero() {
		payout.CreatedAt = time.Now().UTC()
	}

	_, err := s.db.ExecContext(
		ctx,
		`INSERT INTO lead_payouts (id, lead_id, amount_paid, commission_paid, evidence_url, created_at)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		payout.ID,
		payout.LeadID,
		payout.AmountPaid,
		payout.CommissionPaid,
		payout.EvidenceURL,
		formatTime(payout.CreatedAt),
	)
	if err != nil {
		return domain.LeadPayout{}, err
	}
	return payout, nil
}

func (s *Store) ListPayouts(ctx context.Context, leadID string) ([]domain.LeadPayout, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT id, lead_id, amount_paid, commission_paid, evidence_url, created_at
		 FROM lead_payouts
		 WHERE lead_id = ?
		 ORDER BY created_at DESC`,
		leadID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payouts []domain.LeadPayout
	for rows.Next() {
		var p domain.LeadPayout
		var createdAt string
		if err := rows.Scan(&p.ID, &p.LeadID, &p.AmountPaid, &p.CommissionPaid, &p.EvidenceURL, &createdAt); err != nil {
			return nil, err
		}
		p.CreatedAt = parseTime(createdAt)
		payouts = append(payouts, p)
	}
	return payouts, rows.Err()
}

func (s *Store) GetPayoutSummary(ctx context.Context, leadID string) (domain.PayoutSummary, error) {
	var dealAmount int64
	var commissionRate float64
	err := s.db.QueryRowContext(
		ctx,
		`SELECT deal_amount, commission_rate FROM leads WHERE id = ?`,
		leadID,
	).Scan(&dealAmount, &commissionRate)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.PayoutSummary{}, ErrNotFound
		}
		return domain.PayoutSummary{}, err
	}

	var clientPaid sql.NullInt64
	var partnerPayout sql.NullInt64
	err = s.db.QueryRowContext(
		ctx,
		`SELECT SUM(amount_paid), SUM(commission_paid) FROM lead_payouts WHERE lead_id = ?`,
		leadID,
	).Scan(&clientPaid, &partnerPayout)
	if err != nil {
		return domain.PayoutSummary{}, err
	}

	totalCommission := int64(float64(dealAmount) * (commissionRate / 100.0))
	cPaid := clientPaid.Int64
	pPayout := partnerPayout.Int64
	remainingCommission := totalCommission - pPayout

	var progress float64
	if totalCommission > 0 {
		progress = (float64(pPayout) / float64(totalCommission)) * 100.0
	}

	return domain.PayoutSummary{
		CommissionRate:      commissionRate,
		DealAmount:          dealAmount,
		TotalCommission:     totalCommission,
		ClientPaid:          cPaid,
		PartnerPayout:       pPayout,
		PayoutProgress:      progress,
		RemainingCommission: remainingCommission,
	}, nil
}

func (s *Store) UpdateLeadCommission(ctx context.Context, leadID string, dealAmount int64, commissionRate float64) error {
	result, err := s.db.ExecContext(
		ctx,
		`UPDATE leads SET deal_amount = ?, commission_rate = ?, updated_at = ? WHERE id = ?`,
		dealAmount,
		commissionRate,
		formatTime(time.Now().UTC()),
		leadID,
	)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}
