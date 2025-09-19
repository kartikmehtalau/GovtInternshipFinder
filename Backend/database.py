import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# .env file se DATABASE_URL ko load karo
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# SQLAlchemy engine banaya - yeh database se connection ka main point hai
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Database se baat karne ke liye session banaya
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Yeh humare database tables ka base class banega
Base = declarative_base()