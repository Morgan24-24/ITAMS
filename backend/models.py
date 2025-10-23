from sqlalchemy import Column, Integer, String, Float
from database import Base


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
