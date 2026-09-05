from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, func
from geoalchemy2 import Geometry
from app.database_pg import Base

class SpatialLocation(Base):
    """
    PostGIS spatial model for landslide risk points, water monitoring nodes, and villages.
    Uses SRID 4326 (WGS 84 GPS standard coordinates).
    """
    __tablename__ = "spatial_locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mongo_id = Column(String(50), nullable=True, index=True)
    village = Column(String(150), nullable=False, index=True)
    district = Column(String(150), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String(50), default="LOW")
    slope_angle = Column(Float, default=0.0)
    rainfall_24h_mm = Column(Float, default=0.0)
    soil_moisture_pct = Column(Float, default=0.0)
    water_ph = Column(Float, nullable=True)
    turbidity_ntu = Column(Float, nullable=True)
    
    # PostGIS Spatial Point (SRID 4326: WGS84)
    geom = Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "mongo_id": self.mongo_id,
            "village": self.village,
            "district": self.district,
            "state": self.state,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "risk_score": self.risk_score,
            "risk_level": self.risk_level,
            "slope_angle": self.slope_angle,
            "rainfall_24h_mm": self.rainfall_24h_mm,
            "soil_moisture_pct": self.soil_moisture_pct,
            "water_ph": self.water_ph,
            "turbidity_ntu": self.turbidity_ntu
        }


class SpatialInfrastructure(Base):
    """
    PostGIS model for critical infrastructure points (Roads, Power Grids, Water Treatment Plants, Bridges).
    """
    __tablename__ = "spatial_infrastructure"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    type = Column(String(100), nullable=False, index=True) # Road, Power, Water, Hospital, Bridge
    district = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), default="OPERATIONAL") # OPERATIONAL, AT_RISK, DAMAGED
    
    geom = Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "district": self.district,
            "state": self.state,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status
        }


class SpatialRiskZone(Base):
    """
    PostGIS model for multi-point polygon boundaries (Catchment areas, Landslide Hazard Polygons).
    """
    __tablename__ = "spatial_risk_zones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_name = Column(String(200), nullable=False)
    district = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False)
    hazard_rating = Column(String(50), default="HIGH") # CRITICAL, HIGH, MODERATE
    area_sq_km = Column(Float, default=0.0)

    # PostGIS Spatial Polygon (SRID 4326)
    geom = Column(Geometry(geometry_type='POLYGON', srid=4326, spatial_index=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "zone_name": self.zone_name,
            "district": self.district,
            "state": self.state,
            "hazard_rating": self.hazard_rating,
            "area_sq_km": self.area_sq_km
        }


class SpatialEvacuationShelter(Base):
    """
    PostGIS model for emergency evacuation centers.
    """
    __tablename__ = "spatial_evacuation_shelters"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    district = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False)
    capacity = Column(Integer, default=500)
    current_occupancy = Column(Integer, default=0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), default="READY") # READY, ACTIVE, FULL
    
    geom = Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "district": self.district,
            "state": self.state,
            "capacity": self.capacity,
            "current_occupancy": self.current_occupancy,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status
        }
