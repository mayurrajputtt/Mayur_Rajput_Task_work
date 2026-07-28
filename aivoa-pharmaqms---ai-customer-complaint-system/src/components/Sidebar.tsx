import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FilePlus, 
  LayoutDashboard, 
  ListFilter, 
  ShieldAlert, 
  CheckCircle2, 
  BookOpen, 
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Complaint Intake', path: '/intake', icon: FilePlus },
    { name: 'Dashboard & Trends', path: '/', icon: LayoutDashboard },
    { name: 'Quality Complaints', path: '/complaints', icon: ListFilter },
    { name: 'ICH Q9 Risk Assessment', path: '/risk', icon: ShieldAlert },
    { name: 'CAPA Lifecycle', path: '/capa', icon: CheckCircle2 },
    { name: 'Knowledge & Docs', path: '/docs', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          A
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900">
          AIVOA <span className="text-blue-600 font-medium">PHARMA</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-2">
          Management & Quality
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/complaints' && location.pathname.startsWith('/complaints'));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`px-4 py-3 flex items-center gap-3 text-sm font-medium transition-colors cursor-pointer ${
                isActive ? 'sidebar-active' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-6 mb-2">
          AI & Architecture
        </div>
        <div className="px-4 py-2 flex items-center gap-3 text-xs text-slate-600">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>LangGraph 10-Step Engine</span>
        </div>
      </nav>

      {/* Regulatory Footer Badge */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-sm">
          <p className="text-xs text-slate-400 mb-1 font-medium">Regulatory Guard</p>
          <p className="text-[10px] leading-tight text-slate-200">
            FDA 21 CFR Part 11<br />
            Compliant Environment
          </p>
        </div>
      </div>
    </aside>
  );
};
