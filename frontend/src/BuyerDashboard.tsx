import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { buyerBids, buyerPurchases, buyerClose, Bid, Purchase } from "./api";
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
  const [loading, setLoading] = useState(true);

  const [showActiveBidsModal, setShowActiveBidsModal] = useState(false);
  const [showPurchasesModal, setShowPurchasesModal] = useState(false);

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

  useEffect(() => {
    if (!userInfo) {
      navigate("/", { state: { openLoginModal: true } });
    } else {
      setLoading(false);
      fetchActiveBids();
      fetchPurchases();
    }
  }, [userInfo, navigate, fetchActiveBids, fetchPurchases]);

  // Handler for closing the account
  const handleCloseAccount = async () => {
    if (!userInfo) return;

    // Confirm with the user
    const confirmClose = window.confirm(
      "Are you sure you want to close your account? This action cannot be undone."
    );
    if (!confirmClose) return;

    try {
      // Call the buyerClose API function
      const response = await buyerClose({
        headers: { Authorization: userInfo.token },
        path: { buyerId: userInfo.userId },
      });

      if (response.error) {
        notifyError(response.error.message || "Failed to close account.");
      } else {
        notifySuccess("Account closed successfully.");
        setUserInfo(null);
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Error closing account:", error);
      notifyError("An error occurred while closing your account.");
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
      <div className="mb-8">
        <button
          onClick={() => setShowActiveBidsModal(true)}
          className="mr-4 p-2 bg-green-500 text-white rounded"
        >
          Review Active Bids
        </button>
        <button
          onClick={() => setShowPurchasesModal(true)}
          className="p-2 bg-yellow-500 text-white rounded"
        >
          Review Purchases
        </button>
      </div>

      {/* Modals */}
      {showActiveBidsModal && (
        <ActiveBidsModal onClose={() => setShowActiveBidsModal(false)} />
      )}
      {showPurchasesModal && (
        <PurchasesModal onClose={() => setShowPurchasesModal(false)} />
      )}
    </div>
  );
};

export default BuyerDashboard;
