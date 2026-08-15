from decimal import Decimal
from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.database.session import get_db
from app.models.audit import AuditLog
from app.models.resources import User
from app.models.resources import Account
from app.permissions.dependencies import require_permission
from app.schemas.common import response
from app.services.accounts import AccountBalanceService

router = APIRouter(prefix="/accounts", tags=["account balances"])


class BalanceAdjustment(BaseModel):
    operation: Literal["credit", "debit"]
    amount: Decimal = Field(gt=0, max_digits=18, decimal_places=2)
    reason: str = Field(min_length=3, max_length=500)
    reference: str = Field(default="", max_length=100)


@router.post("/{item_id}/balance-adjustments")
def adjust_balance(
    item_id: int,
    payload: BalanceAdjustment,
    user: Annotated[User, Depends(require_permission("accounts.update"))],
    db: Annotated[Session, Depends(get_db)],
):
    account = db.scalar(select(Account).where(Account.id == item_id, Account.deleted_at.is_(None)).with_for_update())
    if account is None:
        raise NotFoundError("Account not found")
    previous = account.balance
    delta = payload.amount if payload.operation == "credit" else -payload.amount
    account.balance = AccountBalanceService.apply_delta(previous, delta)
    account.updated_by = user.id
    db.add(AuditLog(
        actor_id=user.id,
        action="balance_adjustment",
        resource="accounts",
        resource_id=str(account.id),
        changes={"operation": payload.operation, "amount": str(payload.amount), "previous_balance": str(previous), "new_balance": str(account.balance), "reason": payload.reason, "reference": payload.reference},
    ))
    db.commit(); db.refresh(account)
    return response("Account balance adjusted successfully", {"account_id": account.id, "previous_balance": previous, "balance": account.balance, "currency": account.currency})
