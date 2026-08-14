from datetime import date
from decimal import Decimal
from typing import Any

from sqlalchemy import Date, ForeignKey, JSON, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import ResourceMixin


class Bank(ResourceMixin, Base):
    __tablename__ = "banks"
    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    country: Mapped[str] = mapped_column(String(80), index=True)
    address: Mapped[str] = mapped_column(Text, default="")


class TestItem(ResourceMixin, Base):
    __tablename__ = "test_items"
    name: Mapped[str] = mapped_column(String(120), index=True)
    description: Mapped[str] = mapped_column(Text, default="")


class Account(ResourceMixin, Base):
    __tablename__ = "accounts"
    account_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    account_type: Mapped[str] = mapped_column(String(40), index=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str] = mapped_column(String(40), default="")
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="ZMW")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class StationType(ResourceMixin, Base):
    __tablename__ = "station_types"
    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class StationGroup(ResourceMixin, Base):
    __tablename__ = "station_groups"
    name: Mapped[str] = mapped_column(String(160), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    oil_marketing_company_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), index=True)
    manager_name: Mapped[str] = mapped_column(String(160), default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class Station(ResourceMixin, Base):
    __tablename__ = "stations"
    name: Mapped[str] = mapped_column(String(180), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    station_type_id: Mapped[int | None] = mapped_column(ForeignKey("station_types.id"), index=True)
    station_group_id: Mapped[int | None] = mapped_column(ForeignKey("station_groups.id"), index=True)
    oil_marketing_company_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), index=True)
    province_id: Mapped[int | None] = mapped_column(index=True)
    district_id: Mapped[int | None] = mapped_column(index=True)
    address: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class StationPriceBoard(ResourceMixin, Base):
    __tablename__ = "station_price_boards"
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    product_id: Mapped[int] = mapped_column(index=True)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    effective_date: Mapped[date | None] = mapped_column(Date)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class StationInspection(ResourceMixin, Base):
    __tablename__ = "station_inspections"
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    inspection_type: Mapped[str] = mapped_column(String(80), index=True)
    inspection_date: Mapped[date] = mapped_column(Date, index=True)
    inspector_name: Mapped[str] = mapped_column(String(160), default="")
    result: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class StationPerformance(ResourceMixin, Base):
    __tablename__ = "station_performance"
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    period: Mapped[str] = mapped_column(String(20), index=True)
    sales_volume: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    revenue: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    transactions: Mapped[int] = mapped_column(default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class StationDocument(ResourceMixin, Base):
    __tablename__ = "station_documents"
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    document_type: Mapped[str] = mapped_column(String(80), index=True)
    document_name: Mapped[str] = mapped_column(String(200), index=True)
    document_number: Mapped[str] = mapped_column(String(100), default="", index=True)
    issued_by: Mapped[str] = mapped_column(String(160), default="")
    issue_date: Mapped[date | None] = mapped_column(Date)
    expiry_date: Mapped[date | None] = mapped_column(Date, index=True)
    file: Mapped[str] = mapped_column(Text)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class GenericRecord(ResourceMixin, Base):
    __tablename__ = "generic_records"
    __table_args__ = (UniqueConstraint("resource_path", "code", name="uq_generic_resource_code"),)
    resource_path: Mapped[str] = mapped_column(String(255), index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    code: Mapped[str] = mapped_column(String(80), default="", index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    country_id: Mapped[int | None] = mapped_column(ForeignKey("generic_records.id"), index=True)
    province_id: Mapped[int | None] = mapped_column(ForeignKey("generic_records.id"), index=True)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("generic_records.id"), index=True)
    data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
