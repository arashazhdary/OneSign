# OneSign React SPA sample

Minimal Vite + React app using `@onesign/react-sdk`.

## Setup

```bash
cd sdk/react-sdk && npm install && npm run build
cd ../../samples/onesign-react-spa-sample
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 and register redirect URI `http://localhost:5173/callback` on your OneSign OAuth client.

See [docs/DEV-SANDBOX-QUICKSTART.md](../../docs/DEV-SANDBOX-QUICKSTART.md).
