import bcrypt
from sqlalchemy import text 
from util.database import engine
from model.user_handler import get_user
from .user_service import change_password_in_db 

## 메모리에 저장된 사용자 정보(사용자명과 해시된 비밀번호)
# 예시 용도: 메모리에 사용자 저장 (실제 프로젝트는 DB 연결)
# users 딕셔너리 (예시용 메모리 저장소)
# 키는 사용자명 ("user"), 값은 해당 사용자의 비밀번호 해시값.
# "password"라는 평문 비밀번호를 bcrypt로 해시하여 저장.
# users 딕셔너리의 키 "user"는 비밀번호 해시를 저장하는 '사용자 계정명' 용도
users = {
    "user": bcrypt.hashpw("password".encode('utf-8'), bcrypt.gensalt())
}

# 비밀번호 유효성 검증
# ORM 사용
def verify_user(username: str, password: str) -> bool:
    db = SessionLocal()  # ORM 사용으로 인해 추가
    try:
    # DB에서 username으로 사용자 조회
        user_record = get_user(db, username=username) # ORM 추가해 변경된 코드
        if user_record:
            stored_hash = user_record["hashed_password"] 
            if isinstance(stored_hash, str):
                stored_hash = stored_hash.encode('utf-8')

            # 비밀번호 평문도 바이트로 변환
            pw_bytes = password.encode('utf-8')

            return bcrypt.checkpw(pw_bytes, stored_hash)
    except Exception as e :
        print(e)   
        return False
    finally :
        db.close()
        
## change_password 함수 / 비밀번호 변경 함수
# 기존 비밀번호가 맞는지(verify_user 통해) 확인 후,
# 맞다면 새로운 비밀번호를 bcrypt 해시하여 users 딕셔너리 내 해당 사용자의 값을 변경
# 성공 시 True, 실패 시 False를 반환
def change_password(username: str, old_password: str, new_password: str) -> bool:
    if verify_user(username, old_password):
        new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        # users[username] = new_hash   # 메모리 상에서만 변경
        change_password_in_db(username, new_hash)  # DB 반영 함수 호출
        return True
    return False

# 구글 로그인 
def check_user_exists(email: str, name: str) -> bool:
    query = text(
        """
        SELECT count(*) as n FROM users 
        WHERE email = :email AND full_name = :name
        """
    )
    with engine.connect() as conn:
        row = conn.execute(query, {"email": email, "name": name}).fetchone()
    return row[0] > 0