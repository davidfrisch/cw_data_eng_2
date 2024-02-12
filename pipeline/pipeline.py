""" TMPDIR=/mnt/data pip install --upgrade pyannote.audio git+https://github.com/davidfrisch/speechbox.git transformers  --no-cache --cache-dir=/mnt/data/pip_cache """
import os 
os.environ['HF_HOME'] = '/mnt/data'
from diarization import diarization
from conv_emotions import process_emotions
from conv_rank import rank_conversations
from summary import generate_summary

# 1. diarization
fileaudio = "../data/audio_example_2.mp3"
output_diarization = "../data/output_1.json"
print("Diarization")
diarization(fileaudio, output_diarization)

# 2. Conversation Ranking
output_rank = "../data/output_2.json"
print("Conversation Ranking")
conv_rank = rank_conversations(output_diarization, output_rank)

# 3. Emotion per speaker
ouptut_emotions = "../data/output_3.json"
print("Emotion per speaker")
process_emotions(output_rank, ouptut_emotions)

# 4. Summary
output_summary = "../data/output_4.json"
print("Summary")
generate_summary(output_diarization, output_summary)