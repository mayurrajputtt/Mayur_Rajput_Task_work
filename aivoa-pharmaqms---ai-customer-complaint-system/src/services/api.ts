import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharma_qms_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'QA_MANAGER' | 'INVESTIGATOR' | 'REGULATORY_OFFICER' | 'ADMIN';
  department: string;
}

export interface DemoFile {
  id: string;
  name: string;
  type: 'PDF' | 'EML' | 'IMAGE';
  size: string;
  category: string;
  previewText: string;
}

export interface Complaint {
  id: string;
  complaint_code: string;
  title: string;
  source: string;
  customer_name: string;
  product_name: string;
  product_grade: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity_affected: string;
  complaint_type: string;
  complaint_date: string;
  description: string;
  initial_severity: 'Critical' | 'High' | 'Medium' | 'Low';
  priority: 'Immediate' | 'High' | 'Standard';
  status: 'PENDING_TRIAGE' | 'INVESTIGATION_IN_PROGRESS' | 'CAPA_PENDING' | 'CLOSED' | 'REJECTED';
  assigned_to: string;
  assigned_name: string;
  completeness_score: number;
  ich_risk_class: 'CRITICAL_CLASS_I' | 'MAJOR_CLASS_II' | 'MINOR_CLASS_III';
  risk_score: number;
  ich_justification: string;
  ai_summary: string;
  ishikawa_rca: {
    primary_category: string;
    fishbone: {
      Man: string;
      Machine: string;
      Material: string;
      Method: string;
      Measurement: string;
      Milieu: string;
    };
    five_whys: string[];
    root_cause: string;
  };
  created_at: string;
  capas?: CAPA[];
  audit_logs?: AuditLog[];
}

export interface CAPA {
  id: string;
  complaint_id: string;
  title: string;
  action_type: 'Corrective' | 'Preventive';
  description: string;
  owner: string;
  target_days: number;
  status: 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED';
  approved_by?: string;
  approved_at?: string;
}

export interface AuditLog {
  id: string;
  complaint_id: string;
  user_id: string;
  user_name: string;
  action_type: string;
  previous_value: string;
  new_value: string;
  esign_reason: string;
  ip_address: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  status: string;
  progress_percentage: number;
  steps_executed: string[];
  extraction: {
    source: string;
    customer_name: string;
    product_name: string;
    product_grade: string;
    batch_number: string;
    manufacturing_date: string;
    expiry_date: string;
    quantity_affected: string;
    complaint_type: string;
    complaint_date: string;
    description: string;
    initial_severity: 'Critical' | 'High' | 'Medium' | 'Low';
    priority: 'Immediate' | 'High' | 'Standard';
  };
  risk_assessment: {
    ich_risk_class: 'CRITICAL_CLASS_I' | 'MAJOR_CLASS_II' | 'MINOR_CLASS_III';
    severity: string;
    risk_score: number;
    ich_justification: string;
  };
  duplicate_detection: {
    is_duplicate: boolean;
    similarity_score: number;
    matched_complaint_id: string | null;
    rationale: string;
  };
  root_cause: {
    primary_category: string;
    fishbone: {
      Man: string;
      Machine: string;
      Material: string;
      Method: string;
      Measurement: string;
      Milieu: string;
    };
    five_whys: string[];
    most_probable_root_cause: string;
  };
  capa_recommendations: {
    title: string;
    action_type: 'Corrective' | 'Preventive';
    description: string;
    owner: string;
    target_days: number;
  }[];
  completeness_score: number;
}

export interface AnalyticsData {
  metrics: {
    totalComplaints: number;
    criticalClassI: number;
    majorClassII: number;
    minorClassIII: number;
    avgResolutionDays: number;
    duplicateRate: string;
    aiAccuracyScore: string;
  };
  statusDistribution: { name: string; value: number }[];
  monthlyTrends: { month: string; complaints: number; resolved: number; avgCloseDays: number }[];
  rootCauseDistribution: { category: string; count: number }[];
}

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('pharma_qms_token', res.data.access_token);
      localStorage.setItem('pharma_qms_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('pharma_qms_token');
    localStorage.removeItem('pharma_qms_user');
  },
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem('pharma_qms_user');
    return u ? JSON.parse(u) : null;
  }
};

export const complaintService = {
  getComplaints: async (params: { page?: number; limit?: number; status?: string; risk_class?: string; search?: string } = {}) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  },
  getComplaintById: async (id: string) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data as Complaint;
  },
  createComplaint: async (data: any) => {
    const res = await api.post('/complaints', data);
    return res.data as Complaint;
  },
  updateStatus: async (id: string, status: string, esign_reason: string, user_name: string) => {
    const res = await api.patch(`/complaints/${id}/status`, { status, esign_reason, user_name });
    return res.data as Complaint;
  },
  getDemoFiles: async () => {
    const res = await api.get('/demo-files');
    return res.data as DemoFile[];
  }
};

export const aiService = {
  analyzeDocument: async (text: string, doc_type: string, file_name: string) => {
    const res = await api.post('/ai/analyze-document', { text, doc_type, file_name });
    return res.data as AIAnalysisResult;
  },
  chat: async (complaint_id: string, message: string) => {
    const res = await api.post('/ai/chat', { complaint_id, message });
    return res.data;
  },
  checkDuplicate: async (batch_number: string, description: string) => {
    const res = await api.post('/complaints/check-duplicate', { batch_number, description });
    return res.data;
  }
};

export const capaService = {
  getCAPAs: async () => {
    const res = await api.get('/capa');
    return res.data as CAPA[];
  },
  approveCAPA: async (capa_id: string, password: string, esign_reason: string, user_name: string) => {
    const res = await api.post('/capa/approve', { capa_id, password, esign_reason, user_name });
    return res.data;
  }
};

export const analyticsService = {
  getAnalytics: async () => {
    const res = await api.get('/analytics');
    return res.data as AnalyticsData;
  },
  getAuditLogs: async (complaint_id?: string) => {
    const res = await api.get('/audit-logs', { params: { complaint_id } });
    return res.data as AuditLog[];
  }
};

export default api;
