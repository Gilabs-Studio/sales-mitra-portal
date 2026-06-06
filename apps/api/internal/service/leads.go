package service

import (
	"context"
	"errors"
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

func qualifyLead(input LeadInput, rule domain.ServiceRule) (domain.LeadStatus, int, string) {
	if rule.RequiresDiscovery && input.Budget == 0 {
		return domain.LeadStatusSubmitted, 72, "Budget belum diketahui, tetapi kebutuhan cukup untuk discovery awal"
	}

	if rule.MinimumBudget > 0 && input.Budget < rule.MinimumBudget {
		return domain.LeadStatusRejected, 32, "Budget di bawah kriteria minimum untuk layanan ini"
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
