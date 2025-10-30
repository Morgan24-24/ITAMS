from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from database import engine, get_db
from models import Base, Asset, Maintenance, SoftwareLicense, User, Department
from schemas import (
    AssetCreate, MaintenanceCreate, SoftwareLicenseCreate,
    DepartmentCreate, DepartmentResponse,
    UserCreate, UserLogin, Token, User as UserSchema
)
from auth import (
    get_password_hash, verify_password, 
    create_access_token, get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from typing import Optional
from sqlalchemy import func


app = FastAPI()
Base.metadata.create_all(bind=engine)

# --- CORS setup ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)  

# ==================== AUTHENTICATION ROUTES ====================

@app.post("/signup", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    print(f"🔍 Signup attempt for email: {user_data.email}")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        print(f"❌ Email already registered: {user_data.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    print(f"🔑 Password hashed successfully")
    
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        company=user_data.company,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"✅ User created successfully: {new_user.email}")
    return new_user

@app.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """Login and get access token (OAuth2 compatible)"""
    # OAuth2PasswordRequestForm uses 'username' field, but we want email
    email = form_data.username
    password = form_data.password
    
    print(f"🔍 Login attempt for email: {email}")
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"❌ User not found: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"✅ User found: {user.email}")
    
    # Verify password
    if not verify_password(password, user.hashed_password):
        print(f"❌ Password verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"✅ Login successful for {user.email}")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserSchema)
def get_me(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    user = db.query(User).filter(User.email == current_user["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ==================== ASSET ROUTES ====================
    
@app.get("/")
def home():
    return {"message": "IT Asset Management API is running"}

@app.get("/assets")
def get_assets(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    brand: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    assignee: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = db.query(Asset)

    if brand:
        query = query.filter(Asset.brand.ilike(f"%{brand}%"))
    if type:
        query = query.filter(Asset.type.ilike(f"%{type}%"))
    if status:
        query = query.filter(Asset.status.ilike(f"%{status}%"))
    if assignee:
        query = query.filter(Asset.assignee.ilike(f"%{assignee}%"))
    if search:
        query = query.filter(
            (Asset.brand.ilike(f"%{search}%")) |
            (Asset.model.ilike(f"%{search}%")) |
            (Asset.serial.ilike(f"%{search}%")) |
            (Asset.id.ilike(f"%{search}%")) |
            (Asset.assignee.ilike(f"%{search}%"))
        )

    results = query.all()
    return results

@app.post("/assets")
def create_asset(
    asset: AssetCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check if serial number already exists
    existing = db.query(Asset).filter(Asset.serial == asset.serial).first()
    if existing:
        raise HTTPException(status_code=400, detail="Asset with this serial already exists.")
    
    # Get department code if department is assigned
    if asset.department:
        # Find the department by name
        dept = db.query(Department).filter(Department.name == asset.department).first()
        if not dept:
            raise HTTPException(status_code=400, detail=f"Department '{asset.department}' not found")
        
        dept_code = dept.code
    else:
        # No department assigned, use generic code
        dept_code = "GEN"
    
    # Count existing assets in this department to get the next number
    existing_count = db.query(Asset).filter(
        Asset.id.like(f"{dept_code}-%")
    ).count()
    
    next_number = existing_count + 1
    
    # Generate asset ID: DEPT-001, DEPT-002, etc.
    asset_id = f"{dept_code}-{next_number:03d}"  # :03d pads with zeros (001, 002, etc.)
    
    # Create asset with auto-generated ID
    asset_dict = asset.dict()
    asset_dict['id'] = asset_id  # Add the generated ID
    
    new_asset = Asset(**asset_dict)
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    
    return {"message": "Asset added successfully", "asset": new_asset}

@app.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    db.delete(asset)
    db.commit()
    return {"message": f"Asset '{asset_id}' deleted successfully."}

@app.patch("/assets/{asset_id}")
def update_asset(
    asset_id: str, 
    updated_fields: dict, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    for key, value in updated_fields.items():
        if hasattr(asset, key):
            setattr(asset, key, value)

    db.commit()
    db.refresh(asset)
    return {"message": f"Asset '{asset_id}' updated successfully.", "asset": asset}

# ==================== MAINTENANCE ROUTES ====================

@app.post("/maintenance")
def add_maintenance(
    record: MaintenanceCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == record.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    maintenance = Maintenance(**record.dict())
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return {"message": "Maintenance record added successfully", "record": maintenance}

@app.get("/maintenance")
def get_maintenance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Maintenance).all()

@app.get("/maintenance/{asset_id}")
def get_asset_maintenance(
    asset_id: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    return asset.maintenance_records

@app.delete("/maintenance/{maintenance_id}")
def delete_maintenance(
    maintenance_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    maintenance = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found.")
    
    db.delete(maintenance)
    db.commit()
    return {"message": f"Maintenance record {maintenance_id} deleted successfully."}

# ==================== LICENSE ROUTES ====================

@app.post("/licenses")
def add_license(
    license: SoftwareLicenseCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing = db.query(SoftwareLicense).filter(SoftwareLicense.license_key == license.license_key).first()
    if existing:
        raise HTTPException(status_code=400, detail="License key already exists.")
    new_license = SoftwareLicense(**license.dict())
    db.add(new_license)
    db.commit()
    db.refresh(new_license)
    return {"message": "License added successfully", "license": new_license}

@app.get("/licenses")
def get_licenses(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(SoftwareLicense).all()

@app.get("/licenses/{license_id}")
def get_license(
    license_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    license = db.query(SoftwareLicense).filter(SoftwareLicense.id == license_id).first()
    if not license:
        raise HTTPException(status_code=404, detail="License not found.")
    return license

@app.patch("/licenses/{license_id}")
def update_license(
    license_id: int, 
    fields: dict, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    license = db.query(SoftwareLicense).filter(SoftwareLicense.id == license_id).first()
    if not license:
        raise HTTPException(status_code=404, detail="License not found.")
    for key, val in fields.items():
        if hasattr(license, key):
            setattr(license, key, val)
    db.commit()
    db.refresh(license)
    return {"message": "License updated", "license": license}

@app.delete("/licenses/{license_id}")
def delete_license(
    license_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    license = db.query(SoftwareLicense).filter(SoftwareLicense.id == license_id).first()
    if not license:
        raise HTTPException(status_code=404, detail="License not found.")
    db.delete(license)
    db.commit()
    return {"message": "License deleted"}

# ==================== REPORT ROUTES ====================

@app.get("/report/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total_assets = db.query(func.count(Asset.id)).scalar()
    total_active = db.query(func.count()).filter(Asset.status == "Active").scalar()
    total_maintenance = db.query(func.count()).filter(Asset.status == "Under Maintenance").scalar()
    total_cost = db.query(func.sum(Asset.cost)).scalar() or 0.0
    total_maintenance_cost = db.query(func.sum(Maintenance.cost)).scalar() or 0.0

    return {
        "total_assets": total_assets,
        "active_assets": total_active,
        "maintenance_assets": total_maintenance,
        "total_asset_cost": total_cost,
        "total_maintenance_cost": total_maintenance_cost
    }

@app.get("/report/maintenance-costs")
def maintenance_costs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total = db.query(func.sum(Maintenance.cost)).scalar() or 0.0
    breakdown = (
        db.query(
            Asset.id,
            Asset.brand,
            func.sum(Maintenance.cost).label("total_cost")
        )
        .join(Maintenance, Asset.id == Maintenance.asset_id)
        .group_by(Asset.id, Asset.brand)
        .all()
    )
    return {"total_cost": total, "breakdown": [dict(row._asdict()) for row in breakdown]}

@app.get("/report/asset-stats")
def asset_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total_assets = db.query(Asset).count()
    avg_cost = db.query(func.avg(Asset.cost)).scalar() or 0.0
    by_department = dict(db.query(Asset.department, func.count()).group_by(Asset.department))
    by_type = dict(db.query(Asset.type, func.count()).group_by(Asset.type))
    return {
        "total_assets": total_assets,
        "average_cost": round(avg_cost, 2),
        "by_department": by_department,
        "by_type": by_type,
    }

# ==================== DEPARTMENT ROUTES ====================

@app.post("/departments", response_model=DepartmentResponse)
def create_department(
    dept: DepartmentCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new department"""
    # Check if code already exists
    existing = db.query(Department).filter(Department.code == dept.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Department code '{dept.code}' already exists")
    
    # Create with ALL fields
    new_dept = Department(
        name=dept.name,
        code=dept.code,
        location=dept.location,
        head_of_department=dept.head_of_department,
        contact_email=dept.contact_email,
        contact_phone=dept.contact_phone
    )
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

@app.get("/departments", response_model=list[DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all departments"""
    return db.query(Department).all()

@app.get("/departments/{dept_id}", response_model=DepartmentResponse)
def get_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a single department by ID"""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept

@app.patch("/departments/{dept_id}", response_model=DepartmentResponse)
def update_department(
    dept_id: int,
    dept_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a department"""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if new code conflicts with another department
    if dept_data.code != dept.code:
        existing = db.query(Department).filter(Department.code == dept_data.code).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Department code '{dept_data.code}' already exists")
    
    # Update ALL fields
    dept.name = dept_data.name
    dept.code = dept_data.code
    dept.location = dept_data.location
    dept.head_of_department = dept_data.head_of_department
    dept.contact_email = dept_data.contact_email
    dept.contact_phone = dept_data.contact_phone
    
    db.commit()
    db.refresh(dept)
    return dept

@app.delete("/departments/{dept_id}")
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a department"""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if any assets are assigned to this department
    assets_count = db.query(Asset).filter(Asset.department == dept.name).count()
    if assets_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete department. {assets_count} assets are still assigned to it."
        )
    
    db.delete(dept)
    db.commit()
    return {"message": f"Department '{dept.name}' deleted successfully"}

@app.get("/departments/{dept_id}/assets")
def get_department_assets(
    dept_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all assets assigned to a specific department"""
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    assets = db.query(Asset).filter(Asset.department == dept.name).all()
    
    # Calculate stats
    total_cost = sum(asset.cost for asset in assets)
    active_count = sum(1 for asset in assets if asset.status == "Active")
    
    return {
        "department": dept,
        "assets": assets,
        "total_assets": len(assets),
        "total_cost": total_cost,
        "active_assets": active_count
    }