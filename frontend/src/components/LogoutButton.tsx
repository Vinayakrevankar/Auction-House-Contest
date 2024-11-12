import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const logout = () => {
    navigate('/');
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