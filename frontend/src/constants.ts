export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const PREFECT_UI_URL = import.meta.env.VITE_PREFECT_UI_URL;
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
export const NEW_AUDIO_FOLDER_NAME = `new_audios`;

if (!BACKEND_URL) {
  throw new Error("BACKEND_URL is not set");
}

if (!PREFECT_UI_URL) {
  throw new Error("PREFECT_UI_URL is not set");
}

if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not set");
}