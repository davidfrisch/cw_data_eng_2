from transformers import pipeline
import json

asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-base",
)

outputs = asr_pipeline("../data/audio_example.mp3")

with open('../data/transcript.json', 'w') as f:
    f.write(json.dumps(outputs))