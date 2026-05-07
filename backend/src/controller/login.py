import os 

from fastapi import APIRouter, Request, status, Body  
from fastapi.responses import JSONResponse
from sqlalchemy import text 
from util.database import engine

# JWT 토큰을 서버에서 디코딩(검증)하고 처리하기 위해 jwt 패키지를 사용
# pip install PyJWT 설치
import jwt   # JWT 토큰 처리용
from schema.login import LoginRequest, PasswordChangeRequest   
import service.login as login_service
from service.login import check_user_exists 

# app = APIRouter()로 로그인 관련 API 라우터를 만듦
router = APIRouter()


## 로그인 API 
# POST로 폼 데이터를 받고, "username", "password" 항목을 추출
# login_service.verify_user(username, password) 호출해 인증 검증
# 검증 성공 시 세션에 사용자명을 저장하고, HTTP 200과 성공 메시지 반환
# 실패 시 HTTP 401과 실패 메시지 반환

# request.form() 함수를 사용할 경우 반드시 python-multipart 패키지가 설치 : pip install python-multipart
# Request 객체는 FastAPI에서 HTTP 요청과 관련된 다양한 데이터와 기능을 담고 있는 객체
# 이 객체는 클라이언트가 서버로 보낸 요청의 본문(body), 헤더(headers), 쿼리 파라미터, 쿠키, 세션 등 
# 여러 정보를 접근하고 처리할 수 있도록 여러 속성과 메서드를 포함
# form = await request.form() 처럼 사용한 이유는,
# 클라이언트가 application/x-www-form-urlencoded 형태로 보낸 폼 데이터를 비동기로 파싱하기 위함

# 로그인 API / model 이용 코드
@router.post("/login")
async def login(request: Request, data: LoginRequest):
    try:
        if login_service.verify_user(data.username, data.password):
            request.session["user"] = data.username
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"message": "로그인 성공"}
            )
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": "로그인 실패"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "서버 오류", "error": str(e)}
        )

# 비밀번호 변경 API / model 이용 
@router.post("/reset-password")
async def reset_password(data: PasswordChangeRequest):
    try:
        if login_service.change_password(data.username, data.old_password, data.new_password):
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"message": "비밀번호가 변경되었습니다."}
            )
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": "비밀번호 변경 실패"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "서버 오류", "error": str(e)}
        )

## 구글 로그인(프론트엔드에 .env에 클라이언트 아이디가 있다고 한다고 가정 시)
@router.post("/google-login")
async def google_login(token: str = Body(..., embed=True)):
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        email = decoded.get("email")
        name = decoded.get("name")
        if not email or not name:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, 
                                content={"message": "잘못된 토큰 정보"})

        if not check_user_exists(email, name):
            return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, 
                                content={"message": "로그인 실패"})

        # 로그인 성공 처리 (세션 등 추가 구현)
        return JSONResponse(status_code=status.HTTP_200_OK, 
                            content={"message": "로그인 성공"})

    except jwt.PyJWTError:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, 
                            content={"message": "유효하지 않은 토큰"})
        

## 인증 필요 API 
# 세션에서 "user" 정보 확인
# 없으면 401 에러 반환
# 있으면 환영 메시지 JSON으로 반환
# 로그인한 사용자만 접근해야 하는 보호된 페이지나 기능에서 호출
# 다른 페이지에서 로그인 필요 여부를 검사할 때 로그인된 세션 이용해 인증 요구
@router.get("/protected")
async def protected(request: Request):
    try:
        user = request.session.get("user")
    # 앞서 로그인 시 request.session["user"] = username 부분에서 세션에 저장한 키 값 가져옴
        if not user:
            return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, 
                                content={"message": "접근 불가, 로그인 필요"})
        return {"message": f"{user}님 환영합니다."}
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            content={"message": "서버 오류", "error": str(e)})


## 로그아웃 API
# 세션 데이터를 모두 삭제
# 로그아웃 완료 메시지 반환
@router.post("/logout")
async def logout(request: Request):
    try:
        request.session.clear()
        return {"message": "로그아웃 완료"}
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            content={"message": "서버 오류", "error": str(e)})