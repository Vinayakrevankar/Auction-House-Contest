import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './LandingPage';

const App = () => {

  return (
    <AuthProvider>
      <div className="App">
        <LandingPage />
      </div>
    </AuthProvider>
  );
};

export default App;
