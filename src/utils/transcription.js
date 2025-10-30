const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// 🔹 Utility: build whisper command arguments
function buildWhisperArgs(filePath, outputDir, language) {
    const args = [
        filePath,
        "--model",
        "base",
        "--output_format",
        "json",
        "--output_dir",
        outputDir,
        "--verbose",
        "True",
    ];
    if (language !== "auto") args.push("--language", language);
    return args;
}

// 🔹 Utility: parse whisper stderr for progress & language
function handleWhisperOutput(data, language, detectedLanguage, progressRef) {
    const output = data.toString();

    // detect language
    if (language === "auto") {
        const langMatch = output.match(/Detected language: (\w+)/);
        if (langMatch) {
            detectedLanguage.value = langMatch[1];
            console.log(`\nDetected primary language: ${detectedLanguage.value}`);
        }
    }

    // detect progress
    const progressMatch = output.match(/(\d+)%/);
    if (progressMatch) {
        const newProgress = parseInt(progressMatch[1]);
        if (newProgress > progressRef.value) {
            progressRef.value = newProgress;
            process.stdout.write(`\r[${newProgress}%] Transcribing audio...`);
        }
    }
}

// 🔹 Utility: read and parse whisper output JSON
function parseWhisperOutput(filePath, detectedLanguage) {
    if (!fs.existsSync(filePath)) throw new Error("Transcription file not found");

    const rawData = fs.readFileSync(filePath, "utf8");
    fs.unlinkSync(filePath);

    try {
        const jsonData = JSON.parse(rawData);
        const fullText = jsonData.text || jsonData.segments.map((s) => s.text).join(" ");
        const segments = jsonData.segments.map((s) => ({
            start: s.start,
            end: s.end,
            text: s.text.trim(),
            language: s.language || detectedLanguage,
        }));

        return { fullText, segments };
    } catch {
        throw new Error("Failed to parse Whisper JSON output.");
    }
}

// 🔹 Main transcription logic
async function transcribeAudio(filePath, language = "auto") {
    console.log("Starting transcription with multilingual support...");

    return new Promise((resolve, reject) => {
        const whisperPath = path.join(__dirname, "../../venv/bin/whisper");
        const filename = path.basename(filePath, path.extname(filePath));
        const outputDir = "/tmp";

        const args = buildWhisperArgs(filePath, outputDir, language);
        const whisper = spawn(whisperPath, args);

        const progress = { value: 0 };
        const detectedLanguage = { value: language === "auto" ? "Unknown" : language };

        whisper.stderr.on("data", (data) => handleWhisperOutput(data, language, detectedLanguage, progress));

        whisper.on("close", (code) => {
            console.log("");

            if (code === 0) {
                try {
                    const transcriptPath = `${outputDir}/${filename}.json`;
                    const { fullText, segments } = parseWhisperOutput(transcriptPath, detectedLanguage.value);

                    resolve({
                        transcript: fullText.trim(),
                        language: detectedLanguage.value,
                        segments,
                    });
                } catch (err) {
                    reject(err);
                }
            } else {
                reject(new Error(`Whisper process exited with code ${code}`));
            }
        });

        whisper.on("error", (error) => {
            reject(new Error(`Failed to start Whisper: ${error.message}`));
        });
    });
}

module.exports = { transcribeAudio };
