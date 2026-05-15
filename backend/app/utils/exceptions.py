"""
Custom exception helpers.

We rely on FastAPI's built-in ``HTTPException`` for all error responses.
This module provides thin convenience wrappers to keep service code DRY.
"""

from fastapi import HTTPException, status


def not_found(resource: str = "Resource") -> HTTPException:
    """Return a 404 HTTPException."""
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} not found",
    )


def conflict(message: str) -> HTTPException:
    """Return a 409 HTTPException."""
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=message,
    )


def forbidden(message: str = "Access denied") -> HTTPException:
    """Return a 403 HTTPException."""
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=message,
    )


def unauthorized(message: str = "Invalid credentials") -> HTTPException:
    """Return a 401 HTTPException."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=message,
    )
