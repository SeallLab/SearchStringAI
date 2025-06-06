from pydantic import BaseModel

class Response(BaseModel):
    text: str
    updated_search_string: str
    ss_change: bool #to know if search string has been updated
    