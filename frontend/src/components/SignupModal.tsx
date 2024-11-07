// src/components/SignupModal.tsx
import React, { useState } from 'react';

interface SignupModalProps {
  onClose: () => void;
}

const SignupModal = ({ onClose }: SignupModalProps) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    userType: 'buyer', // Default to buyer
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const signupData = {
      ...form,
      role: "user",
      isActive: true,
    };
    console.log('Signing up with', signupData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full transform transition-all duration-300">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Signup</h2>
        
        <form onSubmit={handleSubmit}>
          {[
            { label: "Username", name: "username", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Password", name: "password", type: "password" },
            { label: "Confirm Password", name: "confirmPassword", type: "password" },
          ].map((field) => (
            <div className="mb-4 flex items-center" key={field.name}>
              <label className="w-1/3 text-gray-600 font-medium">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          ))}

          <div className="mb-5 flex items-center">
            <label className="w-1/3 text-gray-600 font-medium">User Type</label>
            <div className="w-2/3 flex items-center space-x-6">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="userType" 
                  value="seller" 
                  checked={form.userType === 'seller'} 
                  onChange={handleChange} 
                  className="mr-2"
                /> Seller
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="userType" 
                  value="buyer" 
                  checked={form.userType === 'buyer'} 
                  onChange={handleChange} 
                  className="mr-2"
                /> Buyer
              </label>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary">
            Signup
          </button>
        </form>

        <button onClick={onClose} className="mt-6 text-gray-500 hover:text-gray-700">Close</button>
      </div>
    </div>
  );
};

export default SignupModal;
