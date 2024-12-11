import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { notifyError, notifySuccess } from "./components/Notification";
import { Item, userFund, adminUsers,adminBids,itemSearch, adminFreezeItem } from "./api";
import Papa from "papaparse"; // Import papaparse

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
  interface Bid {
    id: string;
    bidItemId: string;
    bidTime: string;
    bidUserId: string;
    bidAmount: number;
    isActive: boolean;
  }
  const [bids, setBids] = useState<Bid[]>([]);
  interface User {
    userId: string;
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    userType: string;
    role: string;
    isActive: boolean;
  }
  
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);

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
  
  const CustomLink = ({ value }: { value: string }) => {
    const link = "https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/" + value;
  
    const downloadFile = async (fileUrl: string, fileName: string, fileExtension: string) => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const blob = await response.blob();
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${fileName}.${fileExtension}`;
        downloadLink.click();
        URL.revokeObjectURL(downloadLink.href);
      } catch (error) {
        console.error("Error downloading the file:", error);
      }
    };
  
    return (
      <div className="px-2 py-1 font-bold rounded">
        <button onClick={() => downloadFile(link, value, 'png')}> Link </button>
      </div>
    );
  };
  
  
  const FrozenButtonComponent = ({ data }: { data: Item }) => (
    !data.isFrozen && data.itemState === "active" ? (
      <button
        onClick={() => handleFreezeItem(data.id)}
        className="px-2 py-1 rounded bg-red-500 text-white hover:bg-blue-600"
      >
        Click to Freeze Item
      </button>
    ) : null
  );
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
      field: "isFreezed",
      headerName: "Item Freezed",
      sortable: true,
      filter: true,
      valueFormatter: (p: { value: boolean }) => (p.value ? "Yes" : "No"),
    },
    {
      field: "isFreezed",
      headerName: "Freeze Item",
      sortable: true,
      filter: true,
      cellRenderer: FrozenButtonComponent,
      getWidthOfColsInList: 100,
      flex: 1,
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
      cellRenderer: CustomLink
    }
  ];
  
  const fetchBids = useCallback(async () => {
    try {
      const response = await adminBids(
        { headers: { Authorization: `${userInfo?.token}` } }
      );
      setBids(response?.data?.payload || []);
    } catch (err) {
      notifyError(`Error fetching bids`);
    }
  }, [userInfo]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminUsers(
        { headers: { Authorization: `${userInfo?.token}` } }
      );
      if (response.data && response.data.payload) {
        const usersData: User[] = response.data.payload.map((user: any) => ({
          userId: user.userId,
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          role: user.role,
          isActive: user.isActive,
        }));
        setUsers(usersData);
      } else {
        setUsers([]);
      }
    } catch (err) {
      notifyError(`Error fetching users`);
    }
  }, [userInfo]);
  
  const handleFreezeItem = async (id: string) => {
    if (!userInfo) return;

    const confirmClose = window.confirm(
      "Are you sure you want to freeze this item? This action cannot be undone."
    );
    if (!confirmClose) return;

    try {
      const response = await adminFreezeItem({
        headers: { Authorization: (userInfo as any).token },
        path: { itemId: id },
      });

      if (response.error) {
        notifyError(
          response.error.message || "An error occurred while freezing the item."
        );
      } else {
        notifySuccess("Item is successfully frozen.");
      }
    } catch (error) {
      console.error("Error freezing item:", error);
      notifyError("Error: An error occurred while freezing the item.");
    }
  };

  const fetchItems = useCallback(async () => {
    try {
      const response = await itemSearch(
        { headers: { Authorization: `${userInfo?.token}` } }
      );
      setItems(Array.isArray(response?.data?.payload) ? response.data.payload : []);
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

  const downloadItemCSV = (data: any[], filename: string) => {
    data = data.map(val=> {
      let obj: Record<string, any> = {};
      obj['id'] = val['id'] || '';
      obj['Item Name'] = val['name'] || '';
      obj['Description'] = val['description'] || '';
      obj['Status'] = val['itemState'] || '';
      obj['Item Available to Buy'] = val['isAvailableToBuy'] ? 'Yes' : 'No';
      obj['Item Freezed'] = val['isFreezed'] ? 'Yes' : 'No';
      obj['No Of Bids'] = val['pastBidIds'] ? val['pastBidIds'].length : 0;
      obj['Length of Auction'] = `${Math.floor(val['lengthOfAuction'] / (24 * 60 * 60 * 1000))}d ${Math.floor((val['lengthOfAuction'] / (60 * 60 * 1000)) % 24)}h ${Math.floor((val['lengthOfAuction'] / (60 * 1000)) % 60)}m ${Math.floor((val['lengthOfAuction'] / 1000) % 60)}s`;
      obj['List of Past Bids'] = val['pastBidIds'].join(',');
      obj['Current Bid Id'] = val['currentBidId'] || '';
      obj['Start Date'] = new Date(val['startDate'])
      obj['End Date'] = new Date(val['endDate'])
      obj['Initial Price'] = val['initPrice'] || 0;
      obj['Seller Id'] = val['sellerId'] || '';
      obj['Images Link'] = val['images'].map((v1: string) => `https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/${v1}`);
     
      return obj;
    })
    const csv = Papa.unparse(data); // Convert JSON to CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const downloadBidsCSV = (data: any[], filename: string) => {
    data = data.map(val=> {
      let obj: Record<string, any> = {};
      obj['id'] = val['id'] || '';
      obj['Item Id'] = val['bidItemId'] || '';
      obj['Bid Time'] = val['bidTime'] || '';
      obj['Bid UserId'] = val['bidUserId'] || '';
      obj['Bid Amount'] = val['bidAmount'] || '';
      obj['Bid status'] = val['isActive'] ? 'Active' : 'InActive';
      return obj;
    })
    const csv = Papa.unparse(data); // Convert JSON to CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const downloadUserCSV  = (data: any[], filename: string) => {

    data = data.map(val=> {
      let obj: Record<string, any> = {};
      obj['User Id'] = val['userId'] || '';
      obj['Email Address'] = val['id'] || '';
      obj['username'] = val['username'] || '';
      obj['Firstname'] = val['firstName'] || '';
      obj['Lastname'] = val['lastName'] || '';
      obj['User Type'] = val['userType'] || '';
      obj['Role'] = val['role'] || '';
      obj['Account status'] = val['isActive'] ? 'Active' : 'Closed';
      return obj;
    })

    const csv = Papa.unparse(data); // Convert JSON to CSV
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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

      {/* Download Buttons */}
      <div className="mb-4 flex gap-4">
        <Button
          className="bg-blue-500 text-white"
          onClick={() => downloadItemCSV(items, "items.csv")}
        >
          Download Items as CSV
        </Button>
        <Button
          className="bg-blue-500 text-white"
          onClick={() => downloadBidsCSV(bids, "bids.csv")}
        >
          Download Bids as CSV
        </Button>
        <Button
          className="bg-blue-500 text-white"
          onClick={() => downloadUserCSV(users, "users.csv")}
        >
          Download Users as CSV
        </Button>
      </div>

      {/* AgGrid Table */}
      <div
        className="ag-theme-alpine rounded-lg shadow-lg"
        style={{ height: "80vh", width: "100%" }}
      >
        <AgGridReact
          rowData={items}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          defaultColDef={{
            flex: 1, // Take up all available space
            minWidth: 120, // Minimum width for each column
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
