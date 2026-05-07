import enum
from sqlalchemy import Column, Integer, String, Date, Enum, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base
        
class GenderEnum(enum.Enum):
    MALE = "남"   
    FEMALE = "녀"
# 좌측: 키(이름) - 디비에 저장되는 값 우측: 프론트에서 전달 받은 값(value) 
# QLAlchemy의 Enum 컬럼이 프론트엔드에서 한글로 받은 값을 디비에 영문으로 저장

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # 아이디 및 보안 정보
    username = Column(String(12), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # 사용자 기본 정보
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    birth_date = Column(Date, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
        
    # 가입 및 소셜 정보
    social_provider = Column(String(20), nullable=False, default="local")
    social_id = Column(String(255), unique=True, nullable=True)
    
    # 핸드폰 및 부가 정보
    phone_number = Column(String(20), nullable=True)
    telecom_provider = Column(String(20), nullable=True) 
    
    # 시간 정보
    created_at = Column(DateTime, nullable=False, default=func.now())

    # 관계 설정: SearchHistory 모델과 연결 (회원 탈퇴 시 검색 기록 자동 삭제)
    search_histories = relationship(
        "SearchHistory", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"