package server

import (
	"strconv"
	"strings"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/httpx"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/service"
	"github.com/gin-gonic/gin"
)

func (h Handler) adminClients(c *gin.Context) {
	page, pageSize := pageParams(c)
	clients, total, err := h.store.ListClientsWithStats(c.Request.Context(), pageSize, (page-1)*pageSize)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar client", gin.H{
		"data":       clients,
		"total":      total,
		"page":       page,
		"pageSize":   pageSize,
		"totalPages": ceilDiv(total, pageSize),
	})
}

func (h Handler) createClient(c *gin.Context) {
	var input service.CreateClientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload client tidak valid", err.Error()))
		return
	}

	client, err := h.clientService.CreateClient(c.Request.Context(), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, "Client berhasil dibuat", client)
}

func (h Handler) sendClientInvitation(c *gin.Context) {
	if err := h.clientService.SendClientInvitation(c.Request.Context(), c.Param("id")); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Invitation/reset akses client dikirim", gin.H{})
}

func (h Handler) adminClientProjects(c *gin.Context) {
	projects, err := h.store.ListClientProjects(c.Request.Context(), strings.TrimSpace(c.Query("clientId")))
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar project client", projects)
}

func (h Handler) createClientProject(c *gin.Context) {
	var input service.ProjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload project tidak valid", err.Error()))
		return
	}
	project, err := h.clientService.CreateProject(c.Request.Context(), currentUser(c), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, "Project client berhasil dibuat", project)
}

func (h Handler) updateClientProject(c *gin.Context) {
	var input service.ProjectInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload project tidak valid", err.Error()))
		return
	}
	project, err := h.clientService.UpdateProject(c.Request.Context(), currentUser(c), c.Param("id"), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Project client diperbarui", project)
}

func (h Handler) adminClientProjectDetail(c *gin.Context) {
	detail, err := h.store.GetClientProjectDetail(c.Request.Context(), c.Param("id"), "")
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Detail project client", detail)
}

func (h Handler) createProjectProgress(c *gin.Context) {
	var input service.ProgressInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload progress tidak valid", err.Error()))
		return
	}
	progress, err := h.clientService.CreateProgress(c.Request.Context(), currentUser(c), c.Param("id"), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, "Progress project disimpan", progress)
}

func (h Handler) createProjectDocument(c *gin.Context) {
	var input service.DocumentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload dokumen tidak valid", err.Error()))
		return
	}
	doc, err := h.clientService.CreateDocument(c.Request.Context(), currentUser(c), c.Param("id"), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, "Dokumen project disimpan", doc)
}

func (h Handler) upsertMaintenancePlan(c *gin.Context) {
	var input service.MaintenancePlanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload maintenance tidak valid", err.Error()))
		return
	}
	plan, err := h.clientService.UpsertMaintenancePlan(c.Request.Context(), currentUser(c), c.Param("id"), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Paket maintenance disimpan", plan)
}

func (h Handler) createMaintenanceLog(c *gin.Context) {
	var input service.MaintenanceLogInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload audit maintenance tidak valid", err.Error()))
		return
	}
	log, err := h.clientService.CreateMaintenanceLog(c.Request.Context(), currentUser(c), c.Param("id"), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, "Audit maintenance disimpan", log)
}

func (h Handler) createProjectInvoice(c *gin.Context) {
	var input service.InvoiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload invoice tidak valid", err.Error()))
		return
	}
	invoice, err := h.clientService.CreateInvoice(c.Request.Context(), currentUser(c), c.Param("id"), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, "Invoice disimpan", invoice)
}

func (h Handler) updateProjectInvoice(c *gin.Context) {
	var input service.InvoiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		httpx.Fail(c, httpx.BadRequest("Payload invoice tidak valid", err.Error()))
		return
	}
	invoice, err := h.clientService.UpdateInvoice(c.Request.Context(), currentUser(c), c.Param("id"), input)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Invoice diperbarui", invoice)
}

func (h Handler) clientDashboard(c *gin.Context) {
	dashboard, err := h.store.GetClientDashboard(c.Request.Context(), currentUser(c).ID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Dashboard client", dashboard)
}

func (h Handler) clientProjects(c *gin.Context) {
	projects, err := h.store.ListClientProjects(c.Request.Context(), currentUser(c).ID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Daftar project client", projects)
}

func (h Handler) clientProjectDetail(c *gin.Context) {
	detail, err := h.store.GetClientProjectDetail(c.Request.Context(), c.Param("id"), currentUser(c).ID)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, "Detail project client", detail)
}

func pageParams(c *gin.Context) (int, int) {
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "20"))
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	return page, pageSize
}
