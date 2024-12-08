import React from 'react';
import { useAuth } from "./AuthContext";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();

  return ( <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white">
    {/* Header */}
    <div className="flex justify-between items-center mb-5">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {userInfo && (
        <div className="flex items-center gap-4">
          <p className="text-lg font-bold">Welcome, {userInfo.username}</p>
         
          <Button
            color="blue"
            onClick={() => {
                navigate("/");
            }}
          >
            Home
          </Button>
          <Button color="red" onClick={() => setUserInfo(null)}>
            Logout
          </Button>
        </div>
      )}
    </div>

    {/* Buttons to open modals */}
    <div className="mb-8 flex space-x-4">
      <button
        // onClick={() => }
        className="p-2 bg-green-500 text-white rounded"
      >
       Generate Auction Report
      </button>
      <button
        // onClick={() => }
        className="p-2 bg-yellow-500 text-white rounded"
      >
       Generate Forensic Auction Report
      </button>
    </div>

  </div>)
};

export default AdminDashboard;

