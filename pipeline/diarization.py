from speechbox import ASRDiarizationPipeline
from transformers import pipeline
from pyannote.audio import Pipeline
import json
from dotenv import load_dotenv
load_dotenv('../.env')
import os
from prefect import flow, task
import asyncio
from typing import List
from cut_audio import cut_audio
from pyannote.audio import Pipeline

@task(log_prints=True)
def child_diarization(input_audio, output_file):
  diarization_pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.0",
    use_auth_token=os.getenv("HF_TOKEN")
  )
  
  asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-base",
  )
  
  if not diarization_pipeline or not asr_pipeline:
    raise ValueError("Error loading diarization or asr pipeline")

  final_pipeline = ASRDiarizationPipeline(
    asr_pipeline=asr_pipeline, diarization_pipeline=diarization_pipeline
  )
  
  final_pipeline.embedding_batch_size=0.5
  final_pipeline.segmentation_batch_size=0.5

  print(f"Processing {input_audio}")
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


@task(log_prints=True)  
def assemble_diarization_results(output_files):
  speakers = {}
  output = {'transcript': ''}
  for file in output_files:
    with open(file, 'r') as f:
      data = json.load(f)
      output['transcript'] += data['transcript'] + " "
      for item in data['diarization']:
        speaker = item['speaker']
        if speaker not in speakers:
          speakers[speaker] = {}
          speakers[speaker]['text'] = ""
        
        speakers[speaker]["text"] += item['text']
      
  
  output['speakers'] = speakers
        
  merge_filename = output_files[0].split('/')[-1].split('_')[1].split('.')[0]
  merge_path = os.path.join(os.path.dirname(output_files[0]), f"{merge_filename}.json")

  with open(merge_path, 'w') as f:
    f.write(json.dumps(output, indent=2))
    
  return merge_path
    
 
@flow(log_prints=True)
def diarization(audio_file: str, output_folder: str, split_duration: int= 5):

  audio_splitted_filenames = cut_audio(audio_file, output_folder, split_duration)

  # run in parallel the diarization on each segment
  output_files = []
  for file_path in audio_splitted_filenames:
    filename = os.path.basename(file_path).split('.')[0]
    output_diarization = f"{output_folder}/{filename}.json"
    child_diarization(f"{output_folder}/{file_path}", output_diarization)
    output_files.append(output_diarization)
    
  return assemble_diarization_results(output_files)
  
  
      
  

