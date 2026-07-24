import logging
from typing import Any, Dict, Optional
from bot.client import BinanceTestnetClient, BinanceAPIError, NetworkError

logger = logging.getLogger("trading_bot.orders")


def _calculate_avg_price(response: Dict[str, Any]) -> str:
    """Calculates average execution price from Binance API order response."""
    if "avgPrice" in response and float(response["avgPrice"]) > 0:
        return f"{float(response['avgPrice']):.4f}"

    cum_quote = float(response.get("cumQuote", 0))
    executed_qty = float(response.get("executedQty", 0))

    if executed_qty > 0 and cum_quote > 0:
        return f"{cum_quote / executed_qty:.4f}"

    if "price" in response and float(response["price"]) > 0:
        return f"{float(response['price']):.4f}"

    return "N/A"


def parse_order_response(response: Dict[str, Any]) -> Dict[str, Any]:
    """Parses raw Binance order response into a standardized clean dictionary format."""
    order_id = response.get("orderId", "N/A")
    symbol = response.get("symbol", "N/A")
    side = response.get("side", "N/A")
    order_type = response.get("type", "N/A")
    status = response.get("status", "N/A")
    executed_qty = response.get("executedQty", "0")
    avg_price = _calculate_avg_price(response)

    return {
        "order_id": order_id,
        "symbol": symbol,
        "side": side,
        "type": order_type,
        "status": status,
        "executed_qty": executed_qty,
        "avg_price": avg_price,
        "raw_response": response,
    }


def place_market_order(
    client: BinanceTestnetClient,
    symbol: str,
    side: str,
    quantity: float,
) -> Dict[str, Any]:
    """Places a MARKET order on Binance USDT-M Futures Testnet.

    Args:
        client: Initialized BinanceTestnetClient instance.
        symbol: Cryptocurrency pair (e.g., BTCUSDT).
        side: Order side ('BUY' or 'SELL').
        quantity: Order quantity.

    Returns:
        Dict[str, Any]: Parsed clean order summary dictionary.
    """
    logger.info(f"Placing MARKET {side} order: {quantity} {symbol}")

    params = {
        "symbol": symbol.upper(),
        "side": side.upper(),
        "type": "MARKET",
        "quantity": quantity,
    }

    raw_response = client.send_request(
        method="POST",
        endpoint="/fapi/v1/order",
        params=params,
        signed=True,
    )

    clean_order = parse_order_response(raw_response)
    logger.info(f"MARKET order placed successfully. Order ID: {clean_order['order_id']}")
    return clean_order


def place_limit_order(
    client: BinanceTestnetClient,
    symbol: str,
    side: str,
    quantity: float,
    price: float,
    time_in_force: str = "GTC",
) -> Dict[str, Any]:
    """Places a LIMIT order on Binance USDT-M Futures Testnet.

    Args:
        client: Initialized BinanceTestnetClient instance.
        symbol: Cryptocurrency pair (e.g., BTCUSDT).
        side: Order side ('BUY' or 'SELL').
        quantity: Order quantity.
        price: Limit price.
        time_in_force: Time in force policy (default 'GTC').

    Returns:
        Dict[str, Any]: Parsed clean order summary dictionary.
    """
    logger.info(f"Placing LIMIT {side} order: {quantity} {symbol} @ {price}")

    params = {
        "symbol": symbol.upper(),
        "side": side.upper(),
        "type": "LIMIT",
        "quantity": quantity,
        "price": price,
        "timeInForce": time_in_force,
    }

    raw_response = client.send_request(
        method="POST",
        endpoint="/fapi/v1/order",
        params=params,
        signed=True,
    )

    clean_order = parse_order_response(raw_response)
    logger.info(f"LIMIT order placed successfully. Order ID: {clean_order['order_id']}")
    return clean_order
