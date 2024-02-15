""" TMPDIR=/mnt/data pip install --upgrade pyannote.audio git+https://github.com/davidfrisch/speechbox.git transformers prefect  --no-cache --cache-dir=/mnt/data/pip_cache """
""" TMPDIR=/mnt/data pip install -r requirements.txt --no-cache --cache-dir=/mnt/data/pip_cache """
import os 
os.environ['HF_HOME'] = '/mnt/data'
from diarization import diarization
from conv_emotions import process_emotions
from conv_rank import rank_conversations
from summary import generate_summary
from prefect import flow

@flow(log_prints=True)
def pipeline(audio_file: str):
    # 1. diarization
    output_diarization = "/data/output_1.json"
    diarization(audio_file, output_diarization)
    # 2. Conversation Ranking
    output_rank = "/data/output_2.json"
    rank_conversations(output_diarization, output_rank)
    # 3. Emotion per speaker
    output_emotions = "/data/output_3.json"
    process_emotions(output_rank, output_emotions)
    # 4. Summary
    output_summary = "/data/output_4.json"
    generate_summary(output_diarization, output_summary)
    
    return output_summary
  
