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

const SellerDashboard = () => {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemSimple | null>(null);
  const [loading, setLoading] = useState(true);

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
      sortable: true,
      filter: true,
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
        notifyError("Token expired");
        setUserInfo(null);
      } else {
        notifyError("Failed to fetch items");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      notifyError("Error fetching items");
    }
  }, [userInfo]);

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
      const addResp = await sellerAddItem({
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
      if (addResp.error) {
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
      const updateResp = await sellerUpdateItem({
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
      if (updateResp.error) {
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
      if (resp.error) {
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
      if (resp.error) {
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
      if (resp.error) {
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
      if (resp.error) {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-blue-500 via-pink-400 to-purple-500 text-white">
      <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={openAddModal}
          className="px-4 py-2 text-sm font-semibold rounded bg-green-500 text-white hover:bg-green-600"
        >
          Add New Item
        </button>
        <div className="flex space-x-4 ml-auto">
          <button
            // onClick={openProfileEditModal} // Function to handle profile editing
            className="px-4 py-2 text-sm font-semibold rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Edit Profile
          </button>
          <LogoutButton />
        </div>
      </div>
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
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDelete={handleDelete}
          refreshItems={fetchItems}
          onArchive={handleArchive}
        />
      )}
      <div
        className="ag-theme-alpine"
        style={{ height: "80vh", width: "100%" }}
      >
        <div className="flex justify-between items-center mb-2">
          <div></div>
          <span className="text-sm font-light text-white text-right">
            <b>Note*: Click on any item in the table to edit it</b>
          </span>
        </div>
        <AgGridReact
          rowData={items}
          columnDefs={columnDefs}
          domLayout="normal"
          defaultColDef={{
            flex: 1, // Automatically distribute column width equally
            minWidth: 100, // Optional: Set a minimum width for each column
            resizable: true, // Allow column resizing
          }}
          onRowClicked={(params) => params.data && openEditModal(params.data)}
        />
      </div>
    </div>
  );
};

export default SellerDashboard;
