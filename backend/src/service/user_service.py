import os
from sqlalchemy import create_engine, text
from util.database import engine 
from typing import Union


# 디비에서 유저 정보 가져오기
def get_user_from_db(username: str):
    query = text("SELECT * FROM users WHERE username = :username")
    with engine.connect() as conn:
        result = conn.execute(query, {"username": username})
        user_row = result.fetchone()
    return user_row  # 반환되는 값은 해당 username에 해당하는 사용자 데이터 한 행(없으면 None)

# 비밀번호 변경
def change_password_in_db(username: str, new_hash: bytes):
    new_hash_str = new_hash.decode('utf-8')
    # 이후 DB 작업에 new_hash_str 사용
    with engine.begin() as conn:  # engine.begin()은 자동 commit 포함
        conn.execute(
            text("UPDATE users SET hashed_password = :new_hash WHERE username = :username"),
            {"new_hash": new_hash_str, "username": username}
        )
    # conn.commit()  # DB에 반영
    
    # SQLAlchemy에서 engine.connect()는 
    # 기본적으로 autocommit이 비활성화되어 있어서 명시적으로 commit()을 호출해야 DB에 반영됨 
    # engine.begin()은 자동 commit 포함