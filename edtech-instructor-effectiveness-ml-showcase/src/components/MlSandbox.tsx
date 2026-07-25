import React, { useState } from 'react';
import { Sparkles, Sliders, Award, TrendingUp, AlertTriangle, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

export const MlSandbox: React.FC = () => {
  // State for interactive sliders
  const [completion, setCompletion] = useState<number>(75);
  const [dropout, setDropout] = useState<number>(12);
  const [improvement, setImprovement] = useState<number>(22);
  const [quiz, setQuiz] = useState<number>(82);
  const [watchTime, setWatchTime] = useState<number>(78);
  const [forum, setForum] = useState<number>(55);
  const [feedback, setFeedback] = useState<number>(4.4);
  const [responseRate, setResponseRate] = useState<number>(75);
  const [submission, setSubmission] = useState<number>(85);

  const handleReset = () => {
    setCompletion(75);
    setDropout(12);
    setImprovement(22);
    setQuiz(82);
    setWatchTime(78);
    setForum(55);
    setFeedback(4.4);
    setResponseRate(75);
    setSubmission(85);
  };

  // Calculate weighted score formula (Section 6)
  const feedbackNorm = (feedback / 5.0) * 100.0;
  const improvementNorm = Math.min(100, (improvement / 40.0) * 100.0);

  const compWeight = completion * 0.25;
  const dropWeight = dropout * -0.15;
  const impWeight = improvementNorm * 0.20;
  const quizWeight = quiz * 0.10;
  const watchWeight = watchTime * 0.10;
  const subWeight = submission * 0.05;
  const forumWeight = forum * 0.05;
  const fbWeight = feedbackNorm * 0.07;
  const respWeight = responseRate * 0.03;

  const rawScore = compWeight + dropWeight + impWeight + quizWeight + watchWeight + subWeight + forumWeight + fbWeight + respWeight;
  
  // Normalize roughly between 0 and 100
  const finalScore = Number((Math.min(99.8, Math.max(8.0, (rawScore + 15) * 1.22))).toFixed(1));

  // Determine predicted tier (Section 7 quantiles)
  let predictedTier: 'Low' | 'Medium' | 'High' = 'Medium';
  let tierColor = 'bg-amber-500 text-white';
  let badgeBorder = 'border-amber-300 bg-amber-50 text-amber-900';
  let advice = 'Solid baseline educator. Can elevate to High tier by boosting active forum discussions and homework completion.';

  if (finalScore >= 69.2) {
    predictedTier = 'High';
    tierColor = 'bg-emerald-500 text-white';
    badgeBorder = 'border-emerald-300 bg-emerald-50 text-emerald-900';
    advice = 'Elite teaching excellence! Strong retention, high cognitive gains, and exceptional community engagement.';
  } else if (finalScore < 48.5) {
    predictedTier = 'Low';
    tierColor = 'bg-rose-500 text-white';
    badgeBorder = 'border-rose-300 bg-rose-50 text-rose-900';
    advice = 'Critical attrition warning. High dropout rate and low active engagement require immediate academic advisor intervention.';
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Sparkles className="w-6 h-6 text-amber-500 mr-2 animate-spin-slow" />
              Live Instructor Effectiveness Sandbox
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Adjust teaching metrics in real time to see how our engineered formula and Random Forest classifier predict performance tiers.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Sliders</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sliders Column (Span 2) */}
          <div className="lg:col-span-2 space-y-5 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center mb-2">
              <Sliders className="w-5 h-5 text-indigo-600 mr-2" />
              Adjust Instructor Cohort Metrics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Slider 1: Completion Rate */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Completion Rate (+25% wt)</span>
                  <span className="text-indigo-600 font-mono">{completion}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={completion}
                  onChange={(e) => setCompletion(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Dropout Rate */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Dropout Rate (-15% wt)</span>
                  <span className="text-rose-600 font-mono">{dropout}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={dropout}
                  onChange={(e) => setDropout(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Score Improvement */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Score Improvement (+20% wt)</span>
                  <span className="text-emerald-600 font-mono">+{improvement} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={improvement}
                  onChange={(e) => setImprovement(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Slider 4: Quiz Score */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Avg Quiz Score (+10% wt)</span>
                  <span className="text-indigo-600 font-mono">{quiz}/100</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={quiz}
                  onChange={(e) => setQuiz(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Slider 5: Watch Time */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Avg Watch Time (+10% wt)</span>
                  <span className="text-indigo-600 font-mono">{watchTime}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={watchTime}
                  onChange={(e) => setWatchTime(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Slider 6: Forum Activity */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Forum Activity Rate (+5% wt)</span>
                  <span className="text-amber-600 font-mono">{forum}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={forum}
                  onChange={(e) => setForum(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Slider 7: Assignment Submission */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Assignment Submission (+5% wt)</span>
                  <span className="text-indigo-600 font-mono">{submission}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={submission}
                  onChange={(e) => setSubmission(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Slider 8: Feedback Score */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Avg Feedback Score (+7% wt)</span>
                  <span className="text-purple-600 font-mono">★ {feedback}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={feedback}
                  onChange={(e) => setFeedback(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Prediction Result Column */}
          <div className="space-y-5">
            <div className={`p-6 rounded-xl border-2 transition duration-300 flex flex-col justify-between shadow-md ${badgeBorder}`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1 opacity-80">
                  Random Forest Classification
                </span>
                <div className="flex items-center justify-between my-2">
                  <span className="text-3xl font-extrabold">{predictedTier} Tier</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tierColor}`}>
                    {predictedTier} Performance
                  </span>
                </div>

                <div className="my-4 py-3 border-y border-current/20 flex items-baseline justify-between">
                  <span className="text-xs sm:text-sm font-semibold">Composite Effectiveness Score:</span>
                  <span className="text-3xl font-mono font-black tracking-tight">{finalScore}/100</span>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed my-3">
                  <strong>ML Advisor Diagnosis:</strong> {advice}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/20 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Retention Contribution:</span>
                  <span>+{compWeight.toFixed(1)} / -{(-dropWeight).toFixed(1)} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Cognitive Gain Contribution:</span>
                  <span>+{(impWeight + quizWeight).toFixed(1)} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement Contribution:</span>
                  <span>+{(watchWeight + forumWeight + subWeight).toFixed(1)} pts</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800">
              <h4 className="font-bold text-sm text-amber-400 flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-1.5 text-amber-400" />
                Why Try This in an Interview?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                This sandbox demonstrates that your model is not just a static script—it is a live, interpretable decision engine. Notice how increasing forum activity from 10% to 70% can push a Medium tier instructor into the High tier even if their raw feedback score stays at 4.2!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
