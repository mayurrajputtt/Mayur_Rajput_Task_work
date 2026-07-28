import React from 'react';
import { useAppSelector, useAppDispatch } from '../store';
import { logout } from '../store/authSlice';
import { ShieldCheck, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/intake':
        return 'Log Customer Complaint (AI Intake Module)';
      case '/complaints':
        return 'Quality Complaints Register (API & FDF)';
      case '/risk':
        return 'ICH Q9 Quality Risk Assessment Heatmap';
      case '/capa':
        return 'Corrective and Preventive Actions (CAPA) Lifecycle';
      case '/docs':
        return 'QMS Regulatory Architecture & Research Docs';
      case '/':
        return 'Quality Management Executive Dashboard';
      default:
        if (location.pathname.startsWith('/complaints/')) {
          return 'Complaint Investigation & Root Cause Analysis';
        }
        return 'AIVOA PharmaQMS';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{getPageTitle()}</h1>
        <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
          <span>Module: <strong className="text-slate-600">QA / QC Regulatory Compliance</strong></span>
          <span>•</span>
          <span>Status: <span className="text-blue-600 font-medium">Active Monitoring</span></span>
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* AI Connection Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Groq Gemma2-9B Connected</span>
        </div>

        {/* 21 CFR Part 11 Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold tracking-tight uppercase border border-blue-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>21 CFR 11 Audit Trail Enabled</span>
        </div>

        {/* User Profile & Logout */}
        {user ? (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</div>
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user.role.replace('_', ' ')}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              {user.name.charAt(0)}
            </div>
            <button
              onClick={() => dispatch(logout())}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-slate-500" />
          </div>
        )}
      </div>
    </header>
  );
};
