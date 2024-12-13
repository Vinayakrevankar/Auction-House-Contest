"use client";

import { useEffect, useState, useMemo } from "react";
import {
  buyerBidsPlace,
  itemBids,
  itemCheckExpired,
  itemGetActive,
  buyerClose,
  sellerClose,
  adminFreezeItem,
  Item,
  Bid,
} from "./api";
import {
  Button,
  Card,
  FlowbiteTextInputColors,
  Modal,
  TextInput,
  Label,
  Select,
} from "flowbite-react";
import { notifyError, notifySuccess } from "./components/Notification";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import { DynamicStringEnumKeysOf } from "flowbite-react/dist/types/types";

interface ItemWithCurrentBid extends Item {
  currentBidPrice: number;
  isAvailableToBuy?: boolean;
}

function BidField(props: {
  itemId: string;
  bidAmount: number | undefined;
  currentPrice: number;
  itemIsAvailableToBuy: boolean;
  setBidAmount: (v: number | undefined) => void;
  setRefresh: (v: boolean) => void;
}) {
  const { userInfo } = useAuth();
  const [color, setColor] = useState<
    DynamicStringEnumKeysOf<FlowbiteTextInputColors> | undefined
  >(undefined);

  return (
    userInfo && (
      <div className="flex flex-row justify-between space-x-5 items-start">
        {props.itemIsAvailableToBuy ? (
          <Button
            color="success"
            onClick={() => {
              buyerBidsPlace({
                path: { buyerId: (userInfo as any).userId },
                headers: { Authorization: (userInfo as any).token },
                body: {
                  itemId: props.itemId,
                  bidAmount: props.currentPrice,
                  isAvailableToBuy: true,
                },
              }).then((resp) => {
                if (resp.data) {
                  notifySuccess("Item purchased successfully!");
                  props.setRefresh(true);
                } else {
                  notifyError(`Failed to purchase item: ${resp.error.message}`);
                }
              });
            }}
          >
            Buy Now
          </Button>
        ) : (
          <>
            <div className="flex flex-col">
              <TextInput
                type="number"
                placeholder="Amount"
                value={props.bidAmount}
                color={color}
                helperText={
                  color === "failure" &&
                  "Bid amount must be greater than the current price."
                }
                onChange={(ev) => {
                  if (ev.target.value === "") {
                    props.setBidAmount(undefined);
                  } else {
                    props.setBidAmount(parseFloat(ev.target.value));
                  }
                }}
              />
            </div>
            <Button
              color="info"
              onClick={() => {
                if (props.bidAmount && props.bidAmount > props.currentPrice) {
                  if (color) {
                    setColor(undefined);
                  }
                  buyerBidsPlace({
                    path: { buyerId: (userInfo as any).userId },
                    headers: { Authorization: (userInfo as any).token },
                    body: {
                      itemId: props.itemId,
                      bidAmount: props.bidAmount,
                    },
                  }).then((resp) => {
                    if (resp.data) {
                      notifySuccess("Bid success!");
                      props.setRefresh(true);
                    } else {
                      notifyError(`Failed to bid item: ${resp.error.message}`);
                    }
                  });
                } else {
                  setColor("failure");
                  notifyError(
                    "Bid Failed! Please bid higher than the current price."
                  );
                }
              }}
            >
              Bid!
            </Button>
          </>
        )}
      </div>
    )
  );
}

function ItemCard({ item }: { item: ItemWithCurrentBid }) {
  const { userInfo } = useAuth();
  const [show, setShow] = useState(false);
  const [bidAmount, setBidAmount] = useState<number | undefined>(undefined);
  const [end, setEnd] = useState(Date.parse(item.endDate) - Date.now());
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const handleFreezeItem = async (id: string, action: "freeze" | "unfreeze") => {
    if (!userInfo) return;

    const confirmClose = window.confirm(
      "Are you sure you want to freeze this item? This action cannot be undone."
    );
    if (!confirmClose) return;

    try {
      const response = await adminFreezeItem({
        headers: { Authorization: (userInfo as any).token },
        path: { itemId: item.id },
        body: { action },
      });

      if (response.error) {
        notifyError(
          response.error.message || "An error occurred while freezing the item."
        );
      } else {
        notifySuccess(`Item is successfully ${action}.`);
      }
    } catch (error) {
      console.error("Error freezing item:", error);
      notifyError("Error: An error occurred while freezing the item.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setEnd((prev) => prev - 1000), 1000);
    setDays(Math.floor(end / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((end / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((end / (1000 * 60)) % 60));
    return () => clearInterval(interval);
  }, [end]);
  return (
    <>
      <Card
        className="max-w-full max-h-80 object-cover self-center transition-all ease-in-out hover:scale-110 cursor-pointer"
        onClick={() => setShow(true)}
      >
        <img
          className="max-w-full max-h-40 object-cover self-center"
          src={`https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/${item.images[0]}`}
          alt={`IMG:${item.name}`}
        />
        <p className="text-xl font-bold tracking-tight text-gray-900">
          {item.name}
        </p>
        <p className="font-normal text-gray-700">
          Current: ${item.currentBidPrice}
        </p>
      </Card>
      <Modal show={show} onClose={() => setShow(false)}>
        <Modal.Header>Item Details</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col space-y-5">
            <div className="flex flex-row space-x-10">
              <img
                className="max-h-40 self-center"
                src={`https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/${item.images[0]}`}
                alt="..."
              />
              <div className="flex flex-col space-y-3">
                <p className="text-2xl font-bold text-gray-900">{item.name}</p>
                <div>
                  <p className="text-xl font-bold text-gray-900">Description</p>
                  <p className="text-gray-500">{item.description}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  Current: ${item.currentBidPrice}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  Ending in: {days} days {hours} hr {minutes} mins
                </p>
                {userInfo ? (
                  userInfo.role !== "admin" ? (
                  <BidField
                    itemId={item.id}
                    bidAmount={bidAmount}
                    currentPrice={item.currentBidPrice}
                    setBidAmount={setBidAmount}
                    setRefresh={(v) => {}}
                    itemIsAvailableToBuy={item.isAvailableToBuy ?? false}
                  />
                  ) : item.isFrozen ? (<p style={{ color: "red" }}>Item is Frozen.</p>) : (
                  <button
                    onClick={() => handleFreezeItem(item.id, "freeze")}
                    className="p-2 bg-red-500 text-white rounded"
                  >
                    Freeze Item
                  </button>
                  )
                ) : <p style={{ color: "red" }}>
                Please login to bid on this item.
              </p>}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export function MainPage() {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemWithCurrentBid[]>([]);
  const [refresh, setRefresh] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [handledLoginModal, setHandledLoginModal] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("none");
  const location = useLocation();

  const LoginButtons = () => (
    <>
      <Button color="blue" onClick={() => setIsLoginOpen(true)}>
        Login
      </Button>
      <Button color="blue" onClick={() => setIsSignupOpen(true)}>
        Sign Up
      </Button>
    </>
  );

  const handleCloseAccount = async () => {
    if (!userInfo) return;
    const confirmClose = window.confirm(
      "Are you sure you want to close your account? This action cannot be undone."
    );
    if (!confirmClose) return;
    try {
      const response = await buyerClose({
        headers: { Authorization: (userInfo as any).token },
        path: { buyerId: (userInfo as any).userId },
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

  const handleSellerCloseAccount = async () => {
    if (!userInfo) return;
    const confirmClose = window.confirm(
      "Are you sure you want to close your account? This action cannot be undone."
    );
    if (!confirmClose) return;
    try {
      const response = await sellerClose({
        headers: { Authorization: (userInfo as any).token },
        path: { sellerId: (userInfo as any).userId },
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

  useEffect(() => {
    if (refresh) {
      const fetchData = async () => {
        const resp = await itemGetActive();
        if (!resp.data) {
          notifyError(
            `Get active items failed with status ${resp.error.status}: ${resp.error.message}`
          );
          return;
        }
        const activeItems = resp.data.payload;
        const filteredItems = [];
        for (const item of activeItems) {
          const checkResp = await itemCheckExpired({
            path: { itemId: item.id },
          });
          if (!checkResp.error && !checkResp.data.payload.isExpired) {
            filteredItems.push(item);
          }
        }
        const itemsWithBids: ItemWithCurrentBid[] = [];
        for (const item of filteredItems) {
          let currentBidPrice = item.initPrice;
          if (item.currentBidId) {
            const bidsResp = await itemBids({ path: { itemId: item.id } });
            if (bidsResp.data) {
              const currentBid = (bidsResp.data.payload as Bid[]).find(
                (b) => b.id === item.currentBidId
              );
              if (currentBid) {
                currentBidPrice = currentBid.bidAmount;
              }
            }
          }
          itemsWithBids.push({
            ...item,
            currentBidPrice,
            isAvailableToBuy: item.isAvailableToBuy ?? false,
          });
        }
        setItems(itemsWithBids);
      };
      fetchData();
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (location.state?.openLoginModal && !handledLoginModal) {
      setIsLoginOpen(true);
      setHandledLoginModal(true);
    }
  }, [location.state, handledLoginModal]);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];
    if (searchQuery.trim().length > 0) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortOption === "price-asc") {
      filtered.sort((a, b) => a.currentBidPrice - b.currentBidPrice);
    } else if (sortOption === "price-desc") {
      filtered.sort((a, b) => b.currentBidPrice - a.currentBidPrice);
    } else if (sortOption === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "name-desc") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    return filtered;
  }, [items, searchQuery, sortOption]);

  return (
    <>
      <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-white font-bold">
            Auction House{" "}
            {userInfo &&
              `- ${(userInfo as any).role === "admin" ? "Admin" : (userInfo as any)?.userType.toUpperCase()}`}
          </h1>
          <div className="flex gap-5">
            {userInfo !== null ? (
              <>
                <p className="text-lg text-white font-bold self-center">
                  Welcome, {(userInfo as any).username}
                </p>
                <Button
                  color="blue"
                  onClick={() => {
                    if ((userInfo as any).role === "admin") {
                      navigate("/admin-dashboard");
                    } else if ((userInfo as any).userType === "seller") {
                      navigate("/seller-dashboard");
                    } else if ((userInfo as any).userType === "buyer") {
                      navigate("/buyer-dashboard");
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Button color="red" onClick={() => setUserInfo(null)}>
                  Logout
                </Button>
                {(userInfo as any).role !== "admin" && (
                  <Button
                    onClick={
                      (userInfo as any).userType === "seller"
                        ? handleSellerCloseAccount
                        : handleCloseAccount
                    }
                    className="bg-red-600 text-white rounded"
                  >
                    Close Account
                  </Button>
                )}
              </>
            ) : (
              <LoginButtons />
            )}
          </div>
        </div>
        <div className="bg-white p-6 shadow-xl ring-1 mx-auto my-auto rounded-lg text-black space-y-10">
          <div className="flex items-center justify-between">
            <p className="font-bold text-xl">Items</p>
            <div className="flex gap-4">
              <Button onClick={() => setIsSearchModalOpen(true)}>
                Search / Sort
              </Button>
              <Button onClick={() => setRefresh(true)}>Refresh</Button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-10 justify-between items-center">
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))
            ) : (
              <div>No items available.</div>
            )}
          </div>
        </div>
      </div>
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      {isSignupOpen && <SignupModal onClose={() => setIsSignupOpen(false)} />}

      <Modal
        show={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      >
        <Modal.Header>Search and Sort Items</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="searchQuery" value="Search by Item Name" />
              <TextInput
                id="searchQuery"
                type="text"
                placeholder="Enter search query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sortOption" value="Sort By" />
              <Select
                id="sortOption"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="none">None</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setIsSearchModalOpen(false)}>Apply</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
