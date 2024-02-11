from speechbox import ASRDiarizationPipeline
from transformers import pipeline
from pyannote.audio import Pipeline
import json

diarization_pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    use_auth_token="")

asr_pipeline = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-base",
)

final_pipeline = ASRDiarizationPipeline(
    asr_pipeline=asr_pipeline, diarization_pipeline=diarization_pipeline
)
final_pipeline.embedding_batch_size=1
final_pipeline.segmentation_batch_size=1

outputs = final_pipeline('../data/audio_example.mp3')

print(outputs)
with open('../data/diarization_results.json', 'w') as f:
    f.write(json.dumps(outputs))