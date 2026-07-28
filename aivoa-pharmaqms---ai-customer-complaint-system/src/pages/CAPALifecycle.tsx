import React, { useEffect, useState } from 'react';
import { capaService, CAPA } from '../services/api';
import { useAppSelector } from '../store';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Calendar,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CAPALifecycle: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [capas, setCapas] = useState<CAPA[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Electronic signature approval modal state
  const [selectedCapa, setSelectedCapa] = useState<CAPA | null>(null);
  const [password, setPassword] = useState('');
  const [esignReason, setEsignReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const fetchCAPAs = async () => {
    try {
      const res = await capaService.getCAPAs();
      setCapas(res);
    } catch (err) {
      console.error('Error loading CAPAs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCAPAs();
  }, []);

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCapa) return;
    setIsApproving(true);
    setErrorMsg('');
    try {
      await capaService.approveCAPA(
        selectedCapa.id, 
        password, 
        esignReason || `I approve CAPA ${selectedCapa.title} via 21 CFR Part 11 electronic signature.`, 
        user?.name || 'Sarah Jenkins'
      );
      setSelectedCapa(null);
      setPassword('');
      setEsignReason('');
      await fetchCAPAs();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Invalid 21 CFR Part 11 Electronic Signature Password.');
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-600">Loading Corrective & Preventive Action (CAPA) Lifecycle...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-full">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold font-mono">GMP MODULE</span>
            <span className="text-xs text-slate-400 font-medium">ICH Q10 Pharmaceutical Quality System</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Corrective and Preventive Action (CAPA) Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage remediation workflows, assigned engineering leads, target SLA closure days, and 21 CFR 11 e-signatures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center min-w-[100px]">
            <div className="text-[10px] font-bold text-blue-600 uppercase">Proposed</div>
            <div className="text-xl font-extrabold text-blue-900">{capas.filter(c => c.status === 'PROPOSED').length}</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center min-w-[100px]">
            <div className="text-[10px] font-bold text-purple-600 uppercase">In Progress</div>
            <div className="text-xl font-extrabold text-purple-900">{capas.filter(c => c.status === 'IN_PROGRESS').length}</div>
          </div>
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center min-w-[100px]">
            <div className="text-[10px] font-bold text-green-600 uppercase">Approved</div>
            <div className="text-xl font-extrabold text-green-900">{capas.filter(c => c.status === 'APPROVED').length}</div>
          </div>
        </div>
      </div>

      {/* CAPA Register Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capas.map((cp) => (
          <div
            key={cp.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between gap-5 hover:border-blue-300 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                  {cp.id}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  cp.status === 'APPROVED' ? 'bg-green-100 text-green-800 border border-green-300' :
                  cp.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                  'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {cp.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  cp.action_type === 'Corrective' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {cp.action_type} Remediation
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Ref: <Link to={`/complaints/${cp.complaint_id}`} className="text-blue-600 hover:underline">{cp.complaint_id}</Link></span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">{cp.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{cp.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Owner: <strong className="text-slate-800">{cp.owner}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target: <strong className="text-slate-800">{cp.target_days} Days</strong></span>
                </span>
              </div>

              {cp.status === 'APPROVED' ? (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-[11px] text-green-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>e-Signed by {cp.approved_by}</span>
                  </span>
                  <span className="font-mono text-[9px] text-green-700">{new Date(cp.approved_at || '').toLocaleDateString()}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedCapa(cp);
                    setPassword('password123');
                    setEsignReason(`I approve CAPA ${cp.title} via 21 CFR Part 11 electronic signature.`);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>21 CFR 11 e-Sign & Approve</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 21 CFR Part 11 Approval Modal */}
      {selectedCapa && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>21 CFR Part 11 Electronic Signature Approval</span>
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">{selectedCapa.id}: {selectedCapa.title}</div>
              <div className="text-[11px] text-slate-500">Action: <strong className="text-blue-600">{selectedCapa.action_type}</strong> • Owner: {selectedCapa.owner}</div>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter Password for Biometric e-Signature * (<code className="text-blue-600 bg-blue-50 px-1 rounded">password123</code>)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your QA password..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Electronic Signature (Mandatory) *</label>
                <textarea
                  rows={2}
                  required
                  value={esignReason}
                  onChange={(e) => setEsignReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 leading-snug">
                By clicking approve, you certify that this electronic signature is the legally binding equivalent of your traditional handwritten signature under FDA 21 CFR Part 11.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCapa(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApproving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isApproving ? 'Verifying...' : 'Sign & Approve CAPA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
