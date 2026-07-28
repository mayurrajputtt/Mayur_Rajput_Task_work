# AiVoA PharmaQMS - LangGraph AI Workflow Architecture

The core AI engine uses **LangGraph** to model the document intake and quality investigation process as a deterministic, 10-step sequential State Machine with cyclic validation nodes.

---

## 1. LangGraph State Flow Diagram

```
                 [ Receive Document / Text / Email ]
                                 │
                                 ▼
                     (Step 1: Read PDF/EML/Image)
                                 │
                                 ▼
                     (Step 2: OCR & Extract Info)
                                 │
                                 ▼
                  (Step 3: Validate Mandatory Fields)
                                 │
                   ┌─────────────┴─────────────┐
                   │ Valid?                    │
            [YES]  ▼                     [NO]  ▼
   (Step 4: Generate AI Summary)     (Log Missing Info Alert)
                   │                           │
                   ▼                           │
     (Step 5: ICH Q9 Risk Classify)            │
                   │                           │
                   ▼                           │
    (Step 6: Vector Duplicate Detect)          │
                   │                           │
                   ▼                           │
   (Step 7: Ishikawa RCA Recommendation)       │
                   │                           │
                   ▼                           │
     (Step 8: Formulate CAPA Plan)             │
                   │                           │
                   ▼                           │
    (Step 9: Completeness Score Audit)         │
                   │                           │
                   └─────────────┬─────────────┘
                                 │
                                 ▼
              (Step 10: Populate Form & Store DB)
                                 │
                                 ▼
                [ Return JSON & Update UI Copilot ]
```

---

## 2. State Machine Node Specifications

### `StatePayload` (TypedDict / Pydantic)
```python
class ComplaintWorkflowState(TypedDict):
    raw_file_bytes: Optional[bytes]
    file_type: str  # "PDF", "EML", "IMAGE", "TEXT"
    ocr_text: str
    extracted_fields: Dict[str, Any]
    validation_errors: List[str]
    ai_summary: str
    ich_risk_class: str  # Class I, II, III
    risk_score: int
    duplicate_found: bool
    matched_complaint_id: Optional[str]
    similarity_score: float
    ishikawa_rca: Dict[str, Any]
    proposed_capas: List[Dict[str, str]]
    completeness_score: int
    db_record_id: Optional[str]
```

### Node Explanations
1. **`node_read_document`**: Parses raw bytes using PyMuPDF (`fitz`), Python `email` module, or Pillow image preprocessing.
2. **`node_extract_info`**: Prompts Groq (`gemma2-9b-it`) or Gemini with zero-shot pharmaceutical schema extraction (Customer, Product, Batch, Mfg/Exp dates).
3. **`node_validate`**: Verifies that batch format matches GMP alphanumeric standards and that dates are logically valid.
4. **`node_summarize`**: Generates a concise, structured executive summary for Quality Review Boards.
5. **`node_risk_classify`**: Evaluates defect toxicity and patient safety against ICH Q9 guidelines to assign Class I, II, or III.
6. **`node_duplicate_detect`**: Generates 768-dimensional text embeddings and calculates cosine similarity against historical vector store. Alerts if similarity > 0.85.
7. **`node_root_cause`**: Synthesizes Ishikawa fishbone categories (Man, Machine, Material, Method, Measurement, Milieu) and 5-Whys.
8. **`node_capa`**: Drafts corrective actions to fix immediate batch defects and preventive actions to update SOPs.
9. **`node_completeness`**: Assigns a percentage score (0-100%). If < 80%, flags specific missing metadata for the investigator.
10. **`node_populate_and_store`**: Commits the finalized state to PostgreSQL/SQLite within an atomic database transaction and triggers 21 CFR Part 11 audit logging.
