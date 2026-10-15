/// <reference types="vite/client" />
declare module 'sweetalert2/dist/sweetalert2.all.js';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
