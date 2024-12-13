import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { notifyError, notifySuccess } from "./components/Notification";
import { Bar, Pie, Line, Scatter } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  Item,
  Bid,
  userFund,
  adminUsers,
  adminBids,
  itemSearch,
  adminFreezeItem,
} from "./api";
import { User } from "./models/User";
import { createForensicsReport } from "./helpers/forensicHelper";
// import Papa from "papaparse"; // Import papaparse
import * as XLSX from "xlsx";
import { FaDownload } from "react-icons/fa";

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
  const [bids, setBids] = useState<Bid[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [itemsFrozen, setFrozenItems] = useState<Item[]>([]);


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

  const downloadExcelFile = (
    itemsData: any[],
    bidsData: any[],
    usersData: any[],
    filename: string
  ) => {
    // Map the items data
    const itemsSheetData = itemsData.map((val) => {
      let obj: Record<string, any> = {};
      obj["id"] = val["id"] || "";
      obj["Item Name"] = val["name"] || "";
      obj["Description"] = val["description"] || "";
      obj["Status"] = val["itemState"] || "";
      obj["Item Available to Buy"] = val["isAvailableToBuy"] ? "Yes" : "No";
      obj["Item Freezed"] = val["isFreezed"] ? "Yes" : "No";
      obj["No Of Bids"] = val["pastBidIds"] ? val["pastBidIds"].length : 0;
      obj["Length of Auction"] =
        `${Math.floor(val["lengthOfAuction"] / (24 * 60 * 60 * 1000))}d ${Math.floor((val["lengthOfAuction"] / (60 * 60 * 1000)) % 24)}h ${Math.floor((val["lengthOfAuction"] / (60 * 1000)) % 60)}m ${Math.floor((val["lengthOfAuction"] / 1000) % 60)}s`;
      obj["List of Past Bids"] = val["pastBidIds"].join(",");
      obj["Current Bid Id"] = val["currentBidId"] || "";
      obj["Start Date"] = new Date(val["startDate"]);
      obj["End Date"] = new Date(val["endDate"]);
      obj["Initial Price"] = val["initPrice"] || 0;
      obj["Seller Id"] = val["sellerId"] || "";
      obj["Images Link"] = val["images"]
        .map((v1: string) => `https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/${v1}`)
        .toString();
      return obj;
    });

    // Map the bids data
    const bidsSheetData = bidsData.map((val) => {
      let obj: Record<string, any> = {};
      obj["id"] = val["id"] || "";
      obj["Item Id"] = val["bidItemId"] || "";
      obj["Bid Time"] = val["bidTime"] || "";
      obj["Bid UserId"] = val["bidUserId"] || "";
      obj["Bid Amount"] = val["bidAmount"] || "";
      obj["Bid status"] = val["isActive"] ? "Active" : "InActive";
      return obj;
    });

    // Map the users data
    const usersSheetData = usersData.map((val) => {
      let obj: Record<string, any> = {};
      obj["User Id"] = val["userId"] || "";
      obj["Email Address"] = val["id"] || "";
      obj["username"] = val["username"] || "";
      obj["Firstname"] = val["firstName"] || "";
      obj["Lastname"] = val["lastName"] || "";
      obj["User Type"] = val["userType"] || "";
      obj["Role"] = val["role"] || "";
      obj["Account status"] = val["isActive"] ? "Active" : "Closed";
      return obj;
    });

    // Convert to worksheets
    const itemsSheet = XLSX.utils.json_to_sheet(itemsSheetData);
    const bidsSheet = XLSX.utils.json_to_sheet(bidsSheetData);
    const usersSheet = XLSX.utils.json_to_sheet(usersSheetData);

    // Create a workbook and append sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, itemsSheet, "Items");
    XLSX.utils.book_append_sheet(workbook, bidsSheet, "Bids");
    XLSX.utils.book_append_sheet(workbook, usersSheet, "Users");

    // Write the file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };
  const CustomLink = ({ value }: { value: string }) => {
    const link =
      "https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/" +
      value;

    const downloadFile = async (
      fileUrl: string,
      fileName: string,
      fileExtension: string
    ) => {
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
        <button onClick={() => downloadFile(link, value, "png")}> Link </button>
      </div>
    );
  };

  const FrozenButtonComponent = ({ data }: { data: Item }) =>
    data.isFrozen && data.itemState === "active" ? (
      <button
        onClick={() => handleFreezeItem(data.id, "unfreeze")}
        className="px-2 py-1 rounded bg-yellow-800 text-white hover:bg-blue-600"
      >
        Unfreeze Item
      </button>
    ) : !data.isFrozen && data.itemState === "active" ? (
      <button
        onClick={() => handleFreezeItem(data.id, "freeze")}
        className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-blue-600"
      >
        Freeze Item
      </button>
    ) : null;
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
      cellRenderer: FrozenButtonComponent,
      getWidthOfColsInList: 100,
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
      valueFormatter: (p: { value: boolean }) => (p.value ? "Yes" : "No"),
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
      },
    },
    {
      field: "images",
      headerName: "Image Link",
      sortable: false,
      filter: false,
      cellRenderer: CustomLink,
    },
  ];
  const columnDefs1: any[] = [
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
      cellRenderer: FrozenButtonComponent,
      getWidthOfColsInList: 100,
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
      valueFormatter: (p: { value: boolean }) => (p.value ? "Yes" : "No"),
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
      },
    },
    {
      field: "images",
      headerName: "Image Link",
      sortable: false,
      filter: false,
      cellRenderer: CustomLink,
    },
  ];

  const fetchBids = useCallback(async () => {
    try {
      const response = await adminBids({
        headers: { Authorization: `${userInfo?.token}` },
      });
      setBids(response?.data?.payload || []);
    } catch (err) {
      notifyError(`Error fetching bids`);
    }
  }, [userInfo]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminUsers({
        headers: { Authorization: `${userInfo?.token}` },
      });
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
          itemUnfreezeRequests: user.itemUnfreezeRequests || [],
        }));
        setUsers(usersData);
      } else {
        setUsers([]);
      }
    } catch (err) {
      notifyError(`Error fetching users`);
    }
  }, [userInfo]);

  const handleFreezeItem = async (id: string, action: "freeze" | "unfreeze") => {
    if (!userInfo) return;

    const confirmClose = window.confirm(
      "Are you sure you want to freeze this item? This action cannot be undone."
    );
    if (!confirmClose) return;

    try {
      const response = await adminFreezeItem({
        headers: { Authorization: (userInfo as any).token },
        path: { itemId: id },
        body: { action },
      });

      if (response.error) {
        notifyError(
          response.error.message || "An error occurred while freezing the item."
        );
      } else {
        notifySuccess(`${action==="freeze" ? 'Item has been frozen successfully.': 'Item has been unfrozen successfully.'}.`);
        fetchItems();
        fetchFrozenItems();
      }
    } catch (error) {
      console.error("Error freezing item:", error);
      notifyError("Error: An error occurred while freezing the item.");
    }
  };
// eslint-disable-next-line
  const fetchItems = useCallback(async () => {
    try {
      const response = await itemSearch({
        headers: { Authorization: `${userInfo?.token}` },
      });
      setItems(
        Array.isArray(response?.data?.payload) ? response.data.payload : []
      );
    } catch (err) {
      notifyError(`Error fetching items`);
    }
    // eslint-disable-next-line
  }, [userInfo]);
  
// eslint-disable-next-line
  const fetchFrozenItems = useCallback( async() => {
    try {
      const response = await itemSearch({
        headers: { Authorization: `${userInfo?.token}`},
      });

      let admin = users.filter((user) => user.role === "admin");
      const frozenRequests = admin.flatMap((user) => user.itemUnfreezeRequests || []);
      const frozenItems = Array.isArray(response.data?.payload) ? (response.data.payload as Item[]).filter((item) => frozenRequests.includes(item.id)) : [];
      setFrozenItems(frozenItems);
    } catch (err) {
      notifyError(`Error fetching items`);
    }
   // eslint-disable-next-line
  },[]);
  


  useEffect(() => {
    fetchFunds();
    fetchBids();
    fetchUsers()
    fetchItems();
    fetchFrozenItems();
  }, [fetchFunds, fetchBids, fetchUsers, fetchItems, fetchFrozenItems]);  
    const [showModal, setShowModal] = useState(false);
  
    const toggleModal = () => setShowModal(!showModal);
  
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

      {/* Card View */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white text-black p-4 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold">Total Commission</h3>
          <p className="text-2xl font-bold">${funds}</p>
        </div>
        <div className="bg-white text-black p-4 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold">Total Bids</h3>
          <p className="text-2xl font-bold">{bids.length}</p>
        </div>
        <div className="bg-white text-black p-4 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold">Total Buyers</h3>
          <p className="text-2xl font-bold">
            {users.filter((user) => user.userType === "buyer").length}
          </p>
        </div>
        <div className="bg-white text-black p-4 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold">Total Sellers</h3>
          <p className="text-2xl font-bold">
            {users.filter((user) => user.userType === "seller").length}
          </p>
        </div>
        <div className="bg-white text-black p-4 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold">Total Items</h3>
          <p className="text-2xl font-bold">{items.length}</p>
        </div>

      </div>

      {/* Fund Display */}
      <div className="mb-1 flex space-x-2">
        <Button
          className="bg-green-800 text-white flex items-center rounded"
          onClick={() => downloadExcelFile(items, bids, users, "AuctionReport")}
        >
          <FaDownload className="mr-2" />
          <span>Download Auction Report</span>
        </Button>
        <Button
          className="bg-green-800 text-white flex items-center rounded"
          onClick={() => toggleModal()}
        >
          <span>Forensics Report</span>
        </Button>
      </div>
      {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              width: '90%',
              maxHeight: '90%',
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
              <ForensicsDashboard
                users={users} 
                items={items} 
                bids={bids}
                toggleModal={toggleModal}
              />
            </div>
          </div>
        )}
      {/* Download Buttons */}
      <div className="mb-4 flex gap-4">
       
      </div>
      {/* AgGrid Table */}
      <h2 className="text-xl font-semibold mb-4">Request Unfreeze Queue</h2>
      <div
        className="ag-theme-alpine rounded-lg shadow-lg"
        style={{ width: "100%" }}
      >
        <AgGridReact
          rowData={itemsFrozen}
          columnDefs={columnDefs1}
          domLayout="autoHeight"
          defaultColDef={{
            flex: 1,
            minWidth: 120, // Minimum width for each column
            resizable: true, // Allow column resizing
            floatingFilter: true, // Enable floating filters
          }}
        />
      </div>
      <h2 className="text-xl font-semibold mb-4 mt-2">Items</h2>

      <div
        className="ag-theme-alpine rounded-lg shadow-lg"
        style={{ width: "100%" }}
      >
        <AgGridReact
          rowData={items}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          defaultColDef={{
            flex: 1,
             minWidth: 120, // Minimum width for each column
            resizable: true, // Allow column resizing
            floatingFilter: true, // Enable floating filters
          }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;

const ForensicsDashboard = ({ users, items, bids, toggleModal }: { users: User[], items: Item[], bids: Bid[], toggleModal: () => void }) => {
  // downloadForensics(users, items, bids)
  const data = createForensicsReport(users, items, bids);

  const downloadForensics = (us: User[], is: Item[], bs: Bid[]) => {
    const filename = `forensics.json`;
    const json = JSON.stringify(createForensicsReport(us, is, bs));
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const pieData = {
    labels: ['Active', 'Archived', 'Completed', 'Failed', 'Inactive', 'Frozen Item'],
    datasets: [
      {
        data: [data['item.item_count_by_state.active'], data['item.item_count_by_state.archived'], data['item.item_count_by_state.completed'], data['item.item_count_by_state.failed'], data['item.item_count_by_state.inactive'], data['item.frozen_items']],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  const barData = {
    labels: ['Max', 'Mean', 'Median', 'Mode', 'Std Dev'],
    datasets: [
      {
        label: 'Bids per Item',
        data: [
          data['item.item_bid_count.max'],
          data['item.item_bid_count.mean'],
          data['item.item_bid_count.median'],
          data['item.item_bid_count.mode'],
          data['item.item_bid_count.standard_derivation'],
        ],
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const lineData = {
    labels: ['Max', 'Mean', 'Median', 'Mode', 'Std Dev'],
    datasets: [
      {
        label: 'Initial Price',
        data: [
          data['item.item_initial_price.max'],
          data['item.item_initial_price.mean'],
          data['item.item_initial_price.median'],
          data['item.item_initial_price.mode'],
          data['item.item_initial_price.stdDev'],
        ],
        borderColor: '#FF6384',
        fill: false,
      },
      {
        label: 'Sold Price',
        data: [
          data['item.item_sold_price.max'],
          data['item.item_sold_price.mean'],
          data['item.item_sold_price.median'],
          data['item.item_sold_price.mode'],
          data['item.item_sold_price.stdDev'],
        ],
        borderColor: '#36A2EB',
        fill: false,
      },
    ],
  };

  const scatterData = {
    datasets: [
      {
        label: 'Price Relation',
        data: [
          { x: data['item.item_initial_price.max'], y: data['item.item_sold_price.max'] },
          { x: data['item.item_initial_price.mean'], y: data['item.item_sold_price.mean'] },
          { x: data['item.item_initial_price.median'], y: data['item.item_sold_price.median'] },
          { x: data['item.item_initial_price.mode'], y: data['item.item_sold_price.mode'] },
        ],
        backgroundColor: '#9966FF',
      },
    ],
  };

  return (
   <div>
    <div>
      <div className="flex justify-between items-center"></div>
      
      <Button className="m-2" onClick={() => downloadForensics(users, items, bids)}> <FaDownload className="mr-2" />Download Forensics JSON file</Button>
     
    </div>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f9f9f9',
      color: '#333',
    }}>
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px', textAlign: 'center' }}>Item State Distribution</h3>
        <Pie data={pieData} />
      </div>
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px', textAlign: 'center' }}>Bids per Item</h3>
        <Bar data={barData} />
      </div>
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px', textAlign: 'center' }}>Price Analysis</h3>
        <Line data={lineData} />
      </div>
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px', textAlign: 'center' }}>Price Relation</h3>
        <Scatter data={scatterData} />
      </div>
    </div>
    <Button  style={{float: "right"}} className="m-2" onClick={toggleModal}>Close</Button>
  </div>
  );
};

