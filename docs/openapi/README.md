# OpenAPI & Postman

## Live Swagger UI

When the API is running (Development or any env with Swagger enabled):

- Swagger UI: `https://localhost:7001/swagger` (or your API base URL + `/swagger`)
- OpenAPI JSON: `https://localhost:7001/swagger/v1/swagger.json`

## Export OpenAPI to this folder

```bash
./scripts/export-openapi.sh https://localhost:7001
```

Writes `docs/openapi/onesign-v1.json`.

## Postman

Import [`docs/postman/OneSign.postman_collection.json`](../postman/OneSign.postman_collection.json).

Set collection variables:

| Variable | Example |
|----------|---------|
| `baseUrl` | `https://localhost:7000` |
| `tenantId` | your sandbox tenant GUID |
| `accessToken` | bearer token after login |

Version Postman exports when you ship breaking API changes.
