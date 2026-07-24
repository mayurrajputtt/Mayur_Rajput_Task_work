import re
from typing import Any, Dict, Optional


class ValidationError(Exception):
    """Base exception for validation errors."""

    pass


class InvalidSymbolError(ValidationError):
    """Raised when trading symbol is invalid."""

    pass


class InvalidSideError(ValidationError):
    """Raised when order side is neither BUY nor SELL."""

    pass


class InvalidOrderTypeError(ValidationError):
    """Raised when order type is neither MARKET nor LIMIT."""

    pass


class InvalidQuantityError(ValidationError):
    """Raised when order quantity is non-positive or invalid."""

    pass


class InvalidPriceError(ValidationError):
    """Raised when price is missing or non-positive for LIMIT orders."""

    pass


VALID_SIDES = {"BUY", "SELL"}
VALID_ORDER_TYPES = {"MARKET", "LIMIT"}
SYMBOL_REGEX = re.compile(r"^[A-Z0-9]{5,15}$")


def validate_symbol(symbol: str) -> str:
    """Validates cryptocurrency pair symbol format."""
    if not symbol or not isinstance(symbol, str):
        raise InvalidSymbolError("Symbol cannot be empty.")

    clean_symbol = symbol.strip().upper()
    if not SYMBOL_REGEX.match(clean_symbol):
        raise InvalidSymbolError(
            f"Invalid symbol format '{symbol}'. Must be 5-15 alphanumeric uppercase characters (e.g. BTCUSDT)."
        )
    return clean_symbol


def validate_side(side: str) -> str:
    """Validates order side (BUY or SELL)."""
    if not side or not isinstance(side, str):
        raise InvalidSideError("Order side cannot be empty.")

    clean_side = side.strip().upper()
    if clean_side not in VALID_SIDES:
        raise InvalidSideError(
            f"Invalid side '{side}'. Allowed values are: {', '.join(sorted(VALID_SIDES))}."
        )
    return clean_side


def validate_order_type(order_type: str) -> str:
    """Validates order type (MARKET or LIMIT)."""
    if not order_type or not isinstance(order_type, str):
        raise InvalidOrderTypeError("Order type cannot be empty.")

    clean_type = order_type.strip().upper()
    if clean_type not in VALID_ORDER_TYPES:
        raise InvalidOrderTypeError(
            f"Invalid order type '{order_type}'. Allowed values are: {', '.join(sorted(VALID_ORDER_TYPES))}."
        )
    return clean_type


def validate_quantity(quantity: float) -> float:
    """Validates quantity is a positive number."""
    try:
        qty = float(quantity)
    except (ValueError, TypeError):
        raise InvalidQuantityError(f"Quantity must be a valid number, got '{quantity}'.")

    if qty <= 0:
        raise InvalidQuantityError(f"Quantity must be strictly greater than 0, got {qty}.")
    return qty


def validate_price(price: Optional[float], order_type: str) -> Optional[float]:
    """Validates price for LIMIT orders."""
    clean_type = order_type.strip().upper()
    if clean_type == "LIMIT":
        if price is None:
            raise InvalidPriceError("Price '--price' is required when order type is LIMIT.")
        try:
            p = float(price)
        except (ValueError, TypeError):
            raise InvalidPriceError(f"Price must be a valid number, got '{price}'.")

        if p <= 0:
            raise InvalidPriceError(f"Price must be strictly greater than 0 for LIMIT orders, got {p}.")
        return p
    return None


def validate_order_params(
    symbol: str,
    side: str,
    order_type: str,
    quantity: float,
    price: Optional[float] = None,
) -> Dict[str, Any]:
    """Validates all trading parameters together and returns cleaned values."""
    valid_symbol = validate_symbol(symbol)
    valid_side = validate_side(side)
    valid_type = validate_order_type(order_type)
    valid_qty = validate_quantity(quantity)
    valid_prc = validate_price(price, valid_type)

    return {
        "symbol": valid_symbol,
        "side": valid_side,
        "type": valid_type,
        "quantity": valid_qty,
        "price": valid_prc,
    }
