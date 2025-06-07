import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar.tsx";
import Header from "../components/Header.tsx";
import TrendPage from "../pages/Trend_page.tsx";
import RevenueDetail from "../pages/RevenueDetail.tsx";
import POEdit from "../pages/POEdit.tsx";
import POForm from "../pages/POForm.tsx";
import PODoc from "../pages/PODoc.tsx";

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Navbar />

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10">
            <Header />
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/trend" element={<TrendPage />} />
              {/* <Route path="/" element={<Dashboard />} /> */}
              <Route path="/revenuedetail" element={<RevenueDetail />} />
              <Route path="/poedit" element={<POEdit />} />
              <Route path="/poform" element={<POForm />} />
              <Route path="/podoc" element={<PODoc />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
