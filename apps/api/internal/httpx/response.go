package httpx

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

type APIResponse[T any] struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    *T        `json:"data,omitempty"`
	Error   *APIError `json:"error,omitempty"`
}

type AppError struct {
	Status  int
	Code    string
	Message string
	Details string
}

func (err AppError) Error() string {
	return err.Message
}

func NewError(status int, code string, message string, details string) AppError {
	return AppError{Status: status, Code: code, Message: message, Details: details}
}

func OK[T any](c *gin.Context, message string, data T) {
	c.JSON(http.StatusOK, APIResponse[T]{
		Success: true,
		Message: message,
		Data:    &data,
	})
}

func Created[T any](c *gin.Context, message string, data T) {
	c.JSON(http.StatusCreated, APIResponse[T]{
		Success: true,
		Message: message,
		Data:    &data,
	})
}

func NoContent(c *gin.Context, message string) {
	empty := map[string]string{}
	c.JSON(http.StatusOK, APIResponse[map[string]string]{
		Success: true,
		Message: message,
		Data:    &empty,
	})
}

func Fail(c *gin.Context, err error) {
	var appErr AppError
	if errors.As(err, &appErr) {
		c.JSON(appErr.Status, APIResponse[struct{}]{
			Success: false,
			Message: appErr.Message,
			Error: &APIError{
				Code:    appErr.Code,
				Message: appErr.Message,
				Details: appErr.Details,
			},
		})
		return
	}

	c.JSON(http.StatusInternalServerError, APIResponse[struct{}]{
		Success: false,
		Message: "Terjadi kesalahan pada server",
		Error: &APIError{
			Code:    "INTERNAL_ERROR",
			Message: "Terjadi kesalahan pada server",
			Details: err.Error(),
		},
	})
}

func BadRequest(message string, details string) AppError {
	return NewError(http.StatusBadRequest, "BAD_REQUEST", message, details)
}

func Unauthorized(message string) AppError {
	return NewError(http.StatusUnauthorized, "UNAUTHORIZED", message, "")
}

func Forbidden(message string) AppError {
	return NewError(http.StatusForbidden, "FORBIDDEN", message, "")
}

func NotFound(message string) AppError {
	return NewError(http.StatusNotFound, "NOT_FOUND", message, "")
}

func Conflict(message string) AppError {
	return NewError(http.StatusConflict, "CONFLICT", message, "")
}

func Validation(message string, details string) AppError {
	return NewError(http.StatusUnprocessableEntity, "VALIDATION_ERROR", message, details)
}
