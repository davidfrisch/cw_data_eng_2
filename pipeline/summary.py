from transformers import pipeline
import json
from prefect import task

@task
def generate_summary(input_file, output_file):
  transcript = ""
  with open(input_file, 'r') as f:
    json_data = json.loads(f.read())
    transcript = json_data['transcript']

  summary_pipeline = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
  summary_pipeline.d_model = 1024
  result_summary = summary_pipeline(transcript[:1000])

  json_data['summary'] = result_summary[0]['summary_text']
  with open(output_file, 'w') as f:
    f.write(json.dumps(json_data, indent=2))

