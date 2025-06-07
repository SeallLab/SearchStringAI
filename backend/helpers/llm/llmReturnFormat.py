from pydantic import BaseModel

class Response(BaseModel):
    text: str
    updated_search_string: str
    has_chaged: bool
    