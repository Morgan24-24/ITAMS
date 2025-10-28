
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
    department: Optional[str] = None
    location: Optional[str] = None

class MaintenanceCreate(BaseModel):
    asset_id: str
    activity: str
    cost: float = 0.0
    notes: Optional[str] = None

class SoftwareLicenseCreate(BaseModel):
    name: str
    vendor: str
    license_key: str
    purchase_date: str
    expiry_date: str
    cost: float
    assigned_to: Optional[str] = None
    department: Optional[str] = None
    status: str
