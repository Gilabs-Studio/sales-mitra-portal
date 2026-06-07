package service

import (
	"context"
	"errors"
	"strings"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/httpx"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
)

type LeadService struct {
	store    *store.Store
	cfg      config.Config
	notifier *NotificationService
}

type LeadInput struct {
	CompanyName  string             `json:"companyName"`
	ContactName  string             `json:"contactName"`
	ContactEmail string             `json:"contactEmail"`
	ContactPhone string             `json:"contactPhone"`
	ServiceType  domain.ServiceType `json:"serviceType"`
	Budget       int64              `json:"budget"`
	NeedSummary  string             `json:"needSummary"`
	Notes        string             `json:"notes"`
}

type UpdateLeadStatusInput struct {
	Status domain.LeadStatus `json:"status"`
	Note   string            `json:"note"`
}

func NewLeadService(repository *store.Store, cfg config.Config, notifier *NotificationService) *LeadService {
	return &LeadService{
		store:    repository,
		cfg:      cfg,
		notifier: notifier,
	}
}

func (s *LeadService) ServiceRules(ctx context.Context) ([]domain.ServiceRule, error) {
	return s.store.ListServiceCatalog(ctx, false)
}

func (s *LeadService) CreateLead(ctx context.Context, partnerID string, input LeadInput) (domain.Lead, error) {
	input.CompanyName = strings.TrimSpace(input.CompanyName)
	input.ContactName = strings.TrimSpace(input.ContactName)
	input.ContactEmail = strings.ToLower(strings.TrimSpace(input.ContactEmail))
	input.ContactPhone = strings.TrimSpace(input.ContactPhone)
	input.NeedSummary = strings.TrimSpace(input.NeedSummary)
	input.Notes = strings.TrimSpace(input.Notes)

	if input.CompanyName == "" || input.ContactName == "" || input.ContactEmail == "" {
		return domain.Lead{}, httpx.Validation("Data lead belum lengkap", "Company name, contact name, dan contact email wajib diisi.")
	}
	if input.Budget < 0 {
		return domain.Lead{}, httpx.Validation("Budget tidak valid", "Budget tidak boleh bernilai negatif")
	}

	rule, err := s.store.GetServiceRule(ctx, input.ServiceType)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return domain.Lead{}, httpx.Validation("Tipe layanan tidak valid", "")
		}
		return domain.Lead{}, err
	}
	if !rule.IsActive {
		return domain.Lead{}, httpx.Validation("Layanan belum aktif", "Pilih layanan lain yang tersedia di katalog")
	}
	if rule.RequiresDiscovery && input.Budget == 0 && len(input.NeedSummary) < 30 {
		return domain.Lead{}, httpx.Validation("Discovery layanan belum cukup", "Jika budget belum diketahui, isi ringkasan kebutuhan minimal 30 karakter")
	}

	status, score, note := qualifyLead(input, rule)
	lead, err := s.store.CreateLead(ctx, store.CreateLeadInput{
		PartnerID:          partnerID,
		CompanyName:        input.CompanyName,
		ContactName:        input.ContactName,
		ContactEmail:       input.ContactEmail,
		ContactPhone:       input.ContactPhone,
		ServiceType:        input.ServiceType,
		Budget:             input.Budget,
		NeedSummary:        input.NeedSummary,
		Notes:              input.Notes,
		Status:             status,
		QualificationScore: score,
		QualificationNote:  note,
	})
	if err != nil {
		return domain.Lead{}, err
	}

	partner, err := s.store.GetUserByID(ctx, partnerID)
	if err == nil {
		s.notifyAdminsAboutNewLead(ctx, lead, partner)
	}

	return lead, nil
}

func (s *LeadService) UpdateLeadStatus(ctx context.Context, leadID string, actorID string, input UpdateLeadStatusInput) (domain.LeadWithPartner, error) {
	if !isKnownStatus(input.Status) {
		return domain.LeadWithPartner{}, httpx.Validation("Status lead tidak valid", "")
	}

	lead, err := s.store.UpdateLeadStatus(ctx, leadID, actorID, input.Status, strings.TrimSpace(input.Note))
	if err != nil {
		return domain.LeadWithPartner{}, mapStoreError(err)
	}

	s.notifyPartnerAboutLeadUpdate(ctx, lead, strings.TrimSpace(input.Note))
	return lead, nil
}

func (s *LeadService) SendMessage(ctx context.Context, leadID string, sender domain.User, message string) (domain.LeadMessage, error) {
	msg, err := s.store.SendMessage(ctx, domain.LeadMessage{
		LeadID:     leadID,
		SenderID:   sender.ID,
		SenderName: sender.Name,
		SenderRole: string(sender.Role),
		Message:    strings.TrimSpace(message),
	})
	if err != nil {
		return domain.LeadMessage{}, err
	}

	lead, err := s.store.GetLeadWithPartner(ctx, leadID)
	if err == nil {
		s.notifyMessageRecipients(ctx, lead, sender, msg.Message)
	}

	return msg, nil
}

func (s *LeadService) notifyAdminsAboutNewLead(ctx context.Context, lead domain.Lead, partner domain.User) {
	recipients := s.adminRecipientEmails(ctx)
	s.notifier.NotifyAdminsNewLead(
		ctx,
		recipients,
		lead.CompanyName,
		partner.Name,
		string(lead.ServiceType),
		s.notifier.AdminLeadURL(lead.ID),
	)
}

func (s *LeadService) notifyPartnerAboutLeadUpdate(ctx context.Context, lead domain.LeadWithPartner, note string) {
	s.notifier.NotifyPartnerLeadUpdated(
		ctx,
		lead.PartnerEmail,
		lead.CompanyName,
		string(lead.Status),
		note,
		s.notifier.PartnerLeadURL(lead.ID),
	)
}

func (s *LeadService) notifyMessageRecipients(ctx context.Context, lead domain.LeadWithPartner, sender domain.User, message string) {
	if sender.Role == domain.RoleAdmin {
		s.notifier.NotifyChatMessage(
			ctx,
			[]string{lead.PartnerEmail},
			lead.CompanyName,
			sender.Name,
			string(sender.Role),
			message,
			s.notifier.PartnerChatURL(lead.ID),
		)
		return
	}

	s.notifier.NotifyChatMessage(
		ctx,
		s.adminRecipientEmails(ctx),
		lead.CompanyName,
		sender.Name,
		string(sender.Role),
		message,
		s.notifier.AdminChatURL(lead.ID),
	)
}

func (s *LeadService) adminRecipientEmails(ctx context.Context) []string {
	admins, err := s.store.ListUsersByRole(ctx, domain.RoleAdmin)
	if err != nil {
		return []string{s.cfg.AdminEmail}
	}

	recipients := make([]string, 0, len(admins)+1)
	for _, admin := range admins {
		recipients = append(recipients, admin.Email)
	}
	recipients = append(recipients, s.cfg.AdminEmail)
	return recipients
}

func qualifyLead(input LeadInput, rule domain.ServiceRule) (domain.LeadStatus, int, string) {
	if rule.RequiresDiscovery && input.Budget == 0 {
		return domain.LeadStatusSubmitted, 72, "Budget belum diketahui, tetapi kebutuhan cukup untuk discovery awal"
	}

	// Do NOT auto-reject — let admin review and decide.
	// Leads with budget below minimum are submitted for manual review.
	if rule.MinimumBudget > 0 && input.Budget < rule.MinimumBudget {
		return domain.LeadStatusSubmitted, 45, "Budget di bawah kriteria minimum, menunggu review admin untuk keputusan akhir"
	}

	if rule.RequiresDiscovery && len(input.NeedSummary) >= 30 {
		return domain.LeadStatusQualified, 90, "Lead kompleks memenuhi kriteria discovery dan estimasi budget"
	}

	if input.ServiceType == domain.ServiceSalesView {
		return domain.LeadStatusQualified, 78, "Lead produk siap ditindaklanjuti memakai referral code"
	}

	return domain.LeadStatusQualified, 84, "Lead memenuhi kriteria budget minimum"
}

func isKnownStatus(status domain.LeadStatus) bool {
	switch status {
	case domain.LeadStatusSubmitted,
		domain.LeadStatusQualified,
		domain.LeadStatusContacted,
		domain.LeadStatusWon,
		domain.LeadStatusLost,
		domain.LeadStatusRejected:
		return true
	default:
		return false
	}
}

func mapStoreError(err error) error {
	if err == store.ErrNotFound {
		return httpx.NotFound("Data tidak ditemukan")
	}
	return err
}
