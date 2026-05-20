/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ONESIGN_BASE_URL?: string;
  readonly VITE_ONESIGN_CLIENT_ID?: string;
  readonly VITE_ONESIGN_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
