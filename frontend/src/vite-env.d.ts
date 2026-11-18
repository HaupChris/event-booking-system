/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly REACT_APP_API_BASE_URL?: string;
  readonly REACT_APP_API_URL?: string;
  readonly REACT_APP_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
