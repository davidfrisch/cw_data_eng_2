import fs from 'fs';
import { NEW_AUDIO_DIR, PIPELINES_AUDIO_DIR } from './constants';

export function createPipelineDirectories() {
  if (!fs.existsSync(NEW_AUDIO_DIR)) {
    fs.mkdirSync(NEW_AUDIO_DIR, { recursive: true });
    console.log('Directory created:', NEW_AUDIO_DIR);
  }

  if (!fs.existsSync(PIPELINES_AUDIO_DIR)) {
    fs.mkdirSync(PIPELINES_AUDIO_DIR, { recursive: true });
    console.log('Directory created:', PIPELINES_AUDIO_DIR);
  }

}