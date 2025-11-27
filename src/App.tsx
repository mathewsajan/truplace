import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SubmitReviewPage = lazy(() => import('./pages/SubmitReviewPage'));
const CompanyProfilePage = lazy(() => import('./pages/CompanyProfilePage'));
const RequestCompanyPage = lazy(() => import('./pages/RequestCompanyPage'));
const CompanyRequestedPage = lazy(() => import('./pages/CompanyRequestedPage'));
const AdminCompanyRequestsPage = lazy(() => import('./pages/AdminCompanyRequestsPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));

export const ToastContext = React.createContext<ReturnType<typeof useToast> | null>(null);

function App() {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-grow">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/submit-review" element={<SubmitReviewPage />} />
                <Route path="/request-company" element={<RequestCompanyPage />} />
                <Route path="/company-requested" element={<CompanyRequestedPage />} />
                <Route path="/admin/company-requests" element={<AdminCompanyRequestsPage />} />
                <Route path="/notification/:token" element={<NotificationPage />} />
                <Route path="/company/:companyId" element={<CompanyProfilePage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
          <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        </div>
      </Router>
    </ToastContext.Provider>
  );
}

export default App;