from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from models.Base import Base
from models.emotions import EmotionsScores
from sqlalchemy.sql import func

class Speakers(Base):
  __tablename__ = 'speakers'
  flow_run_id = Column(String, ForeignKey('audio_results.flow_run_id'), primary_key=True)
  speaker_id = Column(String, primary_key=True)
  text = Column(String)
  conversation_rate = Column(Float)
  date_added = Column(DateTime, default=func.now())
  date_updated = Column(DateTime, default=func.now(), onupdate=func.now())
  audio_results = relationship('AudioResults', back_populates='speakers')
  emotions_scores = relationship('EmotionsScores', backref='speakers')
  
  def __init__(self, flow_run_id, speaker_id, text):
    self.flow_run_id = flow_run_id
    self.speaker_id = speaker_id
    self.text = text
    self.conversation_rate = None
 
  def add_emotion(self, name, score):
    self.emotions_scores.append(EmotionsScores(speaker_id=self.speaker_id, flow_run_id=self.flow_run_id, name=name, score=score))


