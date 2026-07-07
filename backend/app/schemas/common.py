from pydantic import BaseModel


class SampleItem(BaseModel):
    key: str
    label: str
    sequence: str
