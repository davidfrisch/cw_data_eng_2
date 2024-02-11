from transformers import pipeline


sentiment_pipeline = pipeline(
  "text-classification",
  model='bhadresh-savani/distilbert-base-uncased-emotion', 
  return_all_scores=True)


from transformers import pipeline
import json

json_file = ""

speakers = {}
with open("../data/conv_rank.json", 'r') as f:
  speakers = json.loads(f.read())

sorted_data = lambda y: sorted(y, key=lambda x: x["score"], reverse=True)

for speaker_id in speakers:
    text = speakers[speaker_id]['text']
    output = sentiment_pipeline(text)
    speakers[speaker_id]['emotions'] = sorted_data(output[0])[:3]


with open('../data/conv_emotions.json', 'w') as f:
    f.write(json.dumps(speakers))
  
