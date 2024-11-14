import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item, sellerAddItem, sellerDeleteItem, sellerItemPublish, sellerItemUnpublish, sellerReviewItem, sellerUpdateItem } from './api';
import { useAuth } from './AuthContext';
import { ItemSimple, itemToSimple } from './models/ItemSimple';

//R
import AddItemModal from './components/AddItemModal';
import EditItemModal from './components/EditItemModal';
import LogoutButton from './components/LogoutButton';

//R

const SellerDashboard = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [init, setInit] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

  //R
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemSimple | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      // If userInfo is missing, redirect to the login page
      navigate('/', { state: { openLoginModal: true } });
    } else {
      setLoading(false); // UserInfo is loaded, disable loading
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (userInfo && init) {
      // Fetch items only if userInfo is available
      sellerReviewItem({
        headers: {
          "Authorization": userInfo.token,
        },
        path: { sellerId: userInfo.userId },
      }).then(resp => {
        if (resp.data === undefined) {
          console.error(resp.error);
        } else {
          setItems(resp.data.payload);
        }
      });
      setInit(false);
    }
  }, [init, userInfo]);

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  const handleAddItem = async (newItem: ItemSimple) => {
    if (!userInfo) return;
    const addResp = await sellerAddItem({
      headers: { "Authorization": userInfo.token },
      path: { sellerId: userInfo.userId },
      body: {
        name: newItem.name,
        description: newItem.description,
        initPrice: newItem.initPrice,
        lengthOfAuction: newItem.lengthOfAuction,
        images: newItem.images,
      }
    });
    if (addResp.error) {
      // TODO: Error notificcation.
      console.error(addResp.error);
      return;
    }
    setInit(true)
  };

  const openEditModal = (item: Item) => {
    setItemToEdit(itemToSimple(item));
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setItemToEdit(null);
    setShowEditModal(false);
  };

  const handleUpdateItem = async (updatedItem: ItemSimple) => {
    if (!userInfo) return;
    const updateResp = await sellerUpdateItem({
      headers: { "Authorization": userInfo.token },
      path: {
        sellerId: userInfo.userId,
        itemId: updatedItem.id,
      },
      body: {
        name: updatedItem.name,
        description: updatedItem.description,
        initPrice: updatedItem.initPrice,
        lengthOfAuction: updatedItem.lengthOfAuction,
        images: updatedItem.images,
      },
    });
    if (updateResp.error) {
      console.error(updateResp.error);
      return;
    }
    setInit(true)

  };

  const handleDelete = async (id: string) => {
    if (!userInfo) return;
    const resp = await sellerDeleteItem({
      headers: { "Authorization": userInfo.token },
      path: { sellerId: userInfo.userId, itemId: id },
    });
    if (resp.error) {
      console.error(resp.error);
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handlePublish = async (id: string) => {
    if (!userInfo) return;
    const resp = await sellerItemPublish({
      headers: { "Authorization": userInfo.token },
      path: { sellerId: userInfo.userId, itemId: id },
    });
    if (resp.error) {
      console.error(resp.error);
      return;
    }
    setItems(items.map(item => (item.id === id ? { ...item, itemState: 'active' } : item)));
  };

  const handleUnpublish = async (id: string) => {
    if (!userInfo) return;
    const resp = await sellerItemUnpublish({
      headers: { "Authorization": userInfo.token },
      path: { sellerId: userInfo.userId, itemId: id },
    });
    if (resp.error) {
      console.error(resp.error);
      return;
    }
    setItems(items.map(item => (item.id === id ? { ...item, itemState: 'inactive' } : item)));
  };

  if (loading) return <div>Loading...</div>; // Display loading state if userInfo is not ready

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to the Seller Dashboard</h1>
      <button
        onClick={openAddModal}
        className="mb-4 px-4 py-2 text-sm font-semibold rounded bg-green-500 text-white hover:bg-green-600"
      >
        Add New Item
      </button>
      <LogoutButton />
      <AddItemModal show={showAddModal} onClose={closeAddModal} onAddItem={handleAddItem} />
      {itemToEdit && (
        <EditItemModal show={showEditModal} onClose={closeEditModal} onUpdateItem={handleUpdateItem} itemToEdit={itemToEdit} />
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 border-b-2 border-gray-300">
            <tr>
              <th className="p-4 text-left text-gray-600 font-semibold">ID</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Name</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Description</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Initial Price</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Length of Auction</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Images</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Status</th>
              <th className="p-4 text-left text-gray-600 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map(item => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">{item.id}</td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.description}</td>
                  <td className="p-4">{item.initPrice}</td>
                  <td className="p-4">{item.lengthOfAuction}</td>
                  <td className="p-4">
                    {item.images.map((image, idx) => (
                      <img key={idx} src={`https://serverless-auction-house-dev-images.s3.us-east-1.amazonaws.com/` + image} alt="item" className="w-8 h-8 object-cover inline-block" />
                    ))}</td>
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
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerDashboard;
