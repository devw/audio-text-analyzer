const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const transcribeAudio = async (filePath, language = 'auto') => {
  console.log('Starting transcription...');
  
  return new Promise((resolve, reject) => {
    const whisperPath = path.join(__dirname, '../../venv/bin/whisper');
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
      
      if (language === 'auto') {
        const langMatch = output.match(/Detected language: (\w+)/);
        if (langMatch) {
          detectedLanguage = langMatch[1];
          console.log(`\nDetected language: ${detectedLanguage}`);
        }
      }
      
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
      console.log('');
      
      if (code === 0) {
        const transcriptPath = `${outputDir}/${filename}.txt`;
        
        if (fs.existsSync(transcriptPath)) {
          const transcript = fs.readFileSync(transcriptPath, 'utf8');
          fs.unlinkSync(transcriptPath);
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
};

module.exports = { transcribeAudio };
