\# System Design \& Architecture



\## Overview



Store provisioning platform using Kubernetes for orchestration, Helm for deployment automation, and a REST API for management.



\## Architecture Diagram

```

┌─────────────┐

│   User      │

└──────┬──────┘

&nbsp;      │

&nbsp;      ▼

┌─────────────────────────────┐

│  React Dashboard (5173)     │

│  - Store management UI      │

│  - Real-time status         │

└──────────┬──────────────────┘

&nbsp;          │ HTTP/REST

&nbsp;          ▼

┌─────────────────────────────┐

│  Backend API (3001)         │

│  - Express.js               │

│  - SQLite metadata          │

│  - Kubernetes client        │

└──────────┬──────────────────┘

&nbsp;          │ K8s API

&nbsp;          ▼

┌─────────────────────────────┐

│  Kubernetes Cluster         │

│  ┌─────────────────────┐   │

│  │  Namespace: store-1 │   │

│  │  - WordPress        │   │

│  │  - MySQL           │   │

│  │  - PVCs            │   │

│  └─────────────────────┘   │

│  ┌─────────────────────┐   │

│  │  Namespace: store-2 │   │

│  │  - WordPress        │   │

│  │  - MySQL           │   │

│  │  - PVCs            │   │

│  └─────────────────────┘   │

└─────────────────────────────┘

```



\## Component Responsibilities



\### Backend API

\- Receives store creation requests

\- Generates unique namespaces

\- Executes Helm commands

\- Tracks store metadata

\- Monitors pod status



\### Dashboard

\- User interface

\- API communication

\- Status visualization

\- CRUD operations



\### Helm Charts

\- Template Kubernetes resources

\- Parameterize configurations

\- Manage deployments

\- Handle upgrades/rollbacks



\### Kubernetes

\- Run workloads

\- Isolate stores

\- Persist data

\- Route traffic



\## Data Flow: Create Store



1\. User clicks "Create Store" in dashboard

2\. Dashboard sends POST to `/api/stores`

3\. Backend generates unique ID and namespace

4\. Backend saves metadata to SQLite

5\. Backend executes `helm install`

6\. Helm creates Kubernetes resources

7\. Kubernetes provisions pods and volumes

8\. Backend monitors pod status

9\. Dashboard polls for updates

10\. User sees "Ready" status



\## Isolation Strategy



\- Each store runs in its own namespace

\- Separate PVCs for MySQL and WordPress

\- Individual secrets per store

\- Resource quotas prevent overuse

\- Network policies can restrict traffic



\## Idempotency



\- Store creation generates unique IDs

\- Helm manages resource state

\- Database prevents duplicates

\- Retry-safe operations



\## Failure Handling



\- Pod health checks detect failures

\- API tracks provisioning status

\- Failed deployments show in dashboard

\- Helm rollback for bad upgrades

\- Namespace deletion cleans all resources



\## Scaling Plan



\### Horizontal Scaling

\- API: Run multiple instances behind load balancer

\- Dashboard: Serve static files via CDN

\- Stores: Independent, scale by adding more



\### Vertical Scaling

\- Increase pod resource limits

\- Larger PVC sizes for stores

\- More powerful nodes



\### Constraints

\- MySQL is stateful (one replica)

\- PVCs are ReadWriteOnce

\- Namespace limit per cluster



\## Abuse Prevention



\- Rate limiting on API endpoints

\- Maximum stores per user (configurable)

\- Resource quotas per namespace

\- Timeout for provisioning

\- Audit logging of actions



\## Production Considerations



\### DNS \& Ingress

\- Use Ingress for domain routing

\- cert-manager for automatic TLS

\- Wildcard DNS for store subdomains



\### Storage

\- Use network-attached storage

\- Regular PVC backups

\- Database replication for HA



\### Secrets

\- External secret management (Vault)

\- Rotate credentials regularly

\- Encrypt at rest



\### Monitoring

\- Prometheus for metrics

\- Grafana dashboards

\- AlertManager for failures



\### Backup

\- Automated database exports

\- PVC snapshots

\- Disaster recovery plan



\## Upgrade Strategy



\- Rolling updates for WordPress

\- Blue-green for API changes

\- Helm revisions for rollback

\- Database migration scripts



\## Security



\- RBAC for API service account

\- Network policies for isolation

\- Non-root containers

\- Security contexts

\- Secret scanning in CI/CD



\## Cost Optimization



\- Resource limits prevent waste

\- Autoscaling for API

\- Spot instances for dev

\- Reserved instances for prod



\## Trade-offs



\### Helm vs Operators

\- Chose Helm: Simpler, widely adopted

\- Operators: More powerful but complex



\### SQLite vs PostgreSQL

\- Chose SQLite: Simple for metadata

\- PostgreSQL: Better for multi-user



\### LoadBalancer vs Ingress

\- Local: LoadBalancer (Docker Desktop)

\- Production: Ingress (cost-effective)



\### Namespace vs Multi-tenancy

\- Chose namespace-per-store: Strong isolation

\- Shared namespace: More efficient but risky

