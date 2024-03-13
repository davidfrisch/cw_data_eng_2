export interface Pipeline {
  flow_run_id: string;
  status: string;
  audio_path: string;
  date_added: string;
  date_updated: string;
  vm_worker_id: string;
  conversation_rate: { speaker_id: string; conversation_rate: number }[];
}