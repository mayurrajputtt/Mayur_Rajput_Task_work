#!/usr/bin/env python3
import os
import sys
import argparse
import logging
from dotenv import load_dotenv

# Add current directory to path to ensure modules are importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from bot.logging_config import setup_logging
from bot.validators import validate_order_inputs
from bot.client import BinanceFuturesClient
from bot.orders import OrderManager

def run_interactive_menu(order_manager: OrderManager):
    """
    Runs an interactive terminal CLI menu for placing orders with robust prompts and input validation.
    Provides a superior CLI UX as an optional bonus feature.
    """
    print("\n" + "="*50)
    print("   BINANCE FUTURES INTERACTIVE TRADING CONSOLE")
    print("="*50)
    
    while True:
        print("\n[MAIN MENU]")
        print(" 1. Place MARKET Order")
        print(" 2. Place LIMIT Order")
        print(" 3. Place STOP-LIMIT Order")
        print(" 4. Check Testnet Balances")
        print(" 5. Exit")
        
        choice = input("\nSelect an option (1-5): ").strip()
        
        if choice == "5":
            print("\nExiting Interactive Terminal. Goodbye!")
            break
            
        if choice == "4":
            print("\nFetching accounts balances...")
            try:
                balances = order_manager.client.get_account_balances()
                usdt_balance = next((b for b in balances if b.get("asset") == "USDT"), None)
                if usdt_balance:
                    print(f"💰 Account Balance: {usdt_balance.get('balance')} USDT (Available: {usdt_balance.get('availableBalance')} USDT)")
                else:
                    print("Could not find USDT balance.")
            except Exception as e:
                print(f"❌ Error checking balance: {str(e)}")
            continue
            
        if choice not in ["1", "2", "3"]:
            print("❌ Invalid selection. Please choose 1-5.")
            continue
            
        # Select side
        side = ""
        while side not in ["BUY", "SELL"]:
            side = input("Enter side (BUY/SELL): ").strip().upper()
            if side not in ["BUY", "SELL"]:
                print("❌ Invalid side. Please enter BUY or SELL.")
                
        # Select symbol
        symbol = input("Enter trading pair (default: BTCUSDT): ").strip().upper()
        if not symbol:
            symbol = "BTCUSDT"
            
        # Select quantity
        quantity_str = input("Enter order quantity (e.g., 0.005): ").strip()
        
        # Additional params
        price_str = None
        stop_price_str = None
        order_type = "MARKET"
        
        if choice == "2":
            order_type = "LIMIT"
            price_str = input("Enter Limit Price (e.g., 95200.5): ").strip()
        elif choice == "3":
            order_type = "STOP-LIMIT"
            stop_price_str = input("Enter Stop Trigger Price (e.g., 95000.0): ").strip()
            price_str = input("Enter Limit Price to execute (e.g., 94950.0): ").strip()
            
        print("\nValidating inputs...")
        try:
            # Convert values to correct types for validation
            quantity = float(quantity_str) if quantity_str else 0.0
            price = float(price_str) if price_str else None
            stop_price = float(stop_price_str) if stop_price_str else None
            
            validated = validate_order_inputs(
                symbol=symbol,
                side=side,
                order_type=order_type,
                quantity=quantity,
                price=price,
                stop_price=stop_price
            )
            
            print(f"✅ Input validation succeeded! Placing {validated['type']} order on testnet...")
            
            # Place order
            response = order_manager.place_futures_order(
                symbol=validated["symbol"],
                side=validated["side"],
                order_type=validated["type"],
                quantity=validated["quantity"],
                price=validated["price"],
                stop_price=validated["stop_price"]
            )
            
            # Print beautiful human summary
            card = order_manager.format_order_summary(validated, res_details=response)
            print("\n" + card)
            
        except ValueError as ve:
            print(f"❌ Input Validation Failed: {str(ve)}")
        except Exception as e:
            # Format and print failing order summary
            dummy_req = {
                "symbol": symbol,
                "side": side,
                "type": order_type,
                "quantity": quantity_str,
                "price": price_str,
                "stop_price": stop_price_str
            }
            card = order_manager.format_order_summary(dummy_req, error_msg=str(e))
            print("\n" + card)

def main():
    # Load .env file if available
    load_dotenv()
    
    # Configure logger
    logger = setup_logging()
    
    # Create Argparse parser for CLI arguments
    parser = argparse.ArgumentParser(
        description="Simplified Binance Futures (USDT-M) Trading Bot CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument("--symbol", type=str, help="Trading pair symbol (e.g., BTCUSDT)")
    parser.add_argument("--side", type=str, choices=["BUY", "SELL"], help="Order side: BUY or SELL")
    parser.add_argument("--type", type=str, choices=["MARKET", "LIMIT", "STOP-LIMIT"], help="Order type: MARKET, LIMIT, or STOP-LIMIT")
    parser.add_argument("--quantity", type=float, help="Order quantity (e.g., 0.001)")
    parser.add_argument("--price", type=float, help="Limit execution price (Required for LIMIT and STOP-LIMIT)")
    parser.add_argument("--stop-price", type=float, help="Stop trigger price (Required for STOP-LIMIT)")
    parser.add_argument("--interactive", action="store_true", help="Launch interactive menu console mode")
    
    args = parser.parse_args()
    
    # Check for keys in environment
    api_key = os.getenv("BINANCE_API_KEY")
    api_secret = os.getenv("BINANCE_API_SECRET")
    
    # Fallback to prompting user if keys are missing and we are in console
    if not api_key or not api_secret:
        print("⚠️ Binance API credentials not detected in your environment (or .env file).")
        api_key = input("Enter your Binance Testnet API Key: ").strip()
        api_secret = input("Enter your Binance Testnet API Secret: ").strip()
        
        if not api_key or not api_secret:
            print("❌ Error: API credentials are required to run the bot. Exiting.")
            logger.error("Failed to start: missing API credentials.")
            sys.exit(1)
            
    # Initialize client
    client = BinanceFuturesClient(api_key, api_secret)
    order_manager = OrderManager(client)
    
    # Determine execution mode
    # If interactive flag is passed OR no arg is passed, start interactive prompt
    is_interactive = args.interactive or (
        args.symbol is None and 
        args.side is None and 
        args.type is None and 
        args.quantity is None
    )
    
    if is_interactive:
        run_interactive_menu(order_manager)
    else:
        # Standard CLI arguments pipeline
        logger.info("Executing order from CLI argument inputs.")
        try:
            # Validate input using our standalone validators module
            validated = validate_order_inputs(
                symbol=args.symbol,
                side=args.side,
                order_type=args.type,
                quantity=args.quantity,
                price=args.price,
                stop_price=args.stop_price
            )
            
            # Place order on testnet
            response = order_manager.place_futures_order(
                symbol=validated["symbol"],
                side=validated["side"],
                order_type=validated["type"],
                quantity=validated["quantity"],
                price=validated["price"],
                stop_price=validated["stop_price"]
            )
            
            # Format and output results
            card = order_manager.format_order_summary(validated, res_details=response)
            print(card)
            sys.exit(0)
            
        except ValueError as ve:
            print(f"❌ Input Validation Error: {str(ve)}")
            logger.error(f"Validation failed: {str(ve)}")
            sys.exit(1)
        except Exception as e:
            # Try to build request summary for error card
            dummy_req = {
                "symbol": args.symbol,
                "side": args.side,
                "type": args.type,
                "quantity": args.quantity,
                "price": args.price,
                "stop_price": args.stop_price
            }
            card = order_manager.format_order_summary(dummy_req, error_msg=str(e))
            print(card)
            sys.exit(1)

if __name__ == "__main__":
    main()
