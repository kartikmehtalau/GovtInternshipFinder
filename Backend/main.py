from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
import models, schemas, hashing, oauth2
from database import SessionLocal, engine
from typing import List
import re

# This line creates the database tables if they don't already exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS settings to allow the frontend to communicate with the backend
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to manage database sessions for each API call
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.email == request.username).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials")
    if not hashing.verify_password(request.password, candidate.hashed_password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid Credentials")
    access_token = oauth2.create_access_token(data={"sub": candidate.email})
    return {"access_token": access_token, "token_type": "bearer", "candidate_id": candidate.id}

@app.post("/candidates/register", response_model=schemas.Candidate)
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(get_db)):
    db_candidate = db.query(models.Candidate).filter(models.Candidate.email == candidate.email).first()
    if db_candidate:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hashing.hash_password(candidate.password)
    new_candidate = models.Candidate(
        email=candidate.email, 
        hashed_password=hashed_pwd, 
        education=candidate.education.strip(),
        skills=candidate.skills.lower().strip(),
        interests=candidate.interests.lower().strip(),
        location=candidate.location.lower().strip()
    )
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    return new_candidate

# --- CANDIDATE PROFILE ENDPOINTS ---

@app.get("/candidates/{candidate_id}", response_model=schemas.Candidate)
def get_candidate_profile(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@app.put("/candidates/{candidate_id}", response_model=schemas.Candidate)
def update_candidate_profile(candidate_id: int, candidate_update: schemas.CandidateUpdate, db: Session = Depends(get_db)):
    db_candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    update_data = candidate_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value: # Ensure value is not empty
            setattr(db_candidate, key, value.lower().strip())
            
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

# --- INTERNSHIP & RECOMMENDATION ENDPOINTS ---

@app.get("/recommendations/{candidate_id}", response_model=List[schemas.Internship])
def get_recommendations(candidate_id: int, db: Session = Depends(get_db)):
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    candidate_skills = set(s.strip() for s in re.split(r'[,\s]+', candidate.skills.lower()) if s)
    candidate_interests = set(i.strip() for i in re.split(r'[,\s]+', candidate.interests.lower()) if i)
    candidate_location = candidate.location.lower().strip()

    all_internships = db.query(models.Internship).all()
    scored_internships = []

    for internship in all_internships:
        score = 0
        internship_location = internship.location.lower().strip() if internship.location else ""
        if internship_location == candidate_location or internship_location == 'pan india':
            score += 10
        if internship.sector:
            internship_sectors = set(s.strip() for s in re.split(r'[,\s]+', internship.sector.lower()) if s)
            if not candidate_interests.isdisjoint(internship_sectors):
                score += 7
        if internship.required_skills:
            required_skills = set(s.strip() for s in re.split(r'[,\s]+', internship.required_skills.lower()) if s)
            matching_skills_count = len(candidate_skills.intersection(required_skills))
            score += matching_skills_count * 5
        if score > 0:
            scored_internships.append({"internship": internship, "score": score})

    sorted_internships = sorted(scored_internships, key=lambda x: x['score'], reverse=True)
    top_internships = [item['internship'] for item in sorted_internships[:5]]
    return top_internships

@app.get("/internships", response_model=List[schemas.Internship])
def get_all_internships(db: Session = Depends(get_db)):
    internships = db.query(models.Internship).all()
    return internships

@app.get("/internships/{internship_id}", response_model=schemas.Internship)
def get_internship_details(internship_id: int, db: Session = Depends(get_db)):
    internship = db.query(models.Internship).filter(models.Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship