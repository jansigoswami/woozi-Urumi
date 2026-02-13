import React from 'react';
import { useState } from 'react';


const StoreList = ({ stores, onDelete, onRefresh }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (storeId, storeName) => {
    if (!window.confirm(`Delete "${storeName}"?`)) return;

    setDeletingId(storeId);
    try {
      await onDelete(storeId);
      await onRefresh();
    } catch (error) {
      alert('Failed to delete: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready': return 'bg-green-100 text-green-800';
      case 'Provisioning': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (stores.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <p className="text-gray-500">No stores yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Name</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Namespace</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {stores.map((store) => (
          <tr key={store.id}>
            <td className="px-6 py-4">{store.name}</td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(store.status)}`}>
                {store.status}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{store.namespace}</td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleDelete(store.id, store.name)}
                disabled={deletingId === store.id}
                className="text-red-600 hover:text-red-900"
              >
                {deletingId === store.id ? 'Deleting...' : 'Delete'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StoreList;