""" TMPDIR=/mnt/data pip install --upgrade pyannote.audio git+https://github.com/davidfrisch/speechbox.git transformers  --no-cache --cache-dir=/mnt/data/pip_cache """
import os 
os.environ['HF_HOME'] = '/mnt/data'
from diarization import diarization
from conv_emotions import process_emotions
from transcript import transcribe_audio
from conv_rank import rank_conversations
from summary import generate_summary

# 1. diarization
fileaudio = "../data/audio_example.mp3"
output_diarization = "../data/output_1.json"
diarization(fileaudio, output_diarization)

# 3. Conversation Ranking
output_rank = "../data/output_2.json"
conv_rank = rank_conversations(output_diarization, output_rank)

# # 4. Emotion per speaker
ouptut_emotions = "../data/output_4.json"
process_emotions(output_rank, ouptut_emotions)

# 5. Summary
output_summary = "../data/output_5.json"
generate_summary(output_diarization, output_summary)