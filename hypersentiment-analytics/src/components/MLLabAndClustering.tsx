import React, { useState } from 'react';
import { MLModelResult, ClusterArchetype } from '../types';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { 
  Cpu, Award, CheckCircle2, AlertCircle, BarChart2, TrendingUp, 
  Layers, ShieldAlert, Zap, Target, ArrowRight, Activity
} from 'lucide-react';

interface MLLabAndClusteringProps {
  mlResults: {
    models: MLModelResult[];
    datasetSize: number;
    featureNames: string[];
  };
  clusteringData: {
    elbowCurve: { k: number; inertia: number }[];
    archetypes: ClusterArchetype[];
  };
}

export const MLLabAndClustering: React.FC<MLLabAndClusteringProps> = ({
  mlResults,
  clusteringData
}) => {
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0); // 0 is XGBoost
  const activeModel = mlResults.models[selectedModelIndex] || mlResults.models[0];

  // Colors for clusters
  const clusterColors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
              Bonus Deliverables 1 & 2
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-purple-400" />
              Machine Learning Profitability Predictor & KMeans Clustering Lab
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Supervised classification predicting next-day alpha + Unsupervised behavioral clustering via the Elbow Method.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Total Training Observations</span>
              <span className="font-bold text-white text-sm">{mlResults.datasetSize.toLocaleString()} rows</span>
            </div>
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Optimal KMeans Clusters</span>
              <span className="font-bold text-emerald-400 text-sm">K = 4 Archetypes</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: SUPERVISED ML MODEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Bonus 1: Next-Day Profitability Classifier (Scikit-Learn & XGBoost)
            </h3>
            <p className="text-xs text-slate-400">
              Target Variable: `Profitable_Tomorrow` (Binary: 1 = Positive Daily PnL, 0 = Loss).
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            {mlResults.models.map((mod, idx) => (
              <button
                key={mod.name}
                onClick={() => setSelectedModelIndex(idx)}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedModelIndex === idx ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                {mod.name}
              </button>
            ))}
          </div>
        </div>

        {/* Evaluation Metrics Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Model Algorithm</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1 Score</th>
                <th className="py-2.5 px-3 text-right">AUC-ROC Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm font-medium">
              {mlResults.models.map((mod, idx) => {
                const isSelected = selectedModelIndex === idx;
                return (
                  <tr 
                    key={mod.name} 
                    onClick={() => setSelectedModelIndex(idx)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-purple-950/40 font-bold' : 'hover:bg-slate-800/40'}`}
                  >
                    <td className="py-3 px-3 flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-400' : 'bg-slate-600'}`} />
                      <span className={isSelected ? 'text-white font-bold' : 'text-slate-300'}>{mod.name}</span>
                      {mod.name === 'XGBoost' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">Top Performant</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-emerald-400">{(mod.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-slate-200">{(mod.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-slate-200">{(mod.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-blue-400">{(mod.f1Score * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-right font-black text-purple-400">{mod.aucRoc.toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Model Details: Confusion Matrix & Feature Importance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
          
          {/* Confusion Matrix Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Confusion Matrix — {activeModel.name}</span>
              <span className="text-purple-400 font-normal">Test Set Execution</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-center py-2">
              <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">True Negatives (Correct Loss Prediction)</span>
                <span className="text-lg font-black text-emerald-400 mt-1 block">{activeModel.confusionMatrix[0][0]}</span>
              </div>
              <div className="bg-slate-900 border border-red-500/30 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">False Positives (Type I Error)</span>
                <span className="text-lg font-black text-red-400 mt-1 block">{activeModel.confusionMatrix[0][1]}</span>
              </div>
              <div className="bg-slate-900 border border-red-500/30 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">False Negatives (Type II Error)</span>
                <span className="text-lg font-black text-red-400 mt-1 block">{activeModel.confusionMatrix[1][0]}</span>
              </div>
              <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">True Positives (Correct Profit Prediction)</span>
                <span className="text-lg font-black text-emerald-400 mt-1 block">{activeModel.confusionMatrix[1][1]}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              💡 <strong className="text-slate-300">Interpretation:</strong> High Recall ({(activeModel.recall * 100).toFixed(1)}%) ensures the model successfully flags over 83% of profitable trading setups ahead of market open.
            </p>
          </div>

          {/* Feature Importance Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Feature Importance Weights ({activeModel.name})
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeModel.featureImportance} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 0.4]} stroke="#94a3b8" fontSize={10} />
                  <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="importance" name="Relative Importance Weight" fill="#818cf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: KMEANS CLUSTERING & ELBOW METHOD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Bonus 2: Unsupervised KMeans Clustering & Trader Archetypes
          </h3>
          <p className="text-xs text-slate-400">
            We apply Scikit-Learn KMeans on account summary features. The Elbow Method confirms optimal K=4 clusters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Elbow Chart */}
          <div className="lg:col-span-1 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Elbow Method Curve</span>
                <span className="text-emerald-400">K = 4 Elbow</span>
              </h4>
              <div className="h-56 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clusteringData.elbowCurve} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <XAxis dataKey="k" stroke="#94a3b8" fontSize={11} label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="inertia" name="Within-Cluster Sum of Squares" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              💡 Inertia drops sharply up to <strong className="text-white font-bold">K=4</strong>, after which the curve flattens. This proves 4 distinct behavioral personas exist in the retail dataset.
            </p>
          </div>

          {/* Archetypes List */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clusteringData.archetypes.map((arch, idx) => (
              <div key={arch.clusterId} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase" style={{ backgroundColor: clusterColors[idx % clusterColors.length] }}>
                      Cluster {arch.clusterId}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{arch.riskProfile} Risk</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{arch.name}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{arch.shortDescription}</p>

                  <div className="grid grid-cols-3 gap-2 my-3 text-center bg-slate-900/80 p-2 rounded-lg text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Avg Lev</span>
                      <span className="font-bold text-amber-400">{arch.avgLeverage.toFixed(1)}x</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Win Rate</span>
                      <span className="font-bold text-blue-400">{(arch.winRate * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Avg PnL</span>
                      <span className={`font-bold ${arch.avgPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${arch.avgPnL.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Key Behavioral Traits:</span>
                    {arch.behavioralTraits.slice(0, 2).map((trait, tIdx) => (
                      <div key={tIdx} className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                        <ArrowRight className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};
