import os
import logging

def setup_logging():
    """Sets up standard logging to both the console and a file."""
    # Ensure logs directory exists
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
        
    log_file = os.path.join(log_dir, "trading.log")
    
    # Define logger format
    log_format = "%(asctime)s [%(levelname)s] [%(name)s] %(message)s"
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler()
        ]
    )
    
    # Return the logger instance for convenience
    return logging.getLogger("TradingBot")
