package main

import (
	"context"
	"log"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/seeders"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/server"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/service"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
)

func main() {
	cfg := config.Load()

	db, err := store.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	repository := store.New(db)
	if err := repository.Migrate(); err != nil {
		log.Fatalf("migrate database: %v", err)
	}

	notificationService := service.NewNotificationService(cfg)
	authService := service.NewAuthService(repository, cfg, notificationService)
	leadService := service.NewLeadService(repository, cfg, notificationService)
	knowledgeService := service.NewKnowledgeService(repository)
	serviceCatalogService := service.NewServiceCatalogService(repository)

	if err := seeder.New(repository, authService).Run(context.Background(), cfg); err != nil {
		log.Fatalf("run seeders: %v", err)
	}

	router := server.NewRouter(cfg, repository, authService, leadService, knowledgeService, serviceCatalogService)
	log.Printf("mitra sales portal api listening on :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("run server: %v", err)
	}
}
