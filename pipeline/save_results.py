from models.audio_results import AudioResults
from models.speakers import Speakers
import json


def save_diarization_results(flow_run_id, output_diarization, session):
    with open(output_diarization, 'r') as f:
            data = json.load(f)
            audio_results = session.query(AudioResults).filter(AudioResults.flow_run_id == flow_run_id).first()
            audio_results.transcript = data['transcript']
            session.add(audio_results)
            speakers = data['speakers']
            for speaker_id, speaker_data in speakers.items():
                new_speaker = Speakers(flow_run_id=flow_run_id, speaker_id=speaker_id, text=speaker_data['text'])
                session.add(new_speaker)
                
            session.commit()
            print("Transcript saved to database")
            
            
def save_rank_results(flow_run_id, output_rank, session):
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
        
def save_emotions_results(flow_run_id, output_emotions, session):
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
        

def save_summary_results(flow_run_id, output_summary, session):
    with open(output_summary, 'r') as f:
        data = json.load(f)
        audio_results = session.query(AudioResults).filter(AudioResults.flow_run_id == flow_run_id).first()
        audio_results.summary = data['summary']
        session.add(audio_results)
        session.commit()
        print("Summary saved to database")
