from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base, Asset, Maintenance, SoftwareLicense
from schemas import AssetCreate, MaintenanceCreate, SoftwareLicenseCreate
from typing import Optional
from sqlalchemy import func


app = FastAPI()
Base.metadata.create_all(bind=engine)

# --- CORS setup (to allow frontend requests) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:8000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)  
    
#Routes
@app.get("/")
def home():
    return {"message": "IT Asset Management API is running"}

#Getting all assets
@app.get("/assets")
def get_assets(
    db: Session = Depends(get_db),
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


# --- Add a new asset ---
@app.post("/assets")
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    # Check for duplicate serial
    existing = db.query(Asset).filter(Asset.serial == asset.serial).first()
    if existing:
        raise HTTPException(status_code=400, detail="Asset with this serial already exists.")

    new_asset = Asset(**asset.dict())
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return {"message": "Asset added successfully", "asset": new_asset}

# --- Delete an asset ---
@app.delete("/assets/{asset_id}")
def delete_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    db.delete(asset)
    db.commit()
    return {"message": f"Asset '{asset_id}' deleted successfully."}


# --- Update an asset ---
@app.patch("/assets/{asset_id}")
def update_asset(asset_id: str, updated_fields: dict, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    # Loop through each field from the request and update only those
    for key, value in updated_fields.items():
        if hasattr(asset, key):
            setattr(asset, key, value)

    db.commit()
    db.refresh(asset)
    return {"message": f"Asset '{asset_id}' updated successfully.", "asset": asset}

@app.post("/maintenance")
def add_maintenance(record: MaintenanceCreate, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == record.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")

    maintenance = Maintenance(**record.dict())
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return {"message": "Maintenance record added successfully", "record": maintenance}

# --- Get all maintenance records ---
@app.get("/maintenance")
def get_maintenance(db: Session = Depends(get_db)):
    return db.query(Maintenance).all()


# --- Get maintenance history for a specific asset ---
@app.get("/maintenance/{asset_id}")
def get_asset_maintenance(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found.")
    return asset.maintenance_records

@app.get("/report/summary")
def get_summary(db: Session = Depends(get_db)):
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

@app.post("/licenses")
def add_license(license: SoftwareLicenseCreate, db: Session = Depends(get_db)):
    existing = db.query(SoftwareLicense).filter(SoftwareLicense.license_key == license.license_key).first()
    if existing:
        raise HTTPException(status_code=400, detail="License key already exists.")
    new_license = SoftwareLicense(**license.dict())
    db.add(new_license)
    db.commit()
    db.refresh(new_license)
    return {"message": "License added successfully", "license": new_license}

@app.get("/licenses")
def get_licenses(db: Session = Depends(get_db)):
    return db.query(SoftwareLicense).all()

@app.get("/licenses/{license_id}")
def get_license(license_id: int, db: Session = Depends(get_db)):
    license = db.query(SoftwareLicense).filter(SoftwareLicense.id == license_id).first()
    if not license:
        raise HTTPException(status_code=404, detail="License not found.")
    return license

@app.patch("/licenses/{license_id}")
def update_license(license_id: int, fields: dict, db: Session = Depends(get_db)):
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
def delete_license(license_id: int, db: Session = Depends(get_db)):
    license = db.query(SoftwareLicense).filter(SoftwareLicense.id == license_id).first()
    if not license:
        raise HTTPException(status_code=404, detail="License not found.")
    db.delete(license)
    db.commit()
    return {"message": "License deleted"}

@app.get("/report/maintenance-costs")
def maintenance_costs(db: Session = Depends(get_db)):
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
def asset_stats(db: Session = Depends(get_db)):
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

