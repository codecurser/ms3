/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QUESTION_API_BASE?: string;
  readonly VITE_EXAM_API_BASE?: string;
  readonly VITE_AUTH_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

