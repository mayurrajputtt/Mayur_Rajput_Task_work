import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setUser, setLoading, setError } from '../store/authSlice';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Sparkles, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('sarah.jenkins@aivoa.ai');
  const [password, setPassword] = useState('password123');
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const res = await authService.login(email, password);
      dispatch(setUser(res.user));
      navigate('/');
    } catch (err: any) {
      dispatch(setError(err.response?.data?.error || 'Authentication failed. Use demo credentials.'));
    }
  };

  const demoAccounts = [
    { email: 'sarah.jenkins@aivoa.ai', name: 'Sarah Jenkins', role: 'QA Manager (API & FDF)', desc: 'Full electronic signature & approval rights' },
    { email: 'david.chen@aivoa.ai', name: 'David Chen', role: 'Lead Investigator', desc: 'RCA Ishikawa & 5-Whys specialist' },
    { email: 'elena.rostova@aivoa.ai', name: 'Dr. Elena Rostova', role: 'Regulatory Officer', desc: 'FDA / EMA GMP compliance auditor' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-500/30 mb-4">
          A
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          AIVOA <span className="text-blue-500">PHARMA</span> QMS
        </h2>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          AI-Powered Quality Complaint & Regulatory Compliance Suite
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-slate-100 sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="sarah.jenkins@aivoa.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                21 CFR Part 11 Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>Remember biometric e-signature</span>
              </label>
              <span className="text-blue-600 hover:underline cursor-pointer">Reset Password?</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to PharmaQMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Selector */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                ⚡ Select Demo Role (Pass: <code className="bg-slate-100 text-slate-800 px-1 rounded">password123</code>)
              </span>
            </div>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('password123');
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    email === acc.email 
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm' 
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{acc.name}</span>
                      <span className="text-[10px] font-semibold text-slate-400">({acc.role})</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{acc.desc}</div>
                  </div>
                  {email === acc.email && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          <p className="flex items-center justify-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>FDA 21 CFR Part 11 & EU Annex 11 Validated System</span>
          </p>
        </div>
      </div>
    </div>
  );
};
