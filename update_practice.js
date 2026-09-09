const fs = require('fs');

// Load old questions from www/questions.js
const wwwContent = fs.readFileSync('www/questions.js', 'utf8');
const idx1 = wwwContent.indexOf('const INITIAL_YDS_QUESTIONS = [');
const idx2 = wwwContent.indexOf('const STORAGE_KEYS');
const closeBracketIdx = wwwContent.lastIndexOf('];', idx2);
const jsonStr = wwwContent.substring(idx1 + 'const INITIAL_YDS_QUESTIONS = '.length, closeBracketIdx + 1);
const oldQuestions = JSON.parse(jsonStr);
console.log('Loaded old questions:', oldQuestions.length);

// Unique map
const uniqueMap = new Map();
oldQuestions.forEach(q => {
  const text = (q.questionText || '').trim();
  if (text && !uniqueMap.has(text)) {
    uniqueMap.set(text, q);
  }
});
console.log('Unique mock questions:', uniqueMap.size);

// Load practice_questions.js
const pContent = fs.readFileSync('practice_questions.js', 'utf8');
const pMatch = pContent.match(/const PRACTICE_YDS_QUESTIONS = (\[[\s\S]*?\]);/);
const currentPractice = JSON.parse(pMatch[1]);
console.log('Current practice count:', currentPractice.length);

const existingTexts = new Set(currentPractice.map(q => (q.questionText || '').trim()));

let counter = currentPractice.length + 1;
let addedCount = 0;
const newPractice = [...currentPractice];

for (const [text, q] of uniqueMap.entries()) {
  if (existingTexts.has(text)) continue;
  const adapted = {
    ...q,
    id: 'practice-' + counter,
    exam: 'YDS Alıştırma',
    year: 'Alıştırma',
    term: 'Serbest',
    questionNumber: counter
  };
  newPractice.push(adapted);
  counter++;
  addedCount++;
}

console.log('Added to practice pool:', addedCount);
console.log('New total practice questions:', newPractice.length);

const updatedJs = '// YDS Alıştırmalık Soru Havuzu (Practice Mode Questions Bank)\n' +
  '// Resmi denemelerden tamamen bağımsız, çakışmayan soru seti.\n' +
  '// Toplam ' + newPractice.length + ' Adet Soru\n\n' +
  'const PRACTICE_YDS_QUESTIONS = ' + JSON.stringify(newPractice, null, 2) + ';\n\n' +
  'if (typeof module !== \'undefined\' && module.exports) {\n' +
  '  module.exports = { PRACTICE_YDS_QUESTIONS };\n' +
  '}\n';

fs.writeFileSync('practice_questions.js', updatedJs, 'utf8');
console.log('practice_questions.js written successfully!');
