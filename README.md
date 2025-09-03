# Audio Text Analyzer

A Node.js command-line tool that converts audio files (MP3/AAC) to text and performs comprehensive text analysis including summarization, keyword extraction, sentiment analysis, and more.

## Project Structure

```
audio-text-analyzer/
├── src/
│   └── index.js          # Main application
├── input/                # Place your audio files here
├── output/               # Analysis reports & transcripts are saved here
├── .vscode/              # VSCode configuration
│   ├── launch.json       # Debug configurations
│   └── tasks.json        # Task configurations
├── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- Python 3.7+ (required for Whisper)
- FFmpeg (for audio processing)

### Install FFmpeg on macOS:
```bash
brew install ffmpeg
```

### Install FFmpeg on Linux (Debian/Ubuntu):
```bash
sudo apt update && sudo apt install -y ffmpeg
```

## Setup

1. Install Node.js dependencies:
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

2. Set up Python virtual environment and install Whisper (CLI):
```bash
# Create virtual environment at project root (expected by src/index.js)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate   # Linux/macOS

# Install Whisper CLI
pip install openai-whisper
```

3. For future runs, activate the virtual environment before using the tool:
```bash
source venv/bin/activate   # Linux/macOS
```

## Usage

### Via npm scripts
The scripts reflect common workflows and sample input.
```bash
# Analyze sample file at input/sample.mp3
npm run analyze

# Analyze sample file and save full report to output/analysis.txt
npm run analyze:output
```

### Direct CLI
```bash
# Convert audio to text (auto or specified language)
node src/audioToText.js input/sample.mp3 -l en

# Save report and transcript
node src/audioToText.js input/sample.mp3 -o output/analysis.txt

# Convert SRT subtitles to plain text
node src/subtitleToText.js input/sample.srt

# Using npm scripts
npm run analyze              # Analyzes input/sample.mp3
npm run analyze:output       # Saves to output/analysis.txt
```

### Options
- `-l, --language <lang>`: Language code (en, it, fr, es, de, etc.) - defaults to auto-detect
- `-o, --output <file>`: Save full report to file; transcript is also saved separately to `output/<input_basename>.txt`

### Progress Tracking
The tool shows real-time progress during transcription:
```
Starting audio analysis...

Starting transcription...

Detected language: Italian
[0%] Transcribing audio...
[25%] Transcribing audio...
[50%] Transcribing audio...
[100%] Transcribing audio...
Analyzing text...
Generating report...
Analysis complete!
```

### VSCode Integration

1. Place your audio file in the `input/` directory
2. Use Ctrl+Shift+P → "Tasks: Run Task" → Select task
3. Or use F5 to debug with the configured launch settings

Available tasks:
- **Install Dependencies**: Run `npm install`
- **Run Audio Analyzer**: Analyze sample file
- **Run with Output**: Analyze and save to output directory

## Features

- **Speech-to-Text**: Uses OpenAI Whisper CLI for accurate transcription with real-time progress
- **Language Support**: Auto-detect or manually specify language (Italian, French, English, Spanish, German, etc.)
- **Summarization**: Extractive summary of key sentences
- **Keyword Extraction**: Top 10 relevant keywords
- **Sentiment Analysis**: Overall sentiment with scoring
- **Named Entity Recognition**: People, places, organizations
- **Topic Modeling**: Top 5 topics based on word frequency
- **Reading Statistics**: Word count and estimated reading time

## Output Files

### Terminal Output
- Shows full report including transcript, analysis, and statistics

### File Output
- **Transcript file**: Always saved to `output/<input_basename>.txt`
- **Report file** (when using `-o` option): Complete analysis report at the specified path

## Supported Formats

- MP3
- AAC

## Supported Languages

- English (en)
- Italian (it)
- French (fr)
- Spanish (es)
- German (de)
- And many more supported by Whisper

## Notes
- Ensure the Python venv is created at the project root so the Whisper CLI is available at `venv/bin/whisper` as expected by the app.
- If Whisper or FFmpeg are not found, verify your environment is activated and dependencies are installed.
