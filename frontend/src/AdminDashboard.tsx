import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { notifyError } from "./components/Notification";
import { userFund } from "./api"; // Adjust API functions as necessary
import axios from "axios";

const stateTextColors = {
  active: "text-green-500",
  inactive: "text-yellow-500",
  archived: "text-gray-500",
  completed: "bg-green-500 text-white",
};


const AdminDashboard = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [funds, setFunds] = useState<number>(0);
  const [bids, setBids] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);

  const CustomColor = ({ value }: { value: keyof typeof stateTextColors }) => {
    const colorClass = stateTextColors[value] || "bg-red-500 text-white";
    return (
      <div className={`px-2 py-1 font-bold rounded ${colorClass}`}>
        {value.toUpperCase()}
      </div>
    );
  };

  const fetchFunds = useCallback(async () => {
    if (!userInfo) return;
    try {
      const response = await userFund({
        headers: { Authorization: `${userInfo.token}` },
      });
      if (response.error && response.error.status === 401) {
        notifyError(`Unauthorized Access`);
        setUserInfo(null);
      } else if (response.error) {
        notifyError(`Error fetching funds`);
      } else {
        setFunds(response.data.payload.fund || 0);
      }
    } catch (err) {
      notifyError(`Error fetching funds`);
    }
  }, [userInfo, setUserInfo]);
  
  const Customlink = ({ value }: { value: string }) => {    
    let link = "https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/"+value;
    return (
      <div className={`px-2 py-1 font-bold rounded`}>
        <a href={link}> Link </a>
      </div>
    );
  };
  const columnDefs: any[] = [
    { field: "id", headerName: "ID", sortable: true, filter: true },
    { field: "name", headerName: "Name", sortable: true, filter: true },
    {
      field: "description",
      headerName: "Description",
      sortable: true,
      filter: true,
    },
    {
      field: "initPrice",
      headerName: "Initial Price ($)",
      sortable: true,
      filter: true,
    },
    {
      field: "lengthOfAuction",
      headerName: "Auction Length",
      sortable: true,
      filter: true,
      valueFormatter: (p: { value: number }) => {
        const day = Math.floor(p.value / (24 * 60 * 60 * 1000));
        const hour = Math.floor((p.value / (60 * 60 * 1000)) % 24);
        const min = Math.floor((p.value / (60 * 1000)) % 60);
        const sec = Math.floor((p.value / 1000) % 60);
        return `${day}d ${hour}h ${min}m ${sec}s`;
      },
    },
    {
      field: "itemState",
      headerName: "Status",
      valueFormatter: (p: { value: string }) => p.value.toUpperCase(),
      cellRenderer: CustomColor,
      sortable: true,
      filter: true,
    },
    {
      field: "endDate",
      headerName: "End Date",
      sortable: true,
      filter: true,
      valueFormatter: (p: { value: string }) =>
        new Date(p.value).toLocaleString(),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      sortable: true,
      filter: true,
      valueFormatter: (p: { value: string }) =>
        new Date(p.value).toLocaleString(),
    },
    {
      field: "isAvailableToBuy",
      headerName: "Available to Buy?",
      sortable: true,
      filter: true,
      valueFormatter: (p: { value: boolean }) =>
        p.value ? "Yes" : "No",
    },
    {
      field: "sellerId",
      headerName: "Seller ID",
      sortable: true,
      filter: true,
    },
    {
      field: "currentBidId",
      headerName: "Current Bid ID",
      sortable: true,
      filter: true,
    },
    {
      field: "pastBidIds",
      headerName: "No of Bids",
      sortable: false,
      filter: false,
      cellRenderer: (p: { value: string[] }) => {
        return <span>{p.value ? p.value.length : 0}</span>;
      }
    },
    {
      field: "images",
      headerName: "Image Link",
      sortable: false,
      filter: false,
      cellRenderer: Customlink
    }
  ];
  
  const fetchBids = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://1j7ezifj2f.execute-api.us-east-1.amazonaws.com/api/admin/bids",
        { headers: { Authorization: `${userInfo?.token}` } }
      );
      setBids(response.data.payload || []);
    } catch (err) {
      notifyError(`Error fetching bids`);
    }
  }, [userInfo]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://1j7ezifj2f.execute-api.us-east-1.amazonaws.com/api/admin/users",
        { headers: { Authorization: `${userInfo?.token}` } }
      );
      setUsers(response.data.payload || []);
    } catch (err) {
      notifyError(`Error fetching users`);
    }
  }, [userInfo]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://1j7ezifj2f.execute-api.us-east-1.amazonaws.com/api/items",
        { headers: { Authorization: `${userInfo?.token}` } }
      );
      setItems(response.data.payload || []);
    } catch (err) {
      notifyError(`Error fetching items`);
    }
  }, [userInfo]);

  useEffect(() => {
    fetchFunds();
    fetchBids();
    fetchUsers();
    fetchItems();
  }, [fetchFunds, fetchBids, fetchUsers, fetchItems]);

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {userInfo && (
          <div className="flex items-center gap-4">
            <p className="text-lg font-bold">Welcome, {userInfo.username}</p>
            <Button color="blue" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button color="red" onClick={() => setUserInfo(null)}>
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* Fund Display */}
      <div className="mb-8 flex space-x-4">
        <Button className="p-2 bg-green-500 text-white rounded">
          Total Commission: ${funds}
        </Button>
      </div>

      {/* Bids */}
      <div
        className="ag-theme-alpine rounded-lg shadow-lg"
        style={{ height: "80vh", width: "100%" }}
      >
        <AgGridReact
          rowData={items}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          defaultColDef={{
            flex: 1, // Automatically distribute column width equally
            minWidth: 100, // Minimum width for each column
            resizable: true, // Allow column resizing
            floatingFilter: true, // Enable floating filters
          }}
        />
      </div>

      {/* Users */}
      <div className="mb-8">
        <h2 className="text-xl font-bold">Users</h2>
        <ul>
          {users.map((user: any) => (
            <li key={user.userId}>
              {user.firstName} {user.lastName} - {user.userType} ({user.role})
            </li>
          ))}
        </ul>
      </div>

      {/* Items */}
      <div>
        <h2 className="text-xl font-bold">Auction Items</h2>
        <ul>
          {items.map((item: any) => (
            <li key={item.id}>
              {item.name} - ${item.initPrice} ({item.itemState})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
