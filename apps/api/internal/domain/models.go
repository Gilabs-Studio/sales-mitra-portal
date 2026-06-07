package domain

import "time"

type Role string

const (
	RoleSuperAdmin Role = "super_admin"
	RoleAdmin      Role = "admin"
	RolePartner    Role = "partner"
)

func (r Role) IsAdminScope() bool {
	return r == RoleSuperAdmin || r == RoleAdmin
}

func (r Role) IsValid() bool {
	return r == RoleSuperAdmin || r == RoleAdmin || r == RolePartner
}

func (r Role) OperationalRole() Role {
	if r.IsAdminScope() {
		return RoleAdmin
	}
	return r
}

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
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	Role        Role      `json:"role"`
	PartnerCode string    `json:"partnerCode"`
	CreatedAt   time.Time `json:"createdAt"`
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
	PartnerName    string `json:"partnerName"`
	PartnerEmail   string `json:"partnerEmail"`
	PartnerCode    string `json:"partnerCode"`
	UnreadCount    int    `json:"unreadCount"`
	MessageCount   int    `json:"messageCount"`
	MeetingMessage string `json:"meetingMessage"`
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
