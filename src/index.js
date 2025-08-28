#!/usr/bin/env node

const { program } = require('commander');
const { spawn } = require('child_process');
const natural = require('natural');
const Sentiment = require('sentiment');
const keyword = require('keyword-extractor');
const nlp = require('compromise');
const fs = require('fs');
const path = require('path');

const sentiment = new Sentiment();

async function transcribeAudio(filePath, language = 'auto') {
  console.log('Starting transcription...');
  
  return new Promise((resolve, reject) => {
    const whisperPath = path.join(__dirname, '../venv/bin/whisper');
    const filename = path.basename(filePath, path.extname(filePath));
    const outputDir = '/tmp';
    
    const args = [
      filePath,
      '--model', 'base',
      '--output_format', 'txt',
      '--output_dir', outputDir,
      '--verbose', 'True'
    ];
    
    if (language !== 'auto') {
      args.push('--language', language);
    }
    
    const whisper = spawn(whisperPath, args);

    let progress = 0;
    let detectedLanguage = language === 'auto' ? 'Unknown' : language;

    whisper.stderr.on('data', (data) => {
      const output = data.toString();
      
      // Extract language detection only if auto-detect
      if (language === 'auto') {
        const langMatch = output.match(/Detected language: (\w+)/);
        if (langMatch) {
          detectedLanguage = langMatch[1];
          console.log(`\nDetected language: ${detectedLanguage}`);
        }
      }
      
      // Extract progress from Whisper output
      const progressMatch = output.match(/(\d+)%/);
      if (progressMatch) {
        const newProgress = parseInt(progressMatch[1]);
        if (newProgress > progress) {
          progress = newProgress;
          process.stdout.write(`\r[${progress}%] Transcribing audio...`);
        }
      }
    });

    whisper.on('close', (code) => {
      console.log(''); // New line
      
      if (code === 0) {
        const transcriptPath = `${outputDir}/${filename}.txt`;
        
        if (fs.existsSync(transcriptPath)) {
          const transcript = fs.readFileSync(transcriptPath, 'utf8');
          fs.unlinkSync(transcriptPath); // Clean up
          resolve({ transcript: transcript.trim(), language: detectedLanguage });
        } else {
          reject(new Error('Transcription file not found'));
        }
      } else {
        reject(new Error(`Whisper process exited with code ${code}`));
      }
    });

    whisper.on('error', (error) => {
      reject(new Error(`Failed to start Whisper: ${error.message}`));
    });
  });
}

function analyzeText(text) {
  console.log('Analyzing text...');
  
  // Summarization (extractive)
  const sentenceTokenizer = new natural.SentenceTokenizer();
  const sentences = sentenceTokenizer.tokenize(text);
  const summary = sentences.slice(0, Math.min(3, Math.ceil(sentences.length * 0.3))).join(' ');
  
  // Keyword extraction
  const keywords = keyword.extract(text, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  }).slice(0, 10);
  
  // Sentiment analysis
  const sentimentResult = sentiment.analyze(text);
  
  // Named entity recognition
  const doc = nlp(text);
  const entities = {
    people: doc.people().out('array'),
    places: doc.places().out('array'),
    organizations: doc.organizations().out('array')
  };
  
  // Topic modeling (simple frequency-based)
  const wordTokenizer = new natural.WordTokenizer();
  const tokens = wordTokenizer.tokenize(text.toLowerCase());
  const stopwords = natural.stopwords;
  const filteredTokens = tokens.filter(token => 
    !stopwords.includes(token) && token.length > 3
  );
  
  const frequency = {};
  filteredTokens.forEach(token => {
    frequency[token] = (frequency[token] || 0) + 1;
  });
  
  const topics = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  return {
    summary,
    keywords,
    sentiment: {
      score: sentimentResult.score,
      comparative: sentimentResult.comparative,
      label: sentimentResult.score > 0 ? 'Positive' : sentimentResult.score < 0 ? 'Negative' : 'Neutral'
    },
    entities,
    topics,
    wordCount: tokens.length,
    readingTime: Math.ceil(tokens.length / 200)
  };
}

function generateReport(transcript, analysis, language, outputFile) {
  const report = `
AUDIO TRANSCRIPTION & ANALYSIS REPORT
=====================================

LANGUAGE: ${language}

TRANSCRIPT:
${transcript}

ANALYSIS SUMMARY:
-----------------
Word Count: ${analysis.wordCount}
Estimated Reading Time: ${analysis.readingTime} minutes

SUMMARY:
${analysis.summary}

KEYWORDS:
${analysis.keywords.join(', ')}

SENTIMENT ANALYSIS:
- Overall Sentiment: ${analysis.sentiment.label}
- Score: ${analysis.sentiment.score}
- Comparative Score: ${analysis.sentiment.comparative.toFixed(3)}

NAMED ENTITIES:
- People: ${analysis.entities.people.join(', ') || 'None detected'}
- Places: ${analysis.entities.places.join(', ') || 'None detected'}
- Organizations: ${analysis.entities.organizations.join(', ') || 'None detected'}

TOP TOPICS:
${analysis.topics.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

Generated on: ${new Date().toISOString()}
`;

  if (outputFile) {
    // Save full report to output file
    fs.writeFileSync(outputFile, report);
    console.log(`Report saved to: ${outputFile}`);
    
    // Save transcript to same directory as input file
    const transcriptFile = outputFile.replace(/\.[^/.]+$/, '_transcript.txt');
    fs.writeFileSync(transcriptFile, transcript);
    console.log(`Transcript saved to: ${transcriptFile}`);
  } else {
    console.log(report);
  }
}

async function main() {
  program
    .name('audio-analyzer')
    .description('Convert audio to text and perform comprehensive analysis')
    .argument('<file>', 'Audio file path (MP3 or AAC)')
    .option('-o, --output <file>', 'Output file for the report')
    .option('-l, --language <lang>', 'Language code (e.g., en, it, fr, es, de)', 'auto')
    .parse();

  const [audioFile] = program.args;
  const options = program.opts();

  if (!fs.existsSync(audioFile)) {
    console.error('Error: Audio file not found');
    process.exit(1);
  }

  const ext = path.extname(audioFile).toLowerCase();
  if (!['.mp3', '.aac'].includes(ext)) {
    console.error('Error: Unsupported file format. Use MP3 or AAC files.');
    process.exit(1);
  }

  try {
    console.log('Starting audio analysis...\n');
    const { transcript, language } = await transcribeAudio(audioFile, options.language);
    const analysis = analyzeText(transcript);
    console.log('Generating report...');
    generateReport(transcript, analysis, language, options.output);
    console.log('Analysis complete!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
