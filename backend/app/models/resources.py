from datetime import date, datetime
from decimal import Decimal
from typing import Any, Optional
from uuid import uuid4

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
    Table,
    Column,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

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


role_menus = Table(
    "role_menus", Base.metadata,
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("menu_id", ForeignKey("menus.id", ondelete="CASCADE"), primary_key=True),
    Index("ix_role_menus_menu_id", "menu_id"),
)
role_permissions = Table(
    "role_permissions", Base.metadata,
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
    Index("ix_role_permissions_permission_id", "permission_id"),
)
user_type_menus = Table(
    "user_type_menus", Base.metadata,
    Column("user_type_id", ForeignKey("user_types.id", ondelete="CASCADE"), primary_key=True),
    Column("menu_id", ForeignKey("menus.id", ondelete="CASCADE"), primary_key=True),
    Index("ix_user_type_menus_menu_id", "menu_id"),
)
user_type_permissions = Table(
    "user_type_permissions", Base.metadata,
    Column("user_type_id", ForeignKey("user_types.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
    Index("ix_user_type_permissions_permission_id", "permission_id"),
)
user_roles = Table(
    "user_roles", Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Index("ix_user_roles_role_id", "role_id"),
)


class UserType(ResourceMixin, Base):
    __tablename__ = "user_types"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Relationships
    users: Mapped[list["User"]] = relationship(
        back_populates="user_type", foreign_keys="User.user_type_id"
    )
    menus: Mapped[list["Menu"]] = relationship(secondary=user_type_menus, back_populates="user_types")
    permissions: Mapped[list["Permission"]] = relationship(secondary=user_type_permissions, back_populates="user_types")


class Role(ResourceMixin, Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    code: Mapped[str] = mapped_column(String(64), unique=True, index=True, default=lambda: f"role-{uuid4().hex[:12]}")
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("roles.id"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Relationships
    parent: Mapped[Optional["Role"]] = relationship(remote_side="Role.id", back_populates="children")
    children: Mapped[list["Role"]] = relationship(back_populates="parent")
    users: Mapped[list["User"]] = relationship(secondary=user_roles, back_populates="roles")
    menus: Mapped[list["Menu"]] = relationship(secondary=role_menus, back_populates="roles")
    permissions: Mapped[list["Permission"]] = relationship(secondary=role_permissions, back_populates="roles")


class Permission(ResourceMixin, Base):
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(String(100), index=True)
    code: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    module: Mapped[str] = mapped_column(
        String(50), index=True
    )  # e.g., users, stations, products
    action: Mapped[str] = mapped_column(String(32), index=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)

    # Relationships
    menus: Mapped[list["Menu"]] = relationship(back_populates="permission")
    roles: Mapped[list["Role"]] = relationship(secondary=role_permissions, back_populates="permissions")
    user_types: Mapped[list["UserType"]] = relationship(secondary=user_type_permissions, back_populates="permissions")


class Menu(ResourceMixin, Base):
    __tablename__ = "menus"

    name: Mapped[str] = mapped_column(String(100), index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    icon: Mapped[str] = mapped_column(String(50), default="")
    route: Mapped[str] = mapped_column(String(200), default="")
    component: Mapped[str] = mapped_column(String(160), default="")
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict)
    permission_id: Mapped[int | None] = mapped_column(ForeignKey("permissions.id"), nullable=True, index=True)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("menus.id"), nullable=True, index=True
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")

    # Relationships
    parent: Mapped[Optional["Menu"]] = relationship(remote_side="Menu.id", back_populates="children")
    children: Mapped[list["Menu"]] = relationship(back_populates="parent", order_by="Menu.sort_order")
    permission: Mapped[Optional["Permission"]] = relationship(back_populates="menus", foreign_keys=[permission_id])
    roles: Mapped[list["Role"]] = relationship(secondary=role_menus, back_populates="menus")
    user_types: Mapped[list["UserType"]] = relationship(secondary=user_type_menus, back_populates="menus")


class UserMenuOverride(ResourceMixin, Base):
    __tablename__ = "user_menu_overrides"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    menu_id: Mapped[int] = mapped_column(ForeignKey("menus.id", ondelete="CASCADE"), index=True)
    is_granted: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    user: Mapped["User"] = relationship(back_populates="menu_overrides", foreign_keys=[user_id])
    menu: Mapped["Menu"] = relationship()
    __table_args__ = (UniqueConstraint("user_id", "menu_id", name="uq_user_menu_override"),)


class UserPermissionOverride(ResourceMixin, Base):
    __tablename__ = "user_permission_overrides"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    permission_id: Mapped[int] = mapped_column(ForeignKey("permissions.id", ondelete="CASCADE"), index=True)
    is_granted: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    user: Mapped["User"] = relationship(back_populates="permission_overrides", foreign_keys=[user_id])
    permission: Mapped["Permission"] = relationship()
    __table_args__ = (UniqueConstraint("user_id", "permission_id", name="uq_user_permission_override"),)


class User(ResourceMixin, Base):
    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(String(160), index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_super_user: Mapped[bool] = mapped_column(Boolean, default=False, index=True)

    # Foreign Keys
    user_type_id: Mapped[int | None] = mapped_column(ForeignKey("user_types.id"), nullable=True, index=True)

    # Relationships
    user_type: Mapped["UserType"] = relationship(
        back_populates="users", foreign_keys=[user_type_id]
    )
    roles: Mapped[list["Role"]] = relationship(secondary=user_roles, back_populates="users")
    menu_overrides: Mapped[list["UserMenuOverride"]] = relationship(back_populates="user", foreign_keys="UserMenuOverride.user_id", cascade="all, delete-orphan")
    permission_overrides: Mapped[list["UserPermissionOverride"]] = relationship(back_populates="user", foreign_keys="UserPermissionOverride.user_id", cascade="all, delete-orphan")
    accounts: Mapped[list["Account"]] = relationship(
        back_populates="user", foreign_keys="Account.user_id"
    )

    __table_args__ = (
        Index("idx_user_name", "full_name"),
        Index("idx_user_status_type", "status", "user_type_id"),
    )

    is_superuser = synonym("is_super_user")

    @property
    def permission_codes(self) -> set[str]:
        if self.is_super_user:
            return {"*"}
        permissions = {permission.code for role in self.roles if role.is_active for permission in role.permissions if permission.is_active}
        if self.user_type and self.user_type.is_active:
            permissions.update(permission.code for permission in self.user_type.permissions if permission.is_active)
        for override in self.permission_overrides:
            if override.is_granted and override.permission.is_active:
                permissions.add(override.permission.code)
            else:
                permissions.discard(override.permission.code)
        return permissions


# Transitional import compatibility for older modules.
Permissions = Permission


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
    user: Mapped["User"] = relationship(back_populates="accounts", foreign_keys=[user_id])
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


# Generic records back configuration-driven CRUD pages which have not yet been
# promoted to a strongly typed domain model.  Keeping the resource path in the
# unique key prevents codes used by different screens from colliding.
class GenericRecord(ResourceMixin, Base):
    __tablename__ = "generic_records"

    resource_path: Mapped[str] = mapped_column(String(160), index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    code: Mapped[str] = mapped_column(String(80), default="", index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    data: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    country_id: Mapped[int | None] = mapped_column(ForeignKey("generic_records.id"), nullable=True, index=True)
    province_id: Mapped[int | None] = mapped_column(ForeignKey("generic_records.id"), nullable=True, index=True)
    district_id: Mapped[int | None] = mapped_column(ForeignKey("generic_records.id"), nullable=True, index=True)

    __table_args__ = (
        UniqueConstraint("resource_path", "code", name="uq_generic_resource_code"),
        Index("idx_generic_resource_status", "resource_path", "status"),
    )


class TestItem(ResourceMixin, Base):
    """Small persisted resource used by the system readiness endpoint."""

    __tablename__ = "test_items"

    name: Mapped[str] = mapped_column(String(120), index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class StationRegion(ResourceMixin, Base):
    __tablename__ = "station_regions"

    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    province_id: Mapped[int | None] = mapped_column(
        ForeignKey("provinces.id"), nullable=True, index=True
    )
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    province: Mapped[Optional["Province"]] = relationship()
    stations: Mapped[list["StationRegionAssignment"]] = relationship(
        back_populates="region"
    )


class StationRegionAssignment(ResourceMixin, Base):
    __tablename__ = "station_region_assignments"

    region_id: Mapped[int] = mapped_column(ForeignKey("station_regions.id"), index=True)
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    region: Mapped["StationRegion"] = relationship(back_populates="stations")
    station: Mapped["Station"] = relationship()

    __table_args__ = (
        UniqueConstraint("region_id", "station_id", name="uq_region_station"),
    )


class StationAttendant(ResourceMixin, Base):
    __tablename__ = "station_attendants"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, index=True)
    employee_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    verification_status: Mapped[str] = mapped_column(
        String(32), default="pending", index=True
    )
    pin_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    assignments: Mapped[list["AttendantAssignment"]] = relationship(
        back_populates="attendant"
    )


class AttendantAssignment(ResourceMixin, Base):
    __tablename__ = "attendant_assignments"

    attendant_id: Mapped[int] = mapped_column(
        ForeignKey("station_attendants.id"), index=True
    )
    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    assignment_type: Mapped[str] = mapped_column(String(30), default="station", index=True)
    pump_number: Mapped[str] = mapped_column(String(30), default="")
    shift_name: Mapped[str] = mapped_column(String(80), default="")
    starts_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    attendant: Mapped["StationAttendant"] = relationship(back_populates="assignments")
    station: Mapped["Station"] = relationship()

    __table_args__ = (
        Index("idx_attendant_assignment_period", "attendant_id", "starts_at", "ends_at"),
    )


class Depot(ResourceMixin, Base):
    __tablename__ = "depots"

    name: Mapped[str] = mapped_column(String(160), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    account_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id"), nullable=True, index=True
    )
    province_id: Mapped[int | None] = mapped_column(
        ForeignKey("provinces.id"), nullable=True, index=True
    )
    district_id: Mapped[int | None] = mapped_column(
        ForeignKey("districts.id"), nullable=True, index=True
    )
    address: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped[Optional["Account"]] = relationship()
    province: Mapped[Optional["Province"]] = relationship()
    district: Mapped[Optional["District"]] = relationship()
    tanks: Mapped[list["StorageTank"]] = relationship(back_populates="depot")


class Warehouse(ResourceMixin, Base):
    __tablename__ = "warehouses"

    name: Mapped[str] = mapped_column(String(160), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    depot_id: Mapped[int | None] = mapped_column(
        ForeignKey("depots.id"), nullable=True, index=True
    )
    station_id: Mapped[int | None] = mapped_column(
        ForeignKey("stations.id"), nullable=True, index=True
    )
    address: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    depot: Mapped[Optional["Depot"]] = relationship()
    station: Mapped[Optional["Station"]] = relationship()


class StorageTank(ResourceMixin, Base):
    __tablename__ = "storage_tanks"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    station_id: Mapped[int | None] = mapped_column(
        ForeignKey("stations.id"), nullable=True, index=True
    )
    depot_id: Mapped[int | None] = mapped_column(
        ForeignKey("depots.id"), nullable=True, index=True
    )
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    capacity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    current_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    station: Mapped[Optional["Station"]] = relationship()
    depot: Mapped[Optional["Depot"]] = relationship(back_populates="tanks")
    product: Mapped["Product"] = relationship()
    readings: Mapped[list["TankReading"]] = relationship(back_populates="tank")


class StockMovement(ResourceMixin, Base):
    __tablename__ = "stock_movements"

    movement_type: Mapped[str] = mapped_column(String(30), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    source_station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    destination_station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    source_depot_id: Mapped[int | None] = mapped_column(ForeignKey("depots.id"), nullable=True, index=True)
    destination_depot_id: Mapped[int | None] = mapped_column(ForeignKey("depots.id"), nullable=True, index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    reference_number: Mapped[str] = mapped_column(String(80), default="", index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    reason: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    product: Mapped["Product"] = relationship()
    source_station: Mapped[Optional["Station"]] = relationship(foreign_keys=[source_station_id])
    destination_station: Mapped[Optional["Station"]] = relationship(foreign_keys=[destination_station_id])
    source_depot: Mapped[Optional["Depot"]] = relationship(foreign_keys=[source_depot_id])
    destination_depot: Mapped[Optional["Depot"]] = relationship(foreign_keys=[destination_depot_id])

    __table_args__ = (Index("idx_stock_movement_product_date", "product_id", "occurred_at"),)


class TankReading(ResourceMixin, Base):
    __tablename__ = "tank_readings"

    tank_id: Mapped[int] = mapped_column(ForeignKey("storage_tanks.id"), index=True)
    reading_type: Mapped[str] = mapped_column(String(30), default="dip", index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    water_level: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    temperature: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    read_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    recorded_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    tank: Mapped["StorageTank"] = relationship(back_populates="readings")
    recorded_by: Mapped[Optional["User"]] = relationship(foreign_keys=[recorded_by_id])


class MeterReading(ResourceMixin, Base):
    __tablename__ = "meter_readings"

    station_id: Mapped[int] = mapped_column(ForeignKey("stations.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    pump_number: Mapped[str] = mapped_column(String(30), index=True)
    reading: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    read_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    station: Mapped["Station"] = relationship()
    product: Mapped["Product"] = relationship()


class PhysicalStockCount(ResourceMixin, Base):
    __tablename__ = "physical_stock_counts"

    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    depot_id: Mapped[int | None] = mapped_column(ForeignKey("depots.id"), nullable=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    counted_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    system_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    counted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    counted_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    station: Mapped[Optional["Station"]] = relationship()
    depot: Mapped[Optional["Depot"]] = relationship()
    product: Mapped["Product"] = relationship()
    counted_by: Mapped[Optional["User"]] = relationship(foreign_keys=[counted_by_id])


class InventoryReconciliation(ResourceMixin, Base):
    __tablename__ = "inventory_reconciliations"

    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    depot_id: Mapped[int | None] = mapped_column(ForeignKey("depots.id"), nullable=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    period_start: Mapped[date] = mapped_column(Date, index=True)
    period_end: Mapped[date] = mapped_column(Date, index=True)
    expected_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    actual_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    variance_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    variance_value: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    station: Mapped[Optional["Station"]] = relationship()
    depot: Mapped[Optional["Depot"]] = relationship()
    product: Mapped["Product"] = relationship()


class InventoryAlert(ResourceMixin, Base):
    __tablename__ = "inventory_alerts"

    inventory_id: Mapped[int] = mapped_column(ForeignKey("inventories.id"), index=True)
    alert_type: Mapped[str] = mapped_column(String(40), default="low_stock", index=True)
    threshold: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    observed_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    acknowledged_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    acknowledged_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    inventory: Mapped["Inventory"] = relationship()
    acknowledged_by: Mapped[Optional["User"]] = relationship(foreign_keys=[acknowledged_by_id])


class InventoryValuation(ResourceMixin, Base):
    __tablename__ = "inventory_valuations"

    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    depot_id: Mapped[int | None] = mapped_column(ForeignKey("depots.id"), nullable=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    valuation_date: Mapped[date] = mapped_column(Date, index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    total_value: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    method: Mapped[str] = mapped_column(String(30), default="weighted_average", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    station: Mapped[Optional["Station"]] = relationship()
    depot: Mapped[Optional["Depot"]] = relationship()
    product: Mapped["Product"] = relationship()

    __table_args__ = (UniqueConstraint("station_id", "depot_id", "product_id", "valuation_date", name="uq_inventory_valuation_scope_date"),)


class FuelRequest(ResourceMixin, Base):
    __tablename__ = "fuel_requests"

    request_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    requested_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    required_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="ZMW")
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    requested_by: Mapped["User"] = relationship(foreign_keys=[requested_by_id])
    station: Mapped[Optional["Station"]] = relationship()
    items: Mapped[list["FuelRequestItem"]] = relationship(back_populates="request")
    approvals: Mapped[list["Approval"]] = relationship(back_populates="fuel_request")
    orders: Mapped[list["FuelOrder"]] = relationship(back_populates="fuel_request")


class FuelRequestItem(ResourceMixin, Base):
    __tablename__ = "fuel_request_items"

    request_id: Mapped[int] = mapped_column(ForeignKey("fuel_requests.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    unit_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    allocated_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    request: Mapped["FuelRequest"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()

    __table_args__ = (UniqueConstraint("request_id", "product_id", name="uq_request_product"),)


class FuelOrder(ResourceMixin, Base):
    __tablename__ = "fuel_orders"

    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    fuel_request_id: Mapped[int | None] = mapped_column(ForeignKey("fuel_requests.id"), nullable=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    order_date: Mapped[date] = mapped_column(Date, default=date.today, index=True)
    expected_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="ZMW")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    fuel_request: Mapped[Optional["FuelRequest"]] = relationship(back_populates="orders")
    account: Mapped["Account"] = relationship()
    station: Mapped[Optional["Station"]] = relationship()
    items: Mapped[list["FuelOrderItem"]] = relationship(back_populates="order")
    approvals: Mapped[list["Approval"]] = relationship(back_populates="fuel_order")
    deliveries: Mapped[list["Delivery"]] = relationship(back_populates="order")


class FuelOrderItem(ResourceMixin, Base):
    __tablename__ = "fuel_order_items"

    order_id: Mapped[int] = mapped_column(ForeignKey("fuel_orders.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    delivered_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    order: Mapped["FuelOrder"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()


class Approval(ResourceMixin, Base):
    __tablename__ = "approvals"

    fuel_request_id: Mapped[int | None] = mapped_column(ForeignKey("fuel_requests.id"), nullable=True, index=True)
    fuel_order_id: Mapped[int | None] = mapped_column(ForeignKey("fuel_orders.id"), nullable=True, index=True)
    approver_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    approval_type: Mapped[str] = mapped_column(String(40), index=True)
    sequence: Mapped[int] = mapped_column(Integer, default=1)
    decision: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    decided_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    comments: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    fuel_request: Mapped[Optional["FuelRequest"]] = relationship(back_populates="approvals")
    fuel_order: Mapped[Optional["FuelOrder"]] = relationship(back_populates="approvals")
    approver: Mapped[Optional["User"]] = relationship(foreign_keys=[approver_id])


class FuelAllocation(ResourceMixin, Base):
    __tablename__ = "fuel_allocations"

    allocation_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    vehicle_id: Mapped[int | None] = mapped_column(ForeignKey("vehicles.id"), nullable=True, index=True)
    driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True, index=True)
    allocated_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    used_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    starts_on: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    expires_on: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    product: Mapped["Product"] = relationship()
    vehicle: Mapped[Optional["Vehicle"]] = relationship()
    driver: Mapped[Optional["Driver"]] = relationship()
    usage: Mapped[list["AllocationUsage"]] = relationship(back_populates="allocation")


class AllocationUsage(ResourceMixin, Base):
    __tablename__ = "allocation_usage"

    allocation_id: Mapped[int] = mapped_column(ForeignKey("fuel_allocations.id"), index=True)
    transaction_id: Mapped[int | None] = mapped_column(ForeignKey("transactions.id"), nullable=True, index=True)
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    used_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    allocation: Mapped["FuelAllocation"] = relationship(back_populates="usage")
    transaction: Mapped[Optional["Transaction"]] = relationship()


class VehicleCategory(ResourceMixin, Base):
    __tablename__ = "vehicle_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class VehicleGroup(ResourceMixin, Base):
    __tablename__ = "vehicle_groups"

    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(40), index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    __table_args__ = (UniqueConstraint("account_id", "code", name="uq_vehicle_group_account_code"),)


class Vehicle(ResourceMixin, Base):
    __tablename__ = "vehicles"

    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("vehicle_categories.id"), nullable=True, index=True)
    group_id: Mapped[int | None] = mapped_column(ForeignKey("vehicle_groups.id"), nullable=True, index=True)
    registration_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    vin: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True, index=True)
    make: Mapped[str] = mapped_column(String(80), default="")
    model: Mapped[str] = mapped_column(String(80), default="")
    model_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    vehicle_type: Mapped[str] = mapped_column(String(30), default="customer", index=True)
    tank_capacity: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    category: Mapped[Optional["VehicleCategory"]] = relationship()
    group: Mapped[Optional["VehicleGroup"]] = relationship()
    documents: Mapped[list["VehicleDocument"]] = relationship(back_populates="vehicle")
    maintenance_records: Mapped[list["VehicleMaintenance"]] = relationship(back_populates="vehicle")


class VehicleDocument(ResourceMixin, Base):
    __tablename__ = "vehicle_documents"

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    document_type: Mapped[str] = mapped_column(String(60), index=True)
    document_number: Mapped[str] = mapped_column(String(80), default="", index=True)
    file: Mapped[str] = mapped_column(Text)
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    vehicle: Mapped["Vehicle"] = relationship(back_populates="documents")


class VehicleRule(ResourceMixin, Base):
    __tablename__ = "vehicle_rules"

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    rule_type: Mapped[str] = mapped_column(String(40), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True, index=True)
    limit_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    limit_quantity: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    period: Mapped[str] = mapped_column(String(30), default="monthly", index=True)
    starts_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    ends_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    vehicle: Mapped["Vehicle"] = relationship()
    product: Mapped[Optional["Product"]] = relationship()


class VehicleMaintenance(ResourceMixin, Base):
    __tablename__ = "vehicle_maintenance"

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    maintenance_type: Mapped[str] = mapped_column(String(60), index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    odometer: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    cost: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    vehicle: Mapped["Vehicle"] = relationship(back_populates="maintenance_records")


class VehicleInspection(ResourceMixin, Base):
    __tablename__ = "vehicle_inspections"

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    inspection_date: Mapped[date] = mapped_column(Date, index=True)
    inspector_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    result: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    vehicle: Mapped["Vehicle"] = relationship()
    inspector: Mapped[Optional["User"]] = relationship(foreign_keys=[inspector_id])


class VehicleTrackingEvent(ResourceMixin, Base):
    __tablename__ = "vehicle_tracking_events"

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    latitude: Mapped[Decimal] = mapped_column(Numeric(10, 7))
    longitude: Mapped[Decimal] = mapped_column(Numeric(10, 7))
    speed: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    vehicle: Mapped["Vehicle"] = relationship()
    __table_args__ = (Index("idx_vehicle_tracking_date", "vehicle_id", "recorded_at"),)


class Driver(ResourceMixin, Base):
    __tablename__ = "drivers"

    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, unique=True, index=True)
    employee_number: Mapped[str] = mapped_column(String(50), index=True)
    first_name: Mapped[str] = mapped_column(String(100), index=True)
    last_name: Mapped[str] = mapped_column(String(100), index=True)
    phone: Mapped[str] = mapped_column(String(30), index=True)
    pin_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    user: Mapped[Optional["User"]] = relationship(foreign_keys=[user_id])
    documents: Mapped[list["DriverDocument"]] = relationship(back_populates="driver")
    assignments: Mapped[list["DriverAssignment"]] = relationship(back_populates="driver")
    __table_args__ = (UniqueConstraint("account_id", "employee_number", name="uq_driver_account_employee"),)


class DriverDocument(ResourceMixin, Base):
    __tablename__ = "driver_documents"

    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), index=True)
    document_type: Mapped[str] = mapped_column(String(50), index=True)
    document_number: Mapped[str] = mapped_column(String(80), index=True)
    licence_class: Mapped[str] = mapped_column(String(30), default="")
    file: Mapped[str] = mapped_column(Text, default="")
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    driver: Mapped["Driver"] = relationship(back_populates="documents")


class DriverAssignment(ResourceMixin, Base):
    __tablename__ = "driver_assignments"

    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    driver: Mapped["Driver"] = relationship(back_populates="assignments")
    vehicle: Mapped["Vehicle"] = relationship()


class DriverRule(ResourceMixin, Base):
    __tablename__ = "driver_rules"

    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), index=True)
    rule_type: Mapped[str] = mapped_column(String(40), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    limit_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    limit_quantity: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    period: Mapped[str] = mapped_column(String(30), default="monthly")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    driver: Mapped["Driver"] = relationship()
    product: Mapped[Optional["Product"]] = relationship()


class DriverPerformance(ResourceMixin, Base):
    __tablename__ = "driver_performance"

    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), index=True)
    period: Mapped[str] = mapped_column(String(20), index=True)
    trips: Mapped[int] = mapped_column(Integer, default=0)
    fuel_consumed: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    score: Mapped[Decimal] = mapped_column(Numeric(8, 2), default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    driver: Mapped["Driver"] = relationship()
    __table_args__ = (UniqueConstraint("driver_id", "period", name="uq_driver_performance_period"),)


class DeliveryRoute(ResourceMixin, Base):
    __tablename__ = "delivery_routes"

    name: Mapped[str] = mapped_column(String(140), index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    origin_depot_id: Mapped[int | None] = mapped_column(ForeignKey("depots.id"), nullable=True, index=True)
    destination_station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    distance_km: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    origin_depot: Mapped[Optional["Depot"]] = relationship()
    destination_station: Mapped[Optional["Station"]] = relationship()


class Delivery(ResourceMixin, Base):
    __tablename__ = "deliveries"

    delivery_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("fuel_orders.id"), nullable=True, index=True)
    route_id: Mapped[int | None] = mapped_column(ForeignKey("delivery_routes.id"), nullable=True, index=True)
    vehicle_id: Mapped[int | None] = mapped_column(ForeignKey("vehicles.id"), nullable=True, index=True)
    driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True, index=True)
    depot_id: Mapped[int | None] = mapped_column(ForeignKey("depots.id"), nullable=True, index=True)
    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    dispatched_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    order: Mapped[Optional["FuelOrder"]] = relationship(back_populates="deliveries")
    route: Mapped[Optional["DeliveryRoute"]] = relationship()
    vehicle: Mapped[Optional["Vehicle"]] = relationship()
    driver: Mapped[Optional["Driver"]] = relationship()
    depot: Mapped[Optional["Depot"]] = relationship()
    station: Mapped[Optional["Station"]] = relationship()
    events: Mapped[list["DeliveryEvent"]] = relationship(back_populates="delivery")


class DeliveryEvent(ResourceMixin, Base):
    __tablename__ = "delivery_events"

    delivery_id: Mapped[int] = mapped_column(ForeignKey("deliveries.id"), index=True)
    event_type: Mapped[str] = mapped_column(String(40), index=True)
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 7), nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    document_url: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    delivery: Mapped["Delivery"] = relationship(back_populates="events")
    __table_args__ = (Index("idx_delivery_event_date", "delivery_id", "occurred_at"),)


class DeliveryReconciliation(ResourceMixin, Base):
    __tablename__ = "delivery_reconciliations"

    delivery_id: Mapped[int] = mapped_column(ForeignKey("deliveries.id"), unique=True, index=True)
    loaded_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    delivered_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    variance_quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    delivery: Mapped["Delivery"] = relationship()


class FuelCard(ResourceMixin, Base):
    __tablename__ = "fuel_cards"

    card_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    serial_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), nullable=True, index=True)
    vehicle_id: Mapped[int | None] = mapped_column(ForeignKey("vehicles.id"), nullable=True, index=True)
    driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True, index=True)
    pin_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    issued_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    activated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    expires_on: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    blocked_reason: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped[Optional["Account"]] = relationship()
    vehicle: Mapped[Optional["Vehicle"]] = relationship()
    driver: Mapped[Optional["Driver"]] = relationship()
    rules: Mapped[list["CardRule"]] = relationship(back_populates="card")


class CardRule(ResourceMixin, Base):
    __tablename__ = "card_rules"

    card_id: Mapped[int] = mapped_column(ForeignKey("fuel_cards.id"), index=True)
    rule_type: Mapped[str] = mapped_column(String(40), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    limit_amount: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    limit_quantity: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    period: Mapped[str] = mapped_column(String(30), default="monthly")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    card: Mapped["FuelCard"] = relationship(back_populates="rules")
    product: Mapped[Optional["Product"]] = relationship()


class CardReplacement(ResourceMixin, Base):
    __tablename__ = "card_replacements"

    old_card_id: Mapped[int] = mapped_column(ForeignKey("fuel_cards.id"), index=True)
    new_card_id: Mapped[int | None] = mapped_column(ForeignKey("fuel_cards.id"), nullable=True, unique=True)
    reason: Mapped[str] = mapped_column(String(50), index=True)
    requested_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    old_card: Mapped["FuelCard"] = relationship(foreign_keys=[old_card_id])
    new_card: Mapped[Optional["FuelCard"]] = relationship(foreign_keys=[new_card_id])
    requested_by: Mapped["User"] = relationship(foreign_keys=[requested_by_id])


class PosDevice(ResourceMixin, Base):
    __tablename__ = "pos_devices"

    serial_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    terminal_id: Mapped[str | None] = mapped_column(String(80), unique=True, nullable=True, index=True)
    model: Mapped[str] = mapped_column(String(80), default="")
    provider: Mapped[str] = mapped_column(String(100), default="", index=True)
    acquired_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    health_status: Mapped[str] = mapped_column(String(30), default="unknown", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    assignments: Mapped[list["PosAssignment"]] = relationship(back_populates="device")
    maintenance_records: Mapped[list["PosMaintenance"]] = relationship(back_populates="device")


class PosAssignment(ResourceMixin, Base):
    __tablename__ = "pos_assignments"

    device_id: Mapped[int] = mapped_column(ForeignKey("pos_devices.id"), index=True)
    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    attendant_id: Mapped[int | None] = mapped_column(ForeignKey("station_attendants.id"), nullable=True, index=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    unassigned_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    device: Mapped["PosDevice"] = relationship(back_populates="assignments")
    station: Mapped[Optional["Station"]] = relationship()
    attendant: Mapped[Optional["StationAttendant"]] = relationship()


class PosMaintenance(ResourceMixin, Base):
    __tablename__ = "pos_maintenance"

    device_id: Mapped[int] = mapped_column(ForeignKey("pos_devices.id"), index=True)
    maintenance_type: Mapped[str] = mapped_column(String(50), index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    outcome: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    device: Mapped["PosDevice"] = relationship(back_populates="maintenance_records")


class Transaction(ResourceMixin, Base):
    __tablename__ = "transactions"

    transaction_number: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True, index=True)
    card_id: Mapped[int | None] = mapped_column(ForeignKey("fuel_cards.id"), nullable=True, index=True)
    pos_device_id: Mapped[int | None] = mapped_column(ForeignKey("pos_devices.id"), nullable=True, index=True)
    vehicle_id: Mapped[int | None] = mapped_column(ForeignKey("vehicles.id"), nullable=True, index=True)
    driver_id: Mapped[int | None] = mapped_column(ForeignKey("drivers.id"), nullable=True, index=True)
    attendant_id: Mapped[int | None] = mapped_column(ForeignKey("station_attendants.id"), nullable=True, index=True)
    transaction_type: Mapped[str] = mapped_column(String(40), index=True)
    payment_method: Mapped[str] = mapped_column(String(40), index=True)
    quantity: Mapped[Decimal | None] = mapped_column(Numeric(18, 2), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    currency: Mapped[str] = mapped_column(String(3), default="ZMW")
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    external_reference: Mapped[str] = mapped_column(String(100), default="", index=True)
    failure_reason: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    station: Mapped[Optional["Station"]] = relationship()
    product: Mapped[Optional["Product"]] = relationship()
    card: Mapped[Optional["FuelCard"]] = relationship()
    pos_device: Mapped[Optional["PosDevice"]] = relationship()
    vehicle: Mapped[Optional["Vehicle"]] = relationship()
    driver: Mapped[Optional["Driver"]] = relationship()
    attendant: Mapped[Optional["StationAttendant"]] = relationship()
    __table_args__ = (Index("idx_transaction_account_date", "account_id", "occurred_at"), Index("idx_transaction_type_status", "transaction_type", "status"))


class PosSettlement(ResourceMixin, Base):
    __tablename__ = "pos_settlements"

    device_id: Mapped[int] = mapped_column(ForeignKey("pos_devices.id"), index=True)
    settlement_reference: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    period_start: Mapped[datetime] = mapped_column(DateTime, index=True)
    period_end: Mapped[datetime] = mapped_column(DateTime, index=True)
    transaction_count: Mapped[int] = mapped_column(Integer, default=0)
    expected_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    settled_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    device: Mapped["PosDevice"] = relationship()


class FundingRequest(ResourceMixin, Base):
    __tablename__ = "funding_requests"

    reference_number: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    requested_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    request_type: Mapped[str] = mapped_column(String(30), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    currency: Mapped[str] = mapped_column(String(3), default="ZMW")
    approved_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    requested_by: Mapped["User"] = relationship(foreign_keys=[requested_by_id])
    approved_by: Mapped[Optional["User"]] = relationship(foreign_keys=[approved_by_id])


class BalanceAdjustment(ResourceMixin, Base):
    __tablename__ = "balance_adjustments"

    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    reference_number: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    adjustment_type: Mapped[str] = mapped_column(String(20), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    reason: Mapped[str] = mapped_column(Text)
    approved_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    approved_by: Mapped[Optional["User"]] = relationship(foreign_keys=[approved_by_id])


class Payment(ResourceMixin, Base):
    __tablename__ = "payments"

    payment_number: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    payment_type: Mapped[str] = mapped_column(String(30), index=True)
    payment_method: Mapped[str] = mapped_column(String(40), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    currency: Mapped[str] = mapped_column(String(3), default="ZMW")
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    provider_reference: Mapped[str] = mapped_column(String(100), default="", index=True)
    failure_reason: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    allocations: Mapped[list["PaymentAllocation"]] = relationship(back_populates="payment")


class Invoice(ResourceMixin, Base):
    __tablename__ = "invoices"

    invoice_number: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    invoice_type: Mapped[str] = mapped_column(String(30), default="invoice", index=True)
    issue_date: Mapped[date] = mapped_column(Date, default=date.today, index=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    balance_due: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="ZMW")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    lines: Mapped[list["InvoiceLine"]] = relationship(back_populates="invoice")
    payments: Mapped[list["PaymentAllocation"]] = relationship(back_populates="invoice")


class InvoiceLine(ResourceMixin, Base):
    __tablename__ = "invoice_lines"

    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id"), index=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id"), nullable=True)
    description: Mapped[str] = mapped_column(String(255))
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=1)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=0)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    line_total: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    invoice: Mapped["Invoice"] = relationship(back_populates="lines")
    product: Mapped[Optional["Product"]] = relationship()


class PaymentAllocation(ResourceMixin, Base):
    __tablename__ = "payment_allocations"

    payment_id: Mapped[int] = mapped_column(ForeignKey("payments.id"), index=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    payment: Mapped["Payment"] = relationship(back_populates="allocations")
    invoice: Mapped["Invoice"] = relationship(back_populates="payments")
    __table_args__ = (UniqueConstraint("payment_id", "invoice_id", name="uq_payment_invoice"),)


class FinancialDocument(ResourceMixin, Base):
    __tablename__ = "financial_documents"

    document_number: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    document_type: Mapped[str] = mapped_column(String(30), index=True)
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), index=True)
    invoice_id: Mapped[int | None] = mapped_column(ForeignKey("invoices.id"), nullable=True, index=True)
    payment_id: Mapped[int | None] = mapped_column(ForeignKey("payments.id"), nullable=True, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    issued_on: Mapped[date] = mapped_column(Date, default=date.today, index=True)
    file: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()
    invoice: Mapped[Optional["Invoice"]] = relationship()
    payment: Mapped[Optional["Payment"]] = relationship()


class BankBranch(ResourceMixin, Base):
    __tablename__ = "bank_branches"

    bank_id: Mapped[int] = mapped_column(ForeignKey("banks.id"), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    code: Mapped[str] = mapped_column(String(30), index=True)
    address: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    bank: Mapped["Bank"] = relationship()
    __table_args__ = (UniqueConstraint("bank_id", "code", name="uq_bank_branch_code"),)


class BankAccount(ResourceMixin, Base):
    __tablename__ = "bank_accounts"

    bank_id: Mapped[int] = mapped_column(ForeignKey("banks.id"), index=True)
    branch_id: Mapped[int | None] = mapped_column(ForeignKey("bank_branches.id"), nullable=True, index=True)
    account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), nullable=True, index=True)
    account_name: Mapped[str] = mapped_column(String(160), index=True)
    account_number: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    currency: Mapped[str] = mapped_column(String(3), default="ZMW", index=True)
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 2), default=0)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    bank: Mapped["Bank"] = relationship()
    branch: Mapped[Optional["BankBranch"]] = relationship()
    account: Mapped[Optional["Account"]] = relationship()


class BankTransaction(ResourceMixin, Base):
    __tablename__ = "bank_transactions"

    bank_account_id: Mapped[int] = mapped_column(ForeignKey("bank_accounts.id"), index=True)
    transaction_type: Mapped[str] = mapped_column(String(30), index=True)
    reference_number: Mapped[str] = mapped_column(String(100), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    transaction_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    matched_transaction_id: Mapped[int | None] = mapped_column(ForeignKey("transactions.id"), nullable=True)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    bank_account: Mapped["BankAccount"] = relationship()
    matched_transaction: Mapped[Optional["Transaction"]] = relationship()
    __table_args__ = (Index("idx_bank_transaction_account_date", "bank_account_id", "transaction_date"),)


class PaymentProvider(ResourceMixin, Base):
    __tablename__ = "payment_providers"

    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    provider_type: Mapped[str] = mapped_column(String(40), index=True)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class VerificationCase(ResourceMixin, Base):
    __tablename__ = "verification_cases"

    account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), nullable=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    verification_type: Mapped[str] = mapped_column(String(30), index=True)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    risk_level: Mapped[str] = mapped_column(String(20), default="unknown", index=True)
    reviewed_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped[Optional["Account"]] = relationship()
    subject_user: Mapped[Optional["User"]] = relationship(foreign_keys=[user_id])
    reviewed_by: Mapped[Optional["User"]] = relationship(foreign_keys=[reviewed_by_id])


class RiskProfile(ResourceMixin, Base):
    __tablename__ = "risk_profiles"

    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), unique=True, index=True)
    risk_level: Mapped[str] = mapped_column(String(20), default="low", index=True)
    risk_score: Mapped[Decimal] = mapped_column(Numeric(8, 2), default=0)
    assessed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    next_review_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped["Account"] = relationship()


class ComplianceCase(ResourceMixin, Base):
    __tablename__ = "compliance_cases"

    case_number: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    case_type: Mapped[str] = mapped_column(String(50), index=True)
    severity: Mapped[str] = mapped_column(String(20), default="medium", index=True)
    account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), nullable=True, index=True)
    transaction_id: Mapped[int | None] = mapped_column(ForeignKey("transactions.id"), nullable=True, index=True)
    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    reported_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped[Optional["Account"]] = relationship()
    transaction: Mapped[Optional["Transaction"]] = relationship()
    station: Mapped[Optional["Station"]] = relationship()
    assigned_to: Mapped[Optional["User"]] = relationship(foreign_keys=[assigned_to_id])


class ComplianceDocument(ResourceMixin, Base):
    __tablename__ = "compliance_documents"

    owner_type: Mapped[str] = mapped_column(String(30), index=True)
    account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), nullable=True, index=True)
    station_id: Mapped[int | None] = mapped_column(ForeignKey("stations.id"), nullable=True, index=True)
    vehicle_id: Mapped[int | None] = mapped_column(ForeignKey("vehicles.id"), nullable=True, index=True)
    document_type: Mapped[str] = mapped_column(String(40), index=True)
    document_number: Mapped[str] = mapped_column(String(80), index=True)
    provider: Mapped[str] = mapped_column(String(140), default="")
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    verification_status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    file: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped[Optional["Account"]] = relationship()
    station: Mapped[Optional["Station"]] = relationship()
    vehicle: Mapped[Optional["Vehicle"]] = relationship()


class RegulatoryReport(ResourceMixin, Base):
    __tablename__ = "regulatory_reports"

    report_type: Mapped[str] = mapped_column(String(60), index=True)
    period_start: Mapped[date] = mapped_column(Date, index=True)
    period_end: Mapped[date] = mapped_column(Date, index=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    submitted_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    file: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    submitted_by: Mapped[Optional["User"]] = relationship(foreign_keys=[submitted_by_id])
    __table_args__ = (UniqueConstraint("report_type", "period_start", "period_end", name="uq_regulatory_report_period"),)


class PermissionGroup(ResourceMixin, Base):
    __tablename__ = "permission_groups"

    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class PermissionGroupMember(ResourceMixin, Base):
    __tablename__ = "permission_group_members"

    group_id: Mapped[int] = mapped_column(ForeignKey("permission_groups.id"), index=True)
    permission_id: Mapped[int] = mapped_column(ForeignKey("permissions.id"), index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    group: Mapped["PermissionGroup"] = relationship()
    permission: Mapped["Permissions"] = relationship()
    __table_args__ = (UniqueConstraint("group_id", "permission_id", name="uq_permission_group_member"),)


class UserSession(ResourceMixin, Base):
    __tablename__ = "user_sessions"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    session_token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    ip_address: Mapped[str] = mapped_column(String(64), default="", index=True)
    user_agent: Mapped[str] = mapped_column(Text, default="")
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])


class LoginEvent(ResourceMixin, Base):
    __tablename__ = "login_events"

    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    event_type: Mapped[str] = mapped_column(String(30), index=True)
    succeeded: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    ip_address: Mapped[str] = mapped_column(String(64), default="", index=True)
    user_agent: Mapped[str] = mapped_column(Text, default="")
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    user: Mapped[Optional["User"]] = relationship(foreign_keys=[user_id])
    __table_args__ = (Index("idx_login_email_date", "email", "occurred_at"),)


class SecurityEvent(ResourceMixin, Base):
    __tablename__ = "security_events"

    event_type: Mapped[str] = mapped_column(String(50), index=True)
    severity: Mapped[str] = mapped_column(String(20), default="info", index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    ip_address: Mapped[str] = mapped_column(String(64), default="", index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    user: Mapped[Optional["User"]] = relationship(foreign_keys=[user_id])


class ReportDefinition(ResourceMixin, Base):
    __tablename__ = "report_definitions"

    name: Mapped[str] = mapped_column(String(160), index=True)
    code: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    report_type: Mapped[str] = mapped_column(String(50), index=True)
    query_definition: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    columns: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    schedules: Mapped[list["ReportSchedule"]] = relationship(back_populates="report")


class ReportSchedule(ResourceMixin, Base):
    __tablename__ = "report_schedules"

    report_id: Mapped[int] = mapped_column(ForeignKey("report_definitions.id"), index=True)
    cron_expression: Mapped[str] = mapped_column(String(100))
    format: Mapped[str] = mapped_column(String(20), default="pdf")
    recipients: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    next_run_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    report: Mapped["ReportDefinition"] = relationship(back_populates="schedules")
    outputs: Mapped[list["ReportOutput"]] = relationship(back_populates="schedule")


class ReportOutput(ResourceMixin, Base):
    __tablename__ = "report_outputs"

    report_id: Mapped[int] = mapped_column(ForeignKey("report_definitions.id"), index=True)
    schedule_id: Mapped[int | None] = mapped_column(ForeignKey("report_schedules.id"), nullable=True, index=True)
    generated_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    format: Mapped[str] = mapped_column(String(20), default="pdf")
    file: Mapped[str] = mapped_column(Text)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    report: Mapped["ReportDefinition"] = relationship()
    schedule: Mapped[Optional["ReportSchedule"]] = relationship(back_populates="outputs")
    generated_by: Mapped[Optional["User"]] = relationship(foreign_keys=[generated_by_id])


class SystemSetting(ResourceMixin, Base):
    __tablename__ = "system_settings"

    category: Mapped[str] = mapped_column(String(60), index=True)
    key: Mapped[str] = mapped_column(String(100), index=True)
    value: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    description: Mapped[str] = mapped_column(Text, default="")
    is_secret: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    __table_args__ = (UniqueConstraint("category", "key", name="uq_system_setting_category_key"),)


class ApprovalWorkflow(ResourceMixin, Base):
    __tablename__ = "approval_workflows"

    name: Mapped[str] = mapped_column(String(140), index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    resource_type: Mapped[str] = mapped_column(String(60), index=True)
    steps: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class Integration(ResourceMixin, Base):
    __tablename__ = "integrations"

    name: Mapped[str] = mapped_column(String(140), index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    integration_type: Mapped[str] = mapped_column(String(50), index=True)
    provider: Mapped[str] = mapped_column(String(100), default="", index=True)
    configuration: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    last_health_check_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class ApiClient(ResourceMixin, Base):
    __tablename__ = "api_clients"

    name: Mapped[str] = mapped_column(String(140), index=True)
    client_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    client_secret_hash: Mapped[str] = mapped_column(String(255))
    scopes: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class Webhook(ResourceMixin, Base):
    __tablename__ = "webhooks"

    name: Mapped[str] = mapped_column(String(140), index=True)
    url: Mapped[str] = mapped_column(Text)
    secret_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    events: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class SystemJob(ResourceMixin, Base):
    __tablename__ = "system_jobs"

    job_type: Mapped[str] = mapped_column(String(50), index=True)
    reference: Mapped[str] = mapped_column(String(100), default="", index=True)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    input: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    output: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    error_message: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class Notification(ResourceMixin, Base):
    __tablename__ = "notifications"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    notification_type: Mapped[str] = mapped_column(String(40), index=True)
    title: Mapped[str] = mapped_column(String(180))
    message: Mapped[str] = mapped_column(Text)
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])


class SupportTicket(ResourceMixin, Base):
    __tablename__ = "support_tickets"

    ticket_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    account_id: Mapped[int | None] = mapped_column(ForeignKey("accounts.id"), nullable=True, index=True)
    opened_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    category: Mapped[str] = mapped_column(String(50), index=True)
    priority: Mapped[str] = mapped_column(String(20), default="normal", index=True)
    subject: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    account: Mapped[Optional["Account"]] = relationship()
    opened_by: Mapped["User"] = relationship(foreign_keys=[opened_by_id])
    assigned_to: Mapped[Optional["User"]] = relationship(foreign_keys=[assigned_to_id])
