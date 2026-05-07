import os

from dotenv import load_dotenv  # 환경변수 로더

load_dotenv()   # 환경변수 로드

from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
import sys, uvicorn

# pip install fastapi
# pip install uvicorn
# astapi와 uvicorn 패키지가 동시에 설치 시 : pip install fastapi uvicorn  
# 또는
# python -m pip install fastapi uvicorn

# pip install sqlalchemy (sqlalchemy 사용하는 경우 공통)
# pip install pymysql (마리아 디비 사용하는 경우)
# pip install sqlalchemy psycopg2 (PostgreSQL 사용하는 경우)

from sqlalchemy import text 

from util.database import engine  # database.py에서 생성한 engine 임포트
from route import login, signup, mypage  # 라우터에 추가 import

# pip install geoalchemy2 패키지 설치

app=FastAPI()  # FastAPI 앱 인스턴스 생성

cors_config={
    "allow_origins":["http://localhost:3000"],
    "allow_credentials":True,
    "allow_methods":["*"],
    "allow_headers":["*"]
    }

app.add_middleware(
    CORSMiddleware,
    **cors_config
)

# secret_key는 세션 미들웨어 설정용 비밀키로, 세션을 사용하는 곳(보통 main.py)에서 한 번만 선언하고 사용하면 충분
secret_key = os.getenv("SESSION_SECRET_KEY", "default-secret-key-for-dev")

app.add_middleware(SessionMiddleware, secret_key=secret_key)

app.include_router(login.router)
app.include_router(signup.router)
app.include_router(mypage.router) 


if __name__ == "__main__":
    try:
        uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port = 5000,
        reload= True) 
    except Exception as e:
        sys.exit(1)
