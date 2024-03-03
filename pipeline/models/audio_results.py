from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
import sqlalchemy.sql.functions as func
from models.Base import Base

class AudioResults(Base):
  __tablename__ = 'audio_results'
  
  def __init__(self, flow_run_id, audio_path, vm_worker_id):
    self.flow_run_id = flow_run_id
    self.audio_path = audio_path
    self.vm_worker_id = vm_worker_id
    self.transcript = None
    self.summary = None
    self.speakers = []
    
    
  flow_run_id = Column(String, primary_key=True)
  audio_path = Column(String)
  transcript = Column(String)
  summary = Column(String)
  vm_worker_id = Column(String)
  date_added = Column(DateTime, default=func.now())
  date_updated = Column(DateTime, default=func.now(), onupdate=func.now())
  speakers = relationship('Speakers', back_populates='audio_results')

