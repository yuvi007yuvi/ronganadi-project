import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import KycPromptModal from './components/citizen/KycPromptModal';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import AvailableSurveys from './pages/citizen/AvailableSurveys';
import FillSurvey from './pages/citizen/FillSurvey';

import ViewAllRecords from './pages/admin/ViewAllRecords';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';
import Advertisements from './pages/admin/Advertisements';
import BuildSurvey from './pages/admin/BuildSurvey';
import ManageSurveys from './pages/admin/ManageSurveys';
import AdminGrievance from './pages/admin/AdminGrievance';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminRoles from './pages/admin/AdminRoles';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminGisDashboard from './pages/admin/AdminGisDashboard';
import SystemAdmin from './pages/admin/SystemAdmin';
import CitizenReports from './pages/admin/CitizenReports';
import AdminKycDashboard from './pages/admin/AdminKycDashboard';
import CitizenGrievance from './pages/citizen/CitizenGrievance';
import CitizenTracking from './pages/citizen/CitizenTracking';
import CitizenLocator from './pages/citizen/CitizenLocator';
import CitizenFeedback from './pages/citizen/CitizenFeedback';
import ReportsHub from './pages/admin/ReportsHub';

import Communication from './pages/Communication';

import Profile from './pages/Profile';
import MigratedSurveyForm from './pages/public/MigratedSurveyForm';
import MigrationReports from './pages/public/MigrationReports';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/users': 'Manage Users',
  '/admin/records': 'All Records',
  '/admin/complaints': 'Grievance Complaints',
  '/admin/tickets': 'Complaints Desk',
  '/admin/ticket-admin': 'Grievance Admin',
  '/admin/roles': 'Roles & Permissions',
  '/admin/facilities': 'Manage Facilities',
  '/admin/system': 'System Administration',
  '/admin/map-dashboard': 'Nearby Dashboard',
  '/admin/reports-hub': 'Reports Hub',
  '/admin/citizen-reports': 'Citizen Reports',
  '/admin/kyc-dashboard': 'Citizen KYC Status',
  '/citizen': 'Citizen Dashboard',
  '/citizen/surveys': 'Available Surveys',
  '/citizen/fill-survey': 'Fill Survey',
  '/citizen/grievances': 'Lodge Complaint',
  '/citizen/tracking': 'Complaint Tracking',
  '/citizen/locator': 'Nearby Finder',
  '/communication': 'Communication',
  '/profile': 'My Profile',
};

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();
  const [showKycPrompt, setShowKycPrompt] = useState(true);

  // Find matching title (handle nested routes)
  const pageTitle = Object.entries(pageTitles).reduce((match, [path, title]) => {
    if (location.pathname === path || location.pathname.startsWith(path + '/')) {
      return match === '' || path.length > Object.keys(pageTitles).find(k => k === match?.path)?.length ? title : match;
    }
    return match;
  }, '') || 'Ranganadibeta';

  // More precise title matching, defaulting to the prefix matcher above if exact match isn't found
  const title = pageTitles[location.pathname] || pageTitle;

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
          pageTitle={title}
        />
        <main className="page-container">
          <div style={{ paddingBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <Link to={currentUser?.role === 'citizen' ? '/citizen' : '/admin'} style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'var(--gray-400)' }}>/</span>
            <span style={{ color: 'var(--gray-600)' }}>{title}</span>
          </div>
          {children}
        </main>
      </div>
      
      {/* Show KYC Prompt if user is a citizen and KYC is not completed */}
      {currentUser?.role === 'citizen' && currentUser?.kyc_status !== 'completed' && showKycPrompt && (
        <KycPromptModal onClose={() => setShowKycPrompt(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/migrated-survey" element={<AppLayout><MigratedSurveyForm /></AppLayout>} />
            <Route path="/migration-reports" element={<AppLayout><MigrationReports /></AppLayout>} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="view_main_dashboard">
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/unauthorized" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 24 }}>🛡️</div>
                    <h2 style={{ fontSize: 24, color: 'var(--gray-900)', marginBottom: 12 }}>Access Denied</h2>
                    <p style={{ color: 'var(--gray-500)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                      You do not have permission to view the main dashboard. Please select a module from the sidebar that you have access to.
                    </p>
                  </div>
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="manage_users">
                <AppLayout><ManageUsers /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/records" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="view_all_records">
                <AppLayout><ViewAllRecords /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="view_system_reports">
                <AppLayout><Reports /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports-hub" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><ReportsHub /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/advertisements" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="manage_advertisements">
                <AppLayout><Advertisements /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/custom-surveys" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="manage_custom_surveys">
                <AppLayout><ManageSurveys /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/build-survey" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="manage_custom_surveys">
                <AppLayout><BuildSurvey /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/complaints" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="view_raw_complaints">
                <AppLayout><AdminGrievance viewMode="complaints" /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="manage_complaints_desk">
                <AppLayout><AdminGrievance viewMode="tickets" /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/ticket-admin" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="manage_complaints_admin">
                <AppLayout><AdminGrievance viewMode="ticket_admin" /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/facilities" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="manage_facilities"><AppLayout><AdminFacilities /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/roles" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><AdminRoles /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/system" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="view_admin_hub"><AppLayout><SystemAdmin /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/citizen-reports" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><CitizenReports /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/kyc-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><AdminKycDashboard /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/map-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="view_nearby_dashboard"><AppLayout><AdminGisDashboard /></AppLayout></ProtectedRoute>
            } />
            
            <Route path="/admin/feedback" element={
              <ProtectedRoute allowedRoles={['admin']} requiredPermission="view_citizen_feedback"><AppLayout><AdminFeedback /></AppLayout></ProtectedRoute>
            } />

            {/* Citizen Routes */}
            <Route path="/citizen" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AppLayout><CitizenDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/citizen/surveys" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AppLayout><AvailableSurveys /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/citizen/fill-survey/:id" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AppLayout><FillSurvey /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/citizen/grievances" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AppLayout><CitizenGrievance /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/citizen/tracking" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AppLayout><CitizenTracking /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/citizen/locator" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AppLayout><CitizenLocator /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/citizen/feedback" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AppLayout><CitizenFeedback /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/communication" element={
              <ProtectedRoute allowedRoles={['admin', 'surveyor', 'citizen']}>
                <AppLayout><Communication /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['admin', 'citizen']}>
                <AppLayout><Profile /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
