package service

import (
	"context"
	"errors"
	"regexp"
	"strings"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/httpx"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
)

var serviceTypePattern = regexp.MustCompile(`^[a-z0-9_]{3,48}$`)

type ServiceCatalogService struct {
	store *store.Store
}

type ServiceRuleInput struct {
	Type              domain.ServiceType `json:"type"`
	Label             string             `json:"label"`
	Description       string             `json:"description"`
	MinimumBudget     int64              `json:"minimumBudget"`
	RequiresDiscovery bool               `json:"requiresDiscovery"`
	IsActive          bool               `json:"isActive"`
}

func NewServiceCatalogService(repository *store.Store) *ServiceCatalogService {
	return &ServiceCatalogService{store: repository}
}

func (s *ServiceCatalogService) List(ctx context.Context, includeInactive bool) ([]domain.ServiceRule, error) {
	return s.store.ListServiceCatalog(ctx, includeInactive)
}

func (s *ServiceCatalogService) Upsert(ctx context.Context, input ServiceRuleInput) (domain.ServiceRule, error) {
	input.Type = domain.ServiceType(strings.ToLower(strings.TrimSpace(string(input.Type))))
	input.Label = strings.TrimSpace(input.Label)
	input.Description = strings.TrimSpace(input.Description)

	if !serviceTypePattern.MatchString(string(input.Type)) {
		return domain.ServiceRule{}, httpx.Validation("Kode layanan tidak valid", "Gunakan huruf kecil, angka, dan underscore")
	}
	if input.Label == "" {
		return domain.ServiceRule{}, httpx.Validation("Nama layanan wajib diisi", "")
	}
	if input.MinimumBudget < 0 {
		return domain.ServiceRule{}, httpx.Validation("Budget minimum tidak valid", "Budget minimum tidak boleh negatif")
	}

	return s.store.UpsertServiceRule(ctx, store.ServiceRuleInput{
		Type:              input.Type,
		Label:             input.Label,
		Description:       input.Description,
		MinimumBudget:     input.MinimumBudget,
		RequiresDiscovery: input.RequiresDiscovery,
		IsActive:          input.IsActive,
	})
}

func (s *ServiceCatalogService) Delete(ctx context.Context, serviceType domain.ServiceType) error {
	serviceType = domain.ServiceType(strings.ToLower(strings.TrimSpace(string(serviceType))))
	if !serviceTypePattern.MatchString(string(serviceType)) {
		return httpx.Validation("Kode layanan tidak valid", "")
	}

	if err := s.store.DeleteServiceRule(ctx, serviceType); err != nil {
		if errors.Is(err, store.ErrNotFound) {
			return httpx.NotFound("Layanan tidak ditemukan")
		}
		return err
	}
	return nil
}
