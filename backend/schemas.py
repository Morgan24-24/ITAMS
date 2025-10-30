from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional

# --- Asset Schemas ---
class AssetCreate(BaseModel):
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

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    company: str
    role: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Department Schemas ---
class DepartmentBase(BaseModel):
    name: str
    code: str
    location: str | None = None
    head_of_department: str | None = None  
    contact_email: str | None = None        
    contact_phone: str | None = None  

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    
    class Config:
        from_attributes = True