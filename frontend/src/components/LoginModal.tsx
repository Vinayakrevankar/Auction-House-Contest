// src/components/LoginModal.tsx
import React, { useState } from 'react';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal = ({ onClose }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with', { email, password });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h2>
        
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
          
          <button type="submit" className="w-full btn-primary">
            Login
          </button>
        </form>

        <button onClick={onClose} className="mt-6 text-gray-500 hover:text-gray-700">Close</button>
      </div>
    </div>
  );
};

export default LoginModal;
