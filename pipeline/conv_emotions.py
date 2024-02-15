from transformers import pipeline
import json
from prefect import task

@task
def process_emotions(input_file, output_file):

  sentiment_pipeline = pipeline(
    "text-classification",
    model='bhadresh-savani/distilbert-base-uncased-emotion', 
    return_all_scores=True
  )

  speakers = {}
  with open(input_file, 'r') as f:
    speakers = json.loads(f.read())

  sorted_data = lambda y: sorted(y, key=lambda x: x["score"], reverse=True)

  for speaker_id in speakers:
    text = speakers[speaker_id]['text']
    batch_size = 511
    count = 0
    for i in range(0, len(text), batch_size):
      output = sentiment_pipeline(text[i:i+batch_size])
      if i == 0:
        speakers[speaker_id]['emotion'] = {}
        for item in output[0]:
          speakers[speaker_id]['emotion'][item['label']] = item['score']

      else:
        for item in output[0]:
          speakers[speaker_id]['emotion'][item['label']] += item['score']
          
      count += 1
      
    for item in speakers[speaker_id]['emotion']:
      speakers[speaker_id]['emotion'][item] = speakers[speaker_id]['emotion'][item] / count
      
  with open(output_file, 'w') as f:
    f.write(json.dumps(speakers, indent=2))
    
