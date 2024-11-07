import { useState } from 'react';
import { getApiSellersBySellerIdItems, Item } from './api';
import { useAuth } from './AuthContext';

//R
import AddItemModal from './components/AddItemModal';
import EditItemModal from './components/EditItemModal';
//R

const SellerDashboard = () => {
  const { userJWTToken } = useAuth();
  const [init, setInit] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

  //R
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddItem = (newItem: Item) => {
    setItems([...items, newItem]);
  };

  const openEditModal = (item: Item) => {
    setItemToEdit(item);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setItemToEdit(null);
    setShowEditModal(false);
  };

  const handleUpdateItem = (updatedItem: Item) => {
    setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };
  //R

  if (init) {
    getApiSellersBySellerIdItems({
      headers: {
        "Authorization": userJWTToken || "",
      },
      path: { sellerId: "VIRE89444757" },
    }).then(resp => {
      if (resp.error !== undefined) {
        console.error(resp.error);
      } else {
        console.log("Success");
        console.log(resp.data!);
        setItems(resp.data!);
      }
    });
    setInit(false);
  }

  //R
  const handlePublish = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, itemState: 'active' } : item
    ));
  };

  const handleUnpublish = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, itemState: 'inactive' } : item
    ));
  };
  //R

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to the Seller Dashboard</h1>

      {/* R */}
      <button
        onClick={openAddModal}
        className="mb-4 px-4 py-2 text-sm font-semibold rounded bg-green-500 text-white hover:bg-green-600"
      >
        Add New Item
      </button>

      <AddItemModal
        show={showAddModal}
        onClose={closeAddModal}
        onAddItem={handleAddItem}
      />

      {itemToEdit && (
        <EditItemModal
          show={showEditModal}
          onClose={closeEditModal}
          onUpdateItem={handleUpdateItem}
          itemToEdit={itemToEdit}
        />
      )}
      {/* R */}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 border-b-2 border-gray-300">
            <tr>
              <th className="p-4 text-left text-gray-600 font-semibold">ID</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Name</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Status</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* R */}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${item.itemState === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.itemState}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handlePublish(item.id)}
                    disabled={item.itemState === 'active'}
                    className={`px-4 py-2 text-sm font-semibold rounded ${item.itemState === 'active' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleUnpublish(item.id)}
                    disabled={item.itemState === 'inactive'}
                    className={`px-4 py-2 text-sm font-semibold rounded ${item.itemState === 'inactive' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                  >
                    Unpublish
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-4 py-2 text-sm font-semibold rounded bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 text-sm font-semibold rounded bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {/* R */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerDashboard;
