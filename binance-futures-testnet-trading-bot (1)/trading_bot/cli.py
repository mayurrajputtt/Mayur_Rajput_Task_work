import argparse
import sys
from typing import Any, Dict, Optional

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    from rich.theme import Theme
    custom_theme = Theme({
        "info": "cyan",
        "warning": "yellow",
        "error": "bold red",
        "success": "bold green",
        "label": "bold white",
        "value": "bold yellow"
    })
    console = Console(theme=custom_theme)
    HAS_RICH = True
except ImportError:
    console = None
    HAS_RICH = False

from bot.client import BinanceAPIError, BinanceTestnetClient, NetworkError
from bot.logging_config import setup_logging
from bot.orders import place_limit_order, place_market_order
from bot.validators import ValidationError, validate_order_params

logger = setup_logging("logs/trading.log")


def create_parser() -> argparse.ArgumentParser:
    """Creates and returns the CLI argument parser."""
    parser = argparse.ArgumentParser(
        description="Binance USDT-M Futures Testnet Trading Bot CLI",
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "--symbol",
        type=str,
        required=True,
        help="Trading pair symbol (e.g. BTCUSDT, ETHUSDT)",
    )
    parser.add_argument(
        "--side",
        type=str,
        required=True,
        choices=["BUY", "SELL", "buy", "sell"],
        help="Order side: BUY or SELL",
    )
    parser.add_argument(
        "--type",
        type=str,
        required=True,
        choices=["MARKET", "LIMIT", "market", "limit"],
        help="Order type: MARKET or LIMIT",
    )
    parser.add_argument(
        "--quantity",
        type=float,
        required=True,
        help="Order quantity (must be > 0)",
    )
    parser.add_argument(
        "--price",
        type=float,
        required=False,
        default=None,
        help="Limit order price (required only when --type is LIMIT)",
    )
    return parser


def print_order_summary(
    symbol: str, side: str, order_type: str, quantity: float, price: Optional[float]
) -> None:
    """Prints formatted Order Summary section."""
    price_str = f"{price:.4f}" if price is not None else "N/A (MARKET)"

    if HAS_RICH and console:
        table = Table(title="Order Summary", show_header=False, border_style="cyan")
        table.add_column("Property", style="bold white")
        table.add_column("Value", style="cyan")
        table.add_row("Symbol", symbol)
        table.add_row("Side", side)
        table.add_row("Type", order_type)
        table.add_row("Quantity", str(quantity))
        table.add_row("Price", price_str)
        console.print(table)
    else:
        print("\nOrder Summary")
        print("-------------")
        print(f"Symbol:   {symbol}")
        print(f"Side:     {side}")
        print(f"Type:     {order_type}")
        print(f"Quantity: {quantity}")
        print(f"Price:    {price_str}")


def print_response(order_res: Dict[str, Any]) -> None:
    """Prints formatted Response section."""
    order_id = order_res.get("order_id", "N/A")
    status = order_res.get("status", "N/A")
    executed_qty = order_res.get("executed_qty", "N/A")
    avg_price = order_res.get("avg_price", "N/A")

    if HAS_RICH and console:
        table = Table(title="Response", show_header=False, border_style="green")
        table.add_column("Field", style="bold white")
        table.add_column("Result", style="green")
        table.add_row("Order ID", str(order_id))
        table.add_row("Status", str(status))
        table.add_row("Executed Quantity", str(executed_qty))
        table.add_row("Average Price", str(avg_price))
        console.print(table)
    else:
        print("\nResponse")
        print("---------")
        print(f"Order ID:          {order_id}")
        print(f"Status:            {status}")
        print(f"Executed Quantity: {executed_qty}")
        print(f"Average Price:     {avg_price}")


def print_status_banner(success: bool, message: Optional[str] = None) -> None:
    """Prints standard SUCCESS or FAILED banner."""
    if HAS_RICH and console:
        if success:
            console.print(Panel("[bold green]SUCCESS[/bold green]", border_style="green"))
        else:
            err_msg = f"\nReason: {message}" if message else ""
            console.print(Panel(f"[bold red]FAILED[/bold red]{err_msg}", border_style="red"))
    else:
        if success:
            print("\nSUCCESS\n")
        else:
            print("\nFAILED")
            if message:
                print(f"Reason: {message}")
            print()


def main() -> int:
    """Main execution entry point for CLI."""
    logger.info("=== Application Started ===")
    parser = create_parser()

    try:
        raw_args = parser.parse_args()
    except SystemExit as e:
        logger.warning(f"CLI Argument parsing failed or help requested with exit code {e.code}")
        return e.code

    logger.info(
        f"Input Parameters -> Symbol: {raw_args.symbol}, Side: {raw_args.side}, "
        f"Type: {raw_args.type}, Quantity: {raw_args.quantity}, Price: {raw_args.price}"
    )

    # 1. Parameter Validation
    try:
        clean_params = validate_order_params(
            symbol=raw_args.symbol,
            side=raw_args.side,
            order_type=raw_args.type,
            quantity=raw_args.quantity,
            price=raw_args.price,
        )
    except ValidationError as ve:
        logger.error(f"Validation Error: {ve}")
        if HAS_RICH and console:
            console.print(f"[bold red]Validation Error:[/bold red] {ve}")
        else:
            print(f"Validation Error: {ve}", file=sys.stderr)
        print_status_banner(success=False, message=str(ve))
        logger.info("=== Application Exited (Validation Failed) ===")
        return 1

    symbol = clean_params["symbol"]
    side = clean_params["side"]
    order_type = clean_params["type"]
    quantity = clean_params["quantity"]
    price = clean_params["price"]

    # 2. Print Order Summary
    print_order_summary(symbol, side, order_type, quantity, price)

    # 3. Client Initialization & Execution
    try:
        client = BinanceTestnetClient()

        if HAS_RICH and console:
            with console.status(f"[bold yellow]Connecting to Binance Testnet and placing {order_type} order...[/bold yellow]"):
                if order_type == "MARKET":
                    order_response = place_market_order(client, symbol, side, quantity)
                else:
                    order_response = place_limit_order(client, symbol, side, quantity, price)
        else:
            print(f"\nPlacing {order_type} order on Binance Futures Testnet...")
            if order_type == "MARKET":
                order_response = place_market_order(client, symbol, side, quantity)
            else:
                order_response = place_limit_order(client, symbol, side, quantity, price)

        # 4. Print Response & SUCCESS
        print_response(order_response)
        print_status_banner(success=True)
        logger.info(f"Order completed successfully. Summary: {order_response}")
        logger.info("=== Application Finished Successfully ===")
        return 0

    except (BinanceAPIError, NetworkError, ValueError, Exception) as err:
        logger.error(f"Execution Error: {err}", exc_info=True)
        if HAS_RICH and console:
            console.print(f"\n[bold red]Error:[/bold red] {err}")
        else:
            print(f"\nError: {err}", file=sys.stderr)

        print_status_banner(success=False, message=str(err))
        logger.info("=== Application Exited with Error ===")
        return 1


if __name__ == "__main__":
    sys.exit(main())
