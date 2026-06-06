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
	statements := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL CHECK (role IN ('admin', 'partner')),
			partner_code TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
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
		`CREATE INDEX IF NOT EXISTS idx_leads_partner_status_created ON leads(partner_id, status, created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_leads_status_service_created ON leads(status, service_type, created_at DESC)`,
		`CREATE TABLE IF NOT EXISTS lead_events (
			id TEXT PRIMARY KEY,
			lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
			actor_id TEXT NOT NULL DEFAULT '',
			status TEXT NOT NULL,
			note TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_lead_events_lead_created ON lead_events(lead_id, created_at DESC)`,
		`CREATE TABLE IF NOT EXISTS referrals (
			id TEXT PRIMARY KEY,
			partner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			product TEXT NOT NULL,
			code TEXT NOT NULL UNIQUE,
			usage_count INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_referrals_partner ON referrals(partner_id)`,
		`CREATE TABLE IF NOT EXISTS knowledge_articles (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			category TEXT NOT NULL,
			content TEXT NOT NULL,
			created_at TEXT NOT NULL
		)`,
	}

	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, statement := range statements {
		if _, err := tx.Exec(statement); err != nil {
			return err
		}
	}

	if err := seedKnowledge(tx); err != nil {
		return err
	}

	return tx.Commit()
}

func seedKnowledge(tx *sql.Tx) error {
	now := nowString()
	articles := []domain.KnowledgeArticle{
		{
			ID:       "knw-company-profile",
			Title:    "Company Profile",
			Category: "Layanan",
			Content:  "Company Profile cocok untuk bisnis yang membutuhkan landing page profil, kredibilitas brand, showcase layanan, dan funnel kontak. Budget minimal yang direkomendasikan adalah Rp10 juta.",
		},
		{
			ID:       "knw-website-app",
			Title:    "Website dan Aplikasi Sederhana",
			Category: "Layanan",
			Content:  "Website atau aplikasi sederhana mencakup portal ringan, katalog, booking, dashboard dasar, dan integrasi standar. Lead ideal memiliki budget mulai Rp15 juta.",
		},
		{
			ID:       "knw-custom-software",
			Title:    "Custom Software, ERP, dan Sistem Kompleks",
			Category: "Discovery",
			Content:  "Custom software membutuhkan discovery kebutuhan, proses bisnis, stakeholder, integrasi, timeline, dan risiko. Jika budget belum jelas, mitra perlu melengkapi ringkasan kebutuhan proyek.",
		},
		{
			ID:       "knw-salesview",
			Title:    "SalesView",
			Category: "Produk",
			Content:  "SalesView membantu tim sales memonitor pipeline, aktivitas prospek, dan referral code. Mitra dapat memakai referral code untuk tracking akuisisi produk.",
		},
	}

	for _, article := range articles {
		if _, err := tx.Exec(
			`INSERT OR IGNORE INTO knowledge_articles (id, title, category, content, created_at)
			 VALUES (?, ?, ?, ?, ?)`,
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
		`INSERT INTO users (id, name, email, password_hash, role, partner_code, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		user.ID,
		user.Name,
		strings.ToLower(user.Email),
		passwordHash,
		user.Role,
		user.PartnerCode,
		formatTime(user.CreatedAt),
	)
	return err
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (domain.UserAuth, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT id, name, email, password_hash, role, partner_code, created_at
		 FROM users
		 WHERE email = ?`,
		strings.ToLower(email),
	)
	return scanUserAuth(row)
}

func (s *Store) GetUserByID(ctx context.Context, id string) (domain.User, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT id, name, email, role, partner_code, created_at
		 FROM users
		 WHERE id = ?`,
		id,
	)

	var user domain.User
	var createdAt string
	if err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.PartnerCode, &createdAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.User{}, ErrNotFound
		}
		return domain.User{}, err
	}
	user.CreatedAt = parseTime(createdAt)
	return user, nil
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

func (s *Store) ListPartnerLeads(ctx context.Context, partnerID string, filters LeadFilters) ([]domain.Lead, error) {
	limit := normalizeLimit(filters.Limit)
	query := `SELECT id, partner_id, company_name, contact_name, contact_email, contact_phone,
			service_type, budget, need_summary, notes, status, qualification_score,
			qualification_note, created_at, updated_at
		FROM leads
		WHERE partner_id = ?`
	args := []interface{}{partnerID}

	if filters.Status != "" {
		query += " AND status = ?"
		args = append(args, filters.Status)
	}
	if filters.ServiceType != "" {
		query += " AND service_type = ?"
		args = append(args, filters.ServiceType)
	}

	query += " ORDER BY created_at DESC LIMIT ?"
	args = append(args, limit)

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanLeads(rows)
}

func (s *Store) ListAdminLeads(ctx context.Context, filters LeadFilters) ([]domain.LeadWithPartner, error) {
	limit := normalizeLimit(filters.Limit)
	query := `SELECT l.id, l.partner_id, l.company_name, l.contact_name, l.contact_email, l.contact_phone,
			l.service_type, l.budget, l.need_summary, l.notes, l.status, l.qualification_score,
			l.qualification_note, l.created_at, l.updated_at, u.name, u.email, u.partner_code
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

	query += " ORDER BY l.created_at DESC LIMIT ?"
	args = append(args, limit)

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanLeadWithPartners(rows)
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

func (s *Store) GetLeadWithPartner(ctx context.Context, leadID string) (domain.LeadWithPartner, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT l.id, l.partner_id, l.company_name, l.contact_name, l.contact_email, l.contact_phone,
			l.service_type, l.budget, l.need_summary, l.notes, l.status, l.qualification_score,
			l.qualification_note, l.created_at, l.updated_at, u.name, u.email, u.partner_code
		FROM leads l
		INNER JOIN users u ON u.id = l.partner_id
		WHERE l.id = ?`,
		leadID,
	)
	return scanLeadWithPartnerRow(row)
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
	recentLeads, err := s.ListPartnerLeads(ctx, partnerID, LeadFilters{Limit: 6})
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
	recentLeads, err := s.ListAdminLeads(ctx, LeadFilters{Limit: 8})
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

func (s *Store) ListPartnersWithStats(ctx context.Context) ([]domain.PartnerWithStats, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT u.id, u.name, u.email, u.role, u.partner_code, u.created_at,
			COUNT(l.id) AS total_leads,
			COALESCE(SUM(CASE WHEN l.status = 'qualified' THEN 1 ELSE 0 END), 0) AS qualified_leads,
			COALESCE(SUM(CASE WHEN l.status = 'won' THEN 1 ELSE 0 END), 0) AS won_leads,
			COALESCE(SUM(CASE WHEN l.status = 'rejected' THEN 1 ELSE 0 END), 0) AS rejected_leads
		FROM users u
		LEFT JOIN leads l ON l.partner_id = u.id
		WHERE u.role = 'partner'
		GROUP BY u.id
		ORDER BY total_leads DESC, u.created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	partners := []domain.PartnerWithStats{}
	for rows.Next() {
		var partner domain.PartnerWithStats
		var createdAt string
		if err := rows.Scan(
			&partner.ID,
			&partner.Name,
			&partner.Email,
			&partner.Role,
			&partner.PartnerCode,
			&createdAt,
			&partner.TotalLeads,
			&partner.QualifiedLeads,
			&partner.WonLeads,
			&partner.RejectedLeads,
		); err != nil {
			return nil, err
		}
		partner.CreatedAt = parseTime(createdAt)
		partners = append(partners, partner)
	}
	return partners, rows.Err()
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
	var createdAt string
	if err := row.Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.PartnerCode,
		&createdAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.UserAuth{}, ErrNotFound
		}
		return domain.UserAuth{}, err
	}
	user.CreatedAt = parseTime(createdAt)
	return user, nil
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
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.LeadWithPartner{}, ErrNotFound
		}
		return domain.LeadWithPartner{}, err
	}
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
