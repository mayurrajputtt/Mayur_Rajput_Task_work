# AiVoA PharmaQMS - REST API Documentation & OpenAPI Specification

All endpoints are hosted at `/api/v1` (or `/api` in the Cloud Run live preview environment). All authenticated endpoints require an RFC 6750 Bearer Token header: `Authorization: Bearer <jwt_token>`.

---

## 1. Authentication & Users
### `POST /api/auth/login`
Authenticates a user and returns a signed JWT access token with role claims.
* **Request Body:**
  ```json
  {
    "email": "sarah.jenkins@aivoa.ai",
    "password": "password123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": "usr-001",
      "name": "Sarah Jenkins",
      "email": "sarah.jenkins@aivoa.ai",
      "role": "QA_MANAGER",
      "department": "Quality Assurance - API & FDF"
    }
  }
  ```

---

## 2. Complaint Intake & Management
### `GET /api/complaints`
Retrieves a paginated, filtered list of quality complaints.
* **Query Parameters:** `page` (int), `limit` (int), `status` (string), `risk_class` (string), `search` (string).
* **Response (200 OK):**
  ```json
  {
    "total": 15,
    "page": 1,
    "limit": 10,
    "data": [
      {
        "id": "CMP-2026-0089",
        "title": "Tablet Capping - Atorvastatin 40mg",
        "source": "Hospital Pharmacy",
        "status": "INVESTIGATION_IN_PROGRESS",
        "risk_class": "MAJOR_CLASS_II",
        "batch_number": "B-4092-A",
        "created_at": "2026-07-25T14:30:00Z"
      }
    ]
  }
  ```

### `POST /api/complaints`
Logs a new customer complaint into the QMS database.
* **Request Body (Pydantic Validated):**
  ```json
  {
    "source": "Distributor Email",
    "customer_name": "MetroHealth Hospital Network",
    "product_name": "Amoxicillin Oral Suspension",
    "product_grade": "USP 250mg/5ml FDF",
    "batch_number": "AMX-8821-C",
    "manufacturing_date": "2026-01-10",
    "expiry_date": "2028-01-10",
    "quantity_affected": "500 bottles",
    "complaint_type": "Packaging & Seal Integrity",
    "complaint_date": "2026-07-26",
    "description": "Inner foil seal found detached upon cap opening.",
    "initial_severity": "High",
    "priority": "Immediate"
  }
  ```

---

## 3. AI Copilot & LangGraph Endpoints
### `POST /api/ai/analyze-document`
Uploads a PDF report, `.eml` email, or defect image, executing the 10-step LangGraph orchestration pipeline.
* **Headers:** `Content-Type: multipart/form-data`
* **Form Data:** `file` (Binary file), `doc_type` ("PDF" | "EML" | "IMAGE")
* **Response (200 OK - Extracted & Analyzed Payload):**
  ```json
  {
    "status": "COMPLETED",
    "progress_percentage": 100,
    "extraction": {
      "customer_name": "St. Jude Medical Center",
      "product_name": "Atorvastatin Calcium Tablets",
      "batch_number": "B-4092-A",
      "quantity_affected": "1,200 bottles",
      "description": "Tablets separating into horizontal layers during dispensing."
    },
    "risk_assessment": {
      "risk_class": "MAJOR_CLASS_II",
      "severity": "High",
      "score": 78,
      "ich_justification": "Defect involves physical integrity of dosage form without active ingredient toxicity."
    },
    "duplicate_detection": {
      "is_duplicate": true,
      "similarity_score": 0.89,
      "matched_complaint_id": "CMP-2026-0041"
    },
    "root_cause": {
      "primary_category": "Machine / Method",
      "fishbone": "Excessive pre-compression pressure or insufficient binder moisture.",
      "five_whys": ["Why did capping occur? -> Entrapped air during compression..."]
    },
    "capa_recommendations": [
      {
        "title": "Recalibrate Tablet Press Pre-Compression Nozzles",
        "action_type": "Corrective",
        "owner": "Engineering Lead"
      }
    ],
    "completeness_score": 95
  }
  ```

### `POST /api/ai/chat`
Interactive QA Copilot chat endpoint for interrogating active complaint files.
* **Request Body:** `{"complaint_id": "CMP-2026-0089", "message": "What is the historical trend for Batch B-4092-A?"}`

---

## 4. Duplicate Detection & CAPA
### `POST /api/complaints/check-duplicate`
Executes vector semantic search across historical embeddings to detect recurring batch anomalies.
### `POST /api/capa/approve`
Approves a proposed CAPA with FDA 21 CFR Part 11 electronic signature authentication.
