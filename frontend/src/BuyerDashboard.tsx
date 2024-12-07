// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { buyerBids, buyerPurchases, buyerClose, Bid, Purchase } from "./api";
// import { useAuth } from "./AuthContext";
// import { notifyError, notifySuccess } from "./components/Notification";
// import LogoutButton from "./components/LogoutButton";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";

// const BuyerDashboard: React.FC = () => {
//   const { userInfo, setUserInfo } = useAuth();
//   const navigate = useNavigate();
//   const [activeBids, setActiveBids] = useState<Bid[]>([]);
//   const [purchases, setPurchases] = useState<Purchase[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [showActiveBidsModal, setShowActiveBidsModal] = useState(false);
//   const [showPurchasesModal, setShowPurchasesModal] = useState(false);

//   // Fetch active bids
//   const fetchActiveBids = useCallback(async () => {
//     if (!userInfo) return;
//     try {
//       console.log(
//         "Fetching active bids for user:",
//         decodeURIComponent(userInfo.emailAddress)
//       );
//       const resp = await buyerBids({
//         headers: { Authorization: userInfo.token },
//         path: {
//           buyerId: encodeURIComponent(
//             decodeURIComponent(userInfo.emailAddress)
//           ),
//         },
//       });
//       console.log("Active bids response:", resp);
//       if (resp.data) {
//         console.log("Setting active bids:", resp.data.payload);
//         setActiveBids(resp.data.payload);
//       } else if (resp.error && resp.error.status === 401) {
//         notifyError("Unauthorized Access");
//         setUserInfo(null);
//         navigate("/");
//       } else {
//         notifyError("Failed to fetch active bids");
//       }
//     } catch (err) {
//       console.error("Error fetching active bids:", err);
//       notifyError("Error fetching active bids");
//     }
//   }, [userInfo, setUserInfo, navigate]);

//   // Fetch purchases
//   const fetchPurchases = useCallback(async () => {
//     if (!userInfo) return;
//     try {
//       const resp = await buyerPurchases({
//         headers: { Authorization: userInfo.token },
//         path: {
//           buyerId: encodeURIComponent(
//             decodeURIComponent(userInfo.emailAddress)
//           ),
//         },
//       });
//       if (resp.data) {
//         setPurchases(resp.data.payload);
//       } else if (resp.error && resp.error.status === 401) {
//         notifyError("Unauthorized Access");
//         setUserInfo(null);
//         navigate("/");
//       } else {
//         notifyError("Failed to fetch purchases");
//       }
//     } catch (err) {
//       console.error("Error fetching purchases:", err);
//       notifyError("Error fetching purchases");
//     }
//   }, [userInfo, setUserInfo, navigate]);

//   useEffect(() => {
//     if (!userInfo) {
//       navigate("/", { state: { openLoginModal: true } });
//     } else {
//       setLoading(false);
//       fetchActiveBids();
//       fetchPurchases();
//     }
//   }, [userInfo, navigate, fetchActiveBids, fetchPurchases]);

//   // Handler for closing the account
//   const handleCloseAccount = async () => {
//     if (!userInfo) return;

//     const confirmClose = window.confirm(
//       "Are you sure you want to close your account? This action cannot be undone."
//     );
//     if (!confirmClose) return;

//     try {
//       const response = await buyerClose({
//         headers: { Authorization: `${userInfo.token}` },
//         path: { buyerId: userInfo.userId },
//       });

//       if (response.data) {
//         notifySuccess("Account closed successfully.");
//         setUserInfo(null);
//         navigate("/", { replace: true });
//       } else if (response.error && response.error.status === 401) {
//         notifyError("Unauthorized Access");
//         setUserInfo(null);
//         navigate("/");
//       } else {
//         notifyError("Failed to close account");
//       }
//     } catch (error) {
//       console.error("Error closing account:", error);
//       notifyError("An error occurred while closing your account.");
//     }
//   };

//   // ActiveBidsModal Component
//   const ActiveBidsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//     const columnDefs: any[] = [
//       {
//         headerName: "Item ID",
//         field: "bidItemId",
//         sortable: true,
//         filter: true,
//       },
//       {
//         headerName: "Bid Amount",
//         field: "bidAmount",
//         sortable: true,
//         filter: true,
//       },
//       {
//         headerName: "Bid Time",
//         field: "bidTime",
//         sortable: true,
//         filter: true,
//       },
//     ];

//     return (
//       <div className="modal">
//         <h2 className="text-xl font-semibold mb-4">Active Bids</h2>
//         <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
//           <AgGridReact
//             rowData={activeBids}
//             columnDefs={columnDefs}
//             pagination={true}
//             paginationPageSize={10}
//           />
//         </div>
//         <button
//           onClick={onClose}
//           className="mt-4 p-2 bg-blue-500 text-white rounded"
//         >
//           Close
//         </button>
//       </div>
//     );
//   };

//   // PurchasesModal Component
//   const PurchasesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
//     const columnDefs: any[] = [
//       {
//         headerName: "Item Name",
//         field: "itemName",
//         sortable: true,
//         filter: true,
//       },
//       { headerName: "Price", field: "price", sortable: true, filter: true },
//       {
//         headerName: "Sold Time",
//         field: "soldTime",
//         sortable: true,
//         filter: true,
//       },
//       {
//         headerName: "Fulfill Time",
//         field: "fulfillTime",
//         sortable: true,
//         filter: true,
//       },
//     ];

//     return (
//       <div className="modal">
//         <h2 className="text-xl font-semibold mb-4">Purchases</h2>
//         <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
//           <AgGridReact
//             rowData={purchases}
//             columnDefs={columnDefs}
//             pagination={true}
//             paginationPageSize={10}
//           />
//         </div>
//         <button
//           onClick={onClose}
//           className="mt-4 p-2 bg-blue-500 text-white rounded"
//         >
//           Close
//         </button>
//       </div>
//     );
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
//         <div className="flex space-x-4">
//           <LogoutButton />
//           {/* Close Account Button */}
//           <button
//             onClick={handleCloseAccount}
//             className="p-2 bg-red-600 text-white rounded"
//           >
//             Close Account
//           </button>
//         </div>
//       </div>



//       {/* Buttons to open modals */}
//       <div className="mb-8">
//         <button
//           onClick={() => setShowActiveBidsModal(true)}
//           className="mr-4 p-2 bg-green-500 text-white rounded"
//         >
//           Review Active Bids
//         </button>
//         <button
//           onClick={() => setShowPurchasesModal(true)}
//           className="p-2 bg-yellow-500 text-white rounded"
//         >
//           Review Purchases
//         </button>
//       </div>

//       {/* Modals */}
//       {showActiveBidsModal && (
//         <ActiveBidsModal onClose={() => setShowActiveBidsModal(false)} />
//       )}
//       {showPurchasesModal && (
//         <PurchasesModal onClose={() => setShowPurchasesModal(false)} />
//       )}
//     </div>
//   );
// };

// export default BuyerDashboard;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buyerBids, buyerPurchases, buyerClose, buyerAddFunds, Bid, Purchase } from "./api"; // Ensure buyerAddFunds is imported
import { useAuth } from "./AuthContext";
import { notifyError, notifySuccess } from "./components/Notification";
import { Button } from "flowbite-react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const BuyerDashboard: React.FC = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [funds, setFunds] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  const [showActiveBidsModal, setShowActiveBidsModal] = useState(false);
  const [showPurchasesModal, setShowPurchasesModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false); // New state for Add Funds modal

  // Fetch active bids
  const fetchActiveBids = useCallback(async () => {
    if (!userInfo) return;
    try {
      console.log(
        "Fetching active bids for user:",
        decodeURIComponent(userInfo.emailAddress)
      );
      const resp = await buyerBids({
        headers: { Authorization: userInfo.token },
        path: {
          buyerId: encodeURIComponent(
            decodeURIComponent(userInfo.emailAddress)
          ),
        },
      });
      console.log("Active bids response:", resp);
      if (resp.data) {
        console.log("Setting active bids:", resp.data.payload);
        setActiveBids(resp.data.payload);
      } else if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
        navigate("/");
      } else {
        notifyError("Failed to fetch active bids");
      }
    } catch (err) {
      console.error("Error fetching active bids:", err);
      notifyError("Error fetching active bids");
    }
  }, [userInfo, setUserInfo, navigate]);

  // Fetch purchases
  const fetchPurchases = useCallback(async () => {
    if (!userInfo) return;
    try {
      const resp = await buyerPurchases({
        headers: { Authorization: userInfo.token },
        path: {
          buyerId: encodeURIComponent(
            decodeURIComponent(userInfo.emailAddress)
          ),
        },
      });
      if (resp.data) {
        setPurchases(resp.data.payload);
      } else if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
        navigate("/");
      } else {
        notifyError("Failed to fetch purchases");
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
      notifyError("Error fetching purchases");
    }
  }, [userInfo, setUserInfo, navigate]);

  // Wrap fetchFunds in useCallback
  const fetchFunds = useCallback(async () => {
    if (!userInfo) return;
    try {
      const response = await fetch(
        "https://1j7ezifj2f.execute-api.us-east-1.amazonaws.com/api/profile/fund",
        {
          method: "GET",
          headers: {
            Authorization: `${userInfo?.token}`, // Assuming userInfo contains a token for authentication
          },
        }
      );
      const data = await response.json();
      setFunds(data.payload?.fund || 0);
    } catch (error) {
      console.error("Error fetching funds:", error);
    }
  }, [userInfo]);

  useEffect(() => {
    
    fetchFunds();
    if (!userInfo) {
      navigate("/", { state: { openLoginModal: true } });
    } else {
      setLoading(false);
      fetchActiveBids();
      fetchPurchases();
    }
  }, [userInfo, fetchFunds, navigate, fetchActiveBids, fetchPurchases]);

  // Handler for closing the account
  const handleCloseAccount = async () => {
    if (!userInfo) return;

    const confirmClose = window.confirm(
      "Are you sure you want to close your account? This action cannot be undone."
    );
    if (!confirmClose) return;

    try {
      const response = await buyerClose({
        headers: { Authorization: `${userInfo.token}` },
        path: { buyerId: userInfo.userId },
      });

      if (response.data) {
        notifySuccess("Account closed successfully.");
        setUserInfo(null);
        navigate("/", { replace: true });
      } else if (response.error && response.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
        navigate("/");
      } else {
        notifyError("Failed to close account");
      }
    } catch (error) {
      console.error("Error closing account:", error);
      notifyError("An error occurred while closing your account.");
    }
  };

  // Handler for adding funds
  const handleAddFunds = async (amount: number) => {
    if (!userInfo) return;

    try {
      const response = await buyerAddFunds({
        headers: { Authorization: userInfo.token },
        path: { buyerId: userInfo.userId },
        body: { amount },
      });

      if (response.data) {
        notifySuccess("Funds added successfully.");
        setShowAddFundsModal(false);
        fetchFunds(); // Fetch updated funds after adding
        // Optionally, update userInfo with new balance if available
        // For example:
        // setUserInfo({ ...userInfo, balance: response.data.newBalance });
      } else if (response.error && response.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
        navigate("/");
      } else {
        notifyError("Failed to add funds");
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      notifyError("An error occurred while adding funds.");
    }
  };

  // ActiveBidsModal Component
  const ActiveBidsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const columnDefs: any[] = [
      {
        headerName: "Item ID",
        field: "bidItemId",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Bid Amount",
        field: "bidAmount",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Bid Time",
        field: "bidTime",
        sortable: true,
        filter: true,
      },
    ];

    return (
      <div className="modal">
        <h2 className="text-xl font-semibold mb-4">Active Bids</h2>
        <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
          <AgGridReact
            rowData={activeBids}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
        <button
          onClick={onClose}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Close
        </button>
      </div>
    );
  };

  // PurchasesModal Component
  const PurchasesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const columnDefs: any[] = [
      {
        headerName: "Item Name",
        field: "itemName",
        sortable: true,
        filter: true,
      },
      { headerName: "Price", field: "price", sortable: true, filter: true },
      {
        headerName: "Sold Time",
        field: "soldTime",
        sortable: true,
        filter: true,
      },
      {
        headerName: "Fulfill Time",
        field: "fulfillTime",
        sortable: true,
        filter: true,
      },
    ];

    return (
      <div className="modal">
        <h2 className="text-xl font-semibold mb-4">Purchases</h2>
        <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
          <AgGridReact
            rowData={purchases}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
        <button
          onClick={onClose}
          className="mt-4 p-2 bg-blue-500 text-white rounded"
        >
          Close
        </button>
      </div>
    );
  };

  // AddFundsModal Component
  const AddFundsModal: React.FC<{ onClose: () => void; onAddFunds: (amount: number) => void }> = ({ onClose, onAddFunds }) => {
    const [amount, setAmount] = useState<number | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (amount === null || amount <= 0) {
        notifyError("Please enter a valid amount.");
        return;
      }
      onAddFunds(Number(amount)); // Ensure `amount` is a number before passing
      setAmount(null); // Clear the input field after successful submission

    };

    return (
      <div className="modal">
        <h2 className="text-xl font-semibold mb-4">Add Funds</h2>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-2">Amount to Add:</label>
          <input
            type="number"
            value={amount !== null ? amount : ''}
            onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : null)}
            className="p-2 mb-4 border rounded text-black bg-white"
            pattern="[0-9]+([\.][0-9]+)?"
            required
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="p-2 bg-green-500 text-white rounded"
            >
              Add Funds
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
        {userInfo && (
          <div className="flex items-center gap-4">
            <p className="text-lg font-bold">Welcome, {userInfo.username}</p>
            <Button
              className="p-2 bg-green-500 text-white rounded"
            >
              Available Funds: ${funds}
            </Button>
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
            <Button
                  onClick={handleCloseAccount}
                  className="bg-red-600 text-white rounded"
                >
                  Close Account
                </Button>
          </div>
        )}
      </div>

      {/* Buttons to open modals */}
      <div className="mb-8 flex space-x-4">
        <button
          onClick={() => setShowActiveBidsModal(true)}
          className="p-2 bg-green-500 text-white rounded"
        >
          Review Active Bids
        </button>
        <button
          onClick={() => setShowPurchasesModal(true)}
          className="p-2 bg-yellow-500 text-white rounded"
        >
          Review Purchases
        </button>
        <button
          onClick={() => setShowAddFundsModal(true)}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Add Funds
        </button>
      </div>

      {/* Modals */}
      {showActiveBidsModal && (
        <ActiveBidsModal onClose={() => setShowActiveBidsModal(false)} />
      )}
      {showPurchasesModal && (
        <PurchasesModal onClose={() => setShowPurchasesModal(false)} />
      )}
      {showAddFundsModal && (
        <AddFundsModal
          onClose={() => setShowAddFundsModal(false)}
          onAddFunds={handleAddFunds}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;
