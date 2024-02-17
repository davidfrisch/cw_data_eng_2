from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKeyConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from models.Base import Base
from sqlalchemy.sql import func


class EmotionsScores(Base):
  __tablename__ = 'emotions_scores'
  speaker_id = Column(String, primary_key=True)
  flow_run_id = Column(String, primary_key=True)
  name = Column(String, primary_key=True)
  score = Column(Float)
  date_added = Column(DateTime, default=func.now())
  date_updated = Column(DateTime, default=func.now(), onupdate=func.now())
  
  __table_args__ = (
    ForeignKeyConstraint(['speaker_id', 'flow_run_id'], ['speakers.speaker_id', 'speakers.flow_run_id']),
  )


  
  def __init__(self, speaker_id, flow_run_id, name, score):
    self.speaker_id = speaker_id
    self.flow_run_id = flow_run_id
    self.name = name
    self.score = score
   
    
  



