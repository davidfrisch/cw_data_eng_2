from transformers import pipeline
import json
  
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
    output = sentiment_pipeline(text)
    speakers[speaker_id]['emotions'] = sorted_data(output[0])

  with open(output_file, 'w') as f:
    f.write(json.dumps(speakers, indent=2))
    
