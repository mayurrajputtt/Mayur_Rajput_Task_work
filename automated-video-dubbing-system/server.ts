import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Get all Python project files and contents
  app.get("/api/files", (req, res) => {
    const projectDir = path.join(process.cwd(), "video_dubber");
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const filesToRead = [
      "requirements.txt",
      "config.py",
      "logger.py",
      "utils.py",
      "downloader.py",
      "transcription.py",
      "translator.py",
      "tts.py",
      "merger.py",
      "main.py",
      "README.md"
    ];

    const result = filesToRead.map(fileName => {
      const filePath = path.join(projectDir, fileName);
      const exists = fs.existsSync(filePath);
      let content = "";
      if (exists) {
        try {
          content = fs.readFileSync(filePath, "utf-8");
        } catch (e) {
          content = `# Error reading file: ${e}`;
        }
      }
      return {
        name: fileName,
        exists,
        content
      };
    });

    res.json({ files: result });
  });

  // API Route: Single file download
  app.get("/api/files/download/:name", (req, res) => {
    const name = req.params.name;
    const filePath = path.join(process.cwd(), "video_dubber", name);
    if (fs.existsSync(filePath)) {
      res.download(filePath, name);
    } else {
      res.status(404).send("File not found");
    }
  });

  // API Route: Simulate the dubbing process with logs and timers
  app.post("/api/simulate-dubbing", (req, res) => {
    const { youtubeUrl, voice, targetLanguage } = req.body;
    if (!youtubeUrl) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }

    // Set up a streaming-like mock experience using custom step triggers or simple timeouts
    // Since it's a regular POST request, let's return a list of steps with duration and success markers,
    // and the frontend can animate them like a real terminal log in real-time!
    const simulationLogs = [
      { step: "downloader", label: "Downloading Video", detail: `Downloading from YouTube URL: ${youtubeUrl}`, duration: 2500, log: "[INFO] yt-dlp: Initializing video download\n[INFO] yt-dlp: Extracting video information\n[INFO] yt-dlp: Destination: temp/original_video.mp4\n[INFO] yt-dlp: Download speed 15.4MiB/s, ETA 00:02\n[INFO] yt-dlp: Download complete successfully (100% in 2.3 seconds)" },
      { step: "audio_extract", label: "Extracting Audio", detail: "Extracting stream and mapping frequencies", duration: 1200, log: "[INFO] ffmpeg: Extracting original audio track from video file\n[INFO] ffmpeg: Mapping stream 0:a:0 to temp/original_audio.wav\n[INFO] ffmpeg: Audio extracted successfully (16000Hz, mono, pcm_s16le)" },
      { step: "language_detect", label: "Detecting Language", detail: `Analyzing audio for spoken language...`, duration: 1500, log: "[INFO] whisper: Loading model 'whisper-large-v3'\n[INFO] whisper: Analyzing the first 30 seconds of audio\n[INFO] whisper: Detected language: Spanish (es) with probability 98.4%\n[INFO] ASR: Language detection took 1.42s" },
      { step: "transcribe", label: "Transcribing Speech", detail: "Generating timestamps and raw text", duration: 3000, log: "[INFO] whisper: Starting transcription pipeline\n[INFO] Segment 1 [00:01.200 -> 00:04.500]: \"Hola a todos y bienvenidos a este nuevo tutorial.\"\n[INFO] Segment 2 [00:04.800 -> 00:09.100]: \"Hoy vamos a aprender cómo crear un sistema de doblaje automatizado en Python.\"\n[INFO] whisper: Saved raw transcription output in temp/transcription.json" },
      { step: "translate", label: "Translating to English", detail: `Using translation engine (Target: English)`, duration: 2000, log: `[INFO] translator: Selecting translation engine for detected language: es\n[INFO] translator: Initializing model: facebook/nllb-200-distilled-600M\n[INFO] Translate [Segment 1]: \"Hola a todos y bienvenidos a este nuevo tutorial.\" -> \"Hello everyone and welcome to this new tutorial.\"\n[INFO] Translate [Segment 2]: \"Hoy vamos a aprender cómo crear un sistema de doblaje automatizado en Python.\" -> \"Today we are going to learn how to create an automated dubbing system in Python.\"\n[INFO] translator: Translation complete. Meaning preserved. Saved to temp/translation.json` },
      { step: "tts", label: "Generating English Voice", detail: `Synthesizing via Edge-TTS with voice: ${voice || 'en-US-AndrewNeural'}`, duration: 2800, log: `[INFO] edge-tts: Initializing Microsoft Edge TTS client\n[INFO] edge-tts: Requesting voice: ${voice || 'en-US-AndrewNeural'}\n[INFO] edge-tts: Synthesizing Segment 1 (Duration requested: 3.3s)\n[INFO] edge-tts: Synthesizing Segment 2 (Duration requested: 4.3s)\n[INFO] edge-tts: All segments generated and saved in temp/tts_segments/` },
      { step: "merger", label: "Merging & Time-Aligning Audio", detail: "Merging segments and adjusting speed to fit timestamps", duration: 1800, log: "[INFO] merger: Reading speech segments and timestamps\n[INFO] merger: Stitching Segment 1 at 00:01.200 (Applying speed factor: 1.00x)\n[INFO] merger: Stitching Segment 2 at 00:04.800 (Applying speed factor: 1.02x to match original timing)\n[INFO] merger: Exporting final merged track to temp/dubbed_audio.wav" },
      { step: "ffmpeg_video", label: "Creating Final Video", detail: "Replacing original audio track using FFmpeg stream copying", duration: 2200, log: "[INFO] ffmpeg: Remuxing video with dubbed audio stream\n[INFO] ffmpeg: Command: ffmpeg -y -i temp/original_video.mp4 -i temp/dubbed_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -shortest output/dubbed_video.mp4\n[INFO] ffmpeg: Video stream copied directly without re-encoding\n[INFO] ffmpeg: Audio stream transcoded to high-quality AAC\n[INFO] ffmpeg: Final multiplex output written to output/dubbed_video.mp4" },
      { step: "completed", label: "Completed", detail: "Finished video dubbing! Output saved at output/dubbed_video.mp4", duration: 500, log: "[SUCCESS] Automated Video Dubbing Pipeline execution completed in 14.72 seconds!\n[SUCCESS] Dubbed video saved: output/dubbed_video.mp4" }
    ];

    res.json({ logs: simulationLogs });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
