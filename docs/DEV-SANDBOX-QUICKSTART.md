# Developer Sandbox & Sample Apps Quickstart

Use a **sandbox tenant** (`isSandbox: true`) for integration experiments without touching production customer data.

## 1. Start OneSign locally

See the root [README](../README.md#quick-start). Default API:

- HTTPS: `https://localhost:7001`
- Swagger: `https://localhost:7001/swagger`

## 2. Create a sandbox tenant

```bash
curl -X POST https://localhost:7001/api/admin/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Dev Sandbox","slug":"dev-sandbox","isSandbox":true}'
```

Or with CLI (after login):

```bash
onesign tenants create  # if your CLI maps slug — or use API/Postman
```

## 3. Register an OAuth client

Use Admin portal or Applications API, then export config:

```bash
onesign config export -o ./my-app
```

## 4. Run sample apps

| Stack | Path | Purpose |
|-------|------|---------|
| **ASP.NET Core API** | [`samples/Onesign.Sdk.AspNetCore.Sample`](../samples/Onesign.Sdk.AspNetCore.Sample) | JWT validation with `Onesign.Sdk.AspNetCore` |
| **React SPA** | [`samples/onesign-react-spa-sample`](../samples/onesign-react-spa-sample) | OIDC login with `@onesign/react-sdk` |
| **Node.js Express** | [`samples/onesign-node-express-sample`](../samples/onesign-node-express-sample) | Bearer middleware with `@onesign/sdk-node` |

## 5. API exploration

- **Postman:** import [`docs/postman/OneSign.postman_collection.json`](postman/OneSign.postman_collection.json)
- **OpenAPI:** `GET /swagger/v1/swagger.json` or Swagger UI in Development

## SDK reference

| Package | Doc |
|---------|-----|
| `Onesign.Sdk.AspNetCore` | [`src/Onesign.Sdk.AspNetCore/README.md`](../src/Onesign.Sdk.AspNetCore/README.md) |
| `@onesign/sdk-node` | [`sdk/node-sdk/README.md`](../sdk/node-sdk/README.md) |
| `@onesign/react-sdk` | [`sdk/react-sdk/README.md`](../sdk/react-sdk/README.md) |
| `onesign` CLI | [`src/Onesign.Cli/README.md`](../src/Onesign.Cli/README.md) |
