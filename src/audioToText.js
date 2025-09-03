#!/usr/bin/env node

const { program } = require('commander');
const { transcribeAudio } = require('./utils/transcription');
const { analyzeText } = require('./utils/textAnalysis');
const { generateReport } = require('./utils/reportGenerator');
const { validateAudioFile, saveTranscript } = require('./utils/fileUtils');

const main = async () => {
  program
    .name('audio-analyzer')
    .description('Convert audio to text and perform comprehensive analysis')
    .argument('<file>', 'Audio file path (MP3 or AAC)')
    .option('-o, --output <file>', 'Output file for the report')
    .option('-l, --language <lang>', 'Language code (e.g., en, it, fr, es, de)', 'auto')
    .parse();

  const [audioFile] = program.args;
  const options = program.opts();

  try {
    validateAudioFile(audioFile);
    
    console.log('Starting audio analysis...\n');
    const { transcript, language } = await transcribeAudio(audioFile, options.language);
    
    saveTranscript(transcript, audioFile);
    
    const analysis = analyzeText(transcript);
    console.log('Generating report...');
    generateReport(transcript, analysis, language, options.output);
    console.log('Analysis complete!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}
