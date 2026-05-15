"""
Application configuration loaded from environment variables via pydantic-settings.

All settings are validated at startup — missing or invalid values cause
an immediate, descriptive error instead of a runtime surprise.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the polling platform backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── MongoDB ──────────────────────────────────────────────────────────
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "polling_db"

    # ── JWT ──────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # ── CORS / Frontend ──────────────────────────────────────────────────
    FRONTEND_URL: str = "http://localhost:5173"


# Singleton — import this everywhere.
settings = Settings()
