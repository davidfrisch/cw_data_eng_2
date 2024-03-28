
import os
from dotenv import load_dotenv
current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(current_dir, ".env"))

SHARE_DIR =  os.getenv("SHARE_DIR")
PORT = 5001
HOSTNAME = "0.0.0.0"
if not os.getenv("DATABASE_URL"):
  raise ValueError("DATABASE_URL not found in .env file")
if not os.getenv("HOST_IP"):
  raise ValueError("HOST_IP not found in .env file")
if not os.getenv("SHARE_DIR"):
  raise ValueError("SHARE_DIR not found in .env file")

DATA_DIR = f"{SHARE_DIR}/pipelines_audios"
DATABASE_URL=os.getenv("DATABASE_URL")
HOST_IP = os.getenv("HOST_IP")