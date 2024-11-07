import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SellerDashboard from './SellerDashboard';
import { AuthProvider } from './AuthContext';
import LandingPage from './LandingPage';


function App() {
    return (
      <AuthProvider>
        <Router>
            <Routes>
                <Route path="/Auction-House-Contest/" element={<LandingPage />} />
                <Route path="/Auction-House-Contest/seller-dashboard" element={<SellerDashboard />} />
                {/* Update other routes similarly, replacing component prop with element prop */}
            </Routes>
        </Router>
        </AuthProvider>
    );
}

export default App;
