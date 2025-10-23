from pydantic import BaseModel
from datetime import date
from typing import Optional

class AssetCreate(BaseModel):
    id: str
    type: str
    brand: str
    model: str
    serial: str
    purchase_date: date
    cost: float
    warranty_status: str
    status: str
    assignee: Optional[str] = None
