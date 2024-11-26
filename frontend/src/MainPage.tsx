"use client"

import { useEffect, useState } from "react";
import { Bid, buyerBidsPlace, ErrorResponsePayload, Item, itemBids, itemGetActive } from "./api";
import { Button, Card, FlowbiteTextInputColors, Modal, TextInput } from "flowbite-react";
import { notifyError, notifySuccess } from "./components/Notification";
import { useAuth } from "./AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import { DynamicStringEnumKeysOf } from "flowbite-react/dist/types/types";

function BidField(props: {
  itemId: string,
  bidAmount: number | undefined,
  currentPrice: number,
  setBidAmount: (v: number | undefined) => void,
  setRefresh: (v: boolean) => void,
}) {
  const { userInfo } = useAuth();
  const [color, setColor] = useState<DynamicStringEnumKeysOf<FlowbiteTextInputColors> | undefined>(undefined);
  return userInfo && (
    <div className="flex flex-row justify-between space-x-5 items-start">
      <div className=" flex flex-col">
        <TextInput
          type="number"
          placeholder="Amount"
          value={props.bidAmount}
          color={color}
          helperText={color === "failure" && "Bid amount must > current price."}
          onChange={(ev) => {
            if (ev.target.value === "") {
              props.setBidAmount(undefined);
            } else {
              props.setBidAmount(parseFloat(ev.target.value));
            }
          }}
        />
      </div>
      <Button color="info" onClick={() => {
        if (props.bidAmount && props.bidAmount > props.currentPrice) {
          if (color) {
            setColor(undefined);
          }
          buyerBidsPlace({
            path: { buyerId: userInfo.userId },
            body: {
              itemId: props.itemId,
              bidAmount: props.bidAmount,
            },
          }).then(_ => {
            notifySuccess("Bid success!");
            props.setRefresh(true);
          }).catch((err: ErrorResponsePayload) => notifyError(`Failed to bid item: ${err.message}`));
        } else {
          setColor("failure");
          notifyError("Bid Failed!");
        }
      }}>Bid!</Button>
    </div >
  );
}

function ItemCard(
  { item }: { item: Item }
) {
  const [show, setShow] = useState(false);
  const [_bids, setBids] = useState<Bid[]>([]);
  const [currentPrice, setCurrentPrice] = useState(item.initPrice);
  const [refresh, setRefresh] = useState(false);
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
      itemBids({ path: { itemId: item.id } }).then(resp => {
        if (resp.data) {
          setBids(resp.data.payload);
          if (item.currentBidId) {
            const bid = resp.data.payload.find(b => b.id === item.currentBidId);
            if (bid) {
              setCurrentPrice(bid.bidAmount);
            }
          }
        } else {
          notifyError(`Failed to get bids for item with status ${resp.error.status}: ${resp.error.message}`);
        }
      });
      setRefresh(false);
    }
  }, [refresh]);

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
        className="transition-all ease-in-out hover:scale-110"
        imgAlt={`IMG:${item.name}`}
        imgSrc={"https://flowbite.com/docs/images/carousel/carousel-1.svg"}
        onClick={() => setShow(true)}
      >
        <p className="text-xl font-bold tracking-tight text-gray-900">
          {item.name}
        </p>
        <p className="font-normal text-gray-700">
          Current: ${currentPrice}
        </p>
      </Card>
      <Modal show={show} onClose={() => setShow(false)}>
        <Modal.Header>Item Details</Modal.Header>
        <Modal.Body>
          <div className="flex flex-col space-y-5">
            <div className="flex flex-row space-x-10">
              <img className="max-h-40 self-center" src="https://flowbite.com/docs/images/carousel/carousel-1.svg" alt="..." />
              <div className="flex flex-col space-y-3">
                <p className="text-2xl font-bold text-gray-900">{item.name}</p>
                <div>
                  <p className="text-xl font-bold text-gray-900">Description</p>
                  <p className="text-gray-500">{item.description}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">Current: ${currentPrice}</p>
                <p className="text-xl font-bold text-gray-900">
                  Ending in: {days} days {hours} hr {minutes} mins
                </p>
                <BidField
                  itemId={item.id}
                  bidAmount={bidAmount}
                  currentPrice={currentPrice}
                  setBidAmount={setBidAmount}
                  setRefresh={setRefresh} />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setRefresh(true)}>
            Refresh
          </Button>
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
      <Button color="blue" onClick={() => setIsLoginOpen(true)}>Login</Button>
      <Button color="blue" onClick={() => setIsSignupOpen(true)}>Sign Up</Button>
    </>
  );

  useEffect(() => {
    if (refresh) {
      itemGetActive().then(resp => {
        if (resp.data) {
          setItems(resp.data.payload);
        } else {
          notifyError(`Get active items failed with status ${resp.error.status}: ${resp.error.message}`);
        }
      });
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (location.state?.openLoginModal && !handledLoginModal) {
      setIsLoginOpen(true);
      setHandledLoginModal(true);  // Prevent reopening on refresh
    }
  }, [location.state, handledLoginModal]);

  return (
    <>
      <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl text-white font-bold">Auction House</h1>
          <div className="flex gap-5">
            {userInfo !== null
              ? (
                <>
                  <p className="text-lg text-white font-bold self-center">Welcome, {userInfo.username}</p>
                  <Button
                    color="blue"
                    onClick={() => {
                      if (userInfo.userType === "seller") {
                        navigate("/seller-dashboard");
                      } else {
                        navigate("/buyer-dashboard");
                      }
                    }}>Dashboard
                  </Button>
                  <Button color="red" onClick={() => setUserInfo(null)}>Logout</Button>
                </>
              ) : <LoginButtons />}
          </div>
        </div>
        <div className="bg-white p-6 shadow-xl ring-1 mx-auto my-auto rounded-lg text-black space-y-10">
          <div className="flex items-center justify-between">
            <p className="font-bold text-xl">Items</p>
            <Button onClick={() => setRefresh(true)}>Refresh</Button>
          </div>
          <div className="grid grid-cols-5 gap-10 justify-between items-center">
            {items.length > 0
              ? items.map((item, idx) => (
                <ItemCard
                  key={`item-${idx}`}
                  item={item}
                />
              ))
              : (<div></div>)
            }
          </div>
        </div>
      </div>
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      {isSignupOpen && <SignupModal onClose={() => setIsSignupOpen(false)} />}
    </>
  );
}
