import React, { useState } from 'react';
import { NOTEBOOK_SECTIONS } from '../data/notebookContent';
import { Play, Copy, Check, Terminal, FileText, Table, CheckCircle2, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { StudentBatchRecord, InstructorAggregatedRecord } from '../types';

interface NotebookViewerProps {
  batches: StudentBatchRecord[];
  instructors: InstructorAggregatedRecord[];
}

export const NotebookViewer: React.FC<NotebookViewerProps> = ({ batches, instructors }) => {
  const [selectedSectionId, setSelectedSectionId] = useState<number | 'all'>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyCode = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedSections = selectedSectionId === 'all'
    ? NOTEBOOK_SECTIONS
    : NOTEBOOK_SECTIONS.filter(s => s.id === selectedSectionId);

  // Helper to render basic markdown formatting
  const renderFormattedMarkdown = (text: string) => {
    return text.split('\n\n').map((para, pIdx) => {
      if (para.startsWith('### ')) {
        return <h3 key={pIdx} className="text-lg font-bold text-slate-800 mt-4 mb-2 flex items-center">{para.replace('### ', '')}</h3>;
      }
      if (para.startsWith('#### ')) {
        return <h4 key={pIdx} className="text-base font-semibold text-slate-700 mt-3 mb-1.5">{para.replace('#### ', '')}</h4>;
      }
      if (para.startsWith('* ') || para.startsWith('1. ') || para.startsWith('2. ') || para.startsWith('3. ') || para.startsWith('4. ') || para.startsWith('5. ')) {
        const items = para.split('\n');
        return (
          <ul key={pIdx} className="list-disc pl-5 space-y-1 my-2 text-slate-700 text-sm leading-relaxed">
            {items.map((it, iIdx) => {
              const clean = it.replace(/^[*\d.]+\s*/, '');
              // Highlight bold words
              const formatted = clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code class="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono text-xs">$1</code>');
              return <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatted }} />;
            })}
          </ul>
        );
      }
      const formattedPara = para
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');
      return <p key={pIdx} className="text-slate-700 text-sm leading-relaxed my-2" dangerouslySetInnerHTML={{ __html: formattedPara }} />;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Section Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800 text-base">Jupyter Notebook Navigator</h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              16 Sections
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span>Filter Section:</span>
            <button
              onClick={() => setSelectedSectionId('all')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                selectedSectionId === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Show All 16 Sections
            </button>
          </div>
        </div>

        {/* Section Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto pr-1">
          {NOTEBOOK_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionId(sec.id)}
              className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium truncate transition flex items-center justify-between border ${
                selectedSectionId === sec.id
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
              }`}
              title={sec.title}
            >
              <span className="truncate">Sec {sec.id}: {sec.title.replace(/^\d+\.\s*/, '')}</span>
              <ChevronRight className="w-3 h-3 ml-1 flex-shrink-0 opacity-50" />
            </button>
          ))}
        </div>
      </div>

      {/* Notebook Cells Container */}
      <div className="space-y-8">
        {displayedSections.map((section) => (
          <div
            key={section.id}
            id={`section-${section.id}`}
            className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition duration-200 hover:shadow-lg"
          >
            {/* Section Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-mono font-bold text-sm">
                  {section.id}
                </span>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {section.title}
                </h2>
              </div>
              <div className="flex items-center space-x-2 text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span>Colab Executed</span>
              </div>
            </div>

            {/* Key Takeaway Banner */}
            <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3 flex items-start space-x-3">
              <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-indigo-900">
                <span className="font-bold uppercase tracking-wider text-indigo-700 text-xs block mb-0.5">Key Takeaway</span>
                {section.keyTakeaway}
              </div>
            </div>

            {/* Markdown Explanation Block */}
            <div className="p-6 bg-white border-b border-slate-100">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Markdown Explanation & Rationale</span>
              </div>
              <div className="prose max-w-none text-slate-700">
                {renderFormattedMarkdown(section.markdown)}
              </div>
            </div>

            {/* Python Code Cell */}
            {section.code && (
              <div className="bg-slate-900 text-slate-100 border-t border-slate-800 font-mono text-xs sm:text-sm">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-bold">In [{section.id}]:</span>
                    <span>Python 3 Code Cell</span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(section.id, section.code)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transition"
                    title="Copy Python Code"
                  >
                    {copiedId === section.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="leading-relaxed whitespace-pre font-mono text-slate-200">
                    {section.code}
                  </pre>
                </div>
              </div>
            )}

            {/* Simulated Cell Output Block */}
            {section.outputs && section.outputs.length > 0 && (
              <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  <span>Cell Execution Output Out [{section.id}]</span>
                </div>

                {section.outputs.map((out, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                    <div className="font-semibold text-slate-800 text-sm mb-1 flex items-center justify-between">
                      <span>{out.title || 'Output Result'}</span>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {out.type.toUpperCase()}
                      </span>
                    </div>
                    {out.summary && (
                      <p className="text-xs sm:text-sm text-slate-600 mb-3 bg-slate-50 p-2.5 rounded border border-slate-100">
                        {out.summary}
                      </p>
                    )}

                    {/* Interactive Table Preview for Section 3 (Head) or Section 8 (Aggregated) */}
                    {(section.id === 3 || section.id === 8) && (
                      <div className="overflow-x-auto mt-3 border border-slate-200 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-200 text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-semibold">
                            {section.id === 3 ? (
                              <tr>
                                <th className="px-3 py-2 text-left">batch_id</th>
                                <th className="px-3 py-2 text-left">instructor_name</th>
                                <th className="px-3 py-2 text-left">category</th>
                                <th className="px-3 py-2 text-right">completion_%</th>
                                <th className="px-3 py-2 text-right">dropout_%</th>
                                <th className="px-3 py-2 text-right">quiz_score</th>
                                <th className="px-3 py-2 text-right">feedback</th>
                                <th className="px-3 py-2 text-right">tier</th>
                              </tr>
                            ) : (
                              <tr>
                                <th className="px-3 py-2 text-left">instructor_id</th>
                                <th className="px-3 py-2 text-left">name</th>
                                <th className="px-3 py-2 text-right">batches</th>
                                <th className="px-3 py-2 text-right">avg_completion</th>
                                <th className="px-3 py-2 text-right">avg_quiz</th>
                                <th className="px-3 py-2 text-right">engagement</th>
                                <th className="px-3 py-2 text-right">ml_score</th>
                                <th className="px-3 py-2 text-right">tier</th>
                              </tr>
                            )}
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {section.id === 3 ? (
                              batches.slice(0, 5).map((b, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-mono text-slate-500">{b.batch_id}</td>
                                  <td className="px-3 py-2 font-medium text-slate-800">{b.instructor_name}</td>
                                  <td className="px-3 py-2 text-slate-600">{b.course_category}</td>
                                  <td className="px-3 py-2 text-right font-medium text-indigo-600">{b.completion_rate}%</td>
                                  <td className="px-3 py-2 text-right text-rose-600">{b.dropout_rate}%</td>
                                  <td className="px-3 py-2 text-right">{b.avg_quiz_score}</td>
                                  <td className="px-3 py-2 text-right font-medium">★ {b.avg_feedback_score}</td>
                                  <td className="px-3 py-2 text-right">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      b.Effectiveness_Tier === 'High' ? 'bg-emerald-100 text-emerald-800' :
                                      b.Effectiveness_Tier === 'Low' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {b.Effectiveness_Tier}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              instructors.slice(0, 5).map((inst, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-mono text-slate-500">{inst.instructor_id}</td>
                                  <td className="px-3 py-2 font-medium text-slate-800">{inst.instructor_name}</td>
                                  <td className="px-3 py-2 text-right font-semibold">{inst.number_of_batches}</td>
                                  <td className="px-3 py-2 text-right font-medium text-indigo-600">{inst.average_completion}%</td>
                                  <td className="px-3 py-2 text-right">{inst.average_quiz_score}</td>
                                  <td className="px-3 py-2 text-right font-medium">{inst.engagement_score}</td>
                                  <td className="px-3 py-2 text-right font-bold text-purple-700">{inst.Instructor_Effectiveness_Score}</td>
                                  <td className="px-3 py-2 text-right">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      inst.Effectiveness_Tier === 'High' ? 'bg-emerald-100 text-emerald-800' :
                                      inst.Effectiveness_Tier === 'Low' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {inst.Effectiveness_Tier}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
