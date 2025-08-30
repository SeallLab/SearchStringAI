from pydantic import BaseModel

class Response(BaseModel):
    text: str
    updated_search_string: str
    has_chaged: bool

class ResponseCriteria(BaseModel):
    text: str
    updated_inclusion_exclusion_criteria: str
    has_chaged: bool
    