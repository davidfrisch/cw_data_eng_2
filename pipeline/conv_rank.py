from transformers import pipeline
import json
from prefect import task

@task
def rank_conversations(input_file, output_file):
  speakers = {}
  data = None
  with open(input_file, 'r') as f:
    data = json.loads(f.read())
    speakers = data['speakers']


  for speaker_id in speakers:
    speakers[speaker_id]["rank"] = {}

  rank_pipeline = pipeline("text-classification", model="nlptown/bert-base-multilingual-uncased-sentiment")
  
  for speaker_id in speakers:
    text = speakers[speaker_id]['text']
    count = 0
    for i in range(0, len(text), 511):
      output = rank_pipeline(text[i:i+511])
      if i == 0:
        label = int(output[0]['label'].split(' ')[0])
        speakers[speaker_id]['rank'] = {}
        speakers[speaker_id]['rank']['score'] = label
        
      else:
        speakers[speaker_id]['rank']['score'] += int(output[0]['label'].split(' ')[0])
        
      
      count += 1
    
    # Average the rank
    speakers[speaker_id]['rank']['score'] = speakers[speaker_id]['rank']['score'] / count
    data['speakers'] = speakers

  with open(output_file, 'w') as f:
    f.write(json.dumps(data, indent=2))
