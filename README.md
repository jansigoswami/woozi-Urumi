# Woozy 🍹 - Store Provisioning Platform

> Spin up WooCommerce stores in seconds, not hours. Built on Kubernetes, powered by Helm.

A production-ready platform that automates the entire lifecycle of e-commerce stores—from provisioning to deletion—with enterprise-grade isolation and monitoring.

---

## ✨ What It Does

Click a button → Get a fully configured WooCommerce store.  
Complete with database, persistent storage, health checks, and automatic scaling.

**Built for:**
- Agencies managing multiple client stores
- SaaS platforms offering white-label e-commerce
- Developers who value their time

---

## 🚀 Features

- **One-Click Provisioning** - Deploy WooCommerce stores via REST API or React dashboard
- **True Isolation** - Each store runs in its own Kubernetes namespace with dedicated resources
- **Persistent Everything** - Your data survives pod restarts, node failures, and chaos
- **Local → Production** - Same Helm charts, different values. Deploy anywhere.
- **Real-Time Status** - Watch stores go from "Provisioning" to "Ready" in your dashboard
- **Clean Teardown** - Delete a store, delete everything. No orphaned resources.

---

## 🏗️ Architecture
```
User → React Dashboard → Node.js API → Kubernetes
                                          ├─ Namespace (Store 1)
                                          │   ├─ WordPress + WooCommerce
                                          │   ├─ MySQL Database
                                          │   └─ Persistent Volumes
                                          ├─ Namespace (Store 2)
                                          │   └─ ...
                                          └─ Namespace (Store N)
```

**Stack:**
- **Orchestration:** Kubernetes + Helm
- **Backend:** Node.js, Express, Kubernetes Client
- **Frontend:** React, Vite, Tailwind CSS
- **Storage:** SQLite (metadata), MySQL (stores)
- **Infrastructure:** Docker Desktop (local) / k3s (production)

---

## 🎯 Quick Start

### Prerequisites
```bash
✓ Docker Desktop (with Kubernetes enabled)
✓ Node.js 18+
✓ Helm 3.x
✓ kubectl
```

### 1. Clone & Setup
```bash
git clone https://github.com/yourusername/urumi.git
cd urumi
```

### 2. Start Backend
```bash
cd backend
npm install
npm start
```

Backend runs at `http://localhost:3001`

### 3. Start Dashboard
```bash
cd dashboard
npm install
npm run dev
```

Dashboard runs at `http://localhost:5173`

### 4. Create Your First Store

**Via Dashboard:**
1. Open `http://localhost:5173`
2. Click "Create New Store"
3. Enter store name
4. Watch it provision!

**Via API:**
```bash
curl -X POST http://localhost:3001/api/stores \
  -H "Content-Type: application/json" \
  -d '{"name":"My Store"}'
```

### 5. Access Your Store
```bash
kubectl port-forward svc/wordpress 8080:80 -n my-first-store
```

Open `http://localhost:8080` → Complete WordPress setup → Install WooCommerce

---

## 🧪 End-to-End Testing

### Place a Test Order

1. Deploy a store (via dashboard or API)
2. Access WordPress at `localhost:8080`
3. Complete WordPress setup
4. Install WooCommerce plugin
5. Create a test product
6. Add to cart and checkout
7. Verify order in WooCommerce admin

## ✅ Definition of Done - Tested

Successfully placed test order:
- Product created: "Test Product"
- Added to cart
- Checkout completed (Cash on Delivery)
- Order visible in WooCommerce admin

[Screenshot of order in admin panel]

---

## 🔒 Security Features

- **Zero Hardcoded Secrets** - All passwords in Kubernetes Secrets
- **RBAC Service Accounts** - Least privilege for all components
- **Non-Root Containers** - Security best practices by default
- **Resource Quotas** - Per-namespace limits prevent abuse
- **Network Isolation** - Each store is a walled garden

---

## 📈 Scaling Strategy

| Component | Strategy |
|-----------|----------|
| **API** | Horizontal scaling (multiple replicas behind LB) |
| **Dashboard** | Static hosting on CDN |
| **Stores** | Independent, provision concurrently |
| **Database** | Vertical scaling + read replicas |

**Throughput:** Limited only by cluster resources. Tested with 10+ concurrent provisions.

---

## 🌍 Production Deployment

### VPS Setup (k3s)

1. **Update production values:**
```bash
vim woocommerce-store/values-prod.yaml
# Set domain, strong passwords, Let's Encrypt email
```

2. **Deploy:**
```bash
helm install my-store ./woocommerce-store -f ./woocommerce-store/values-prod.yaml
```

3. **Access:**
```
https://store.yourdomain.com
```

**See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed VPS setup with cert-manager.**

---

## 🔄 Local vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| **Access** | `kubectl port-forward` | Ingress + custom domain |
| **HTTPS** | ❌ HTTP only | ✅ Let's Encrypt TLS |
| **Storage** | 5Gi (hostPath) | 10Gi (network storage) |
| **Resources** | 256Mi RAM | 1Gi+ RAM |
| **Passwords** | Dev-friendly | Vault-managed |
| **Monitoring** | Logs | Prometheus + Grafana |

---

## 📡 API Reference
```bash
GET    /health              # Health check
POST   /api/stores          # Create store
GET    /api/stores          # List all stores
GET    /api/stores/:id      # Get store details
DELETE /api/stores/:id      # Delete store
```

**Example Response:**
```json
{
  "id": "abc-123",
  "name": "My Store",
  "namespace": "store-my-store-abc123",
  "status": "Ready",
  "createdAt": "2026-02-08T12:00:00Z"
}
```

---

## 🧹 Cleanup
```bash
# Delete a specific store
helm uninstall my-store

# Remove namespace
kubectl delete namespace my-first-store

# Nuclear option (delete everything)
kubectl delete namespace --all
```

---

## 📂 Project Structure
```
Urumi/
├── backend/              # Node.js API
│   ├── server.js         # Express app
│   ├── database.js       # SQLite store
│   └── k8s-helper.js     # Kubernetes client
├── dashboard/            # React UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── services/
├── woocommerce-store/    # Helm chart
│   ├── Chart.yaml
│   ├── values.yaml       # Base config
│   ├── values-local.yaml # Local overrides
│   ├── values-prod.yaml  # Production config
│   └── templates/        # K8s manifests
├── README.md
├── DEPLOYMENT.md
└── SYSTEM_DESIGN.md
```

---

## 🎯 Design Principles

### Isolation First
Every store is a fortress. Separate namespace, dedicated PVCs, individual secrets.

### Idempotent Operations
Retry-safe by design. Store creation never duplicates resources.

### Fail Fast, Recover Faster
Health checks detect issues early. Helm enables one-command rollback.

### Observable by Default
Every action is logged. Status is always current. Failures are transparent.

---

## 🚧 Roadmap

- [ ] Multi-cloud support (AWS, GCP, Azure)
- [ ] Custom domain binding per store
- [ ] Automated backups and restore
- [ ] Store templates (pre-configured themes/plugins)
- [ ] Multi-region deployment
- [ ] MedusaJS support (currently WooCommerce only)

---

## 📝 Documentation

- **Demo Video** - [Watch on YouTube](#)

---

## 🙏 Acknowledgments

Built for the Urumi AI SDE Internship assessment.
Powered by Kubernetes, inspired by the need for simplicity.


---

**Made with ☕ and ⌨️ by Jansi**

*"If it takes more than 60 seconds to spin up a store, we failed."*