import { useState } from 'react';
import { AuthContext } from './AuthContext';
import LandingPage from './LandingPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SellerDashboard from './SellerDashboard';

const App = () => {
  const [userJWTToken, setUserJWTToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ userJWTToken, setUserJWTToken }}>
      <Router>
            <Routes>
                <Route path="/Auction-House-Contest/" element={<LandingPage />} />
                <Route path="/Auction-House-Contest/seller-dashboard" element={<SellerDashboard />} />
            </Routes>
        </Router>
    </AuthContext.Provider>
  );
};

export default App;
