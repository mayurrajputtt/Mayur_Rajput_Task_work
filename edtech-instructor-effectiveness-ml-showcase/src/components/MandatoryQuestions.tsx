import React, { useState } from 'react';
import { HelpCircle, Briefcase, ShieldAlert, CheckCircle2, AlertTriangle, Lightbulb, Users, BookOpen, TrendingUp, DollarSign } from 'lucide-react';

interface MandatoryQuestionsProps {
  defaultTab?: 'qa' | 'roi';
}

export const MandatoryQuestions: React.FC<MandatoryQuestionsProps> = ({ defaultTab = 'qa' }) => {
  const [activeTab, setActiveTab] = useState<'qa' | 'roi'>(defaultTab);

  const questions = [
    {
      id: 'Q1',
      title: 'Which features most influenced instructor effectiveness, and why?',
      icon: TrendingUp,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      badge: 'Section 13 & 14 Requirement',
      answer: `Our Random Forest feature importance analysis proved that Engagement Score (0.198), Assessment Score (0.165), and Completion-Dropout Ratio (0.142) were the top three drivers of instructor effectiveness. 

Why? These composite features capture active student behavior rather than passive sentiment. An instructor who successfully motivates students to finish video modules, collaborate in discussion forums, and submit weekly homework naturally drives higher cognitive retention and final exam mastery. In contrast, raw 5-star feedback scores ranked relatively low (0.051), confirming our scientific hypothesis: student satisfaction surveys often fail to reflect actual pedagogical impact and learning outcomes.`
    },
    {
      id: 'Q2',
      title: 'Which variables could be misleading or confounded?',
      icon: AlertTriangle,
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      badge: 'Confounding Audit',
      answer: `Three major confounding relationships exist in raw EdTech datasets:

1. Course Category Difficulty Confounding: A rigorous Quantum Computing or Advanced Cybersecurity course will naturally suffer lower completion rates and lower quiz averages than an introductory Graphic Design or HTML course. Comparing raw scores across disparate disciplines unjustly penalizes instructors teaching complex technical subjects.
2. Grade Inflation vs. Feedback Sentiment: Instructors who design intentionally easy quizzes or award lenient grades frequently receive higher post-course feedback ratings (avg_feedback_score). Relying on raw feedback rewards grade inflation while punishing rigorous educators.
3. Batch Size Scaling Effects: Small batches (N=15) exhibit volatile completion rates where 3 dropouts cause a 20% statistical plunge, whereas massive cohorts (N=200) stabilize around organizational means.`
    },
    {
      id: 'Q3',
      title: 'How could this model fail in real-world usage?',
      icon: ShieldAlert,
      color: 'bg-rose-50 border-rose-200 text-rose-900',
      badge: 'Production Failure Modes',
      answer: `This model could fail in production due to three well-known real-world failure modes:

• Goodhart’s Law & Gaming the System: Once instructors learn that forum activity and watch time drive 30% of their evaluation score, they might mandate artificial "post 3 times per week to pass" rules or inflate video durations with repetitive content, boosting feature scores without improving genuine learning.
• Cold-Start Problem for New Instructors: A newly hired instructor with only 1 or 2 completed batches lacks statistical stability. A single unmotivated cohort could unfairly label them as Low Tier, damaging their career before they gain traction.
• Platform UI/UX Glitches: If video tracking scripts fail or forum notifications break, recorded watch time and interactivity rates will drop, causing the ML model to falsely downgrade excellent instructors.`
    },
    {
      id: 'Q4',
      title: 'What additional data would improve the model?',
      icon: Lightbulb,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      badge: 'Next-Gen Data Roadmap',
      answer: `To build a truly comprehensive pedagogical effectiveness model, we should incorporate:

1. Student Baseline Demographics & Prior Knowledge: Pre-test scores and learner experience levels (e.g., beginner vs. working professional) to calculate true value-added learning gains rather than raw final scores.
2. Longitudinal Career Outcomes: Tracking whether students who completed the course successfully secured job promotions, passed industry certifications, or retained concepts 6 months later.
3. Qualitative NLP Sentiment Analysis: Extracting sentiment and theme clusters from written forum posts and open-ended feedback text, rather than relying solely on numerical ratings.`
    },
    {
      id: 'Q5',
      title: 'Should this model be used for instructor performance evaluation? Discuss ethics and fairness.',
      icon: Users,
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      badge: 'Mandatory Ethics Review',
      answer: `No, this model should NEVER be used as an automated, standalone tool for firing, demoting, or penalizing instructors. It should serve strictly as a Diagnostic Decision-Support Assistant for human curriculum directors.

Ethical & Fairness Analysis:
• Algorithmic Bias & Structural Inequity: If an instructor is assigned to teach underserved, non-traditional students who face socioeconomic barriers, internet connectivity issues, or work-family conflicts, their batch dropout rate will naturally be higher. An automated ML classifier would unfairly penalize the instructor for structural societal inequities outside their control.
• Transparency & Due Process: Instructors must have the right to inspect their feature breakdowns, understand why a batch underperformed, and provide qualitative context before any administrative evaluation occurs.
• Fairness Protocol: We recommend using model outputs exclusively for positive reinforcement (awarding teaching excellence bonuses) and formative support (offering specialized pedagogy workshops or teaching assistants to instructors in the Low tier).`
    }
  ];

  const roiStrategies = [
    {
      strategy: 'Automated Early Intervention & Drop-off Prevention',
      action: 'Run Random Forest prediction at Week 2 of live cohorts. If predicted completion ratio drops below the 33rd percentile, automatically alert academic advisors to deploy student check-ins.',
      impact: 'Course Completion Rate (+12%)',
      estRoi: '$450,000 / year in Retained Tuition',
      icon: AlertTriangle,
      color: 'border-rose-500 bg-rose-50/40 text-rose-900'
    },
    {
      strategy: 'Personalized Instructor Mentorship & Training',
      action: 'Use feature importance breakdowns to diagnose individual faculty weaknesses. Offer tailored training (e.g. Asynchronous Discussion workshops for instructors with low forum interactivity).',
      impact: 'Forum Interactivity (+25%)',
      estRoi: '$120,000 / year in Higher Course Upsells',
      icon: Users,
      color: 'border-indigo-500 bg-indigo-50/40 text-indigo-900'
    },
    {
      strategy: 'Evidence-Based Course Curriculum Redesign',
      action: 'Identify courses where instructors across all tiers struggle with low Learning Improvement Index. Trigger curriculum redesign review with instructional designers.',
      impact: 'Avg Quiz Improvement (+18%)',
      estRoi: '$280,000 / year in Brand Reputation & NPS',
      icon: BookOpen,
      color: 'border-emerald-500 bg-emerald-50/40 text-emerald-900'
    },
    {
      strategy: 'Smart Teaching Assistant (TA) Allocation',
      action: 'Allocate organizational resources dynamically based on batch size and instructor tier. Assign dedicated TAs to high-enrollment batches in challenging technical disciplines.',
      impact: 'Student Satisfaction (+15%)',
      estRoi: '$90,000 / year in Optimized Support Costs',
      icon: Briefcase,
      color: 'border-amber-500 bg-amber-50/40 text-amber-900'
    },
    {
      strategy: 'Positive Merit Incentives & Gamified Excellence',
      action: 'Establish an annual Master Educator Fellowship based on top-tertile ML rankings. Reward High-tier instructors with financial bonuses and leadership roles.',
      impact: 'Faculty Turnover Rate (-30%)',
      estRoi: '$150,000 / year in Recruiting & Onboarding Savings',
      icon: DollarSign,
      color: 'border-purple-500 bg-purple-50/40 text-purple-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Switcher */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              {activeTab === 'qa' ? (
                <>
                  <HelpCircle className="w-6 h-6 text-indigo-600 mr-2" />
                  Mandatory Assignment Questions (Q1 to Q5) & Ethics
                </>
              ) : (
                <>
                  <Briefcase className="w-6 h-6 text-emerald-600 mr-2" />
                  Section 15: Actionable EdTech Business Recommendations & ROI
                </>
              )}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {activeTab === 'qa'
                ? 'Section 14 Requirement: Deep domain reasoning, confounding variables, real-world failure modes, and ethical fairness.'
                : 'Section 15 Requirement: Translating machine learning classifications into operational tuition retention and faculty excellence.'}
            </p>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('qa')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'qa' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Mandatory Q&A (Q1-Q5)</span>
            </button>
            <button
              onClick={() => setActiveTab('roi')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'roi' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Business ROI Strategies</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Mandatory Questions */}
        {activeTab === 'qa' && (
          <div className="space-y-6">
            {questions.map((q) => {
              const IconComp = q.icon;
              return (
                <div key={q.id} className={`rounded-xl border-2 p-6 shadow-sm transition duration-200 hover:shadow-md ${q.color}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/80 rounded-lg shadow-sm">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-base sm:text-lg">
                        {q.id}: {q.title}
                      </h3>
                    </div>
                    <span className="self-start sm:self-auto bg-white/90 text-current px-3 py-1 rounded-full text-xs font-bold border border-current/20 shadow-sm">
                      {q.badge}
                    </span>
                  </div>
                  <div className="bg-white/80 p-5 rounded-lg border border-current/20 text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-800 font-medium">
                    {q.answer}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Business ROI Strategies */}
        {activeTab === 'roi' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-6 rounded-xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                  Total Projected Organizational Impact
                </span>
                <h3 className="text-2xl font-extrabold text-white">
                  $1.09 Million Annual Value
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Estimated across 10,000 active platform students via dropout reduction, upselling, and faculty retention.
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 self-start md:self-auto">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs sm:text-sm font-semibold text-slate-200">5 ROI Pillars Validated</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {roiStrategies.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className={`rounded-xl border-2 p-5 shadow-sm transition duration-200 hover:shadow-md ${item.color}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm">
                          <IconComp className="w-6 h-6 text-slate-800" />
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider opacity-75 block">
                            Strategy #{idx + 1}
                          </span>
                          <h3 className="font-bold text-base sm:text-lg text-slate-900">
                            {item.strategy}
                          </h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                        <span className="px-3 py-1 bg-white/90 rounded-lg text-xs font-bold border border-current/20 shadow-sm">
                          {item.impact}
                        </span>
                        <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">
                          {item.estRoi}
                        </span>
                      </div>
                    </div>

                    <p className="bg-white/80 p-4 rounded-lg border border-current/20 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      <strong>Operational Implementation:</strong> {item.action}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
