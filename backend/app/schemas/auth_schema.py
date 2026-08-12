from pydantic import BaseModel, EmailStr, Field


# ==========================================================
# REGISTER
# ==========================================================

class RegisterRequest(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=72
    )


# ==========================================================
# LOGIN RESPONSE
# ==========================================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str