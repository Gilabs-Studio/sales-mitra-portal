package server

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/domain"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/httpx"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/service"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/store"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const currentUserKey = "currentUser"

type Handler struct {
	store            *store.Store
	authService      *service.AuthService
	leadService      *service.LeadService
	knowledgeService *service.KnowledgeService
}

func NewRouter(
	cfg config.Config,
	repository *store.Store,
	authService *service.AuthService,
	leadService *service.LeadService,
	knowledgeService *service.KnowledgeService,
) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.WebOrigin},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	handler := Handler{
		store:            repository,
		authService:      authService,
		leadService:      leadService,
		knowledgeService: knowledgeService,
	}

	api := router.Group("/api/v1")
	api.GET("/health", handler.health)
	api.GET("/catalog/services", handler.serviceCatalog)
	api.POST("/auth/register", handler.register)
	api.POST("/auth/login", handler.login)

	protected := api.Group("")
	protected.Use(handler.requireAuth())
	protected.GET("/me", handler.me)
	protected.GET("/knowledge", handler.knowledge)
	protected.POST("/chatbot/ask", handler.askChatbot)

	partner := protected.Group("/partner")
	partner.Use(requireRole(domain.RolePartner))
	partner.GET("/dashboard", handler.partnerDashboard)
	partner.GET("/leads", handler.partnerLeads)
	partner.POST("/leads", handler.createPartnerLead)
	partner.GET("/referrals", handler.partnerReferrals)

	admin := protected.Group("/admin")
	admin.Use(requireRole(domain.RoleAdmin))
	admin.GET("/dashboard", handler.adminDashboard)
	admin.GET("/leads", handler.adminLeads)
	admin.PATCH("/leads/:id/status", handler.updateLeadStatus)
	admin.GET("/partners", handler.adminPartners)

	return router
}

func (h Handler) health(c *gin.Context) {
	httpx.OK(c, "API sehat", gin.H{
		"service": "mitra-sales-portal-api",
		"status":  "ok",
	})
}

func (h Handler) register(c *gin.Context) {
	var input service.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload registrasi tidak valid", err.Error()))
		return
	}

	result, err := h.authService.RegisterPartner(c.Request.Context(), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, "Registrasi mitra berhasil", result)
}

func (h Handler) login(c *gin.Context) {
	var input service.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload login tidak valid", err.Error()))
		return
	}

	result, err := h.authService.Login(c.Request.Context(), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Login berhasil", result)
}

func (h Handler) me(c *gin.Context) {
	httpx.OK(c, "Profil aktif", currentUser(c))
}

func (h Handler) serviceCatalog(c *gin.Context) {
	httpx.OK(c, "Katalog layanan", h.leadService.ServiceRules())
}

func (h Handler) knowledge(c *gin.Context) {
	articles, err := h.store.ListKnowledge(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Knowledge center", articles)
}

func (h Handler) askChatbot(c *gin.Context) {
	var input service.ChatbotInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload chatbot tidak valid", err.Error()))
		return
	}

	answer, err := h.knowledgeService.Ask(c.Request.Context(), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Jawaban chatbot", answer)
}

func (h Handler) partnerDashboard(c *gin.Context) {
	user := currentUser(c)
	dashboard, err := h.store.GetPartnerDashboard(c.Request.Context(), user.ID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Dashboard mitra", dashboard)
}

func (h Handler) partnerLeads(c *gin.Context) {
	user := currentUser(c)
	leads, err := h.store.ListPartnerLeads(c.Request.Context(), user.ID, leadFilters(c))
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar lead mitra", leads)
}

func (h Handler) createPartnerLead(c *gin.Context) {
	var input service.LeadInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload lead tidak valid", err.Error()))
		return
	}

	lead, err := h.leadService.CreateLead(c.Request.Context(), currentUser(c).ID, input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, "Lead berhasil dikirim", lead)
}

func (h Handler) partnerReferrals(c *gin.Context) {
	referrals, err := h.store.ListReferrals(c.Request.Context(), currentUser(c).ID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Referral mitra", referrals)
}

func (h Handler) adminDashboard(c *gin.Context) {
	dashboard, err := h.store.GetAdminDashboard(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Dashboard admin", dashboard)
}

func (h Handler) adminLeads(c *gin.Context) {
	leads, err := h.store.ListAdminLeads(c.Request.Context(), leadFilters(c))
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar lead admin", leads)
}

func (h Handler) updateLeadStatus(c *gin.Context) {
	var input service.UpdateLeadStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload status tidak valid", err.Error()))
		return
	}

	lead, err := h.leadService.UpdateLeadStatus(c.Request.Context(), c.Param("id"), currentUser(c).ID, input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Status lead diperbarui", lead)
}

func (h Handler) adminPartners(c *gin.Context) {
	partners, err := h.store.ListPartnersWithStats(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar mitra", partners)
}

func (h Handler) requireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := bearerToken(c.GetHeader("Authorization"))
		if token == "" {
			httpx.Fail(c, httpx.Unauthorized("Authorization bearer token wajib dikirim"))
			c.Abort()
			return
		}

		claims, err := h.authService.ParseToken(token)
		if err != nil {
			httpx.Fail(c, err)
			c.Abort()
			return
		}

		user, err := h.authService.Me(c.Request.Context(), claims.Subject)
		if err != nil {
			httpx.Fail(c, err)
			c.Abort()
			return
		}

		c.Set(currentUserKey, user)
		c.Next()
	}
}

func requireRole(role domain.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := currentUser(c)
		if user.Role != role {
			httpx.Fail(c, httpx.Forbidden("Akses tidak sesuai role"))
			c.Abort()
			return
		}
		c.Next()
	}
}

func currentUser(c *gin.Context) domain.User {
	value, exists := c.Get(currentUserKey)
	if !exists {
		return domain.User{}
	}
	user, ok := value.(domain.User)
	if !ok {
		return domain.User{}
	}
	return user
}

func bearerToken(header string) string {
	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}

func leadFilters(c *gin.Context) store.LeadFilters {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	return store.LeadFilters{
		Status:      strings.TrimSpace(c.Query("status")),
		ServiceType: strings.TrimSpace(c.Query("serviceType")),
		Limit:       limit,
	}
}
