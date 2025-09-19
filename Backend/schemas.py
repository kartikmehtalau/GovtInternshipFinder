from pydantic import BaseModel
from typing import Optional

# Schema for creating a new candidate
class CandidateCreate(BaseModel):
    email: str
    password: str
    education: str
    skills: str
    interests: str
    location: str

# Schema for updating an existing candidate's profile
class CandidateUpdate(BaseModel):
    education: Optional[str] = None
    skills: Optional[str] = None
    interests: Optional[str] = None
    location: Optional[str] = None

# Schema for displaying internship data
class Internship(BaseModel):
    id: int
    title: str
    company: str
    location: str
    sector: str
    required_skills: Optional[str] = None
    about: Optional[str] = None
    perks: Optional[str] = None
    who_can_apply: Optional[str] = None
    openings: Optional[int] = None
    apply_link: Optional[str] = None
    terms: Optional[str] = None

    class Config:
        from_attributes = True

# Schema for displaying candidate data
class Candidate(BaseModel):
    id: int
    email: str
    education: str
    skills: str
    interests: str
    location: str

    class Config:
        from_attributes = True