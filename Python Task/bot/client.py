import os
from binance.client import Client
from dotenv import load_dotenv

load_dotenv()

def get_client():
    return Client(
        api_key=os.getenv("API_KEY"),
        api_secret=os.getenv("API_SECRET"),
        testnet=True
    )
