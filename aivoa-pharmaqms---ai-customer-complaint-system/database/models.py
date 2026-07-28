"""
SQLAlchemy ORM Models for AiVoA PharmaQMS Database Schema.
Implements normalized 3NF structures with cascade deletes and indexes.
"""

from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, Date, DateTime, ForeignKey
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Role(Base):
    __tablename__ = "roles"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    can_approve_capa = Column(Boolean, default=False)
    can_sign_investigations = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(String(50), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(String(50), ForeignKey("roles.id"), index=True)
    department = Column(String(100), nullable=True)
    esign_hash = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    complaints = relationship("Complaint", back_populates="assignee")
    audit_logs = relationship("AuditLog", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    id = Column(String(50), primary_key=True)
    product_code = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    grade = Column(String(100), nullable=False, index=True)
    ndc_code = Column(String(100), nullable=True)
    formulation_type = Column(String(100), nullable=True)
    active_ingredient = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="product")

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String(50), primary_key=True)
    customer_code = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False, index=True)
    institution_type = Column(String(100), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaints = relationship("Complaint", back_populates="customer")

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(String(50), primary_key=True)
    complaint_code = Column(String(100), unique=True, nullable=False)
    source = Column(String(100), nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.id"), nullable=True)
    customer_name = Column(String(255), nullable=False)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=True)
    product_name = Column(String(255), nullable=False)
    product_grade = Column(String(100), nullable=True)
    batch_number = Column(String(100), nullable=False, index=True)
    manufacturing_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    quantity_affected = Column(String(100), nullable=True)
    complaint_type = Column(String(100), nullable=False)
    complaint_date = Column(Date, nullable=False, index=True)
    description = Column(Text, nullable=False)
    initial_severity = Column(String(50), default="Medium")
    priority = Column(String(50), default="Standard")
    status = Column(String(100), default="PENDING_TRIAGE", index=True)
    assigned_to = Column(String(50), ForeignKey("users.id"), nullable=True)
    completeness_score = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="complaints")
    product = relationship("Product", back_populates="complaints")
    assignee = relationship("User", back_populates="complaints")
    attachments = relationship("Attachment", back_populates="complaint", cascade="all, delete-orphan")
    risk_assessment = relationship("RiskAssessment", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    ai_summary = relationship("AISummary", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    capas = relationship("CAPA", back_populates="complaint", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="complaint", cascade="all, delete-orphan")

class Attachment(Base):
    __tablename__ = "attachments"
    id = Column(String(50), primary_key=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id", ondelete="CASCADE"), index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    storage_url = Column(String(500), nullable=True)
    ocr_extracted_text = Column(Text, nullable=True)
    uploaded_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="attachments")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id = Column(String(50), primary_key=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id", ondelete="CASCADE"), unique=True)
    ich_risk_class = Column(String(50), nullable=False, index=True)
    severity = Column(String(50), nullable=False)
    risk_score = Column(Integer, nullable=False)
    ich_justification = Column(Text, nullable=False)
    assessed_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    assessed_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="risk_assessment")

class AISummary(Base):
    __tablename__ = "ai_summaries"
    id = Column(String(50), primary_key=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id", ondelete="CASCADE"), unique=True, index=True)
    executive_summary = Column(Text, nullable=False)
    ishikawa_rca_json = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.95)
    duplicate_probability = Column(Float, default=0.0)
    matched_complaint_id = Column(String(50), nullable=True)
    embeddings = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="ai_summary")

class CAPA(Base):
    __tablename__ = "capa"
    id = Column(String(50), primary_key=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id", ondelete="CASCADE"), index=True)
    title = Column(String(255), nullable=False)
    action_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    owner = Column(String(100), nullable=False)
    target_days = Column(Integer, default=14)
    status = Column(String(50), default="PROPOSED", index=True)
    approved_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="capas")

class AuditLog(Base):
    """Immutable FDA 21 CFR Part 11 Electronic Ledger"""
    __tablename__ = "audit_logs"
    id = Column(String(50), primary_key=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), index=True, nullable=True)
    user_id = Column(String(50), ForeignKey("users.id"), index=True, nullable=True)
    user_email = Column(String(255), nullable=True)
    action_type = Column(String(100), nullable=False)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    esign_reason = Column(String(255), nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    complaint = relationship("Complaint", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
