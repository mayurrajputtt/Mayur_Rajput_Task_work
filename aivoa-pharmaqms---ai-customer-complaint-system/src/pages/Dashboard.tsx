import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { analyticsService, complaintService, AnalyticsData, Complaint } from '../services/api';
import { setComplaintsData } from '../store/complaintSlice';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  ArrowUpRight, 
  FileText,
  Activity,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { complaints } = useAppSelector((state) => state.complaints);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anData, compData] = await Promise.all([
          analyticsService.getAnalytics(),
          complaintService.getComplaints({ limit: 5 })
        ]);
        setAnalytics(anData);
        dispatch(setComplaintsData(compData));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const COLORS = ['#2563EB', '#F59E0B', '#EF4444', '#10B981'];

  if (loading || !analytics) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-600">Aggregating QMS Quality Metrics & LangGraph Analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-full">
      {/* Top Banner Alert for Critical Class I */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-red-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-black uppercase tracking-widest">CRITICAL CLASS I ALERT</span>
              <span className="text-xs text-red-300 font-medium">1 Active High-Hazard Case Required Immediate Review</span>
            </div>
            <h3 className="text-lg font-bold mt-1">Particulate Matter in Sterile Ceftriaxone Sodium Vials (CEF-7719-S)</h3>
            <p className="text-xs text-slate-300 mt-0.5">Elastomeric micro-fragmentation from out-of-spec rubber stopper hardness. Quarantine executed.</p>
          </div>
        </div>
        <Link
          to="/complaints/CMP-2026-0095"
          className="px-5 py-2.5 rounded-xl bg-white text-red-900 font-bold text-xs hover:bg-red-50 transition-all shadow-md shrink-0 flex items-center gap-2 relative z-10"
        >
          <span>View Ishikawa 5-Whys</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Complaints</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{analytics.metrics.totalComplaints}</div>
            <div className="text-xs font-medium text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14% intake volume from July</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Resolution Timeline</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{analytics.metrics.avgResolutionDays} <span className="text-sm font-bold text-slate-400">days</span></div>
            <div className="text-xs font-medium text-green-600 flex items-center gap-1 mt-1">
              <span>-1.4 days faster vs. manual QMS</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Duplicate Detection</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{analytics.metrics.duplicateRate}</div>
            <div className="text-xs font-medium text-purple-600 flex items-center gap-1 mt-1">
              <span>Cosine similarity accuracy {analytics.metrics.aiAccuracyScore}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ICH Q9 Risk Breakdown</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-red-600 uppercase">Class I</div>
              <div className="text-xl font-bold text-slate-900">{analytics.metrics.criticalClassI}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase">Class II</div>
              <div className="text-xl font-bold text-slate-900">{analytics.metrics.majorClassII}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-green-600 uppercase">Class III</div>
              <div className="text-xl font-bold text-slate-900">{analytics.metrics.minorClassIII}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Trends & Root Cause Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Complaint Intake vs Resolution Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Complaint Intake vs. Resolved Rate</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tracking volume trends and CAPA closure efficiency (2026)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span className="text-slate-600">Intake Logged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-slate-600">CAPA Closed</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlyTrends}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="complaints" name="Intake Logged" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
                <Area type="monotone" dataKey="resolved" name="CAPA Closed" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ishikawa Root Cause Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ishikawa 6-M Root Cause Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Primary defect vectors identified across batches</p>
          </div>
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics.rootCauseDistribution} margin={{ left: 30, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Incidents" radius={[0, 8, 8, 0]}>
                  {analytics.rootCauseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#2563EB' : index === 1 ? '#3B82F6' : '#60A5FA'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <strong>Insight:</strong> Machine tooling calibration accounts for 40% of physical defects.
          </div>
        </div>
      </div>

      {/* Recent High-Priority Investigations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Quality Complaint Intake Register</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time FDA GMP investigation tracking with AI completeness scores</p>
          </div>
          <Link
            to="/complaints"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <span>View All Complaints</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3.5 px-6">Complaint Code & Product</th>
                <th className="py-3.5 px-6">Defect Type / Source</th>
                <th className="py-3.5 px-6">ICH Q9 Risk Class</th>
                <th className="py-3.5 px-6">Assigned QA Lead</th>
                <th className="py-3.5 px-6">Completeness</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{c.complaint_code}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{c.product_name} (<span className="font-mono">{c.batch_number}</span>)</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-800">{c.complaint_type}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{c.source} • {c.customer_name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.ich_risk_class === 'CRITICAL_CLASS_I' ? 'bg-red-100 text-red-800 border border-red-200' :
                      c.ich_risk_class === 'MAJOR_CLASS_II' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {c.ich_risk_class.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {c.assigned_name.charAt(0)}
                      </div>
                      <span>{c.assigned_name}</span>
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
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-all shadow-sm"
                    >
                      <span>Investigate</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
