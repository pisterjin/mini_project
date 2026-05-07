import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker 
from dotenv import load_dotenv

load_dotenv()
# .env 파일을 현재 파이썬 실행 경로에서 자동으로 읽어 환경 변수로 설정
DB_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

# DB 연결 엔진 (연결 유지 및 재연결 설정)
engine = create_engine(DB_URL, pool_pre_ping=True) 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # SQLAlchemy ORM 방식(db.query(User))을 쓸 때 필요
