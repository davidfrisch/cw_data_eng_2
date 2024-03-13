import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

export const SHARE_DIR = process.env.SHARE_DIR;

if (!SHARE_DIR) {
  throw new Error("SHARE_DIR is not set");
}

export const NEW_AUDIO_DIR = `${SHARE_DIR}/new_audios`;
export const PIPELINES_AUDIO_DIR = `${SHARE_DIR}/pipelines_audios`;
