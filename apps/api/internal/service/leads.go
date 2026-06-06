package service

import (
	"context"
	"strings"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/httpx"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
)

type LeadService struct {
	store *store.Store
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

func NewLeadService(repository *store.Store) *LeadService {
	return &LeadService{store: repository}
}

func (s *LeadService) ServiceRules() []domain.ServiceRule {
	return serviceRules()
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
	if !isKnownService(input.ServiceType) {
		return domain.Lead{}, httpx.Validation("Tipe layanan tidak valid", "")
	}
	if input.Budget < 0 {
		return domain.Lead{}, httpx.Validation("Budget tidak valid", "Budget tidak boleh bernilai negatif.")
	}
	if input.ServiceType == domain.ServiceCustomSoftware && input.Budget == 0 && len(input.NeedSummary) < 30 {
		return domain.Lead{}, httpx.Validation("Discovery custom software belum cukup", "Jika budget belum diketahui, isi ringkasan kebutuhan minimal 30 karakter.")
	}

	status, score, note := qualifyLead(input)
	return s.store.CreateLead(ctx, store.CreateLeadInput{
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
}

func (s *LeadService) UpdateLeadStatus(ctx context.Context, leadID string, actorID string, input UpdateLeadStatusInput) (domain.LeadWithPartner, error) {
	if !isKnownStatus(input.Status) {
		return domain.LeadWithPartner{}, httpx.Validation("Status lead tidak valid", "")
	}

	lead, err := s.store.UpdateLeadStatus(ctx, leadID, actorID, input.Status, strings.TrimSpace(input.Note))
	if err != nil {
		return domain.LeadWithPartner{}, mapStoreError(err)
	}
	return lead, nil
}

func serviceRules() []domain.ServiceRule {
	return []domain.ServiceRule{
		{
			Type:              domain.ServiceCompanyProfile,
			Label:             "Company Profile",
			Description:       "Profil bisnis, landing page kredibilitas, showcase layanan, dan funnel kontak.",
			MinimumBudget:     10_000_000,
			RequiresDiscovery: false,
		},
		{
			Type:              domain.ServiceWebsiteApp,
			Label:             "Website atau Aplikasi Sederhana",
			Description:       "Portal ringan, katalog, booking, dashboard dasar, atau integrasi standar.",
			MinimumBudget:     15_000_000,
			RequiresDiscovery: false,
		},
		{
			Type:              domain.ServiceCustomSoftware,
			Label:             "Custom Software / ERP",
			Description:       "Sistem kompleks dengan discovery proses bisnis, modul, integrasi, dan risiko delivery.",
			MinimumBudget:     25_000_000,
			RequiresDiscovery: true,
		},
		{
			Type:              domain.ServiceSalesView,
			Label:             "SalesView",
			Description:       "Produk pipeline dan tracking aktivitas sales dengan referral code mitra.",
			MinimumBudget:     0,
			RequiresDiscovery: false,
		},
	}
}

func qualifyLead(input LeadInput) (domain.LeadStatus, int, string) {
	rules := map[domain.ServiceType]domain.ServiceRule{}
	for _, rule := range serviceRules() {
		rules[rule.Type] = rule
	}

	rule := rules[input.ServiceType]
	if input.ServiceType == domain.ServiceCustomSoftware && input.Budget == 0 {
		return domain.LeadStatusSubmitted, 72, "Budget belum diketahui, tetapi kebutuhan cukup untuk discovery awal."
	}

	if rule.MinimumBudget > 0 && input.Budget < rule.MinimumBudget {
		return domain.LeadStatusRejected, 32, "Budget di bawah kriteria minimum untuk layanan ini."
	}

	if input.ServiceType == domain.ServiceCustomSoftware && len(input.NeedSummary) >= 30 {
		return domain.LeadStatusQualified, 90, "Lead kompleks memenuhi kriteria discovery dan estimasi budget."
	}

	if input.ServiceType == domain.ServiceSalesView {
		return domain.LeadStatusQualified, 78, "Lead produk siap ditindaklanjuti memakai referral code."
	}

	return domain.LeadStatusQualified, 84, "Lead memenuhi kriteria budget minimum."
}

func isKnownService(serviceType domain.ServiceType) bool {
	for _, rule := range serviceRules() {
		if rule.Type == serviceType {
			return true
		}
	}
	return false
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
