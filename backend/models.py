
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# Asset Model (Table Definition)

class Asset(Base):
    __tablename__ = "assets"  # This becomes the table name in SQLite

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    serial = Column(String, unique=True, nullable=False)
    purchase_date = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    warranty_status = Column(String, nullable=False)
    status = Column(String, nullable=False)
    assignee = Column(String, nullable=True)
    department = Column(String, nullable=True)
    location = Column(String, nullable=True)

class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    date = Column(DateTime, default=datetime.utcnow)
    activity = Column(String, nullable=False)
    cost = Column(Float, default=0.0)
    notes = Column(String, nullable=True)

    # Relationship to the Asset table
    asset = relationship("Asset", backref="maintenance_records")

class SoftwareLicense(Base):
    __tablename__ = "software_licenses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    vendor = Column(String, nullable=False)
    license_key = Column(String, unique=True, nullable=False)
    purchase_date = Column(String, nullable=False)
    expiry_date = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    assigned_to = Column(String, nullable=True)
    department = Column(String, nullable=True)
    status = Column(String, nullable=False)  # Active, Expired, Renewed
