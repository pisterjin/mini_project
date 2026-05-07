from pydantic import BaseModel
from typing import Optional

class PatchUserRequest(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None
