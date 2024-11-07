import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'flowbite-react';
import { ItemSimple } from '../models/ItemSimple';

interface EditItemModalProps {
  show: boolean;
  onClose: () => void;
  onUpdateItem: (item: ItemSimple) => void;
  itemToEdit: ItemSimple;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ show, onClose, onUpdateItem, itemToEdit }) => {
  const [editItemName, setEditItemName] = useState('');
  const [editItemDescription, setEditItemDescription] = useState('');
  const [editItemInitPrice, setEditItemInitPrice] = useState('');
  const [editItemLengthOfAuction, setEditItemLengthOfAuction] = useState('');
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
    if (
      editItemName.trim() === '' ||
      editItemDescription.trim() === '' ||
      editItemInitPrice.trim() === '' ||
      editItemLengthOfAuction.trim() === ''
    ) {
      return; // Add validation messages if needed
    }

    let images = itemToEdit.images;
    if (editItemImages && editItemImages.length > 0) {
      images = (await Promise.all(Array.from(editItemImages).map(async file => {
        const result = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (_) => resolve(reader.result as string);
          reader.onerror = (_) => reject(reader.error);
        }).catch(err => {
          // TODO: file upload error notification.
          console.error(`Failed to read file ${file.name}: ${err}`);
        });
        if (!result) {
          return;
        }
        return result;
      }))).filter((v) => v !== undefined);
    }
    const updatedItem: ItemSimple = {
      ...itemToEdit,
      name: editItemName,
      description: editItemDescription,
      initPrice: parseFloat(editItemInitPrice),
      lengthOfAuction: parseInt(editItemLengthOfAuction),
      images: images,
    };

    onUpdateItem(updatedItem);
    // Reset form fields
    setEditItemName('');
    setEditItemDescription('');
    setEditItemInitPrice('');
    setEditItemLengthOfAuction('');
    setEditItemImages(null);
    onClose();
  };

  return (
    <Modal show={show} size="lg" popup onClose={onClose}>
      <Modal.Header>
        Edit Item
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Item Name</label>
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
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editItemDescription}
                onChange={(e) => setEditItemDescription(e.target.value)}
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
                value={editItemInitPrice}
                onChange={(e) => setEditItemInitPrice(e.target.value)}
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
                value={editItemLengthOfAuction}
                onChange={(e) => setEditItemLengthOfAuction(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Images (Upload to replace existing)</label>
              <input
                type="file"
                multiple
                onChange={(e) => setEditItemImages(e.target.files)}
                className="mt-1 block w-full"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <Button type="submit">
                Update Item
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

export default EditItemModal;
