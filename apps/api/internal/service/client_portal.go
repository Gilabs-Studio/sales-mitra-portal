package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/httpx"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
)

type ClientPortalService struct {
	store    *store.Store
	auth     *AuthService
	notifier *NotificationService
}

type ProjectInput struct {
	ClientID         string               `json:"clientId"`
	Name             string               `json:"name"`
	Description      string               `json:"description"`
	PICName          string               `json:"picName"`
	PICEmail         string               `json:"picEmail"`
	StartDate        string               `json:"startDate"`
	TargetEndDate    string               `json:"targetEndDate"`
	Status           domain.ProjectStatus `json:"status"`
	ProgressPercent  int                  `json:"progressPercent"`
	WebsiteURL       string               `json:"websiteUrl"`
	StagingURL       string               `json:"stagingUrl"`
	CredentialNote   string               `json:"credentialNote"`
	DocumentationURL string               `json:"documentationUrl"`
}

type ProgressInput struct {
	Title       string                `json:"title"`
	Status      domain.ProgressStatus `json:"status"`
	Percentage  int                   `json:"percentage"`
	Note        string                `json:"note"`
	DocumentURL string                `json:"documentUrl"`
}

type DocumentInput struct {
	Title       string                  `json:"title"`
	Category    domain.DocumentCategory `json:"category"`
	URL         string                  `json:"url"`
	Description string                  `json:"description"`
}

type MaintenancePlanInput struct {
	Type        string `json:"type"`
	PeriodStart string `json:"periodStart"`
	PeriodEnd   string `json:"periodEnd"`
	QuotaTotal  int    `json:"quotaTotal"`
	IsActive    bool   `json:"isActive"`
}

type MaintenanceLogInput struct {
	RequestDate string                   `json:"requestDate"`
	Description string                   `json:"description"`
	Status      domain.MaintenanceStatus `json:"status"`
	PICName     string                   `json:"picName"`
}

type InvoiceInput struct {
	Number      string               `json:"number"`
	Amount      int64                `json:"amount"`
	Status      domain.InvoiceStatus `json:"status"`
	IssuedAt    string               `json:"issuedAt"`
	DueAt       string               `json:"dueAt"`
	PaidAt      string               `json:"paidAt"`
	DocumentURL string               `json:"documentUrl"`
	PaymentNote string               `json:"paymentNote"`
}

func NewClientPortalService(repository *store.Store, auth *AuthService, notifier *NotificationService) *ClientPortalService {
	return &ClientPortalService{store: repository, auth: auth, notifier: notifier}
}

func (s *ClientPortalService) CreateClient(ctx context.Context, input CreateClientInput) (domain.User, error) {
	return s.auth.CreateClient(ctx, input)
}

func (s *ClientPortalService) SendClientInvitation(ctx context.Context, clientID string) error {
	user, err := s.store.GetUserByID(ctx, clientID)
	if err != nil {
		return mapClientPortalStoreError(err)
	}
	if user.Role != domain.RoleClient {
		return httpx.Validation("Akun yang dipilih bukan client", "")
	}
	return s.auth.RequestPasswordResetForUser(ctx, clientID)
}

func (s *ClientPortalService) CreateProject(ctx context.Context, actor domain.User, input ProjectInput) (domain.ClientProject, error) {
	storeInput, err := normalizeProjectInput(ctx, s.store, input)
	if err != nil {
		return domain.ClientProject{}, err
	}
	project, err := s.store.CreateClientProject(ctx, storeInput, actor.ID)
	if err != nil {
		return domain.ClientProject{}, mapClientPortalStoreError(err)
	}
	s.notifyClient(ctx, project, "Project baru tersedia", "Project Anda sudah tersedia di Portal GiLabs.")
	return project, nil
}

func (s *ClientPortalService) UpdateProject(ctx context.Context, actor domain.User, projectID string, input ProjectInput) (domain.ClientProject, error) {
	storeInput, err := normalizeProjectInput(ctx, s.store, input)
	if err != nil {
		return domain.ClientProject{}, err
	}
	project, err := s.store.UpdateClientProject(ctx, projectID, storeInput, actor.ID)
	if err != nil {
		return domain.ClientProject{}, mapClientPortalStoreError(err)
	}
	s.notifyClient(ctx, project, "Project Status Updated", "Informasi project atau status project telah diperbarui.")
	return project, nil
}

func (s *ClientPortalService) CreateProgress(ctx context.Context, actor domain.User, projectID string, input ProgressInput) (domain.ProjectProgress, error) {
	input.Title = strings.TrimSpace(input.Title)
	input.Note = strings.TrimSpace(input.Note)
	input.DocumentURL = strings.TrimSpace(input.DocumentURL)
	if input.Title == "" {
		return domain.ProjectProgress{}, httpx.Validation("Judul progress wajib diisi", "")
	}
	if !isKnownProgressStatus(input.Status) {
		return domain.ProjectProgress{}, httpx.Validation("Status progress tidak valid", "")
	}
	if input.Percentage < 0 || input.Percentage > 100 {
		return domain.ProjectProgress{}, httpx.Validation("Persentase progress tidak valid", "Nilai harus di antara 0 sampai 100.")
	}

	progress, err := s.store.CreateProjectProgress(ctx, projectID, store.ProjectProgressInput{
		Title:       input.Title,
		Status:      input.Status,
		Percentage:  input.Percentage,
		Note:        input.Note,
		DocumentURL: input.DocumentURL,
		UpdatedByID: actor.ID,
	}, actor.ID)
	if err != nil {
		return domain.ProjectProgress{}, mapClientPortalStoreError(err)
	}
	if project, err := s.store.GetClientProject(ctx, projectID); err == nil {
		s.notifyClient(ctx, project, "Project Progress Updated", input.Title+" diperbarui.")
	}
	return progress, nil
}

func (s *ClientPortalService) CreateDocument(ctx context.Context, actor domain.User, projectID string, input DocumentInput) (domain.ProjectDocument, error) {
	input.Title = strings.TrimSpace(input.Title)
	input.URL = strings.TrimSpace(input.URL)
	input.Description = strings.TrimSpace(input.Description)
	if input.Category == "" {
		input.Category = domain.DocumentCategoryOther
	}
	if input.Title == "" || input.URL == "" {
		return domain.ProjectDocument{}, httpx.Validation("Dokumen belum lengkap", "Judul dan URL dokumen wajib diisi.")
	}
	if !isKnownDocumentCategory(input.Category) {
		return domain.ProjectDocument{}, httpx.Validation("Kategori dokumen tidak valid", "")
	}

	doc, err := s.store.CreateProjectDocument(ctx, projectID, store.ProjectDocumentInput{
		Title:       input.Title,
		Category:    input.Category,
		URL:         input.URL,
		Description: input.Description,
		UploadedBy:  actor.ID,
	}, actor.ID)
	if err != nil {
		return domain.ProjectDocument{}, mapClientPortalStoreError(err)
	}
	if project, err := s.store.GetClientProject(ctx, projectID); err == nil {
		s.notifyClient(ctx, project, "New Document Uploaded", input.Title+" tersedia untuk preview atau download.")
	}
	return doc, nil
}

func (s *ClientPortalService) UpsertMaintenancePlan(ctx context.Context, actor domain.User, projectID string, input MaintenancePlanInput) (domain.MaintenancePlan, error) {
	input.Type = strings.TrimSpace(input.Type)
	if input.Type == "" {
		return domain.MaintenancePlan{}, httpx.Validation("Jenis maintenance wajib diisi", "")
	}
	if input.QuotaTotal < 0 {
		return domain.MaintenancePlan{}, httpx.Validation("Kuota maintenance tidak valid", "")
	}
	periodStart, err := parsePortalDate(input.PeriodStart)
	if err != nil {
		return domain.MaintenancePlan{}, httpx.Validation("Tanggal mulai maintenance tidak valid", "")
	}
	periodEnd, err := parsePortalDate(input.PeriodEnd)
	if err != nil {
		return domain.MaintenancePlan{}, httpx.Validation("Tanggal akhir maintenance tidak valid", "")
	}

	plan, err := s.store.UpsertMaintenancePlan(ctx, projectID, store.MaintenancePlanInput{
		Type:        input.Type,
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
		QuotaTotal:  input.QuotaTotal,
		IsActive:    input.IsActive,
	}, actor.ID)
	if err != nil {
		return domain.MaintenancePlan{}, mapClientPortalStoreError(err)
	}
	if project, err := s.store.GetClientProject(ctx, projectID); err == nil {
		s.notifyClient(ctx, project, "Maintenance Status Updated", "Informasi paket maintenance project telah diperbarui.")
	}
	return plan, nil
}

func (s *ClientPortalService) CreateMaintenanceLog(ctx context.Context, actor domain.User, projectID string, input MaintenanceLogInput) (domain.MaintenanceLog, error) {
	input.Description = strings.TrimSpace(input.Description)
	input.PICName = strings.TrimSpace(input.PICName)
	if input.Description == "" {
		return domain.MaintenanceLog{}, httpx.Validation("Deskripsi maintenance wajib diisi", "")
	}
	if !isKnownMaintenanceStatus(input.Status) {
		return domain.MaintenanceLog{}, httpx.Validation("Status maintenance tidak valid", "")
	}
	requestDate, err := parsePortalDate(input.RequestDate)
	if err != nil {
		return domain.MaintenanceLog{}, httpx.Validation("Tanggal maintenance tidak valid", "")
	}
	if requestDate.IsZero() {
		requestDate = time.Now().UTC()
	}

	log, err := s.store.CreateMaintenanceLog(ctx, projectID, store.MaintenanceLogInput{
		RequestDate: requestDate,
		Description: input.Description,
		Status:      input.Status,
		PICName:     input.PICName,
	}, actor.ID)
	if err != nil {
		return domain.MaintenanceLog{}, mapClientPortalStoreError(err)
	}
	if project, err := s.store.GetClientProject(ctx, projectID); err == nil {
		s.notifyClient(ctx, project, "Maintenance Status Updated", input.Description)
	}
	return log, nil
}

func (s *ClientPortalService) CreateInvoice(ctx context.Context, actor domain.User, projectID string, input InvoiceInput) (domain.ProjectInvoice, error) {
	storeInput, err := normalizeInvoiceInput(input)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}
	invoice, err := s.store.CreateProjectInvoice(ctx, projectID, storeInput, actor.ID)
	if err != nil {
		return domain.ProjectInvoice{}, mapClientPortalStoreError(err)
	}
	if project, err := s.store.GetClientProject(ctx, projectID); err == nil {
		s.notifyClient(ctx, project, "New Invoice Generated", "Invoice "+invoice.Number+" telah diterbitkan.")
	}
	return invoice, nil
}

func (s *ClientPortalService) UpdateInvoice(ctx context.Context, actor domain.User, invoiceID string, input InvoiceInput) (domain.ProjectInvoice, error) {
	storeInput, err := normalizeInvoiceInput(input)
	if err != nil {
		return domain.ProjectInvoice{}, err
	}
	invoice, err := s.store.UpdateProjectInvoice(ctx, invoiceID, storeInput, actor.ID)
	if err != nil {
		return domain.ProjectInvoice{}, mapClientPortalStoreError(err)
	}
	if project, err := s.store.GetClientProject(ctx, invoice.ProjectID); err == nil {
		s.notifyClient(ctx, project, "Invoice Due Reminder", "Status invoice "+invoice.Number+" telah diperbarui.")
	}
	return invoice, nil
}

func (s *ClientPortalService) notifyClient(ctx context.Context, project domain.ClientProject, title string, summary string) {
	if s.notifier == nil {
		return
	}
	s.notifier.NotifyClientProjectEvent(ctx, project.ClientEmail, project.Name, title, summary, s.notifier.ClientProjectURL(project.ID))
}

func normalizeProjectInput(ctx context.Context, repository *store.Store, input ProjectInput) (store.ClientProjectInput, error) {
	input.ClientID = strings.TrimSpace(input.ClientID)
	input.Name = strings.TrimSpace(input.Name)
	input.Description = strings.TrimSpace(input.Description)
	input.PICName = strings.TrimSpace(input.PICName)
	input.PICEmail = strings.TrimSpace(input.PICEmail)
	input.WebsiteURL = strings.TrimSpace(input.WebsiteURL)
	input.StagingURL = strings.TrimSpace(input.StagingURL)
	input.CredentialNote = strings.TrimSpace(input.CredentialNote)
	input.DocumentationURL = strings.TrimSpace(input.DocumentationURL)

	if input.ClientID == "" || input.Name == "" {
		return store.ClientProjectInput{}, httpx.Validation("Data project belum lengkap", "Client dan nama project wajib diisi.")
	}
	client, err := repository.GetUserByID(ctx, input.ClientID)
	if err != nil {
		return store.ClientProjectInput{}, mapClientPortalStoreError(err)
	}
	if client.Role != domain.RoleClient {
		return store.ClientProjectInput{}, httpx.Validation("Pemilik project harus akun client", "")
	}
	if !isKnownProjectStatus(input.Status) {
		return store.ClientProjectInput{}, httpx.Validation("Status project tidak valid", "")
	}
	if input.ProgressPercent < 0 || input.ProgressPercent > 100 {
		return store.ClientProjectInput{}, httpx.Validation("Progress project tidak valid", "Nilai harus di antara 0 sampai 100.")
	}

	startDate, err := parsePortalDate(input.StartDate)
	if err != nil {
		return store.ClientProjectInput{}, httpx.Validation("Tanggal mulai project tidak valid", "")
	}
	targetDate, err := parsePortalDate(input.TargetEndDate)
	if err != nil {
		return store.ClientProjectInput{}, httpx.Validation("Target selesai project tidak valid", "")
	}

	return store.ClientProjectInput{
		ClientID:         input.ClientID,
		Name:             input.Name,
		Description:      input.Description,
		PICName:          input.PICName,
		PICEmail:         input.PICEmail,
		StartDate:        startDate,
		TargetEndDate:    targetDate,
		Status:           input.Status,
		ProgressPercent:  input.ProgressPercent,
		WebsiteURL:       input.WebsiteURL,
		StagingURL:       input.StagingURL,
		CredentialNote:   input.CredentialNote,
		DocumentationURL: input.DocumentationURL,
	}, nil
}

func normalizeInvoiceInput(input InvoiceInput) (store.ProjectInvoiceInput, error) {
	input.Number = strings.TrimSpace(input.Number)
	input.DocumentURL = strings.TrimSpace(input.DocumentURL)
	input.PaymentNote = strings.TrimSpace(input.PaymentNote)
	if input.Number == "" {
		return store.ProjectInvoiceInput{}, httpx.Validation("Nomor invoice wajib diisi", "")
	}
	if input.Amount < 0 {
		return store.ProjectInvoiceInput{}, httpx.Validation("Nominal invoice tidak valid", "")
	}
	if !isKnownInvoiceStatus(input.Status) {
		return store.ProjectInvoiceInput{}, httpx.Validation("Status invoice tidak valid", "")
	}
	issuedAt, err := parsePortalDate(input.IssuedAt)
	if err != nil {
		return store.ProjectInvoiceInput{}, httpx.Validation("Tanggal terbit invoice tidak valid", "")
	}
	dueAt, err := parsePortalDate(input.DueAt)
	if err != nil {
		return store.ProjectInvoiceInput{}, httpx.Validation("Tanggal jatuh tempo invoice tidak valid", "")
	}
	paidAt, err := parsePortalDate(input.PaidAt)
	if err != nil {
		return store.ProjectInvoiceInput{}, httpx.Validation("Tanggal bayar invoice tidak valid", "")
	}
	return store.ProjectInvoiceInput{
		Number:      input.Number,
		Amount:      input.Amount,
		Status:      input.Status,
		IssuedAt:    issuedAt,
		DueAt:       dueAt,
		PaidAt:      paidAt,
		DocumentURL: input.DocumentURL,
		PaymentNote: input.PaymentNote,
	}, nil
}

func parsePortalDate(value string) (time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return time.Time{}, nil
	}
	if parsed, err := time.Parse(time.RFC3339, value); err == nil {
		return parsed.UTC(), nil
	}
	if parsed, err := time.Parse("2006-01-02", value); err == nil {
		return parsed.UTC(), nil
	}
	return time.Time{}, errors.New("invalid date")
}

func isKnownProjectStatus(status domain.ProjectStatus) bool {
	switch status {
	case domain.ProjectStatusDiscovery,
		domain.ProjectStatusPlanning,
		domain.ProjectStatusDevelopment,
		domain.ProjectStatusTesting,
		domain.ProjectStatusDeployment,
		domain.ProjectStatusCompleted,
		domain.ProjectStatusMaintenance:
		return true
	default:
		return false
	}
}

func isKnownProgressStatus(status domain.ProgressStatus) bool {
	switch status {
	case domain.ProgressStatusTodo,
		domain.ProgressStatusInProgress,
		domain.ProgressStatusBlocked,
		domain.ProgressStatusDone:
		return true
	default:
		return false
	}
}

func isKnownMaintenanceStatus(status domain.MaintenanceStatus) bool {
	switch status {
	case domain.MaintenanceStatusOpen,
		domain.MaintenanceStatusInProgress,
		domain.MaintenanceStatusResolved,
		domain.MaintenanceStatusRejected:
		return true
	default:
		return false
	}
}

func isKnownInvoiceStatus(status domain.InvoiceStatus) bool {
	switch status {
	case domain.InvoiceStatusDraft,
		domain.InvoiceStatusSent,
		domain.InvoiceStatusWaitingPayment,
		domain.InvoiceStatusPaid,
		domain.InvoiceStatusOverdue:
		return true
	default:
		return false
	}
}

func isKnownDocumentCategory(category domain.DocumentCategory) bool {
	switch category {
	case domain.DocumentCategoryDeliverable,
		domain.DocumentCategoryProgress,
		domain.DocumentCategoryMaintenance,
		domain.DocumentCategoryInvoice,
		domain.DocumentCategoryReport,
		domain.DocumentCategoryOther:
		return true
	default:
		return false
	}
}

func mapClientPortalStoreError(err error) error {
	if errors.Is(err, store.ErrNotFound) {
		return httpx.NotFound("Data tidak ditemukan")
	}
	return err
}
