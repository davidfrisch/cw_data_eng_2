""" TMPDIR=/mnt/data pip install --upgrade pyannote.audio git+https://github.com/davidfrisch/speechbox.git transformers  --no-cache --cache-dir=/mnt/data/pip_cache """
from pyannote.audio import Pipeline
from speechbox import ASRDiarizationPipeline
from transformers import pipeline
import torch
import os
from collections import defaultdict
from dotenv import load_dotenv
load_dotenv()
os.environ['HF_HOME'] = '/mnt/data'
HF_TOKEN = os.getenv("HF_TOKEN")
diarization_pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization@2.1",
    use_auth_token=HF_TOKEN)

asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-base",
)

diarization_pipeline.to(torch.device("cpu"))
# max memory for diarization model
diarization_pipeline.to

final_pipeline = ASRDiarizationPipeline(
    asr_pipeline=asr_pipeline, diarization_pipeline=diarization_pipeline
)
final_pipeline.embedding_batch_size=1

def tuple_to_string(start_end_tuple, ndigits=1):
    return str((round(start_end_tuple[0], ndigits), round(start_end_tuple[1], ndigits)))


def format_as_transcription(raw_segments):
    return "\n\n".join(
        [
            chunk["speaker"] + " " + tuple_to_string(chunk["timestamp"]) + chunk["text"]
            for chunk in raw_segments
        ]
    )

print("Running pipeline")
outputs = final_pipeline('./data/audio_example.mp3')

speakers = {}
for item in outputs:
    speaker_id = item['speaker']
    if speaker_id not in speakers:
        speakers[speaker_id] = {'timestamp': [], 'text': []}

    speakers[speaker_id]['timestamp'].append(item['timestamp'])
    speakers[speaker_id]['text'].append(item['text'])

sentiment_pipeline = pipeline("text-classification",model='bhadresh-savani/distilbert-base-uncased-emotion', return_all_scores=True)
for speaker in speakers:
    print(speakers[speaker]['text'])
    results = sentiment_pipeline(speakers[speaker]['text'])
    max_score_entry = [max(emotion_scores, key=lambda x: x['score']) for emotion_scores in results]

    label_sum_count = defaultdict(lambda: {'sum': 0, 'count': 0})
    # https://djajafer.medium.com/transcribe-and-summarize-the-meeting-minutes-with-openai-whisper-and-langchain-62e6f227edc0
    # Calculate the sum and count for each label
    for entry in max_score_entry:
        label = entry['label']
        score = entry['score']
        label_sum_count[label]['sum'] += score
        label_sum_count[label]['count'] += 1

    # Calculate the average for each label
    label_averages = {label: label_sum_count[label]['sum'] / label_sum_count[label]['count'] for label in label_sum_count}

    # Print the results
    for label, average in label_averages.items():
        print(f'The average score for "{label}" is {average:.4f}.')

rank_pipeline = pipeline("text-classification", model="nlptown/bert-base-multilingual-uncased-sentiment")
for speaker in speakers:
    print(speakers[speaker]['text'])
    results = rank_pipeline(speakers[speaker]['text'], return_all_scores=True)
    print(results)

summary_pipeline = pipeline("summarization")  
big_string = ' '.join(item['text'] for item in outputs)
result_summary = summary_pipeline(big_string)
result_summary[0]['summary_text']