
import os
from dotenv import load_dotenv
load_dotenv('.env')
DATA_DIR = "/mnt/beegfs/prefect_data/pipeline_audios"
PORT = 5001
HOSTNAME = "0.0.0.0"
if not os.getenv("DATABASE_URL"):
  raise ValueError("DATABASE_URL not found in .env file")

DATABASE_URL=os.getenv("DATABASE_URL")
