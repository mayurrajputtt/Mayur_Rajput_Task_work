# AiVoA PharmaQMS - Comprehensive Deployment Guide

This guide details deployment procedures across three target environments: Google Cloud Run (AI Studio Preview), Standalone Docker Compose, and Production Kubernetes/AWS ECS.

---

## 1. Google Cloud Run / AI Studio Preview Environment (Default)
In Google AI Studio Build, applications execute inside containerized Cloud Run instances where **port 3000** is the sole externally exposed ingress port.

### How It Works
* We use a unified Express backend bridge (`server.ts`) running on port `3000` that embeds both our REST API engine (with SQLite/memory database + AI Copilot endpoints) and Vite static asset serving.
* No additional configuration is needed.

### Execution Commands:
```bash
npm install
npm run build
npm start # Binds to 0.0.0.0:3000
```

---

## 2. Standalone Docker Compose Deployment
For enterprise on-premise or cloud virtual machine deployments, use the multi-container Docker Compose setup.

### Directory Structure
```
/docker
  ├── Dockerfile.frontend   # Nginx multi-stage build for React SPA
  ├── Dockerfile.backend    # Python 3.11 FastAPI server with Uvicorn
  └── docker-compose.yml    # Orchestrates Frontend, Backend, and PostgreSQL + pgvector
```

### Setup Steps:
1. Ensure Docker Engine and Docker Compose are installed.
2. Create a `.env` file from `.env.example` containing your database credentials and `GROQ_API_KEY` / `GEMINI_API_KEY`.
3. Build and launch containers:
   ```bash
   docker-compose -f docker/docker-compose.yml up --build -d
   ```
4. Verify service health:
   * **Frontend Application:** `http://localhost:3000`
   * **FastAPI Backend Swagger UI:** `http://localhost:8000/docs`
   * **PostgreSQL Database:** `localhost:5432`

---

## 3. Production Hardening & Regulatory Checklist (GxP Validation)
Before deploying to an active pharmaceutical manufacturing environment, execute the following IQ/OQ/PQ validation protocols:
* **SSL/TLS Encryption:** Terminate HTTPS at ingress load balancers with TLS 1.3.
* **Database Backup & Disaster Recovery:** Configure automated point-in-time recovery (PITR) for PostgreSQL with cross-region WAL archiving.
* **Audit Trail Protection (21 CFR Part 11):** Revoke database superuser access from web application service accounts. Ensure the service account has only `INSERT` and `SELECT` privileges on the `audit_logs` table—no `UPDATE` or `DELETE` grants.
* **AI Model Validation:** Fix LLM temperature to `0.1` or `0.0` for extraction tasks to guarantee deterministic JSON output schemas.
