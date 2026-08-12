from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # ==========================================================
    # MYSQL
    # ==========================================================

    MYSQL_HOST: str
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str
    MYSQL_USER: str
    MYSQL_PASSWORD: str


    # ==========================================================
    # JWT
    # ==========================================================

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


    # ==========================================================
    # AI API KEYS
    # ==========================================================

    GOOGLE_API_KEY: str = ""
    GROQ_API_KEY: str = ""


    # ==========================================================
    # ENVIRONMENT FILE
    # ==========================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()