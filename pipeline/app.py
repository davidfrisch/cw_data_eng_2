from flask import Flask
from constants import PORT, HOSTNAME
from db import db
from models.audio_results import AudioResults
from models.speakers import Speakers
from models.emotions import EmotionsScores

def create_app(url=""):
    app = Flask(__name__)
    app.config['DEBUG'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = url
    
    @app.route('/health')
    def health_check():
        return { 
          'message': 'Hello, World!', 
        }
        
    @app.route('/')
    def index():
        return "OK" 
    
    db.init_app(app)
    with app.app_context():
        db.create_all()
      
    return app



if __name__ == "__main__":
    app = create_app("postgresql+psycopg2://postgres:postgres@localhost:5432/audio_results")
    app.run(port=PORT, host=HOSTNAME)