package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
	"github.com/google/uuid"
)

type ClientProjectService struct {
	store    *store.Store
	notifier *NotificationService
}

func NewClientProjectService(repository *store.Store, notifier *NotificationService) *ClientProjectService {
	return &ClientProjectService{store: repository, notifier: notifier}
}

func (s *ClientProjectService) CreateProject(ctx context.Context, p domain.Project) (domain.Project, error) {
	if p.ClientID == "" || p.Name == "" {
		return domain.Project{}, errors.New("client ID dan nama project wajib diisi")
	}

	p.ID = uuid.NewString()
	p.CreatedAt = time.Now().UTC()
	p.UpdatedAt = time.Now().UTC()
	if p.Status == "" {
		p.Status = domain.ProjectStatusDiscovery
	}

	if err := s.store.CreateProject(ctx, p); err != nil {
		return domain.Project{}, err
	}

	// Notify client about new project
	client, err := s.store.GetUserByID(ctx, p.ClientID)
	if err == nil && s.notifier != nil && s.notifier.Enabled() {
		s.notifier.NotifyClientProjectStatus(ctx, client.Email, p.Name, string(p.Status), s.notifier.ClientProjectURL(p.ID))
	}

	return s.store.GetProjectByID(ctx, p.ID)
}

func (s *ClientProjectService) UpdateProject(ctx context.Context, id string, input domain.Project) (domain.Project, error) {
	p, err := s.store.GetProjectByID(ctx, id)
	if err != nil {
		return domain.Project{}, err
	}

	statusChanged := input.Status != "" && input.Status != p.Status

	if input.Name != "" {
		p.Name = input.Name
	}
	if input.Description != "" {
		p.Description = input.Description
	}
	if input.PICName != "" {
		p.PICName = input.PICName
	}
	if input.PICContact != "" {
		p.PICContact = input.PICContact
	}
	if input.StartDate != "" {
		p.StartDate = input.StartDate
	}
	if input.TargetEndDate != "" {
		p.TargetEndDate = input.TargetEndDate
	}
	if input.Status != "" {
		p.Status = input.Status
	}
	if input.WebsiteURL != "" {
		p.WebsiteURL = input.WebsiteURL
	}
	if input.StagingURL != "" {
		p.StagingURL = input.StagingURL
	}
	if input.Credentials != "" {
		p.Credentials = input.Credentials
	}
	if input.Documentation != "" {
		p.Documentation = input.Documentation
	}
	p.UpdatedAt = time.Now().UTC()

	if err := s.store.UpdateProject(ctx, p); err != nil {
		return domain.Project{}, err
	}

	if statusChanged && s.notifier != nil && s.notifier.Enabled() {
		client, err := s.store.GetUserByID(ctx, p.ClientID)
		if err == nil {
			s.notifier.NotifyClientProjectStatus(ctx, client.Email, p.Name, string(p.Status), s.notifier.ClientProjectURL(p.ID))
		}
	}

	// Log Audit
	_ = s.store.CreateAuditLog(ctx, domain.AuditLog{
		ID:         uuid.NewString(),
		ActorID:    "system",
		ActorName:  "Admin",
		ActorRole:  "admin",
		Action:     "UPDATE_PROJECT",
		TargetType: "project",
		TargetID:   p.ID,
		Details:    fmt.Sprintf("Project %s status diperbarui menjadi %s", p.Name, p.Status),
		CreatedAt:  time.Now().UTC(),
	})

	return p, nil
}

func (s *ClientProjectService) CreateProgress(ctx context.Context, projectID string, progress domain.ProjectProgress) (domain.ProjectProgress, error) {
	p, err := s.store.GetProjectByID(ctx, projectID)
	if err != nil {
		return domain.ProjectProgress{}, err
	}

	progress.ID = uuid.NewString()
	progress.ProjectID = projectID
	progress.CreatedAt = time.Now().UTC()
	if progress.Status == "" {
		progress.Status = domain.ProgressStatusPending
	}
	if progress.UpdateDate == "" {
		progress.UpdateDate = time.Now().Format("2006-01-02")
	}

	if err := s.store.CreateProjectProgress(ctx, progress); err != nil {
		return domain.ProjectProgress{}, err
	}

	// Notify client about project progress update
	client, err := s.store.GetUserByID(ctx, p.ClientID)
	if err == nil && s.notifier != nil && s.notifier.Enabled() {
		s.notifier.NotifyClientProjectProgress(ctx, client.Email, p.Name, progress.Title, string(progress.Status), progress.Percentage, progress.Notes, s.notifier.ClientProjectURL(projectID))
	}

	// Log Audit
	_ = s.store.CreateAuditLog(ctx, domain.AuditLog{
		ID:         uuid.NewString(),
		ActorID:    "system",
		ActorName:  "Admin",
		ActorRole:  "admin",
		Action:     "CREATE_PROGRESS",
		TargetType: "project_progress",
		TargetID:   progress.ID,
		Details:    fmt.Sprintf("Milestone '%s' (%d%%) ditambahkan ke project %s", progress.Title, progress.Percentage, p.Name),
		CreatedAt:  time.Now().UTC(),
	})

	return progress, nil
}

func (s *ClientProjectService) CreateDocument(ctx context.Context, projectID string, doc domain.ProjectDocument) (domain.ProjectDocument, error) {
	p, err := s.store.GetProjectByID(ctx, projectID)
	if err != nil {
		return domain.ProjectDocument{}, err
	}

	doc.ID = uuid.NewString()
	doc.ProjectID = projectID
	doc.UploadedAt = time.Now().UTC()

	if err := s.store.CreateProjectDocument(ctx, doc); err != nil {
		return domain.ProjectDocument{}, err
	}

	// Notify client
	client, err := s.store.GetUserByID(ctx, p.ClientID)
	if err == nil && s.notifier != nil && s.notifier.Enabled() {
		s.notifier.NotifyClientNewDocument(ctx, client.Email, p.Name, doc.Title, s.notifier.ClientProjectURL(projectID))
	}

	// Log Audit
	_ = s.store.CreateAuditLog(ctx, domain.AuditLog{
		ID:         uuid.NewString(),
		ActorID:    "system",
		ActorName:  "Admin",
		ActorRole:  "admin",
		Action:     "UPLOAD_DOCUMENT",
		TargetType: "project_document",
		TargetID:   doc.ID,
		Details:    fmt.Sprintf("Dokumen '%s' diunggah untuk project %s", doc.Title, p.Name),
		CreatedAt:  time.Now().UTC(),
	})

	return doc, nil
}

func (s *ClientProjectService) CreateOrUpdateMaintenance(ctx context.Context, pm domain.ProjectMaintenance) (domain.ProjectMaintenance, error) {
	if pm.ProjectID == "" {
		return domain.ProjectMaintenance{}, errors.New("project ID wajib diisi")
	}

	if pm.ID == "" {
		pm.ID = uuid.NewString()
		pm.CreatedAt = time.Now().UTC()
	}
	pm.UpdatedAt = time.Now().UTC()

	if err := s.store.CreateOrUpdateProjectMaintenance(ctx, pm); err != nil {
		return domain.ProjectMaintenance{}, err
	}

	return s.store.GetProjectMaintenance(ctx, pm.ProjectID)
}

func (s *ClientProjectService) CreateMaintenanceLog(ctx context.Context, projectID string, log domain.MaintenanceLog) (domain.MaintenanceLog, error) {
	p, err := s.store.GetProjectByID(ctx, projectID)
	if err != nil {
		return domain.MaintenanceLog{}, err
	}

	log.ID = uuid.NewString()
	log.ProjectID = projectID
	log.CreatedAt = time.Now().UTC()
	if log.RequestDate == "" {
		log.RequestDate = time.Now().Format("2006-01-02")
	}
	if log.Status == "" {
		log.Status = domain.ProgressStatusPending
	}

	if err := s.store.CreateMaintenanceLog(ctx, log); err != nil {
		return domain.MaintenanceLog{}, err
	}

	// Increment quota used by 1
	_ = s.store.IncrementMaintenanceQuotaUsed(ctx, projectID, 1)

	// Notify client
	client, err := s.store.GetUserByID(ctx, p.ClientID)
	if err == nil && s.notifier != nil && s.notifier.Enabled() {
		s.notifier.NotifyClientMaintenanceUpdate(ctx, client.Email, p.Name, log.Description, string(log.Status), s.notifier.ClientProjectURL(projectID))
	}

	// Log Audit
	_ = s.store.CreateAuditLog(ctx, domain.AuditLog{
		ID:         uuid.NewString(),
		ActorID:    "system",
		ActorName:  "Admin",
		ActorRole:  "admin",
		Action:     "LOG_MAINTENANCE",
		TargetType: "maintenance_log",
		TargetID:   log.ID,
		Details:    fmt.Sprintf("Request maintenance dicatat untuk project %s: %s", p.Name, log.Description),
		CreatedAt:  time.Now().UTC(),
	})

	return log, nil
}

func (s *ClientProjectService) CreateInvoice(ctx context.Context, projectID string, inv domain.ProjectInvoice) (domain.ProjectInvoice, error) {
	p, err := s.store.GetProjectByID(ctx, projectID)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}

	inv.ID = uuid.NewString()
	inv.ProjectID = projectID
	inv.CreatedAt = time.Now().UTC()
	inv.UpdatedAt = time.Now().UTC()
	if inv.Status == "" {
		inv.Status = domain.InvoiceStatusDraft
	}

	if err := s.store.CreateProjectInvoice(ctx, inv); err != nil {
		return domain.ProjectInvoice{}, err
	}

	// Notify client (if status is not draft)
	if inv.Status != domain.InvoiceStatusDraft {
		client, err := s.store.GetUserByID(ctx, p.ClientID)
		if err == nil && s.notifier != nil && s.notifier.Enabled() {
			s.notifier.NotifyClientNewInvoice(ctx, client.Email, p.Name, inv.InvoiceNumber, inv.Amount, string(inv.Status), s.notifier.ClientInvoiceURL(projectID))
		}
	}

	// Log Audit
	_ = s.store.CreateAuditLog(ctx, domain.AuditLog{
		ID:         uuid.NewString(),
		ActorID:    "system",
		ActorName:  "Admin",
		ActorRole:  "admin",
		Action:     "CREATE_INVOICE",
		TargetType: "invoice",
		TargetID:   inv.ID,
		Details:    fmt.Sprintf("Invoice %s (Rp%d) dibuat untuk project %s", inv.InvoiceNumber, inv.Amount, p.Name),
		CreatedAt:  time.Now().UTC(),
	})

	return inv, nil
}

func (s *ClientProjectService) UpdateInvoice(ctx context.Context, id string, input domain.ProjectInvoice) (domain.ProjectInvoice, error) {
	inv, err := s.store.GetProjectInvoiceByID(ctx, id)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}

	p, err := s.store.GetProjectByID(ctx, inv.ProjectID)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}

	statusChanged := input.Status != "" && input.Status != inv.Status

	if input.InvoiceNumber != "" {
		inv.InvoiceNumber = input.InvoiceNumber
	}
	if input.Amount > 0 {
		inv.Amount = input.Amount
	}
	if input.Status != "" {
		inv.Status = input.Status
	}
	if input.IssueDate != "" {
		inv.IssueDate = input.IssueDate
	}
	if input.DueDate != "" {
		inv.DueDate = input.DueDate
	}
	if input.DocumentURL != "" {
		inv.DocumentURL = input.DocumentURL
	}
	inv.UpdatedAt = time.Now().UTC()

	if err := s.store.UpdateProjectInvoice(ctx, inv); err != nil {
		return domain.ProjectInvoice{}, err
	}

	if statusChanged && inv.Status != domain.InvoiceStatusDraft && s.notifier != nil && s.notifier.Enabled() {
		client, err := s.store.GetUserByID(ctx, p.ClientID)
		if err == nil {
			s.notifier.NotifyClientNewInvoice(ctx, client.Email, p.Name, inv.InvoiceNumber, inv.Amount, string(inv.Status), s.notifier.ClientInvoiceURL(inv.ProjectID))
		}
	}

	// Log Audit
	_ = s.store.CreateAuditLog(ctx, domain.AuditLog{
		ID:         uuid.NewString(),
		ActorID:    "system",
		ActorName:  "Admin",
		ActorRole:  "admin",
		Action:     "UPDATE_INVOICE",
		TargetType: "invoice",
		TargetID:   inv.ID,
		Details:    fmt.Sprintf("Invoice %s status diperbarui menjadi %s", inv.InvoiceNumber, inv.Status),
		CreatedAt:  time.Now().UTC(),
	})

	return inv, nil
}
