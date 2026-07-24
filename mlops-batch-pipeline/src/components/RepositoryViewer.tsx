import React, { useState } from "react";
import { Copy, Check, FileText, Code, FileJson, Terminal, Layers } from "lucide-react";
import { WorkspaceFiles } from "../types";

interface RepositoryViewerProps {
  files: WorkspaceFiles;
}

export const RepositoryViewer: React.FC<RepositoryViewerProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<keyof WorkspaceFiles>("runPy");
  const [copied, setCopied] = useState(false);

  const fileMap: { id: keyof WorkspaceFiles; name: string; icon: any; lang: string }[] = [
    { id: "runPy", name: "run.py", icon: Code, lang: "python" },
    { id: "config", name: "config.yaml", icon: Layers, lang: "yaml" },
    { id: "data", name: "data.csv", icon: FileText, lang: "csv" },
    { id: "requirements", name: "requirements.txt", icon: FileText, lang: "plaintext" },
    { id: "dockerfile", name: "Dockerfile", icon: Terminal, lang: "dockerfile" },
    { id: "readme", name: "README.md", icon: FileText, lang: "markdown" },
    { id: "metrics", name: "metrics.json", icon: FileJson, lang: "json" },
    { id: "runLog", name: "run.log", icon: FileText, lang: "log" },
  ];

  const currentContent = files[selectedFile] || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
      {/* File Tree Sidebar */}
      <div className="bg-slate-950/80 border-r border-slate-800 p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          PROJECT REPOSITORY
        </div>
        {fileMap.map((file) => {
          const Icon = file.icon;
          const active = selectedFile === file.id;
          return (
            <button
              key={file.id}
              onClick={() => setSelectedFile(file.id)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                active
                  ? "bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="truncate">{file.name}</span>
            </button>
          );
        })}
      </div>

      {/* Code Display Area */}
      <div className="md:col-span-3 flex flex-col bg-slate-950">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-2 font-mono text-xs font-semibold text-white">
            <span>{fileMap.find((f) => f.id === selectedFile)?.name}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Source"}</span>
          </button>
        </div>

        <div className="p-4 font-mono text-xs text-slate-200 overflow-x-auto overflow-y-auto max-h-[600px] flex-1">
          <pre className="leading-relaxed">
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
