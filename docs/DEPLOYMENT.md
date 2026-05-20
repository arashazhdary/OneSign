# OneSign — Deployment Guide

## Options

| Method | Path | Use case |
|--------|------|----------|
| **Helm** | [`deploy/helm/onesign/`](../deploy/helm/onesign/) | Kubernetes production / staging |
| **Docker Compose** | (add locally) | Single-node dev |
| **Landing only** | [`onesign-landing/k8s/`](../onesign-landing/k8s/) | Marketing site |

## Helm quick start

```bash
# Build images (example tags)
docker build -t onesign/api:latest -f src/Onesign.Api/Dockerfile .
docker build -t onesign/admin:latest -f onesign-admin-portal-react/Dockerfile onesign-admin-portal-react
docker build -t onesign/login:latest -f onesign-login-portal/Dockerfile onesign-login-portal

# Install chart
helm upgrade --install onesign deploy/helm/onesign \
  -n onesign --create-namespace \
  -f deploy/helm/onesign/values.yaml \
  --set secrets.sqlPassword='<strong-password>' \
  --set secrets.jwtSecret='<long-random-secret>' \
  --set secrets.emailSendGridApiKey='<optional>'
```

## Stack components

- **onesign-api** — ASP.NET Core API (port 8080 in cluster)
- **onesign-admin** — Admin Portal static/nginx
- **onesign-login** — Login Portal (Next.js)
- **sqlserver** — optional subchart disabled by default; set `sqlServer.enabled=true` for demo only

## Configuration

Key values in `values.yaml`:

| Value | Description |
|-------|-------------|
| `api.image.repository` | API container image |
| `ingress.hosts` | Public hostnames |
| `config.emailProvider` | `Smtp`, `SendGrid`, or `Null` |
| `secrets.*` | DB password, JWT secret, SMTP/SendGrid keys |

## Health & readiness

- API: `GET /health/live`, `GET /health/ready` (includes database + email checks)
- Platform: `GET /api/global/platform/health` (authenticated global admin)

## Post-deploy

1. Run EF migrations (API startup or `dotnet ef database update`).
2. Create initial global admin and tenant.
3. Register OAuth clients for Admin / Login portals.
4. Verify email: see [EMAIL-PRODUCTION.md](EMAIL-PRODUCTION.md).

## References

- [Phase 21 — On-Prem / Hybrid Deployment](../Phases/Phase21-Onesign-OnPrem-Hybrid-DeploymentKit.md)
- [DEV-SANDBOX-QUICKSTART.md](DEV-SANDBOX-QUICKSTART.md)
