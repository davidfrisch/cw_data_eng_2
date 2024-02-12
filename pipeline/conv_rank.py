from transformers import pipeline
import json

def rank_conversations(input_file, output_file):
  json_data = {}
  with open(input_file, 'r') as f:
    json_data = json.loads(f.read())

  speakers = {}
  for item in json_data['diarization']:
    speaker_id = item['speaker']
    if speaker_id not in speakers:
      speakers[speaker_id] = {'text': "", "rank" : ""}
    
    speakers[speaker_id]['text'] += item['text']

  rank_pipeline = pipeline("text-classification", model="nlptown/bert-base-multilingual-uncased-sentiment")
  
  for speaker_id in speakers:
    text = speakers[speaker_id]['text']
    output = rank_pipeline(text)
    speakers[speaker_id]['rank'] = output[0]


  with open(output_file, 'w') as f:
    f.write(json.dumps(speakers, indent=2))
