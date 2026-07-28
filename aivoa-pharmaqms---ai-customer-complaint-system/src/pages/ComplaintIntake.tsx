import React, { useState } from 'react';
import { useAppDispatch } from '../store';
import { complaintService } from '../services/api';
import { addComplaint } from '../store/complaintSlice';
import { AICopilotPanel } from '../components/AICopilotPanel';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Send, 
  Building2, 
  Package, 
  Calendar, 
  UserCheck, 
  ShieldAlert, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const ComplaintIntake: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [formData, setFormData] = useState({
    source: 'Hospital Pharmacy',
    customer_name: 'St. Jude Medical Center',
    product_name: 'Atorvastatin Calcium Tablets',
    product_grade: 'USP 40mg FDF',
    batch_number: 'B-4092-A',
    manufacturing_date: '2026-01-15',
    expiry_date: '2028-05-12',
    quantity_affected: '1,200 bottles',
    complaint_type: 'Physical Defect / Capping',
    complaint_date: new Date().toISOString().split('T')[0],
    description: 'Tablets separating into horizontal layers during dispensing in hospital pharmacy. Multiple bottles inspected from lot B-4092-A show identical capping defects upon lid removal.',
    initial_severity: 'High',
    priority: 'Immediate',
    assigned_to: 'usr-002',
    ich_risk_class: 'MAJOR_CLASS_II',
    risk_score: 78,
    ich_justification: 'Defect involves physical integrity of dosage form without active ingredient toxicity. May cause inconsistent dosing or dissolution failure.',
    ai_summary: 'Executive Summary: Defect report received from Hospital Pharmacy regarding Atorvastatin Lot #B-4092-A. Issue involves Tablet Capping affecting 1,200 bottles. Immediate investigation initiated.',
    completeness_score: 95
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormPopulateFromAI = (aiData: any) => {
    setFormData((prev) => ({
      ...prev,
      ...aiData
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newComp = await complaintService.createComplaint(formData);
      dispatch(addComplaint(newComp));
      setSuccessMsg(true);
      setTimeout(() => {
        navigate(`/complaints/${newComp.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error logging complaint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6 bg-slate-50/50 overflow-y-auto">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <div className="text-sm font-bold">Complaint Logged Successfully to PostgreSQL Register!</div>
              <div className="text-xs text-green-700">21 CFR Part 11 electronic audit trail created. Redirecting to Ishikawa RCA dashboard...</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-green-200 text-green-900 px-3 py-1 rounded-lg">CMP-2026-NEW</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Formal Intake Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Formal Quality Complaint Intake Record</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Mandatory fields required by FDA 21 CFR Part 211.198 & EU Annex 11</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Completeness Score:</span>
              <span className="px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 font-mono font-bold text-xs">
                {formData.completeness_score}%
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Customer & Source */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>1. Origin & Reporter Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Complaint Source *</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="Hospital Pharmacy">Hospital Pharmacy</option>
                    <option value="Distributor Email">Distributor Email</option>
                    <option value="Internal QA / Formulation Partner">Internal QA / Formulation Partner</option>
                    <option value="Regulatory Authority (FDA / EMA)">Regulatory Authority (FDA / EMA)</option>
                    <option value="Physician / Patient Report">Physician / Patient Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Facility Name *</label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Product & Batch Identification */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-600" />
                <span>2. Drug Product & Batch Traceability</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name & Strength *</label>
                  <input
                    type="text"
                    name="product_name"
                    required
                    value={formData.product_name}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage Grade / Specification *</label>
                  <input
                    type="text"
                    name="product_grade"
                    required
                    value={formData.product_grade}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Lot Number *</label>
                  <input
                    type="text"
                    name="batch_number"
                    required
                    value={formData.batch_number}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    name="manufacturing_date"
                    value={formData.manufacturing_date}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Defect Nature & Severity */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>3. Quality Defect Classification & Risk</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Defect Category *</label>
                  <select
                    name="complaint_type"
                    value={formData.complaint_type}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="Physical Defect / Capping">Physical Defect / Capping</option>
                    <option value="Packaging & Seal Integrity">Packaging & Seal Integrity</option>
                    <option value="Particulate Matter">Particulate Matter (Sterile)</option>
                    <option value="Assay Sub-potency / Polymorphism">Assay Sub-potency / Polymorphism</option>
                    <option value="Discoloration / Labeling Defect">Discoloration / Labeling Defect</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Affected *</label>
                  <input
                    type="text"
                    name="quantity_affected"
                    value={formData.quantity_affected}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ICH Q9 Risk Class *</label>
                  <select
                    name="ich_risk_class"
                    value={formData.ich_risk_class}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  >
                    <option value="CRITICAL_CLASS_I">CRITICAL CLASS I (Immediate Recall Risk)</option>
                    <option value="MAJOR_CLASS_II">MAJOR CLASS II (Quality Degradation)</option>
                    <option value="MINOR_CLASS_III">MINOR CLASS III (Cosmetic / Low Risk)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Narrative / Incident Description *</label>
                <textarea
                  rows={3}
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium leading-relaxed"
                />
              </div>
            </div>

            {/* Section 4: Assignment & AI Summary */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span>4. Investigation Assignment & AI Synthesis</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Lead QA Investigator *</label>
                  <select
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="usr-002">David Chen (Quality Control Laboratory Lead)</option>
                    <option value="usr-001">Sarah Jenkins (QA Manager - API & FDF)</option>
                    <option value="usr-003">Dr. Elena Rostova (Global Regulatory Affairs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority SLA Target *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  >
                    <option value="Immediate">Immediate (24 Hour Triage SLA)</option>
                    <option value="High">High (72 Hour Investigation Target)</option>
                    <option value="Standard">Standard (7 Day CAPA Resolution)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>AI Copilot Executive Summary (Auto-Synthesized)</span>
                  <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Groq Gemma2-9B Generated
                  </span>
                </label>
                <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-xl text-xs text-slate-800 font-medium leading-relaxed">
                  {formData.ai_summary}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/complaints')}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Commit to QMS Register & Audit Trail</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 Columns: AI Copilot Intake Assistant Panel */}
        <div className="lg:col-span-5 h-[800px] sticky top-8">
          <AICopilotPanel onFormPopulate={handleFormPopulateFromAI} />
        </div>
      </div>
    </div>
  );
};
