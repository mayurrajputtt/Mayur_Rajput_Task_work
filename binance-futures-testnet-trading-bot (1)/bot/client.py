import hashlib
import hmac
import json
import logging
import os
import time
from typing import Any, Dict, Optional
from urllib.parse import urlencode

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    import requests
except ImportError:
    import urllib.request
    import urllib.error
    requests = None

logger = logging.getLogger("trading_bot.client")

TESTNET_BASE_URL = "https://testnet.binancefuture.com"


class BinanceAPIError(Exception):
    def __init__(self, status_code: int, code: int, message: str):
        self.status_code = status_code
        self.code = code
        self.message = message
        super().__init__(f"Binance API Error [{code}]: {message} (HTTP {status_code})")


class NetworkError(Exception):
    pass


class BinanceTestnetClient:
    def __init__(
        self,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        base_url: str = TESTNET_BASE_URL,
        timeout: int = 10,
    ):
        self.api_key = api_key or os.getenv("BINANCE_API_KEY", "").strip()
        self.api_secret = api_secret or os.getenv("BINANCE_API_SECRET", "").strip()
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

        if not self.api_key or not self.api_secret:
            logger.warning("Binance API key or secret is missing. Unauthenticated calls only.")

    def _generate_signature(self, query_string: str) -> str:
        return hmac.new(
            self.api_secret.encode("utf-8"),
            query_string.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    def send_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        signed: bool = True,
    ) -> Dict[str, Any]:
        if params is None:
            params = {}

        req_params = params.copy()
        url = f"{self.base_url}{endpoint}"

        if signed:
            if not self.api_key or not self.api_secret:
                raise ValueError("API Key and Secret are required for signed operations.")
            req_params["timestamp"] = int(time.time() * 1000)
            query_string = urlencode(req_params)
            signature = self._generate_signature(query_string)
            query_string += f"&signature={signature}"
        else:
            query_string = urlencode(req_params)

        headers = {
            "Accept": "application/json",
            "User-Agent": "BinanceFuturesTestnetBot/1.0",
        }
        if self.api_key:
            headers["X-MBX-APIKEY"] = self.api_key

        full_url = f"{url}?{query_string}" if query_string else url
        logger.info(f"Sending {method} request to {endpoint}")

        if requests is not None:
            try:
                if method.upper() == "POST":
                    resp = requests.post(url, data=query_string, headers=headers, timeout=self.timeout)
                elif method.upper() == "DELETE":
                    resp = requests.delete(full_url, headers=headers, timeout=self.timeout)
                else:
                    resp = requests.get(full_url, headers=headers, timeout=self.timeout)

                status_code = resp.status_code
                try:
                    data = resp.json()
                except Exception:
                    data = {"msg": resp.text}

            except requests.exceptions.Timeout as e:
                logger.error(f"Network timeout contacting Binance: {e}")
                raise NetworkError("Connection to Binance Futures Testnet timed out.") from e
            except requests.exceptions.RequestException as e:
                logger.error(f"Network error contacting Binance: {e}")
                raise NetworkError(f"Network request failed: {e}") from e
        else:
            try:
                req_data = query_string.encode("utf-8") if method.upper() == "POST" else None
                req_url = full_url if method.upper() != "POST" else url
                req = urllib.request.Request(req_url, data=req_data, headers=headers, method=method.upper())

                with urllib.request.urlopen(req, timeout=self.timeout) as response:
                    status_code = response.status
                    data = json.loads(response.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                status_code = e.code
                try:
                    data = json.loads(e.read().decode("utf-8"))
                except Exception:
                    data = {"msg": str(e)}
            except Exception as e:
                logger.error(f"Network error using urllib: {e}")
                raise NetworkError(f"Network request failed: {e}") from e

        if status_code != 200:
            error_code = data.get("code", -1)
            error_msg = data.get("msg", "Unknown Binance Error")
            logger.error(f"Binance API error response [{error_code}]: {error_msg}")
            raise BinanceAPIError(status_code, error_code, error_msg)

        logger.info(f"Received successful response from {endpoint}")
        return data
