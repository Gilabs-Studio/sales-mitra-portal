package seeder

import (
	"context"
	"fmt"
	"time"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/service"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
)

type Runner struct {
	store       *store.Store
	authService *service.AuthService
}

func New(repository *store.Store, authService *service.AuthService) *Runner {
	return &Runner{store: repository, authService: authService}
}

func (r *Runner) Run(ctx context.Context, cfg config.Config) error {
	if cfg.RunCleanup {
		if err := r.store.Cleanup(ctx); err != nil {
			return fmt.Errorf("cleanup database: %w", err)
		}
	}
	if cfg.RunSeeder {
		if err := r.SeedAuth(ctx, cfg); err != nil {
			return err
		}
		if err := r.store.SeedKnowledge(ctx); err != nil {
			return err
		}
		if err := r.store.SeedServiceCatalog(ctx, defaultServiceCatalog()); err != nil {
			return err
		}
	}
	return nil
}

func defaultServiceCatalog() []domain.ServiceRule {
	now := time.Now().UTC()
	return []domain.ServiceRule{
		{
			Type:              domain.ServiceCompanyProfile,
			Label:             "Company Profile",
			Description:       "Profil bisnis, landing page kredibilitas, showcase layanan, dan funnel kontak",
			MinimumBudget:     10_000_000,
			RequiresDiscovery: false,
			IsActive:          true,
			CreatedAt:         now,
			UpdatedAt:         now,
		},
		{
			Type:              domain.ServiceWebsiteApp,
			Label:             "Website atau Aplikasi Sederhana",
			Description:       "Portal ringan, katalog, booking, dashboard dasar, dan integrasi standar",
			MinimumBudget:     15_000_000,
			RequiresDiscovery: false,
			IsActive:          true,
			CreatedAt:         now,
			UpdatedAt:         now,
		},
		{
			Type:              domain.ServiceCustomSoftware,
			Label:             "Custom Software / ERP",
			Description:       "Sistem kompleks dengan discovery proses bisnis, modul, integrasi, timeline, dan risiko delivery",
			MinimumBudget:     25_000_000,
			RequiresDiscovery: true,
			IsActive:          true,
			CreatedAt:         now,
			UpdatedAt:         now,
		},
		{
			Type:              domain.ServiceSalesView,
			Label:             "SalesView",
			Description:       "Produk pipeline dan tracking aktivitas sales dengan referral code mitra",
			MinimumBudget:     0,
			RequiresDiscovery: false,
			IsActive:          true,
			CreatedAt:         now,
			UpdatedAt:         now,
		},
		{
			Type:              domain.ServiceOther,
			Label:             "Lainnya",
			Description:       "Kebutuhan IT lain yang perlu dikualifikasi melalui ringkasan kebutuhan dan estimasi awal",
			MinimumBudget:     0,
			RequiresDiscovery: true,
			IsActive:          true,
			CreatedAt:         now,
			UpdatedAt:         now,
		},
	}
}
