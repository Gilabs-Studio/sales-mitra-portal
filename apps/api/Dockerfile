FROM golang:1.26-bookworm AS builder

WORKDIR /app

COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

COPY apps/api ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/server

FROM debian:bookworm-slim

RUN useradd --create-home --shell /usr/sbin/nologin appuser

WORKDIR /app

COPY --from=builder /bin/api /usr/local/bin/api
COPY apps/api/.env.example ./.env

RUN mkdir -p /app/data && chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

CMD ["api"]
