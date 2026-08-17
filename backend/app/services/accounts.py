from decimal import Decimal
from app.core.errors import AppError


class AccountBalanceService:
    """Business-critical balance changes intentionally live outside generic CRUD."""

    @staticmethod
    def apply_delta(current: Decimal, delta: Decimal) -> Decimal:
        new_balance = current + delta
        if new_balance < 0:
            raise AppError("Insufficient account balance", 409)
        return new_balance
    
    def get_omc_stations(self, session):
       pass
