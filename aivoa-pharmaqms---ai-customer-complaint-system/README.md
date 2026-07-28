# AiVoA PharmaQMS: AI-Powered Customer Complaint Management System
### Production-Grade Quality Management System for Pharmaceutical API & FDF Manufacturing

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/Frontend-React_19_%7C_Redux_Toolkit_%7C_Tailwind-61DAFB?logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-FastAPI_%7C_Python_3.11_%7C_SQLAlchemy-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![AI Engine](https://img.shields.io/badge/AI-LangGraph_%7C_Groq_%7C_Gemini_2.5-FF6F00?logo=google-gemini)](https://console.groq.com)
[![Compliance](https://img.shields.io/badge/Compliance-FDA_21_CFR_Part_11_%7C_ICH_Q9-red.svg)](#compliance)

---

## Executive Summary

**AiVoA PharmaQMS** is a next-generation Quality Management System (QMS) engineered specifically for the **Pharmaceutical Manufacturing Industry** (both Active Pharmaceutical Ingredients - API, and Finished Dosage Forms - FDF). Modeled after leading enterprise pharmaceutical AI architectures (such as [AiVoA](https://aivoa.ai)), this application transforms traditional, manual, error-prone quality complaint handling into an automated, science-based, regulatory-compliant AI workflow.

The platform combines an intuitive Material-SaaS interface with a robust backend engine powered by **LangGraph** orchestration, **Groq/Gemini LLMs**, and vector semantic search. When a customer complaint (PDF, EML email, or physical defect photo) arrives, the **AI Complaint Intake Assistant** autonomously extracts critical metadata, evaluates ICH Q9 risk severity, checks for duplicate batches across historical records, performs Root Cause Analysis (RCA) via Ishikawa/5-Whys methodologies, and drafts Corrective & Preventive Actions (CAPA)—all while maintaining immutable **FDA 21 CFR Part 11 electronic audit trails**.

---

## Core Capabilities & Features

1. **Automated Multi-Modal Intake & OCR:**
   - Drag & drop support for PDF laboratory reports, `.eml` customer correspondence, and tablet/vial defect images.
   - Intelligent OCR & text parsing with progress tracking.
2. **LangGraph 10-Step AI Orchestration Workflow:**
   - Sequential execution: Document Intake → OCR Extraction → Field Validation → Summarization → ICH Q9 Risk Classification → Duplicate Detection (Vector Search) → Ishikawa Root Cause Recommendation → CAPA Formulation → Completeness Scoring → Database Persistence.
3. **AI Copilot & Interactive QA Assistant:**
   - Real-time chat interface allowing investigators to interrogate complaint files ("What was the dissolution assay result?", "Have we had similar capping issues with Batch #B-4092?").
4. **FDA 21 CFR Part 11 Compliance & Audit Trails:**
   - Immutable audit log capturing timestamp, user ID, IP address, previous state, new state, and justification for every data modification or CAPA approval.
   - Electronic signature re-authentication for Quality Assurance sign-offs.
5. **ICH Q9 Risk Assessment Heatmap:**
   - Visual risk matrix classifying defects into **Critical (Class I)**, **Major (Class II)**, and **Minor (Class III)** with automated email/alert escalations.
6. **Smart Vector & Semantic Search:**
   - Cosine-similarity duplicate detection algorithm matching new complaints against historical vector embeddings.
7. **Comprehensive CAPA Workspace & Root Cause Analysis:**
   - Structured 5-Whys and Ishikawa Fishbone categorization (Man, Machine, Material, Method, Measurement, Milieu).

---

## System Architecture & Mandatory Stack

```
+---------------------------------------------------------------------------------+
|                                 FRONTEND LAYER                                  |
|   React 19 | Redux Toolkit | React Router | Tailwind CSS + Lucide | Hook Form   |
+---------------------------------------------------------------------------------+
                                        ^
                                        |  REST API / JSON (Axios)
                                        v
+---------------------------------------------------------------------------------+
|                             API & BACKEND RUNTIME                               |
|          Node/Express & Python FastAPI Engine | JWT RBAC Auth | Pydantic        |
+---------------------------------------------------------------------------------+
          ^                             ^                             ^
          |                             |                             |
          v                             v                             v
+--------------------+       +--------------------+       +-----------------------+
|  DATABASE LAYER    |       |  LANGGRAPH AI CORE |       |    EXTERNAL AI APIS   |
| PostgreSQL / SQLite|       | 10-Step Sequential |       |  Groq API (Gemma2-9b) |
| SQLAlchemy ORM     |       | State Machine      |       |  Google Gemini API    |
+--------------------+       +--------------------+       +-----------------------+
```

### Mandatory Stack Verification:
* **Frontend:** React, Redux Toolkit, React Router, Axios, Tailwind CSS (Material-SaaS styled), Inter Font, React Hook Form.
* **Backend:** Python FastAPI architecture (accompanied by containerized Express bridge for live preview execution), Pydantic schemas, SQLAlchemy ORM, Alembic migrations.
* **Database:** Normalized PostgreSQL / SQLite engine with relationships, indices, and audit logging.
* **AI & NLP:** LangGraph workflow engine, Groq API (`gemma2-9b-it`, `llama-3.3-70b-versatile`), Google Gemini AI (`gemini-2.5-flash`), OCR (PyMuPDF / simulated pdfplumber / Pillow).

---

## Quick Start & Installation Guide

### Prerequisites
* Node.js (v18 or v20+) and npm
* Python 3.10+ (for standalone Python backend deployment)
* Docker & Docker Compose (optional, for full containerized stack)

### 1. Local Development (Cloud Run & AI Studio Preview)
This repository is configured to execute out-of-the-box as a unified full-stack application on port `3000`.

```bash
# Clone repository
git clone https://github.com/aivoa-ai/pharma-qms-ai-copilot.git
cd pharma-qms-ai-copilot

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Ensure GEMINI_API_KEY or GROQ_API_KEY is configured in your secrets

# Start the full-stack development server
npm run dev
```
Open `http://localhost:3000` in your browser. Use any demo credentials:
* **QA Manager (Admin):** `sarah.jenkins@aivoa.ai` / `password123`
* **Quality Investigator:** `david.chen@aivoa.ai` / `password123`

---

### 2. Standalone Python FastAPI Backend & PostgreSQL
If deploying the Python backend separately:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run Alembic Database Migrations
alembic upgrade head

# Start FastAPI Uvicorn Server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 3. Docker Compose Deployment
```bash
# Build and spin up Frontend, FastAPI Backend, and PostgreSQL containers
docker-compose up --build -d
```
* **Frontend Web App:** `http://localhost:3000`
* **FastAPI Docs (Swagger UI):** `http://localhost:8000/docs`
* **PostgreSQL Database:** `localhost:5432`

---

## Project Structure

```
/
├── assets/                 # Brand logos, sample defect images, UI mocks
├── backend/                # Python FastAPI server, endpoints, auth, logging
├── database/               # SQL schema definitions, Alembic migrations, seed scripts
├── docs/                   # Architectural diagrams, ER charts, 10-min demo script
├── docker/                 # Dockerfiles for Frontend, Backend, and Postgres
├── frontend/               # React application source code (/src)
├── langgraph/              # LangGraph state machine & step orchestration logic
├── prompts/                # System prompts for Extraction, Risk, CAPA, RCA
├── scripts/                # Database seeders, automated test runners
├── tests/                  # Pytest unit tests, API tests, Jest frontend suites
├── server.ts               # Full-stack Node/Express bridge server for Cloud Run
└── package.json            # Project manifest & dependency configuration
```

---

## Demo Data & Test Cases
The system comes pre-loaded with **15 realistic pharmaceutical quality datasets**:
* **5 PDF Laboratory Complaint Reports:** e.g., *Atorvastatin 40mg Tablet Capping*, *Amoxicillin Oral Suspension Bottle Seal Leakage*.
* **5 Customer Email (.eml) Inquiries:** e.g., *Hospital Pharmacy sterile vial particulate alert*, *Distributor temperature excursion report*.
* **5 Sample Image Defect Reports:** Visual documentation of packaging lamination, blister seal voids, and label discoloration.

---

## Regulatory Compliance Disclaimer
This software is built in accordance with FDA 21 CFR Part 11, EU Annex 11, and ICH Q9/Q10 guidelines for demonstration and testing within Quality Management Systems. For live production deployment in a validated GxP environment, formal IQ/OQ/PQ validation protocols must be executed.
