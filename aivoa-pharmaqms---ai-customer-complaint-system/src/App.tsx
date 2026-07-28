import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, useAppSelector, useAppDispatch } from './store';
import { authService, complaintService, DemoFile } from './services/api';
import { setUser } from './store/authSlice';
import { setDemoFiles } from './store/complaintSlice';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ComplaintIntake } from './pages/ComplaintIntake';
import { ComplaintList } from './pages/ComplaintList';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { RiskAssessmentView } from './pages/RiskAssessmentView';
import { CAPALifecycle } from './pages/CAPALifecycle';
import { DocsView } from './pages/DocsView';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check initial auth state
    const current = authService.getCurrentUser();
    if (current) {
      dispatch(setUser(current));
    }
    // Load demo files
    complaintService.getDemoFiles().then((files) => {
      dispatch(setDemoFiles(files));
    }).catch(console.error);
  }, [dispatch]);

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/intake" element={<ComplaintIntake />} />
            <Route path="/complaints" element={<ComplaintList />} />
            <Route path="/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/risk" element={<RiskAssessmentView />} />
            <Route path="/capa" element={<CAPALifecycle />} />
            <Route path="/docs" element={<DocsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;
