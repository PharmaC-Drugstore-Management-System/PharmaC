import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerPaymentPage from './pages/CustomerPaymentPage';
import Navbar from '../src/components/Navbar.tsx';
import Header from '../src/components/Header.tsx';
// import PharmacInventoryPage from "./pages/PharmacInventoryPage.tsx";
import AddMedicinePage from "./pages/AddMedicinePage.tsx";
import PharmacInventoryPage from "./pages/PharmacInventoryPage.tsx";
import SettingsPage from "./pages/settingPage.tsx";
import AccountPage from "./pages/accountPage.tsx";
import ThemePage from "./pages/ThemePage.tsx";
import EditRolePage from "./pages/editRolePage.tsx";
import PODoc from "./pages/PODoc.tsx"
import POForm from "./pages/POForm.tsx"
import POEdit from "./pages/POEdit.tsx"
import RegisterPage from "./pages/registerPage.tsx";
import LoginPage from "./pages/loginPage.tsx";
import MainMenu from './pages/index.tsx';
import StatisticPage from "./pages/StatisticPage.tsx";
import ExpiryMonitor from "./pages/expiryMonitorPage.tsx";
import DocumentRecord from "./pages/DocRecordPage.tsx";
import OrderRecord from "./pages/orderRecordPage.tsx";
import MembershipRanking from "./pages/membershipPage.tsx";
import POSPage from "./pages/POSPage.tsx";
import TermsConditionsPage from "./pages/TermConditionPage.tsx";
import ContactUsPage from "./pages/ContactUsPage.tsx";
import RevenueDetail from "./pages/RevenueDetail.tsx";
import { useEffect } from 'react';
import LotPage from "./pages/InventoryLotPage.tsx";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const isSettingsPage = location.pathname === '/settings';
  const isAccountPage = location.pathname === '/accountSetting';
  const isThemePage = location.pathname === '/pageSetting';
  const isEditRolePage = location.pathname === '/editrole';
  const isTermsPage = location.pathname === '/termCondition';
  const isContactPage = location.pathname === '/contactUs';
  const isRegisterPage = location.pathname === '/register'
  const isLoginPage = location.pathname === '/login'
  const hideNavAndHeader = isSettingsPage || isAccountPage || isThemePage || isEditRolePage || isTermsPage || isContactPage || isRegisterPage || isLoginPage;

  // Force Customer to stay on CustomerPaymentPage
  useEffect(() => {
    if (user && user.role === 'Customer' && location.pathname !== '/customer-payment') {
      navigate('/customer-payment', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // If user is Customer, show Customer Payment Page directly regardless of URL
  if (user && user.role === 'Customer') {
    return <CustomerPaymentPage />;
  }

  // Default layout for Owner/Staff or unauthenticated users
  return (
    <div className="flex h-screen bg-[#FAF9F8]">
      {/* Conditionally render Navbar */}
      {!hideNavAndHeader && <Navbar />}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Conditionally render Header */}
        {!hideNavAndHeader && (
          <div className="sticky top-0 z-10">
            <Header />
          </div>
        )}

        {/* Page content */}
        <div className={`flex-1 overflow-y-auto ${!hideNavAndHeader ? 'p-6' : ''}`}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes for Admin/Staff */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <MainMenu />
              </ProtectedRoute>
            } />
            <Route path="/add-medicine" element={
              // <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
              <AddMedicinePage />
              // </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              // <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
              <PharmacInventoryPage />
              // </ProtectedRoute>
            } />
            <Route path="/inventory/:id" element={
              // <ProtectedRoute allowedRoles={['Owner','Staff']}>
              <LotPage />
              // </ProtectedRoute>
            } />

            <Route path="/revenue-detail" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <RevenueDetail />
              </ProtectedRoute>} />
              
            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/accountSetting" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <AccountPage />
              </ProtectedRoute>
            } />
            <Route path="/pageSetting" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <ThemePage />
              </ProtectedRoute>
            } />
            <Route path="/editrole" element={
              <ProtectedRoute allowedRoles={['Owner']}>
                <EditRolePage />
              </ProtectedRoute>
            } />
            <Route path="/podoc" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <PODoc />
              </ProtectedRoute>
            } />
            <Route path="/poedit" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <POEdit />
              </ProtectedRoute>
            } />
            <Route path="/poform" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <POForm />
              </ProtectedRoute>
            } />
            <Route path="/statistic" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <StatisticPage />
              </ProtectedRoute>
            } />
            <Route path="/expiry-monitor" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <ExpiryMonitor />
              </ProtectedRoute>
            } />
            <Route path="/doc-record" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <DocumentRecord />
              </ProtectedRoute>
            } />
            <Route path="/order-record" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <OrderRecord />
              </ProtectedRoute>
            } />
            <Route path="/membership" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <MembershipRanking />
              </ProtectedRoute>
            } />
            <Route path="/termCondition" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff', 'Customer']}>
                <TermsConditionsPage />
              </ProtectedRoute>
            } />
            <Route path="/contactUs" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff', 'Customer']}>
                <ContactUsPage />
              </ProtectedRoute>
            } />

            {/* POS accessible by Owner and Staff only */}
            <Route path="/pos" element={
              <ProtectedRoute allowedRoles={['Owner', 'Staff']}>
                <POSPage />
              </ProtectedRoute>
            } />

            {/* Customer Payment Page - Customer only */}
            <Route path="/customer-payment" element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <CustomerPaymentPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
