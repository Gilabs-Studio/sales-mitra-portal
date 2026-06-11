package server

import (
	"net/http"
	"net/url"
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
	catalogService   *service.ServiceCatalogService
	clientService    *service.ClientPortalService
	uploadService    *service.UploadService
}

func NewRouter(
	cfg config.Config,
	repository *store.Store,
	authService *service.AuthService,
	leadService *service.LeadService,
	knowledgeService *service.KnowledgeService,
	catalogService *service.ServiceCatalogService,
	clientService *service.ClientPortalService,
) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(securityHeaders())
	router.Use(limitRequestBody(10 << 20))

	allowedOrigins := append([]string{}, cfg.WebOrigins...)
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{},
		AllowOriginWithContextFunc: func(c *gin.Context, origin string) bool {
			return isAllowedOrigin(origin, allowedOrigins)
		},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPatch, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	handler := Handler{
		store:            repository,
		authService:      authService,
		leadService:      leadService,
		knowledgeService: knowledgeService,
		catalogService:   catalogService,
		clientService:    clientService,
		uploadService:    service.NewUploadService(cfg),
	}

	api := router.Group("/api/v1")
	api.GET("/health", handler.health)
	api.GET("/catalog/services", handler.serviceCatalog)
	api.POST("/auth/register", handler.register)
	api.POST("/auth/login", handler.login)
	api.POST("/auth/password-reset/request", handler.requestPasswordReset)
	api.POST("/auth/password-reset/confirm", handler.confirmPasswordReset)

	protected := api.Group("")
	protected.Use(handler.requireAuth())
	protected.GET("/me", handler.me)
	protected.POST("/me/password-change", handler.changePassword)
	protected.POST("/me/password-reset", handler.requestCurrentUserPasswordReset)
	protected.GET("/knowledge", handler.knowledge)
	protected.POST("/chatbot/ask", handler.askChatbot)

	partner := protected.Group("/partner")
	partner.Use(requireRole(domain.RolePartner))
	partner.GET("/dashboard", handler.partnerDashboard)
	partner.GET("/leads", handler.partnerLeads)
	partner.POST("/leads", handler.createPartnerLead)
	partner.GET("/leads/:id", handler.partnerLeadDetail)
	partner.GET("/leads/:id/events", handler.leadEvents)
	partner.GET("/leads/:id/messages", handler.listMessages)
	partner.POST("/leads/:id/messages", handler.sendPartnerMessage)
	partner.GET("/leads/:id/ws", handler.wsLeadChat)
	partner.GET("/referrals", handler.partnerReferrals)
	partner.GET("/leads/:id/payouts", handler.getPayouts)

	admin := protected.Group("/admin")
	admin.Use(requireRoles(domain.RoleSuperAdmin, domain.RoleAdmin))
	admin.GET("/dashboard", handler.adminDashboard)
	admin.GET("/leads", handler.adminLeads)
	admin.GET("/leads/:id", handler.adminLeadDetail)
	admin.GET("/leads/:id/events", handler.leadEvents)
	admin.GET("/leads/:id/messages", handler.listMessages)
	admin.POST("/leads/:id/messages", handler.sendAdminMessage)
	admin.GET("/leads/:id/ws", handler.wsLeadChat)
	admin.PATCH("/leads/:id/status", handler.updateLeadStatus)
	admin.GET("/partners", handler.adminPartners)
	admin.GET("/services", handler.adminServices)
	admin.POST("/services", handler.upsertService)
	admin.PATCH("/services/:type", handler.updateService)
	admin.DELETE("/services/:type", handler.deleteService)
	admin.PATCH("/leads/:id/commission", handler.updateLeadCommission)
	admin.POST("/leads/:id/payouts", handler.createPayout)
	admin.GET("/leads/:id/payouts", handler.getPayouts)
	admin.PATCH("/users/:id/suspension", handler.updateUserSuspension)
	admin.GET("/admins", requireRole(domain.RoleSuperAdmin), handler.listAdmins)
	admin.POST("/admins", requireRole(domain.RoleSuperAdmin), handler.createAdmin)
	admin.GET("/clients", handler.adminClients)
	admin.POST("/clients", handler.createClient)
	admin.POST("/clients/:id/invitation", handler.sendClientInvitation)
	admin.GET("/client-projects", handler.adminClientProjects)
	admin.POST("/client-projects", handler.createClientProject)
	admin.GET("/client-projects/:id", handler.adminClientProjectDetail)
	admin.PATCH("/client-projects/:id", handler.updateClientProject)
	admin.POST("/client-projects/:id/progress", handler.createProjectProgress)
	admin.POST("/client-projects/:id/documents", handler.createProjectDocument)
	admin.POST("/client-projects/:id/maintenance", handler.upsertMaintenancePlan)
	admin.POST("/client-projects/:id/maintenance/logs", handler.createMaintenanceLog)
	admin.POST("/client-projects/:id/invoices", handler.createProjectInvoice)
	admin.PATCH("/client-invoices/:id", handler.updateProjectInvoice)

	client := protected.Group("/client")
	client.Use(requireRole(domain.RoleClient))
	client.GET("/dashboard", handler.clientDashboard)
	client.GET("/projects", handler.clientProjects)
	client.GET("/projects/:id", handler.clientProjectDetail)

	router.Static("/uploads", "./data/uploads")

	return router
}

func securityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Next()
	}
}

func limitRequestBody(maxBytes int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxBytes)
		c.Next()
	}
}

func isAllowedOrigin(origin string, allowedOrigins []string) bool {
	if origin == "" {
		return false
	}

	for _, allowedOrigin := range allowedOrigins {
		if origin == allowedOrigin {
			return true
		}
	}

	parsedOrigin, err := url.Parse(origin)
	if err != nil {
		return false
	}

	host := strings.ToLower(parsedOrigin.Hostname())
	switch host {
	case "localhost", "127.0.0.1":
		return true
	default:
		return false
	}
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

func (h Handler) requestPasswordReset(c *gin.Context) {
	var input service.PasswordResetRequestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload reset password tidak valid", err.Error()))
		return
	}

	if err := h.authService.RequestPasswordReset(c.Request.Context(), input); err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Jika email terdaftar, link reset password akan dikirim", gin.H{})
}

func (h Handler) confirmPasswordReset(c *gin.Context) {
	var input service.PasswordResetConfirmInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload konfirmasi reset password tidak valid", err.Error()))
		return
	}

	if err := h.authService.ConfirmPasswordReset(c.Request.Context(), input); err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Password berhasil diperbarui", gin.H{})
}

func (h Handler) me(c *gin.Context) {
	httpx.OK(c, "Profil aktif", currentUser(c))
}

func (h Handler) requestCurrentUserPasswordReset(c *gin.Context) {
	if err := h.authService.RequestPasswordResetForUser(c.Request.Context(), currentUser(c).ID); err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Link reset password telah dikirim ke email akun", gin.H{})
}

func (h Handler) changePassword(c *gin.Context) {
	var input service.ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload ubah password tidak valid", err.Error()))
		return
	}

	if err := h.authService.ChangePassword(c.Request.Context(), currentUser(c).ID, input); err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Password berhasil diperbarui", gin.H{})
}

func (h Handler) serviceCatalog(c *gin.Context) {
	services, err := h.catalogService.List(c.Request.Context(), false)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Katalog layanan", services)
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

	answer, err := h.knowledgeService.Ask(c.Request.Context(), currentUser(c), input)
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
	filters := leadFilters(c)
	leads, total, err := h.store.ListPartnerLeads(c.Request.Context(), user.ID, filters)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar lead mitra", gin.H{
		"data":       leads,
		"total":      total,
		"page":       filters.Offset/normalizePageSize(filters.Limit) + 1,
		"pageSize":   normalizePageSize(filters.Limit),
		"totalPages": ceilDiv(total, normalizePageSize(filters.Limit)),
	})
}

func (h Handler) partnerLeadDetail(c *gin.Context) {
	user := currentUser(c)
	lead, err := h.store.GetLeadByID(c.Request.Context(), c.Param("id"), user.ID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	// Mark admin messages as read when partner opens the detail
	_ = h.store.MarkMessagesRead(c.Request.Context(), c.Param("id"), "partner")
	httpx.OK(c, "Detail lead mitra", lead)
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
	filters := leadFilters(c)
	leads, total, err := h.store.ListAdminLeads(c.Request.Context(), filters)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar lead admin", gin.H{
		"data":       leads,
		"total":      total,
		"page":       filters.Offset/normalizePageSize(filters.Limit) + 1,
		"pageSize":   normalizePageSize(filters.Limit),
		"totalPages": ceilDiv(total, normalizePageSize(filters.Limit)),
	})
}

func (h Handler) adminLeadDetail(c *gin.Context) {
	lead, err := h.store.GetLeadWithPartner(c.Request.Context(), c.Param("id"))
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	// Mark partner messages as read when admin opens the detail
	_ = h.store.MarkMessagesRead(c.Request.Context(), c.Param("id"), "admin")
	httpx.OK(c, "Detail lead admin", lead)
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
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}

	limit := pageSize
	offset := (page - 1) * pageSize

	partners, total, err := h.store.ListPartnersWithStats(c.Request.Context(), limit, offset)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Daftar mitra", gin.H{
		"data":       partners,
		"total":      total,
		"page":       page,
		"pageSize":   pageSize,
		"totalPages": ceilDiv(total, pageSize),
	})
}

func (h Handler) adminServices(c *gin.Context) {
	services, err := h.catalogService.List(c.Request.Context(), true)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar layanan", services)
}

func (h Handler) createAdmin(c *gin.Context) {
	var input service.CreateAdminInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload admin tidak valid", err.Error()))
		return
	}

	user, err := h.authService.CreateAdmin(c.Request.Context(), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.Created(c, "Admin berhasil ditambahkan", user)
}

func (h Handler) listAdmins(c *gin.Context) {
	admins, err := h.store.ListUsersByRoles(c.Request.Context(), domain.RoleSuperAdmin, domain.RoleAdmin)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Daftar admin", admins)
}

func (h Handler) updateUserSuspension(c *gin.Context) {
	var input service.SuspensionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload suspend akun tidak valid", err.Error()))
		return
	}

	if err := h.authService.UpdateUserSuspension(c.Request.Context(), currentUser(c), c.Param("id"), input); err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Status suspend akun diperbarui", gin.H{})
}

func (h Handler) upsertService(c *gin.Context) {
	var input service.ServiceRuleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload layanan tidak valid", err.Error()))
		return
	}

	result, err := h.catalogService.Upsert(c.Request.Context(), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Layanan disimpan", result)
}

func (h Handler) updateService(c *gin.Context) {
	var input service.ServiceRuleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload layanan tidak valid", err.Error()))
		return
	}
	input.Type = domain.ServiceType(c.Param("type"))

	result, err := h.catalogService.Upsert(c.Request.Context(), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Layanan diperbarui", result)
}

func (h Handler) deleteService(c *gin.Context) {
	if err := h.catalogService.Delete(c.Request.Context(), domain.ServiceType(c.Param("type"))); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.NoContent(c, "Layanan dihapus")
}

func (h Handler) requireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := bearerToken(c.GetHeader("Authorization"))
		if token == "" {
			token = c.Query("token")
		}
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

func (h Handler) leadEvents(c *gin.Context) {
	events, err := h.store.ListLeadEvents(c.Request.Context(), c.Param("id"))
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Timeline lead", events)
}

func (h Handler) listMessages(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "15"))
	if limit <= 0 {
		limit = 15
	}
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if offset < 0 {
		offset = 0
	}

	msgs, err := h.store.ListMessages(c.Request.Context(), c.Param("id"), limit, offset)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Pesan lead", msgs)
}

func (h Handler) sendPartnerMessage(c *gin.Context) {
	var body struct {
		Message string `json:"message"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || strings.TrimSpace(body.Message) == "" {
		httpx.Fail(c, httpx.BadRequest("Pesan tidak boleh kosong", ""))
		return
	}
	user := currentUser(c)
	msg, err := h.leadService.SendMessage(c.Request.Context(), c.Param("id"), user, strings.TrimSpace(body.Message))
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	// Broadcast to WebSocket subscribers
	hub.broadcast(c.Param("id"), gin.H{"type": "message", "data": msg})
	httpx.Created(c, "Pesan terkirim", msg)
}

func (h Handler) sendAdminMessage(c *gin.Context) {
	var body struct {
		Message string `json:"message"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || strings.TrimSpace(body.Message) == "" {
		httpx.Fail(c, httpx.BadRequest("Pesan tidak boleh kosong", ""))
		return
	}
	user := currentUser(c)
	msg, err := h.leadService.SendMessage(c.Request.Context(), c.Param("id"), user, strings.TrimSpace(body.Message))
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	// Broadcast to WebSocket subscribers
	hub.broadcast(c.Param("id"), gin.H{"type": "message", "data": msg})
	httpx.Created(c, "Pesan terkirim", msg)
}

func requireRole(role domain.Role) gin.HandlerFunc {
	return requireRoles(role)
}

func requireRoles(roles ...domain.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		user := currentUser(c)
		for _, role := range roles {
			if user.Role == role {
				c.Next()
				return
			}
		}

		if len(roles) == 0 {
			httpx.Fail(c, httpx.Forbidden("Akses tidak sesuai role"))
			c.Abort()
			return
		}

		httpx.Fail(c, httpx.Forbidden("Akses tidak sesuai role"))
		c.Abort()
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
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	// Legacy support for "limit" query param
	limit, _ := strconv.Atoi(c.Query("limit"))
	if limit > 0 {
		pageSize = limit
	}
	return store.LeadFilters{
		Status:      strings.TrimSpace(c.Query("status")),
		ServiceType: strings.TrimSpace(c.Query("serviceType")),
		Limit:       pageSize,
		Offset:      (page - 1) * pageSize,
	}
}

func normalizePageSize(limit int) int {
	if limit <= 0 {
		return 20
	}
	if limit > 100 {
		return 100
	}
	return limit
}

func ceilDiv(a, b int) int {
	if b == 0 {
		return 1
	}
	return (a + b - 1) / b
}

func (h Handler) updateLeadCommission(c *gin.Context) {
	leadID := c.Param("id")

	var input struct {
		DealAmount     int64   `json:"dealAmount"`
		CommissionRate float64 `json:"commissionRate"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload bagi hasil tidak valid", err.Error()))
		return
	}

	if input.DealAmount < 0 {
		httpx.Fail(c, httpx.Validation("Nilai kontrak deal tidak boleh negatif", ""))
		return
	}

	if input.CommissionRate < 0 || input.CommissionRate > 100 {
		httpx.Fail(c, httpx.Validation("Persentase komisi harus di antara 0 dan 100", ""))
		return
	}

	err := h.store.UpdateLeadCommission(c.Request.Context(), leadID, input.DealAmount, input.CommissionRate)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	summary, err := h.store.GetPayoutSummary(c.Request.Context(), leadID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	lead, err := h.store.GetLeadWithPartner(c.Request.Context(), leadID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Komisi bagi hasil diperbarui", gin.H{
		"lead":    lead,
		"summary": summary,
	})
}

func (h Handler) createPayout(c *gin.Context) {
	leadID := c.Param("id")

	lead, err := h.store.GetLeadWithPartner(c.Request.Context(), leadID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	amountPaidStr := c.PostForm("amountPaid")
	amountPaid, err := strconv.ParseInt(amountPaidStr, 10, 64)
	if err != nil || amountPaid <= 0 {
		httpx.Fail(c, httpx.Validation("Nominal bayar tidak valid", "amountPaid harus berupa angka positif"))
		return
	}

	file, err := c.FormFile("evidence")
	if err != nil {
		httpx.Fail(c, httpx.Validation("Bukti bayar wajib diunggah", "evidence file is required"))
		return
	}

	evidenceURL, err := h.uploadService.UploadEvidence(c.Request.Context(), file)
	if err != nil {
		httpx.Fail(c, httpx.Validation("Gagal mengunggah bukti bayar", err.Error()))
		return
	}

	commissionPaid := int64(float64(amountPaid) * (lead.CommissionRate / 100.0))

	payout, err := h.store.CreatePayout(c.Request.Context(), domain.LeadPayout{
		LeadID:         leadID,
		AmountPaid:     amountPaid,
		CommissionPaid: commissionPaid,
		EvidenceURL:    evidenceURL,
	})
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	summary, err := h.store.GetPayoutSummary(c.Request.Context(), leadID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.Created(c, "Payout berhasil dicatat", gin.H{
		"payout":  payout,
		"summary": summary,
	})
}

func (h Handler) getPayouts(c *gin.Context) {
	leadID := c.Param("id")

	payouts, err := h.store.ListPayouts(c.Request.Context(), leadID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	summary, err := h.store.GetPayoutSummary(c.Request.Context(), leadID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, "Daftar payout", gin.H{
		"payouts": payouts,
		"summary": summary,
	})
}
