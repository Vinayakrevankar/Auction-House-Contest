import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './LandingPage';

const App = () => {
  const { userJWTToken } = useAuth(); // Access the JWT token here

  return (
    <AuthProvider>
      <div className="App">
        <LandingPage />
      </div>
    </AuthProvider>
  );
};

export default App;
