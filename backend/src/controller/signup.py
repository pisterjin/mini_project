# 회원가입
from fastapi import APIRouter, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from service.signup import register_user, check_duplicate_username

from util.database import engine  # DB 연결 
from schema.signup import SignupRequest  # 내 코드 일부 파일 이동으로 추가

# Pydantic의 EmailStr 등의 이메일 유효성 검사 기능을 사용할 때 email-validator 라이브러리가 필요
# 패키지 설치: pip install "pydantic[email]"
# 설치되었는지 확인 명령어: pip show email-validator

router = APIRouter()

'''
ORM이나 Pydantic 모델을 사용해도 함수 호출 시 키워드 인자 방식을 사용할 수 있음 
오히려 create_user 함수 호출을 보면 이미 키워드 인자 방식으로 되어 있음
'''
# 회원가입 API  / 순서 달라져도 오류 없게끔 키워드 인자 방식으로 전달
@router.post("/register")
async def register(data: SignupRequest):  # FastAPI가 자동으로 JSON → Pydantic 변환 /data는 Pydantic 객체
    try:        
        await register_user(
            username = data.username,
            password = data.password,
            full_name = data.full_name,
            email = data.email,
            gender = data.gender,
            telecom_provider = data.telecom_provider,  
            social_provider = data.social_provider,
            social_id = data.social_id,
            birth_date = data.birth_date,
            phone_number = data.phone_number
        ) 
        
        '''
        data.username      →  "data 객체에서 username 값을 꺼내라"
        username=data.username  →  "꺼낸 값을 username이라는 이름으로 전달해라"
        '''
        return JSONResponse(status_code=status.HTTP_201_CREATED, 
                            content={"message": "회원가입 완료"})
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, 
                            content={"error": str(e)})


# 회원 가입 시 아이디 중복 확인 API
# GET 메소드는 데이터를 URL에 담아서 보내기 때문에 JSON Body를 사용하지 않음
# ORM 방식이든 Raw SQL 방식이든 GET/POST 메소드 선택과는 무관
# 메소드 선택은 어떤 작업을 하느냐에 따라 결정
@router.get("/check-username/{username}")
async def check_username(username:str): 
    try:
        # 클라이언트에서 받은 username을 디비와 비교하여 동일한 값이 있으면 리턴
        is_duplicate = check_duplicate_username(username)
        if is_duplicate:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content = {"isDuplicate":True, "message":"이미 사용 중인 아이디입니다."}
                # "isDuplicate": True를 꼭 넣어야 하는 이유?
                # status_code만으로는 중복인지 아닌지 구분이 어렵기 때문
                # 프론트에서 문자열이 아닌 boolean으로 받아 간단하게 판단 가능 
            )
        return JSONResponse(
            status_code = status.HTTP_200_OK,
            content = {"isDuplicate":False, "messages":"사용 가능한 아이디입니다."}
        ) 
    except Exception as e:
        return JSONResponse(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            content = {"error":str(e)}
        )