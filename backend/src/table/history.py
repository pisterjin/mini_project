from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CHAR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class SearchHistory(Base):
    __tablename__ = "search_histories"

    id = Column(Integer, primary_key=True, index=True)

    # 외래키 설정: User 테이블의 id 참조 (CASCADE 삭제 적용)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    search_query = Column(String(255), nullable=False)
    del_yn = Column(CHAR(1), nullable=False, default="N") # 삭제 여부

    created_at = Column(DateTime, nullable=False, default=func.now())
    deleted_at = Column(DateTime, nullable=True, onupdate=func.now()) # 삭제/수정 시 기록

    # 관계 설정: User 모델과 역방향 연결
    user = relationship("User", back_populates="search_histories")

    def __repr__(self):
        return f"<SearchHistory(id={self.id}, query='{self.search_query}')>"