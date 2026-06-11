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
	"os"
	"path/filepath"
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

func (s *UploadService) UploadEvidence(ctx context.Context, fileHeader *multipart.FileHeader) (string, error) {
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

	// If R2 client is configured, upload to Cloudflare R2
	if s.s3Client != nil {
		contentType := "image/jpeg"
		_, err = s.s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(s.cfg.R2BucketName),
			Key:         aws.String(filename),
			Body:        bytes.NewReader(imageBuf.Bytes()),
			ContentType: aws.String(contentType),
		})
		if err == nil {
			publicURL := s.cfg.R2PublicURL
			if publicURL == "" {
				publicURL = fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s", s.cfg.R2AccountID, s.cfg.R2BucketName)
			}
			// ensure trailing slash
			if publicURL[len(publicURL)-1] != '/' {
				publicURL += "/"
			}
			return publicURL + filename, nil
		}
		// Log error and fallback to local storage
		fmt.Printf("R2 Upload failed: %v, falling back to local storage\n", err)
	}

	// Fallback: Local Storage
	localDir := "./data/uploads"
	if err := os.MkdirAll(localDir, 0755); err != nil {
		return "", fmt.Errorf("gagal membuat folder upload lokal: %w", err)
	}

	localPath := filepath.Join(localDir, filename)
	err = os.WriteFile(localPath, imageBuf.Bytes(), 0644)
	if err != nil {
		return "", fmt.Errorf("gagal menyimpan file bukti lokal: %w", err)
	}

	// Return local public static link
	return fmt.Sprintf("/uploads/%s", filename), nil
}

func (s *UploadService) UploadFile(ctx context.Context, fileHeader *multipart.FileHeader) (string, error) {
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

	if s.s3Client != nil {
		contentType := fileHeader.Header.Get("Content-Type")
		if contentType == "" {
			contentType = "application/pdf"
		}
		_, err = s.s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(s.cfg.R2BucketName),
			Key:         aws.String(filename),
			Body:        bytes.NewReader(fileBuf.Bytes()),
			ContentType: aws.String(contentType),
		})
		if err == nil {
			publicURL := s.cfg.R2PublicURL
			if publicURL == "" {
				publicURL = fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s", s.cfg.R2AccountID, s.cfg.R2BucketName)
			}
			if publicURL[len(publicURL)-1] != '/' {
				publicURL += "/"
			}
			return publicURL + filename, nil
		}
		fmt.Printf("R2 Upload failed: %v, falling back to local storage\n", err)
	}

	localDir := "./data/uploads"
	if err := os.MkdirAll(localDir, 0755); err != nil {
		return "", fmt.Errorf("gagal membuat folder upload lokal: %w", err)
	}

	localPath := filepath.Join(localDir, filename)
	err = os.WriteFile(localPath, fileBuf.Bytes(), 0644)
	if err != nil {
		return "", fmt.Errorf("gagal menyimpan file dokumen lokal: %w", err)
	}

	return fmt.Sprintf("/uploads/%s", filename), nil
}
