import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { notifyError, notifySuccess } from "./components/Notification";
import { userFund } from "./api"; // Ensure buyerAddFunds is imported

const AdminDashboard = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [funds, setFunds] = useState<number>(0);

  const fetchFunds = useCallback(async () => {
    if (!userInfo) return;
    const response = await userFund({
      headers: {
        "Authorization": `${userInfo.token}`,
      }
    });
    if (response.error) {
      notifyError(`Error fetching funds: ${response.error.message}`);
    } else {
      setFunds(response.data.payload.fund || 0 );
    }
  }, [userInfo]);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);
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
    <Button
              className="p-2 bg-green-500 text-white rounded"
            >
             Total Commission: ${funds}
            </Button>
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

