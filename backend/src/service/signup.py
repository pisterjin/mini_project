import bcrypt
from model.user_handler import create_user, get_user 
from util.database import SessionLocal 
    
## 회원 등록  
# ORM 추가 후 코드
async def register_user(
    username: str,
    password: str,
    full_name: str,
    email: str,
    gender: str,
    telecom_provider: str,    
    social_provider: str,
    social_id = None,
    birth_date = None,
    phone_number = None,
):
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    hashed_str = hashed.decode('utf-8')
    
    db = SessionLocal()
    try:
        result =  create_user(
            db = db,
            username = username,
            hashed_password = hashed_str,
            full_name = full_name,
            email = email,
            birth_date = birth_date,
            gender = gender,
            social_provider = social_provider, # 값을 "local" 고정 → 파라미터로 변경
            social_id = social_id,
            phone_number = phone_number,
            telecom_provider = telecom_provider,
        )
        if not result:                        # ← 실패 시 확인
            raise Exception("회원가입 실패")   # ← controller로 에러 전달 / result가 False일 때 예외 발생
    finally:
        db.close()
    
# ORM 사용 후 
# 아이디 중복 체크 / 쿼리를 따로 데이터베이스에서 작성하는 경우
def check_duplicate_username(username: str) -> bool:
    db = SessionLocal()
    try:
        user = get_user(db, username = username)
        return user is not None  # 빈 값이 아니면 True 반환/즉, 중복이 있을 시 True
    except Exception as e:
        print(e)
    finally:
        db.close()    
'''
user is not None
→ user가 None이 아니면(DB에 있으면) True  →  중복
→ user가 None이면(DB에 없으면)    False →  사용 가능
'''

# finally 없으면
# 오류 없이 정상 실행되면 DB 연결이 닫히지 않음
# DB 연결이 닫히지 않음 → 연결이 계속 쌓임 → 나중에 DB 연결 초과 오류 발생 가능

# finally 있으면
# finally:
#     db.close()  # 성공하든 실패하든 무조건 실행됨 
    
'''
# try-finally (except 없이도 가능)
try:
    user = get_user(db, username=username)
    return user is not None
finally:
    db.close()  # 항상 실행

db.close()는 SessionLocal()을 쓸 때 항상 필요
finally에 넣어야 성공/실패 상관없이 항상 닫힘이 보장됨
'''