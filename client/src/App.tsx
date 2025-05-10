import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PharmacInventoryPage from './pages/PharmacInventoryPage';
import AddMedicinePage from './pages/AddMedicinePage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PharmacInventoryPage />} />
          <Route path="/add-medicine" element={<AddMedicinePage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;