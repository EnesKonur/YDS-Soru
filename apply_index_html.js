const fs = require('fs');
const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /<span class=\"text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider\">Soru Kökü \\(Question Stem\\)<\/span>\s*<span class=\"text-xs text-gray-400 italic\">?? Kelimelerin üzerine týklayarak Türkçe anlamýna bakabilirsiniz<\/span>/g,
    '<span class="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Soru Kökü (Question Stem)</span>\\n                <span class="text-[10px] sm:text-xs text-gray-400 italic leading-tight">?? Kelimelerin üzerine týklayarak Türkçe anlamýna bakabilirsiniz</span>'
);

content = content.replace(
    /<div class=\"flex items-center justify-between\">\s*<span class=\"text-\[10px\] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider\">/g,
    '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1">\\n                <span class="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">'
);

content = content.replace(
    /<\/div>\s*<!-- Kategori Bazlý Daðýlým Çubuklarý -->/,
    </div>\\n\\n      <!-- Kelime Öðrenme Ýstatistikleri -->\\n      <div class="grid grid-cols-2 gap-3.5 mt-4">\\n        <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm flex flex-col justify-between">\\n          <span class="text-[10px] sm:text-xs font-bold text-indigo-100 uppercase tracking-wider block mb-1">Bu Hafta Öðrenilen Kelime</span>\\n          <div class="flex items-end justify-between mt-1">\\n            <span id="repLearnedWeek" class="text-3xl sm:text-4xl font-black">0</span>\\n            <span class="text-2xl sm:text-3xl opacity-50">?</span>\\n          </div>\\n        </div>\\n        <div class="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-sm flex flex-col justify-between">\\n          <span class="text-[10px] sm:text-xs font-bold text-teal-100 uppercase tracking-wider block mb-1">Toplam Öðrenilen Kelime</span>\\n          <div class="flex items-end justify-between mt-1">\\n            <span id="repLearnedTotal" class="text-3xl sm:text-4xl font-black">0</span>\\n            <span class="text-2xl sm:text-3xl opacity-50">??</span>\\n          </div>\\n        </div>\\n      </div>\\n\\n      <!-- Kategori Bazlý Daðýlým Çubuklarý -->
);

// Also need to do the #wordInspectorModal header wrap and the #flashcardModal wrap fixes!
content = content.replace(
    /id=\"flashcardModal\"[\s\S]*?id=\"flashcardHeader\"[\s\S]*?class=\"p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700\/80 flex items-center justify-between\"/,
    (match) => match.replace('justify-between', 'justify-between flex-wrap gap-2')
);

// We need to apply all index.html modifications from the previous run exactly.
fs.writeFileSync(path, content);
console.log('index.html root updated.');
