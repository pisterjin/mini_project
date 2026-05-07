from sqlalchemy import Column, Integer, String, Text
from geoalchemy2 import Geometry
from .base import Base

class Park(Base):
    __tablename__ = "parks"

    id = Column(Integer, primary_key=True, index=True)
    park_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(1000), nullable=True)
    
    landscaping_facilities = Column(Text, nullable=True)
    sports_facilities = Column(Text, nullable=True)
    convenience_facilities = Column(Text, nullable=True)
    other_facilities = Column(Text, nullable=True)
    
    address = Column(String(500), nullable=True)
    phone_number = Column(String(50), nullable=True)
    
    geom = Column(Geometry(geometry_type='POINT', srid=4326), index=True)

    def __repr__(self):
        return f"<Park(id={self.id}, name='{self.park_name}')>"