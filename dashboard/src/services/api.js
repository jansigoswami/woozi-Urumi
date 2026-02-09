import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = {
  getStores: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stores`);
      return response.data.stores;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  },

  createStore: async (storeName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/stores`, {
        name: storeName
      });
      return response.data.store;
    } catch (error) {
      console.error('Error creating store:', error);
      throw error;
    }
  },

  deleteStore: async (storeId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/stores/${storeId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting store:', error);
      throw error;
    }
  }
};

export default api;