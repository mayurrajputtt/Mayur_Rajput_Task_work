import logging
from bot.client import BinanceFuturesClient

class OrderManager:
    """
    Handles higher-level order placement logic on Binance Futures.
    Formats requests, logs outcomes, and parses responses for human-readable console outputs.
    """
    def __init__(self, client: BinanceFuturesClient):
        self.client = client
        self.logger = logging.getLogger("TradingBot.Orders")

    def place_futures_order(self, symbol: str, side: str, order_type: str, quantity: float, price: float = None, stop_price: float = None) -> dict:
        """
        Translates human input parameters into Binance REST API order specifications.
        """
        # Build Binance specific request parameters
        params = {
            "symbol": symbol,
            "side": side,
            "type": order_type,
            "quantity": quantity
        }
        
        # Translate types to Binance standard
        if order_type == "STOP-LIMIT":
            params["type"] = "STOP"  # Binance Futures Stop-Limit type is "STOP"
            params["price"] = price
            params["stopPrice"] = stop_price
            params["timeInForce"] = "GTC"
        elif order_type == "LIMIT":
            params["price"] = price
            params["timeInForce"] = "GTC"  # Good 'Til Cancelled standard for Limit orders
            
        self.logger.info(f"Preparing order placement: {side} {quantity} {symbol} ({order_type})")
        
        # Call signed request endpoint
        try:
            response = self.client.send_signed_request("POST", "/fapi/v1/order", params)
            self.logger.info(f"Order placed successfully! Order ID: {response.get('orderId')}")
            return response
        except Exception as e:
            self.logger.error(f"Failed to place order: {str(e)}")
            raise e

    def format_order_summary(self, req_summary: dict, res_details: dict = None, error_msg: str = None) -> str:
        """
        Formats order result into a beautiful scannable card layout for terminal output.
        """
        border = "=" * 60
        subborder = "-" * 60
        
        lines = [
            border,
            "               BINANCE FUTURES ORDER SUMMARY",
            border,
            f" [REQUEST DETAILS]",
            f"  • Symbol:      {req_summary.get('symbol')}",
            f"  • Side:        {req_summary.get('side')}",
            f"  • Order Type:  {req_summary.get('type')}",
            f"  • Quantity:    {req_summary.get('quantity')}",
        ]
        
        if req_summary.get('price') is not None:
            lines.append(f"  • Limit Price: {req_summary.get('price')}")
        if req_summary.get('stop_price') is not None:
            lines.append(f"  • Stop Price:  {req_summary.get('stop_price')}")
            
        lines.append(subborder)
        
        if error_msg:
            lines.extend([
                " [STATUS] : FAILED ❌",
                f"  • Error:       {error_msg}"
            ])
        elif res_details:
            order_id = res_details.get("orderId")
            status = res_details.get("status")
            exec_qty = res_details.get("executedQty", 0)
            avg_price = res_details.get("avgPrice", 0.0)
            orig_qty = res_details.get("origQty", req_summary.get("quantity"))
            
            # Default avgPrice could be 0 for limit unfilled, try to get it
            if avg_price == 0.0 or avg_price == "0.0":
                avg_price = res_details.get("price", "N/A")
                
            lines.extend([
                " [STATUS] : SUCCESSFUL ✅",
                f"  • Order ID:     {order_id}",
                f"  • Order Status: {status}",
                f"  • Executed Qty: {exec_qty} / {orig_qty}",
                f"  • Avg Price:    {avg_price}"
            ])
        else:
            lines.extend([
                " [STATUS] : UNKNOWN ⚠️",
                "  • Details: No response details available."
            ])
            
        lines.append(border)
        return "\n".join(lines)
