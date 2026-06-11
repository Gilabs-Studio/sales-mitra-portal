package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"slices"
	"strings"
	"time"

	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
)

const resendAPIURL = "https://api.resend.com/emails"

type NotificationService struct {
	apiKey     string
	fromEmail  string
	appBaseURL string
	httpClient *http.Client
}

type notificationEmail struct {
	Subject string
	Text    string
	HTML    string
}

type resendEmailRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Text    string   `json:"text,omitempty"`
	HTML    string   `json:"html,omitempty"`
}

func NewNotificationService(cfg config.Config) *NotificationService {
	return &NotificationService{
		apiKey:     strings.TrimSpace(cfg.ResendAPIKey),
		fromEmail:  strings.TrimSpace(cfg.ResendFromEmail),
		appBaseURL: firstAppOrigin(cfg.WebOrigins, cfg.WebOrigin),
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *NotificationService) Enabled() bool {
	return s != nil && s.apiKey != "" && s.fromEmail != ""
}

func (s *NotificationService) NotifyAdminsNewLead(ctx context.Context, recipients []string, leadTitle string, partnerName string, serviceType string, detailURL string) {
	email := notificationEmail{
		Subject: fmt.Sprintf("Lead baru masuk: %s", leadTitle),
		Text: strings.TrimSpace(fmt.Sprintf(
			"Lead baru masuk dari mitra.\n\nPerusahaan: %s\nMitra: %s\nLayanan: %s\n\nBuka lead: %s",
			leadTitle,
			partnerName,
			serviceType,
			detailURL,
		)),
		HTML: fmt.Sprintf(
			"<p>Lead baru masuk dari mitra.</p><p><strong>Perusahaan:</strong> %s<br /><strong>Mitra:</strong> %s<br /><strong>Layanan:</strong> %s</p><p><a href=\"%s\">Buka detail lead</a></p>",
			html.EscapeString(leadTitle),
			html.EscapeString(partnerName),
			html.EscapeString(serviceType),
			html.EscapeString(detailURL),
		),
	}
	s.sendAsync(ctx, recipients, email)
}

func (s *NotificationService) NotifyPartnerLeadUpdated(ctx context.Context, recipient string, leadTitle string, status string, note string, detailURL string) {
	text := fmt.Sprintf("Lead %s telah diperbarui oleh admin.\n\nStatus terbaru: %s", leadTitle, status)
	if note != "" {
		text += "\nCatatan admin: " + note
	}
	text += "\n\nBuka lead: " + detailURL

	htmlBody := fmt.Sprintf(
		"<p>Lead <strong>%s</strong> telah diperbarui oleh admin.</p><p><strong>Status terbaru:</strong> %s</p>",
		html.EscapeString(leadTitle),
		html.EscapeString(status),
	)
	if note != "" {
		htmlBody += fmt.Sprintf("<p><strong>Catatan admin:</strong><br />%s</p>", html.EscapeString(note))
	}
	htmlBody += fmt.Sprintf("<p><a href=\"%s\">Buka detail lead</a></p>", html.EscapeString(detailURL))

	s.sendAsync(ctx, []string{recipient}, notificationEmail{
		Subject: fmt.Sprintf("Update lead: %s", leadTitle),
		Text:    text,
		HTML:    htmlBody,
	})
}

func (s *NotificationService) NotifyChatMessage(ctx context.Context, recipients []string, leadTitle string, senderName string, senderRole string, message string, detailURL string) {
	email := notificationEmail{
		Subject: fmt.Sprintf("[chat] %s", leadTitle),
		Text: strings.TrimSpace(fmt.Sprintf(
			"Pesan baru pada lead %s.\n\nPengirim: %s (%s)\nPesan: %s\n\nBuka chat: %s",
			leadTitle,
			senderName,
			senderRole,
			message,
			detailURL,
		)),
		HTML: fmt.Sprintf(
			"<p>Pesan baru pada lead <strong>%s</strong>.</p><p><strong>Pengirim:</strong> %s (%s)</p><p><strong>Pesan:</strong><br />%s</p><p><a href=\"%s\">Buka chat lead</a></p>",
			html.EscapeString(leadTitle),
			html.EscapeString(senderName),
			html.EscapeString(senderRole),
			html.EscapeString(message),
			html.EscapeString(detailURL),
		),
	}
	s.sendAsync(ctx, recipients, email)
}

func (s *NotificationService) AdminLeadURL(leadID string) string {
	return joinURL(s.appBaseURL, "/admin/leads/"+leadID)
}

func (s *NotificationService) PartnerLeadURL(leadID string) string {
	return joinURL(s.appBaseURL, "/partner/leads/"+leadID)
}

func (s *NotificationService) PartnerChatURL(leadID string) string {
	return joinURL(s.appBaseURL, "/partner/chat?id="+leadID)
}

func (s *NotificationService) AdminChatURL(leadID string) string {
	return joinURL(s.appBaseURL, "/admin/chat?id="+leadID)
}

func (s *NotificationService) PasswordResetURL(token string) string {
	return joinURL(s.appBaseURL, "/id/reset-password/confirm?token="+token)
}

func (s *NotificationService) NotifyPasswordReset(ctx context.Context, recipient string, resetURL string) {
	email := notificationEmail{
		Subject: "Reset password akun GiLabs",
		Text: strings.TrimSpace(fmt.Sprintf(
			"Kami menerima permintaan reset password untuk akun GiLabs Anda.\n\nBuka link berikut untuk membuat password baru. Link ini hanya dapat dipakai satu kali.\n%s\n\nJika Anda tidak meminta reset password, abaikan email ini.",
			resetURL,
		)),
		HTML: fmt.Sprintf(
			"<p>Kami menerima permintaan reset password untuk akun GiLabs Anda.</p><p><a href=\"%s\">Buat password baru</a></p><p>Link ini hanya dapat dipakai satu kali. Jika Anda tidak meminta reset password, abaikan email ini.</p>",
			html.EscapeString(resetURL),
		),
	}

	s.sendAsync(ctx, []string{recipient}, email)
}

func (s *NotificationService) sendAsync(parent context.Context, recipients []string, email notificationEmail) {
	if !s.Enabled() {
		return
	}
	recipients = normalizeEmails(recipients)
	if len(recipients) == 0 {
		return
	}

	go func() {
		ctx, cancel := context.WithTimeout(context.WithoutCancel(parent), 10*time.Second)
		defer cancel()

		if err := s.send(ctx, recipients, email); err != nil {
			log.Printf("notification send failed: %v", err)
		}
	}()
}

func (s *NotificationService) send(ctx context.Context, recipients []string, email notificationEmail) error {
	payload := resendEmailRequest{
		From:    s.fromEmail,
		To:      recipients,
		Subject: email.Subject,
		Text:    email.Text,
		HTML:    email.HTML,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, resendAPIURL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		var responseBody bytes.Buffer
		_, _ = responseBody.ReadFrom(resp.Body)
		return fmt.Errorf("resend returned %s: %s", resp.Status, strings.TrimSpace(responseBody.String()))
	}

	return nil
}

func firstAppOrigin(origins []string, fallback string) string {
	for _, origin := range origins {
		origin = strings.TrimSpace(origin)
		if origin != "" {
			return strings.TrimRight(origin, "/")
		}
	}
	return strings.TrimRight(strings.TrimSpace(fallback), "/")
}

func joinURL(base string, path string) string {
	base = strings.TrimRight(strings.TrimSpace(base), "/")
	path = strings.TrimSpace(path)
	if base == "" {
		return path
	}
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return base + path
}

func normalizeEmails(values []string) []string {
	emails := make([]string, 0, len(values))
	seen := map[string]struct{}{}

	for _, value := range values {
		email := strings.ToLower(strings.TrimSpace(value))
		if email == "" {
			continue
		}
		if _, exists := seen[email]; exists {
			continue
		}
		seen[email] = struct{}{}
		emails = append(emails, email)
	}

	slices.Sort(emails)
	return emails
}

func (s *NotificationService) NotifyClientProjectProgress(ctx context.Context, recipient string, projectName string, title string, status string, percentage int, notes string, detailURL string) {
	text := fmt.Sprintf("Progres project %s telah diperbarui.\n\nMilestone: %s\nStatus: %s\nPersentase: %d%%\nCatatan: %s\n\nBuka portal: %s", projectName, title, status, percentage, notes, detailURL)
	htmlBody := fmt.Sprintf("<p>Progres project <strong>%s</strong> telah diperbarui.</p><p><strong>Milestone:</strong> %s<br/><strong>Status:</strong> %s<br/><strong>Persentase:</strong> %d%%</p>", html.EscapeString(projectName), html.EscapeString(title), html.EscapeString(status), percentage)
	if notes != "" {
		htmlBody += fmt.Sprintf("<p><strong>Catatan:</strong><br/>%s</p>", html.EscapeString(notes))
	}
	htmlBody += fmt.Sprintf("<p><a href=\"%s\">Buka detail project</a></p>", html.EscapeString(detailURL))

	s.sendAsync(ctx, []string{recipient}, notificationEmail{
		Subject: fmt.Sprintf("Progress Project Update: %s", projectName),
		Text:    text,
		HTML:    htmlBody,
	})
}

func (s *NotificationService) NotifyClientProjectStatus(ctx context.Context, recipient string, projectName string, status string, detailURL string) {
	text := fmt.Sprintf("Status project %s telah diperbarui menjadi %s.\n\nBuka portal: %s", projectName, status, detailURL)
	htmlBody := fmt.Sprintf("<p>Status project <strong>%s</strong> telah diperbarui menjadi <strong>%s</strong>.</p><p><a href=\"%s\">Buka detail project</a></p>", html.EscapeString(projectName), html.EscapeString(status), html.EscapeString(detailURL))

	s.sendAsync(ctx, []string{recipient}, notificationEmail{
		Subject: fmt.Sprintf("Project Status Updated: %s", projectName),
		Text:    text,
		HTML:    htmlBody,
	})
}

func (s *NotificationService) NotifyClientNewDocument(ctx context.Context, recipient string, projectName string, docTitle string, detailURL string) {
	text := fmt.Sprintf("Dokumen baru telah diunggah untuk project %s.\n\nNama Dokumen: %s\n\nBuka portal: %s", projectName, docTitle, detailURL)
	htmlBody := fmt.Sprintf("<p>Dokumen baru telah diunggah untuk project <strong>%s</strong>.</p><p><strong>Nama Dokumen:</strong> %s</p><p><a href=\"%s\">Buka detail project</a></p>", html.EscapeString(projectName), html.EscapeString(docTitle), html.EscapeString(detailURL))

	s.sendAsync(ctx, []string{recipient}, notificationEmail{
		Subject: fmt.Sprintf("New Document Uploaded: %s", projectName),
		Text:    text,
		HTML:    htmlBody,
	})
}

func (s *NotificationService) NotifyClientMaintenanceUpdate(ctx context.Context, recipient string, projectName string, desc string, status string, detailURL string) {
	text := fmt.Sprintf("Service maintenance untuk project %s telah diperbarui.\n\nDeskripsi: %s\nStatus: %s\n\nBuka portal: %s", projectName, desc, status, detailURL)
	htmlBody := fmt.Sprintf("<p>Service maintenance untuk project <strong>%s</strong> telah diperbarui.</p><p><strong>Deskripsi:</strong> %s<br/><strong>Status:</strong> %s</p><p><a href=\"%s\">Buka detail project</a></p>", html.EscapeString(projectName), html.EscapeString(desc), html.EscapeString(status), html.EscapeString(detailURL))

	s.sendAsync(ctx, []string{recipient}, notificationEmail{
		Subject: fmt.Sprintf("Maintenance Status Updated: %s", projectName),
		Text:    text,
		HTML:    htmlBody,
	})
}

func (s *NotificationService) NotifyClientNewInvoice(ctx context.Context, recipient string, projectName string, invoiceNumber string, amount int64, status string, detailURL string) {
	text := fmt.Sprintf("Invoice baru telah diterbitkan untuk project %s.\n\nNomor Invoice: %s\nNominal: %d\nStatus: %s\n\nBuka portal: %s", projectName, invoiceNumber, amount, status, detailURL)
	htmlBody := fmt.Sprintf("<p>Invoice baru telah diterbitkan untuk project <strong>%s</strong>.</p><p><strong>Nomor Invoice:</strong> %s<br/><strong>Nominal:</strong> Rp%d<br/><strong>Status:</strong> %s</p><p><a href=\"%s\">Buka detail billing</a></p>", html.EscapeString(projectName), html.EscapeString(invoiceNumber), amount, html.EscapeString(status), html.EscapeString(detailURL))

	s.sendAsync(ctx, []string{recipient}, notificationEmail{
		Subject: fmt.Sprintf("New Invoice Generated: %s", projectName),
		Text:    text,
		HTML:    htmlBody,
	})
}

func (s *NotificationService) ClientProjectURL(projectID string) string {
	return joinURL(s.appBaseURL, "/client/projects/"+projectID)
}

func (s *NotificationService) ClientInvoiceURL(projectID string) string {
	return joinURL(s.appBaseURL, "/client/projects/"+projectID+"?tab=invoice")
}
