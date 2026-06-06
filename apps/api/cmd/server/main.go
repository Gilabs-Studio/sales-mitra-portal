package main

import (
	"log"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
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

	authService := service.NewAuthService(repository, cfg)
	if err := authService.SeedDefaultUsers(); err != nil {
		log.Fatalf("seed users: %v", err)
	}

	leadService := service.NewLeadService(repository)
	knowledgeService := service.NewKnowledgeService(repository)

	router := server.NewRouter(cfg, repository, authService, leadService, knowledgeService)
	log.Printf("mitra sales portal api listening on :%s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("run server: %v", err)
	}
}
