import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  buyerBids,
  buyerPurchases,
  buyerClose,
  buyerAddFunds,
  Bid,
  Purchase,
  userFund,
  itemDetail, // Import itemDetail from your api
} from "./api";
import { useAuth } from "./AuthContext";
import { notifyError, notifySuccess } from "./components/Notification";
import { Button } from "flowbite-react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import moment from "moment";

function reformatPurchase(p: Purchase): Purchase {
  let pnew = p;
  pnew.soldTime = moment(p.soldTime).toISOString(true);
  pnew.fulfillTime = moment(p.fulfillTime).toISOString(true);
  return pnew;
}

function reformatBid(b: Bid): Bid {
  let bnew = b;
  bnew.bidTime = moment(b.bidTime).toISOString(true);
  return bnew;
}

interface ItemDetail {
  id: string;
  name: string;
  description: string;
  initPrice: number;
  currentBidId?: string;
  lengthOfAuction?: number;
  isAvailableToBuy?: boolean;
  itemState?: string;
}

interface EnhancedBid extends Bid {
  itemName?: string;
  itemDescription?: string;
  itemInitPrice?: number;
  itemState?: string;
}

const BuyerDashboard: React.FC = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [activeBids, setActiveBids] = useState<EnhancedBid[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [funds, setFunds] = useState<number>(0);
  const [fundsOnHold, setFundsOnHold] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [showAddFundsModal, setShowAddFundsModal] = useState(false);

  // Fetch active bids and then fetch item details for each bid item
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
      if (resp.data) {
        let bids = resp.data.payload.map(reformatBid);

        // Fetch item details for each bid
        const detailedBids = await Promise.all(
          bids.map(async (b) => {
            try {
              const detailResp = await itemDetail({
                path: { itemId: b.bidItemId },
              });
              if (detailResp.data && detailResp.data.payload) {
                const item = detailResp.data.payload as ItemDetail;
                return {
                  ...b,
                  itemName: item.name,
                  itemDescription: item.description,
                  itemInitPrice: item.initPrice,
                  itemState: item.itemState,
                };
              }
            } catch (error) {
              console.error("Error fetching item detail:", error);
            }
            // If no details found, return bid as is
            return b;
          })
        );

        setActiveBids(detailedBids);
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
        setPurchases(resp.data.payload.map(reformatPurchase));
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

  const fetchFunds = useCallback(async () => {
    if (!userInfo) return;
    const response = await userFund({
      headers: {
        Authorization: `${userInfo.token}`,
      },
    });
    if (response.error) {
      notifyError(`Error fetching funds: ${response.error.message}`);
    } else {
      setFunds(response.data.payload.fund || 0);
      setFundsOnHold(response.data.payload.fundsOnHold || 0);
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
        fetchFunds();
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

  const [amount, setAmount] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === null || amount <= 0) {
      notifyError("Please enter a valid amount.");
      return;
    }
    await handleAddFunds(Number(amount));
    setAmount(null);
  };

  if (loading) return <div>Loading...</div>;

  // Add columns for item details
  const activeBidsColumnDefs: any[] = [
    { headerName: "Item ID", field: "bidItemId", sortable: true, filter: true },
    {
      headerName: "Bid Amount",
      field: "bidAmount",
      sortable: true,
      filter: true,
    },
    { headerName: "Bid Time", field: "bidTime", sortable: true, filter: true },
    {
      headerName: "Item Name",
      field: "itemName",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Description",
      field: "itemDescription",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Initial Price",
      field: "itemInitPrice",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Item State",
      field: "itemState",
      sortable: true,
      filter: true,
    },
  ];

  const purchasesColumnDefs: any[] = [
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
    <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
        {userInfo && (
          <div className="flex items-center gap-4">
            <p className="text-lg font-bold">Welcome, {userInfo.username}</p>
            <Button className="p-2 bg-green-500 text-white rounded">
              Available Funds: ${funds}
            </Button>
            <Button className="p-2 bg-yellow-500 text-white rounded">
              Available Funds on Hold: ${fundsOnHold}
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
      <div style={{ float: "right" }} className="m">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex items-center">
        <input
          type="number"
          value={amount !== null ? amount : ""}
          onChange={(e) =>
            setAmount(e.target.value ? parseFloat(e.target.value) : null)
          }
          className="p-2 border rounded-l text-black bg-white"
          placeholder="Enter amount"
          pattern="[0-9]+([\\.][0-9]+)?"
          required
        />
        <button
          type="submit"
          className="p-2 bg-green-500 text-white rounded-r"
        >
          Add Funds
        </button>
          </div>
        </form>
      </div>
      {/* Active Bids Table */}
      <div className="mb-8 mt-10">
        <h2 className="text-xl font-semibold mb-4">Active Bids</h2>
        <div className="ag-theme-alpine" style={{ width: "100%" }}>
          <AgGridReact
            rowData={activeBids}
            columnDefs={activeBidsColumnDefs}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Purchases</h2>
        <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
          <AgGridReact
            rowData={purchases}
            columnDefs={purchasesColumnDefs}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
