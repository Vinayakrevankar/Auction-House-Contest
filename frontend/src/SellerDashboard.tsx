import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Item,
  sellerAddItem,
  sellerDeleteItem,
  sellerItemArchive,
  sellerItemPublish,
  sellerItemRequestUnfreeze,
  sellerItemUnpublish,
  sellerReviewItem,
  sellerUpdateItem,
} from "./api";
import { useAuth } from "./AuthContext";
import { ItemSimple, itemToSimple } from "./models/ItemSimple";
import { notifySuccess, notifyError } from "./components/Notification";
import AddItemModal from "./components/AddItemModal";
import EditItemModal from "./components/EditItemModal";
import LogoutButton from "./components/LogoutButton";
import { FaEye, FaPlus } from "react-icons/fa"; // FaUser Import FontAwesome eye icon

const stateTextColors = {
  active: "text-green-500",
  inactive: "text-yellow-500",
  archived: "text-gray-500",
};

const SellerDashboard = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemSimple | null>(null);
  const [loading, setLoading] = useState(true);

  const CustomColor = ({ value }: { value: keyof typeof stateTextColors }) => {
    const colorClass = stateTextColors[value] || "bg-red-500 text-white"; // Default style for undefined states
    return (
      <div className={`px-2 py-1 font-bold rounded ${colorClass}`}>
        {value.toUpperCase()}
      </div>
    );
  };
  const EditButtonComponent = ({ data }: { data: Item }) => (
    <button
      onClick={() => openEditModal(data)}
      className="w-32 px-4 rounded bg-blue-500 border border-white text-white hover:bg-blue-600"
    >
      Edit
    </button>
  );

  const EyeButtonComponent = ({ data }: { data: Item }) => (
    <button
      onClick={() => openEditModal(data)}
      className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
    >
      <FaEye />
    </button>
  );

  const columnDefs: any[] = [
    { field: "id", headerName: "ID", sortable: true, filter: true },
    { field: "name", headerName: "Name", sortable: true, filter: true },
    {
      field: "description",
      headerName: "Description",
      sortable: true,
      filter: true,
    },
    {
      field: "initPrice",
      headerName: "Initial Price",
      sortable: true,
      filter: true,
    },
    {
      field: "lengthOfAuction",
      headerName: "Length of Auction",
      sortable: true,
      filter: true,
    },
    {
      field: "itemState",
      headerName: "Status",
      valueFormatter: (p: { value: string }) => p.value.toUpperCase(),
      cellRenderer: CustomColor,
      sortable: true,
      filter: true,
    },
    { headerName: "Action", cellRenderer: EditButtonComponent, flex: 1 },
    {
      headerName: "View Bids",
      cellRenderer: EyeButtonComponent,
      flex: 1,
      field: "view",
    },
  ];

  const fetchItems = useCallback(async () => {
    if (!userInfo) return;
    try {
      const resp = await sellerReviewItem({
        headers: { Authorization: userInfo?.token },
        path: { sellerId: userInfo?.userId },
      });
      if (resp.data) {
        setItems(resp.data.payload);
      } else if (resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
      } else {
        notifyError("Failed to fetch items");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      notifyError("Error fetching items");
    }
  }, [userInfo, setUserInfo]);

  // Load data on mount
  useEffect(() => {
    if (!userInfo) {
      navigate("/", { state: { openLoginModal: true } });
    } else {
      setLoading(false);
      fetchItems();
    }
  }, [userInfo, navigate, fetchItems]);

  // Open modals
  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  const openEditModal = (item: Item) => {
    const latestItem = items.find((i) => i.id === item.id) || item; // Use the updated item
    setItemToEdit(itemToSimple(latestItem));
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setItemToEdit(null);
    setShowEditModal(false);
  };

  // Add item
  const handleAddItem = async (newItem: ItemSimple) => {
    if (!userInfo) return;
    try {
      const resp = await sellerAddItem({
        headers: { Authorization: userInfo?.token },
        path: { sellerId: userInfo?.userId },
        body: {
          name: newItem.name,
          description: newItem.description,
          initPrice: newItem.initPrice,
          lengthOfAuction: newItem.lengthOfAuction,
          images: newItem.images,
        },
      });
      if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
      } else if (resp.error) {
        notifyError("Failed to add item");
      } else {
        notifySuccess("Item added successfully");
        fetchItems();
      }
    } catch (err) {
      console.error("Error adding item:", err);
      notifyError("Error adding item");
    }
    closeAddModal();
  };

  // Update item
  const handleUpdateItem = async (updatedItem: ItemSimple) => {
    if (!userInfo) return;
    try {
      const resp = await sellerUpdateItem({
        headers: { Authorization: userInfo.token },
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
      if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
      } else if (resp.error) {
        notifyError("Failed to update item");
      } else {
        notifySuccess("Item updated successfully");
        fetchItems();
      }
    } catch (err) {
      console.error("Error updating item:", err);
      notifyError("Error updating item");
    }
    closeEditModal();
  };

  // Delete item
  const handleDelete = async (id: string) => {
    if (!userInfo) return;
    try {
      const resp = await sellerDeleteItem({
        headers: { Authorization: userInfo.token },
        path: { sellerId: userInfo.userId, itemId: id },
      });
      if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
      } else if (resp.error) {
        notifyError("Failed to delete item");
      } else {
        notifySuccess("Item deleted successfully");
        setItems(items.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      notifyError("Error deleting item");
    }
  };

  // Publish item
  const handlePublish = async (id: string) => {
    if (!userInfo) return;
    try {
      const resp = await sellerItemPublish({
        headers: { Authorization: userInfo.token },
        path: { sellerId: userInfo.userId, itemId: id },
      });
      if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
      } else if (resp.error) {
        notifyError("Failed to publish item");
      } else {
        notifySuccess("Item published successfully");
        fetchItems();
      }
    } catch (err) {
      console.error("Error publishing item:", err);
      notifyError("Error publishing item");
    }
  };
  // Archive item
  const handleArchive = async (id: string) => {
    if (!userInfo) return;
    try {
      const resp = await sellerItemArchive({
        headers: { Authorization: userInfo.token },
        path: { sellerId: userInfo.userId, itemId: id },
      });
      if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
      } else if (resp.error) {
        notifyError("Failed to archived item");
      } else {
        notifySuccess("Item archived successfully");
        fetchItems();
      }
    } catch (err) {
      console.error("Error Archived item:", err);
      notifyError("Error archiving item");
    }
  };
  // Unpublish item
  const handleUnpublish = async (id: string) => {
    if (!userInfo) return;
    try {
      const resp = await sellerItemUnpublish({
        headers: { Authorization: userInfo.token },
        path: { sellerId: userInfo.userId, itemId: id },
      });
      if (resp.error && resp.error.status === 401) {
        notifyError("Unauthorized Access");
        setUserInfo(null);
      } else if (resp.error) {
        notifyError("Failed to unpublish item");
      } else {
        notifySuccess("Item unpublished successfully");
        fetchItems();
      }
    } catch (err) {
      console.error("Error unpublishing item:", err);
      notifyError("Error unpublishing item");
    }
  };
// Unpublish item
const handleRequestUnfreeze = async (id: string) => {
  if (!userInfo) return;
  try {
    const resp = await sellerItemRequestUnfreeze({
      headers: { Authorization: userInfo.token },
      path: { sellerId: userInfo.userId, itemId: id },
    });
    if (resp.error && resp.error.status === 401) {
      notifyError("Unauthorized Access");
      setUserInfo(null);
    } else if (resp.error) {
      notifyError("Failed to unpublish item");
    } else {
      notifySuccess("Request unfreeze item successfully");
      fetchItems();
    }
  } catch (err) {
    console.error("Error unpublishing item:", err);
    notifyError("Error unpublishing item");
  }
}

  

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <div className="flex space-x-4">
          {/* Profile Edit Button */}
          {/* <button
            title="Edit Profile"
            className="px-4 py-2 flex items-center justify-center text-sm font-semibold rounded border border-white bg-blue-500 text-white hover:bg-blue-600"
          >
            <FaUser />
          </button> */}
          {/* Logout Button */}
          <LogoutButton />
        </div>
      </div>

      {/* Add Item Button */}
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={openAddModal}
          className="w-40 px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold rounded bg-green-500 border border-white text-white hover:bg-green-600"
        >
          <FaPlus className="text-white" />
          Add Item
        </button>
      </div>

      {/* Add Item Modal */}
      <AddItemModal
        show={showAddModal}
        onClose={closeAddModal}
        onAddItem={handleAddItem}
      />

      {/* Edit Item Modal */}
      {itemToEdit && (
        <EditItemModal
          show={showEditModal}
          onClose={closeEditModal}
          onUpdateItem={handleUpdateItem}
          itemToEdit={itemToEdit}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDelete={handleDelete}
          onRequestUnfreeze={handleRequestUnfreeze}
          refreshItems={fetchItems}
          onArchive={handleArchive}
        />
      )}

      {/* AG Grid Table */}
      <div
        className="ag-theme-alpine rounded-lg shadow-lg"
        style={{ height: "80vh", width: "100%" }}
      >
        <AgGridReact
          rowData={items}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          defaultColDef={{
            flex: 1, // Automatically distribute column width equally
            minWidth: 100, // Minimum width for each column
            resizable: true, // Allow column resizing
            floatingFilter: true, // Enable floating filters
          }}
        />
      </div>
    </div>
  );
};

export default SellerDashboard;
