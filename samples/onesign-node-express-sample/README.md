# OneSign Node Express sample

```bash
cd sdk/node-sdk && npm install && npm run build
cd ../../samples/onesign-node-express-sample && npm install
ONESIGN_AUTHORITY=https://localhost:5001 ONESIGN_SIGNING_KEY=your-key npm start
```

Request:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3100/api/me
```
