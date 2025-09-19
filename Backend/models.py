from sqlalchemy import Column, Integer, String, Text
from database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    education = Column(String)
    skills = Column(Text) 
    interests = Column(String)
    location = Column(String)

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String)
    location = Column(String)
    sector = Column(String)
    required_skills = Column(Text, nullable=True)
    
    # Detailed Columns
    about = Column(Text, nullable=True)
    perks = Column(Text, nullable=True)
    who_can_apply = Column(Text, nullable=True)
    openings = Column(Integer, nullable=True)
    apply_link = Column(String, nullable=True)
    terms = Column(Text, nullable=True)