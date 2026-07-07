def validate_order_inputs(symbol: str, side: str, order_type: str, quantity: float, price: float = None, stop_price: float = None):
    """
    Validates user input parameters for Binance Futures orders.
    Raises ValueError if any parameter is invalid.
    """
    if not symbol or not isinstance(symbol, str):
        raise ValueError("Symbol must be a non-empty string (e.g., 'BTCUSDT').")
        
    symbol_upper = symbol.strip().upper()
    
    # Check side
    side_upper = side.strip().upper() if isinstance(side, str) else ""
    if side_upper not in ["BUY", "SELL"]:
        raise ValueError(f"Invalid side '{side}'. Supported sides are: BUY, SELL.")
        
    # Check order type
    type_upper = order_type.strip().upper() if isinstance(order_type, str) else ""
    if type_upper not in ["MARKET", "LIMIT", "STOP-LIMIT"]:
        raise ValueError(f"Invalid order type '{order_type}'. Supported types are: MARKET, LIMIT, STOP-LIMIT.")
        
    # Check quantity
    try:
        q_val = float(quantity)
        if q_val <= 0:
            raise ValueError()
    except (TypeError, ValueError):
        raise ValueError(f"Quantity must be a positive number. Received: '{quantity}'.")
        
    # Check price
    if type_upper in ["LIMIT", "STOP-LIMIT"]:
        if price is None:
            raise ValueError(f"Price is required for '{type_upper}' orders.")
        try:
            p_val = float(price)
            if p_val <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError(f"Price must be a positive number. Received: '{price}'.")
            
    # Check stop price
    if type_upper == "STOP-LIMIT":
        if stop_price is None:
            raise ValueError("Stop Price is required for 'STOP-LIMIT' orders.")
        try:
            sp_val = float(stop_price)
            if sp_val <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            raise ValueError(f"Stop Price must be a positive number. Received: '{stop_price}'.")
            
    return {
        "symbol": symbol_upper,
        "side": side_upper,
        "type": type_upper,
        "quantity": float(quantity),
        "price": float(price) if price is not None else None,
        "stop_price": float(stop_price) if stop_price is not None else None
    }
