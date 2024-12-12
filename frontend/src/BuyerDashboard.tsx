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
  itemDetail,
  itemRecentlySold,
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
  sellerId?: string;
  startDate?: string;
  endDate?: string;
  soldBidId?: string;
  images?: string[];
  pastBidIds?: string[];
}

interface EnhancedBid extends Bid {
  itemName?: string;
  itemDescription?: string;
  itemInitPrice?: number;
  itemState?: string;
}

type EnhancedPurchase = Purchase & {
  itemName?: string;
  itemDescription?: string;
  itemInitPrice?: number;
  itemState?: string;
};


const BuyerDashboard: React.FC = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [activeBids, setActiveBids] = useState<EnhancedBid[]>([]);
  const [purchases, setPurchases] = useState<EnhancedPurchase[]>([]);
  const [funds, setFunds] = useState<number>(0);
  const [fundsOnHold, setFundsOnHold] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [recentlySoldItems, setRecentlySoldItems] = useState<ItemDetail[]>([]);
  const [amount, setAmount] = useState<number | null>(null);

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

  // Fetch purchases and then fetch item details for each purchased item
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
        const rawPurchases = resp.data.payload.map(reformatPurchase);

        // Fetch item details for each purchased item
        const detailedPurchases = await Promise.all(
          rawPurchases.map(async (p) => {
            try {
              const detailResp = await itemDetail({
                path: { itemId: p.itemId },
              });
              if (detailResp.data && detailResp.data.payload) {
                const item = detailResp.data.payload as ItemDetail;
                return {
                  ...p,
                  itemName: item.name,
                  itemDescription: item.description,
                  itemInitPrice: item.initPrice,
                  itemState: item.itemState,
                };
              }
            } catch (error) {
              console.error("Error fetching purchase item detail:", error);
            }
            return p;
          })
        );

        setPurchases(detailedPurchases);
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

  // Fetch recently sold items
  const fetchRecentlySoldItems = useCallback(async () => {
    if (!userInfo) return;
    try {
      const resp = await itemRecentlySold({
        headers: { Authorization: userInfo.token },
      });

      if (resp.data && resp.data.payload) {
        // Filter items from the past 24 hours
        const now = new Date();
        const past24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const filteredItems = resp.data.payload.filter(
          (item: any) => new Date(item.endDate) >= past24Hours
        );
        setRecentlySoldItems(filteredItems);
      } else if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
        navigate("/");
      } else {
        notifyError("Failed to fetch recently sold items");
      }
    } catch (err) {
      console.error("Error fetching recently sold items:", err);
      notifyError("Error fetching recently sold items");
    }
  }, [userInfo, setUserInfo, navigate]);

  useEffect(() => {
    fetchRecentlySoldItems();
  }, [fetchRecentlySoldItems]);

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
    { headerName: "Bid Amount", field: "bidAmount", sortable: true, filter: true },
    { headerName: "Bid Time", field: "bidTime", sortable: true, filter: true },
    { headerName: "Item Name", field: "itemName", sortable: true, filter: true },
    { headerName: "Description", field: "itemDescription", sortable: true, filter: true },
    { headerName: "Initial Price", field: "itemInitPrice", sortable: true, filter: true },
    { headerName: "Item State", field: "itemState", sortable: true, filter: true },
  ];

  const purchasesColumnDefs: any[] = [
    { headerName: "Item Name", field: "itemName", sortable: true, filter: true },
    { headerName: "Price", field: "price", sortable: true, filter: true },
    { headerName: "Sold Time", field: "soldTime", sortable: true, filter: true },
    { headerName: "Fulfill Time", field: "fulfillTime", sortable: true, filter: true },
    // Newly added columns
    { headerName: "Description", field: "itemDescription", sortable: true, filter: true },
    { headerName: "Initial Price", field: "itemInitPrice", sortable: true, filter: true },
    { headerName: "Item State", field: "itemState", sortable: true, filter: true },
  ];

  const recentlySoldItemsColumnDefs: any[] = [
    { headerName: "ID", field: "id", sortable: true, filter: true },
    { headerName: "Item Name", field: "name", sortable: true, filter: true },
    { headerName: "Initial Price", field: "initPrice", sortable: true, filter: true },
    { headerName: "Sold Time", field: "endDate", sortable: true, filter: true },
    { headerName: "Description", field: "description", sortable: true, filter: true },
    { headerName: "Item State", field: "itemState", sortable: true, filter: true },
    { headerName: "Seller ID", field: "sellerId", sortable: true, filter: true },
    { headerName: "Start Date", field: "startDate", sortable: true, filter: true },
    { headerName: "Sold Bid ID", field: "soldBidId", sortable: true, filter: true },
    {
      headerName: "Images",
      field: "images",
      cellRenderer: (params: any) =>
        params.value && Array.isArray(params.value)
          ? params.value.join(", ")
          : "No images",
      sortable: false,
      filter: false,
    },
    {
      headerName: "Bidding History",
      field: "pastBidIds",
      cellRenderer: (params: any) =>
        params.value && Array.isArray(params.value)
          ? params.value.join(", ")
          : "No bids",
      sortable: false,
      filter: false,
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
        <div className="ag-theme-alpine" style={{ width: "100%" }}>
          <AgGridReact
            rowData={purchases}
            columnDefs={purchasesColumnDefs}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
          />
        </div>
      </div>

      {/* Recently Sold Items Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recently Sold Items</h2>
        <div className="ag-theme-alpine" style={{ width: "100%" }}>
          <AgGridReact
            rowData={recentlySoldItems}
            columnDefs={recentlySoldItemsColumnDefs}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
          />
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
