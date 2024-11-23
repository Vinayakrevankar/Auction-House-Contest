import React, { useState } from 'react';
import { Modal, Button } from 'flowbite-react';
import { ItemSimple } from '../models/ItemSimple';
import { uploadImage } from '../api';

interface AddItemModalProps {
  show: boolean;
  onClose: () => void;
  onAddItem: (item: any) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ show, onClose, onAddItem }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemInitPrice, setNewItemInitPrice] = useState('');
  const [newItemLengthOfAuction, setNewItemLengthOfAuction] = useState('');
  const [newItemImages, setNewItemImages] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newItemName.trim() === '' ||
      newItemDescription.trim() === '' ||
      newItemInitPrice.trim() === '' ||
      newItemLengthOfAuction.trim() === '' ||
      !newItemImages || newItemImages.length === 0
    ) {
      return; // Add validation messages if needed
    }

    const imageData = await Promise.all(Array.from(newItemImages).map(async file => {
      const result = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (_) => resolve(reader.result as ArrayBuffer);
        reader.onerror = (_) => reject(reader.error);
      }).catch(err => {
        // TODO: file upload error notification.
        console.error(`Failed to read file ${file.name}: ${err}`);
      });
      if (!result) {
        return;
      }
      return result;
    }));
    const images = await Promise.all(imageData.filter(v => v !== undefined).map(async data => {
      const resp = await uploadImage({ body: { image: new Blob([data], { type: "application/octet-stream" }) } });
      if (resp.data === undefined) {
        console.error(resp.error);
      } else {
        return resp.data.payload.key;
      }
    }));
    const newItem: ItemSimple = {
      id: `${Date.now()}`, // Use a better unique ID in production
      name: newItemName,
      itemState: 'inactive',
      description: newItemDescription,
      initPrice: parseFloat(newItemInitPrice),
      lengthOfAuction: parseInt(newItemLengthOfAuction),
      images: images.filter((v) => v !== undefined), // For simplicity,
      isFrozen: false,
    };

    onAddItem(newItem);
    // Reset form fields
    setNewItemName('');
    setNewItemDescription('');
    setNewItemInitPrice('');
    setNewItemLengthOfAuction('');
    setNewItemImages(null);
    onClose();
  };

  return (
    <Modal show={show} size="lg" popup onClose={onClose}>
      <Modal.Header>
        <div className="ml-2 font-bold text-center text-gray-800">
        Add New Item
        </div>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Initial Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Price</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={newItemInitPrice}
                onChange={(e) => setNewItemInitPrice(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Length of Auction */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Length of Auction (days)</label>
              <input
                type="number"
                min="1"
                value={newItemLengthOfAuction}
                onChange={(e) => setNewItemLengthOfAuction(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <input
                type="file"
                multiple
                onChange={(e) => setNewItemImages(e.target.files)}
                className="mt-1 block w-full"
                required
              />
            </div>

            {/* Status */}

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button type="submit">
                Add Item
              </Button>
              <Button color="gray" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddItemModal;