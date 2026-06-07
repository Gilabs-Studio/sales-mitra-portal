package seeder

import (
	"context"
	"fmt"
	"strings"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
)

func (r *Runner) SeedAuth(ctx context.Context, cfg config.Config) error {
	if strings.TrimSpace(cfg.AdminPassword) == "" {
		return fmt.Errorf("ADMIN_PASSWORD wajib diisi untuk seeder super admin")
	}
	if err := r.authService.EnsureUser(ctx, cfg.AdminName, cfg.AdminUsername, cfg.AdminEmail, cfg.AdminPassword, domain.RoleSuperAdmin); err != nil {
		return err
	}
	if strings.TrimSpace(cfg.DemoPartnerPass) == "" {
		return nil
	}
	return r.authService.EnsureUser(ctx, cfg.DemoPartnerName, "", cfg.DemoPartnerEmail, cfg.DemoPartnerPass, domain.RolePartner)
}
