const express = require('express');
const { createOnesignAuthMiddleware } = require('@onesign/sdk-node');

const app = express();
const port = process.env.PORT || 3100;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(
  '/api',
  createOnesignAuthMiddleware({
    authority: process.env.ONESIGN_AUTHORITY || 'https://localhost:5001',
    audience: process.env.ONESIGN_AUDIENCE || process.env.ONESIGN_CLIENT_ID || 'sample-api',
    signingKey:
      process.env.ONESIGN_SIGNING_KEY ||
      'your-secret-signing-key-change-in-production-min-32-chars',
  })
);

app.get('/api/me', (req, res) => {
  res.json({ user: req.user });
});

app.listen(port, () => {
  console.log(`Sample API listening on http://localhost:${port}`);
  console.log('Call GET /api/me with Authorization: Bearer <onesign-access-token>');
});
