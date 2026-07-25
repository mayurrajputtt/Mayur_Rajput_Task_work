import React, { useState } from 'react';
import { NotebookCell } from '../types';
import { getNotebookCells, generatePythonScriptText } from '../utils/notebookGenerator';
import { FileCode, Download, Copy, Check, Play, Terminal, Code2, BookOpen, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export const NotebookViewer: React.FC = () => {
  const cells = getNotebookCells();
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCellId(id);
    setTimeout(() => setCopiedCellId(null), 2000);
  };

  const handleDownloadIpynb = () => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    
    // Construct standard valid Jupyter Notebook JSON schema
    const notebookJson = {
      cells: cells.map((cell, index) => {
        if (cell.type === 'markdown') {
          return {
            cell_type: 'markdown',
            metadata: {},
            source: cell.content.split('\n').map((line, i, arr) => i < arr.length - 1 ? line + '\n' : line)
          };
        } else {
          return {
            cell_type: 'code',
            execution_count: index + 1,
            metadata: {},
            outputs: cell.output ? [
              {
                name: 'stdout',
                output_type: 'stream',
                text: cell.output.split('\n').map((line, i, arr) => i < arr.length - 1 ? line + '\n' : line)
              }
            ] : [],
            source: cell.content.split('\n').map((line, i, arr) => i < arr.length - 1 ? line + '\n' : line)
          };
        }
      }),
      metadata: {
        kernelspec: {
          display_name: 'Python 3 (ipykernel)',
          language: 'python',
          name: 'python3'
        },
        language_info: {
          codemirror_mode: { name: 'ipython', version: 3 },
          file_extension: '.py',
          mimetype: 'text/x-python',
          name: 'python',
          nbconvert_exporter: 'python',
          pygments_lexer: 'ipython3',
          version: '3.11.0'
        }
      },
      nbformat: 4,
      nbformat_minor: 5
    };

    const blob = new Blob([JSON.stringify(notebookJson, null, 2)], { type: 'application/x-ipynb+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Trader_Sentiment_Analysis.ipynb');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPy = () => {
    const pyText = generatePythonScriptText();
    const blob = new Blob([pyText], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Trader_Sentiment_Analysis.py');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            PEP8 Production Standard
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2">
            <FileCode className="w-6 h-6 text-blue-400" />
            Interactive Jupyter Notebook Viewer (`Trader_Sentiment_Analysis.ipynb`)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every section generated step-by-step with modular functions, markdown explanations, and robust error handling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPy}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            <Code2 className="w-4 h-4 text-purple-400" />
            <span>Download .py Script</span>
          </button>
          <button
            onClick={handleDownloadIpynb}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>Download Submission .ipynb</span>
          </button>
        </div>
      </div>

      {/* Notebook Cells Container */}
      <div className="space-y-4">
        {cells.map((cell, idx) => (
          <div key={cell.id} className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-slate-700">
            
            {/* Cell Header */}
            <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  cell.type === 'code' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {cell.type === 'code' ? `In [${idx + 1}]: Code` : 'Markdown Explanation'}
                </span>
                {cell.title && (
                  <span className="font-semibold text-white">{cell.title}</span>
                )}
              </div>

              {cell.type === 'code' && (
                <button
                  onClick={() => handleCopyCode(cell.content, cell.id)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy Python Code"
                >
                  {copiedCellId === cell.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold text-[11px]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy Code</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Cell Body */}
            <div className="p-4 sm:p-5">
              {cell.type === 'markdown' ? (
                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <div className="whitespace-pre-line font-sans">{cell.content}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto text-xs font-mono text-indigo-200 leading-relaxed">
                    <code>{cell.content}</code>
                  </pre>
                  {cell.output && (
                    <div className="bg-slate-950/60 p-3 rounded-xl border-l-2 border-emerald-500 text-xs font-mono text-slate-300">
                      <span className="text-[10px] text-emerald-400 font-bold block mb-1">Out [{idx + 1}]:</span>
                      <pre className="whitespace-pre-wrap">{cell.output}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
