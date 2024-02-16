""" TMPDIR=/mnt/data pip install --upgrade pyannote.audio git+https://github.com/davidfrisch/speechbox.git transformers prefect  --no-cache --cache-dir=/mnt/data/pip_cache """
""" TMPDIR=/mnt/data pip install -r requirements.txt --no-cache --cache-dir=/mnt/data/pip_cache """
import os 
os.environ['HF_HOME'] = '/mnt/data'

from diarization import diarization
from conv_emotions import process_emotions
from conv_rank import rank_conversations
from summary import generate_summary
from prefect import flow
from prefect.client import get_client
from constants import DATA_DIR

@flow(log_prints=True)
def pipeline(audio_file: str):

    if not os.path.exists(audio_file):
        raise ValueError(f"Audio file {audio_file} does not exist.")

    # # 1. Run diarization on each segment
    audio_filename = os.path.basename(audio_file).split('.')[0]
    output_folder = f"{DATA_DIR}/{audio_filename}_results"
    os.makedirs(output_folder, exist_ok=True)
    
    output_diarization = diarization(audio_file, output_folder)   
    
    # 2. Conversation Ranking
    output_rank = f"{output_folder}/output_rank.json"
    rank_conversations(output_diarization, output_rank)
    # 3. Emotion per speaker
    output_emotions = f"{output_folder}/output_emotions.json"
    process_emotions(output_rank, output_emotions)
    
    # 4. Summary
    output_summary = f"{output_folder}/output_summary.json"
    generate_summary(output_diarization, output_summary)
    
  
if __name__ == '__main__':
  pipeline(audio_file=f"{DATA_DIR}/wavs/0638.wav")