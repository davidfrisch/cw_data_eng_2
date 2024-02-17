import sys
import os
from constants import DATABASE_URL
from sqlalchemy import create_engine
from sqlalchemy_utils import create_database, database_exists, drop_database
from sqlalchemy.orm import sessionmaker
from models.audio_results import AudioResults
from models.speakers import Speakers
from models.emotions import EmotionsScores
# Replace placeholders with your PostgreSQL credentials

def get_engine():
    db_url = DATABASE_URL
    engine = create_engine(db_url)
    return engine


def create_session():
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    session = Session()
    return session

engine = get_engine()


if "--reset" in sys.argv:
    print("Dropping database {}".format(engine.url))
    shouldDelete = input("Are you sure? (y/n)")
    if shouldDelete == "y":
        drop_database(engine.url)
    elif shouldDelete == "n":
        print("Not deleting database")
    else:
        print("Invalid input")
        exit(1)

if not database_exists(engine.url):
    print("Creating database {}".format(engine.url))
    create_database(engine.url)
    # create the tables if they don't exist
    AudioResults.__table__.create(engine) 
    Speakers.__table__.create(engine)
    EmotionsScores.__table__.create(engine)
    

if engine.connect().closed:
    print("Not connected to the database")
else:
    print("Connected to the database")

# create the tables if they don't exist

