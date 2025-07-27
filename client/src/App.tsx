import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from './components/Navbar.tsx';
import Header from './components/Header';
// import PharmacInventoryPage from "./pages/PharmacInventoryPage.tsx";
import AddMedicinePage from "./pages/AddMedicinePage.tsx";
import MedicineDetailPage from "./pages/MedicineDetailPage.tsx";
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
// import Dashboard from './pages/Dashboard.tsx';

function AppContent() {
  const location = useLocation();
  const isSettingsPage = location.pathname === '/settings';
  const isAccountPage = location.pathname === '/accountSetting';
  const isThemePage = location.pathname === '/pageSetting';
  const isEditRolePage = location.pathname === '/editrole';
  const isRegisterPage = location.pathname === '/register'
  const isLoginPage = location.pathname === '/login'
  const hideNavAndHeader = isSettingsPage || isAccountPage || isThemePage || isEditRolePage || isRegisterPage || isLoginPage;

  return (
    <div className="flex h-screen">
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
            <Route path="/" element={<MedicineDetailPage />} />
            <Route path="/add-medicine" element={<AddMedicinePage />} />
            <Route path="/inventory" element={<PharmacInventoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/accountSetting" element={<AccountPage />} />
            <Route path="/pageSetting" element={< ThemePage/>} />
            <Route path="/editrole" element={< EditRolePage/>} />
            <Route path="/podoc" element={< PODoc/>} />
            <Route path="/poedit" element={< POEdit/>} />
            <Route path="/poform" element={< POForm/>} />
            <Route path="/register" element={< RegisterPage/>} />
            <Route path="/login" element={< LoginPage/>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;