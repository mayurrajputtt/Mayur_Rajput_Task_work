import argparse
from bot.client import get_client
from bot.orders import place_order
from bot.validators import validate_order, validate_side
from bot.logging_config import setup_logger

def main():
    setup_logger()

    parser = argparse.ArgumentParser(description="Binance Futures Trading Bot")

    parser.add_argument("--symbol", required=True, help="Trading pair (e.g., BTCUSDT)")
    parser.add_argument("--side", required=True, help="BUY or SELL")
    parser.add_argument("--type", required=True, help="MARKET or LIMIT")
    parser.add_argument("--quantity", type=float, required=True)
    parser.add_argument("--price", type=float)

    args = parser.parse_args()

    try:
        side = validate_side(args.side)
        order_type = validate_order(args.type, args.price)

        client = get_client()

        print("\n========== ORDER REQUEST ==========")
        print(f"Symbol     : {args.symbol}")
        print(f"Side       : {side}")
        print(f"Type       : {order_type}")
        print(f"Quantity   : {args.quantity}")
        print(f"Price      : {args.price}")

        order = place_order(
            client,
            args.symbol,
            side,
            order_type,
            args.quantity,
            args.price
        )

        if order:
            print("\n✅ ORDER SUCCESS")
            print("=================================")
            print(f"Order ID     : {order.get('orderId')}")
            print(f"Status       : {order.get('status')}")
            print(f"Executed Qty : {order.get('executedQty')}")
            print(f"Avg Price    : {order.get('avgPrice', 'N/A')}")
        else:
            print("\n❌ ORDER FAILED")

    except Exception as e:
        print(f"\n⚠️ Error: {str(e)}")


if __name__ == "__main__":
    main()