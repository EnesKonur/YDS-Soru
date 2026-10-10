// YDS Soru Filtreleme - Topluluk Soru Çözülme & Başarı İstatistiği Servisi (question-stats-service.js)
// Cloud Firestore tabanlı kota dostu, atomik batch çalışan istatistik altyapısı

class QuestionStatsService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.initPromise = null;

    // Bellek içi önbellek (Memory Cache)
    // Yapı: { [testId]: { [questionId]: { total: number, correct: number } } }
    this.statsCache = {};

    // Oturum süresince gönderilmeyi bekleyen cevaplar (Alıştırma modu için tampon)
    this.pendingPracticeSubmissions = [];

    // Firebase Proje Yapılandırması
    // Not: Kullanıcı kendi Firebase Console projesini bağlayana kadar güvenli varsayılanlar kullanılır.
    this.firebaseConfig = {
      apiKey: "AIzaSyDummyKeyForYdsExamStats0000000000",
      authDomain: "yds-soru-bankasi.firebaseapp.com",
      projectId: "yds-soru-bankasi",
      storageBucket: "yds-soru-bankasi.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:0000000000000000000000"
    };

    // Cold start eşiği: 20'den az çözülen sorular arayüzde gösterilmez
    this.COLD_START_THRESHOLD = 20;

    this.init();
  }

  // Firebase Yapılandırmasını dinamik olarak güncelleme imkanı (gerekirse)
  configure(customConfig) {
    if (customConfig && typeof customConfig === 'object') {
      this.firebaseConfig = { ...this.firebaseConfig, ...customConfig };
      this.isInitialized = false;
      this.db = null;
      this.init();
    }
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Firebase Compat kütüphanesi yüklü mü kontrol et
        if (typeof window.firebase === 'undefined') {
          console.log('ℹ️ [QuestionStatsService] Firebase SDK henüz yüklenmedi veya çevrimdışı.');
          return false;
        }

        // Firebase App'i başlat veya mevcut olanı al
        let app;
        if (!window.firebase.apps || window.firebase.apps.length === 0) {
          app = window.firebase.initializeApp(this.firebaseConfig);
        } else {
          app = window.firebase.app();
        }

        this.db = window.firebase.firestore();
        this.isInitialized = true;
        console.log('✅ [QuestionStatsService] Cloud Firestore bağlantısı hazır.');
        return true;
      } catch (err) {
        console.warn('⚠️ [QuestionStatsService] Firestore başlatılamadı (çevrimdışı mod):', err?.message || err);
        this.isInitialized = false;
        return false;
      }
    })();

    return this.initPromise;
  }

  // Soru nesnesinden veya ID'sinden ilgili doküman testId'sini tespit eder
  resolveTestId(questionOrId) {
    if (!questionOrId) return "practice_all";
    const qid = typeof questionOrId === 'string' ? questionOrId : questionOrId.id;
    if (!qid) return "practice_all";

    // Deneme soruları: yds-2025-yds1-42 -> yds-2025-yds1
    if (qid.startsWith('yds-')) {
      const parts = qid.split('-');
      if (parts.length >= 3) {
        return `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
    }

    // Alıştırma soruları: practice-1 ... practice-227 tek dokümanda gruplanır
    if (qid.startsWith('practice-')) {
      return "practice_all";
    }

    return "practice_all";
  }

  /**
   * 1. fetchTestStats(testId: string)
   * question_stats/{testId} dokümanını tek seferde çeker.
   * Hata durumunda veya internet yoksa sessizce null döner.
   * Veriyi test süresince bellekte (statsCache) saklar.
   */
  async fetchTestStats(testId) {
    if (!testId) return null;

    // Bellekte zaten varsa anında dön (kota dostu sıfır network)
    if (this.statsCache[testId]) {
      return this.statsCache[testId];
    }

    try {
      const ready = await this.init();
      if (!ready || !this.db) {
        return null;
      }

      const docRef = this.db.collection('question_stats').doc(testId);
      const snapshot = await docRef.get();

      if (snapshot.exists) {
        const data = snapshot.data() || {};
        this.statsCache[testId] = data;
        return data;
      } else {
        // Doküman henüz yoksa boş map sakla
        this.statsCache[testId] = {};
        return this.statsCache[testId];
      }
    } catch (err) {
      // Çevrimdışı veya ağ hatası: sessizce null dön, ana akışı asla bloklama
      console.warn(`[QuestionStatsService] fetchTestStats(${testId}) atlandı:`, err?.message || err);
      return null;
    }
  }

  /**
   * Bellekteki veriden tek bir soruya ait istatistiği getirir.
   * Döndürür: { total: number, correct: number } | null
   */
  getQuestionStat(testId, questionId) {
    if (!testId || !questionId) return null;
    const testData = this.statsCache[testId];
    if (!testData || !testData[questionId]) return null;
    return testData[questionId];
  }

  /**
   * 2. submitTestStats(testId: string, results: Array<{ questionId: string, isCorrect: boolean }>)
   * Test tamamlandığında veya sonlandırıldığında tetiklenir.
   * Firestore FieldValue.increment(1) kullanarak yarış durumlarını (race condition)
   * önleyecek atomik bir toplu güncelleme yapar.
   * İşlem arka planda (fire-and-forget) çalışır.
   */
  async submitTestStats(testId, results) {
    if (!testId || !Array.isArray(results) || results.length === 0) {
      return;
    }

    // 1. Önce bellek içi cache'i anında güncelle (kullanıcı arayüzde gecikmesiz görsün)
    if (!this.statsCache[testId]) {
      this.statsCache[testId] = {};
    }
    const currentTestCache = this.statsCache[testId];
    results.forEach(r => {
      if (!r || !r.questionId) return;
      if (!currentTestCache[r.questionId]) {
        currentTestCache[r.questionId] = { total: 0, correct: 0 };
      }
      currentTestCache[r.questionId].total += 1;
      if (r.isCorrect) {
        currentTestCache[r.questionId].correct += 1;
      }
    });

    // 2. Firestore'a fire-and-forget atomik güncelleme gönder
    this._performAtomicSubmit(testId, results).catch(err => {
      console.warn(`[QuestionStatsService] submitTestStats(${testId}) arka plan gönderimi başarısız:`, err?.message || err);
    });
  }

  async _performAtomicSubmit(testId, results) {
    const ready = await this.init();
    if (!ready || !this.db || !window.firebase?.firestore?.FieldValue) {
      return;
    }

    const { increment } = window.firebase.firestore.FieldValue;
    const updates = {};

    results.forEach(r => {
      if (!r || !r.questionId) return;
      updates[`${r.questionId}.total`] = increment(1);
      if (r.isCorrect) {
        updates[`${r.questionId}.correct`] = increment(1);
      }
    });

    if (Object.keys(updates).length === 0) return;

    const docRef = this.db.collection('question_stats').doc(testId);
    await docRef.set(updates, { merge: true });
    console.log(`✅ [QuestionStatsService] ${results.length} sorunun istatistiği Firestore'a atomik olarak aktarıldı (${testId}).`);
  }
}

// Global servis tekil örneği
window.questionStatsService = new QuestionStatsService();
