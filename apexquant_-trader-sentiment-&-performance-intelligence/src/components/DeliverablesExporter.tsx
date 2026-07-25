import React, { useState, useEffect } from 'react';
import { FileText, Download, Code, BookOpen, CheckCircle2, Copy, Terminal, Award } from 'lucide-react';
import { AnalyticsPackage } from '../types';
import { REPORT_CONTENT, README_CONTENT, STREAMLIT_APP_CONTENT, NOTEBOOK_GUIDE_CONTENT } from '../data/deliverablesContent';

interface DeliverablesExporterProps {
  data: AnalyticsPackage;
}

export const DeliverablesExporter: React.FC<DeliverablesExporterProps> = ({ data }) => {
  const [activeDoc, setActiveDoc] = useState<'report' | 'readme' | 'app' | 'notebook'>('report');
  const [docContent, setDocContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (activeDoc === 'report') {
      setDocContent(REPORT_CONTENT);
    } else if (activeDoc === 'readme') {
      setDocContent(README_CONTENT);
    } else if (activeDoc === 'app') {
      setDocContent(STREAMLIT_APP_CONTENT);
    } else if (activeDoc === 'notebook') {
      setDocContent(NOTEBOOK_GUIDE_CONTENT);
    }
  }, [activeDoc]);

  const handleCopy = () => {
    navigator.clipboard.writeText(docContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = (filename: string, content: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SECTION 1: DOWNLOAD HUB */}
      <div className="bg-[#1E293B] p-6 rounded-lg border border-slate-700 shadow-xl font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>100% Submission Ready | All Artifacts Generated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
              Internship Deliverables & Artifact Exporter
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl font-mono">
              All required project files have been compiled into the standard <code className="text-white">Trader-Sentiment-Analysis/</code> directory structure. Download or inspect any deliverable directly.
            </p>
          </div>
        </div>

        {/* Download Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <button
            onClick={() => handleDownloadFile('report.md', REPORT_CONTENT, 'text/markdown')}
            className="p-4 bg-[#0F172A] hover:bg-slate-800 rounded border border-slate-700 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase font-sans">Executive Report</div>
                <div className="text-[10px] text-slate-400 font-mono">report.md (One-Page)</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </button>

          <button
            onClick={() => handleDownloadFile('README.md', README_CONTENT, 'text/markdown')}
            className="p-4 bg-[#0F172A] hover:bg-slate-800 rounded border border-slate-700 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors uppercase font-sans">Project README</div>
                <div className="text-[10px] text-slate-400 font-mono">README.md (Setup Guide)</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </button>

          <button
            onClick={() => handleDownloadFile('app.py', STREAMLIT_APP_CONTENT, 'text/x-python')}
            className="p-4 bg-[#0F172A] hover:bg-slate-800 rounded border border-slate-700 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded bg-red-500/20 text-red-400 flex items-center justify-center font-bold border border-red-500/30">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors uppercase font-sans">Streamlit Dashboard</div>
                <div className="text-[10px] text-slate-400 font-mono">dashboard/app.py</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </button>

          <button
            onClick={() => handleDownloadFile('analytics.json', JSON.stringify(data, null, 2), 'application/json')}
            className="p-4 bg-[#0F172A] hover:bg-slate-800 rounded border border-slate-700 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors uppercase font-sans">Analytics Data Package</div>
                <div className="text-[10px] text-slate-400 font-mono">analytics.json (98 KB)</div>
              </div>
            </div>
            <Download className="w-5 h-5 text-slate-400 group-hover:text-white transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </div>

      {/* SECTION 2: INTERACTIVE DOCUMENT & CODE VIEWER */}
      <div className="bg-[#131C31] p-6 rounded-lg border border-slate-700 shadow-sm font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
          <div className="flex space-x-1 bg-[#0F172A] p-1 rounded-sm border border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveDoc('report')}
              className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeDoc === 'report' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>report.md</span>
            </button>
            <button
              onClick={() => setActiveDoc('readme')}
              className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeDoc === 'readme' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>README.md</span>
            </button>
            <button
              onClick={() => setActiveDoc('app')}
              className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeDoc === 'app' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>app.py (Streamlit)</span>
            </button>
            <button
              onClick={() => setActiveDoc('notebook')}
              className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeDoc === 'notebook' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Jupyter Notebook Lab</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-slate-200 rounded-sm text-xs font-mono font-semibold border border-slate-700 flex items-center space-x-1.5 transition-all uppercase tracking-wider"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Content'}</span>
            </button>
          </div>
        </div>

        {/* Code / Markdown Box */}
        <div className="relative rounded bg-[#0F172A] border border-slate-700 p-4 overflow-x-auto max-h-[500px] font-mono text-xs text-slate-300 shadow-inner">
          <pre className="whitespace-pre-wrap leading-relaxed">{docContent}</pre>
        </div>
        <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>💡 All files are formatted strictly according to PEP8 and clean markdown documentation standards.</span>
          <span>Encoding: UTF-8</span>
        </div>
      </div>
    </div>
  );
};
