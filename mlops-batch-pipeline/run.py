#!/usr/bin/env python3
"""MLOps Batch Processing Pipeline.

This module loads financial OHLCV data, validates configurations and schemas,
computes a rolling mean technical indicator, generates signals, and records
execution metrics and log trails.

Supports both Pandas/NumPy/PyYAML when installed and Python standard library fallback.
"""

import argparse
import csv
import json
import logging
import os
import sys
import time
from typing import Any, Dict, List, Tuple

# Attempt importing third-party dependencies; fall back if unavailable
HAS_PANDAS = False
HAS_NUMPY = False
HAS_YAML = False

try:
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    pd = None

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    np = None

try:
    import yaml
    HAS_YAML = True
except ImportError:
    yaml = None


def setup_logger(log_file_path: str) -> logging.Logger:
    """Configure structured logging to console and log file.

    Args:
        log_file_path (str): Target log file location.

    Returns:
        logging.Logger: Configured Logger instance.
    """
    logger = logging.getLogger("mlops_pipeline")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File Handler
    if log_file_path:
        log_dir = os.path.dirname(log_file_path)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)
        file_handler = logging.FileHandler(log_file_path, mode="w", encoding="utf-8")
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


def load_config(config_path: str) -> Dict[str, Any]:
    """Load configuration parameters from a YAML file.

    Args:
        config_path (str): Path to YAML configuration file.

    Returns:
        Dict[str, Any]: Configuration key-value dictionary.

    Raises:
        FileNotFoundError: If configuration file does not exist.
        ValueError: If file is empty or contains invalid YAML structure.
    """
    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found at '{config_path}'")

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            content = f.read()

        if not content.strip():
            raise ValueError(f"Configuration file at '{config_path}' is empty")

        if HAS_YAML and yaml is not None:
            config = yaml.safe_load(content)
        else:
            # Fallback simple YAML parser for basic key: value lines
            config = {}
            for line in content.splitlines():
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if ":" in line:
                    key, val = line.split(":", 1)
                    key = key.strip()
                    val = val.strip().strip("\"'")
                    if val.isdigit():
                        val = int(val)
                    elif val.startswith("-") and val[1:].isdigit():
                        val = int(val)
                    config[key] = val

        if not isinstance(config, dict):
            raise ValueError(f"Configuration YAML at '{config_path}' must resolve to a dictionary")

        return config
    except Exception as e:
        raise ValueError(f"Failed to read configuration file '{config_path}': {e}")


def validate_config(config: Dict[str, Any]) -> bool:
    """Validate structure, types, and values of configuration options.

    Required fields: seed (int), window (int > 0), version (str).

    Args:
        config (Dict[str, Any]): Configuration dictionary.

    Returns:
        bool: True if configuration is valid.

    Raises:
        ValueError: If validation rules fail.
    """
    required_fields = ["seed", "window", "version"]
    missing_fields = [field for field in required_fields if field not in config]
    if missing_fields:
        raise ValueError(f"Config missing required field(s): {', '.join(missing_fields)}")

    if not isinstance(config["seed"], int):
        raise ValueError(f"'seed' must be an integer, got {type(config['seed']).__name__}")

    if not isinstance(config["window"], int) or config["window"] <= 0:
        raise ValueError(f"'window' must be a positive integer, got {config['window']}")

    if not isinstance(config["version"], str) or not str(config["version"]).strip():
        raise ValueError("'version' must be a non-empty string")

    return True


def load_dataset(data_path: str) -> Any:
    """Load dataset from a CSV file.

    Args:
        data_path (str): Path to input CSV file.

    Returns:
        Any: Loaded Pandas DataFrame or list of dicts.

    Raises:
        FileNotFoundError: If data file does not exist.
        ValueError: If data file is empty or invalid CSV.
    """
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at '{data_path}'")

    if os.path.getsize(data_path) == 0:
        raise ValueError(f"Data file at '{data_path}' is empty")

    try:
        if HAS_PANDAS and pd is not None:
            df = pd.read_csv(data_path)
            return df
        else:
            rows = []
            with open(data_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    rows.append(row)
            if not rows:
                raise ValueError("CSV contains no data rows")
            return rows
    except Exception as e:
        raise ValueError(f"Failed to parse CSV file at '{data_path}': {e}")


def validate_dataset(df: Any) -> bool:
    """Validate input dataset schema and data types.

    Ensures dataset is non-empty and contains a numeric 'close' column.

    Args:
        df (Any): Input DataFrame or row list.

    Returns:
        bool: True if valid.

    Raises:
        ValueError: If dataset fails schema validation.
    """
    if HAS_PANDAS and isinstance(df, pd.DataFrame):
        if df is None or df.empty:
            raise ValueError("Input dataset is empty or None")

        close_col = [col for col in df.columns if col.lower() == "close"]
        if not close_col:
            raise ValueError("Dataset missing required 'close' column")

        target_col = close_col[0]
        if target_col != "close":
            df["close"] = df[target_col]

        if not pd.api.types.is_numeric_dtype(df["close"]):
            try:
                df["close"] = pd.to_numeric(df["close"])
            except Exception as e:
                raise ValueError(f"'close' column must contain numeric values: {e}")
        return True
    else:
        if not df or not isinstance(df, list):
            raise ValueError("Input dataset is empty or invalid")

        headers = list(df[0].keys())
        close_col = [h for h in headers if h.lower() == "close"]
        if not close_col:
            raise ValueError("Dataset missing required 'close' column")

        target_col = close_col[0]
        for idx, row in enumerate(df):
            val = row.get(target_col)
            try:
                float(val)
            except (ValueError, TypeError):
                raise ValueError(f"'close' column contains non-numeric value '{val}' at row {idx + 1}")
        return True


def compute_signals(df: Any, window: int) -> Tuple[Any, Any]:
    """Compute rolling mean technical indicator and generate binary signal.

    Signal logic:
    - 1 if close > rolling_mean
    - 0 otherwise
    - NaNs in rolling mean (first window-1 rows) evaluate to signal 0.

    Args:
        df (Any): Input DataFrame or row list.
        window (int): Rolling window size.

    Returns:
        Tuple[Any, Any]: Rolling mean and binary signal series/lists.
    """
    if HAS_PANDAS and HAS_NUMPY and isinstance(df, pd.DataFrame) and pd is not None and np is not None:
        close = df["close"]
        rolling_mean = close.rolling(window=window).mean()

        valid_mask = rolling_mean.notna() & (close > rolling_mean)
        signal_values = np.where(valid_mask, 1, 0)
        signal = pd.Series(signal_values, index=df.index, name="signal")
        return rolling_mean, signal
    else:
        # Fallback list processing
        close_col = [h for h in df[0].keys() if h.lower() == "close"][0]
        closes = [float(row[close_col]) for row in df]

        rolling_mean: List[Any] = []
        signals: List[int] = []

        for i, c in enumerate(closes):
            if i < window - 1:
                rolling_mean.append(None)
                signals.append(0)
            else:
                window_slice = closes[i - window + 1 : i + 1]
                mean_val = sum(window_slice) / window
                rolling_mean.append(mean_val)
                signals.append(1 if c > mean_val else 0)

        return rolling_mean, signals


def write_metrics(metrics_path: str, metrics_data: Dict[str, Any]) -> None:
    """Serialize metrics dictionary into output JSON file.

    Args:
        metrics_path (str): Destination file path for JSON metrics.
        metrics_data (Dict[str, Any]): Dictionary containing metrics payload.
    """
    metrics_dir = os.path.dirname(metrics_path)
    if metrics_dir:
        os.makedirs(metrics_dir, exist_ok=True)

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)


def main() -> None:
    """Execute main command-line pipeline execution."""
    parser = argparse.ArgumentParser(description="MLOps Batch Signal Processing Pipeline")
    parser.add_argument("--input", required=True, help="Path to input CSV dataset file")
    parser.add_argument("--config", required=True, help="Path to input YAML config file")
    parser.add_argument("--output", required=True, help="Path to output JSON metrics file")
    parser.add_argument("--log-file", required=True, help="Path to execution log file")

    args = parser.parse_args()

    start_time = time.perf_counter()
    logger = setup_logger(args.log_file)
    logger.info("Job start: MLOps Batch Processing Pipeline initialized")

    version = "v1"

    try:
        # Load and validate configuration
        config = load_config(args.config)
        logger.info(f"Config loaded from '{args.config}'")

        validate_config(config)
        logger.info("Validation success: Configuration parameter schema valid")

        seed = config["seed"]
        window = config["window"]
        version = str(config["version"])

        # Set deterministic random seed
        if HAS_NUMPY and np is not None:
            np.random.seed(seed)

        # Load and validate dataset
        df = load_dataset(args.input)
        rows_count = len(df)
        logger.info(f"Rows loaded: {rows_count} records from '{args.input}'")

        validate_dataset(df)
        logger.info("Validation success: Dataset format and required columns valid")

        # Compute rolling mean and trading signals
        logger.info(f"Computing rolling mean with window size {window}")
        rolling_mean, signal = compute_signals(df, window)
        logger.info("Signal generation complete (1 if close > rolling_mean else 0)")

        # Calculate timing & metrics
        end_time = time.perf_counter()
        latency_ms = int(round((end_time - start_time) * 1000))

        if HAS_PANDAS and isinstance(signal, pd.Series):
            sig_sum = float(signal.sum())
        else:
            sig_sum = float(sum(signal))

        signal_rate = round(sig_sum / rows_count, 4) if rows_count > 0 else 0.0000

        metrics = {
            "version": version,
            "rows_processed": rows_count,
            "metric": "signal_rate",
            "value": signal_rate,
            "latency_ms": latency_ms,
            "seed": seed,
            "status": "success",
        }

        write_metrics(args.output, metrics)
        logger.info(f"Metrics written to '{args.output}': {json.dumps(metrics)}")
        logger.info("Job end: MLOps pipeline execution finished successfully")

        sys.exit(0)

    except Exception as e:
        logger.exception(f"Pipeline failure: {e}")

        error_metrics = {
            "version": version,
            "status": "error",
            "error_message": str(e),
        }

        write_metrics(args.output, error_metrics)
        sys.exit(1)


if __name__ == "__main__":
    main()
