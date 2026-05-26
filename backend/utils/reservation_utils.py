from enum import Enum
from datetime import date, datetime


class ReservationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

    @classmethod
    def terminal_statuses(cls) -> list[str]:
        return [cls.CANCELLED, cls.REJECTED]

    @classmethod
    def active_statuses(cls) -> list[str]:
        return [cls.PENDING, cls.CONFIRMED]


def parse_iso_date(value: str | date) -> date:
    """Converte string ISO 8601 ou objeto date para date."""
    if isinstance(value, date):
        return value
    return datetime.fromisoformat(value).date()
