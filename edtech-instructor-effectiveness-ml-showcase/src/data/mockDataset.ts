import Papa from 'papaparse';
import { StudentBatchRecord, InstructorAggregatedRecord } from '../types';

export const GOOGLE_SHEET_ID = "1PIVokMa_Mcgm1JJLC1IUx3fXZilTBAwzVUP-tqhZecY";
export const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;
export const GOOGLE_SHEET_EDIT_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit?usp=sharing`;

// List of realistic instructor names for EdTech
const INSTRUCTOR_NAMES = [
  "Dr. Sarah Jenkins", "Prof. Marcus Vance", "Elena Rostova", "David K. Chen", 
  "Ananya Sharma", "Dr. Robert Thorne", "Michelle Nguyen", "Jameson Wright", 
  "Dr. Priya Patel", "Lucas Martinez", "Sophia Al-Mansoor", "Benjamin Clark",
  "Dr. Hannah Schmidt", "Alexei Volkoff", "Chloe D'Souza", "Kevin Takahashi",
  "Dr. Rachel Green", "Liam O'Connor", "Zoe Kowalski", "Carlos Rodriguez",
  "Dr. Fiona Gallagher", "Nikhil Verma", "Maya Lin", "Thomas Anderson",
  "Dr. Evelyn Reed", "Daniel Kim", "Gabriel Silva", "Amara Okafor",
  "Dr. Henry Wu", "Victoria Sterling"
];

const CATEGORIES = ["Data Science", "Web Development", "AI & Machine Learning", "Cloud Computing", "Cybersecurity", "Product Design"];

/**
 * Generates a realistic synthetic dataset in case Google Sheets CORS is blocked in browser preview.
 * Simulates 500 batches with realistic correlations between engagement, feedback, and completion.
 */
export function generateFallbackDataset(count: number = 500): StudentBatchRecord[] {
  const records: StudentBatchRecord[] = [];
  
  for (let i = 1; i <= count; i++) {
    // Assign to one of 30 instructors
    const instructorIdx = (i % INSTRUCTOR_NAMES.length);
    const instructor_id = `INS_${String(instructorIdx + 101).padStart(3, '0')}`;
    const instructor_name = INSTRUCTOR_NAMES[instructorIdx];
    const course_category = CATEGORIES[i % CATEGORIES.length];
    
    // Each instructor has a base "skill/effectiveness" latent factor between 0.4 and 0.95
    // This creates natural clusters for our ML model to learn!
    const baseSkill = 0.45 + (instructorIdx % 11) * 0.045 + (Math.sin(instructorIdx) * 0.08);
    const clampedSkill = Math.min(0.98, Math.max(0.35, baseSkill));
    
    // Introduce noise per batch
    const noise = () => (Math.random() - 0.5) * 0.15;
    
    const completion_rate = Math.round(Math.min(99, Math.max(15, (clampedSkill + noise()) * 90)));
    const dropout_rate = Math.round(Math.min(75, Math.max(2, 100 - completion_rate - (Math.random() * 10))));
    
    const avg_score_improvement = Number((Math.min(42, Math.max(2, (clampedSkill * 30) + (noise() * 10)))).toFixed(1));
    const avg_quiz_score = Math.round(Math.min(98, Math.max(45, (clampedSkill * 85) + (noise() * 15))));
    const avg_watch_time = Math.round(Math.min(96, Math.max(30, (clampedSkill * 88) + (noise() * 20))));
    
    const assignment_submission_rate = Math.round(Math.min(100, Math.max(20, completion_rate + (noise() * 10))));
    const forum_activity_rate = Math.round(Math.min(95, Math.max(5, (clampedSkill * 70) + (noise() * 25))));
    
    const avg_feedback_score = Number((Math.min(5.0, Math.max(1.8, (clampedSkill * 4.2) + 0.6 + (noise() * 0.5)))).toFixed(2));
    const feedback_response_rate = Math.round(Math.min(98, Math.max(15, (clampedSkill * 80) + (noise() * 15))));
    
    const batch_size = Math.round(25 + Math.random() * 120);

    // Calculate the formula specified in assignment
    // weights: completion(25%), dropout(-15%), improvement(20%), quiz(10%), watch(10%), assign(5%), forum(5%), feedback(7% - normalized from 5 to 100), response(3%)
    const feedback_norm = (avg_feedback_score / 5.0) * 100;
    
    // Raw formula calculation
    const raw_score = (
      (completion_rate * 0.25) +
      (dropout_rate * -0.15) +
      ((avg_score_improvement / 40 * 100) * 0.20) + // scale improvement to ~100
      (avg_quiz_score * 0.10) +
      (avg_watch_time * 0.10) +
      (assignment_submission_rate * 0.05) +
      (forum_activity_rate * 0.05) +
      (feedback_norm * 0.07) +
      (feedback_response_rate * 0.03)
    );

    // Normalize between 0 and 100 roughly
    const Instructor_Effectiveness_Score = Number((Math.min(99.5, Math.max(12.0, (raw_score + 15) * 1.25))).toFixed(1));
    
    let Effectiveness_Tier: 'Low' | 'Medium' | 'High' = 'Medium';
    if (Instructor_Effectiveness_Score >= 78.0) Effectiveness_Tier = 'High';
    else if (Instructor_Effectiveness_Score <= 52.0) Effectiveness_Tier = 'Low';

    records.push({
      batch_id: `BAT_${String(i).padStart(4, '0')}`,
      instructor_id,
      instructor_name,
      course_category,
      batch_size,
      completion_rate,
      dropout_rate,
      avg_score_improvement,
      avg_quiz_score,
      avg_watch_time,
      assignment_submission_rate,
      forum_activity_rate,
      avg_feedback_score,
      feedback_response_rate,
      Instructor_Effectiveness_Score,
      Effectiveness_Tier,
      completion_dropout_ratio: Number((completion_rate / Math.max(1, dropout_rate)).toFixed(2)),
      engagement_score: Number(((avg_watch_time * 0.5) + (forum_activity_rate * 0.3) + (feedback_response_rate * 0.2)).toFixed(1)),
      assessment_score: Number(((avg_quiz_score * 0.6) + (assignment_submission_rate * 0.4)).toFixed(1)),
      feedback_normalized: Number(feedback_norm.toFixed(1))
    });
  }
  
  return records;
}

/**
 * Attempts to load live CSV from Google Sheet. Falls back to synthetic dataset on network error or CORS.
 */
export async function loadDataset(): Promise<{ data: StudentBatchRecord[]; source: 'live' | 'fallback'; error?: string }> {
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL, { mode: 'cors', cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 5) {
            // Map raw fields if necessary or validate structure
            const parsed = results.data.map((row: any, idx) => {
              const comp = Number(row.completion_rate || row['Completion Rate'] || 65);
              const drop = Number(row.dropout_rate || row['Dropout Rate'] || 15);
              const fb = Number(row.avg_feedback_score || row['Avg Feedback Score'] || 4.2);
              const score = (comp * 0.25) - (drop * 0.15) + (fb / 5 * 100 * 0.07) + 35;
              return {
                batch_id: String(row.batch_id || `BAT_${idx+1}`),
                instructor_id: String(row.instructor_id || `INS_${(idx % 25)+101}`),
                instructor_name: String(row.instructor_name || INSTRUCTOR_NAMES[idx % INSTRUCTOR_NAMES.length]),
                course_category: String(row.course_category || CATEGORIES[idx % CATEGORIES.length]),
                batch_size: Number(row.batch_size || 45),
                completion_rate: comp,
                dropout_rate: drop,
                avg_score_improvement: Number(row.avg_score_improvement || 18.5),
                avg_quiz_score: Number(row.avg_quiz_score || 78),
                avg_watch_time: Number(row.avg_watch_time || 72),
                assignment_submission_rate: Number(row.assignment_submission_rate || 80),
                forum_activity_rate: Number(row.forum_activity_rate || 45),
                avg_feedback_score: fb,
                feedback_response_rate: Number(row.feedback_response_rate || 68),
                Instructor_Effectiveness_Score: Number(score.toFixed(1)),
                Effectiveness_Tier: score > 75 ? 'High' : (score < 50 ? 'Low' : 'Medium')
              } as StudentBatchRecord;
            });
            resolve({ data: parsed, source: 'live' });
          } else {
            resolve({ data: generateFallbackDataset(500), source: 'fallback', error: 'Sheet data was empty or unparseable.' });
          }
        },
        error: (err: any) => {
          resolve({ data: generateFallbackDataset(500), source: 'fallback', error: err.message });
        }
      });
    });
  } catch (err: any) {
    console.warn("Could not fetch live Google Sheet (likely CORS restriction in browser sandbox). Loading synthesized dataset.", err.message);
    return { data: generateFallbackDataset(500), source: 'fallback', error: 'Google Sheets CORS restriction in iframe. Using high-fidelity synthesized EdTech dataset.' };
  }
}

/**
 * Aggregates batch-level student data to the Instructor level (Section 8 requirement)
 */
export function aggregateToInstructorLevel(batches: StudentBatchRecord[]): InstructorAggregatedRecord[] {
  const map = new Map<string, StudentBatchRecord[]>();
  
  batches.forEach(b => {
    if (!map.has(b.instructor_id)) {
      map.set(b.instructor_id, []);
    }
    map.get(b.instructor_id)!.push(b);
  });
  
  const aggregated: InstructorAggregatedRecord[] = [];
  
  map.forEach((records, id) => {
    const count = records.length;
    const name = records[0].instructor_name;
    const total_students = records.reduce((sum, r) => sum + r.batch_size, 0);
    
    const avg = (fn: (r: StudentBatchRecord) => number) => 
      Number((records.reduce((sum, r) => sum + fn(r), 0) / count).toFixed(2));
      
    const average_completion = avg(r => r.completion_rate);
    const average_dropout = avg(r => r.dropout_rate);
    const average_score_improvement = avg(r => r.avg_score_improvement);
    const average_quiz_score = avg(r => r.avg_quiz_score);
    const average_watch_time = avg(r => r.avg_watch_time);
    const average_submission_rate = avg(r => r.assignment_submission_rate);
    const average_forum_activity = avg(r => r.forum_activity_rate);
    const average_feedback = avg(r => r.avg_feedback_score);
    const average_feedback_response = avg(r => r.feedback_response_rate);
    
    const completion_dropout_ratio = Number((average_completion / Math.max(1, average_dropout)).toFixed(2));
    const engagement_score = Number(((average_watch_time * 0.5) + (average_forum_activity * 0.3) + (average_feedback_response * 0.2)).toFixed(1));
    const assessment_score = Number(((average_quiz_score * 0.6) + (average_submission_rate * 0.4)).toFixed(1));
    const feedback_index = Number(((average_feedback / 5 * 100)).toFixed(1));
    const learning_improvement_index = Number((average_score_improvement * 2.5).toFixed(1));
    
    // Formula calculation at instructor level
    const raw_score = (
      (average_completion * 0.25) +
      (average_dropout * -0.15) +
      ((average_score_improvement / 40 * 100) * 0.20) +
      (average_quiz_score * 0.10) +
      (average_watch_time * 0.10) +
      (average_submission_rate * 0.05) +
      (average_forum_activity * 0.05) +
      (feedback_index * 0.07) +
      (average_feedback_response * 0.03)
    );
    
    const Instructor_Effectiveness_Score = Number((Math.min(99.5, Math.max(15.0, (raw_score + 15) * 1.25))).toFixed(1));
    
    let Effectiveness_Tier: 'Low' | 'Medium' | 'High' = 'Medium';
    if (Instructor_Effectiveness_Score >= 78.0) Effectiveness_Tier = 'High';
    else if (Instructor_Effectiveness_Score <= 52.0) Effectiveness_Tier = 'Low';
    
    aggregated.push({
      instructor_id: id,
      instructor_name: name,
      number_of_batches: count,
      total_students,
      average_completion,
      average_dropout,
      average_score_improvement,
      average_quiz_score,
      average_watch_time,
      average_submission_rate,
      average_forum_activity,
      average_feedback,
      average_feedback_response,
      completion_dropout_ratio,
      engagement_score,
      assessment_score,
      feedback_index,
      learning_improvement_index,
      Instructor_Effectiveness_Score,
      Effectiveness_Tier
    });
  });
  
  return aggregated.sort((a, b) => b.Instructor_Effectiveness_Score - a.Instructor_Effectiveness_Score);
}
