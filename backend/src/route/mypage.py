from fastapi import APIRouter
from controller.mypage import patch_user, delete_user

router = APIRouter()

router.patch("/users/{username}")(patch_user)
router.delete("/users/{username}")(delete_user)