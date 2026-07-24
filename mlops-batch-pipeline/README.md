# MLOps Batch Processing Pipeline

A minimal, production-ready MLOps batch processing pipeline built in Python. This project reads financial OHLCV market data, validates schema and YAML configurations, computes rolling mean technical indicators, generates binary trading signals, and outputs structured execution metrics and audit logs.

---

## Folder Structure

```text
.
├── run.py          # Main executable CLI pipeline script
├── config.yaml     # Configuration file (seed, window size, version)
├── data.csv        # Input OHLCV financial dataset
├── requirements.txt# Required Python package dependencies
├── Dockerfile      # Production Docker container definition
├── README.md       # Comprehensive pipeline documentation
├── metrics.json    # JSON execution metrics output
└── run.log         # Execution log file
```

---

## Requirements

- **Python**: `3.9+`
- **Dependencies**:
  - `pandas >= 2.0.0`
  - `numpy >= 1.24.0`
  - `PyYAML >= 6.0`
- **Docker**: Optional for containerized execution.

---

## Installation & Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Local Execution

Execute the pipeline CLI by passing the required argument paths:

```bash
python run.py \
  --input data.csv \
  --config config.yaml \
  --output metrics.json \
  --log-file run.log
```

---

## Docker Usage

### 1. Build Docker Image

```bash
docker build -t mlops-task .
```

### 2. Run Container

```bash
docker run --rm mlops-task
```

When run, the container executes `run.py`, generates `metrics.json` and `run.log`, and outputs the `metrics.json` content to standard output.

---

## Expected Output

### Successful Output (`metrics.json`)

```json
{
  "version": "v1",
  "rows_processed": 50,
  "metric": "signal_rate",
  "value": 0.5200,
  "latency_ms": 12,
  "seed": 42,
  "status": "success"
}
```

### Failure Output (`metrics.json`)

If configuration or dataset validation fails, `metrics.json` is always written with error metadata:

```json
{
  "version": "v1",
  "status": "error",
  "error_message": "Dataset missing required 'close' column"
}
```

### Sample Log Output (`run.log`)

```text
2026-07-24 08:50:00,000 - mlops_pipeline - INFO - Job start: MLOps Batch Processing Pipeline initialized
2026-07-24 08:50:00,005 - mlops_pipeline - INFO - Config loaded from 'config.yaml'
2026-07-24 08:50:00,006 - mlops_pipeline - INFO - Validation success: Configuration parameter schema valid
2026-07-24 08:50:00,010 - mlops_pipeline - INFO - Rows loaded: 50 records from 'data.csv'
2026-07-24 08:50:00,011 - mlops_pipeline - INFO - Validation success: Dataset format and required columns valid
2026-07-24 08:50:00,012 - mlops_pipeline - INFO - Computing rolling mean with window size 5
2026-07-24 08:50:00,015 - mlops_pipeline - INFO - Signal generation complete (1 if close > rolling_mean else 0)
2026-07-24 08:50:00,016 - mlops_pipeline - INFO - Metrics written to 'metrics.json': {"version": "v1", "rows_processed": 50, "metric": "signal_rate", "value": 0.52, "latency_ms": 12, "seed": 42, "status": "success"}
2026-07-24 08:50:00,017 - mlops_pipeline - INFO - Job end: MLOps pipeline execution finished successfully
```

---

## Validation Steps

1. **Verify Config Schema**: Ensure `config.yaml` contains `seed` (int), `window` (int > 0), and `version` (str).
2. **Verify CSV Schema**: Ensure `data.csv` contains a valid numeric `close` column.
3. **Verify Signal Calculation**: Check that first `window - 1` signal rows evaluate to `0` due to NaN rolling mean, and subsequent rows evaluate to `1` when `close > rolling_mean` else `0`.
4. **Verify Exit Codes**: Check that valid runs return exit code `0` and invalid runs write `metrics.json` and exit with code `1`.

---

## Troubleshooting

- **Error: `Dataset missing required 'close' column`**: Verify CSV header contains a `close` or `Close` column.
- **Error: `'window' must be a positive integer`**: Ensure `window` in `config.yaml` is an integer strictly greater than 0.
- **Missing File Error**: Confirm path parameters passed to `--input`, `--config`, `--output`, and `--log-file` exist and are accessible.
