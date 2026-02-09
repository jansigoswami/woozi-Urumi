import { useState } from 'react';

const CreateStoreModal = ({ isOpen, onClose, onCreate }) => {
  const [storeName, setStoreName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    setIsCreating(true);
    try {
      await onCreate(storeName.trim());
      setStoreName('');
      onClose();
    } catch (err) {
      alert('Failed to create store');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Create New Store</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Store Name"
            className="w-full px-3 py-2 border rounded mb-4"
            disabled={isCreating}
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoreModal;