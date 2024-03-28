
import os
import shutil
import json
import sys
current_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.append(f"{current_dir}/../")
from pipeline import pipeline

def test_pipeline():
  shutil.copyfile(f"{current_dir}/../../sample_data/audio_example.wav", f"{current_dir}/../../sample_data/audio_example_test.wav")
  output_folder_name = pipeline(f"{current_dir}/../../sample_data/audio_example_test.wav", keep_output_folder=True)
  assert os.path.exists(f"{output_folder_name}/output_emotions.json")
  assert os.path.exists(f"{output_folder_name}/output_rank.json")
  assert os.path.exists(f"{output_folder_name}/output_summary.json")
  assert os.path.exists(f"{output_folder_name}/audio.json")
  
  output_emotions(output_folder_name)
  output_rank(output_folder_name)
  output_summary(output_folder_name)
  
def output_emotions(output_folder_name):
  with open(f"{output_folder_name}/output_emotions.json", "r") as f:
    output_emotions = f.read()
    output_emotions = json.loads(output_emotions)
    for speaker in output_emotions["speakers"]:
      emotions = output_emotions["speakers"][speaker]["emotions"]
      assert len(emotions) > 0
      for value in emotions.values():
        assert value >= 0 and value <= 1
        
        
def output_rank(output_folder_name):
  with open(f"{output_folder_name}/output_rank.json", "r") as f:
    output_rank = f.read()
    output_rank = json.loads(output_rank)
    for speaker in output_rank["speakers"]:
      rank = output_rank["speakers"][speaker]["rank"]["score"]
      assert rank >= 0 and rank <= 5
      
      
def output_summary(output_folder_name):
  with open(f"{output_folder_name}/output_summary.json", "r") as f:
    output_summary = f.read()
    output_summary = json.loads(output_summary)
    summary = output_summary["summary"]
    assert len(summary) > 0
      
  
  
        
    
    