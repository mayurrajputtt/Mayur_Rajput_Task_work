import React, { useState } from 'react';
import { Cpu, Target, CheckCircle2, AlertTriangle, Layers, BarChart3 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend, BarChart, Bar } from 'recharts';
import { AnalyticsPackage } from '../types';

interface MachineLearningLabProps {
  data: AnalyticsPackage;
}

export const MachineLearningLab: React.FC<MachineLearningLabProps> = ({ data }) => {
  const [selectedCluster, setSelectedCluster] = useState<number | 'all'>('all');
  const [modelTab, setModelTab] = useState<'rf' | 'lr'>('rf');

  const activeModel = data.ml_results.models.find(m => m.name.includes(modelTab === 'rf' ? 'Random Forest' : 'Logistic Regression')) || data.ml_results.models[0];

  const filteredScatter = selectedCluster === 'all' 
    ? data.pca_scatter_points 
    : data.pca_scatter_points.filter(p => p.cluster_id === selectedCluster);

  return (
    <div className="space-y-8">
      {/* SECTION 1: MACHINE LEARNING PROFITABILITY PREDICTOR */}
      <div className="bg-[#131C31] p-6 rounded-lg border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-sm bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-semibold uppercase mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Supervised Classification | Scikit-Learn Model Evaluation</span>
            </div>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">
              Trader Profitability Prediction Engine
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Predicting whether an account will achieve positive net PnL using behavioral execution features: <code className="text-blue-400">Win_Rate</code>, <code className="text-cyan-400">Avg_Leverage</code>, <code className="text-amber-400">Activity_Score</code>, and <code className="text-emerald-400">Avg_Trade_Size</code>.
            </p>
          </div>
          <div className="flex space-x-2 bg-[#0F172A] p-1.5 rounded-sm border border-slate-700 self-start md:self-auto">
            <button
              onClick={() => setModelTab('rf')}
              className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                modelTab === 'rf' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Random Forest
            </button>
            <button
              onClick={() => setModelTab('lr')}
              className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                modelTab === 'lr' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Logistic Regression
            </button>
          </div>
        </div>

        {/* Model KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6 font-mono">
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
            <div className="text-xl font-black text-emerald-400 mt-1">{activeModel.accuracy.toFixed(1)}%</div>
            <span className="text-[10px] text-slate-500">Overall Correct</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Precision</span>
            <div className="text-xl font-black text-blue-400 mt-1">{activeModel.precision.toFixed(1)}%</div>
            <span className="text-[10px] text-slate-500">True Positive Rate</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Recall (Sensitivity)</span>
            <div className="text-xl font-black text-purple-400 mt-1">{activeModel.recall.toFixed(1)}%</div>
            <span className="text-[10px] text-slate-500">Captured Winners</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">F1 Score</span>
            <div className="text-xl font-black text-amber-400 mt-1">{activeModel.f1_score.toFixed(1)}%</div>
            <span className="text-[10px] text-slate-500">Harmonic Mean</span>
          </div>
          <div className="bg-[#0F172A] p-4 rounded border border-slate-700 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">ROC-AUC</span>
            <div className="text-xl font-black text-cyan-400 mt-1">{activeModel.roc_auc.toFixed(3)}</div>
            <span className="text-[10px] text-slate-500">Area Under Curve</span>
          </div>
        </div>

        {/* Charts Row: Feature Importance & ROC Curve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0F172A] p-5 rounded border border-slate-700">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-l-2 border-emerald-500 pl-2">Predictive Feature Importances (Random Forest)</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Relative weight of each quantitative behavioral metric in profitability classification</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ml_results.feature_importance} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 0.45]} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={11} width={130} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val: any) => [`${(val*100).toFixed(1)}%`, 'Gini Importance']}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {data.ml_results.feature_importance.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.direction === 'Positive' ? '#10b981' : (entry.direction === 'Negative' ? '#ef4444' : '#3b82f6')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-sm bg-emerald-500"></span><span>Positive Impact on PnL</span></span>
              <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-sm bg-red-500"></span><span>Negative Impact (Overleverage)</span></span>
            </div>
          </div>

          <div className="bg-[#0F172A] p-5 rounded border border-slate-700">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-l-2 border-emerald-500 pl-2">ROC Curve Comparison (Receiver Operating Characteristic)</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">Evaluating True Positive Rate vs False Positive Rate across classification thresholds</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.ml_results.roc_curve}>
                  <XAxis dataKey="fpr" stroke="#64748b" fontSize={11} label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748b' }} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 1]} label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val: any, name: any) => [val.toFixed(2), name === 'tpr_rf' ? 'Random Forest (AUC=0.884)' : 'Logistic Reg (AUC=0.812)']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="tpr_rf" name="Random Forest Classifier" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="tpr_lr" name="Logistic Regression" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="linear" dataKey="fpr" name="Random Baseline" stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Visualizer */}
        <div className="mt-6 p-5 bg-[#0F172A] rounded border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6 font-mono">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 uppercase tracking-wider border-l-2 border-emerald-500 pl-2">
              <span>🎯 Confusion Matrix Analysis ({activeModel.name.split('(')[0]})</span>
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Out of 3,300 test validation samples, the Random Forest model correctly classified <strong>1,420 unprofitable traders</strong> (True Negatives) and <strong>1,310 profitable traders</strong> (True Positives), achieving minimal false positive leakage.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 bg-[#1E293B] p-3 rounded border border-slate-700 text-center text-xs w-full sm:w-72">
            <div className="bg-[#0F172A] p-2.5 rounded border border-emerald-500/30">
              <span className="text-[10px] text-slate-400 uppercase">True Negatives</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">{activeModel.confusion_matrix[0][0].toLocaleString()}</div>
            </div>
            <div className="bg-[#0F172A] p-2.5 rounded border border-red-500/30">
              <span className="text-[10px] text-slate-400 uppercase">False Positives</span>
              <div className="text-base font-bold text-red-400 mt-0.5">{activeModel.confusion_matrix[0][1].toLocaleString()}</div>
            </div>
            <div className="bg-[#0F172A] p-2.5 rounded border border-amber-500/30">
              <span className="text-[10px] text-slate-400 uppercase">False Negatives</span>
              <div className="text-base font-bold text-amber-400 mt-0.5">{activeModel.confusion_matrix[1][0].toLocaleString()}</div>
            </div>
            <div className="bg-[#0F172A] p-2.5 rounded border border-blue-500/30">
              <span className="text-[10px] text-slate-400 uppercase">True Positives</span>
              <div className="text-base font-bold text-blue-400 mt-0.5">{activeModel.confusion_matrix[1][1].toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: K-MEANS TRADER CLUSTERING & PCA EXPLORER */}
      <div className="bg-[#131C31] p-6 rounded-lg border border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-700 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Unsupervised Learning | K-Means ($k=4$) with PCA Projection</span>
            </div>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">
              Trader Persona Clustering & PCA 2D Visualization
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Using the Elbow Method, traders were grouped into 4 empirical quantitative personas based on their multidimensional execution profile.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 bg-[#0F172A] p-1 rounded-sm border border-slate-700">
            <button
              onClick={() => setSelectedCluster('all')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase transition-all ${
                selectedCluster === 'all' ? 'bg-emerald-600 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Personas
            </button>
            {data.clusters.map((c) => (
              <button
                key={c.cluster_id}
                onClick={() => setSelectedCluster(c.cluster_id)}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono font-bold uppercase transition-all flex items-center space-x-1.5 ${
                  selectedCluster === c.cluster_id ? 'bg-slate-800 text-white shadow border border-slate-600' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: c.color }}></span>
                <span>Cluster {c.cluster_id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-mono">
          {data.clusters.map((c) => {
            const isSelected = selectedCluster === 'all' || selectedCluster === c.cluster_id;
            return (
              <div
                key={c.cluster_id}
                onClick={() => setSelectedCluster(c.cluster_id === selectedCluster ? 'all' : c.cluster_id)}
                className={`p-4 rounded border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-[#0F172A] border-slate-600 shadow-sm scale-[1.01]' 
                    : 'bg-slate-900/40 border-slate-800/60 opacity-40 hover:opacity-80'
                }`}
                style={{ borderTopWidth: '4px', borderTopColor: c.color }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[#1E293B] text-slate-300">
                      Cluster {c.cluster_id}
                    </span>
                    <span className="text-xs text-slate-400">{c.trader_count} accounts</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white font-sans uppercase">{c.name.split('(')[0]}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">{c.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-700 text-xs">
                  <div>Avg PnL: <span className={c.avg_pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>${(c.avg_pnl/1000).toFixed(1)}k</span></div>
                  <div>Win Rate: <span className="text-white font-bold">{c.win_rate}%</span></div>
                  <div>Avg Lev: <span className="text-cyan-400 font-bold">{c.avg_leverage}x</span></div>
                  <div>Avg Size: <span className="text-slate-300">${(c.avg_trade_size/1000).toFixed(1)}k</span></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recharts Scatter Plot */}
        <div className="bg-[#0F172A] p-6 rounded border border-slate-700 font-mono">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-2 font-sans">2D Principal Component Analysis (PCA) Projection</h3>
              <p className="text-xs text-slate-400 mt-1">Visualizing behavioral clusters in reduced dimensionality space (PCA-1 vs PCA-2)</p>
            </div>
            <div className="text-xs text-slate-400">
              Displaying {filteredScatter.length} simulated account points
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" name="PCA Component 1" stroke="#64748b" fontSize={11} label={{ value: 'PCA Component 1 (Risk Gearing & Leverage)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748b' }} />
                <YAxis type="number" dataKey="y" name="PCA Component 2" stroke="#64748b" fontSize={11} label={{ value: 'PCA Component 2 (Execution Consistency & PnL)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }} />
                <ZAxis type="number" dataKey="leverage" range={[60, 400]} name="Leverage Size" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any, name: any, props: any) => [
                    name === 'PCA Component 1' ? val : (name === 'PCA Component 2' ? val : `${props.payload.leverage}x`),
                    name
                  ]}
                  labelFormatter={() => ''}
                  content={(props) => {
                    if (!props.active || !props.payload || !props.payload[0]) return null;
                    const p = props.payload[0].payload;
                    return (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-xs shadow-xl font-mono">
                        <div className="font-bold text-white mb-1 font-sans flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                          <span>{p.cluster_name.split('(')[0]}</span>
                        </div>
                        <div>Estimated Lev: <strong className="text-cyan-400">{p.leverage}x</strong></div>
                        <div>Simulated Win Rate: <strong className="text-white">{p.win_rate}%</strong></div>
                        <div>Simulated PnL: <strong className={p.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>${p.pnl.toLocaleString()}</strong></div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Trader Personas" data={filteredScatter}>
                  {filteredScatter.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
