import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { userLogin } from "../api/services.gen";
import { useNavigate } from "react-router-dom";
import { notifySuccess, notifyError } from './Notification';
interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUserInfo } = useAuth(); // Access the setter function from context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await userLogin({
        body: { emailAddress: email, password },
      });
      if (response.data?.status === 200) {
        const info = response.data.payload;

        // Store user info in context and session storage
        const userInfo = {
          username: info.username || "",
          emailAddress: info.emailAddress || "",
          userType: info.userType as "seller" | "buyer" || "buyer",
          userId: info.userId || "",
          role: (info.role === "admin" || info.role === "user") ? info.role : "user",
          token: info.token || "",
        };
        console.log(info.token)
        setUserInfo(userInfo);
        onClose(); // Close the modal on successful login
        notifySuccess("Login successfully!");
        if (info.userType === "buyer") {
          navigate("/buyer-dashboard");
        } else {
          navigate("/seller-dashboard");
        }
      } else {
        notifyError("Login failed: Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      notifyError("Login failed: Unable to connect");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleLogin}>
          <div className="mb-5 flex items-center">
            <label className="w-1/3 text-gray-600 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-5 flex items-center">
            <label className="w-1/3 text-gray-600 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-6 text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginModal;