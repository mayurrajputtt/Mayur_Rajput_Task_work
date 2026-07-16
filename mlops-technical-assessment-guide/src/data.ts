import { ModuleContent, QuizQuestion } from "./types";

export const STUDY_MODULES: ModuleContent[] = [
  {
    id: "yaml",
    title: "1. YAML Configuration",
    category: "Configuration",
    description: "Externalizing parameters, validation, and schema definitions.",
    what: "YAML (YAML Ain't Markup Language) is a human-readable data serialization format. In MLOps, it is used to write configuration files (`config.yaml`) that control the behavior of machine learning pipelines, batch jobs, or server workloads.",
    why: "Hardcoding parameters (like file paths, random seeds, or hyperparameters) is a critical anti-pattern. External configuration files separate code from logic, allowing engineers and automated systems to modify behavior without changing code or rebuilding Docker images.",
    how: "Typically implemented in Python using the `pyyaml` library. The configuration is loaded at startup, and should be validated (using libraries like `pydantic`, `jsonschema`, or standard manual checks) to ensure all required keys exist and have correct types.",
    codeExample: `import yaml
from pydantic import BaseModel, Field

class PipelineConfig(BaseModel):
    seed: int = Field(..., description="Random seed for reproducibility")
    window: int = Field(..., gt=1, description="Rolling window size")
    version: str = Field(..., description="Application semantic version")

def load_and_validate_config(config_path: str) -> PipelineConfig:
    with open(config_path, "r") as f:
        raw_config = yaml.safe_load(f)
    # Validating using Pydantic
    return PipelineConfig(**raw_config)`,
    bestPractices: [
      "Use PyYAML's `yaml.safe_load()` instead of `yaml.load()` to prevent arbitrary code execution vulnerabilities.",
      "Strictly validate config values immediately upon application startup (Fail Fast pattern).",
      "Declare default values for optional parameters, but require key ones like `seed` or `version`.",
      "Keep configuration separate from code—never commit environment-specific values like API secrets to Git."
    ],
    mistakes: [
      "Hardcoding default values directly inside code files rather than parsing them from YAML.",
      "Using `yaml.load()` which is highly insecure in production.",
      "Failing to validate types (e.g., accepting a string window size when an integer is required), causing silent downstream bugs.",
      "No default fallback if a non-critical parameter is omitted in the file."
    ],
    evaluation: "The interviewer is evaluating your knowledge of clean code separation of concerns, defensive validation, configurations safety (avoiding code execution exploits), and standard MLOps environment practices.",
    realWorldContext: "Production systems at companies like Uber and Google use complex configs (often Hydra or OmegaConf) to manage deep learning model architectures, training regimes, and inference targets without touching code."
  },
  {
    id: "seed",
    title: "2. Random Seed",
    category: "Configuration",
    description: "Ensuring determinism and scientific auditability in ML runs.",
    what: "A random seed is an integer that initializes a pseudo-random number generator (PRNG). When set, it ensures that subsequent 'random' processes generate an identical sequence of values.",
    why: "Determinism is the bedrock of reproducibility. Without a fixed seed, data splitting, model weight initialization, and data augmentation will vary across runs, making debugging, metric regression analysis, and production audits impossible.",
    how: "Set the seed for all libraries that handle randomness (standard library `random`, `numpy`, `torch`, `tensorflow`) before any processing starts. In high-performance settings, individual local state generators should be preferred over global state modifiers.",
    codeExample: `import random
import numpy as np

def set_reproducibility_seed(seed_value: int):
    # Standard Python seed
    random.seed(seed_value)
    # Numpy global seed
    np.random.seed(seed_value)
    # For PyTorch (if used)
    # torch.manual_seed(seed_value)
    # torch.cuda.manual_seed_all(seed_value)`,
    bestPractices: [
      "Set seeds at the absolute beginning of your pipeline execution.",
      "Do not rely solely on Numpy's global `np.random.seed()` in modern code—prefer creating local generator instances (`np.random.default_rng(seed)`) to prevent other modules from altering your state.",
      "Ensure the seed is fully configurable via the configuration YAML file, never hardcoded.",
      "Log the exact seed value at the start of every run for tracing."
    ],
    mistakes: [
      "Assuming setting standard `random.seed()` also sets Numpy's random state.",
      "Placing the seed initialization code inside a function that runs *after* random operations have already occurred.",
      "Forgetting to document the exact seed used for a key run, making it impossible to reproduce anomalous results."
    ],
    evaluation: "The interviewer is checking if you understand why model reproducibility matters and how global state management impacts reproducibility across distributed execution engines.",
    realWorldContext: "In quantitative trading firms or high-stakes medical AI setups, audit trails require absolute determinism. Every single experiment must be perfectly reproducible to explain individual trading decisions or diagnostic model outcomes."
  },
  {
    id: "validation",
    title: "3. Dataset Validation",
    category: "Core Logic",
    description: "Defensive programming to check input data constraints.",
    what: "Dataset validation is the practice of checking the structure, completeness, and values of incoming datasets against expected criteria before entering the main model pipeline.",
    why: "Incoming datasets in production are notoriously dirty. Files can be corrupt, empty, missing key columns, or populated with invalid data types. Validating data prevents downstream runtime failures, silent mathematical errors (like division by zero), and bad model predictions.",
    how: "Implement basic checks using standard libraries or Pandas, checking: file existence, file readability (empty check), CSV parses correctly, key columns (like 'close') exist, and data types are valid. In enterprise setups, tools like Great Expectations or Pandera are used.",
    codeExample: `import os
import pandas as pd

def validate_input_dataset(file_path: str, required_columns: list[str]) -> pd.DataFrame:
    # 1. Existence check
    if not os.path.exists(file_path):
      raise FileNotFoundError(f"Input file missing: {file_path}")
    
    # 2. Size check
    if os.path.getsize(file_path) == 0:
      raise ValueError(f"Input file is completely empty: {file_path}")
      
    try:
      # 3. Readability check
      df = pd.read_csv(file_path)
    except Exception as e:
      raise ValueError(f"Failed to parse file as CSV: {e}")
      
    # 4. Column constraints
    for col in required_columns:
      if col not in df.columns:
        raise KeyError(f"Missing required column: {col}")
        
    return df`,
    bestPractices: [
      "Follow the 'Fail Fast' principle: abort immediately if input data does not meet strict quality thresholds.",
      "Log specific details of why validation failed (e.g., list the exact missing columns) to speed up debugging.",
      "Write unit tests verifying that your validation logic correctly flags empty, corrupt, or incomplete files."
    ],
    mistakes: [
      "Reading the file without wrapping it in a try-except block, leading to ugly, unhandled crash traces.",
      "Proceeding to calculate mathematical calculations (like means) on empty or zero-row dataframes.",
      "Assuming columns exist without explicitly validating them, resulting in nested `KeyError` crashes in the middle of execution."
    ],
    evaluation: "The interviewer evaluates your defensive programming practices. They want to see if you build software that handles real-world issues gracefully instead of assuming perfect inputs.",
    realWorldContext: "Data validation engines are key in ML systems like Netflix's recommender pipeline, ensuring that corrupted user logs do not contaminate downstream model training datasets and degrade user recommendations."
  },
  {
    id: "rolling_mean",
    title: "4. Rolling Mean",
    category: "Core Logic",
    description: "Moving averages, mathematical formulas, and boundary handling.",
    what: "A rolling mean (or simple moving average) calculates the mean of a fixed-size subset (window) of sequential data points as the window slides across the dataset.",
    why: "In time-series analysis and trading systems, raw values are noisy. A rolling mean smooths out high-frequency fluctuations to highlight long-term trends.",
    how: "In Python, it is calculated efficiently using Pandas: `df['close'].rolling(window=w).mean()`. The formula for a window of size $w$ at index $t$ is:\n\n$$M_t = \\frac{1}{w} \\sum_{i=0}^{w-1} x_{t-i}$$",
    codeExample: `import pandas as pd

def calculate_rolling_mean(df: pd.DataFrame, window_size: int) -> pd.Series:
    # Calculating the rolling mean
    rolling_series = df["close"].rolling(window=window_size).mean()
    
    # Handling boundary conditions (first window-1 rows will naturally be NaN)
    # Common strategies: 
    # 1. Keep them as NaN (recommended for mathematical accuracy)
    # 2. Fill them with the first available value (e.g. rolling_series.bfill())
    # 3. Use min_periods=1 to calculate mean of whatever values are available
    return rolling_series`,
    bestPractices: [
      "Clearly document how boundary values (the first $w-1$ rows) are treated (such as kept as NaN, backfilled, or using fractional windows).",
      "Ensure window size $w$ is parsed as an integer greater than 1 from the config file.",
      "Be mindful of time-series lookahead bias: ensure that values used to calculate the mean at index $t$ only look backward ($t-w$ to $t$)."
    ],
    mistakes: [
      "Allowing window sizes larger than the entire length of the input dataset without flagging an error.",
      "Accidentally introducing lookahead bias by including future rows (e.g. $t$ to $t+w$) in historical trading signal logic.",
      "Silent crashes when calculations encounter non-numeric values in the columns."
    ],
    evaluation: "The interviewer is evaluating your basic algorithm understanding, implementation of edge cases (when dataset length < window size), and time-series logic handling.",
    realWorldContext: "Algorithmic trading systems at high-frequency funds use rolling averages (and complex variants like Exponential Moving Averages - EMA) to build technical indicators, identify breakouts, and automate execution."
  },
  {
    id: "signal",
    title: "5. Trading Signal Generation",
    category: "Core Logic",
    description: "Conditional logic to translate numerical analytics to actions.",
    what: "Signal generation is the logical rule that translates numerical features (like prices and moving averages) into actionable commands (like Buy/Sell or 1/0 flags).",
    why: "The core value of an MLOps batch job or model is its output action. Translating data into a binary decision represents the bridge between raw analytics and automated execution systems.",
    how: "Evaluated row-by-row on the dataset. If the price `close` is strictly greater than the calculated `rolling_mean`, the signal is `1` (Buy/Hold), otherwise it is `0` (Sell/Liquidate). Usually vectorized for speed in Pandas.",
    codeExample: `import numpy as np
import pandas as pd

def generate_signals(df: pd.DataFrame) -> pd.DataFrame:
    # Vectorized signal generation for maximum speed
    # signal = 1 if close > rolling_mean else 0
    df["signal"] = np.where(
        df["close"] > df["rolling_mean"], 
        1, 
        0
    )
    
    # Note: If rolling_mean is NaN (during first window-1 rows), 
    # numpy.where will evaluate close > NaN as False, yielding 0.
    # It is good practice to explicitly handle NaN rows:
    df.loc[df["rolling_mean"].isna(), "signal"] = 0
    return df`,
    bestPractices: [
      "Use vectorized operations (like Numpy's `np.where`) instead of slow Python `for` loops iterating over rows.",
      "Explicitly handle how NaN values in the rolling mean affect signal generation to prevent unpredictable output behavior.",
      "Write unit tests to verify your math with a tiny, manual-calculated dataset (e.g., 5 rows)."
    ],
    mistakes: [
      "Iterating over Pandas DataFrames using `.iterrows()`—which is an anti-pattern that runs incredibly slow on large production files.",
      "Not handling NaN rows correctly, resulting in silent default values that corrupt overall output signal rates."
    ],
    evaluation: "The interviewer looks for vectorization skills (writing performant, clean Pandas code) and meticulousness in handling mathematical NaN edge-cases.",
    realWorldContext: "In quantitative finance pipelines, signal generation modules process millions of ticks per second. Vectorized execution and low-latency implementation are non-negotiable requirements."
  },
  {
    id: "metrics",
    title: "6. Metrics Engine",
    category: "Observability",
    description: "Collecting, measuring, and reporting machine-readable job KPIs.",
    what: "A metrics engine tracks and reports system performance, data throughput, and logical state inside a machine-readable JSON file (`metrics.json`) after every execution run.",
    why: "In production MLOps, nobody opens console logs to verify if a batch job succeeded. Automated systems (like Prometheus, Datadog, or cloud monitors) read the standardized JSON metrics files to trigger alerts, chart dashboard statistics, and verify pipeline health.",
    how: "Measure system latency using high-precision timers (`time.perf_counter()`). Gather process stats like total rows, output signal rate, and merge them with config details (seed, version). Finally, save the combined dict as a JSON file.",
    codeExample: `import time
import json

def run_pipeline():
    start_time = time.perf_counter()
    
    # ... execution logic ...
    rows_processed = 1500
    signal_rate = 0.45
    
    end_time = time.perf_counter()
    latency_ms = (end_time - start_time) * 1000
    
    metrics = {
        "rows_processed": rows_processed,
        "signal_rate": float(signal_rate),
        "latency_ms": round(latency_ms, 2),
        "version": "1.0.0",
        "seed": 42,
        "status": "SUCCESS"
    }
    
    with open("metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)`,
    bestPractices: [
      "Use `time.perf_counter()` for measuring pipeline latency—it is a monotonic clock specifically built for high-precision duration measurements.",
      "Format JSON fields into exact, clean types: convert any Numpy float values to standard Python floats before serialization to prevent JSON conversion crashes.",
      "Ensure metrics are always structured consistently to avoid breaking downstream log aggregators."
    ],
    mistakes: [
      "Using `time.time()` for profiling latency—which is subject to system clock changes (NTP syncs) and is less accurate.",
      "Writing metrics with raw Numpy types which throws serialization exceptions (`TypeError: Object of type float32 is not JSON serializable`).",
      "Omitting metrics writing if the program crashes or validation fails—which is the most dangerous production observability failure."
    ],
    evaluation: "The interviewer checks if you know how to build observable software. They want to see machine-readable JSON metrics that automated infrastructure can ingest seamlessly.",
    realWorldContext: "Big Tech companies run thousands of batch jobs hourly. Centralized orchestrators (like Airflow) read structured metrics to automatically alert on data drift, high latency, or high pipeline failure rates."
  },
  {
    id: "error_handling",
    title: "7. Resilient Error Handling",
    category: "Observability",
    description: "Handling failures gracefully and writing error metrics.",
    what: "Resilient error handling involves using try-except blocks to catch expected and unexpected exceptions, and guaranteeing that system diagnostics (like `metrics.json`) are written even during severe failures.",
    why: "If a production job crashes silently without outputting its final status, orchestrators have to guess what failed. Writing a standardized `metrics.json` file with `\"status\": \"FAILED\"` and an error description allows alerting systems to immediately respond.",
    how: "Wrap the core pipeline in a robust, global `try-except-finally` block. If an exception occurs, log the traceback, capture the error message, set status to `FAILED`, and write the structured `metrics.json`.",
    codeExample: `import traceback
import json

def run_and_handle():
    metrics = {
        "rows_processed": 0,
        "signal_rate": 0.0,
        "latency_ms": 0.0,
        "version": "1.0.0",
        "seed": 42,
        "status": "FAILED",
        "error": None
    }
    
    try:
        # Pipeline execution goes here
        # ...
        metrics["status"] = "SUCCESS"
    except Exception as e:
        metrics["status"] = "FAILED"
        metrics["error"] = str(e)
        # Log detailed traceback
        print(f"CRITICAL ERROR: {traceback.format_exc()}")
        raise e # Optionally re-raise after handling
    finally:
        # Guaranteed to execute, ensuring the file is saved
        with open("metrics.json", "w") as f:
            json.dump(metrics, f, indent=4)`,
    bestPractices: [
      "Use a `finally` block to write the `metrics.json` file so that it is guaranteed to execute whether the script succeeds, catches a validated exception, or fails unexpectedly.",
      "Categorize errors: distinguish between expected validation errors (like empty files) and unexpected code bugs.",
      "Log detailed traceback strings to logs, but write clear, high-level summaries into `metrics.json`."
    ],
    mistakes: [
      "Letting the program crash raw to the OS without generating any metrics file, rendering the pipeline completely invisible to tracking tools.",
      "Catching raw exceptions silently without logging them, which makes troubleshooting impossible.",
      "Failing to record a failure status, leaving an old `metrics.json` file in the directory with a stale SUCCESS status."
    ],
    evaluation: "The interviewer is grading your systems design capability. They want to verify that you design for failure (the core rule of production operations) and maintain observability even when things go wrong.",
    realWorldContext: "At companies like Google, if a prediction pipeline encounters invalid data, it isolates the corrupt inputs, reports a structured failure back to monitoring systems, and continues serving healthy queries to keep services online."
  },
  {
    id: "logging",
    title: "8. Production Logging",
    category: "Observability",
    description: "Configuring Python logging and avoiding raw print statements.",
    what: "Production logging is the use of Python's standard `logging` library to record detailed, structured, time-stamped messages about execution flow, logical state, and diagnostic information.",
    why: "Raw `print()` statements are an absolute MLOps anti-pattern. They lack timestamps, execution thread names, log level classification (INFO, WARN, ERROR), and can only print to standard output (not easily redirected to rotating log files, central databases, or log collectors).",
    how: "Configure the standard `logging` library using a standardized handler that writes formatted messages (including timestamps, severity, module name) to both standard console output and a dedicated file (`run.log`).",
    codeExample: `import logging

def setup_production_logging():
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.FileHandler("run.log"),
            logging.StreamHandler() # console
        ]
    )
    
    # Retrieve named logger
    logger = logging.getLogger("mlops_pipeline")
    return logger

logger = setup_production_logging()
logger.info("Pipeline started successfully.")
logger.warning("Configuration file omitted default parameters, falling back to safe options.")
logger.error("Failed to read input dataset.")`,
    bestPractices: [
      "Use appropriate log levels: `INFO` for normal operational milestones, `WARNING` for non-critical anomalies, and `ERROR` for operation-blocking failures.",
      "Include structured, searchable metadata (like dates, levels, and modules) in your log formatting string.",
      "Never swallow exceptions—log the complete traceback using `logger.exception()` in except blocks."
    ],
    mistakes: [
      "Using `print()` statements for diagnostic tracking instead of proper logging.",
      "Logging sensitive user information, credentials, or API keys in production log outputs (critical security violation).",
      "Leaving debug level logs highly active in production files, resulting in massive, disk-filling run.log files."
    ],
    evaluation: "The interviewer checks your engineering maturity. A professional MLOps engineer knows how to configure and use standardized logs to debug issues rapidly in remote containerized environments.",
    realWorldContext: "Uber and Netflix use centralized log aggregation engines (like ElasticSearch / Splunk). Standardized container logs are instantly indexed, parsed, and monitored to detect anomalies across millions of requests."
  },
  {
    id: "docker",
    title: "9. Containerization (Docker)",
    category: "Packaging",
    description: "Packaging environments, Dockerfiles, and single-command execution.",
    what: "Docker is a containerization technology that packages code, system dependencies, libraries, and configurations into a single, self-contained, lightweight virtual runtime environment (an 'image').",
    why: "The famous 'it worked on my machine' excuse is the bane of production deployments. Package version conflicts, OS-specific compiler variances, and missing environments can break ML pipelines. Docker guarantees that if an application builds and runs in a local container, it will run exactly the same way in Kubernetes, Cloud Run, or trading servers.",
    how: "Write a clear `Dockerfile` that specifies: a base Python image, copies execution files (`run.py`, `config.yaml`), installs dependencies from `requirements.txt`, sets up non-root users for security, and defines an entry point command (`ENTRYPOINT`).",
    codeExample: `# Use a lightweight official Python base image
FROM python:3.11-slim

# Set environment configurations
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establish working directory inside the container
WORKDIR /app

# Copy dependency file first to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies securely
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY run.py .
COPY config.yaml .

# Standardize running with a non-root user for production security
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Define execution command
ENTRYPOINT ["python", "run.py"]`,
    bestPractices: [
      "Order your Docker commands strategically: copy `requirements.txt` and install packages *before* copying the rest of your application code to leverage Docker's built-in layer caching (saving build times).",
      "Use modern, secure base images like `python:X.Y-slim` to minimize image size and reduce the surface area for security vulnerabilities.",
      "Always set `PYTHONUNBUFFERED=1` so that Python outputs logs immediately to stdout/stderr instead of buffering them (preventing lost container logs on crash)."
    ],
    mistakes: [
      "Creating massive Docker images using heavy base environments (like standard `ubuntu` or heavy SDKs) when small `-slim` images are sufficient.",
      "Failing to pin library versions inside `requirements.txt`, leading to unexpected container breakages when external packages release updates.",
      "Running containers as root user in production—which creates a high-risk security exploit path if the code is compromised."
    ],
    evaluation: "The interviewer is testing your environmental hygiene and operational preparedness. They want to see if you can package code for cloud deployment and leverage standard Docker optimizations.",
    realWorldContext: "Modern container engines like Kubernetes and AWS ECS run millions of Docker containers. All models from OpenAI, Anthropic, or Netflix are trained and served inside isolated, highly optimized Docker environments."
  },
  {
    id: "structure",
    title: "10. Project Structure",
    category: "Packaging",
    description: "Standard layout conventions of professional MLOps projects.",
    what: "Project structure is the intentional layout of directories and files inside a repository. A standardized layout defines clear folders for configuration, core source code, tests, documentation, and data.",
    why: "Scattered, poorly structured files are extremely difficult to navigate, test, and maintain. A standardized project layout makes onboarding new developers fast and simplifies continuous integration (CI) automation scripts.",
    how: "Construct a clean, modular file structure. For a minimal batch pipeline job, the standard structure looks like this:",
    codeExample: `my-mlops-batch-job/
├── Dockerfile            # Container definition
├── README.md             # Technical documentation and startup guide
├── requirements.txt      # Pinned dependency library versions
├── config.yaml           # YAML pipeline configuration parameters
├── data.csv              # Input validation dataset
├── run.py                # Main executable entrypoint script
├── run.log               # Generated detailed execution logs
└── metrics.json          # Machine-readable telemetry metrics`,
    bestPractices: [
      "Keep the repository root clean—store data files (`data.csv`) and output logs inside logical git-ignored locations for larger applications.",
      "Use standard naming conventions (`run.py` or `main.py`, `config.yaml`, `Dockerfile`) so automated build scripts can find them easily.",
      "Include a robust `.gitignore` file to prevent committing massive dataset files (`.csv`), python caches (`__pycache__`), or log files (`.log`) to Git."
    ],
    mistakes: [
      "Mixing testing code, datasets, and execution scripts randomly in the project root directory.",
      "Committing huge datasets, temporary log files, or secret configs to Git histories.",
      "Overcomplicating layouts by adding 10 nested directories for a simple 100-line script."
    ],
    evaluation: "The interviewer evaluates your professional organization. They are comparing your layout to standard industry standards, verifying that you build maintainable software.",
    realWorldContext: "Large production ML systems (like Uber's Michelangelo or Google's internal templates) enforce strict repository layouts so that shared CI/CD pipelines can auto-build, test, lint, and deploy code smoothly."
  },
  {
    id: "readme",
    title: "11. The README Guide",
    category: "Packaging",
    description: "Technical instructions, setup guides, and project onboarding.",
    what: "A README file is the entry-level technical document for a repository. It provides clear, step-by-step instructions on project purpose, local setup, command execution, and expected outcomes.",
    why: "Great code is useless if nobody knows how to run it. A comprehensive README represents the first impression of your engineering quality, and guides colleagues and automated environments through running your code successfully.",
    how: "Write a structured Markdown file containing: a project description, prerequisite setup commands, standard run examples, Docker compilation and execution instructions, and a sample of the outputs (logs and metrics).",
    codeExample: `# Minimal MLOps Batch Job

Simple Python batch pipeline that reads a CSV dataset, calculates rolling moving averages, and outputs trading signals.

## Getting Started

### Prerequisites
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Local Execution
\`\`\`bash
python run.py --config config.yaml
\`\`\`

### Docker Execution
\`\`\`bash
docker build -t mlops-batch-job .
docker run --rm -v $(pwd):/app mlops-batch-job
\`\`\``,
    bestPractices: [
      "Include the exact Docker build and run commands so developers can run the app with zero guesswork.",
      "Provide raw examples of the expected output (the format of `metrics.json` and a couple of sample log entries) for validation.",
      "Explain the exact purpose of every configuration key inside the `config.yaml` file."
    ],
    mistakes: [
      "Writing a generic, 2-line README that omits instructions on how to set parameters or run the Docker image.",
      "Including outdated commands or code patterns that throw errors when executed.",
      "Failing to document how configuration variables (like the random seed or window size) affect execution logic."
    ],
    evaluation: "The interviewer is grading your communication skills, empathy for team collaborators, and overall professional presentation.",
    realWorldContext: "In open-source ML systems and elite engineering organizations, the README is treated with the same level of care as the code itself. Excellent documentation is the dividing line between high-impact engineering and chaotic codebases."
  },
  {
    id: "rubric",
    title: "12. The Evaluation Rubric",
    category: "Grading & Industry",
    description: "Decoding what senior interviewers are looking for during grading.",
    what: "The evaluation rubric represents the specific grid criteria senior hiring managers use to grade engineering assessments.",
    why: "Technical interviews are not just about finding 'if the code works.' Interviewers want to see how you think, your attention to detail, and whether you apply professional production-grade standards to simple exercises.",
    how: "Grading scales focus on: Correctness (does it execute properly?), Determinism (reproducibility of seed outputs), Containerization (does the Docker file build securely and run cleanly?), Code quality (type hints, PEP8 compliance, defensive validations), and Observability (structured logging and JSON metrics output).",
    bestPractices: [
      "Write clean, PEP8-compliant code with clear docstrings and comprehensive TypeScript-like type hints for all parameters.",
      "Add robust error boundaries; write unit tests to verify mathematical correctness of edge cases.",
      "Double check that every file is formatted correctly and free of hardcoded assumptions."
    ],
    mistakes: [
      "Treating the assessment as a quick, throwaway script rather than a professional production candidate module.",
      "Ignoring warnings or linter alerts, resulting in dirty compilation outputs.",
      "Omitting structured tests, leading to manual verification bottlenecks."
    ],
    evaluation: "Interviewers use the rubric to assess your maturity level: junior developers write code that 'just works' on their machine; senior engineers build robust, validated, containerized pipelines that run anywhere.",
    realWorldContext: "At elite companies, all engineering hires are evaluated using structured grading rubrics to maintain a high quality bar and prevent biased hiring decisions."
  },
  {
    id: "auto_fail",
    title: "13. Auto-Fail Conditions",
    category: "Grading & Industry",
    description: "The non-negotiable criteria that immediately end an interview.",
    what: "Auto-fail conditions are fatal flaws in an assessment submission that result in immediate rejection, regardless of how good the rest of the code is.",
    why: "In production systems, certain mistakes are so expensive, dangerous, or disruptive that they cannot be tolerated under any circumstance. Demonstrating these mistakes in an assessment shows a lack of foundational engineering hygiene.",
    how: "To avoid auto-fail, ensure: your Docker image builds without any errors, the `metrics.json` file is written under all circumstances (even on pipeline crashes), there are zero hardcoded local filesystem paths, outputs are perfectly deterministic, and comprehensive running documentation exists.",
    bestPractices: [
      "Always test your Docker build on a fresh machine (or clear your Docker cache) before submitting your repository.",
      "Delete any local dataset files to verify that your script correctly reports a clean validation error and writes `metrics.json` instead of raw crashing.",
      "Set up strict automation lint checks (e.g., using GitHub Actions) to catch syntax errors or broken imports instantly."
    ],
    mistakes: [
      "Submitting an application with a broken `Dockerfile` that crashes during compilation.",
      "Leaving hardcoded absolute paths (like `/Users/john/mlops/data.csv`) that crash immediately when run on the grader's computer.",
      "Letting the pipeline fail silently on a missing file without producing the required `metrics.json` file."
    ],
    evaluation: "Interviewers use auto-fail criteria to quickly filter out candidates who lack operational discipline, attention to detail, and a commitment to software reliability.",
    realWorldContext: "In production systems, a hardcoded path or a broken container build can block hotfixes, bring down serving infrastructure, and cost companies millions of dollars in downtime."
  },
  {
    id: "real_world",
    title: "14. Real-World MLOps",
    category: "Grading & Industry",
    description: "Connecting batch job constraints to elite systems architecture.",
    what: "Real-world MLOps translates simple technical assessment requirements (configs, seeds, metrics, Docker) into the enterprise systems running at scale in companies like Google, OpenAI, Netflix, or financial trading desks.",
    why: "Understanding the bridge between a simple local exercise and massive global infrastructure is the key to proving senior-level engineering depth during your technical reviews.",
    how: "A clear architectural mapping links each requirement to scale-up infrastructure:",
    codeExample: `Local Assessment Key      ==>   Enterprise System Scale
------------------------------------------------------------------
1. YAML config             ==>   Dynamic Config Orchestrators (Hydra, Vault)
2. Random Seed             ==>   Experiment Trackers (MLflow, Weights & Biases)
3. Dataset Validation      ==>   Data Quality Engines (Great Expectations, Pandera)
4. Rolling Mean            ==>   Feature Stores (Feast, Hopsworks, Tecton)
5. Signal Generation       ==>   Inference Service Engines (Triton, TorchServe)
6. Metrics output          ==>   Telemetry Aggregators (Prometheus, Grafana)
7. Production Logging      ==>   Distributed Log Analyzers (ELK stack, Splunk)
8. Containerization        ==>   Orchestration Platforms (Kubernetes, AWS EKS)`,
    bestPractices: [
      "Use technical interviews to speak fluently about how your local code structure maps to enterprise-scale services.",
      "Explain how your JSON metrics output is designed to be parsed easily by standardized collectors like Prometheus.",
      "Discuss data drift and feature store logic when talking about rolling calculations."
    ],
    mistakes: [
      "Treating MLOps as just 'writing Python code' rather than understanding the end-to-end containerized operational lifecycle.",
      "Failing to explain *why* Docker or standard JSON logging is critical for modern cloud-native Kubernetes environments."
    ],
    evaluation: "The interviewer is grading your system-level architecture vision. They want to see if you can design scalable, resilient, and highly observable ML systems that align with modern cloud-native operations.",
    realWorldContext: "Uber's Michelangelo platforms and Google's internal ML workflows serve billions of daily requests. They enforce these identical concepts (reproducibility, validation, containerization, observability) to keep planetary-scale services reliable and performing at their peak."
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    moduleId: "yaml",
    question: "Why should we avoid using PyYAML's default `yaml.load()` in a production environment?",
    options: [
      "It is too slow compared to JSON parsers.",
      "It doesn't support nested dictionaries.",
      "It can execute arbitrary Python code embedded in the configuration file, creating a major security vulnerability.",
      "It automatically converts all integers to floating-point numbers."
    ],
    correctAnswerIndex: 2,
    explanation: "Standard `yaml.load()` can instantiate arbitrary Python objects from tags inside the configuration file, allowing malicious users to execute unauthorized commands. Always use `yaml.safe_load()` instead."
  },
  {
    id: "q2",
    moduleId: "seed",
    question: "To guarantee reproducibility of a Numpy-based pipeline run, what is the best practice approach?",
    options: [
      "Call `numpy.random.seed()` once at the top of every file.",
      "Create a local random generator using `np.random.default_rng(seed)` and pass it down explicitly.",
      "Rely on standard Python `random.seed()` as it automatically configures Numpy.",
      "Seed the operating system's random number generator directly via bash."
    ],
    correctAnswerIndex: 1,
    explanation: "While global seeding is common, standard best practice in modern Numpy is to create local generator instances (`default_rng`). This prevents other imported libraries from secretly modifying or advancing the global random state."
  },
  {
    id: "q3",
    moduleId: "validation",
    question: "Which pattern describes the 'Fail Fast' principle in dataset validation?",
    options: [
      "Calculate all values and check if they are correct after outputting the final file.",
      "Run validation in parallel while processing calculations, aborting if something fails.",
      "Verify all file, layout, and schema constraints immediately upon script startup before any memory-heavy calculations execute.",
      "Ignore validation errors until a customer reports a diagnostic bug."
    ],
    correctAnswerIndex: 2,
    explanation: "The 'Fail Fast' principle advocates for executing validations at the earliest possible entry point to prevent the application from wasting CPU cycles, locking files, or producing corrupt metrics under bad states."
  },
  {
    id: "q4",
    moduleId: "rolling_mean",
    question: "What is a major mathematical edge case to handle when calculating a rolling mean of size w on a dataframe of size n?",
    options: [
      "When the window size w is strictly larger than the total dataset size n, resulting in NaN values for every row.",
      "When the dataset has an even number of rows.",
      "When the column contains string characters.",
      "When the rolling window size is 0."
    ],
    correctAnswerIndex: 0,
    explanation: "If the window size is greater than the total number of rows, a standard rolling calculation will return NaN for all rows. A defensive script should explicitly raise a descriptive error when window_size > len(dataframe)."
  },
  {
    id: "q5",
    moduleId: "signal",
    question: "How can you prevent 'Lookahead Bias' when calculating rolling signal features in timeseries forecasting?",
    options: [
      "Use data from future days to smooth the current day's calculations.",
      "Reverse the sorting of the dataset before applying rolling operations.",
      "Ensure the moving window at index t only aggregates historical data points from t-w up to t, never points beyond t.",
      "Double the window size."
    ],
    correctAnswerIndex: 2,
    explanation: "Lookahead bias occurs when future information is accidentally used in current calculations, creating unrealistic backtest metrics that fail completely in real-time production inference."
  },
  {
    id: "q6",
    moduleId: "metrics",
    question: "Which of the following is a critical MLOps requirement for metrics.json?",
    options: [
      "It must look highly styled with HTML tags.",
      "It must be machine-readable, using valid standard JSON types, and always be produced even when errors occur.",
      "It must be encrypted with a password.",
      "It must be written as a Python dictionary inside a `.py` file."
    ],
    correctAnswerIndex: 1,
    explanation: "In production, monitoring tools parse the `metrics.json` file automatically. It must be valid, machine-readable JSON and must always be produced (with appropriate status values) so that system orchestrators can log execution status."
  },
  {
    id: "q7",
    moduleId: "error_handling",
    question: "Why is a `finally` block highly recommended when writing metrics.json?",
    options: [
      "It runs the calculations twice as fast.",
      "It guarantees the metrics file is written, even if the pipeline catches an error or crashes unexpectedly.",
      "It automatically converts floats to strings.",
      "It prevents Python from creating cache directories."
    ],
    correctAnswerIndex: 1,
    explanation: "A `finally` block always executes regardless of whether an exception is raised or not inside the `try` block, making it the perfect place to save execution metrics and failure diagnostic states."
  },
  {
    id: "q8",
    moduleId: "logging",
    question: "Why are raw `print()` statements forbidden in enterprise MLOps systems?",
    options: [
      "Python standard output is not supported by terminal containers.",
      "Print statements run significantly slower than logging libraries.",
      "They lack timestamps, log-levels (INFO, ERROR), module names, and cannot easily be redirected to standard rotating file handlers.",
      "They automatically terminate the running script if they fail."
    ],
    correctAnswerIndex: 2,
    explanation: "Standard `print()` is too simplistic for production. Log aggregators require structured tags (timestamps, log levels, service context) to search, index, and trigger alerts across distributed container fleets."
  },
  {
    id: "q9",
    moduleId: "docker",
    question: "Why should we copy `requirements.txt` and install libraries BEFORE copying the rest of the source code in a Dockerfile?",
    options: [
      "Docker forces files to be in alphabetical order.",
      "It is a mandatory security constraint required by Pythonslim.",
      "It leverages Docker's layer caching so that package installation is skipped on subsequent builds unless dependencies change.",
      "It decreases the runtime RAM usage of the container."
    ],
    correctAnswerIndex: 2,
    explanation: "Docker caches layers. If you copy requirements first, Docker only rebuilds that heavy installation step when `requirements.txt` changes. If you copy source code first, any single line change in code invalidates the cache and forces a full package download."
  }
];
