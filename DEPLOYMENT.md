\# Deployment Guide



\## Local Development (Docker Desktop)



\### Prerequisites

\- Docker Desktop with Kubernetes enabled

\- Helm installed

\- kubectl configured



\### Deploy a Store Locally

```bash

\# Deploy with local configuration

helm install my-store ./woocommerce-store -f ./woocommerce-store/values-local.yaml



\# Access the store

kubectl port-forward svc/wordpress 8080:80 -n my-first-store



\# Open: http://localhost:8080

```



\### Delete Store

```bash

helm uninstall my-store

```



---



\## Production Deployment (VPS with k3s)



\### Prerequisites

\- VPS with k3s installed

\- Domain name pointed to VPS IP

\- kubectl configured to connect to k3s



\### One-Time Setup



1\. \*\*Install cert-manager\*\* (for automatic HTTPS):

```bash

kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

```



2\. \*\*Create Let's Encrypt ClusterIssuer\*\*:

```bash

cat <<EOF | kubectl apply -f -

apiVersion: cert-manager.io/v1

kind: ClusterIssuer

metadata:

&nbsp; name: letsencrypt-prod

spec:

&nbsp; acme:

&nbsp;   server: https://acme-v02.api.letsencrypt.org/directory

&nbsp;   email: your-email@example.com

&nbsp;   privateKeySecretRef:

&nbsp;     name: letsencrypt-prod

&nbsp;   solvers:

&nbsp;   - http01:

&nbsp;       ingress:

&nbsp;         class: traefik

EOF

```



\### Deploy a Store to Production



1\. \*\*Edit production values\*\*:

```bash

\# Update values-prod.yaml with:

\# - Your domain name

\# - Strong passwords

\# - Your email for Let's Encrypt

```



2\. \*\*Deploy\*\*:

```bash

helm install my-store ./woocommerce-store -f ./woocommerce-store/values-prod.yaml

```



3\. \*\*Verify\*\*:

```bash

\# Check pods

kubectl get pods -n my-first-store



\# Check ingress

kubectl get ingress -n my-first-store



\# Check certificate

kubectl get certificate -n my-first-store

```



4\. \*\*Access\*\*:

```

https://store.yourdomain.com

```



---



\## Key Differences: Local vs Production



| Aspect | Local | Production |

|--------|-------|------------|

| \*\*Access Method\*\* | kubectl port-forward | Ingress with domain |

| \*\*HTTPS\*\* | No (HTTP only) | Yes (Let's Encrypt) |

| \*\*Storage Class\*\* | Default (hostPath) | local-path (k3s) |

| \*\*Resources\*\* | Lower (256Mi RAM) | Higher (1Gi RAM) |

| \*\*Passwords\*\* | Simple (dev) | Strong (prod) |

| \*\*Service Type\*\* | LoadBalancer | ClusterIP |



---



\## Upgrading a Store

```bash

\# Local

helm upgrade my-store ./woocommerce-store -f ./woocommerce-store/values-local.yaml



\# Production

helm upgrade my-store ./woocommerce-store -f ./woocommerce-store/values-prod.yaml

```



\## Rollback

```bash

\# Rollback to previous version

helm rollback my-store



\# Rollback to specific revision

helm rollback my-store 2

```



\## Backup Strategy



\### Local

\- Database stored in PVC (survives pod restarts)

\- Manual backup: Export database from WordPress admin



\### Production

\- Use automated backup tools

\- Backup PVCs regularly

\- Export database daily

