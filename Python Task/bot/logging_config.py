import logging
import os

def setup_logger():
    os.makedirs("logs", exist_ok=True)

    logging.basicConfig(
        filename="logs/trading_bot.log",
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s"
    )