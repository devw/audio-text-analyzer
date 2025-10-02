const fs = require("fs");
const path = require("path");

const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const saveTranscript = (transcript, inputFilePath) => {
    const inputFilename = path.basename(inputFilePath, path.extname(inputFilePath));
    const transcriptFile = path.join("output", `${inputFilename}.txt`);

    ensureDirectoryExists("output");
    fs.writeFileSync(transcriptFile, transcript);
    console.log(`Transcript saved to: ${transcriptFile}`);

    return transcriptFile;
};

const validateAudioFile = (audioFile) => {
    if (!fs.existsSync(audioFile)) {
        throw new Error("Audio file not found");
    }

    const ext = path.extname(audioFile).toLowerCase();
    if (![".mp3", ".aac", ".m4a"].includes(ext)) {
        throw new Error("Unsupported file format. Use MP3, AAC, or M4A files.");
    }
};

module.exports = {
    ensureDirectoryExists,
    saveTranscript,
    validateAudioFile,
};
