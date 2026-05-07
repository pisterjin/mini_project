from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .base import Base

class VerificationCode(Base):
    __tablename__ = "verification_codes"

    # 1. 고유번호 (PK)
    index_key = Column(Integer, primary_key=True, index=True)
    
    # 2. 이메일 (외래키 제거: 가입 전 유저를 식별하기 위함)
    # 가입 시 이 이메일과 매칭되는 최신 인증 기록을 확인합니다.
    email = Column(String(255), nullable=False, index=True)
    
    # 3. 인증 코드 번호 (6자리)
    code = Column(String(6), nullable=False)
    
    # 4. 생성 시간
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 5. 인증 상태 (실무 팁: 인증 완료 여부 확인용)
    # 인증에 성공하면 True로 변경하고, 회원가입 시 이 값이 True인지 체크합니다.
    is_verified = Column(Integer, default=0) # 0: 미인증, 1: 인증완료
    