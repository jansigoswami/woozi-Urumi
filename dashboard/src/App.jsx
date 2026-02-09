import { useState, useEffect } from 'react';
import api from './services/api';
import StoreList from './components/StoreList';
import CreateStoreModal from './components/CreateStoreModal';

function App() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getStores();
      setStores(data);
    } catch (err) {
      setError('Failed to load stores. Make sure backend is running on localhost:3001');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
    const interval = setInterval(fetchStores, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateStore = async (storeName) => {
    await api.createStore(storeName);
    await fetchStores();
  };

  const handleDeleteStore = async (storeId) => {
    await api.deleteStore(storeId);
    await fetchStores();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Store Provisioning Platform
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Create New Store
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Stores</h3>
            <p className="text-3xl font-bold text-gray-900">{stores.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Ready</h3>
            <p className="text-3xl font-bold text-green-600">
              {stores.filter(s => s.status === 'Ready').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Provisioning</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {stores.filter(s => s.status === 'Provisioning').length}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Stores</h2>
            <button
              onClick={fetchStores}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {loading ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>

          {loading && stores.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading stores...</p>
            </div>
          ) : (
            <StoreList
              stores={stores}
              onDelete={handleDeleteStore}
              onRefresh={fetchStores}
            />
          )}
        </div>
      </main>

      <CreateStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateStore}
      />
    </div>
  );
}

export default App;
