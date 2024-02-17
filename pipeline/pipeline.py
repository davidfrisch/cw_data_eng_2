""" TMPDIR=/mnt/data pip install --upgrade pyannote.audio git+https://github.com/davidfrisch/speechbox.git transformers prefect  --no-cache --cache-dir=/mnt/data/pip_cache """
""" TMPDIR=/mnt/data pip install -r requirements.txt --no-cache --cache-dir=/mnt/data/pip_cache """
import os 
import json
os.environ['HF_HOME'] = '/mnt/data'

from diarization import diarization
from conv_emotions import process_emotions
from conv_rank import rank_conversations
from summary import generate_summary
from prefect import flow
from prefect.client import get_client
from constants import DATA_DIR
from models.audio_results import AudioResults
from models.speakers import Speakers
from prefect import runtime
from db import create_session

def get_flow_run_id():
    return runtime.flow_run.id


@flow(log_prints=True)
def pipeline(audio_path: str):
    session = create_session()
    flow_run_id = get_flow_run_id()
    
    new_audio_results = AudioResults(flow_run_id=flow_run_id, audio_path=audio_path, vm_worker_id='1')
    session.add(new_audio_results)
    session.commit()

    if not os.path.exists(audio_path):
        raise ValueError(f"Audio file {audio_path} does not exist.")

    # # 1. Run diarization on each segment
    audio_pathname = os.path.basename(audio_path).split('.')[0]
    output_folder = f"{DATA_DIR}/{audio_pathname}_results"
    os.makedirs(output_folder, exist_ok=True)
    
    output_diarization = diarization(audio_path, output_folder)
    
    with open(output_diarization, 'r') as f:
        data = json.load(f)
        new_audio_results.transcript = data['transcript']
        speakers = data['speakers']
        for speaker_id, speaker_data in speakers.items():
            new_speaker = Speakers(flow_run_id=flow_run_id, speaker_id=speaker_id, text=speaker_data['text'])
            session.add(new_speaker)
            
        session.commit()
        print("Transcript saved to database")
    
    # 2. Conversation Ranking
    output_rank = f"{output_folder}/output_rank.json"
    rank_conversations(output_diarization, output_rank)
    
    
    with open(output_rank, 'r') as f:
        data = json.load(f)
        speakers = data['speakers']
        for speaker_id, speaker_data in speakers.items():
            rank = speaker_data['rank']['score']
            speaker = session.query(Speakers).filter(Speakers.flow_run_id == flow_run_id, Speakers.speaker_id == speaker_id).first()
            speaker.conversation_rate = rank
            session.add(speaker)
            
        session.commit()
            
        print("Conversation rate saved to database")
    
    # 3. Emotion per speaker
    output_emotions = f"{output_folder}/output_emotions.json"
    process_emotions(output_rank, output_emotions)
    
    with open(output_emotions, 'r') as f:
        data = json.load(f)
        speakers = data['speakers']
        for speaker_id, speaker_data in speakers.items():
            emotions = speaker_data['emotions']
            for emotion, score in emotions.items():
                speaker = session.query(Speakers).filter(Speakers.flow_run_id == flow_run_id, Speakers.speaker_id == speaker_id).first()
                speaker.add_emotion(emotion, score)
                session.add(speaker)
            
        session.commit()
            
        print("Emotions saved to database")
    
    # 4. Summary
    output_summary = f"{output_folder}/output_summary.json"
    generate_summary(output_diarization, output_summary)
    
    with open(output_summary, 'r') as f:
        data = json.load(f)
        new_audio_results.summary = data['summary']
        session.add(new_audio_results)
        session.commit()
        print("Summary saved to database")
    
    session.close()
    
  
if __name__ == '__main__':
  pipeline(audio_path=f"{DATA_DIR}/wavs/0638.wav")