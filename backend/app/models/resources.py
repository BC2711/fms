from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    JSON,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Boolean,
    Integer,
    Enum as SQLEnum,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.database.mixins import ResourceMixin


class Country(ResourceMixin, Base):
    __tablename__ = "countries"

    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    country_code: Mapped[str] = mapped_column(String(3), unique=True, index=True)

    # Relationships
    provinces: Mapped[list["Province"]] = relationship(back_populates="country")

    __table_args__ = (
        UniqueConstraint("name", "country_code", name="uq_country_name_code"),
    )


class Province(ResourceMixin, Base):
    __tablename__ = "provinces"

    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    # Relationships
    country: Mapped["Country"] = relationship(back_populates="provinces")
    districts: Mapped[list["District"]] = relationship(back_populates="province")

    __table_args__ = (
        UniqueConstraint("country_id", "name", name="uq_province_country_name"),
    )


class District(ResourceMixin, Base):
    __tablename__ = "districts"

    province_id: Mapped[int] = mapped_column(ForeignKey("provinces.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    # Relationships
    province: Mapped["Province"] = relationship(back_populates="districts")
    town_cities: Mapped[list["TownCity"]] = relationship(back_populates="district")

    __table_args__ = (
        UniqueConstraint("province_id", "name", name="uq_district_province_name"),
    )


class TownCity(ResourceMixin, Base):
    __tablename__ = "town_cities"

    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    postal_code: Mapped[str] = mapped_column(String(20), default="", index=True)

    # Relationships
    district: Mapped["District"] = relationship(back_populates="town_cities")

    __table_args__ = (
        UniqueConstraint("district_id", "name", name="uq_town_city_district_name"),
    )


class Menu(ResourceMixin, Base):
    __tablename__ = "menus"


class UserType(ResourceMixin, Base):
    __tablename__ = "user_types"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    permissions: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Relationships
    users: Mapped[list["User"]] = relationship(back_populates="user_type")
    menus: Mapped[list["Menu"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="user_types"
    )
    assigned_permissions: Mapped[list["Permissions"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="user_types"
    )


class Role(ResourceMixin, Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    permissions: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Relationships
    users: Mapped[list["User"]] = relationship(back_populates="role")
    menus: Mapped[list["Menu"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="roles"
    )
    assigned_permissions: Mapped[list["Permissions"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="roles"
    )


class Permissions(ResourceMixin, Base):
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    module: Mapped[str] = mapped_column(
        String(50), index=True
    )  # e.g., users, stations, products
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Relationships
    menus: Mapped[list["Menu"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="permissions"
    )
    roles: Mapped[list["Role"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="permissions"
    )
    user_types: Mapped[list["UserType"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="permissions"
    )


class Menu(ResourceMixin, Base):
    __tablename__ = "menus"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    icon: Mapped[str] = mapped_column(String(50), default="")
    route: Mapped[str] = mapped_column(String(200), default="")
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("menus.id"), nullable=True, index=True
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")

    # Relationships
    parent: Mapped["Menu"] = relationship(remote_side="Menu.id", backref="children")
    permissions: Mapped[list["Permissions"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="menus"
    )
    roles: Mapped[list["Role"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="menus"
    )
    user_types: Mapped[list["UserType"]] = relationship(
        secondary="assigned_menus_and_permissions", back_populates="menus"
    )


class AssignedMenusAndPermissions(ResourceMixin, Base):
    __tablename__ = "assigned_menus_and_permissions"

    menu_id: Mapped[int | None] = mapped_column(
        ForeignKey("menus.id"), nullable=True, index=True
    )
    permission_id: Mapped[int | None] = mapped_column(
        ForeignKey("permissions.id"), nullable=True, index=True
    )
    role_id: Mapped[int | None] = mapped_column(
        ForeignKey("roles.id"), nullable=True, index=True
    )
    user_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("user_types.id"), nullable=True, index=True
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Relationships
    menu: Mapped["Menu"] = relationship()
    permission: Mapped["Permissions"] = relationship()
    role: Mapped["Role"] = relationship()
    user_type: Mapped["UserType"] = relationship()
    user: Mapped["User"] = relationship()

    __table_args__ = (
        Index(
            "idx_assigned_menu_permission",
            "menu_id",
            "permission_id",
            "role_id",
            "user_type_id",
            "user_id",
        ),
    )


class User(ResourceMixin, Base):
    __tablename__ = "users"

    first_name: Mapped[str] = mapped_column(String(100), index=True)
    last_name: Mapped[str] = mapped_column(String(100), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    nrc: Mapped[str] = mapped_column(String(50), unique=True, nullable=True, index=True)
    nrc_front: Mapped[str] = mapped_column(Text, nullable=True)
    nrc_back: Mapped[str] = mapped_column(Text, nullable=True)
    is_super_user: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    profile_picture: Mapped[str] = mapped_column(Text, nullable=True)
    current_address: Mapped[str] = mapped_column(Text, default="")

    # Foreign Keys
    user_type_id: Mapped[int] = mapped_column(ForeignKey("user_types.id"), index=True)
    role_id: Mapped[int | None] = mapped_column(
        ForeignKey("roles.id"), nullable=True, index=True
    )
    province_id: Mapped[int | None] = mapped_column(
        ForeignKey("provinces.id"), nullable=True, index=True
    )
    district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"), nullable=True, index=True
    )
    town_city_id: Mapped[int | None] = mapped_column(
        ForeignKey("town_cities.id"), nullable=True, index=True
    )

    # Next of Kin
    next_of_kin_first_name: Mapped[str] = mapped_column(String(100), default="")
    next_of_kin_last_name: Mapped[str] = mapped_column(String(100), default="")
    next_of_kin_phone: Mapped[str] = mapped_column(String(20), default="")
    next_of_kin_relationship: Mapped[str] = mapped_column(String(50), default="")

    # Security and Status
    login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Relationships
    user_type: Mapped["UserType"] = relationship(back_populates="users")
    role: Mapped["Role"] = relationship(back_populates="users")
    accounts: Mapped[list["Account"]] = relationship(back_populates="user")

    __table_args__ = (
        Index("idx_user_name", "first_name", "last_name"),
        Index("idx_user_status_type", "status", "user_type_id"),
    )


class Account(ResourceMixin, Base):
    __tablename__ = "accounts"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    account_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    account_type: Mapped[str] = mapped_column(String(40), index=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str] = mapped_column(String(40), default="")
    verification_status: Mapped[str] = mapped_column(
        String(32), default="pending", index=True
    )
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="ZMW")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="accounts")
    station_groups: Mapped[list["StationGroup"]] = relationship(
        back_populates="oil_marketing_company"
    )
    stations: Mapped[list["Station"]] = relationship(
        back_populates="oil_marketing_company"
    )


class StationType(ResourceMixin, Base):
    __tablename__ = "station_types"

    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    stations: Mapped[list["Station"]] = relationship(back_populates="station_type")


class StationGroup(ResourceMixin, Base):
    __tablename__ = "station_groups"

    name: Mapped[str] = mapped_column(String(160), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    oil_marketing_company_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id"), index=True
    )
    manager_name: Mapped[str] = mapped_column(String(160), default="")
    manager_phone: Mapped[str] = mapped_column(String(20), default="")
    manager_email: Mapped[str] = mapped_column(String(255), default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    oil_marketing_company: Mapped["Account"] = relationship(
        back_populates="station_groups"
    )
    stations: Mapped[list["Station"]] = relationship(back_populates="station_group")


class Station(ResourceMixin, Base):
    __tablename__ = "stations"

    name: Mapped[str] = mapped_column(String(180), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    station_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("station_types.id"), index=True
    )
    station_group_id: Mapped[int | None] = mapped_column(
        ForeignKey("station_groups.id"), index=True
    )
    oil_marketing_company_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id"), index=True
    )
    province_id: Mapped[int | None] = mapped_column(
        ForeignKey("provinces.id"), index=True
    )
    district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"), index=True
    )
    town_city_id: Mapped[int | None] = mapped_column(
        ForeignKey("town_cities.id"), index=True
    )
    address: Mapped[str] = mapped_column(Text, default="")
    latitude: Mapped[str] = mapped_column(String(50), default="")
    longitude: Mapped[str] = mapped_column(String(50), default="")
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    station_type: Mapped["StationType"] = relationship(back_populates="stations")
    station_group: Mapped["StationGroup"] = relationship(back_populates="stations")
    oil_marketing_company: Mapped["Account"] = relationship(back_populates="stations")
    price_boards: Mapped[list["StationPriceBoard"]] = relationship(
        back_populates="station"
    )
    inspections: Mapped[list["StationInspection"]] = relationship(
        back_populates="station"
    )
    performances: Mapped[list["StationPerformance"]] = relationship(
        back_populates="station"
    )
    documents: Mapped[list["StationDocument"]] = relationship(back_populates="station")
    inventories: Mapped[list["Inventory"]] = relationship(back_populates="station")


class StationPriceBoard(ResourceMixin, Base):
    __tablename__ = "station_price_boards"

    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    effective_date: Mapped[date | None] = mapped_column(Date)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    station: Mapped["Station"] = relationship(back_populates="price_boards")
    product: Mapped["Product"] = relationship(back_populates="price_boards")


class StationInspection(ResourceMixin, Base):
    __tablename__ = "station_inspections"

    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    inspection_type: Mapped[str] = mapped_column(String(80), index=True)
    inspection_date: Mapped[date] = mapped_column(Date, index=True)
    inspector_name: Mapped[str] = mapped_column(String(160), default="")
    inspector_phone: Mapped[str] = mapped_column(String(20), default="")
    result: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    station: Mapped["Station"] = relationship(back_populates="inspections")


class StationPerformance(ResourceMixin, Base):
    __tablename__ = "station_performance"

    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    period: Mapped[str] = mapped_column(
        String(20), index=True
    )  # e.g., "2024-01", "2024-Q1", "2024"
    sales_volume: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    revenue: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    transactions: Mapped[int] = mapped_column(Integer, default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    station: Mapped["Station"] = relationship(back_populates="performances")

    __table_args__ = (
        UniqueConstraint("station_id", "period", name="uq_station_period"),
    )


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
    verification_status: Mapped[str] = mapped_column(
        String(32), default="pending", index=True
    )
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    # Relationships
    station: Mapped["Station"] = relationship(back_populates="documents")


class Bank(ResourceMixin, Base):
    __tablename__ = "banks"

    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    country: Mapped[str] = mapped_column(String(80), index=True)
    address: Mapped[str] = mapped_column(Text, default="")
    swift_code: Mapped[str] = mapped_column(String(20), default="", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class ProductCategory(ResourceMixin, Base):
    __tablename__ = "product_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)

    # Relationships
    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(ResourceMixin, Base):
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(120), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("product_categories.id"), nullable=True, index=True
    )
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    unit_of_measure: Mapped[str] = mapped_column(String(20), default="litre")
    is_fuel: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Relationships
    category: Mapped["ProductCategory"] = relationship(back_populates="products")
    price_boards: Mapped[list["StationPriceBoard"]] = relationship(
        back_populates="product"
    )
    inventory_items: Mapped[list["Inventory"]] = relationship(back_populates="product")
    prices: Mapped[list["Price"]] = relationship(back_populates="product")


class Price(ResourceMixin, Base):
    __tablename__ = "prices"

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    effective_date: Mapped[date] = mapped_column(Date, index=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    price_type: Mapped[str] = mapped_column(
        String(30), default="wholesale"
    )  # wholesale, retail, government
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)

    # Relationships
    product: Mapped["Product"] = relationship(back_populates="prices")

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "price_type",
            "effective_date",
            name="uq_product_price_type_date",
        ),
    )


class Inventory(ResourceMixin, Base):
    __tablename__ = "inventories"

    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    reorder_level: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default="active", index=True)

    # Relationships
    station: Mapped["Station"] = relationship(back_populates="inventories")
    product: Mapped["Product"] = relationship(back_populates="inventory_items")

    __table_args__ = (
        UniqueConstraint(
            "station_id", "product_id", name="uq_station_product_inventory"
        ),
    )


class Stock(ResourceMixin, Base):
    __tablename__ = "stocks"

    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    transaction_type: Mapped[str] = mapped_column(
        String(30), index=True
    )  # purchase, sale, transfer, adjustment
    transaction_date: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, index=True
    )
    reference_number: Mapped[str] = mapped_column(String(50), default="", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")

    # Relationships
    station: Mapped["Station"] = relationship()
    product: Mapped["Product"] = relationship()

    __table_args__ = (
        Index(
            "idx_stock_station_product_date",
            "station_id",
            "product_id",
            "transaction_date",
        ),
    )
