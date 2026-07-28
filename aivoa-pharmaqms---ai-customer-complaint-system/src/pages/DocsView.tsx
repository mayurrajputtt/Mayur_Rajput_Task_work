import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Database, 
  ShieldCheck, 
  FileCheck, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Workflow, 
  Server,
  Lock
} from 'lucide-react';

export const DocsView: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-full">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold font-mono">ARCHITECTURE & COMPLIANCE</span>
          <span className="text-xs text-slate-400 font-medium">System Documentation</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          AIVOA PharmaQMS: System Architecture & Research Docs
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed technical specifications of our 10-step LangGraph processing engine, PostgreSQL schema, and 21 CFR Part 11 security model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: LangGraph 10-Step Workflow */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Workflow className="w-5 h-5 text-blue-600" />
              <span>10-Step LangGraph Agentic Intake Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Autonomous orchestrator executing pharmaceutical quality intake and triage</p>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-blue-200">
            {[
              { s: "Step 1: Document Ingestion & OCR", d: "Reads binary PDF/EML streams and extracts raw alphanumeric character layout." },
              { s: "Step 2: Metadata Extraction (Groq Gemma2-9B)", d: "Identifies product name, dosage specification (USP FDF / API), batch number, and lot expiry date." },
              { s: "Step 3: GMP Field Validation", d: "Verifies completeness of mandatory fields required under FDA 21 CFR Part 211.198." },
              { s: "Step 4: Objective QA Summary Formulation", d: "Synthesizes raw hospital pharmacy or distributor emails into formal scientific executive summaries." },
              { s: "Step 5: ICH Q9 Quality Risk Classification", d: "Assigns Class I (Critical), Class II (Major), or Class III (Minor) severity ratings with formal justification." },
              { s: "Step 6: Vector Cosine Similarity Duplicate Search", d: "Queries historical embeddings in vector database to detect repeating manufacturing anomalies." },
              { s: "Step 7: Ishikawa 6-M Fishbone Categorization", d: "Isolates defect vectors across Man, Machine, Material, Method, Measurement, and Milieu." },
              { s: "Step 8: 5-Whys Root Cause Hypothesis", d: "Drills down 5 iterations from physical manifestation to equipment or SOP root failure." },
              { s: "Step 9: CAPA Remediation Generation", d: "Proposes actionable Corrective and Preventive Actions with target completion days." },
              { s: "Step 10: Immutable Audit Log Preparation", d: "Prepares cryptographically signed JSON payload for PostgreSQL commit and 21 CFR Part 11 audit trail." }
            ].map((step, idx) => (
              <div key={idx} className="relative pl-10">
                <div className="absolute left-1 top-2 w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-sm">
                  {idx + 1}
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="text-xs font-bold text-slate-900">{step.s}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium">{step.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Database Schema & 21 CFR Part 11 */}
        <div className="lg:col-span-5 space-y-6">
          {/* ER Schema Diagram Spec */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span>PostgreSQL QMS ER Schema</span>
            </h3>
            <p className="text-xs text-slate-400">Relational entity structure preserving GMP audit trails</p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-1">
                <div className="text-purple-400 font-bold">TABLE: complaints</div>
                <div className="text-[10px] text-slate-400">id UUID PK, complaint_code VARCHAR(32) UK, product_name VARCHAR(128), batch_number VARCHAR(64), ich_risk_class VARCHAR(32), status VARCHAR(32), completeness_score INT, ishikawa_rca JSONB</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-1">
                <div className="text-blue-400 font-bold">TABLE: capa_items</div>
                <div className="text-[10px] text-slate-400">id UUID PK, complaint_id UUID FK, title VARCHAR(256), action_type VARCHAR(32), owner VARCHAR(64), target_days INT, status VARCHAR(32), approved_by VARCHAR(64), approved_at TIMESTAMP</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-1">
                <div className="text-green-400 font-bold">TABLE: audit_logs (21 CFR Part 11)</div>
                <div className="text-[10px] text-slate-400">id UUID PK, complaint_id UUID FK, user_id VARCHAR(64), action_type VARCHAR(64), previous_val VARCHAR(128), new_val VARCHAR(128), esign_reason TEXT, ip_address VARCHAR(45), timestamp TIMESTAMP</div>
              </div>
            </div>
          </div>

          {/* 21 CFR Part 11 Compliance Card */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4 border border-slate-800 shadow-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              <span>FDA 21 CFR Part 11 Compliance</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This system implements strict safeguards for electronic records and signatures in the pharmaceutical manufacturing industry:
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span><strong>Immutable Audit Trails:</strong> Timestamped records of every modification.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span><strong>Biometric Re-authentication:</strong> Mandatory password entry for CAPA approval and status changes.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span><strong>Reason for Signing:</strong> Every signature requires explicit justification.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
