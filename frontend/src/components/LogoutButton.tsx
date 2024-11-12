import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './../AuthContext';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAuth();

  const logout = () => {
    setUserInfo(null); // Clear user info from context and localStorage
    navigate('/');     // Redirect to home or login page
  };

  return (
    <button
      onClick={logout}
      className="mb-4 px-4 py-2 text-sm font-semibold rounded bg-red-500 text-white hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
