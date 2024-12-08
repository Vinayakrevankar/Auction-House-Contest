"use client";

import { useEffect, useState } from "react";
import {
  buyerBidsPlace,
  Item,
  itemBids,
  itemCheckExpired,
  itemGetActive,
  buyerClose,
  sellerClose,
  // Bid,
} from "./api"; //Bid,
import {
  Button,
  Card,
  FlowbiteTextInputColors,
  Modal,
  TextInput,
} from "flowbite-react";
import { notifyError, notifySuccess } from "./components/Notification";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import { DynamicStringEnumKeysOf } from "flowbite-react/dist/types/types";

function BidField(props: {
  itemId: string;
  bidAmount: number | undefined;
  currentPrice: number;
  itemIsAvailableToBuy: boolean;
  setBidAmount: (v: number | undefined) => void;
  setRefresh: (v: boolean) => void;
}) {
  const [itemIsAvailableToBuy, setIsAvailableToBuy] = useState(props.itemIsAvailableToBuy);
  const { userInfo } = useAuth();
  const [color, setColor] = useState<
    DynamicStringEnumKeysOf<FlowbiteTextInputColors> | undefined
  >(undefined);

  return (
    userInfo && (
      <div className="flex flex-row justify-between space-x-5 items-start">
        
        {itemIsAvailableToBuy ? (
          <Button
            color="success"
            onClick={() => {
              buyerBidsPlace({
                path: { buyerId: userInfo.userId },
                headers: { Authorization: userInfo.token },
                body: {
                  itemId: props.itemId,
                  bidAmount: props.currentPrice, // Assume buy now uses the current price.
                  isAvailableToBuy: itemIsAvailableToBuy,
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
          <><div className="flex flex-col">
              <TextInput
                type="number"
                placeholder="Amount"
                value={props.bidAmount}
                color={color}
                helperText={color === "failure" && "Bid amount must be greater than the current price."}
                onChange={(ev) => {
                  if (ev.target.value === "") {
                    props.setBidAmount(undefined);
                  } else {
                    props.setBidAmount(parseFloat(ev.target.value));
                  }
                } } />
            </div>
            <Button
              color="info"
              onClick={() => {
                if (props.bidAmount && props.bidAmount > props.currentPrice) {
                  if (color) {
                    setColor(undefined);
                  }
                  buyerBidsPlace({
                    path: { buyerId: userInfo.userId },
                    headers: { Authorization: userInfo.token },
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
                  notifyError("Bid Failed! Please bid higher than the current price.");
                }
              } }
            >
                Bid!
              </Button></>
        )}
      </div>
    )
  );
}

function ItemCard({ item }: { item: Item }) {
  const [show, setShow] = useState(false);
  // const [_bids, setBids] = useState<Bid[]>([]);
  const [currentPrice, setCurrentPrice] = useState(item.initPrice);
  const [itemIsAvailableToBuy, setIsAvailableToBuy] = useState(item.isAvailableToBuy);
  const [refresh, setRefresh] = useState(true);
  const [end, setEnd] = useState(Date.parse(item.endDate) - Date.now());
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [bidAmount, setBidAmount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (show) setRefresh(true);
  }, [show]);

  useEffect(() => {
    if (refresh) {
      const fetchData = async () => {
        const resp = await itemBids({ path: { itemId: item.id } });
        if (!resp.data) {
          notifyError(
            `Failed to get bids for item with status ${resp.error.status}: ${resp.error.message}`
          );
          return;
        }
        if (item.currentBidId) {
          const bid = resp.data.payload.find((b) => b.id === item.currentBidId);
          if (bid) {
            setCurrentPrice(bid.bidAmount);
          }
        }
      };
      fetchData();
      setRefresh(false);
    }
  }, [refresh, item.currentBidId, item.id]);

  useEffect(() => {
    const interval = setInterval(() => setEnd(end - 1000), 1000);
    setDays(Math.floor(end / (1000 * 60 * 60 * 24)));
    setHours(Math.floor((end / (1000 * 60 * 60)) % 24));
    setMinutes(Math.floor((end / 1000 / 60) % 60));
    return () => clearInterval(interval);
  }, [end]);

  return (
    <>
      <Card
        className="max-w-full max-h-80 object-cover self-center transition-all ease-in-out hover:scale-110"
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
        <p className="font-normal text-gray-700">Current: ${currentPrice}</p>
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
                  Current: ${currentPrice}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  Ending in: {days} days {hours} hr {minutes} mins
                </p>
                <BidField
                  itemId={item.id}
                  bidAmount={bidAmount}
                  currentPrice={currentPrice}
                  setBidAmount={setBidAmount}
                  setRefresh={setRefresh}
                  itemIsAvailableToBuy={itemIsAvailableToBuy ?? false}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setRefresh(true)}>Refresh</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export function MainPage() {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [refresh, setRefresh] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const location = useLocation();
  const [handledLoginModal, setHandledLoginModal] = useState(false);

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

  const handleSellerCloseAccount = async () => {
    if (!userInfo) return;

    // Confirm with the user
    const confirmClose = window.confirm(
      "Are you sure you want to close your account? This action cannot be undone."
    );
    if (!confirmClose) return;

    try {
      // Call the buyerClose API function
      const response = await sellerClose({
        headers: { Authorization: userInfo.token },
        path: { sellerId: userInfo.userId },
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
        const ps = resp.data.payload.map(async (item) => {
          const resp = await itemCheckExpired({ path: { itemId: item.id } });
          return { item: item, resp: resp };
        });
        const result = await Promise.all(ps);
        const new_items = result
          .filter(({ item, resp }) => {
            if (resp.error) {
              notifyError(
                `Failed to check expired status for ${item.id}: ${resp.error.message}`
              );
              return false;
            } else if (resp.data.payload.isExpired) {
              return false;
            } else {
              return true;
            }
          })
          .map(({ item }) => item);
        setItems(new_items);
      };
      fetchData();
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (location.state?.openLoginModal && !handledLoginModal) {
      setIsLoginOpen(true);
      setHandledLoginModal(true); // Prevent reopening on refresh
    }
  }, [location.state, handledLoginModal]);

  return (
    <>
      <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-white font-bold">
            Auction House {userInfo && `- ${userInfo?.userType.toUpperCase()}`}
          </h1>
          <div className="flex gap-5">
            {userInfo !== null ? (
              <>
                <p className="text-lg text-white font-bold self-center">
                  Welcome, {userInfo.username}
                </p>
                <Button
                  color="blue"
                  onClick={() => {
                    if (userInfo.userType === "seller") {
                      navigate("/seller-dashboard");
                    } else {
                      navigate("/buyer-dashboard");
                    }
                  }}
                >
                  Dashboard
                </Button>
                <Button color="red" onClick={() => setUserInfo(null)}>
                  Logout
                </Button>
                <Button
                  onClick={
                    userInfo.userType === "seller"
                      ? handleSellerCloseAccount
                      : handleCloseAccount
                  }
                  className="bg-red-600 text-white rounded"
                >
                  Close Account
                </Button>
              </>
            ) : (
              <LoginButtons />
            )}
          </div>
        </div>
        <div className="bg-white p-6 shadow-xl ring-1 mx-auto my-auto rounded-lg text-black space-y-10">
          <div className="flex items-center justify-between">
            <p className="font-bold text-xl">Items</p>
            <Button onClick={() => setRefresh(true)}>Refresh</Button>
          </div>
          <div className="grid grid-cols-5 gap-10 justify-between items-center">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <ItemCard key={`item-${idx}`} item={item} />
              ))
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      {isSignupOpen && <SignupModal onClose={() => setIsSignupOpen(false)} />}
    </>
  );
}
