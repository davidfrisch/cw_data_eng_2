import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

export const SHARE_DIR = process.env.SHARE_DIR;
const PREFECT_API_URL_ENV = process.env.PREFECT_API_URL;

if (!SHARE_DIR) {
  throw new Error("SHARE_DIR is not set");
}

if(!PREFECT_API_URL_ENV) {
  throw new Error("PREFECT_API_URL is not set");
}

export const NEW_AUDIO_DIR = `${SHARE_DIR}/new_audios`;
export const PIPELINES_AUDIO_DIR = `${SHARE_DIR}/pipelines_audios`;
export const PREFECT_API_URL = PREFECT_API_URL_ENV;