import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { ExecutionPanel } from "./components/ExecutionPanel";
import { SignalChart } from "./components/SignalChart";
import { FileEditor } from "./components/FileEditor";
import { RepositoryViewer } from "./components/RepositoryViewer";
import { AssessmentChecklist } from "./components/AssessmentChecklist";
import { PipelineMetrics, WorkspaceFiles } from "./types";
import * as jsYaml from "js-yaml";

export default function App() {
  const [activeTab, setActiveTab] = useState("execution");
  const [files, setFiles] = useState<WorkspaceFiles>({
    config: "",
    data: "",
    runPy: "",
    metrics: "",
    runLog: "",
    dockerfile: "",
    readme: "",
    requirements: "",
  });
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [logs, setLogs] = useState("");
  const [command, setCommand] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [windowSize, setWindowSize] = useState(5);

  // Fetch current workspace files
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data);

      if (data.metrics) {
        try {
          const parsedMetrics = JSON.parse(data.metrics);
          setMetrics(parsedMetrics);
        } catch {
          // ignore
        }
      }

      if (data.runLog) {
        setLogs(data.runLog);
      }

      if (data.config) {
        try {
          const parsedConfig = jsYaml.load(data.config) as any;
          if (parsedConfig && typeof parsedConfig.window === "number") {
            setWindowSize(parsedConfig.window);
          }
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.error("Failed to fetch files:", e);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Execute pipeline via API
  const handleRunPipeline = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/run", { method: "POST" });
      const data = await res.json();

      setCommand(data.command || "");

      if (data.metrics) {
        setMetrics(data.metrics);
      }

      if (data.logs || data.stdout) {
        setLogs(data.logs || data.stdout);
      }

      // Re-fetch files to update repository viewer & charts
      await fetchFiles();
    } catch (e) {
      console.error("Failed to execute pipeline:", e);
    } finally {
      setIsRunning(false);
    }
  };

  // Save modified file
  const handleSaveFile = async (fileName: string, content: string) => {
    const res = await fetch("/api/files/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, content }),
    });

    if (!res.ok) {
      throw new Error("Failed to save file");
    }

    await fetchFiles();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Header
        metrics={metrics}
        isRunning={isRunning}
        onRunPipeline={handleRunPipeline}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "execution" && (
          <ExecutionPanel
            metrics={metrics}
            logs={logs}
            command={command}
            isRunning={isRunning}
            onRunPipeline={handleRunPipeline}
          />
        )}

        {activeTab === "visualize" && (
          <SignalChart csvContent={files.data} windowSize={windowSize} />
        )}

        {activeTab === "config" && (
          <FileEditor
            configContent={files.config}
            dataContent={files.data}
            onSaveFile={handleSaveFile}
            onRunPipeline={handleRunPipeline}
          />
        )}

        {activeTab === "repository" && <RepositoryViewer files={files} />}

        {activeTab === "assessment" && <AssessmentChecklist />}
      </main>
    </div>
  );
}
