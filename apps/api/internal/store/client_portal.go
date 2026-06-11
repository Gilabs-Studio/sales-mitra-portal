package store

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/google/uuid"
)

type ClientProjectInput struct {
	ClientID         string
	Name             string
	Description      string
	PICName          string
	PICEmail         string
	StartDate        time.Time
	TargetEndDate    time.Time
	Status           domain.ProjectStatus
	ProgressPercent  int
	WebsiteURL       string
	StagingURL       string
	CredentialNote   string
	DocumentationURL string
}

type ProjectProgressInput struct {
	Title       string
	Status      domain.ProgressStatus
	Percentage  int
	Note        string
	DocumentURL string
	UpdatedByID string
}

type ProjectDocumentInput struct {
	Title       string
	Category    domain.DocumentCategory
	URL         string
	Description string
	UploadedBy  string
}

type MaintenancePlanInput struct {
	Type        string
	PeriodStart time.Time
	PeriodEnd   time.Time
	QuotaTotal  int
	IsActive    bool
}

type MaintenanceLogInput struct {
	RequestDate time.Time
	Description string
	Status      domain.MaintenanceStatus
	PICName     string
}

type ProjectInvoiceInput struct {
	Number      string
	Amount      int64
	Status      domain.InvoiceStatus
	IssuedAt    time.Time
	DueAt       time.Time
	PaidAt      time.Time
	DocumentURL string
	PaymentNote string
}

type sqlExecer interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
}

func (s *Store) ListClientsWithStats(ctx context.Context, limit, offset int) ([]domain.ClientWithStats, int, error) {
	limit = normalizeLimit(limit)
	var total int
	if err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM users WHERE role = 'client'`).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := s.db.QueryContext(
		ctx,
		`SELECT u.id, u.name, u.username, u.email, u.role, u.partner_code, u.is_suspended,
			u.suspended_reason, u.suspended_at, u.created_at,
			COUNT(p.id) AS total_projects,
			COALESCE(SUM(CASE WHEN p.status NOT IN ('completed') THEN 1 ELSE 0 END), 0) AS active_projects,
			COALESCE(SUM(CASE WHEN p.status = 'maintenance' THEN 1 ELSE 0 END), 0) AS maintenance_projects,
			COALESCE((
				SELECT COUNT(*)
				FROM project_invoices i
				INNER JOIN client_projects p2 ON p2.id = i.project_id
				WHERE p2.client_id = u.id AND i.status IN ('sent', 'waiting_payment', 'overdue')
			), 0) AS unpaid_invoices
		FROM users u
		LEFT JOIN client_projects p ON p.client_id = u.id
		WHERE u.role = 'client'
		GROUP BY u.id
		ORDER BY u.created_at DESC
		LIMIT ? OFFSET ?`,
		limit,
		offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	clients := []domain.ClientWithStats{}
	for rows.Next() {
		var client domain.ClientWithStats
		var isSuspended int
		var suspendedAt string
		var createdAt string
		if err := rows.Scan(
			&client.ID,
			&client.Name,
			&client.Username,
			&client.Email,
			&client.Role,
			&client.PartnerCode,
			&isSuspended,
			&client.SuspendedReason,
			&suspendedAt,
			&createdAt,
			&client.TotalProjects,
			&client.ActiveProjects,
			&client.MaintenanceProjects,
			&client.UnpaidInvoices,
		); err != nil {
			return nil, 0, err
		}
		client.IsSuspended = intToBool(isSuspended)
		client.SuspendedAt = parseOptionalTime(suspendedAt)
		client.CreatedAt = parseTime(createdAt)
		clients = append(clients, client)
	}
	return clients, total, rows.Err()
}

func (s *Store) CreateClientProject(ctx context.Context, input ClientProjectInput, actorID string) (domain.ClientProject, error) {
	now := time.Now().UTC()
	projectID := uuid.NewString()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.ClientProject{}, err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO client_projects (
			id, client_id, name, description, pic_name, pic_email, start_date, target_end_date,
			status, progress_percent, website_url, staging_url, credential_note, documentation_url,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		projectID,
		input.ClientID,
		input.Name,
		input.Description,
		input.PICName,
		strings.ToLower(input.PICEmail),
		formatOptionalTime(input.StartDate),
		formatOptionalTime(input.TargetEndDate),
		input.Status,
		input.ProgressPercent,
		input.WebsiteURL,
		input.StagingURL,
		input.CredentialNote,
		input.DocumentationURL,
		formatTime(now),
		formatTime(now),
	); err != nil {
		return domain.ClientProject{}, err
	}

	if err := insertProjectActivity(ctx, tx, projectID, actorID, "project_created", "Project client dibuat"); err != nil {
		return domain.ClientProject{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.ClientProject{}, err
	}
	return s.GetClientProject(ctx, projectID)
}

func (s *Store) UpdateClientProject(ctx context.Context, projectID string, input ClientProjectInput, actorID string) (domain.ClientProject, error) {
	now := time.Now().UTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.ClientProject{}, err
	}
	defer tx.Rollback()

	result, err := tx.ExecContext(
		ctx,
		`UPDATE client_projects
		 SET client_id = ?, name = ?, description = ?, pic_name = ?, pic_email = ?,
			start_date = ?, target_end_date = ?, status = ?, progress_percent = ?,
			website_url = ?, staging_url = ?, credential_note = ?, documentation_url = ?, updated_at = ?
		 WHERE id = ?`,
		input.ClientID,
		input.Name,
		input.Description,
		input.PICName,
		strings.ToLower(input.PICEmail),
		formatOptionalTime(input.StartDate),
		formatOptionalTime(input.TargetEndDate),
		input.Status,
		input.ProgressPercent,
		input.WebsiteURL,
		input.StagingURL,
		input.CredentialNote,
		input.DocumentationURL,
		formatTime(now),
		projectID,
	)
	if err != nil {
		return domain.ClientProject{}, err
	}
	if affected, err := result.RowsAffected(); err != nil {
		return domain.ClientProject{}, err
	} else if affected == 0 {
		return domain.ClientProject{}, ErrNotFound
	}

	if err := insertProjectActivity(ctx, tx, projectID, actorID, "project_updated", "Informasi project diperbarui"); err != nil {
		return domain.ClientProject{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.ClientProject{}, err
	}
	return s.GetClientProject(ctx, projectID)
}

func (s *Store) ListClientProjects(ctx context.Context, clientID string) ([]domain.ClientProject, error) {
	query := clientProjectSelect() + ` WHERE 1 = 1`
	args := []interface{}{}
	if strings.TrimSpace(clientID) != "" {
		query += ` AND p.client_id = ?`
		args = append(args, clientID)
	}
	query += ` ORDER BY p.updated_at DESC`

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []domain.ClientProject{}
	for rows.Next() {
		project, err := scanClientProject(rows)
		if err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}
	return projects, rows.Err()
}

func (s *Store) GetClientProject(ctx context.Context, projectID string) (domain.ClientProject, error) {
	row := s.db.QueryRowContext(ctx, clientProjectSelect()+` WHERE p.id = ?`, projectID)
	return scanClientProject(row)
}

func (s *Store) GetClientProjectForClient(ctx context.Context, projectID string, clientID string) (domain.ClientProject, error) {
	row := s.db.QueryRowContext(ctx, clientProjectSelect()+` WHERE p.id = ? AND p.client_id = ?`, projectID, clientID)
	return scanClientProject(row)
}

func (s *Store) CreateProjectProgress(ctx context.Context, projectID string, input ProjectProgressInput, actorID string) (domain.ProjectProgress, error) {
	now := time.Now().UTC()
	progressID := uuid.NewString()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.ProjectProgress{}, err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO project_progress (
			id, project_id, title, status, percentage, note, document_url, updated_by_id, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		progressID,
		projectID,
		input.Title,
		input.Status,
		input.Percentage,
		input.Note,
		input.DocumentURL,
		input.UpdatedByID,
		formatTime(now),
		formatTime(now),
	); err != nil {
		return domain.ProjectProgress{}, err
	}

	result, err := tx.ExecContext(
		ctx,
		`UPDATE client_projects SET progress_percent = ?, updated_at = ? WHERE id = ?`,
		input.Percentage,
		formatTime(now),
		projectID,
	)
	if err != nil {
		return domain.ProjectProgress{}, err
	}
	if affected, err := result.RowsAffected(); err != nil {
		return domain.ProjectProgress{}, err
	} else if affected == 0 {
		return domain.ProjectProgress{}, ErrNotFound
	}

	if err := insertProjectActivity(ctx, tx, projectID, actorID, "progress_updated", input.Title); err != nil {
		return domain.ProjectProgress{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.ProjectProgress{}, err
	}
	return s.GetProjectProgress(ctx, progressID)
}

func (s *Store) GetProjectProgress(ctx context.Context, progressID string) (domain.ProjectProgress, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT pp.id, pp.project_id, pp.title, pp.status, pp.percentage, pp.note, pp.document_url,
			pp.updated_by_id, COALESCE(u.name, ''), pp.created_at, pp.updated_at
		 FROM project_progress pp
		 LEFT JOIN users u ON u.id = pp.updated_by_id
		 WHERE pp.id = ?`,
		progressID,
	)
	return scanProjectProgress(row)
}

func (s *Store) ListProjectProgress(ctx context.Context, projectID string) ([]domain.ProjectProgress, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT pp.id, pp.project_id, pp.title, pp.status, pp.percentage, pp.note, pp.document_url,
			pp.updated_by_id, COALESCE(u.name, ''), pp.created_at, pp.updated_at
		 FROM project_progress pp
		 LEFT JOIN users u ON u.id = pp.updated_by_id
		 WHERE pp.project_id = ?
		 ORDER BY pp.updated_at ASC`,
		projectID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []domain.ProjectProgress{}
	for rows.Next() {
		item, err := scanProjectProgress(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (s *Store) CreateProjectDocument(ctx context.Context, projectID string, input ProjectDocumentInput, actorID string) (domain.ProjectDocument, error) {
	now := time.Now().UTC()
	doc := domain.ProjectDocument{
		ID:          uuid.NewString(),
		ProjectID:   projectID,
		Title:       input.Title,
		Category:    input.Category,
		URL:         input.URL,
		Description: input.Description,
		UploadedBy:  actorID,
		CreatedAt:   now,
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.ProjectDocument{}, err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO project_documents (id, project_id, title, category, url, description, uploaded_by_id, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		doc.ID,
		doc.ProjectID,
		doc.Title,
		doc.Category,
		doc.URL,
		doc.Description,
		actorID,
		formatTime(now),
	); err != nil {
		return domain.ProjectDocument{}, err
	}
	if err := insertProjectActivity(ctx, tx, projectID, actorID, "document_uploaded", input.Title); err != nil {
		return domain.ProjectDocument{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.ProjectDocument{}, err
	}
	return s.GetProjectDocument(ctx, doc.ID)
}

func (s *Store) GetProjectDocument(ctx context.Context, documentID string) (domain.ProjectDocument, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT d.id, d.project_id, d.title, d.category, d.url, d.description, COALESCE(u.name, ''), d.created_at
		 FROM project_documents d
		 LEFT JOIN users u ON u.id = d.uploaded_by_id
		 WHERE d.id = ?`,
		documentID,
	)
	return scanProjectDocument(row)
}

func (s *Store) ListProjectDocuments(ctx context.Context, projectID string, category domain.DocumentCategory) ([]domain.ProjectDocument, error) {
	query := `SELECT d.id, d.project_id, d.title, d.category, d.url, d.description, COALESCE(u.name, ''), d.created_at
		FROM project_documents d
		LEFT JOIN users u ON u.id = d.uploaded_by_id
		WHERE d.project_id = ?`
	args := []interface{}{projectID}
	if category != "" {
		query += ` AND d.category = ?`
		args = append(args, category)
	}
	query += ` ORDER BY d.created_at DESC`

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	docs := []domain.ProjectDocument{}
	for rows.Next() {
		doc, err := scanProjectDocument(rows)
		if err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}
	return docs, rows.Err()
}

func (s *Store) UpsertMaintenancePlan(ctx context.Context, projectID string, input MaintenancePlanInput, actorID string) (domain.MaintenancePlan, error) {
	now := time.Now().UTC()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.MaintenancePlan{}, err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO maintenance_plans (
			id, project_id, type, period_start, period_end, quota_total, is_active, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(project_id) DO UPDATE SET
			type = excluded.type,
			period_start = excluded.period_start,
			period_end = excluded.period_end,
			quota_total = excluded.quota_total,
			is_active = excluded.is_active,
			updated_at = excluded.updated_at`,
		uuid.NewString(),
		projectID,
		input.Type,
		formatOptionalTime(input.PeriodStart),
		formatOptionalTime(input.PeriodEnd),
		input.QuotaTotal,
		boolToInt(input.IsActive),
		formatTime(now),
		formatTime(now),
	); err != nil {
		return domain.MaintenancePlan{}, err
	}
	if err := insertProjectActivity(ctx, tx, projectID, actorID, "maintenance_plan_updated", input.Type); err != nil {
		return domain.MaintenancePlan{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.MaintenancePlan{}, err
	}
	return s.GetMaintenancePlan(ctx, projectID)
}

func (s *Store) GetMaintenancePlan(ctx context.Context, projectID string) (domain.MaintenancePlan, error) {
	row := s.db.QueryRowContext(ctx, maintenancePlanSelect()+` WHERE mp.project_id = ?`, projectID)
	return scanMaintenancePlan(row)
}

func (s *Store) ListClientMaintenancePlans(ctx context.Context, clientID string) ([]domain.MaintenancePlan, error) {
	rows, err := s.db.QueryContext(
		ctx,
		maintenancePlanSelect()+` INNER JOIN client_projects p ON p.id = mp.project_id
		 WHERE p.client_id = ? AND mp.is_active = 1
		 ORDER BY mp.period_end ASC`,
		clientID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	plans := []domain.MaintenancePlan{}
	for rows.Next() {
		plan, err := scanMaintenancePlan(rows)
		if err != nil {
			return nil, err
		}
		plans = append(plans, plan)
	}
	return plans, rows.Err()
}

func (s *Store) CreateMaintenanceLog(ctx context.Context, projectID string, input MaintenanceLogInput, actorID string) (domain.MaintenanceLog, error) {
	now := time.Now().UTC()
	log := domain.MaintenanceLog{
		ID:          uuid.NewString(),
		ProjectID:   projectID,
		RequestDate: input.RequestDate,
		Description: input.Description,
		Status:      input.Status,
		PICName:     input.PICName,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.MaintenanceLog{}, err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO maintenance_logs (id, project_id, request_date, description, status, pic_name, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		log.ID,
		projectID,
		formatOptionalTime(log.RequestDate),
		log.Description,
		log.Status,
		log.PICName,
		formatTime(now),
		formatTime(now),
	); err != nil {
		return domain.MaintenanceLog{}, err
	}
	if err := insertProjectActivity(ctx, tx, projectID, actorID, "maintenance_used", input.Description); err != nil {
		return domain.MaintenanceLog{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.MaintenanceLog{}, err
	}
	return log, nil
}

func (s *Store) ListMaintenanceLogs(ctx context.Context, projectID string) ([]domain.MaintenanceLog, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT id, project_id, request_date, description, status, pic_name, created_at, updated_at
		 FROM maintenance_logs
		 WHERE project_id = ?
		 ORDER BY request_date DESC, created_at DESC`,
		projectID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	logs := []domain.MaintenanceLog{}
	for rows.Next() {
		log, err := scanMaintenanceLog(rows)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, rows.Err()
}

func (s *Store) CreateProjectInvoice(ctx context.Context, projectID string, input ProjectInvoiceInput, actorID string) (domain.ProjectInvoice, error) {
	now := time.Now().UTC()
	invoiceID := uuid.NewString()
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(
		ctx,
		`INSERT INTO project_invoices (
			id, project_id, number, amount, status, issued_at, due_at, paid_at, document_url, payment_note, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		invoiceID,
		projectID,
		input.Number,
		input.Amount,
		input.Status,
		formatOptionalTime(input.IssuedAt),
		formatOptionalTime(input.DueAt),
		formatOptionalTime(input.PaidAt),
		input.DocumentURL,
		input.PaymentNote,
		formatTime(now),
		formatTime(now),
	); err != nil {
		return domain.ProjectInvoice{}, err
	}
	if err := insertProjectActivity(ctx, tx, projectID, actorID, "invoice_created", input.Number); err != nil {
		return domain.ProjectInvoice{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.ProjectInvoice{}, err
	}
	return s.GetProjectInvoice(ctx, invoiceID)
}

func (s *Store) UpdateProjectInvoice(ctx context.Context, invoiceID string, input ProjectInvoiceInput, actorID string) (domain.ProjectInvoice, error) {
	now := time.Now().UTC()
	existing, err := s.GetProjectInvoice(ctx, invoiceID)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}
	defer tx.Rollback()

	result, err := tx.ExecContext(
		ctx,
		`UPDATE project_invoices
		 SET number = ?, amount = ?, status = ?, issued_at = ?, due_at = ?, paid_at = ?,
			document_url = ?, payment_note = ?, updated_at = ?
		 WHERE id = ?`,
		input.Number,
		input.Amount,
		input.Status,
		formatOptionalTime(input.IssuedAt),
		formatOptionalTime(input.DueAt),
		formatOptionalTime(input.PaidAt),
		input.DocumentURL,
		input.PaymentNote,
		formatTime(now),
		invoiceID,
	)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}
	if affected, err := result.RowsAffected(); err != nil {
		return domain.ProjectInvoice{}, err
	} else if affected == 0 {
		return domain.ProjectInvoice{}, ErrNotFound
	}
	if err := insertProjectActivity(ctx, tx, existing.ProjectID, actorID, "invoice_updated", input.Number); err != nil {
		return domain.ProjectInvoice{}, err
	}
	if err := tx.Commit(); err != nil {
		return domain.ProjectInvoice{}, err
	}
	return s.GetProjectInvoice(ctx, invoiceID)
}

func (s *Store) GetProjectInvoice(ctx context.Context, invoiceID string) (domain.ProjectInvoice, error) {
	row := s.db.QueryRowContext(
		ctx,
		`SELECT id, project_id, number, amount, status, issued_at, due_at, paid_at, document_url, payment_note, created_at, updated_at
		 FROM project_invoices
		 WHERE id = ?`,
		invoiceID,
	)
	return scanProjectInvoice(row)
}

func (s *Store) ListProjectInvoices(ctx context.Context, projectID string) ([]domain.ProjectInvoice, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT id, project_id, number, amount, status, issued_at, due_at, paid_at, document_url, payment_note, created_at, updated_at
		 FROM project_invoices
		 WHERE project_id = ?
		 ORDER BY issued_at DESC, created_at DESC`,
		projectID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	invoices := []domain.ProjectInvoice{}
	for rows.Next() {
		invoice, err := scanProjectInvoice(rows)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, invoice)
	}
	return invoices, rows.Err()
}

func (s *Store) ListClientUnpaidInvoices(ctx context.Context, clientID string) ([]domain.ProjectInvoice, error) {
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT i.id, i.project_id, i.number, i.amount, i.status, i.issued_at, i.due_at, i.paid_at,
			i.document_url, i.payment_note, i.created_at, i.updated_at
		 FROM project_invoices i
		 INNER JOIN client_projects p ON p.id = i.project_id
		 WHERE p.client_id = ? AND i.status IN ('sent', 'waiting_payment', 'overdue')
		 ORDER BY i.due_at ASC, i.created_at DESC`,
		clientID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	invoices := []domain.ProjectInvoice{}
	for rows.Next() {
		invoice, err := scanProjectInvoice(rows)
		if err != nil {
			return nil, err
		}
		invoices = append(invoices, invoice)
	}
	return invoices, rows.Err()
}

func (s *Store) ListProjectActivities(ctx context.Context, projectID string, limit int) ([]domain.ProjectActivity, error) {
	limit = normalizeLimit(limit)
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT a.id, a.project_id, a.actor_id, COALESCE(u.name, ''), a.action, a.description, a.created_at
		 FROM project_activities a
		 LEFT JOIN users u ON u.id = a.actor_id
		 WHERE a.project_id = ?
		 ORDER BY a.created_at DESC
		 LIMIT ?`,
		projectID,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanProjectActivities(rows)
}

func (s *Store) ListClientActivities(ctx context.Context, clientID string, limit int) ([]domain.ProjectActivity, error) {
	limit = normalizeLimit(limit)
	rows, err := s.db.QueryContext(
		ctx,
		`SELECT a.id, a.project_id, a.actor_id, COALESCE(u.name, ''), a.action, a.description, a.created_at
		 FROM project_activities a
		 INNER JOIN client_projects p ON p.id = a.project_id
		 LEFT JOIN users u ON u.id = a.actor_id
		 WHERE p.client_id = ?
		 ORDER BY a.created_at DESC
		 LIMIT ?`,
		clientID,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanProjectActivities(rows)
}

func (s *Store) GetClientDashboard(ctx context.Context, clientID string) (domain.ClientDashboard, error) {
	projects, err := s.ListClientProjects(ctx, clientID)
	if err != nil {
		return domain.ClientDashboard{}, err
	}
	maintenance, err := s.ListClientMaintenancePlans(ctx, clientID)
	if err != nil {
		return domain.ClientDashboard{}, err
	}
	invoices, err := s.ListClientUnpaidInvoices(ctx, clientID)
	if err != nil {
		return domain.ClientDashboard{}, err
	}
	activities, err := s.ListClientActivities(ctx, clientID, 8)
	if err != nil {
		return domain.ClientDashboard{}, err
	}

	var activeProjects int64
	for _, project := range projects {
		if project.Status != domain.ProjectStatusCompleted {
			activeProjects++
		}
	}

	return domain.ClientDashboard{
		Summary: []domain.MetricCard{
			{Label: "Total Project", Value: int64(len(projects))},
			{Label: "Project Aktif", Value: activeProjects},
			{Label: "Maintenance Aktif", Value: int64(len(maintenance))},
			{Label: "Invoice Belum Dibayar", Value: int64(len(invoices))},
		},
		Projects:       projects,
		Maintenance:    maintenance,
		UnpaidInvoices: invoices,
		Notifications:  activities,
	}, nil
}

func (s *Store) GetClientProjectDetail(ctx context.Context, projectID string, clientID string) (domain.ClientProjectDetail, error) {
	var project domain.ClientProject
	var err error
	if strings.TrimSpace(clientID) == "" {
		project, err = s.GetClientProject(ctx, projectID)
	} else {
		project, err = s.GetClientProjectForClient(ctx, projectID, clientID)
	}
	if err != nil {
		return domain.ClientProjectDetail{}, err
	}

	progress, err := s.ListProjectProgress(ctx, projectID)
	if err != nil {
		return domain.ClientProjectDetail{}, err
	}
	docs, err := s.ListProjectDocuments(ctx, projectID, "")
	if err != nil {
		return domain.ClientProjectDetail{}, err
	}
	maintenanceLogs, err := s.ListMaintenanceLogs(ctx, projectID)
	if err != nil {
		return domain.ClientProjectDetail{}, err
	}
	invoices, err := s.ListProjectInvoices(ctx, projectID)
	if err != nil {
		return domain.ClientProjectDetail{}, err
	}
	activities, err := s.ListProjectActivities(ctx, projectID, 20)
	if err != nil {
		return domain.ClientProjectDetail{}, err
	}
	reports, err := s.ListProjectDocuments(ctx, projectID, domain.DocumentCategoryReport)
	if err != nil {
		return domain.ClientProjectDetail{}, err
	}

	var maintenance *domain.MaintenancePlan
	plan, err := s.GetMaintenancePlan(ctx, projectID)
	if err == nil {
		maintenance = &plan
	} else if !errors.Is(err, ErrNotFound) {
		return domain.ClientProjectDetail{}, err
	}

	return domain.ClientProjectDetail{
		Project:         project,
		Progress:        progress,
		Documents:       docs,
		Maintenance:     maintenance,
		MaintenanceLogs: maintenanceLogs,
		Invoices:        invoices,
		Activities:      activities,
		Reports:         reports,
	}, nil
}

func insertProjectActivity(ctx context.Context, exec sqlExecer, projectID string, actorID string, action string, description string) error {
	_, err := exec.ExecContext(
		ctx,
		`INSERT INTO project_activities (id, project_id, actor_id, action, description, created_at)
		 VALUES (?, ?, ?, ?, ?, ?)`,
		uuid.NewString(),
		projectID,
		actorID,
		action,
		strings.TrimSpace(description),
		formatTime(time.Now().UTC()),
	)
	return err
}

func clientProjectSelect() string {
	return `SELECT p.id, p.client_id, u.name, u.email, p.name, p.description, p.pic_name, p.pic_email,
		p.start_date, p.target_end_date, p.status, p.progress_percent, p.website_url, p.staging_url,
		p.credential_note, p.documentation_url,
		COALESCE((
			SELECT COUNT(*)
			FROM maintenance_plans mp
			WHERE mp.project_id = p.id AND mp.is_active = 1
		), 0) AS maintenance_active,
		COALESCE((
			SELECT COUNT(*)
			FROM project_invoices i
			WHERE i.project_id = p.id AND i.status IN ('sent', 'waiting_payment', 'overdue')
		), 0) AS unpaid_invoice_count,
		COALESCE((
			SELECT pp.note
			FROM project_progress pp
			WHERE pp.project_id = p.id
			ORDER BY pp.updated_at DESC
			LIMIT 1
		), '') AS latest_progress_note,
		COALESCE((
			SELECT pp.updated_at
			FROM project_progress pp
			WHERE pp.project_id = p.id
			ORDER BY pp.updated_at DESC
			LIMIT 1
		), '') AS latest_progress_at,
		p.created_at, p.updated_at
	FROM client_projects p
	INNER JOIN users u ON u.id = p.client_id`
}

func maintenancePlanSelect() string {
	return `SELECT mp.id, mp.project_id, mp.type, mp.period_start, mp.period_end, mp.quota_total,
		COALESCE((
			SELECT COUNT(*)
			FROM maintenance_logs ml
			WHERE ml.project_id = mp.project_id AND ml.status != 'rejected'
		), 0) AS quota_used,
		mp.is_active, mp.created_at, mp.updated_at
	FROM maintenance_plans mp`
}

func scanClientProject(row userAuthScanner) (domain.ClientProject, error) {
	var project domain.ClientProject
	var startDate string
	var targetEndDate string
	var maintenanceActive int
	var latestProgressAt string
	var createdAt string
	var updatedAt string
	if err := row.Scan(
		&project.ID,
		&project.ClientID,
		&project.ClientName,
		&project.ClientEmail,
		&project.Name,
		&project.Description,
		&project.PICName,
		&project.PICEmail,
		&startDate,
		&targetEndDate,
		&project.Status,
		&project.ProgressPercent,
		&project.WebsiteURL,
		&project.StagingURL,
		&project.CredentialNote,
		&project.DocumentationURL,
		&maintenanceActive,
		&project.UnpaidInvoiceCount,
		&project.LatestProgressNote,
		&latestProgressAt,
		&createdAt,
		&updatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.ClientProject{}, ErrNotFound
		}
		return domain.ClientProject{}, err
	}
	project.StartDate = parseOptionalTime(startDate)
	project.TargetEndDate = parseOptionalTime(targetEndDate)
	project.MaintenanceActive = intToBool(maintenanceActive)
	project.LatestProgressAt = parseOptionalTime(latestProgressAt)
	project.CreatedAt = parseTime(createdAt)
	project.UpdatedAt = parseTime(updatedAt)
	return project, nil
}

func scanProjectProgress(row userAuthScanner) (domain.ProjectProgress, error) {
	var progress domain.ProjectProgress
	var createdAt string
	var updatedAt string
	if err := row.Scan(
		&progress.ID,
		&progress.ProjectID,
		&progress.Title,
		&progress.Status,
		&progress.Percentage,
		&progress.Note,
		&progress.DocumentURL,
		&progress.UpdatedByID,
		&progress.UpdatedBy,
		&createdAt,
		&updatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.ProjectProgress{}, ErrNotFound
		}
		return domain.ProjectProgress{}, err
	}
	progress.CreatedAt = parseTime(createdAt)
	progress.UpdatedAt = parseTime(updatedAt)
	return progress, nil
}

func scanProjectDocument(row userAuthScanner) (domain.ProjectDocument, error) {
	var doc domain.ProjectDocument
	var createdAt string
	if err := row.Scan(
		&doc.ID,
		&doc.ProjectID,
		&doc.Title,
		&doc.Category,
		&doc.URL,
		&doc.Description,
		&doc.UploadedBy,
		&createdAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.ProjectDocument{}, ErrNotFound
		}
		return domain.ProjectDocument{}, err
	}
	doc.CreatedAt = parseTime(createdAt)
	return doc, nil
}

func scanMaintenancePlan(row userAuthScanner) (domain.MaintenancePlan, error) {
	var plan domain.MaintenancePlan
	var periodStart string
	var periodEnd string
	var isActive int
	var createdAt string
	var updatedAt string
	if err := row.Scan(
		&plan.ID,
		&plan.ProjectID,
		&plan.Type,
		&periodStart,
		&periodEnd,
		&plan.QuotaTotal,
		&plan.QuotaUsed,
		&isActive,
		&createdAt,
		&updatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.MaintenancePlan{}, ErrNotFound
		}
		return domain.MaintenancePlan{}, err
	}
	plan.PeriodStart = parseOptionalTime(periodStart)
	plan.PeriodEnd = parseOptionalTime(periodEnd)
	plan.IsActive = intToBool(isActive)
	plan.QuotaRemaining = plan.QuotaTotal - plan.QuotaUsed
	if plan.QuotaRemaining < 0 {
		plan.QuotaRemaining = 0
	}
	plan.CreatedAt = parseTime(createdAt)
	plan.UpdatedAt = parseTime(updatedAt)
	return plan, nil
}

func scanMaintenanceLog(row userAuthScanner) (domain.MaintenanceLog, error) {
	var log domain.MaintenanceLog
	var requestDate string
	var createdAt string
	var updatedAt string
	if err := row.Scan(
		&log.ID,
		&log.ProjectID,
		&requestDate,
		&log.Description,
		&log.Status,
		&log.PICName,
		&createdAt,
		&updatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.MaintenanceLog{}, ErrNotFound
		}
		return domain.MaintenanceLog{}, err
	}
	log.RequestDate = parseOptionalTime(requestDate)
	log.CreatedAt = parseTime(createdAt)
	log.UpdatedAt = parseTime(updatedAt)
	return log, nil
}

func scanProjectInvoice(row userAuthScanner) (domain.ProjectInvoice, error) {
	var invoice domain.ProjectInvoice
	var issuedAt string
	var dueAt string
	var paidAt string
	var createdAt string
	var updatedAt string
	if err := row.Scan(
		&invoice.ID,
		&invoice.ProjectID,
		&invoice.Number,
		&invoice.Amount,
		&invoice.Status,
		&issuedAt,
		&dueAt,
		&paidAt,
		&invoice.DocumentURL,
		&invoice.PaymentNote,
		&createdAt,
		&updatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return domain.ProjectInvoice{}, ErrNotFound
		}
		return domain.ProjectInvoice{}, err
	}
	invoice.IssuedAt = parseOptionalTime(issuedAt)
	invoice.DueAt = parseOptionalTime(dueAt)
	invoice.PaidAt = parseOptionalTime(paidAt)
	invoice.CreatedAt = parseTime(createdAt)
	invoice.UpdatedAt = parseTime(updatedAt)
	if (invoice.Status == domain.InvoiceStatusSent || invoice.Status == domain.InvoiceStatusWaitingPayment) &&
		!invoice.DueAt.IsZero() &&
		invoice.DueAt.Before(time.Now().UTC()) {
		invoice.Status = domain.InvoiceStatusOverdue
	}
	return invoice, nil
}

func scanProjectActivities(rows *sql.Rows) ([]domain.ProjectActivity, error) {
	activities := []domain.ProjectActivity{}
	for rows.Next() {
		var activity domain.ProjectActivity
		var createdAt string
		if err := rows.Scan(
			&activity.ID,
			&activity.ProjectID,
			&activity.ActorID,
			&activity.ActorName,
			&activity.Action,
			&activity.Description,
			&createdAt,
		); err != nil {
			return nil, err
		}
		activity.CreatedAt = parseTime(createdAt)
		activities = append(activities, activity)
	}
	return activities, rows.Err()
}
