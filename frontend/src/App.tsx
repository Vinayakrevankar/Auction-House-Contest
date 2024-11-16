import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LandingPage from './LandingPage';
import SellerDashboard from './SellerDashboard';
import BuyerDashboard from './BuyerDashboard';

import Notification from './components/Notification';

const App = () => {
  return (
    <AuthProvider>
      <Notification />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
