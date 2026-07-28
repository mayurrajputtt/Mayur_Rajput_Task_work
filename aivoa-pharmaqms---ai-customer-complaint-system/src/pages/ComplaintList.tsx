import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { complaintService, Complaint } from '../services/api';
import { setComplaintsData, setStatusFilter, setRiskFilter, setSearchQuery } from '../store/complaintSlice';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  FilePlus, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Sparkles, 
  Building2, 
  Package,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const ComplaintList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { complaints, total, statusFilter, riskFilter, searchQuery, loading } = useAppSelector((state) => state.complaints);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const fetchComplaints = async () => {
    try {
      const res = await complaintService.getComplaints({
        status: statusFilter,
        risk_class: riskFilter,
        search: searchQuery,
        limit: 50
      });
      dispatch(setComplaintsData(res));
    } catch (err) {
      console.error('Error fetching complaint list:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, riskFilter, searchQuery, dispatch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(localSearch));
  };

  const handleExportCSV = () => {
    const headers = "Complaint Code,Title,Customer,Product,Batch Number,ICH Risk Class,Completeness Score,Status,Assigned Lead\n";
    const rows = complaints.map(c => 
      `"${c.complaint_code}","${c.title}","${c.customer_name}","${c.product_name}","${c.batch_number}","${c.ich_risk_class}","${c.completeness_score}%","${c.status}","${c.assigned_name}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aivoa_pharma_complaints_register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50/50 min-h-full flex flex-col">
      {/* Top Controls & Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by complaint code (CMP-2026-0089), product, lot number, or customer facility..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => dispatch(setStatusFilter(e.target.value))}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shrink-0"
          >
            <option value="ALL">All Investigation Statuses ({total})</option>
            <option value="PENDING_TRIAGE">Pending QA Triage</option>
            <option value="INVESTIGATION_IN_PROGRESS">Investigation In Progress</option>
            <option value="CAPA_PENDING">CAPA Pending Approval</option>
            <option value="CLOSED">Closed & Archived</option>
          </select>

          {/* Risk Class Filter */}
          <select
            value={riskFilter}
            onChange={(e) => dispatch(setRiskFilter(e.target.value))}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shrink-0"
          >
            <option value="ALL">All ICH Q9 Risk Classes</option>
            <option value="CRITICAL_CLASS_I">Class I (Critical Safety)</option>
            <option value="MAJOR_CLASS_II">Class II (Major Defect)</option>
            <option value="MINOR_CLASS_III">Class III (Minor Cosmetic)</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
            title="Export Register to CSV for FDA / EMA Inspection"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Register</span>
          </button>

          {/* New Intake Button */}
          <Link
            to="/intake"
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
          >
            <FilePlus className="w-4 h-4" />
            <span>Log New Complaint</span>
          </Link>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">Pharmaceutical QMS Active Complaints Register</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono font-bold text-xs">{total} Cases</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Automated Vector Deduplication Active
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-4 px-6">Complaint Code</th>
                <th className="py-4 px-6">Product & Dosage Grade</th>
                <th className="py-4 px-6">Defect Description / Source</th>
                <th className="py-4 px-6">ICH Q9 Risk Class</th>
                <th className="py-4 px-6">Lead Investigator</th>
                <th className="py-4 px-6">Completeness</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No complaints matching current search filters.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold font-mono text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span>{c.complaint_code}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Lot: <span className="font-mono font-bold text-slate-600">{c.batch_number}</span></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{c.product_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{c.product_grade}</div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-semibold text-slate-800 truncate">{c.title}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.source} • {c.customer_name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold shadow-2xs ${
                        c.ich_risk_class === 'CRITICAL_CLASS_I' ? 'bg-red-500 text-white' :
                        c.ich_risk_class === 'MAJOR_CLASS_II' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {c.ich_risk_class === 'CRITICAL_CLASS_I' && <ShieldAlert className="w-3 h-3" />}
                        <span>{c.ich_risk_class.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {c.assigned_name.charAt(0)}
                        </div>
                        <span className="truncate">{c.assigned_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${c.completeness_score >= 95 ? 'bg-green-500' : 'bg-amber-500'}`} 
                            style={{ width: `${c.completeness_score}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] font-bold">{c.completeness_score}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'INVESTIGATION_IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        c.status === 'CAPA_PENDING' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        c.status === 'CLOSED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/complaints/${c.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-all shadow-2xs"
                      >
                        <span>Investigate</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
