# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying OneSign Landing Page.

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Container registry access
- cert-manager (for TLS certificates)

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build image
docker build -t your-registry.com/onesign-landing:latest .

# Push to registry
docker push your-registry.com/onesign-landing:latest
```

### 2. Update Configuration

Edit `deployment.yaml` and update:
- Image name in Deployment
- Domain name in Ingress
- Environment variables in ConfigMap

### 3. Deploy

```bash
# Apply all manifests
kubectl apply -f deployment.yaml

# Check deployment status
kubectl get all -n onesign-landing

# Watch rollout
kubectl rollout status deployment/onesign-landing -n onesign-landing
```

## Components

### Namespace
- Isolates landing page resources

### ConfigMap
- Environment variables
- Configuration settings

### Deployment
- 3 replicas by default
- Health checks configured
- Resource limits set

### Service
- ClusterIP type
- Exposes port 80 internally

### Ingress
- NGINX ingress controller
- TLS termination
- cert-manager integration

### HorizontalPodAutoscaler
- Auto-scaling based on CPU/Memory
- Min: 2 replicas
- Max: 10 replicas

## Monitoring

### View Pods

```bash
kubectl get pods -n onesign-landing
```

### View Logs

```bash
# All pods
kubectl logs -l app=onesign-landing -n onesign-landing

# Specific pod
kubectl logs <pod-name> -n onesign-landing -f
```

### Check Health

```bash
# Port forward
kubectl port-forward svc/onesign-landing-service 3001:80 -n onesign-landing

# Check health
curl http://localhost:3001/api/health
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment onesign-landing --replicas=5 -n onesign-landing
```

### Auto-scaling (HPA)

Auto-scaling is enabled by default:
- Min replicas: 2
- Max replicas: 10
- Target CPU: 70%
- Target Memory: 80%

## Updates

### Rolling Update

```bash
# Update image
kubectl set image deployment/onesign-landing \
  landing=your-registry.com/onesign-landing:new-version \
  -n onesign-landing

# Watch rollout
kubectl rollout status deployment/onesign-landing -n onesign-landing
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/onesign-landing -n onesign-landing

# Rollback to specific revision
kubectl rollout undo deployment/onesign-landing --to-revision=2 -n onesign-landing
```

## Troubleshooting

### Pod not starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n onesign-landing

# Check events
kubectl get events -n onesign-landing --sort-by='.lastTimestamp'
```

### Service not accessible

```bash
# Check service
kubectl describe svc onesign-landing-service -n onesign-landing

# Check endpoints
kubectl get endpoints -n onesign-landing
```

### Ingress issues

```bash
# Check ingress
kubectl describe ingress onesign-landing-ingress -n onesign-landing

# Check ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

## Resource Management

### Current Resources

- Requests: 256Mi memory, 250m CPU
- Limits: 512Mi memory, 500m CPU

### Adjust Resources

Edit `deployment.yaml` and update the resources section:

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Security

- Non-root user in container
- Read-only root filesystem (optional)
- Network policies (recommended)
- Pod security policies

## Cleanup

```bash
# Delete all resources
kubectl delete -f deployment.yaml

# Or delete namespace
kubectl delete namespace onesign-landing
```
