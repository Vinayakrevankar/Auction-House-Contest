import { useState } from 'react';
import { AuthContext } from './AuthContext';
import LandingPage from './LandingPage';

const App = () => {
  const [userJWTToken, setUserJWTToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ userJWTToken, setUserJWTToken }}>
      <div className="App">
        <LandingPage />
      </div>
    </AuthContext.Provider>
  );
};

export default App;
