import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import LandingPage from "./LandingPage";
import SellerDashboard from "./SellerDashboard";
import BuyerDashboard from "./BuyerDashboard";
import Notification from "./components/Notification";

// ProtectedRoute Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { userInfo } = useAuth();

  // Redirect to LandingPage if user is not authenticated
  return userInfo ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Notification />
      <Router>
        <Routes>
        
          <Route path="/" element={<LandingPage />} />

          {/* Protected Routes */}
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
