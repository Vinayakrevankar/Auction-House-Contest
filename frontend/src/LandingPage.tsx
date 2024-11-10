import React, { useState, useEffect } from 'react';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal'; 
import { useLocation } from 'react-router-dom';

const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Open the login modal if "openLoginModal" is true in the state
    if (location.state?.openLoginModal) {
      setIsLoginOpen(true);
    }
  }, [location.state]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-center">
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-12">Auction House Contest</h1>
      
      <div className="space-x-6">
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-blue-100 transition duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400"
        >
          Login
        </button>
        
        <button 
          onClick={() => setIsSignupOpen(true)}
          className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-full shadow-lg hover:bg-purple-100 transition duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-purple-400"
        >
          Signup
        </button>
      </div>

      {/* Render Login and Signup Modals */}
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      {isSignupOpen && <SignupModal onClose={() => setIsSignupOpen(false)} />}
    </div>
  );
};

export default LandingPage;
