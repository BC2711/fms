from app.configuration.resource import ResourceConfig
from app.models.resources import Account, Bank, Station, StationDocument, StationGroup, StationInspection, StationPerformance, StationPriceBoard, StationType, TestItem
from app.schemas.resources import AccountCreate, AccountResponse, AccountUpdate, BankCreate, BankResponse, BankUpdate, DocumentCreate, DocumentResponse, DocumentUpdate, InspectionCreate, InspectionResponse, InspectionUpdate, NamedResourceCreate, NamedResourceUpdate, PerformanceCreate, PerformanceResponse, PerformanceUpdate, PriceBoardCreate, PriceBoardResponse, PriceBoardUpdate, StationCreate, StationGroupCreate, StationGroupResponse, StationGroupUpdate, StationResponse, StationTypeResponse, StationUpdate, TestItemCreate, TestItemResponse, TestItemUpdate


def permissions(name: str) -> dict:
    return {operation: f"{name}.{'view' if operation == 'list' else operation}" for operation in ("list", "view", "create", "update", "delete")}


def account_resource(name: str, path: str, account_type: str) -> ResourceConfig:
    return ResourceConfig(name=name, model=Account, create_schema=AccountCreate, update_schema=AccountUpdate, response_schema=AccountResponse, route_prefix=path, permissions=permissions("accounts"), searchable_fields=("name", "account_number", "email"), filterable_fields=("status", "verification_status", "sector", "province", "institution_type", "ngo_type", "aggregator_type"), sortable_fields=("name", "account_number", "balance", "created_at"), fixed_values={"account_type": account_type})


ACCOUNT_RESOURCES = [
    account_resource("oil-marketing-companies", "/accounts/oil-marketing-companies", "omc"),
    account_resource("corporate-companies", "/accounts/corporate-companies", "corporate"),
    account_resource("ngos", "/accounts/ngos", "ngo"),
    account_resource("individuals", "/accounts/individuals", "individual"),
    account_resource("aggregators", "/accounts/aggregators", "aggregator"),
    account_resource("government-institutions", "/accounts/government-institutions", "government"),
    ResourceConfig(name="accounts", model=Account, create_schema=AccountCreate, update_schema=AccountUpdate, response_schema=AccountResponse, route_prefix="/accounts", permissions=permissions("accounts"), searchable_fields=("name", "account_number", "email"), filterable_fields=("account_type", "status", "verification_status"), sortable_fields=("name", "account_number", "balance", "created_at")),
]

STATION_RESOURCES = [
    ResourceConfig(name="station-types", model=StationType, create_schema=NamedResourceCreate, update_schema=NamedResourceUpdate, response_schema=StationTypeResponse, route_prefix="/stations/station-types", permissions=permissions("stations"), searchable_fields=("name", "code"), filterable_fields=("status",), sortable_fields=("name", "code", "created_at")),
    ResourceConfig(name="station-groups", model=StationGroup, create_schema=StationGroupCreate, update_schema=StationGroupUpdate, response_schema=StationGroupResponse, route_prefix="/stations/station-groups", permissions=permissions("stations"), searchable_fields=("name", "code"), filterable_fields=("status", "oil_marketing_company_id"), sortable_fields=("name", "code", "created_at")),
    ResourceConfig(name="station-price-boards", model=StationPriceBoard, create_schema=PriceBoardCreate, update_schema=PriceBoardUpdate, response_schema=PriceBoardResponse, route_prefix="/stations/station-price-boards", permissions=permissions("stations"), filterable_fields=("station_id", "product_id", "status"), sortable_fields=("effective_date", "selling_price", "created_at")),
    ResourceConfig(name="station-inspections", model=StationInspection, create_schema=InspectionCreate, update_schema=InspectionUpdate, response_schema=InspectionResponse, route_prefix="/stations/station-inspections", permissions=permissions("stations"), searchable_fields=("inspector_name", "notes"), filterable_fields=("station_id", "inspection_type", "result", "status"), sortable_fields=("inspection_date", "created_at")),
    ResourceConfig(name="station-performance", model=StationPerformance, create_schema=PerformanceCreate, update_schema=PerformanceUpdate, response_schema=PerformanceResponse, route_prefix="/stations/station-performance", permissions=permissions("stations"), filterable_fields=("station_id", "period", "status"), sortable_fields=("period", "revenue", "sales_volume", "created_at"), allowed_operations=frozenset({"list", "view"})),
    ResourceConfig(name="station-documents", model=StationDocument, create_schema=DocumentCreate, update_schema=DocumentUpdate, response_schema=DocumentResponse, route_prefix="/stations/station-documents", permissions=permissions("stations"), searchable_fields=("document_name", "document_number", "issued_by"), filterable_fields=("station_id", "document_type", "verification_status", "status"), sortable_fields=("document_name", "expiry_date", "created_at")),
    ResourceConfig(name="stations", model=Station, create_schema=StationCreate, update_schema=StationUpdate, response_schema=StationResponse, route_prefix="/stations", permissions=permissions("stations"), searchable_fields=("name", "code"), filterable_fields=("status", "province_id", "district_id", "station_type_id", "station_group_id", "oil_marketing_company_id"), sortable_fields=("name", "code", "created_at")),
]

OTHER_RESOURCES = [
    ResourceConfig(name="banks", model=Bank, create_schema=BankCreate, update_schema=BankUpdate, response_schema=BankResponse, route_prefix="/banks", searchable_fields=("name", "code"), filterable_fields=("status", "country"), sortable_fields=("name", "code", "country", "created_at")),
    ResourceConfig(name="test-items", model=TestItem, create_schema=TestItemCreate, update_schema=TestItemUpdate, response_schema=TestItemResponse, route_prefix="/test-items", searchable_fields=("name", "description"), filterable_fields=("status",), sortable_fields=("name", "status", "created_at")),
]

RESOURCES = [*ACCOUNT_RESOURCES, *STATION_RESOURCES, *OTHER_RESOURCES]
