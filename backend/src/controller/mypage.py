from fastapi import APIRouter, Path, Body, status
from fastapi.responses import JSONResponse
import service.mypage as mypage_service
from schema.mypage import PatchUserRequest  # Pydantic 모델 추가

router = APIRouter()

# 회원 정보 일부 수정 (PATCH)  // JSON Body 방식으로 데이터를 받고 모델을 이용하는 경우
# 회원 정보 수정 API
# data: PatchUserRequest로 JSON Body를 Pydantic 모델이 자동 수신 
# Optional 필드들이라 수정할 항목만 골라서 보낼 수 있음
@router.patch("/users/{username}")
async def patch_user(username: str = Path(...), data: PatchUserRequest = Body(...)):
    try:
        updated = mypage_service.update_user(
            username,
            data.email if data else None,
            data.phone_number if data else None,
            data.password if data else None
        )
        if not updated:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "수정할 회원 없음"}
            )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "회원 정보 수정 완료"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "수정 실패", "error": str(e)}
        )

# 회원 탈퇴 (DELETE)
# 회원 탈퇴는 폼 데이터로 바꿀 필요 없음
# DELETE 요청은 URL에 username만 있으면 되고 추가로 보낼 데이터가 없음
@router.delete("/users/{username}")
async def delete_user(username: str = Path(...)):
    try:
        deleted = mypage_service.delete_user(username)
        if not deleted:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "삭제할 회원 없음"}
            )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "회원 탈퇴 완료"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "탈퇴 실패", "error": str(e)}
        ) 
        