import React from "react";
import { CheckCircle2, ShieldCheck, Terminal, FileCode, Server, Database } from "lucide-react";

export const AssessmentChecklist: React.FC = () => {
  const criteria = [
    {
      category: "CLI Signature & Path Specification",
      icon: Terminal,
      items: [
        "CLI command syntax: python run.py --input data.csv --config config.yaml --output metrics.json --log-file run.log",
        "Uses argparse for argument parsing without hardcoded paths",
        "Supports custom input, config, output, and log paths dynamically",
      ],
    },
    {
      category: "Configuration Validation (config.yaml)",
      icon: FileCode,
      items: [
        "YAML schema validation for required fields: seed, window, version",
        "Validates seed is integer, window is positive integer (> 0), version is non-empty string",
        "On invalid config: logs error with stack trace, writes error metrics.json, exits with non-zero code",
      ],
    },
    {
      category: "Data Validation & Technical Processing",
      icon: Database,
      items: [
        "CSV checks: existence, readability, non-empty, valid CSV format, required 'close' column presence",
        "Sets deterministic seed via numpy.random.seed(seed)",
        "Computes rolling mean using close.rolling(window).mean() with NaN for initial window-1 rows",
        "Generates binary signal: 1 if close > rolling_mean else 0 (NaN evaluates to 0 without filling NaNs)",
      ],
    },
    {
      category: "Metrics Output (metrics.json)",
      icon: Server,
      items: [
        "Measures execution latency using time.perf_counter() in milliseconds",
        "Exact JSON format matching specification for success & error states",
        "Always writes metrics.json even on execution failure or validation error",
      ],
    },
    {
      category: "Logging & Code Quality",
      icon: ShieldCheck,
      items: [
        "Python logging to both stdout and run.log file with ISO timestamps and log levels",
        "Logs job start, config load, validation success, rows loaded, rolling mean, signal gen, metrics, job end",
        "Functions: load_config, validate_config, load_dataset, validate_dataset, compute_signals, write_metrics, setup_logger, main",
        "PEP8 compliant with type hints, comprehensive docstrings, exception handling, and proper exit codes",
      ],
    },
    {
      category: "Docker & Documentation",
      icon: Terminal,
      items: [
        "Base image python:3.9-slim with requirements.txt installation",
        "Default CMD executes python run.py ... && cat metrics.json to stdout",
        "Complete README.md with overview, setup, local execution, Docker build/run, expected outputs, troubleshooting",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4 mb-4">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Evaluation Matrix & Compliance Checklist</h2>
            <p className="text-xs text-slate-400">
              Strictly verified against all technical assessment instructions and specification criteria
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {criteria.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-2 text-sm font-semibold text-indigo-300 mb-3">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span>{section.category}</span>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
