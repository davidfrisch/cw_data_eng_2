# Pipeline Voice Analysis

## Setup locally the pipeline

### Create a virtual environment and install the dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

If you don't have enough storage in the default disk, you can change the installation directory of the pip packages:

```bash
export TMPDIR=/path/to/tmpdir pip install -r requirements.txt --no-cache --cache-dir=/path/to/pip_cache
#e.g: TMPDIR=/mnt/data pip install -r requirements.txt --no-cache --cache-dir=/mnt/data/pip_cache 
```

### Change the huggingface installation directory

```bash
mkdir -p /path/to/huggingface
export HF_HOME=/path/to/huggingface
#e.g: export HF_HOME=/mnt/data/huggingface
```

### Put up the database

```bash
docker compose up -d postgres
```

## Test the pipeline

```bash
pytest
```

## Run the pipeline locally

```bash
python pipeline.py --local <path_to_audio_file>
#e.g. python pipeline.py --local ../sample_data/audio_example.wav
```