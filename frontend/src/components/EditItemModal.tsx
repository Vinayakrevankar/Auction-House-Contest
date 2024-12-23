import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "flowbite-react";
import { ItemSimple } from "../models/ItemSimple";
import { itemCheckExpired, uploadImage } from "../api";
import { itemDetail } from "./../api";
import { la2ts, LengthOfAuction } from "../models/LeengthOfAuction";

interface EditItemModalProps {
  show: boolean;
  onClose: () => void;
  onUpdateItem: (item: ItemSimple) => void;
  itemToEdit: ItemSimple | null; // Allow null for no item selected
  onPublish: (id: string) => Promise<void>;
  onUnpublish: (id: string) => Promise<void>;
  onDelete: (id: string) => void;
  refreshItems: () => void;
  onRequestUnfreeze: (id: string) => void;
  onFulfill: (id: string) => void;
  onArchive: (id: string) => Promise<void>;
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  show,
  onClose,
  onUpdateItem,
  itemToEdit,
  onPublish,
  onUnpublish,
  onDelete,
  onFulfill,
  refreshItems,
  onArchive,
  onRequestUnfreeze,
}) => {
  const [editItemName, setEditItemName] = useState("");
  const [editItemDescription, setEditItemDescription] = useState("");
  const [editItemInitPrice, setEditItemInitPrice] = useState("");
  const [newIsAvailableToBuy, setIsAvailableToBuy] = useState(false);
  const [editItemLengthOfAuction, setEditItemLengthOfAuction] =
    useState<LengthOfAuction>({
      day: -1,
      hour: -1,
      min: -1,
      sec: -1,
    });

  const [buttonFulfill, setButtonFulfill] = useState(false);
  const [editItemImages, setEditItemImages] = useState<FileList | null>(null);
  const [currentItemState, setCurrentItemState] = useState<string | null>(null); // Track current item state

  const itemToEditRef = useRef<ItemSimple | null>(itemToEdit); // Using useRef to store the item

  useEffect(() => {
    itemToEditRef.current = itemToEdit; // Update the ref value whenever itemToEdit changes
  }, [itemToEdit]);

  useEffect(() => {
    const fetchData = async () => {
      if (itemToEditRef.current) {
        const resp = await itemDetail({ path: { itemId: itemToEditRef.current.id } }); // Get item details
        if (resp.data) {
          itemToEditRef.current = {
            ...resp.data.payload,
            isAvailableToBuy: resp.data.payload.isAvailableToBuy ?? false,
            currentBidId: resp.data.payload.currentBidId ?? "", // Ensure currentBidId is a string
          }; // Assign data to ref
        }
        if (itemToEditRef.current) {
          setEditItemName(itemToEditRef.current.name);
        }
        setEditItemDescription(itemToEditRef.current.description);
        setEditItemInitPrice(itemToEditRef.current.initPrice.toString());
        setIsAvailableToBuy(itemToEditRef.current.isAvailableToBuy);
        if (itemToEditRef.current) {
          setEditItemLengthOfAuction({
            day: Math.floor(itemToEditRef.current.lengthOfAuction / (24 * 60 * 60 * 1000)),
            hour: Math.floor(itemToEditRef.current.lengthOfAuction / (60 * 60 * 1000) % 24),
            min: Math.floor(itemToEditRef.current.lengthOfAuction / (60 * 1000) % 60),
            sec: Math.floor(itemToEditRef.current.lengthOfAuction / 1000 % 60),
          });
        }
        setEditItemImages(null);
        setCurrentItemState(itemToEditRef.current.itemState); // Update current item state
        const response = await itemCheckExpired({ path: { itemId: itemToEditRef.current.id } });
        if (response.data) {
          setButtonFulfill(response.data.payload.isExpired);
        } else {
          setButtonFulfill(false);
        }
      }
    };
    fetchData();
  }, [itemToEdit]);

  const handlePublishClick = async () => {
    if (itemToEditRef.current) {
      await onPublish(itemToEditRef.current.id);
      await refreshItems();
      setCurrentItemState("active"); // Update button state immediately
      setButtonFulfill(false);
    }
  };

  const handleUnpublishClick = async () => {
    if (itemToEditRef.current) {
      await onUnpublish(itemToEditRef.current.id);
      await refreshItems();
      setCurrentItemState("inactive"); // Update button state immediately
    }
  };

  const handleArchiveClick = async () => {
    if (itemToEditRef.current) {
      await onArchive(itemToEditRef.current.id);
      await refreshItems();
      setCurrentItemState("inactive"); // Update button state immediately
    }
  };

  const handleFulfillClick = async () => {
    if (itemToEditRef.current) {
      await onFulfill(itemToEditRef.current.id);
      await refreshItems();
      setCurrentItemState("archived"); // Update button state immediately
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemToEditRef.current) return;

    // Validation
    if (
      !editItemName.trim() ||
      !editItemDescription.trim() ||
      !editItemInitPrice.trim() ||
      (editItemLengthOfAuction.day === -1
        || editItemLengthOfAuction.hour === -1
        || editItemLengthOfAuction.min === -1
        || editItemLengthOfAuction.sec === -1)
    ) {
      return;
    }

    let images = itemToEditRef.current.images || [];

    if (editItemImages && editItemImages.length > 0) {
      const imageData = await Promise.all(
        Array.from(editItemImages).map(async (file) => {
          try {
            const reader = new FileReader();
            const data = await new Promise<ArrayBuffer>((resolve, reject) => {
              reader.onload = () => resolve(reader.result as ArrayBuffer);
              reader.onerror = () => reject(reader.error);
              reader.readAsArrayBuffer(file);
            });
            return data;
          } catch (error) {
            console.error(`Error reading file ${file.name}:`, error);
            return undefined;
          }
        })
      );

      const uploadedImages = await Promise.all(
        imageData
          .filter((data): data is ArrayBuffer => !!data)
          .map(async (data) => {
            try {
              const resp = await uploadImage({
                body: { image: new Blob([data]) },
              });
              return resp.data?.payload.key;
            } catch (error) {
              console.error("Image upload failed:", error);
              return undefined;
            }
          })
      );

      images = uploadedImages.filter((key): key is string => !!key);
    }

    const updatedItem: ItemSimple = {
      ...itemToEditRef.current,
      name: editItemName,
      description: editItemDescription,
      initPrice: parseFloat(editItemInitPrice),
      lengthOfAuction: la2ts(editItemLengthOfAuction),
      isAvailableToBuy: newIsAvailableToBuy,
      images,
    };

    onUpdateItem(updatedItem);

    // Reset form and close modal
    setEditItemName("");
    setEditItemDescription("");
    setEditItemInitPrice("");
    setEditItemLengthOfAuction({
      day: -1,
      hour: -1,
      min: -1,
      sec: -1,
    });
    setEditItemImages(null);
    onClose();
  };

  if (!itemToEditRef.current) return null;

  return (
    <Modal show={show} size="7xl" popup onClose={onClose}>
      <Modal.Header>
        <div className="ml-2 font-bold text-center text-gray-800">Edit Item</div>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name</label>
              <input
                type="text"
                disabled={currentItemState?.toLowerCase() !== "inactive"}
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Price ($)</label>
              <input
                type="number"
                value={editItemInitPrice}
                disabled={currentItemState?.toLowerCase() !== "inactive"}
                onChange={(e) => setEditItemInitPrice(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editItemDescription}
                disabled={currentItemState?.toLowerCase() !== "inactive"}
                onChange={(e) => setEditItemDescription(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300"
                rows={4}
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <input
                type="text"
                disabled={true}
                value={currentItemState?.toUpperCase() ?? ""}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Auction Length</label>
              <div className='flex flex-row space-x-3'>
                <input
                  type="number"
                  min="0"
                  disabled={currentItemState?.toLowerCase() !== "inactive"}
                  value={editItemLengthOfAuction.day === -1 ? '' : editItemLengthOfAuction.day}
                  onChange={(e) => setEditItemLengthOfAuction({
                    day: parseInt(e.target.value),
                    hour: editItemLengthOfAuction.hour,
                    min: editItemLengthOfAuction.min,
                    sec: editItemLengthOfAuction.sec,
                  })}
                  placeholder='Days'
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
                <input
                  type="number"
                  min="0"
                  max="23"
                  disabled={currentItemState?.toLowerCase() !== "inactive"}
                  value={editItemLengthOfAuction.hour === -1 ? '' : editItemLengthOfAuction.hour}
                  onChange={(e) => setEditItemLengthOfAuction({
                    day: editItemLengthOfAuction.day,
                    hour: parseInt(e.target.value),
                    min: editItemLengthOfAuction.min,
                    sec: editItemLengthOfAuction.sec,
                  })}
                  placeholder='H'
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  disabled={currentItemState?.toLowerCase() !== "inactive"}
                  value={editItemLengthOfAuction.min === -1 ? '' : editItemLengthOfAuction.min}
                  onChange={(e) => setEditItemLengthOfAuction({
                    day: editItemLengthOfAuction.day,
                    hour: editItemLengthOfAuction.hour,
                    min: parseInt(e.target.value),
                    sec: editItemLengthOfAuction.sec,
                  })}
                  placeholder='M'
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  disabled={currentItemState?.toLowerCase() !== "inactive"}
                  value={editItemLengthOfAuction.sec === -1 ? '' : editItemLengthOfAuction.sec}
                  onChange={(e) => setEditItemLengthOfAuction({
                    day: editItemLengthOfAuction.day,
                    hour: editItemLengthOfAuction.hour,
                    min: editItemLengthOfAuction.min,
                    sec: parseInt(e.target.value),
                  })}
                  placeholder='S'
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Images</h3>
              <div className="flex flex-wrap gap-3 mt-4">
                {itemToEdit && itemToEdit.images?.map((image, index) => (
                  <div
                    key={index}
                    className="w-32 h-32 overflow-hidden border border-gray-200 rounded-md"
                  >
                    <img
                      src={`https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/${image}`}
                      alt={`Item ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
              <label className="block text-sm font-medium text-gray-700 ml-3 mt-2">
                <input
                  type="checkbox"
                  disabled={itemToEditRef.current?.currentBidId.length > 0 || currentItemState !== "inactive"}
                  checked={newIsAvailableToBuy}
                  onChange={(e) => setIsAvailableToBuy(e.target.checked)}
                  className="mr-3">
                </input>
                Available to buy immediately
                  </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Image
              </label>
              <input
                type="file"
                disabled={currentItemState?.toLowerCase() !== "inactive"}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setEditItemImages(e.target.files); // Store the single selected file
                  }
                }}
                className="mt-1 block w-full"
                accept="image/*" // Optional: Restrict to image files only
              />
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <Button
                onClick={handlePublishClick}
                disabled={currentItemState === "active" || currentItemState === "archived" || currentItemState === "completed"}
                size="sm"
                className={`text-xs px-3 py-1 m-2 ${currentItemState === "active"
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
              >
                Publish
              </Button>
              <Button
                onClick={handleArchiveClick}
                disabled={currentItemState?.toLowerCase() === "active" || currentItemState?.toLowerCase() === "archived" || currentItemState?.toLowerCase() === "completed"}
                size="sm"
                className={`text-xs px-3 py-1 m-2 ${currentItemState?.toLowerCase() === "archived"
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
              >
                Archive
              </Button>
              <Button
                onClick={handleUnpublishClick}
                disabled={currentItemState === "inactive" || currentItemState === "archived" || currentItemState === "completed" || (itemToEdit?.currentBidId ? itemToEdit.currentBidId.length > 0 : false) || itemToEdit?.isFrozen}
                size="sm"
                className={`text-xs px-3 py-1 m-2 ${currentItemState === "inactive"
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
                  }`}
              >
                Unpublish
              </Button>
              <Button
                onClick={() => itemToEdit && handleFulfillClick()}
                disabled={
                  !buttonFulfill ||
                  currentItemState !== "completed" ||
                  itemToEdit?.isFrozen
                }
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 m-2"
              >
                Fulfill
              </Button>
              <Button
                onClick={() => itemToEdit && onRequestUnfreeze(itemToEdit.id)}
                disabled={!itemToEdit || !itemToEdit.isFrozen}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 m-2"
              >
                Request Unfreeze
              </Button>
              <Button
                disabled={currentItemState === "active" || currentItemState === "archived" || currentItemState === "completed"}
                onClick={() => itemToEdit && onDelete(itemToEdit.id)}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 m-2"
              >
                Delete
              </Button>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <div className="relative group">
              <Button
                type="submit"
                disabled={currentItemState !== "inactive" } // Disable submit button if item is active
                className={`${currentItemState === "active" ? "cursor-not-allowed" : ""
                  }`}
              >
                Save Changes
              </Button>
              {currentItemState !== "inactive" && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  Cannot save changes while the item is active
                </div>
              )}
            </div>
            <Button color="gray" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default EditItemModal;
