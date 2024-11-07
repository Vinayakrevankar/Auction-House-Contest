import { useState } from 'react';
import { getApiSellersBySellerIdItems, Item } from './api';
import { useAuth } from './AuthContext';

const SellerDashboard = () => {
  const { userJWTToken } = useAuth();
  const [init, setInit] = useState(true);
  const [items, setItems] = useState<Item[]>([]);

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


  const handlePublish = (id: number) => {
    setItems(items.map((item, idx) =>
      idx === id ? { ...item, itemState: 'active' } : item
    ));
  };

  const handleUnpublish = (id: number) => {
    setItems(items.map((item, idx) =>
      idx === id ? { ...item, itemState: 'inactive' } : item
    ));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to the Seller Dashboard</h1>
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
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4">{idx}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${item.itemState === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.itemState}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handlePublish(idx)}
                    disabled={item.itemState === 'active'}
                    className={`px-4 py-2 text-sm font-semibold rounded ${item.itemState === 'active' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleUnpublish(idx)}
                    disabled={item.itemState === 'inactive'}
                    className={`px-4 py-2 text-sm font-semibold rounded ${item.itemState === 'inactive' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                  >
                    Unpublish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerDashboard;
