const fs = require('fs');

const generateReport = (transcript, analysis, language, outputFile) => {
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
    fs.writeFileSync(outputFile, report);
    console.log(`Report saved to: ${outputFile}`);
    
    const transcriptFile = outputFile.replace(/\.[^/.]+$/, '_transcript.txt');
    fs.writeFileSync(transcriptFile, transcript);
    console.log(`Transcript saved to: ${transcriptFile}`);
  } else {
    console.log(report);
  }
};

module.exports = { generateReport };
