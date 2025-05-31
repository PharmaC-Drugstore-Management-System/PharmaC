import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar.tsx';
import Header from './components/Header';
// import PharmacInventoryPage from "./pages/PharmacInventoryPage.tsx";
import AddMedicinePage from "./pages/AddMedicinePage.tsx";
import MedicineDetailPage from "./pages/MedicineDetailPage.tsx";
// import Dashboard from './pages/Dashboard.tsx';

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        {/* {/* Sidebar /} */}
        <Navbar />

        {/* {/ Main content /} */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* {/ Fixed Header /} */}
          <div className="sticky top-0 z-10">
            <Header />
          </div>

          {/* {/ Page content */} 
          <div className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/" element={<MedicineDetailPage />} />
              <Route path="/add-medicine" element={<AddMedicinePage />} />
              {/* <Route path="/medicine-details" element={<MedicineDetailPage />} /> */}

            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;