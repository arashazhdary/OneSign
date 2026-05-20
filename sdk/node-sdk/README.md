# @onesign/sdk-node

Node.js SDK for validating OneSign JWT access tokens in Express (and other frameworks).

## Install

```bash
npm install @onesign/sdk-node express
```

## Configuration

| Option | Description |
|--------|-------------|
| `authority` | OneSign base URL (issuer) |
| `audience` / `clientId` | Expected JWT audience |
| `signingKey` | HS256 key (matches OneSign `Jwt:SigningKey` while JWKS is empty) |

## Express middleware

```javascript
const express = require('express');
const { createOnesignAuthMiddleware } = require('@onesign/sdk-node');

const app = express();

app.use(
  createOnesignAuthMiddleware({
    authority: process.env.ONESIGN_AUTHORITY,
    audience: process.env.ONESIGN_CLIENT_ID,
    signingKey: process.env.ONESIGN_SIGNING_KEY,
  })
);

app.get('/api/me', (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000);
```

## OIDC helpers

```typescript
import { discoverOpenIdConfig, getJwks, validateOnesignToken } from '@onesign/sdk-node';

const config = await discoverOpenIdConfig('https://login.example.com');
const jwks = await getJwks('https://login.example.com');
const user = await validateOnesignToken(accessToken, { authority: '...', signingKey: '...' });
```

Both helpers cache responses for 1 hour.

## Build

```bash
cd sdk/node-sdk
npm install
npm run build
npm test
```

## Sample

See `samples/onesign-node-express-sample`.
