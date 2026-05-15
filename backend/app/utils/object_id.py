"""
PyObjectId — a Pydantic v2 compatible wrapper around ``bson.ObjectId``.

This lets Pydantic models serialize/deserialize MongoDB ``_id`` fields
transparently as strings in JSON while keeping native ObjectId in Python.

Usage::

    from app.utils.object_id import PyObjectId

    class UserResponse(BaseModel):
        id: PyObjectId = Field(alias="_id")
"""

from typing import Annotated, Any

from bson import ObjectId
from pydantic import GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import CoreSchema, core_schema


class _ObjectIdType:
    """Custom Pydantic v2 type for ``bson.ObjectId``."""

    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: GetCoreSchemaHandler,
    ) -> CoreSchema:
        def validate_from_str(value: Any) -> ObjectId:
            if isinstance(value, ObjectId):
                return value
            if isinstance(value, str) and ObjectId.is_valid(value):
                return ObjectId(value)
            raise ValueError(f"Invalid ObjectId: {value!r}")

        return core_schema.no_info_plain_validator_function(
            validate_from_str,
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls,
        _core_schema: CoreSchema,
        handler: GetJsonSchemaHandler,
    ) -> JsonSchemaValue:
        return {"type": "string", "example": "507f1f77bcf86cd799439011"}


PyObjectId = Annotated[ObjectId, _ObjectIdType]
