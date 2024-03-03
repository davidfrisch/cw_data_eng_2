""" TMPDIR=/mnt/data pip install -r requirements.txt --no-cache --cache-dir=/mnt/data/pip_cache """
import os 
import json
import sys
os.environ['HF_HOME'] = '/mnt/data'

from diarization import diarization
from conv_emotions import process_emotions
from conv_rank import rank_conversations
from summary import generate_summary
from prefect import flow
from prefect.client import get_client
from constants import DATA_DIR
from prefect_utils import get_flow_run_id
from db import create_session
from save_results import save_diarization_results, save_rank_results, save_emotions_results, save_summary_results
from models.audio_results import AudioResults


@flow(log_prints=True)
def pipeline(audio_path: str, keep_output_folder: bool = True):
    session = create_session()
    flow_run_id = get_flow_run_id()
    
    vm_worker_id = os.environ.get('HOSTNAME')
    update_audio_results = session.query(AudioResults).filter(AudioResults.flow_run_id == flow_run_id).first()
    if not update_audio_results:
        new_audio_results = AudioResults(flow_run_id=flow_run_id, audio_path=audio_path, vm_worker_id=vm_worker_id)
        session.add(new_audio_results)
    else:
        update_audio_results.audio_path = audio_path
        update_audio_results.vm_worker_id = vm_worker_id
        session.add(update_audio_results)

    session.commit()

    if not os.path.exists(audio_path):
        raise ValueError(f"Audio file {audio_path} does not exist.")

    # # 1. Run diarization on each segment
    audio_pathname = os.path.basename(audio_path).split('.')[0]
    output_folder = f"{DATA_DIR}/{audio_pathname}_results"
    os.makedirs(output_folder, exist_ok=True)
    
    output_diarization = diarization(audio_path, output_folder)
    save_diarization_results(flow_run_id, output_diarization, session)
 
    
    # 2. Conversation Ranking
    output_rank = f"{output_folder}/output_rank.json"
    rank_conversations(output_diarization, output_rank)
    save_rank_results(flow_run_id, output_rank, session)
  
    
    # 3. Emotion per speaker
    output_emotions = f"{output_folder}/output_emotions.json"
    process_emotions(output_rank, output_emotions)
    save_emotions_results(flow_run_id, output_emotions, session) 
   
    
    # 4. Summary
    output_summary = f"{output_folder}/output_summary.json"
    generate_summary(output_diarization, output_summary)
    save_summary_results(flow_run_id, output_summary, session)
    
    session.close()
    if not keep_output_folder:
        os.system(f"rm -rf {output_folder}")
  
if __name__ == '__main__':
  if len(sys.argv) > 2 and sys.argv[1] == '--local':
    path = sys.argv[2]
    pipeline(audio_path=path)
  else:
    pipeline.serve(name='pipeline-voice-analysis')
  
  
  