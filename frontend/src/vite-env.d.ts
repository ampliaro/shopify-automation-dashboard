/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_ADMIN_TOKEN?: string
  readonly MODE?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

