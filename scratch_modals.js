const fs = require('fs');
const path = 'C:/Users/enesk/.gemini/antigravity/scratch/yds-soru-filtreleme/www/app.js';
let content = fs.readFileSync(path, 'utf8');

const opens = ['openWordModal', 'openLearningPoolModal', 'openFlashcardsModal', 'openYearExamModal', 'openNameModal', 'openSettingsModal', 'showExamScorecard'];
const closes = ['closeWordModal', 'closeLearningPoolModal', 'closeFlashcardsModal', 'closeYearExamModal', 'closeNameModal', 'closeSettingsModal', 'closeExamScorecard'];

opens.forEach(fn => {
    const regex = new RegExp(fn + '\\\\(.*?\\\\)\\\\s*\\{');
    content = content.replace(regex, match => match + '\n    document.body.style.overflow = \"hidden\";');
});

closes.forEach(fn => {
    const regex = new RegExp(fn + '\\\\(.*?\\\\)\\\\s*\\{');
    content = content.replace(regex, match => match + '\n    document.body.style.overflow = \"\";');
});

// For PDF Modal
content = content.replace(/document.getElementById\(\"pdfImportModal\"\)\?\.classList\.remove\(\"hidden\"\);/, match => match + '\n      document.body.style.overflow = \"hidden\";');
content = content.replace(/document.getElementById\(\"pdfImportModal\"\)\?\.classList\.add\(\"hidden\"\);/, match => match + '\n      document.body.style.overflow = \"\";');

fs.writeFileSync(path, content);
console.log('Done modifying app.js modals');
