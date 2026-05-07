# backend/db_init/data_loader.py
import pandas as pd
from sqlalchemy import text
from src.util.database import engine

def load_seoul_parks(file_path):
    print(f"📦 데이터 적재 시작: {file_path}")
    
    # 1. CSV 로드 (인코딩 예외 처리)
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
    except (UnicodeDecodeError, Exception):
        df = pd.read_csv(file_path, encoding='cp949')

    # 2. 필수 좌표 데이터가 없는 행 제거
    df = df.dropna(subset=['X좌표(WGS84)', 'Y좌표(WGS84)'])

    # 3. DB 작업 (트랜잭션 시작)
    with engine.begin() as conn:
        # 기존 데이터 초기화 (중복 방지)
        conn.execute(text("TRUNCATE TABLE parks RESTART IDENTITY CASCADE;"))

        # pandas로 임시 테이블 업로드
        df.to_sql('temp_seoul_parks', conn, if_exists='replace', index=False)
        
        # 임시 테이블 -> 실제 parks 테이블 (PostGIS 공간 포인트 생성)
        query = text("""
            INSERT INTO parks (
                park_name, description, image_url, 
                landscaping_facilities, sports_facilities, 
                convenience_facilities, other_facilities,
                address, phone_number, geom
            )
            SELECT 
                "공원명", "공원개요", "이미지",
                "조경/기반시설", "운동시설", 
                "편의/교양시설", "기타시설",
                "공원주소", "전화번호",
                ST_SetSRID(ST_MakePoint("X좌표(WGS84)"::float, "Y좌표(WGS84)"::float), 4326)
            FROM temp_seoul_parks;
        """)
        conn.execute(query)
        
        # 임시 테이블 삭제
        conn.execute(text("DROP TABLE IF EXISTS temp_seoul_parks;"))
        
    print(f"✅ 총 {len(df)}개의 공원 데이터 적재가 완료되었습니다.")