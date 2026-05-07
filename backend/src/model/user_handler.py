from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from table.user import User, GenderEnum

#  SQLAlchemy 객체를 딕셔너리로 변환 
def to_dict(row):
    if row is None:
        return None
    # {컬렴명 : 속성값}
    return {column.name: getattr(row, column.name) for column in row.__table__.columns}

def create_user(
    db: Session, 
    username: str, 
    hashed_password: str, 
    full_name: str, 
    email: str, 
    birth_date, 
    gender: str, 
    social_provider: str = "local",
    social_id: str = None,
    phone_number: str = None,
    telecom_provider: str = None
) -> bool:
    try:
        try:
            gender_enum = GenderEnum(gender)
        except ValueError:
            # 혹시 '남'/'녀'가 아닌 값이 들어올 경우를 대비한 기본값 또는 에러 처리
            raise ValueError("성별은 '남' 또는 '녀'여야 합니다.")
        # 2. 유저 객체 생성 (id는 자동 생성되므로 제외)
        db_user = User(
            username=username,
            hashed_password=hashed_password, # 실무에선 비밀번호 암호화 필수
            full_name=full_name,
            email=email,
            birth_date=birth_date,
            gender=gender_enum,
            social_provider=social_provider,
            social_id=social_id,
            phone_number=phone_number,
            telecom_provider=telecom_provider
        )
    
        db.add(db_user)
        db.commit()      # DB에 확정 저장
        return True
    except (ValueError, SQLAlchemyError) as e:
        print(f"Create Error: {e}")
        db.rollback()
        return False

# 로그인 로직 -> username 기반 조회
# 수정/삭제/히스토리 연동 -> id 기반 조회 사용
# [READ] 통합 조회 함수
def get_user(db: Session, user_id: int = None, username: str = None) -> dict:
    """
    SQL: SELECT * FROM users WHERE id = :user_id LIMIT 1;
    """
    if user_id:
        user= db.query(User).filter(User.id == user_id).first()
        """
        SQL: SELECT * FROM users WHERE username = :username LIMIT 1;
        """
    elif username:
        user= db.query(User).filter(User.username == username).first()
    else: 
        return None
    return to_dict(user)

def update_user_info(db: Session, user_id: int, update_data: dict) -> bool:
    """
    SQL: UPDATE users SET full_name = '...', email = '...' WHERE id = :user_pk;
    """
    try:
        # 1. 수정할 대상을 PK로 조회
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        # 2. update_data에 담긴 키(컬럼명)와 값을 반복하며 업데이트
        for key, value in update_data.items():
            if hasattr(db_user, key):
                # 성별 수정 시 Enum 처리
                if key == "gender":
                    value = GenderEnum(value)
                setattr(db_user, key, value)
        # 3. 변경사항 저장
        db.commit()
        return True
    except (ValueError, SQLAlchemyError) as e:
        print(f"Update Error: {e}")
        db.rollback()
        return False

# [DELETE] 회원 탈퇴 (물리적 삭제)
def delete_user(db: Session, user_id: int) -> bool:
    """
    SQL: DELETE FROM users WHERE id = :user_pk;
    """
    try:
        # 1. 삭제할 유저 조회
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            # 2. 세션에서 삭제 대상으로 등록
            db.delete(db_user)
            # 3. DB에 삭제 명령 반영 (실제 데이터 소멸)
            db.commit()
            return True
        return False
    except SQLAlchemyError as e:
        print(f"Delete Error: {e}")
        db.rollback()
        return False