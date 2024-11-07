import React, { useState } from 'react';

const AdminDashboard = () => {
  const [data, setData] = useState([
    { id: 1, name: 'Item 1', status: 'Unpublished' },
    { id: 2, name: 'Item 2', status: 'Published' },
    { id: 3, name: 'Item 3', status: 'Unpublished' },
  ]);

  const handlePublish = (id: number) => {
    setData(data.map(item => 
      item.id === id ? { ...item, status: 'Published' } : item
    ));
  };

  const handleUnpublish = (id: number) => {
    setData(data.map(item => 
      item.id === id ? { ...item, status: 'Unpublished' } : item
    ));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome to the Admin Dashboard</h1>
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
            {data.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${item.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handlePublish(item.id)}
                    disabled={item.status === 'Published'}
                    className={`px-4 py-2 text-sm font-semibold rounded ${item.status === 'Published' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => handleUnpublish(item.id)}
                    disabled={item.status === 'Unpublished'}
                    className={`px-4 py-2 text-sm font-semibold rounded ${item.status === 'Unpublished' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
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

export default AdminDashboard;
