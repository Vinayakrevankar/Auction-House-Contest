import React, { useState, useEffect } from "react";
import { Modal, Button } from "flowbite-react";
import { ItemSimple } from "../models/ItemSimple";
import { uploadImage } from "../api";

interface EditItemModalProps {
  show: boolean;
  onClose: () => void;
  onUpdateItem: (item: ItemSimple) => void;
  itemToEdit: ItemSimple;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  show,
  onClose,
  onUpdateItem,
  itemToEdit,
  onPublish,
  onUnpublish,
  onDelete,
}) => {
  const [editItemName, setEditItemName] = useState("");
  const [editItemDescription, setEditItemDescription] = useState("");
  const [editItemInitPrice, setEditItemInitPrice] = useState("");
  const [editItemLengthOfAuction, setEditItemLengthOfAuction] = useState("");
  const [editItemImages, setEditItemImages] = useState<FileList | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setEditItemName(itemToEdit.name);
      setEditItemDescription(itemToEdit.description);
      setEditItemInitPrice(itemToEdit.initPrice.toString());
      setEditItemLengthOfAuction(itemToEdit.lengthOfAuction.toString());
      setEditItemImages(null);
    }
  }, [itemToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !editItemName.trim() ||
      !editItemDescription.trim() ||
      !editItemInitPrice.trim() ||
      !editItemLengthOfAuction.trim()
    ) {
      // Add validation messages here if required
      return;
    }

    let images = itemToEdit.images || [];

    // Upload new images if any
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
              const resp = await uploadImage({ body: { image: new Blob([data]) } });
              return resp.data?.payload.key;
            } catch (error) {
              console.error("Image upload failed:", error);
              return undefined;
            }
          })
      );

      images = uploadedImages.filter((key): key is string => !!key);
    }

    // Update item
    const updatedItem: ItemSimple = {
      ...itemToEdit,
      name: editItemName,
      description: editItemDescription,
      initPrice: parseFloat(editItemInitPrice),
      lengthOfAuction: parseInt(editItemLengthOfAuction),
      images,
    };

    onUpdateItem(updatedItem);

    // Reset form and close modal
    setEditItemName("");
    setEditItemDescription("");
    setEditItemInitPrice("");
    setEditItemLengthOfAuction("");
    setEditItemImages(null);
    onClose();
  };

  const handlePublish = () => itemToEdit && onPublish(itemToEdit.id);
  const handleUnpublish = () => itemToEdit && onUnpublish(itemToEdit.id);
  const handleDelete = () => itemToEdit && onDelete(itemToEdit.id);

  return (
    <Modal show={show} size="lg" popup onClose={onClose}>
      <Modal.Header>Edit Item</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Item Name
            </label>
            <input
              type="text"
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={editItemDescription}
              onChange={(e) => setEditItemDescription(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          {/* Initial Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Initial Price
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={editItemInitPrice}
              onChange={(e) => setEditItemInitPrice(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          {/* Length of Auction */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Length of Auction (days)
            </label>
            <input
              type="number"
              min="1"
              value={editItemLengthOfAuction}
              onChange={(e) => setEditItemLengthOfAuction(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Images (Upload to replace existing)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setEditItemImages(e.target.files)}
              className="mt-1 block w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-4">
            <div className="space-x-2">
              <button
                type="button"
                onClick={handlePublish}
                disabled={itemToEdit.itemState === "active"}
                className={`px-4 py-2 text-sm font-semibold rounded ${
                  itemToEdit.itemState === "active"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Publish
              </button>
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={itemToEdit.itemState === "inactive"}
                className={`px-4 py-2 text-sm font-semibold rounded ${
                  itemToEdit.itemState === "inactive"
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                Unpublish
              </button>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-semibold rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              Delete
            </button>
          </div>

          {/* Update/Cancel Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <Button type="submit">Update Item</Button>
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
