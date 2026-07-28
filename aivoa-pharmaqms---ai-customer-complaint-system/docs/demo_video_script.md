# AiVoA PharmaQMS - 10-Minute Complete Demo Video Script
**Target Audience:** Engineering Evaluators, AI Architects, Quality Assurance Directors, and Internship Reviewers.

---

### [00:00 - 01:00] 1. Project Introduction & Executive Overview
* **[Visual: Open Browser to `http://localhost:3000` showing the login screen and dashboard.]**
* **Narrator:** "Hello and welcome to the engineering demonstration of **AiVoA PharmaQMS**—an AI-powered Customer Complaint Management System built specifically for the Pharmaceutical Manufacturing Industry, covering both Active Pharmaceutical Ingredients (API) and Finished Dosage Forms (FDF).
In traditional pharmaceutical manufacturing, handling quality complaints is a manual, paper-heavy process prone to human error and regulatory delays. This system solves those challenges by combining modern Material-SaaS design with a 10-step **LangGraph AI orchestration workflow**, **Groq Gemma2-9b models**, **Google Gemini**, and strict adherence to **FDA 21 CFR Part 11 electronic audit trail compliance**."

---

### [01:00 - 02:00] 2. Domain Knowledge & Architectural Blueprint
* **[Visual: Click on the 'Knowledge & Docs' tab in the navigation bar. Show the ER diagram and Clean Architecture schema.]**
* **Narrator:** "Before writing a single line of code, we grounded our engineering in pharmaceutical quality regulations. Our system strictly adheres to ICH Q9 for Quality Risk Management, classifying defects into Critical Class I, Major Class II, and Minor Class III.
From an architectural standpoint, we implemented clean hexagonal architecture following SOLID principles and the Repository Pattern. The frontend is built in React 19 with Redux Toolkit and Tailwind CSS, communicating via REST with a robust Python FastAPI backend and an atomic PostgreSQL database engine."

---

### [02:00 - 03:00] 3. Database Schema & FDA 21 CFR Part 11 Audit Logging
* **[Visual: Switch to the Database ER Diagram view and then navigate to the 'Audit Trail & Compliance' tab.]**
* **Narrator:** "Let’s look at the database layer. We designed a normalized 3NF schema linking Users, Roles, Customers, Products, Complaints, Attachments, Risk Assessments, CAPAs, and AI Summaries.
To meet **FDA 21 CFR Part 11 requirements**, we implemented an immutable `audit_logs` table. Notice here: every time a QA Manager updates a complaint status or approves a CAPA, the database records a cryptographic timestamp, user ID, previous value, new value, and an electronic signature justification. The database engine blocks all UPDATE or DELETE queries on this ledger."

---

### [03:00 - 04:30] 4. Replicating the Demo Workflow: Log Complaint & AI Assistant
* **[Visual: Navigate to 'Log Complaint'. Point out the 2-column layout matching the AiVoA reference design.]**
* **Narrator:** "Now, let's replicate the exact workflow from the AiVoA reference demo. On the left, we have the 4-part structured QA intake form: Origin Details, Product & Batch Identification, Complaint Details, and Initial Assessment. Notice all fields currently say 'Awaiting AI extraction...'.
On the right sits our **AI Complaint Intake Assistant**. Watch what happens when I drag and drop a laboratory PDF report reporting tablet capping on Atorvastatin Batch B-4092-A."
* **[Visual: Drag sample PDF or click 'Load Sample Report #1'. Watch the Extraction Progress Bar animate through the 10 LangGraph steps.]**
* **Narrator:** "The moment the file is dropped, our LangGraph orchestration engine kicks in. The progress bar updates in real-time as the file is read, OCR is performed, metadata is extracted, validated against GMP rules, and summarized."

---

### [04:30 - 06:00] 5. LangGraph Workflow & Groq / Gemini AI Processing
* **[Visual: Show the auto-populated form on the left, then scroll down the AI Assistant panel on the right.]**
* **Narrator:** "In less than three seconds, the form on the left is 100% auto-populated with zero human transcription error! Let’s examine the AI Assistant panel on the right:
First, it generated an executive summary for Quality Review Boards.
Second, our **ICH Q9 Risk Assessment** classified this as **Major (Class II)** with a severity score of 78, justifying that horizontal layer separation impacts dissolution without active ingredient toxicity.
Third, look at the **Duplicate Detection Alert**: using 768-dimensional text embeddings and cosine similarity, our system detected an 89% match with historical Complaint CMP-2026-0041 from three months ago!"

---

### [06:00 - 07:15] 6. Automated Root Cause Analysis (RCA) & CAPA Formulation
* **[Visual: Click on the 'CAPA & RCA Workspace' tab for the newly created complaint.]**
* **Narrator:** "Let's dive deeper into investigation. Our AI automatically synthesized an Ishikawa Fishbone categorization—pinpointing 'Machine / Method' as the primary breakdown, specifically flagging excessive compression pressure or binder dryness.
Below that, the AI drafted actionable Corrective and Preventive Actions (CAPA). With one click, as a QA Manager, I can click 'Approve CAPA'. Notice the pop-up modal requiring my password re-authentication and signature reason—this is our 21 CFR Part 11 electronic signature in action."

---

### [07:15 - 08:30] 7. Interactive AI Chat Copilot & Vector Search
* **[Visual: Type a question into the AI Assistant chat box at the bottom right: 'What is the historical defect rate for Atorvastatin batches?']**
* **Narrator:** "In addition to automated intake, investigators can interact conversationally with the complaint file using our built-in AI Chat Copilot. I can ask complex questions about batch records or manufacturing dates, and the LLM responds instantly using retrieval-augmented context.
Furthermore, in our 'Complaint List' view, investigators can use semantic vector search to find conceptually related defects even if different keywords were used by the reporting hospital."

---

### [08:30 - 09:30] 8. Code Walkthrough: Clean Architecture & SOLID Principles
* **[Visual: Switch to code editor view showing `/backend/main.py`, `/langgraph/workflow.py`, and `/src/store/complaintSlice.ts`.]**
* **Narrator:** "Let's take a brief tour of the codebase. In `/backend`, we structure controllers cleanly using dependency injection. In `/langgraph/workflow.py`, notice how we define the `ComplaintWorkflowState` TypedDict and wire sequential nodes using conditional routing for completeness verification.
On the frontend, `/src/store/` contains our Redux Toolkit slices providing immutable state management, while React Hook Form handles complex multi-step validation with instant visual feedback."

---

### [09:30 - 10:00] 9. Docker Deployment & Conclusion
* **[Visual: Show `/docker/docker-compose.yml` and return to the main Dashboard showing the Risk Heatmap.]**
* **Narrator:** "Finally, the entire application is containerized with Docker Compose for one-click deployment across PostgreSQL, FastAPI, and Nginx. Whether running locally or in Cloud Run, AiVoA PharmaQMS provides an audit-proof, AI-driven leap forward for pharmaceutical quality assurance. Thank you for watching!"
