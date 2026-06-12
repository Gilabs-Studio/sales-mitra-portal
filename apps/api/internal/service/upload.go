package service

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/jpeg"
	_ "image/png"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	s3config "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gilabs/mitra-sales-portal/apps/api/internal/config"
	"github.com/google/uuid"
)

type UploadService struct {
	cfg      config.Config
	s3Client *s3.Client
}

type UploadPathOptions struct {
	ClientID  string
	ProjectID string
	Category  string
}

func NewUploadService(cfg config.Config) *UploadService {
	var s3Client *s3.Client
	if cfg.R2AccountID != "" && cfg.R2AccessKeyID != "" && cfg.R2SecretAccessKey != "" && cfg.R2BucketName != "" {
		// Initialize Cloudflare R2 Client using AWS S3 SDK v2
		r2Resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
			return aws.Endpoint{
				URL:           fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.R2AccountID),
				SigningRegion: "auto",
			}, nil
		})

		sdkCfg, err := s3config.LoadDefaultConfig(context.Background(),
			s3config.WithEndpointResolverWithOptions(r2Resolver),
			s3config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.R2AccessKeyID, cfg.R2SecretAccessKey, "")),
			s3config.WithRegion("auto"),
		)
		if err == nil {
			s3Client = s3.NewFromConfig(sdkCfg)
		} else {
			fmt.Printf("Warning: Failed to load S3 config: %v\n", err)
		}
	}

	return &UploadService{
		cfg:      cfg,
		s3Client: s3Client,
	}
}

func sanitizePathSegment(segment string) string {
	segment = strings.TrimSpace(segment)
	segment = strings.Trim(segment, "/")
	if segment == "" {
		return ""
	}

	var builder strings.Builder
	for _, r := range segment {
		switch {
		case r >= 'a' && r <= 'z':
			builder.WriteRune(r)
		case r >= 'A' && r <= 'Z':
			builder.WriteRune(r + ('a' - 'A'))
		case r >= '0' && r <= '9':
			builder.WriteRune(r)
		case r == '-', r == '_':
			builder.WriteRune(r)
		default:
			builder.WriteRune('-')
		}
	}

	cleaned := strings.Trim(builder.String(), "-")
	return cleaned
}

func buildObjectKey(prefix UploadPathOptions, filename string) string {
	parts := make([]string, 0, 4)
	if clientID := sanitizePathSegment(prefix.ClientID); clientID != "" {
		parts = append(parts, clientID)
	}
	if projectID := sanitizePathSegment(prefix.ProjectID); projectID != "" {
		parts = append(parts, projectID)
	}
	if category := sanitizePathSegment(prefix.Category); category != "" {
		parts = append(parts, category)
	}
	parts = append(parts, filename)
	return strings.Join(parts, "/")
}

func publicObjectURL(baseURL string, key string, accountID string, bucketName string) string {
	publicURL := baseURL
	if publicURL == "" {
		publicURL = fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s", accountID, bucketName)
	}
	if publicURL[len(publicURL)-1] != '/' {
		publicURL += "/"
	}
	return publicURL + key
}

func (s *UploadService) UploadEvidence(ctx context.Context, fileHeader *multipart.FileHeader, prefix UploadPathOptions) (string, error) {
	if s.s3Client == nil {
		return "", fmt.Errorf("Cloudflare R2 is not configured")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	// Decode original image (support JPEG/PNG)
	img, _, err := image.Decode(file)
	if err != nil {
		return "", fmt.Errorf("gagal decode gambar: %w. pastikan format JPG atau PNG", err)
	}

	// Convert to JPEG in memory to avoid CGO-dependent encoders in serverless builds.
	var imageBuf bytes.Buffer
	err = jpeg.Encode(&imageBuf, img, &jpeg.Options{Quality: 85})
	if err != nil {
		return "", fmt.Errorf("gagal konversi gambar ke JPEG: %w", err)
	}

	filename := fmt.Sprintf("payout-%s-%d.jpg", uuid.NewString(), time.Now().Unix())
	objectKey := buildObjectKey(prefix, filename)

	contentType := "image/jpeg"
	_, err = s.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.cfg.R2BucketName),
		Key:         aws.String(objectKey),
		Body:        bytes.NewReader(imageBuf.Bytes()),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("gagal mengupload ke Cloudflare R2: %w", err)
	}

	return publicObjectURL(s.cfg.R2PublicURL, objectKey, s.cfg.R2AccountID, s.cfg.R2BucketName), nil
}

func (s *UploadService) UploadFile(ctx context.Context, fileHeader *multipart.FileHeader, prefix UploadPathOptions) (string, error) {
	if s.s3Client == nil {
		return "", fmt.Errorf("Cloudflare R2 is not configured")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	var fileBuf bytes.Buffer
	if _, err := fileBuf.ReadFrom(file); err != nil {
		return "", err
	}

	ext := filepath.Ext(fileHeader.Filename)
	if ext == "" {
		ext = ".pdf"
	}
	filename := fmt.Sprintf("doc-%s-%d%s", uuid.NewString(), time.Now().Unix(), ext)
	objectKey := buildObjectKey(prefix, filename)

	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/pdf"
	}
	_, err = s.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.cfg.R2BucketName),
		Key:         aws.String(objectKey),
		Body:        bytes.NewReader(fileBuf.Bytes()),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("gagal mengupload ke Cloudflare R2: %w", err)
	}

	return publicObjectURL(s.cfg.R2PublicURL, objectKey, s.cfg.R2AccountID, s.cfg.R2BucketName), nil
}
