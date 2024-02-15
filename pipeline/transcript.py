from transformers import pipeline
import json
from prefect import task

@task
def transcribe_audio(audio_file, output_file):
  asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-base",
  )

  outputs = asr_pipeline(audio_file)

  with open(output_file, 'w') as f:
    f.write(json.dumps(outputs))

