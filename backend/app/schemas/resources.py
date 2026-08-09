from datetime import date
from decimal import Decimal
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.common import ResourceResponse


class FlexibleModel(BaseModel):
    model_config = ConfigDict(extra="allow")


class BankCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=2, max_length=20)
    country: str = "Zambia"
    address: str = ""
    status: str = "active"
class BankUpdate(BankCreate): pass
class BankResponse(ResourceResponse, BankCreate): pass


class TestItemCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = ""
    status: str = "draft"
class TestItemUpdate(TestItemCreate): pass
class TestItemResponse(ResourceResponse, TestItemCreate): pass


class AccountCreate(BaseModel):
    model_config = ConfigDict(extra="allow")
    account_number: str = Field(min_length=3, max_length=40)
    name: str | None = Field(default=None, min_length=2, max_length=180)
    account_type: str = "corporate"
    email: EmailStr | None = None
    phone: str = ""
    verification_status: str = "pending"
    balance: Decimal = Decimal("0")
    currency: str = "ZMW"
    status: str = "active"
    details: dict[str, Any] = Field(default_factory=dict)
class AccountUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")
    account_number: str | None = None
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    verification_status: str | None = None
    balance: Decimal | None = None
    currency: str | None = None
    status: str | None = None
    details: dict[str, Any] | None = None
class AccountResponse(ResourceResponse):
    account_number: str
    name: str
    account_type: str
    email: str
    phone: str
    verification_status: str
    balance: Decimal
    currency: str
    details: dict[str, Any]


class NamedResourceCreate(FlexibleModel):
    name: str
    code: str
    description: str = ""
    status: str = "active"
class NamedResourceUpdate(FlexibleModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    status: str | None = None
class StationTypeResponse(ResourceResponse, NamedResourceCreate): pass


class StationGroupCreate(FlexibleModel):
    name: str
    code: str
    oil_marketing_company_id: int | None = None
    manager_name: str = ""
    status: str = "active"
class StationGroupUpdate(FlexibleModel):
    name: str | None = None
    code: str | None = None
    oil_marketing_company_id: int | None = None
    manager_name: str | None = None
    status: str | None = None
class StationGroupResponse(ResourceResponse, StationGroupCreate): pass


class StationCreate(FlexibleModel):
    name: str
    code: str
    station_type_id: int | None = None
    station_group_id: int | None = None
    oil_marketing_company_id: int | None = None
    province_id: int | None = None
    district_id: int | None = None
    address: str = ""
    status: str = "active"
class StationUpdate(FlexibleModel):
    name: str | None = None
    code: str | None = None
    station_type_id: int | None = None
    station_group_id: int | None = None
    oil_marketing_company_id: int | None = None
    province_id: int | None = None
    district_id: int | None = None
    address: str | None = None
    status: str | None = None
class StationResponse(ResourceResponse, StationCreate): pass


class PriceBoardCreate(FlexibleModel):
    station_id: int
    product_id: int
    selling_price: Decimal
    effective_date: date | None = None
    status: str = "active"
class PriceBoardUpdate(FlexibleModel):
    station_id: int | None = None
    product_id: int | None = None
    selling_price: Decimal | None = None
    effective_date: date | None = None
    status: str | None = None
class PriceBoardResponse(ResourceResponse, PriceBoardCreate): pass


class InspectionCreate(FlexibleModel):
    station_id: int
    inspection_type: str
    inspection_date: date
    inspector_name: str = ""
    result: str = "pending"
    notes: str = ""
    status: str = "active"
class InspectionUpdate(FlexibleModel):
    station_id: int | None = None
    inspection_type: str | None = None
    inspection_date: date | None = None
    inspector_name: str | None = None
    result: str | None = None
    notes: str | None = None
    status: str | None = None
class InspectionResponse(ResourceResponse, InspectionCreate): pass


class PerformanceCreate(FlexibleModel):
    station_id: int
    period: str
    sales_volume: Decimal = Decimal("0")
    revenue: Decimal = Decimal("0")
    transactions: int = 0
    status: str = "active"
class PerformanceUpdate(FlexibleModel):
    period: str | None = None
    sales_volume: Decimal | None = None
    revenue: Decimal | None = None
    transactions: int | None = None
    status: str | None = None
class PerformanceResponse(ResourceResponse, PerformanceCreate): pass


class DocumentCreate(FlexibleModel):
    station_id: int
    document_type: str
    document_name: str
    document_number: str = ""
    issued_by: str = ""
    issue_date: date | None = None
    expiry_date: date | None = None
    file: str
    verification_status: str = "pending"
    notes: str = ""
    status: str = "active"
class DocumentUpdate(FlexibleModel):
    document_type: str | None = None
    document_name: str | None = None
    document_number: str | None = None
    issued_by: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    file: str | None = None
    verification_status: str |