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

func (s *NotificationService) NotifyClientProjectEvent(ctx context.Context, recipient string, projectName string, eventTitle string, summary string, detailURL string) {
	text := strings.TrimSpace(fmt.Sprintf(
		"%s\n\nProject: %s\n%s\n\nBuka portal client: %s",
		eventTitle,
		projectName,
		summary,
		detailURL,
	))
	htmlBody := fmt.Sprintf(
		"<p><strong>%s</strong></p><p><strong>Project:</strong> %s</p><p>%s</p><p><a href=\"%s\">Buka portal client</a></p>",
		html.EscapeString(eventTitle),
		html.EscapeString(projectName),
		html.EscapeString(summary),
		html.EscapeString(detailURL),
	)

	s.sendAsync(ctx, []string{recipient}, notificationEmail{
		Subject: fmt.Sprintf("%s: %s", eventTitle, projectName),
		Text:    text,
		HTML:    htmlBody,
	})
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

func (s *NotificationService) ClientProjectURL(projectID string) string {
	return joinURL(s.appBaseURL, "/client/projects/"+projectID)
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
