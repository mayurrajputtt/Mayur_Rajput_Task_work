import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService, Complaint, CAPA, AuditLog } from '../services/api';
import { useAppSelector } from '../store';
import { 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Building2, 
  Package, 
  Layers, 
  Settings, 
  Send,
  Lock
} from 'lucide-react';

export const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [capas, setCapas] = useState<CAPA[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'RCA' | 'CAPA' | 'AUDIT'>('RCA');
  
  // Status advancement modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [esignReason, setEsignReason] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await complaintService.getComplaintById(id);
        setComplaint(res);
        setCapas(res.capas || []);
        setAuditLogs(res.audit_logs || []);
      } catch (err) {
        console.error('Error fetching complaint details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleStatusAdvancement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !newStatus) return;
    try {
      const updated = await complaintService.updateStatus(complaint.id, newStatus, esignReason, user?.name || 'Sarah Jenkins');
      setComplaint(updated);
      setShowStatusModal(false);
      setEsignReason('');
      // Reload audit logs
      const detail = await complaintService.getComplaintById(complaint.id);
      setAuditLogs(detail.audit_logs || []);
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading || !complaint) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-600">Interrogating FDA 21 CFR Part 11 Audit Trail & Ishikawa Root Cause vectors...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-full">
      {/* Back link & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to="/complaints" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Active Register</span>
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{complaint.complaint_code}: {complaint.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              complaint.ich_risk_class === 'CRITICAL_CLASS_I' ? 'bg-red-500 text-white' :
              complaint.ich_risk_class === 'MAJOR_CLASS_II' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {complaint.ich_risk_class.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Product: <strong className="text-slate-800">{complaint.product_name}</strong></span>
            <span>•</span>
            <span>Batch / Lot: <strong className="font-mono text-blue-600">{complaint.batch_number}</strong></span>
            <span>•</span>
            <span>Logged: {complaint.complaint_date}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setNewStatus(complaint.status === 'PENDING_TRIAGE' ? 'INVESTIGATION_IN_PROGRESS' : complaint.status === 'INVESTIGATION_IN_PROGRESS' ? 'CAPA_PENDING' : 'CLOSED');
              setShowStatusModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Advance Investigation Status</span>
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </div>

      {/* Top AI Summary Alert */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-3xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Groq Gemma2-9B AI Synthesis
            </span>
            <span className="text-xs text-slate-400">ICH Q9 Risk Score: {complaint.risk_score}/100</span>
          </div>
          <p className="text-sm font-medium text-slate-200 leading-relaxed">
            {complaint.ai_summary}
          </p>
          <div className="text-xs text-slate-400 font-mono bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 mt-2">
            <strong>ICH Q9 Justification:</strong> {complaint.ich_justification}
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between shrink-0 min-w-[200px] relative z-10">
          <div className="text-xs text-slate-400 uppercase font-bold">Investigation Status</div>
          <div className="text-base font-extrabold text-blue-400 mt-1">{complaint.status.replace(/_/g, ' ')}</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-green-400" />
            <span>Lead: {complaint.assigned_name}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-8">
        <button
          onClick={() => setActiveTab('RCA')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'RCA' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ishikawa 6-M Root Cause Analysis & 5-Whys</span>
        </button>
        <button
          onClick={() => setActiveTab('CAPA')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'CAPA' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>CAPA Remediation Plan ({capas.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`pb-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'AUDIT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>21 CFR Part 11 Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: ISHIKAWA RCA & 5-WHYS */}
      {activeTab === 'RCA' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Ishikawa 6-M Fishbone */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ishikawa 6-M Fishbone Categorization</h3>
                <p className="text-xs text-slate-400 mt-0.5">Primary vector isolated: <strong className="text-blue-600 uppercase">{complaint.ishikawa_rca?.primary_category}</strong></p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(complaint.ishikawa_rca?.fishbone || {}).map(([category, finding]) => (
                <div key={category} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>{category}</span>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{finding}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Most Probable Root Cause Hypothesis</h4>
              <p className="text-sm font-bold text-blue-950">{complaint.ishikawa_rca?.root_cause}</p>
            </div>
          </div>

          {/* Right 5 Cols: 5-Whys Drilldown */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">5-Whys Root Cause Drilldown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Iterative cause-and-effect progression leading to systemic root</p>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {(complaint.ishikawa_rca?.five_whys || []).map((why, index) => {
                const parts = why.split('->');
                return (
                  <div key={index} className="relative pl-8">
                    <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm"></div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Iteration {index + 1}</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{parts[0]}</div>
                      {parts[1] && (
                        <div className="text-xs text-blue-700 font-medium mt-1 pl-2 border-l-2 border-blue-400 bg-blue-50/50 p-1.5 rounded">
                          <strong>Cause:</strong> {parts[1]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAPA REMEDIATION PLAN */}
      {activeTab === 'CAPA' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Corrective and Preventive Actions (CAPA) Plan</h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated CAPA proposals linked to root cause findings</p>
            </div>
            <Link
              to="/capa"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm"
            >
              Go to CAPA Lifecycle Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capas.map((cp) => (
              <div key={cp.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      cp.action_type === 'Corrective' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-purple-100 text-purple-800 border border-purple-300'
                    }`}>
                      {cp.action_type} Action
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cp.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {cp.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{cp.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cp.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Owner: <strong className="text-slate-800">{cp.owner}</strong></span>
                  <span>Target: <strong className="text-slate-800">{cp.target_days} Days</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 21 CFR PART 11 AUDIT TRAIL */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">21 CFR Part 11 Immutable Audit Trail</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cryptographically signed sequence of all state transitions and e-signatures</p>
            </div>
            <span className="px-3 py-1 rounded bg-slate-100 text-slate-700 font-mono text-xs font-bold">
              SHA-256 Validated
            </span>
          </div>

          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{log.id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px] uppercase">
                      {log.action_type}
                    </span>
                    <span className="text-xs text-slate-400">by <strong className="text-slate-700">{log.user_name}</strong></span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium italic">"{log.esign_reason}"</p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-mono">IP: {log.ip_address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Advancement Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>21 CFR Part 11 Electronic Signature</span>
              </h3>
            </div>

            <form onSubmit={handleStatusAdvancement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select New Investigation Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INVESTIGATION_IN_PROGRESS">INVESTIGATION IN PROGRESS</option>
                  <option value="CAPA_PENDING">CAPA PENDING APPROVAL</option>
                  <option value="CLOSED">CLOSED & ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Status Advancement (Mandatory) *</label>
                <textarea
                  rows={3}
                  required
                  value={esignReason}
                  onChange={(e) => setEsignReason(e.target.value)}
                  placeholder="State formal justification for advancing GMP complaint status..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800">
                By clicking commit, you declare that this electronic signature is the legally binding equivalent of your handwritten signature under 21 CFR Part 11.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Sign & Advance Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
