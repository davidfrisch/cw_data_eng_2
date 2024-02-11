from transformers import pipeline
import json

json_file = ""
with open("../data/diarization_results.json", 'r') as f:
  json_file = json.loads(f.read())


speakers = {}
for item in json_file:
    speaker_id = item['speaker']
    if speaker_id not in speakers:
        speakers[speaker_id] = {'text': "", "rank" : ""}
        
    speakers[speaker_id]['text'] += item['text']


rank_pipeline = pipeline("text-classification", model="nlptown/bert-base-multilingual-uncased-sentiment")
for speaker_id in speakers:
    text = speakers[speaker_id]['text']
    output = rank_pipeline(text)
    speakers[speaker_id]['rank'] = output[0]


with open('../data/conv_rank.json', 'w') as f:
    f.write(json.dumps(speakers))
  
