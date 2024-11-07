import { useState } from 'react';
import { AuthContext, UserInfo } from './AuthContext';
import LandingPage from './LandingPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SellerDashboard from './SellerDashboard';
import BuyerDashboard from './BuyerDashboard';


const App = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo }}>
      <Router>
        <Routes>
          <Route path="/Auction-House-Contest/" element={<LandingPage />} />
          <Route path="/Auction-House-Contest/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/Auction-House-Contest/buyer-dashboard" element={<BuyerDashboard />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
