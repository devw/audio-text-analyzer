const natural = require('natural');
const Sentiment = require('sentiment');
const keyword = require('keyword-extractor');
const nlp = require('compromise');

const sentiment = new Sentiment();

const analyzeText = (text) => {
  console.log('Analyzing text...');
  
  const sentenceTokenizer = new natural.SentenceTokenizer();
  const sentences = sentenceTokenizer.tokenize(text);
  const summary = sentences.slice(0, Math.min(3, Math.ceil(sentences.length * 0.3))).join(' ');
  
  const keywords = keyword.extract(text, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: true
  }).slice(0, 10);
  
  const sentimentResult = sentiment.analyze(text);
  
  const doc = nlp(text);
  const entities = {
    people: doc.people().out('array'),
    places: doc.places().out('array'),
    organizations: doc.organizations().out('array')
  };
  
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
};

module.exports = { analyzeText };
