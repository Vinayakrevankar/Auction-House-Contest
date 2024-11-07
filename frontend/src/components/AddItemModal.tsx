import React, { useState } from 'react';
import { Modal, Button } from 'flowbite-react';

interface AddItemModalProps {
  show: boolean;
  onClose: () => void;
  onAddItem: (item: any) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ show, onClose, onAddItem }) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemStatus, setNewItemStatus] = useState('Unpublished');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemInitPrice, setNewItemInitPrice] = useState('');
  const [newItemLengthOfAuction, setNewItemLengthOfAuction] = useState('');
  const [newItemImages, setNewItemImages] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
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

    const newItem = {
      id: Date.now(), // Use a better unique ID in production
      name: newItemName,
      status: newItemStatus,
      description: newItemDescription,
      initPrice: parseFloat(newItemInitPrice),
      lengthOfAuction: parseInt(newItemLengthOfAuction),
      images: Array.from(newItemImages).map(file => file.name), // For simplicity
    };

    onAddItem(newItem);
    // Reset form fields
    setNewItemName('');
    setNewItemStatus('Unpublished');
    setNewItemDescription('');
    setNewItemInitPrice('');
    setNewItemLengthOfAuction('');
    setNewItemImages(null);
    onClose();
  };

  return (
    <Modal show={show} size="lg" popup onClose={onClose}>
      <Modal.Header>
        Add New Item
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={newItemStatus}
                onChange={(e) => setNewItemStatus(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="Unpublished">Unpublished</option>
                <option value="Published">Published</option>
              </select>
            </div>

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
