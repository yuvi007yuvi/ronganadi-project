import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

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
import CitizenGrievance from './pages/citizen/CitizenGrievance';
import CitizenTracking from './pages/citizen/CitizenTracking';
import CitizenLocator from './pages/citizen/CitizenLocator';
import CitizenFeedback from './pages/citizen/CitizenFeedback';


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
          {children}
        </main>
      </div>
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
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><ManageUsers /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/records" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><ViewAllRecords /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><Reports /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/advertisements" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><Advertisements /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/custom-surveys" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><ManageSurveys /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/build-survey" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><BuildSurvey /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/complaints" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><AdminGrievance viewMode="complaints" /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><AdminGrievance viewMode="tickets" /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/ticket-admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout><AdminGrievance viewMode="ticket_admin" /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/facilities" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><AdminFacilities /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/roles" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><AdminRoles /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/system" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><SystemAdmin /></AppLayout></ProtectedRoute>
            } />
            <Route path="/admin/map-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><AdminGisDashboard /></AppLayout></ProtectedRoute>
            } />
            
            <Route path="/admin/feedback" element={
              <ProtectedRoute allowedRoles={['admin']}><AppLayout><AdminFeedback /></AppLayout></ProtectedRoute>
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
