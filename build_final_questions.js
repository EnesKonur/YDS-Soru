const fs = require('fs');
const glob = require('path');

const examFiles = [
  { file: 'parsed_2021_yds2.json', name: '2021 YDS/2 (Sonbahar)', year: 2021, term: 'Sonbahar' },
  { file: 'parsed_2021_yds1.json', name: '2021 YDS/1 (İlkbahar)', year: 2021, term: 'İlkbahar' },
  { file: 'parsed_2020_yds1.json', name: '2020 YDS/1', year: 2020, term: 'YDS1' },
  { file: 'parsed_2019_yds3.json', name: '2019 YDS/3', year: 2019, term: 'YDS3' },
  { file: 'parsed_2019_yds2.json', name: '2019 YDS/2 (Sonbahar)', year: 2019, term: 'Sonbahar' },
  { file: 'parsed_2019_yds1.json', name: '2019 YDS/1 (İlkbahar)', year: 2019, term: 'İlkbahar' },
  { file: 'parsed_2018_yds3.json', name: '2018 YDS/3', year: 2018, term: 'YDS3' },
  { file: 'parsed_2018_sonbahar.json', name: '2018 YDS Sonbahar', year: 2018, term: 'Sonbahar' },
  { file: 'parsed_2018_ilkbahar.json', name: '2018 YDS İlkbahar', year: 2018, term: 'İlkbahar' }
];

let allQuestions = [];

examFiles.forEach(ef => {
  if (fs.existsSync(ef.file)) {
    const raw = JSON.parse(fs.readFileSync(ef.file, 'utf8'));
    console.log(`Loaded ${raw.length} questions from ${ef.file}`);
    raw.forEach(q => {
      q.exam = ef.name;
      q.year = ef.year;
      q.term = ef.term;
    });
    allQuestions = allQuestions.concat(raw);
  } else {
    console.warn(`File not found: ${ef.file}`);
  }
});

console.log(`Total authentic questions to write: ${allQuestions.length}`);

const code = `// YDS Gerçek Sınav Formatında Kapsamlı Soru Bankası (2018 - 2021 Gerçek ÖSYM Çıkmış Sorular)
// Toplam ${allQuestions.length} Adet Tamamı Doğrulanmış Gerçek Sınav Sorusu

const INITIAL_YDS_QUESTIONS = ${JSON.stringify(allQuestions, null, 2)};

// LocalStorage anahtarları
const STORAGE_KEYS = {
  USER_ANSWERS: "yds_user_answers",
  LEARNING_POOL: "yds_learning_pool",
  FAVORITES: "yds_favorites",
  CUSTOM_QUESTIONS: "yds_custom_questions",
  NOTES: "yds_notes",
  EXAM_SESSIONS: "yds_exam_sessions"
};

// Veri Yönetim Sınıfı
class QuestionRepository {
  constructor() {
    this.customQuestions = this.loadCustomQuestions();
    this.questions = [...INITIAL_YDS_QUESTIONS, ...this.customQuestions];
  }

  loadCustomQuestions() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Özel sorular yüklenirken hata:", e);
    }
    return [];
  }

  saveCustomQuestions(list) {
    this.customQuestions = list;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(list));
    this.questions = [...INITIAL_YDS_QUESTIONS, ...this.customQuestions];
  }

  addQuestions(newQuestions) {
    const existingIds = new Set(this.questions.map(q => q.id));
    const toAdd = newQuestions.filter(q => !existingIds.has(q.id));
    const updatedCustom = [...this.customQuestions, ...toAdd];
    this.saveCustomQuestions(updatedCustom);
    return toAdd.length;
  }

  getAll() {
    return this.questions;
  }

  getByExam(examName) {
    return this.questions
      .filter(q => q.exam === examName || q.exam?.toLowerCase() === examName?.toLowerCase())
      .sort((a, b) => a.questionNumber - b.questionNumber);
  }

  getByYear(year) {
    const y = parseInt(year);
    return this.questions.filter(q => q.year === y).sort((a, b) => a.questionNumber - b.questionNumber);
  }

  getAvailableExams() {
    const examMap = new Map();
    this.questions.forEach(q => {
      if (!q.exam || q.year === "Alıştırma") return;
      if (!examMap.has(q.exam)) {
        examMap.set(q.exam, {
          id: q.exam.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: q.exam,
          year: q.year,
          term: q.term || '',
          count: 0
        });
      }
      examMap.get(q.exam).count++;
    });
    return Array.from(examMap.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return a.name.localeCompare(b.name);
    });
  }

  getAvailableYears() {
    const years = [...new Set(this.questions.map(q => q.year).filter(y => typeof y === 'number'))];
    return years.sort((a, b) => b - a);
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    this.customQuestions = [];
    this.questions = [...INITIAL_YDS_QUESTIONS];
    return this.questions;
  }
}

window.questionRepo = new QuestionRepository();
window.STORAGE_KEYS = STORAGE_KEYS;
window.INITIAL_YDS_QUESTIONS = INITIAL_YDS_QUESTIONS;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_YDS_QUESTIONS, QuestionRepository, STORAGE_KEYS };
}
`;

fs.writeFileSync('questions.js', code, 'utf8');
console.log('Successfully wrote clean questions.js with QuestionRepository and STORAGE_KEYS!');
