/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_PEERJS_HOST: string;
  readonly VITE_PEERJS_PORT: string;
  readonly VITE_PEERJS_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
