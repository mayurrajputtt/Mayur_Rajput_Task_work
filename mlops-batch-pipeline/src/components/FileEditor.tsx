import React, { useState } from "react";
import { Save, RefreshCw, AlertCircle, CheckCircle, Sliders, Database } from "lucide-react";

interface FileEditorProps {
  configContent: string;
  dataContent: string;
  onSaveFile: (fileName: string, content: string) => Promise<void>;
  onRunPipeline: () => void;
}

export const FileEditor: React.FC<FileEditorProps> = ({
  configContent,
  dataContent,
  onSaveFile,
  onRunPipeline,
}) => {
  const [config, setConfig] = useState(configContent);
  const [data, setData] = useState(dataContent);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingData, setSavingData] = useState(false);
  const [msgConfig, setMsgConfig] = useState("");
  const [msgData, setMsgData] = useState("");

  const handleSaveConfig = async (newContent?: string) => {
    const toSave = newContent !== undefined ? newContent : config;
    setSavingConfig(true);
    setMsgConfig("");
    try {
      await onSaveFile("config.yaml", toSave);
      setMsgConfig("Saved config.yaml successfully!");
      setTimeout(() => setMsgConfig(""), 3000);
    } catch (e: any) {
      setMsgConfig(`Error: ${e.message}`);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveData = async (newContent?: string) => {
    const toSave = newContent !== undefined ? newContent : data;
    setSavingData(true);
    setMsgData("");
    try {
      await onSaveFile("data.csv", toSave);
      setMsgData("Saved data.csv successfully!");
      setTimeout(() => setMsgData(""), 3000);
    } catch (e: any) {
      setMsgData(`Error: ${e.message}`);
    } finally {
      setSavingData(false);
    }
  };

  // Quick Presets
  const applyPreset = async (type: string) => {
    if (type === "valid-standard") {
      const c = "seed: 42\nwindow: 5\nversion: \"v1\"\n";
      setConfig(c);
      await handleSaveConfig(c);
    } else if (type === "valid-window10") {
      const c = "seed: 123\nwindow: 10\nversion: \"v2.1\"\n";
      setConfig(c);
      await handleSaveConfig(c);
    } else if (type === "err-missing-seed") {
      const c = "window: 5\nversion: \"v1\"\n";
      setConfig(c);
      await handleSaveConfig(c);
    } else if (type === "err-negative-window") {
      const c = "seed: 42\nwindow: -5\nversion: \"v1\"\n";
      setConfig(c);
      await handleSaveConfig(c);
    } else if (type === "err-missing-close-col") {
      const d = "Date,Open,High,Low,Volume\n2024-01-01,150,152,149,1200000\n2024-01-02,151,153,150,1300000\n";
      setData(d);
      await handleSaveData(d);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Scenarios Presets Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>EVALUATION TEST SCENARIOS & PRESETS</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={async () => {
              await applyPreset("valid-standard");
              onRunPipeline();
            }}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs transition-colors"
          >
            Valid Config (Window 5, Seed 42)
          </button>
          <button
            onClick={async () => {
              await applyPreset("valid-window10");
              onRunPipeline();
            }}
            className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-xs transition-colors"
          >
            Window = 10, Version = v2.1
          </button>
          <button
            onClick={async () => {
              await applyPreset("err-missing-seed");
              onRunPipeline();
            }}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-xs transition-colors flex items-center space-x-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Test Error: Missing Seed Field</span>
          </button>
          <button
            onClick={async () => {
              await applyPreset("err-negative-window");
              onRunPipeline();
            }}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-xs transition-colors flex items-center space-x-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Test Error: Window = -5</span>
          </button>
          <button
            onClick={async () => {
              await applyPreset("err-missing-close-col");
              onRunPipeline();
            }}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-xs transition-colors flex items-center space-x-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Test Error: Missing Close Column</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* config.yaml Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>config.yaml</span>
            </div>
            <button
              onClick={() => handleSaveConfig()}
              disabled={savingConfig}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              {savingConfig ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              <span>Save Config</span>
            </button>
          </div>

          {msgConfig && (
            <div className="mb-2 text-xs text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{msgConfig}</span>
            </div>
          )}

          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            rows={10}
            className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-amber-200 focus:outline-none focus:border-amber-500/50 resize-y"
            placeholder="seed: 42&#10;window: 5&#10;version: &quot;v1&quot;"
          />
          <p className="mt-2 text-[11px] text-slate-400">
            Validation requires: <code className="text-amber-300">seed</code> (integer),{" "}
            <code className="text-amber-300">window</code> (integer &gt; 0), and{" "}
            <code className="text-amber-300">version</code> (string).
          </p>
        </div>

        {/* data.csv Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>data.csv</span>
            </div>
            <button
              onClick={() => handleSaveData()}
              disabled={savingData}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              {savingData ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              <span>Save Data CSV</span>
            </button>
          </div>

          {msgData && (
            <div className="mb-2 text-xs text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{msgData}</span>
            </div>
          )}

          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            rows={10}
            className="w-full bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500/50 resize-y"
            placeholder="Date,Open,High,Low,Close,Volume..."
          />
          <p className="mt-2 text-[11px] text-slate-400">
            Must contain a valid <code className="text-indigo-300">close</code> column with numeric OHLCV prices.
          </p>
        </div>
      </div>
    </div>
  );
};
