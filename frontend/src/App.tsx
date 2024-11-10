import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LandingPage from './LandingPage';
import SellerDashboard from './SellerDashboard';
import BuyerDashboard from './BuyerDashboard';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/Auction-House-Contest/" element={<LandingPage />} />
          <Route path="/Auction-House-Contest/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/Auction-House-Contest/buyer-dashboard" element={<BuyerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
