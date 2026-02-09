import { useEffect, useState } from 'react';
import './App.css';
import CreateStoreModal from './components/CreateStoreModal';
import StoreList from './components/StoreList';
import api from './services/api';

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
      setError('Failed to load stores. Make sure the backend API is running on localhost:3001');
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
        <div className="max-w-7xl mx-auto py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Store Manager
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6">
        {error && <p className="text-red-600">{error}</p>}

        {loading ? (
          <p>Loading stores...</p>
        ) : (
          <StoreList
            stores={stores}
            onDelete={handleDeleteStore}
          />
        )}

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setIsModalOpen(true)}
        >
          Create Store
        </button>

        {isModalOpen && (
          <CreateStoreModal
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateStore}
          />
        )}
      </main>
    </div>
  );
}

export default App;
