import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "flowbite-react";
import { itemBids } from "./../api"; // API to fetch item bids
import { notifyError } from "./Notification";

interface Bid {
  id: string;
  bidderName: string;
  bidAmount: number;
  bidTime: string;
}

interface BidModalProps {
  show: boolean;
  onClose: () => void;
  itemId: string | null;
}

const BidModal: React.FC<BidModalProps> = ({ show, onClose, itemId }) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      if (!itemId) return;
      setLoading(true);
      try {
        const response = await itemBids({ path: { itemId } });
        if (response.data) {
          setBids(
            (response.data.payload || []).map((bid: any) => ({
              id: bid.id,
              bidderName: bid.bidderName,
              bidAmount: bid.bidAmount,
              bidTime: bid.bidTime,
            }))
          );
        } else {
          notifyError("Failed to fetch bids.");
        }
      } catch (error) {
        console.error("Error fetching bids:", error);
        notifyError("Error fetching bids.");
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchBids();
    }
  }, [show, itemId]);

  return (
    <Modal show={show} onClose={onClose}>
      <Modal.Header>Item Bids</Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Loading...</p>
        ) : bids.length > 0 ? (
          <Table>
            <Table.Head>
              <Table.HeadCell>Bidder Id</Table.HeadCell>
              <Table.HeadCell>Bid Amount</Table.HeadCell>
              <Table.HeadCell>Bid Time</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {bids.map((bid) => (
                <Table.Row key={bid.id}>
                  <Table.Cell>{bid.id}</Table.Cell>
                  <Table.Cell>${bid.bidAmount.toFixed(2)}</Table.Cell>
                  <Table.Cell>{new Date(bid.bidTime).toLocaleString()}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <p>No bids available for this item.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BidModal;
