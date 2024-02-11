""" TMPDIR=/mnt/data pip install --upgrade pyannote.audio git+https://github.com/davidfrisch/speechbox.git transformers  --no-cache --cache-dir=/mnt/data/pip_cache """

os.environ['HF_HOME'] = '/mnt/data'



# 1. diarization

# 2. Conversation Ranking

# 3. Emotion per speaker

# 4. Summary