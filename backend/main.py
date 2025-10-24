from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
from models import Base, Asset
from schemas import AssetCreate
from typing import Optional


app = FastAPI()
Base.metadata.create_all(bind=engine)


# --- CORS setup (to allow frontend requests) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
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