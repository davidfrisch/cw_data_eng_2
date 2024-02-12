from speechbox import ASRDiarizationPipeline
from transformers import pipeline
from pyannote.audio import Pipeline
import json
from dotenv import load_dotenv
load_dotenv('../.env')
import os
def diarization(input_audio, output_file):
  diarization_pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    use_auth_token=os.getenv("HF_TOKEN")
  )

  asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-base",
  )

  final_pipeline = ASRDiarizationPipeline(
    asr_pipeline=asr_pipeline, diarization_pipeline=diarization_pipeline
  )
  final_pipeline.embedding_batch_size=1
  final_pipeline.segmentation_batch_size=1

  outputs = final_pipeline(input_audio)
  
  all_text = ""
  for item in outputs:
    all_text += item['text'] + " "
    
  results = {
    "transcript": all_text,
    "diarization": outputs
  }

  with open(output_file, 'w') as f:
    f.write(json.dumps(results, indent=2))