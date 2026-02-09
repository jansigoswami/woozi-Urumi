const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const storeDB = require('./database');
const k8sHelper = require('./k8s-helper');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

function generateNamespace(storeName) {
  const sanitized = storeName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const shortId = uuidv4().split('-')[0];
  return `store-${sanitized}-${shortId}`;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Create store
app.post('/api/stores', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Store name is required' });
    }

    const storeId = uuidv4();
    const namespace = generateNamespace(name);
    const helmRelease = `store-${storeId.split('-')[0]}`;

    console.log(`[AUDIT] ${new Date().toISOString()} - User created store: ${name} (${storeId})`);
    console.log(`Namespace: ${namespace}, Helm Release: ${helmRelease}`);

    const store = {
      id: storeId,
      name: name.trim(),
      namespace,
      status: 'Provisioning',
      helmRelease,
      createdAt: new Date().toISOString(),
      url: null
    };

    storeDB.create(store);

    k8sHelper.installStore(helmRelease, namespace, name)
      .then(() => {
        console.log(`Store ${storeId} deployed successfully`);
        storeDB.updateStatus(storeId, 'Ready');
      })
      .catch((error) => {
        console.error(`Failed to deploy store ${storeId}:`, error);
        storeDB.updateStatus(storeId, 'Failed');
      });

    res.status(201).json({
      message: 'Store creation initiated',
      store: {
        id: storeId,
        name: name.trim(),
        namespace,
        status: 'Provisioning',
        createdAt: store.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Failed to create store', details: error.message });
  }
});

// Get all stores
app.get('/api/stores', async (req, res) => {
  try {
    const stores = storeDB.getAll();

    const enhancedStores = await Promise.all(
      stores.map(async (store) => {
        try {
          const k8sStatus = await k8sHelper.getNamespaceStatus(store.namespace);

          if (k8sStatus.exists && k8sStatus.status !== store.status) {
            storeDB.updateStatus(store.id, k8sStatus.status);
            store.status = k8sStatus.status;
          }

          return {
            id: store.id,
            name: store.name,
            namespace: store.namespace,
            status: store.status,
            createdAt: store.created_at,
            url: store.status === 'Ready' ? 'http://localhost:8080' : null,
            podCount: k8sStatus.podCount || 0
          };
        } catch (error) {
          console.error(`Error checking status for store ${store.id}:`, error);
          return {
            id: store.id,
            name: store.name,
            namespace: store.namespace,
            status: store.status,
            createdAt: store.created_at,
            url: null
          };
        }
      })
    );

    res.json({ stores: enhancedStores });
  } catch (error) {
    console.error('Error listing stores:', error);
    res.status(500).json({ error: 'Failed to list stores', details: error.message });
  }
});

// Get single store
app.get('/api/stores/:id', async (req, res) => {
  try {
    const store = storeDB.getById(req.params.id);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const k8sStatus = await k8sHelper.getNamespaceStatus(store.namespace);

    res.json({
      id: store.id,
      name: store.name,
      namespace: store.namespace,
      status: k8sStatus.status || store.status,
      createdAt: store.created_at,
      url: k8sStatus.status === 'Ready' ? 'http://localhost:8080' : null
    });
  } catch (error) {
    console.error('Error getting store:', error);
    res.status(500).json({ error: 'Failed to get store', details: error.message });
  }
});

// Delete store
app.delete('/api/stores/:id', async (req, res) => {
  try {
    const store = storeDB.getById(req.params.id);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    console.log(
      `[AUDIT] ${new Date().toISOString()} - User deleted store: ${store.id} (${store.name})`
    );

    await k8sHelper.uninstallStore(store.helm_release);
    storeDB.delete(store.id);

    res.json({
      message: 'Store deleted successfully',
      id: store.id
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    res.status(500).json({ error: 'Failed to delete store', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Store Provisioning API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🏪 API endpoint: http://localhost:${PORT}/api/stores`);
});
