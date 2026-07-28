# AiVoA PharmaQMS - Technical Architecture & Clean Design Guide

## 1. High-Level Architectural Overview
AiVoA PharmaQMS follows a strict **Clean Architecture (Hexagonal / Ports & Adapters)** paradigm, decoupling presentation logic, application orchestration, domain models, and external infrastructure (Databases, AI APIs, OCR engines).

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|  React 19 SPA | Redux Toolkit | Tailwind CSS | React Router | Hook Form | Lucide  |
+-----------------------------------------------------------------------------------+
                                         |
                                         | REST / HTTPS (Axios + JWT Bearer Token)
                                         v
+-----------------------------------------------------------------------------------+
|                            APPLICATION & ROUTING LAYER                            |
|                 FastAPI Controllers / Express Cloud Run Bridge                    |
|   Authentication & RBAC Middleware | Request Validation (Pydantic / Zod)          |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Dependency Injection (Repository Pattern)
                                         v
+-----------------------------------------------------------------------------------+
|                            CORE DOMAIN & SERVICE LAYER                            |
|  Complaint Lifecycle Service | CAPA Engine | Audit Trail Logger (21 CFR Part 11)  |
+-----------------------------------------------------------------------------------+
                  /                      |                      \
                 /                       |                       \
                v                        v                        v
+------------------------+  +------------------------+  +---------------------------+
|  INFRASTRUCTURE LAYER  |  |   AI & LANGGRAPH CORE  |  |    EXTERNAL ADAPTERS      |
| PostgreSQL / SQLite    |  | State Machine Workflow |  | Groq API (Gemma2-9b)      |
| SQLAlchemy / Alembic   |  | Vector Semantic Search |  | Google Gemini 2.5 Flash   |
+------------------------+  +------------------------+  +---------------------------+
```

---

## 2. SOLID Principles & Repository Pattern Implementation

### Single Responsibility Principle (SRP)
Every class and module has a single operational purpose:
* `ComplaintRepository`: Handles database CRUD and query filtering.
* `LangGraphOrchestrator`: Manages step-by-step state machine transitions.
* `AuditLogger`: Exclusively writes immutable electronic signature timestamps.

### Open/Closed Principle (OCP)
The AI Copilot engine is closed for modification but open for extension via abstract LLM interfaces (`BaseLLMProvider`). Swapping between Groq (`gemma2-9b-it`) and Google Gemini (`gemini-2.5-flash`) requires zero changes to the core business logic.

### Liskov Substitution Principle (LSP)
Mock repositories used in unit testing (`MockComplaintRepository`) perfectly substitute production SQL repositories (`SQLAlchemyComplaintRepository`) without side effects.

### Interface Segregation Principle (ISP)
Clients do not depend on interfaces they don't use. For example, `IFileExtractor` separates PDF extraction methods from image OCR methods.

### Dependency Inversion Principle (DIP)
High-level service controllers depend on abstract interfaces (e.g., `AbstractDatabaseSession`, `AIOrchestratorInterface`), injected via FastAPI Dependency Injection (`Depends()`).

---

## 3. Data Flow & Security Architecture

### Role-Based Access Control (RBAC) Matrix
| Role | View Complaints | Log Complaints | Approve CAPA | Edit Audit Logs | System Settings |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **QA Manager** | Yes | Yes | **Yes** | **No** (Immutable) | Yes |
| **Quality Investigator** | Yes | Yes | Propose Only | **No** (Immutable) | No |
| **Regulatory Officer** | Yes (Read-Only) | No | No | **No** (Immutable) | No |
| **System Admin** | Yes | Yes | No | **No** (Immutable) | Yes |

### Electronic Signature Enforcement (21 CFR Part 11)
When a QA Manager approves a CAPA or closes a Critical Class I complaint, the system prompts for an **Electronic Signature Re-Authentication**. The payload requires:
1. User password verification.
2. Cryptographic hash of the complaint payload.
3. Reason for signature (e.g., "I approve this Corrective Action Plan").
4. Permanent immutable database recording.
