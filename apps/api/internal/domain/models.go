package domain

import "time"

type Role string

const (
	RoleSuperAdmin Role = "super_admin"
	RoleAdmin      Role = "admin"
	RolePartner    Role = "partner"
	RoleClient     Role = "client"
)

func (r Role) IsAdminScope() bool {
	return r == RoleSuperAdmin || r == RoleAdmin
}

func (r Role) IsValid() bool {
	return r == RoleSuperAdmin || r == RoleAdmin || r == RolePartner || r == RoleClient
}

func (r Role) OperationalRole() Role {
	if r.IsAdminScope() {
		return RoleAdmin
	}
	return r
}

func (r Role) IsClientScope() bool {
	return r == RoleClient
}

type ProjectStatus string

const (
	ProjectStatusDiscovery   ProjectStatus = "discovery"
	ProjectStatusPlanning    ProjectStatus = "planning"
	ProjectStatusDevelopment ProjectStatus = "development"
	ProjectStatusTesting     ProjectStatus = "testing"
	ProjectStatusDeployment  ProjectStatus = "deployment"
	ProjectStatusCompleted   ProjectStatus = "completed"
	ProjectStatusMaintenance ProjectStatus = "maintenance"
)

type ProgressStatus string

const (
	ProgressStatusTodo       ProgressStatus = "todo"
	ProgressStatusInProgress ProgressStatus = "in_progress"
	ProgressStatusBlocked    ProgressStatus = "blocked"
	ProgressStatusDone       ProgressStatus = "done"
)

type MaintenanceStatus string

const (
	MaintenanceStatusOpen       MaintenanceStatus = "open"
	MaintenanceStatusInProgress MaintenanceStatus = "in_progress"
	MaintenanceStatusResolved   MaintenanceStatus = "resolved"
	MaintenanceStatusRejected   MaintenanceStatus = "rejected"
)

type InvoiceStatus string

const (
	InvoiceStatusDraft          InvoiceStatus = "draft"
	InvoiceStatusSent           InvoiceStatus = "sent"
	InvoiceStatusWaitingPayment InvoiceStatus = "waiting_payment"
	InvoiceStatusPaid           InvoiceStatus = "paid"
	InvoiceStatusOverdue        InvoiceStatus = "overdue"
)

type DocumentCategory string

const (
	DocumentCategoryDeliverable DocumentCategory = "deliverable"
	DocumentCategoryProgress    DocumentCategory = "progress"
	DocumentCategoryMaintenance DocumentCategory = "maintenance"
	DocumentCategoryInvoice     DocumentCategory = "invoice"
	DocumentCategoryReport      DocumentCategory = "report"
	DocumentCategoryOther       DocumentCategory = "other"
)

type ServiceType string

const (
	ServiceCompanyProfile ServiceType = "company_profile"
	ServiceWebsiteApp     ServiceType = "website_app"
	ServiceCustomSoftware ServiceType = "custom_software"
	ServiceSalesView      ServiceType = "salesview"
	ServiceOther          ServiceType = "other"
)

type LeadStatus string

const (
	LeadStatusSubmitted LeadStatus = "submitted"
	LeadStatusQualified LeadStatus = "qualified"
	LeadStatusContacted LeadStatus = "contacted"
	LeadStatusWon       LeadStatus = "won"
	LeadStatusLost      LeadStatus = "lost"
	LeadStatusRejected  LeadStatus = "rejected"
)

type User struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	Username        string    `json:"username"`
	Email           string    `json:"email"`
	Role            Role      `json:"role"`
	PartnerCode     string    `json:"partnerCode"`
	IsSuspended     bool      `json:"isSuspended"`
	SuspendedReason string    `json:"suspendedReason"`
	SuspendedAt     time.Time `json:"suspendedAt,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
}

type ClientProject struct {
	ID                 string        `json:"id"`
	ClientID           string        `json:"clientId"`
	ClientName         string        `json:"clientName,omitempty"`
	ClientEmail        string        `json:"clientEmail,omitempty"`
	Name               string        `json:"name"`
	Description        string        `json:"description"`
	PICName            string        `json:"picName"`
	PICEmail           string        `json:"picEmail"`
	StartDate          time.Time     `json:"startDate"`
	TargetEndDate      time.Time     `json:"targetEndDate"`
	Status             ProjectStatus `json:"status"`
	ProgressPercent    int           `json:"progressPercent"`
	WebsiteURL         string        `json:"websiteUrl"`
	StagingURL         string        `json:"stagingUrl"`
	CredentialNote     string        `json:"credentialNote"`
	DocumentationURL   string        `json:"documentationUrl"`
	MaintenanceActive  bool          `json:"maintenanceActive"`
	UnpaidInvoiceCount int64         `json:"unpaidInvoiceCount"`
	LatestProgressNote string        `json:"latestProgressNote"`
	LatestProgressAt   time.Time     `json:"latestProgressAt"`
	CreatedAt          time.Time     `json:"createdAt"`
	UpdatedAt          time.Time     `json:"updatedAt"`
}

type ProjectProgress struct {
	ID          string         `json:"id"`
	ProjectID   string         `json:"projectId"`
	Title       string         `json:"title"`
	Status      ProgressStatus `json:"status"`
	Percentage  int            `json:"percentage"`
	Note        string         `json:"note"`
	DocumentURL string         `json:"documentUrl"`
	UpdatedByID string         `json:"updatedById"`
	UpdatedBy   string         `json:"updatedBy"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
}

type ProjectDocument struct {
	ID          string           `json:"id"`
	ProjectID   string           `json:"projectId"`
	Title       string           `json:"title"`
	Category    DocumentCategory `json:"category"`
	URL         string           `json:"url"`
	Description string           `json:"description"`
	UploadedBy  string           `json:"uploadedBy"`
	CreatedAt   time.Time        `json:"createdAt"`
}

type MaintenancePlan struct {
	ID             string    `json:"id"`
	ProjectID      string    `json:"projectId"`
	Type           string    `json:"type"`
	PeriodStart    time.Time `json:"periodStart"`
	PeriodEnd      time.Time `json:"periodEnd"`
	QuotaTotal     int       `json:"quotaTotal"`
	QuotaUsed      int       `json:"quotaUsed"`
	QuotaRemaining int       `json:"quotaRemaining"`
	IsActive       bool      `json:"isActive"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

type MaintenanceLog struct {
	ID          string            `json:"id"`
	ProjectID   string            `json:"projectId"`
	RequestDate time.Time         `json:"requestDate"`
	Description string            `json:"description"`
	Status      MaintenanceStatus `json:"status"`
	PICName     string            `json:"picName"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
}

type ProjectInvoice struct {
	ID          string        `json:"id"`
	ProjectID   string        `json:"projectId"`
	Number      string        `json:"number"`
	Amount      int64         `json:"amount"`
	Status      InvoiceStatus `json:"status"`
	IssuedAt    time.Time     `json:"issuedAt"`
	DueAt       time.Time     `json:"dueAt"`
	PaidAt      time.Time     `json:"paidAt"`
	DocumentURL string        `json:"documentUrl"`
	PaymentNote string        `json:"paymentNote"`
	CreatedAt   time.Time     `json:"createdAt"`
	UpdatedAt   time.Time     `json:"updatedAt"`
}

type ProjectActivity struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"projectId"`
	ActorID     string    `json:"actorId"`
	ActorName   string    `json:"actorName"`
	Action      string    `json:"action"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
}

type ClientDashboard struct {
	Summary        []MetricCard      `json:"summary"`
	Projects       []ClientProject   `json:"projects"`
	Maintenance    []MaintenancePlan `json:"maintenance"`
	UnpaidInvoices []ProjectInvoice  `json:"unpaidInvoices"`
	Notifications  []ProjectActivity `json:"notifications"`
}

type ClientProjectDetail struct {
	Project         ClientProject     `json:"project"`
	Progress        []ProjectProgress `json:"progress"`
	Documents       []ProjectDocument `json:"documents"`
	Maintenance     *MaintenancePlan  `json:"maintenance,omitempty"`
	MaintenanceLogs []MaintenanceLog  `json:"maintenanceLogs"`
	Invoices        []ProjectInvoice  `json:"invoices"`
	Activities      []ProjectActivity `json:"activities"`
	Reports         []ProjectDocument `json:"reports"`
}

type ClientWithStats struct {
	User
	TotalProjects       int64 `json:"totalProjects"`
	ActiveProjects      int64 `json:"activeProjects"`
	MaintenanceProjects int64 `json:"maintenanceProjects"`
	UnpaidInvoices      int64 `json:"unpaidInvoices"`
}

type UserAuth struct {
	User
	PasswordHash string
}

type ServiceRule struct {
	Type              ServiceType `json:"type"`
	Label             string      `json:"label"`
	Description       string      `json:"description"`
	MinimumBudget     int64       `json:"minimumBudget"`
	RequiresDiscovery bool        `json:"requiresDiscovery"`
	IsActive          bool        `json:"isActive"`
	CreatedAt         time.Time   `json:"createdAt"`
	UpdatedAt         time.Time   `json:"updatedAt"`
}

type Lead struct {
	ID                 string      `json:"id"`
	PartnerID          string      `json:"partnerId"`
	CompanyName        string      `json:"companyName"`
	ContactName        string      `json:"contactName"`
	ContactEmail       string      `json:"contactEmail"`
	ContactPhone       string      `json:"contactPhone"`
	ServiceType        ServiceType `json:"serviceType"`
	Budget             int64       `json:"budget"`
	NeedSummary        string      `json:"needSummary"`
	Notes              string      `json:"notes"`
	Status             LeadStatus  `json:"status"`
	QualificationScore int         `json:"qualificationScore"`
	QualificationNote  string      `json:"qualificationNote"`
	UnreadCount        int         `json:"unreadCount"`
	MessageCount       int         `json:"messageCount"`
	MeetingMessage     string      `json:"meetingMessage"`
	CommissionRate     float64     `json:"commissionRate"`
	DealAmount         int64       `json:"dealAmount"`
	CreatedAt          time.Time   `json:"createdAt"`
	UpdatedAt          time.Time   `json:"updatedAt"`
}

type LeadWithPartner struct {
	Lead
	PartnerName      string `json:"partnerName"`
	PartnerEmail     string `json:"partnerEmail"`
	PartnerCode      string `json:"partnerCode"`
	PartnerSuspended bool   `json:"partnerSuspended"`
	UnreadCount      int    `json:"unreadCount"`
	MessageCount     int    `json:"messageCount"`
	MeetingMessage   string `json:"meetingMessage"`
}

type LeadEvent struct {
	ID        string     `json:"id"`
	LeadID    string     `json:"leadId"`
	ActorID   string     `json:"actorId"`
	ActorName string     `json:"actorName"`
	Status    LeadStatus `json:"status"`
	Note      string     `json:"note"`
	CreatedAt time.Time  `json:"createdAt"`
}

type LeadMessage struct {
	ID         string    `json:"id"`
	LeadID     string    `json:"leadId"`
	SenderID   string    `json:"senderId"`
	SenderName string    `json:"senderName"`
	SenderRole string    `json:"senderRole"`
	Message    string    `json:"message"`
	IsRead     bool      `json:"isRead"`
	CreatedAt  time.Time `json:"createdAt"`
}

type Referral struct {
	ID         string    `json:"id"`
	PartnerID  string    `json:"partnerId"`
	Product    string    `json:"product"`
	Code       string    `json:"code"`
	UsageCount int       `json:"usageCount"`
	CreatedAt  time.Time `json:"createdAt"`
}

type KnowledgeArticle struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Category  string    `json:"category"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type MetricCard struct {
	Label string `json:"label"`
	Value int64  `json:"value"`
}

type BreakdownItem struct {
	Key   string `json:"key"`
	Label string `json:"label"`
	Count int64  `json:"count"`
}

type PartnerDashboard struct {
	Summary          []MetricCard    `json:"summary"`
	StatusBreakdown  []BreakdownItem `json:"statusBreakdown"`
	ServiceBreakdown []BreakdownItem `json:"serviceBreakdown"`
	RecentLeads      []Lead          `json:"recentLeads"`
	Referrals        []Referral      `json:"referrals"`
}

type AdminDashboard struct {
	Summary          []MetricCard      `json:"summary"`
	StatusBreakdown  []BreakdownItem   `json:"statusBreakdown"`
	ServiceBreakdown []BreakdownItem   `json:"serviceBreakdown"`
	RecentLeads      []LeadWithPartner `json:"recentLeads"`
}

type PartnerWithStats struct {
	User
	TotalLeads     int64 `json:"totalLeads"`
	QualifiedLeads int64 `json:"qualifiedLeads"`
	WonLeads       int64 `json:"wonLeads"`
	RejectedLeads  int64 `json:"rejectedLeads"`
}

type LeadPayout struct {
	ID             string    `json:"id"`
	LeadID         string    `json:"leadId"`
	AmountPaid     int64     `json:"amountPaid"`
	CommissionPaid int64     `json:"commissionPaid"`
	EvidenceURL    string    `json:"evidenceUrl"`
	CreatedAt      time.Time `json:"createdAt"`
}

type PayoutSummary struct {
	CommissionRate      float64 `json:"commissionRate"`
	DealAmount          int64   `json:"dealAmount"`
	TotalCommission     int64   `json:"totalCommission"`
	ClientPaid          int64   `json:"clientPaid"`
	PartnerPayout       int64   `json:"partnerPayout"`
	PayoutProgress      float64 `json:"payoutProgress"`
	RemainingCommission int64   `json:"remainingCommission"`
}
