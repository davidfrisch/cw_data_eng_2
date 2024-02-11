from transformers import pipeline
import json

transcript = ""
with open('../data/transcript.json', 'r') as f:
    json_data = json.loads(f.read())
    transcript = json_data['text']


summary_pipeline = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
summary_pipeline.d_model=1024
result_summary = summary_pipeline(transcript[:1000])
print(result_summary)

