import dotenv from 'dotenv';
dotenv.config();

export const SHARE_DIR = process.env.SHARE_DIR;

if (!SHARE_DIR) {
  throw new Error("SHARE_DIR is not set");
}