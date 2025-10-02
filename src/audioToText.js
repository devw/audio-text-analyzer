#!/usr/bin/env node

const { program } = require("commander");
const { transcribeAudio } = require("./utils/transcription");
const { analyzeText } = require("./utils/textAnalysis");
const { generateReport } = require("./utils/reportGenerator");
const { validateAudioFile, saveTranscript } = require("./utils/fileUtils");

// 🔹 1. Parsing CLI
const parseCLIArgs = () => {
    program
        .name("audio-analyzer")
        .description("Convert audio to text and perform comprehensive analysis")
        .argument("<file>", "Audio file path (MP3, AAC, or M4A)")
        .option("-o, --output <file>", "Output file for the report")
        .option("-l, --language <lang>", "Language code (e.g., en, it, fr, es, de)", "auto")
        .parse();

    const [audioFile] = program.args;
    const options = program.opts();

    return { audioFile, options };
};

// 🔹 2. Gestione audio
const processAudioFile = async (audioFile, language) => {
    validateAudioFile(audioFile);
    console.log("Starting audio analysis...\n");
    return await transcribeAudio(audioFile, language);
};

// 🔹 3. Analisi testo
const analyzeTranscript = (transcript, audioFile) => {
    saveTranscript(transcript, audioFile);
    return analyzeText(transcript);
};

// 🔹 4. Creazione report
const createFinalReport = (transcript, analysis, language, outputFile) => {
    console.log("Generating report...");
    generateReport(transcript, analysis, language, outputFile);
    console.log("Analysis complete!");
};

// 🔹 MAIN
const main = async () => {
    try {
        const { audioFile, options } = parseCLIArgs();
        const { transcript, language } = await processAudioFile(audioFile, options.language);
        const analysis = analyzeTranscript(transcript, audioFile);
        createFinalReport(transcript, analysis, language, options.output);
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    main();
}
