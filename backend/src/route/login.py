from fastapi import APIRouter, Request
from controller.login import login, reset_password, protected, logout  

# APIRouter() 객체를 생성하여, 이 라우터에 API 경로와 처리 함수를 연결할 준비
# APIRouter를 생성한 뒤, 해당 라우터에 URL과 컨트롤러 내 함수들을 바인딩함
# 각 함수는 요청을 받아 처리하는 FastAPI 경로 함수로 작성되어 있어야 함
router = APIRouter()

router.post("/login")(login)         
router.post("/reset-password")(reset_password)  
router.get("/protected")(protected)  
router.post("/logout")(logout)         