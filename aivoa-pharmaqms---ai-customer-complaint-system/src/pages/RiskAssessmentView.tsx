import React from 'react';
import { useAppSelector } from '../store';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowUpRight, 
  FileText,
  TrendingUp
} from 'lucide-react';

export const RiskAssessmentView: React.FC = () => {
  const { complaints } = useAppSelector((state) => state.complaints);

  const criticalCases = complaints.filter(c => c.ich_risk_class === 'CRITICAL_CLASS_I');
  const majorCases = complaints.filter(c => c.ich_risk_class === 'MAJOR_CLASS_II');
  const minorCases = complaints.filter(c => c.ich_risk_class === 'MINOR_CLASS_III');

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-full">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold font-mono">ICH Q9 GUIDELINE</span>
            <span className="text-xs text-slate-400 font-medium">Quality Risk Management (QRM)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Pharmaceutical Risk Classification Heatmap & Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Systemic evaluation of patient hazard severity vs. probability of occurrence across active dosage forms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center min-w-[100px]">
            <div className="text-[10px] font-bold text-red-600 uppercase">Class I Critical</div>
            <div className="text-xl font-extrabold text-red-900">{criticalCases.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center min-w-[100px]">
            <div className="text-[10px] font-bold text-amber-600 uppercase">Class II Major</div>
            <div className="text-xl font-extrabold text-amber-900">{majorCases.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center min-w-[100px]">
            <div className="text-[10px] font-bold text-green-600 uppercase">Class III Minor</div>
            <div className="text-xl font-extrabold text-green-900">{minorCases.length}</div>
          </div>
        </div>
      </div>

      {/* Heatmap & Explanation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Cols: The Heatmap Matrix */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-base font-bold text-slate-900 mb-2">5x5 Risk Matrix Heatmap</h3>
          <p className="text-xs text-slate-400 text-center mb-6">Visual mapping of active investigations by calculated score</p>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-5 gap-2 w-72 h-72 border border-slate-300 p-2 bg-white rounded-xl shadow-inner relative">
              {/* Row 1: Extreme Severity */}
              <div className="bg-amber-200 rounded flex items-center justify-center text-xs font-bold text-amber-900">M</div>
              <div className="bg-red-300 rounded flex items-center justify-center text-xs font-bold text-red-900">H</div>
              <div className="bg-red-400 rounded flex items-center justify-center text-xs font-bold text-white">C</div>
              <div className="bg-red-500 rounded flex items-center justify-center text-xs font-bold text-white relative shadow-lg shadow-red-500/40">
                <span className="w-4 h-4 bg-white rounded-full animate-ping absolute"></span>
                <span className="text-xs font-black z-10">CEF</span>
              </div>
              <div className="bg-red-600 rounded flex items-center justify-center text-xs font-bold text-white">C</div>

              {/* Row 2 */}
              <div className="bg-green-200 rounded flex items-center justify-center text-xs font-bold text-green-900">L</div>
              <div className="bg-amber-200 rounded flex items-center justify-center text-xs font-bold text-amber-900">M</div>
              <div className="bg-red-300 rounded flex items-center justify-center text-xs font-bold text-red-900">H</div>
              <div className="bg-red-400 rounded flex items-center justify-center text-xs font-bold text-white relative">
                <span className="text-xs font-black z-10">AMX</span>
              </div>
              <div className="bg-red-500 rounded flex items-center justify-center text-xs font-bold text-white">C</div>

              {/* Row 3 */}
              <div className="bg-green-100 rounded flex items-center justify-center text-xs font-bold text-green-800">L</div>
              <div className="bg-green-200 rounded flex items-center justify-center text-xs font-bold text-green-900">L</div>
              <div className="bg-amber-200 rounded flex items-center justify-center text-xs font-bold text-amber-900 relative">
                <span className="text-xs font-black z-10">IBU</span>
              </div>
              <div className="bg-red-300 rounded flex items-center justify-center text-xs font-bold text-red-900 relative">
                <span className="text-xs font-black z-10">CMP</span>
              </div>
              <div className="bg-red-400 rounded flex items-center justify-center text-xs font-bold text-white">C</div>

              {/* Row 4 */}
              <div className="bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-400">L</div>
              <div className="bg-green-100 rounded flex items-center justify-center text-xs font-bold text-green-800">L</div>
              <div className="bg-green-200 rounded flex items-center justify-center text-xs font-bold text-green-900">L</div>
              <div className="bg-amber-200 rounded flex items-center justify-center text-xs font-bold text-amber-900">M</div>
              <div className="bg-red-300 rounded flex items-center justify-center text-xs font-bold text-red-900">H</div>

              {/* Row 5: Low Severity */}
              <div className="bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-400">L</div>
              <div className="bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-400">L</div>
              <div className="bg-green-100 rounded flex items-center justify-center text-xs font-bold text-green-800 relative">
                <span className="text-xs font-black z-10">MET</span>
              </div>
              <div className="bg-green-200 rounded flex items-center justify-center text-xs font-bold text-green-900">L</div>
              <div className="bg-amber-200 rounded flex items-center justify-center text-xs font-bold text-amber-900">M</div>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">X-Axis: Occurrence Probability (Rare → Frequent)</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">Y-Axis: Patient Hazard Severity (Negligible ↑ Critical)</span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: ICH Q9 Guidelines & Active List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Regulatory Classification Definitions</h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">Class I (Critical - Immediate Safety Hazard)</h4>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    Defects that present reasonable probability that use of, or exposure to, a defective product will cause serious adverse health consequences or death (e.g., particulate matter in sterile parenteral injectables). Requires immediate 24-hour notification to FDA / EMA.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Class II (Major - Potential Efficacy Loss)</h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Defects that may cause temporary or medically reversible adverse health consequences or where probability of serious adverse consequences is remote (e.g., tablet capping, inner foil seal leakage, polymorphic API changes).
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-green-50 border border-green-200/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-green-900 uppercase tracking-wider">Class III (Minor - Cosmetic / Packaging)</h4>
                  <p className="text-xs text-green-800 mt-1 leading-relaxed">
                    Defects that are not likely to cause adverse health consequences, but represent a departure from GMP standards (e.g., carton ink scuffing, minor barcode unreadability).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Risk Register Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Active High-Risk Investigations Register</h3>
            <div className="space-y-3">
              {complaints.filter(c => c.ich_risk_class !== 'MINOR_CLASS_III').map(c => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 flex items-center justify-between gap-4 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{c.complaint_code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.ich_risk_class === 'CRITICAL_CLASS_I' ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {c.ich_risk_class.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-1">{c.product_name} (<span className="font-mono">{c.batch_number}</span>)</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-md">{c.title}</div>
                  </div>

                  <Link
                    to={`/complaints/${c.id}`}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
