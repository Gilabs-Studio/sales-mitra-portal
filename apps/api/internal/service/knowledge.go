package service

import (
	"context"
	"strings"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/httpx"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
)

type KnowledgeService struct {
	store *store.Store
}

type ChatbotInput struct {
	Question string `json:"question"`
}

type ChatbotAnswer struct {
	Answer          string                    `json:"answer"`
	MatchedArticles []domain.KnowledgeArticle `json:"matchedArticles"`
}

func NewKnowledgeService(repository *store.Store) *KnowledgeService {
	return &KnowledgeService{store: repository}
}

func (s *KnowledgeService) Ask(ctx context.Context, input ChatbotInput) (ChatbotAnswer, error) {
	question := strings.ToLower(strings.TrimSpace(input.Question))
	if question == "" {
		return ChatbotAnswer{}, httpx.Validation("Pertanyaan wajib diisi", "")
	}

	articles, err := s.store.ListKnowledge(ctx)
	if err != nil {
		return ChatbotAnswer{}, err
	}

	matches := []domain.KnowledgeArticle{}
	for _, article := range articles {
		searchText := strings.ToLower(article.Title + " " + article.Category + " " + article.Content)
		if containsSignal(question, searchText) {
			matches = append(matches, article)
		}
	}
	if len(matches) == 0 {
		matches = articles
	}
	if len(matches) > 2 {
		matches = matches[:2]
	}

	answer := buildAnswer(question, matches)
	return ChatbotAnswer{Answer: answer, MatchedArticles: matches}, nil
}

func containsSignal(question string, content string) bool {
	signals := strings.Fields(question)
	for _, signal := range signals {
		if len(signal) < 4 {
			continue
		}
		if strings.Contains(content, signal) {
			return true
		}
	}
	return false
}

func buildAnswer(question string, articles []domain.KnowledgeArticle) string {
	if strings.Contains(question, "budget") || strings.Contains(question, "harga") || strings.Contains(question, "pricing") {
		return "Untuk kualifikasi awal: Company Profile minimal Rp10 juta, Website/Aplikasi sederhana minimal Rp15 juta, dan Custom Software/ERP idealnya mulai Rp25 juta atau wajib punya ringkasan kebutuhan discovery jika budget belum jelas."
	}
	if strings.Contains(question, "referral") || strings.Contains(question, "salesview") {
		return "Mitra mendapat referral code untuk produk seperti SalesView. Lead dan penggunaan referral dapat dipantau dari dashboard mitra agar tim internal tetap fokus pada follow-up dan closing."
	}
	if strings.Contains(question, "custom") || strings.Contains(question, "erp") {
		return "Untuk Custom Software atau ERP, kumpulkan proses bisnis, modul yang dibutuhkan, integrasi, timeline, stakeholder, dan risiko. Jika budget belum diketahui, sistem tetap menerima lead sebagai submitted untuk discovery."
	}

	if len(articles) == 0 {
		return "Saya belum menemukan artikel yang cocok. Coba tanyakan soal layanan GiLabs, budget minimum, referral code, SalesView, atau cara submit lead."
	}
	return "Berdasarkan knowledge center, " + articles[0].Content
}
