const fs = require('fs');
const path = 'app.js';
let content = fs.readFileSync(path, 'utf8');

// 1. updateModalAddBtn
content = content.replace(
    /btn\.className = \"w-full py-2\.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 bg-emerald-600 text-white hover:bg-emerald-700 transition\";\s+btn\.innerHTML = <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"><\/path><\/svg> <span>Öðrenme Havuzunda Ekli \(Kaldýr\)<\/span>;/,
    'btn.className = "w-full py-2.5 px-2 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 bg-emerald-600 text-white hover:bg-emerald-700 transition whitespace-normal text-center leading-tight";\n      btn.innerHTML = <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Öðrenme Havuzunda Ekli (Kaldýr)</span>;'
);
content = content.replace(
    /btn\.className = \"w-full py-2\.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 bg-indigo-600 text-white hover:bg-indigo-700 transition\";\s+btn\.innerHTML = <span>?? Öðrenme Havuzuma Ekle<\/span>;/,
    'btn.className = "w-full py-2.5 px-2 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 bg-indigo-600 text-white hover:bg-indigo-700 transition whitespace-normal text-center leading-tight";\n      btn.innerHTML = <span>? Öðrenme Havuzuma Ekle</span>;'
);

// 2. masteredWords constructor
content = content.replace(
    /this\.learningPool = this\.loadLearningPool\(\);\s+this\.favorites = this\.loadFavorites\(\);/,
    'this.learningPool = this.loadLearningPool();\n    this.masteredWords = this.loadMasteredWords();\n    this.favorites = this.loadFavorites();'
);

// 3. loadMasteredWords & saveMasteredWords
content = content.replace(
    /saveLearningPool\(\) \{\s+localStorage\.setItem\(STORAGE_KEYS\.LEARNING_POOL, JSON\.stringify\(this\.learningPool\)\);\s+this\.updateLearningPoolBadge\(\);\s+\}/,
    'saveLearningPool() {\n    localStorage.setItem(STORAGE_KEYS.LEARNING_POOL, JSON.stringify(this.learningPool));\n    this.updateLearningPoolBadge();\n  }\n\n  loadMasteredWords() {\n    try {\n      return JSON.parse(localStorage.getItem(\'yds_mastered_words\')) || [];\n    } catch { return []; }\n  }\n\n  saveMasteredWords() {\n    localStorage.setItem(\'yds_mastered_words\', JSON.stringify(this.masteredWords));\n  }'
);

// 4. nextFlashcard(markAsMastered = false)
content = content.replace(
    /nextFlashcard\(markAsMastered = false\) \{\s+if \(markAsMastered && this\.learningPool\[this\.flashcardIndex\]\) \{\s+this\.learningPool\.splice\(this\.flashcardIndex, 1\);/,
    'nextFlashcard(markAsMastered = false) {\n    if (markAsMastered && this.learningPool[this.flashcardIndex]) {\n      const masteredWord = this.learningPool[this.flashcardIndex];\n      this.masteredWords.push({ word: masteredWord.word, date: new Date().toISOString() });\n      this.saveMasteredWords();\n      \n      this.learningPool.splice(this.flashcardIndex, 1);'
);

// 5. renderReportView statistics
content = content.replace(
    /if \(repWr\) repWr\.textContent = totalWrong;\s+if \(repRate\) repRate\.textContent = %\\$\\{accuracy\\};/,
    'if (repWr) repWr.textContent = totalWrong;\n    if (repRate) repRate.textContent = %;\n\n    // Öðrenilen Kelime Ýstatistikleri\n    const now = new Date();\n    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);\n    const wordsThisWeek = this.masteredWords.filter(entry => new Date(entry.date) >= oneWeekAgo).length;\n    \n    const repLearnedWeek = document.getElementById("repLearnedWeek");\n    const repLearnedTotal = document.getElementById("repLearnedTotal");\n    if (repLearnedWeek) repLearnedWeek.textContent = wordsThisWeek;\n    if (repLearnedTotal) repLearnedTotal.textContent = this.masteredWords.length;'
);

// 6. resetAllProgress
content = content.replace(
    /localStorage\.removeItem\(\"yds_tactics_unlocked\"\);\s+this\.practiceAnswers = \{\};/,
    'localStorage.removeItem("yds_tactics_unlocked");\n    localStorage.removeItem("yds_mastered_words");\n\n    this.practiceAnswers = {};'
);
content = content.replace(
    /this\.examSessions = \{\};\s+this\.tacticsUnlocked = false;/,
    'this.examSessions = {};\n    this.masteredWords = [];\n    this.tacticsUnlocked = false;'
);

// 7. speakWord TTS caching
content = content.replace(
    /\/\/ Kelimeyi telaffuz et \(Web Speech API\)\s+speakWord\(text\) \{\s+if \(!window\.speechSynthesis\) return;\s+window\.speechSynthesis\.cancel\(\);\s+const utterance = new SpeechSynthesisUtterance\(text\);\s+utterance\.lang = \"en-US\";\s+utterance\.rate = 0\.9;\s+window\.speechSynthesis\.speak\(utterance\);\s+\}/,
    '// Kelimeyi telaffuz et (Google TTS & Web Speech API Fallback)\n  speakWord(text) {\n    if (!text) return;\n    if (!this.audioCache) this.audioCache = {};\n    const lowerText = text.toLowerCase();\n    \n    if (this.audioCache[lowerText]) {\n      this.audioCache[lowerText].currentTime = 0;\n      this.audioCache[lowerText].play().catch(e => console.warn("Audio play error", e));\n      return;\n    }\n    \n    try {\n      const url = https://translate.googleapis.com/translate_tts?ie=UTF-8&q=&tl=en-US&client=gtx;\n      const audio = new Audio(url);\n      this.audioCache[lowerText] = audio;\n      audio.play().catch(e => {\n        console.warn("Audio play error", e);\n        if (window.speechSynthesis) {\n          window.speechSynthesis.cancel();\n          const utterance = new SpeechSynthesisUtterance(text);\n          utterance.lang = "en-US";\n          utterance.rate = 0.9;\n          window.speechSynthesis.speak(utterance);\n        }\n      });\n    } catch (e) {\n      console.error("TTS Error:", e);\n    }\n  }'
);

// 8. modals scroll lock
const opens = ['openWordModal', 'openLearningPoolModal', 'openFlashcardsModal', 'openYearExamModal', 'openNameModal', 'openSettingsModal', 'showExamScorecard'];
const closes = ['closeWordModal', 'closeLearningPoolModal', 'closeFlashcardsModal', 'closeYearExamModal', 'closeNameModal', 'closeSettingsModal', 'closeExamScorecard'];

opens.forEach(fn => {
    const regex = new RegExp(fn + '\\\\(.*?\\\\)\\\\s*\\{');
    content = content.replace(regex, match => match + '\\n    document.body.style.overflow = "hidden";');
});
closes.forEach(fn => {
    const regex = new RegExp(fn + '\\\\(.*?\\\\)\\\\s*\\{');
    content = content.replace(regex, match => match + '\\n    document.body.style.overflow = "";');
});
content = content.replace(/document.getElementById\(\"pdfImportModal\"\)\?\.classList\.remove\(\"hidden\"\);/, match => match + '\\n      document.body.style.overflow = "hidden";');
content = content.replace(/document.getElementById\(\"pdfImportModal\"\)\?\.classList\.add\(\"hidden\"\);/, match => match + '\\n      document.body.style.overflow = "";');

fs.writeFileSync(path, content);
console.log('App.js root updated.');
