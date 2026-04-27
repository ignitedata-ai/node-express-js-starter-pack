SERVER_DIR   := server
CLIENT_DIR   := client
DEV_COMPOSE  := docker-compose.dev.yml
PROD_COMPOSE := docker-compose.yml
SERVER_CTR   := nextdecade-server-dev
DB_CTR       := nextdecade-db

.PHONY: help \
        install install-server install-client \
        dev build lint clean check \
        up down logs shell \
        db-up db-down db-reset \
        db-push db-migrate db-deploy db-generate db-studio \
        prod-up prod-down prod-build

# ─────────────────────────────────────────────
help:
	@echo "============================================================"
	@echo " NextDecade — Development Tools"
	@echo "============================================================"
	@echo ""
	@echo "Development:"
	@echo "  install          Install all dependencies (server + client)"
	@echo "  install-server   Install server dependencies only"
	@echo "  install-client   Install client dependencies only"
	@echo "  dev              Start full dev stack via Docker Compose"
	@echo "  build            Compile TypeScript (server)"
	@echo "  lint             Type-check (tsc --noEmit)"
	@echo "  clean            Remove build artefacts"
	@echo "  check            lint + build"
	@echo ""
	@echo "Docker (dev):"
	@echo "  up               Start all dev services (detached)"
	@echo "  down             Stop all dev services"
	@echo "  logs             Tail logs for all services"
	@echo "  logs-server      Tail server logs only"
	@echo "  shell            Shell into the server container"
	@echo ""
	@echo "Database:"
	@echo "  db-up            Start PostgreSQL only (wait until healthy)"
	@echo "  db-down          Stop PostgreSQL (volume preserved)"
	@echo "  db-reset         Stop + delete volume (fresh start)"
	@echo "  db-push          Push schema to DB without migration (dev)"
	@echo "  db-migrate       Create a new migration (interactive)"
	@echo "  db-deploy        Apply committed migrations (CI / prod)"
	@echo "  db-generate      Regenerate Prisma client"
	@echo "  db-studio        Open Prisma Studio in browser"
	@echo ""
	@echo "Production:"
	@echo "  prod-build       Build production Docker images"
	@echo "  prod-up          Start production stack"
	@echo "  prod-down        Stop production stack"
	@echo ""
	@echo "Observability:"
	@echo "  Metrics endpoint: http://localhost:4000/api/metrics"
	@echo ""
	@echo "Prerequisites:"
	@echo "  Copy server/.env.example to server/.env and fill in secrets"
	@echo "============================================================"

# ─────────────────────────────────────────────
# Dependencies
# ─────────────────────────────────────────────
install: install-server install-client

install-server:
	cd $(SERVER_DIR) && npm install

install-client:
	cd $(CLIENT_DIR) && npm install

# ─────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────
dev: _check-env
	docker compose -f $(DEV_COMPOSE) up

build:
	cd $(SERVER_DIR) && npm run build

lint:
	cd $(SERVER_DIR) && npx tsc --noEmit

clean:
	rm -rf $(SERVER_DIR)/dist
	rm -rf $(SERVER_DIR)/node_modules
	rm -rf $(CLIENT_DIR)/.next
	rm -rf $(CLIENT_DIR)/node_modules

check: lint build
	@echo "All checks passed!"

# ─────────────────────────────────────────────
# Docker — dev
# ─────────────────────────────────────────────
up: _check-env
	docker compose -f $(DEV_COMPOSE) up -d
	@echo ""
	@echo "Services started:"
	@echo "  API:        http://localhost:4000"
	@echo "  Client:     http://localhost:3000"
	@echo "  Metrics:    http://localhost:4000/api/metrics"
	@echo "  PostgreSQL: localhost:5432"

down:
	docker compose -f $(DEV_COMPOSE) down

logs:
	docker compose -f $(DEV_COMPOSE) logs -f

logs-server:
	docker compose -f $(DEV_COMPOSE) logs -f server

shell:
	docker compose -f $(DEV_COMPOSE) exec server /bin/sh

# ─────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────
db-up: _check-env
	docker compose -f $(DEV_COMPOSE) up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec $(DB_CTR) pg_isready -U nextdecade -d nextdecade > /dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "PostgreSQL ready — localhost:5432"

db-down:
	docker compose -f $(DEV_COMPOSE) stop postgres
	@echo "Database stopped. Volume preserved — run 'make db-up' to restart."

db-reset:
	docker compose -f $(DEV_COMPOSE) down -v
	@echo "Database stopped and volume deleted. Run 'make db-up' for a fresh start."

db-push:
	cd $(SERVER_DIR) && npm run db:push

db-migrate:
	cd $(SERVER_DIR) && npm run db:migrate

db-deploy:
	cd $(SERVER_DIR) && npm run db:deploy

db-generate:
	cd $(SERVER_DIR) && npm run db:generate

db-studio:
	cd $(SERVER_DIR) && npm run db:studio

# ─────────────────────────────────────────────
# Production
# ─────────────────────────────────────────────
prod-build:
	docker compose -f $(PROD_COMPOSE) build

prod-up: _check-env
	docker compose -f $(PROD_COMPOSE) up -d
	@echo ""
	@echo "Production services started:"
	@echo "  API:        http://localhost:4000"
	@echo "  Client:     http://localhost:3000"

prod-down:
	docker compose -f $(PROD_COMPOSE) down

# ─────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────
_check-env:
	@if [ ! -f $(SERVER_DIR)/.env ]; then \
		echo "ERROR: $(SERVER_DIR)/.env not found"; \
		echo "Copy $(SERVER_DIR)/.env.example to $(SERVER_DIR)/.env and fill in the secrets."; \
		exit 1; \
	fi
