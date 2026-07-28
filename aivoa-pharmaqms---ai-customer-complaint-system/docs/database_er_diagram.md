# AiVoA PharmaQMS - Database Schema & ER Diagram

The database is designed in normalized 3NF (Third Normal Form) using PostgreSQL / SQLite with SQLAlchemy ORM and Alembic migrations.

---

## 1. Entity-Relationship (ER) Diagram (Mermaid / ASCII)

```
+-------------------+       +-----------------------+       +-------------------+
|       USERS       |       |       CUSTOMERS       |       |     PRODUCTS      |
+-------------------+       +-----------------------+       +-------------------+
| PK id (UUID)      |       | PK id (UUID)          |       | PK id (UUID)      |
|    email (UK)     |       |    name               |       |    name           |
|    name           |       |    type (Hospital,..) |       |    grade (API/FDF)|
|    role_id (FK)---+---+   |    contact_email      |       |    ndc_code       |
|    password_hash  |   |   +-----------------------+       |    active_spec    |
+-------------------+   |               |                   +-------------------+
          |             |               |                             |
          | (1:N)       |               | (1:N)                       | (1:N)
          v             v               v                             v
+-------------------------------------------------------------------------------+
|                                  COMPLAINTS                                   |
+-------------------------------------------------------------------------------+
| PK id (UUID)          | FK customer_id (UUID)      | FK product_id (UUID)     |
|    complaint_code     | FK assigned_to (UUID)      |    batch_number          |
|    source             |    status                  |    quantity_affected     |
|    description        |    complaint_date          |    manufacturing_date    |
+-------------------------------------------------------------------------------+
       |                   |                   |                  |
       | (1:1)             | (1:N)             | (1:N)            | (1:N)
       v                   v                   v                  v
+--------------+   +---------------+   +---------------+  +---------------------+
| RISK_ASSESS  |   |  ATTACHMENTS  |   |     CAPA      |  |     AUDIT_LOGS      |
|              |   |               |   |               |  | (21 CFR Part 11)    |
+--------------+   +---------------+   +---------------+  +---------------------+
| PK id        |   | PK id         |   | PK id         |  | PK id               |
| FK comp_id   |   | FK comp_id    |   | FK comp_id    |  | FK comp_id          |
|    ich_class |   |    file_name  |   |    title      |  | FK user_id          |
|    score     |   |    file_type  |   |    action_type|  |    timestamp        |
|    severity  |   |    ocr_text   |   |    status     |  |    action_type      |
+--------------+   +---------------+   +---------------+  |    previous_val     |
                           |                              |    new_val          |
                           | (1:1)                        |    esign_reason     |
                           v                              +---------------------+
                   +---------------+
                   | AI_SUMMARIES  |
                   +---------------+
                   | PK id         |
                   | FK comp_id    |
                   |    summary    |
                   |    rca_json   |
                   |    embeddings |
                   +---------------+
```

---

## 2. Table Definitions & Indices

1. **`roles`**: Stores RBAC permissions (`QA_MANAGER`, `INVESTIGATOR`, `REGULATORY_OFFICER`, `ADMIN`).
2. **`users`**: User credentials, department, and electronic signature verification hashes. Indexed on `email`.
3. **`products`**: API and FDF product catalog with strength, formulation type, and NDC codes. Indexed on `name` and `grade`.
4. **`customers`**: Hospitals, distributors, and pharmacies originating inquiries.
5. **`complaints`**: Core Quality Module entity. Indexed on `status`, `batch_number`, and `complaint_date`.
6. **`attachments`**: Binary or cloud URL references to uploaded lab PDFs, `.eml` files, or images. Stores extracted OCR text.
7. **`risk_assessments`**: ICH Q9 classification (`CRITICAL_CLASS_I`, `MAJOR_CLASS_II`, `MINOR_CLASS_III`), probability score, and justification.
8. **`ai_summaries`**: LangGraph generated JSON structure containing executive summary, Ishikawa RCA, completeness score, and vector embeddings (`pgvector` / JSON float array).
9. **`capa`**: Corrective and Preventive Actions linked to complaints. Tracks due date, owner, and verification status.
10. **`audit_logs`**: Immutable FDA 21 CFR Part 11 ledger. No `UPDATE` or `DELETE` permissions exist on this table at the database engine level.
