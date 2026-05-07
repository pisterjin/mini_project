from pydantic import BaseModel

# 로그인 요청에 사용할 데이터 모델 
class LoginRequest(BaseModel):
    username: str
    password: str

# 비밀번호 변경 요청 데이터 모델 
class PasswordChangeRequest(BaseModel):
    username: str
    old_password: str
    new_password: str