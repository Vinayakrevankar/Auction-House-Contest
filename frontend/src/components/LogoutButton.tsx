import { useNavigate } from 'react-router-dom';
import { useAuth } from './../AuthContext';
import { FaSignOutAlt } from "react-icons/fa";

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
      className="px-4 py-2 text-sm font-semibold border border-white rounded bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
    >
      <FaSignOutAlt /> {/* Logout Icon */}
    </button>
  );
};

export default LogoutButton;
