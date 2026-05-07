from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from src.table.verification import VerificationCode

# [CREATE] 1. 인증 코드 최초 저장
def insert_verification_code(db: Session, email: str, code: str) -> bool:
    try:
        db_code = VerificationCode(
            email=email,
            code=code,
            is_verified=0
        )
        db.add(db_code)
        db.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Insert Verification Error: {e}")
        db.rollback()
        return False

# [READ] 2. 최신 인증 상태 조회
def get_verification_status(db: Session, email: str):
    """최신순으로 정렬하여 가장 마지막 시도 기록을 반환"""
    try:
        return db.query(VerificationCode).filter(
            VerificationCode.email == email
        ).order_by(VerificationCode.created_at.desc()).first()
    except SQLAlchemyError as e:
        print(f"Read Verification Error: {e}")
        return None

# [UPDATE] 3. 최신 항목만 인증 성공 처리
def update_verification_success(db: Session, email: str, code: str) -> bool:
    """사용자가 입력한 코드가 최신 row의 코드와 일치할 때, 그 row만 1로 변경"""
    try:
        # 1. 가장 최신의 미인증 row를 찾음
        latest_row = db.query(VerificationCode).filter(
            VerificationCode.email == email,
            VerificationCode.is_verified == 0
        ).order_by(VerificationCode.created_at.desc()).first()
        
        # 2. row가 존재하고 전달받은 코드와 일치하는지 확인
        if latest_row and latest_row.code == code:
            latest_row.is_verified = 1
            db.commit()
            return True
        return False
    except SQLAlchemyError as e:
        print(f"Update Verification Error: {e}")
        db.rollback()
        return False

# [DELETE] 4. 회원가입 완료 시 인증 정보 삭제
def delete_verification_status(db: Session, email: str) -> bool:
    """회원가입 성공 후 호출하여 해당 이메일의 모든 인증 기록 제거"""
    try:
        db.query(VerificationCode).filter(
            VerificationCode.email == email
        ).delete(synchronize_session=False)
        
        db.commit()
        return True
    except SQLAlchemyError as e:
        print(f"Delete Verification Error: {e}")
        db.rollback()
        return False