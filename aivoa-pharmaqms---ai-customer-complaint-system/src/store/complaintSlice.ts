import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Complaint, DemoFile, AIAnalysisResult } from '../services/api';

interface ComplaintState {
  complaints: Complaint[];
  total: number;
  page: number;
  limit: number;
  statusFilter: string;
  riskFilter: string;
  searchQuery: string;
  selectedComplaint: Complaint | null;
  demoFiles: DemoFile[];
  loading: boolean;
  error: string | null;
  // AI Copilot state during intake
  activeAnalysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  currentLangGraphStep: string;
}

const initialState: ComplaintState = {
  complaints: [],
  total: 0,
  page: 1,
  limit: 10,
  statusFilter: 'ALL',
  riskFilter: 'ALL',
  searchQuery: '',
  selectedComplaint: null,
  demoFiles: [],
  loading: false,
  error: null,
  activeAnalysis: null,
  isAnalyzing: false,
  analysisProgress: 0,
  currentLangGraphStep: 'Idle',
};

export const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setComplaintsData: (state, action: PayloadAction<{ total: number; page: number; limit: number; data: Complaint[] }>) => {
      state.complaints = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.loading = false;
    },
    setSelectedComplaint: (state, action: PayloadAction<Complaint | null>) => {
      state.selectedComplaint = action.payload;
      state.loading = false;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.page = 1;
    },
    setRiskFilter: (state, action: PayloadAction<string>) => {
      state.riskFilter = action.payload;
      state.page = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setDemoFiles: (state, action: PayloadAction<DemoFile[]>) => {
      state.demoFiles = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    // AI Copilot Actions
    startAnalysis: (state) => {
      state.isAnalyzing = true;
      state.analysisProgress = 10;
      state.currentLangGraphStep = 'Step 1: Reading PDF/EML binary stream & initializing OCR...';
      state.activeAnalysis = null;
    },
    updateAnalysisProgress: (state, action: PayloadAction<{ progress: number; step: string }>) => {
      state.analysisProgress = action.payload.progress;
      state.currentLangGraphStep = action.payload.step;
    },
    completeAnalysis: (state, action: PayloadAction<AIAnalysisResult>) => {
      state.isAnalyzing = false;
      state.analysisProgress = 100;
      state.currentLangGraphStep = 'Step 10: AI extraction, ICH Q9 risk classification, and RCA completed.';
      state.activeAnalysis = action.payload;
    },
    clearAnalysis: (state) => {
      state.activeAnalysis = null;
      state.isAnalyzing = false;
      state.analysisProgress = 0;
      state.currentLangGraphStep = 'Idle';
    },
    addComplaint: (state, action: PayloadAction<Complaint>) => {
      state.complaints.unshift(action.payload);
      state.total += 1;
    },
  },
});

export const {
  setComplaintsData,
  setSelectedComplaint,
  setStatusFilter,
  setRiskFilter,
  setSearchQuery,
  setPage,
  setDemoFiles,
  setLoading,
  setError,
  startAnalysis,
  updateAnalysisProgress,
  completeAnalysis,
  clearAnalysis,
  addComplaint,
} = complaintSlice.actions;

export default complaintSlice.reducer;
