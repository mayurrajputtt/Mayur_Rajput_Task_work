export interface StudentBatchRecord {
  batch_id: string;
  instructor_id: string;
  instructor_name: string;
  course_category: string;
  batch_size: number;
  completion_rate: number; // 0-100%
  dropout_rate: number; // 0-100%
  avg_score_improvement: number; // e.g. 5.2 to 35.0
  avg_quiz_score: number; // 0-100
  avg_watch_time: number; // minutes or %
  assignment_submission_rate: number; // 0-100%
  forum_activity_rate: number; // posts/interactions per student or %
  avg_feedback_score: number; // 1.0 to 5.0
  feedback_response_rate: number; // 0-100%
  // Engineered target & features
  Instructor_Effectiveness_Score?: number;
  Effectiveness_Tier?: 'Low' | 'Medium' | 'High';
  completion_dropout_ratio?: number;
  engagement_score?: number;
  assessment_score?: number;
  feedback_normalized?: number;
}

export interface InstructorAggregatedRecord {
  instructor_id: string;
  instructor_name: string;
  number_of_batches: number;
  total_students: number;
  average_completion: number;
  average_dropout: number;
  average_score_improvement: number;
  average_quiz_score: number;
  average_watch_time: number;
  average_submission_rate: number;
  average_forum_activity: number;
  average_feedback: number;
  average_feedback_response: number;
  // Engineered
  completion_dropout_ratio: number;
  engagement_score: number;
  assessment_score: number;
  feedback_index: number;
  learning_improvement_index: number;
  Instructor_Effectiveness_Score: number;
  Effectiveness_Tier: 'Low' | 'Medium' | 'High';
}

export type CellType = 'markdown' | 'code';

export interface NotebookOutput {
  type: 'table' | 'info' | 'describe' | 'chart_histogram' | 'chart_boxplot' | 'chart_heatmap' | 'chart_scatter' | 'chart_importance' | 'confusion_matrix' | 'text' | 'model_comparison';
  title?: string;
  data?: any;
  summary?: string;
}

export interface NotebookSection {
  id: number;
  title: string;
  markdown: string;
  code: string;
  outputs: NotebookOutput[];
  keyTakeaway: string;
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  confusionMatrix: number[][]; // [ [High, Med, Low predicted] x actual ]
  strengths: string[];
  weaknesses: string[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  description: string;
  category: 'Engagement' | 'Assessment' | 'Feedback' | 'Retention';
}
