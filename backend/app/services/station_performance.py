from decimal import Decimal


class StationPerformanceService:
    """Domain calculations are isolated from generated CRUD routes."""

    @staticmethod
    def average_transaction_value(revenue: Decimal, transactions: int) -> Decimal:
        return Decimal("0") if transactions == 0 else revenue / transactions
