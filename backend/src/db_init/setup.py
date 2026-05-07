# backend/db_init/setup.py
from sqlalchemy import text
from src.util.database import engine
from src.table import Base
from .data_loader import load_seoul_parks

def init_db():
    print("🚀 DB 초기화 및 테이블 생성을 시작합니다...")
    
    with engine.begin() as conn:
        # 1. PostGIS 확장 활성화 (없으면 생성)
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        print("✅ PostGIS 확장 활성화 완료")
        
        # 2. 모든 테이블 생성 (User, Park, SearchHistory)
        Base.metadata.create_all(bind=engine)
        print("✅ DB 테이블 생성 완료")

    # 3. 공원 데이터 적재 실행
    csv_path = "src/db_init/raw_data/서울시 주요 공원현황.csv"
    load_seoul_parks(csv_path)

if __name__ == "__main__":
    init_db()