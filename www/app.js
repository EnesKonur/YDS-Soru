// YDS Soru Filtreleme ve Pratik Uygulaması - Ana Mantık (app.js)

class YDSApp {
  constructor() {
    this.allQuestions = [];
    this.filteredQuestions = [];
    this.currentIndex = 0;
    this.practiceAnswers = this.loadPracticeAnswers();
    this.examAnswers = this.loadExamAnswers();
    this.learningPool = this.loadLearningPool();
    this.masteredWords = this.loadMasteredWords();
    this.favorites = this.loadFavorites();
    this.notes = this.loadNotes();
    this.soundEnabled = true;
    this.activeKeyword = "";
    this.timerInterval = null;
    this.timerSeconds = 0;
    this.timerRunning = false;

    // Flashcard state
    this.flashcardIndex = 0;
    this.flashcardFlipped = false;

    // 80 Soruluk Yıl Denemesi Modu State
    this.isExamMode = false;
    this.currentExamYear = null;
    this.examTimerInterval = null;
    this.examTimerSeconds = 0;
    this.isExamTimerPaused = false;
    this.examSessions = this.loadExamSessions();

    // Kullanıcı Profili ve Görünüm Durumu
    this.userName = localStorage.getItem("yds_user_name") || "";
    this.soundEnabled = localStorage.getItem("yds_sound_enabled") !== "false";
    this.autoPauseEnabled = localStorage.getItem("yds_auto_pause") !== "false";
    this.tacticsUnlocked = localStorage.getItem("yds_tactics_unlocked") === "true";
    this.currentView = "home"; // 'home' | 'question' | 'report'
    this.isPracticeMode = false;
    this.pendingSessionStats = {};
    this.currentQuestionStats = null;

    // Yeni Etkileşim & Çalışma Özellikleri Durumu (Paket 1)
    this.eliminatedOptions = this.loadEliminatedOptions();
    this.fontSizeScale = parseInt(localStorage.getItem("yds_font_scale") || "0", 10);
    if (isNaN(this.fontSizeScale)) this.fontSizeScale = 0;
    this.streakData = this.loadStreakData();
    this.lastSession = this.loadLastSession();
    this._recommendedWeakCategory = null;
    this.vocabQuizState = {
      mode: "pool",
      questions: [],
      currentIndex: 0,
      correct: 0,
      wrong: 0,
      missed: [],
      answered: false
    };

    // Yeni Etkileşim & Çalışma Özellikleri Durumu (Paket 2)
    this.ydsScoreTarget = parseInt(localStorage.getItem("yds_score_target") || "70", 10) || 70;
    this.clueHighlightEnabled = localStorage.getItem("yds_clue_highlight") === "true";
    this.isSprintMode = false;
    this.sprintTimerInterval = null;
    this.sprintSecondsLeft = 300;
    this.sprintTotalSeconds = 300;
    this.sprintAnswers = {};
    this.sprintBackupAnswers = {};
    this.sprintRecords = this.loadSprintRecords();
    this.isMistakeMelterMode = false;
    this.mistakeMelterBackup = {};
    this.mistakeMelterOrigins = {};
    this.mistakeMelterSessionMelted = 0;
    this.meltedMistakesCount = parseInt(localStorage.getItem("yds_melted_mistakes_count") || "0", 10) || 0;
    this.grammarCampTab = "all";

    // Audio Context
    this.audioCtx = null;

    this.init();
  }

  // --- Sayfa Kaydırma Kilidi (Mobile & Modal Scroll Lock) ---
  lockScroll() {
    if (this._scrollLocked) return;
    this._scrollLocked = true;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  unlockScroll() {
    if (!this._scrollLocked) return;
    this._scrollLocked = false;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  get activeAnswers() {
    return this.isExamMode ? this.examAnswers : this.practiceAnswers;
  }

  get userAnswers() {
    return this.activeAnswers;
  }

  set userAnswers(val) {
    if (this.isExamMode) {
      this.examAnswers = val;
    } else {
      this.practiceAnswers = val;
    }
  }

  init() {
    this.allQuestions = window.PRACTICE_YDS_QUESTIONS || [];
    this.activePool = this.allQuestions;
    this.setupEventListeners();
    this.applyQuestionFontSize();
    this.updateClueHighlightButtonUI();
    this.applyFilters();
    this.updateStats();
    this.updateHomeStats();
    this.updateLearningPoolBadge();
    this.updateNotesCountBadge();
    this.populateFilterDropdowns();
    this.initDailyTip();
    this.showHomeView();

    // İlk açılış isim karşılama kontrolü
    if (!this.userName) {
      setTimeout(() => {
        this.openNameModal();
      }, 400);
    } else {
      const homeName = document.getElementById("homeUserNameText");
      if (homeName) homeName.textContent = this.userName;
      const settingsInput = document.getElementById("settingsNameInput");
      if (settingsInput) settingsInput.value = this.userName;
    }

    // Ayar anahtarlarını senkronize et
    const soundToggle = document.getElementById("settingsSoundToggle");
    if (soundToggle) soundToggle.checked = this.soundEnabled;
    const autoPauseToggle = document.getElementById("settingsAutoPauseToggle");
    if (autoPauseToggle) autoPauseToggle.checked = this.autoPauseEnabled;

    // Alt banner reklamının görünürlüğünü başlat
    window.ydsAdService?.showBanner();

    // Reklamsız mod arayüz durumunu senkronize et
    this.updateAdFreeUI();
    window.addEventListener('adFreeStatusChanged', () => {
      this.updateAdFreeUI();
    });

    // Uygulama arka plana geçtiğinde biriken soru istatistiklerini Firestore'a gönder
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.flushPendingStats();
      }
    });
    window.addEventListener("pagehide", () => {
      this.flushPendingStats();
    });
  }

  // --- LocalStorage Yönetimi (Deneme ve Alıştırma İzolasyonu) ---
  loadPracticeAnswers() {
    try {
      const p = localStorage.getItem("yds_practice_answers");
      if (p) return JSON.parse(p);
      const legacy = localStorage.getItem(STORAGE_KEYS?.USER_ANSWERS || "yds_user_answers");
      return legacy ? JSON.parse(legacy) : {};
    } catch { return {}; }
  }

  savePracticeAnswers() {
    try {
      localStorage.setItem("yds_practice_answers", JSON.stringify(this.practiceAnswers));
      localStorage.setItem(STORAGE_KEYS?.USER_ANSWERS || "yds_user_answers", JSON.stringify(this.practiceAnswers));
    } catch (e) { console.error("Pratik cevapları kaydetme hatası:", e); }
    this.updateStats();
  }

  loadExamAnswers() {
    try {
      const e = localStorage.getItem("yds_exam_answers");
      return e ? JSON.parse(e) : {};
    } catch { return {}; }
  }

  saveExamAnswers() {
    try {
      localStorage.setItem("yds_exam_answers", JSON.stringify(this.examAnswers));
    } catch (e) { console.error("Sınav cevapları kaydetme hatası:", e); }
    this.updateStats();
  }

  loadUserAnswers() {
    return this.loadPracticeAnswers();
  }

  saveUserAnswers() {
    if (this.isExamMode) {
      this.saveExamAnswers();
    } else {
      this.savePracticeAnswers();
    }
  }

  loadExamSessions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAM_SESSIONS)) || {};
    } catch { return {}; }
  }

  saveExamSessions() {
    localStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, JSON.stringify(this.examSessions));
  }

  loadLearningPool() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNING_POOL)) || [];
    } catch { return []; }
  }

  saveLearningPool() {
    localStorage.setItem(STORAGE_KEYS.LEARNING_POOL, JSON.stringify(this.learningPool));
    this.updateLearningPoolBadge();
  }

  loadMasteredWords() {
    try {
      return JSON.parse(localStorage.getItem('yds_mastered_words')) || [];
    } catch { return []; }
  }

  saveMasteredWords() {
    localStorage.setItem('yds_mastered_words', JSON.stringify(this.masteredWords));
  }

  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    } catch { return []; }
  }

  saveFavorites() {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
  }

  loadNotes() {
    try {
      const saved = localStorage.getItem("yds_question_notes") || localStorage.getItem(STORAGE_KEYS?.NOTES || "yds_notes");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  }

  saveNotes() {
    try {
      const data = JSON.stringify(this.notes);
      localStorage.setItem("yds_question_notes", data);
      localStorage.setItem(STORAGE_KEYS?.NOTES || "yds_notes", data);
      this.updateNotesCountBadge();
    } catch (e) {
      console.error("Not kaydetme hatası:", e);
    }
  }

  getQuestionNote(questionId) {
    if (!questionId || !this.notes) return null;
    const item = this.notes[questionId];
    if (!item) return null;
    if (typeof item === 'string') {
      return { note: item, updatedAt: null };
    }
    return item;
  }

  saveCurrentQuestionNote() {
    try {
      const q = this.filteredQuestions[this.currentIndex];
      if (!q) return;

      const textarea = document.getElementById("questionNoteTextarea");
      if (!textarea) return;

      const noteText = textarea.value.trim();
      if (noteText.length === 0) {
        this.deleteCurrentQuestionNote();
        return;
      }

      // Sanal klavyeyi derhal kapatarak ekran kaymasını/takılmasını engelle
      textarea.blur();
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }

      this.notes[q.id] = {
        note: noteText,
        updatedAt: new Date().toISOString(),
        exam: `${q.exam || "YDS"} ${q.year || ""}`.trim(),
        questionNumber: q.questionNumber || (this.currentIndex + 1)
      };
      this.saveNotes();

      const statusEl = document.getElementById("questionNoteSaveStatus");
      if (statusEl) {
        statusEl.classList.remove("hidden");
        setTimeout(() => statusEl.classList.add("hidden"), 1000);
      }

      this.updateQuestionNoteUI(q);
      
      // Bekletmeden akıcı şekilde kapat
      setTimeout(() => {
        this.closeQuestionNoteDrawer();
      }, 100);
    } catch (e) {
      console.error("Not kaydetme hatası:", e);
      this.closeQuestionNoteDrawer();
    }
  }

  deleteCurrentQuestionNote() {
    try {
      const q = this.filteredQuestions[this.currentIndex];
      if (!q) return;

      if (this.notes[q.id]) {
        delete this.notes[q.id];
        this.saveNotes();
      }

      const textarea = document.getElementById("questionNoteTextarea");
      if (textarea) textarea.value = "";
      this.updateQuestionNoteCharCount();

      this.updateQuestionNoteUI(q);
      this.closeQuestionNoteDrawer();
    } catch (e) {
      console.error("Not silinirken hata:", e);
      this.closeQuestionNoteDrawer();
    }
  }

  openQuestionNoteDrawer() {
    try {
      const q = this.filteredQuestions[this.currentIndex];
      if (!q) return;

      const drawer = document.getElementById("questionNoteDrawer");
      const titleEl = document.getElementById("questionNoteTitle");
      const subtitleEl = document.getElementById("questionNoteSubtitle");
      const textarea = document.getElementById("questionNoteTextarea");
      const deleteBtn = document.getElementById("deleteQuestionNoteBtn");
      const statusEl = document.getElementById("questionNoteSaveStatus");

      if (statusEl) statusEl.classList.add("hidden");

      if (titleEl) {
        titleEl.textContent = `Soru ${this.currentIndex + 1} Notu`;
      }
      if (subtitleEl) {
        subtitleEl.textContent = `${q.exam || "YDS"} ${q.year || ""} (Soru No: ${q.questionNumber || this.currentIndex + 1})`;
      }

      const existingNote = this.getQuestionNote(q.id);
      if (textarea) {
        textarea.value = existingNote ? (existingNote.note || existingNote.text || "") : "";
      }
      this.updateQuestionNoteCharCount();

      if (deleteBtn) {
        if (existingNote && (existingNote.note || existingNote.text)) {
          deleteBtn.classList.remove("hidden");
        } else {
          deleteBtn.classList.add("hidden");
        }
      }

      if (drawer) {
        this.lockScroll();
        window.ydsAdService?.hideBanner();
        drawer.classList.remove("hidden");
        drawer.classList.add("active");
        requestAnimationFrame(() => {
          drawer.classList.add("open");
        });
      }

      setTimeout(() => {
        if (textarea) textarea.focus();
      }, 150);
    } catch (e) {
      console.error("Not çekmecesi açılırken hata:", e);
      this.unlockScroll();
    }
  }

  closeQuestionNoteDrawer() {
    try {
      // Klavyeyi ve odaklanmayı hemen serbest bırak
      const textarea = document.getElementById("questionNoteTextarea");
      if (textarea) textarea.blur();
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }

      // Sayfa kaydırma kilidini hemen açarak takılmayı tamamen yok et
      this.unlockScroll();
      window.ydsAdService?.showBanner();

      const drawer = document.getElementById("questionNoteDrawer");
      if (!drawer) return;

      drawer.classList.remove("open");
      setTimeout(() => {
        drawer.classList.remove("active");
      }, 220);
    } catch (e) {
      console.error("Not çekmecesi kapatılırken hata:", e);
      this.unlockScroll();
    }
  }

  updateQuestionNoteCharCount() {
    const textarea = document.getElementById("questionNoteTextarea");
    const countEl = document.getElementById("questionNoteCharCount");
    if (textarea && countEl) {
      countEl.textContent = `${textarea.value.length} karakter`;
    }
  }

  updateQuestionNoteUI(q) {
    if (!q) return;
    const noteData = this.getQuestionNote(q.id);
    const hasNote = !!(noteData && noteData.note && noteData.note.trim().length > 0);

    const noteBtn = document.getElementById("questionNoteBtn");
    const btnText = document.getElementById("questionNoteBtnText");
    const indicator = document.getElementById("questionNoteIndicator");

    if (noteBtn) {
      if (hasNote) {
        noteBtn.className = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 border border-amber-600 shadow-md shadow-amber-500/25 transition transform active:scale-95";
        noteBtn.title = "Kayıtlı notunuz var (Düzenlemek için tıklayın)";
        if (btnText) btnText.textContent = "Notum Var";
      } else {
        noteBtn.className = "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-700 shadow-2xs transition transform active:scale-95";
        noteBtn.title = "Bu soruya özel not al";
        if (btnText) btnText.textContent = "Not Al";
      }
    }

    if (indicator) {
      if (hasNote) {
        indicator.className = "w-2 h-2 rounded-full bg-white ring-2 ring-amber-300 animate-pulse";
        indicator.classList.remove("hidden");
      } else {
        indicator.classList.add("hidden");
      }
    }

    // Soru Gövdesindeki Doğrudan Not Kutucuğu
    const inlineCard = document.getElementById("questionInlineNoteCard");
    const inlineText = document.getElementById("questionInlineNoteText");
    if (inlineCard && inlineText) {
      if (hasNote) {
        inlineCard.classList.remove("hidden");
        inlineText.textContent = noteData.note;
      } else {
        inlineCard.classList.add("hidden");
        inlineText.textContent = "";
      }
    }

    // Explanation section reminder card
    const explCard = document.getElementById("explanationNoteCard");
    const explText = document.getElementById("explanationNoteText");
    if (explCard && explText) {
      if (hasNote) {
        explCard.classList.remove("hidden");
        explText.textContent = noteData.note;
      } else {
        explCard.classList.add("hidden");
        explText.textContent = "";
      }
    }
  }

  // --- Topluluk Soru Çözülme & Başarı İstatistiği (Question Stats) ---
  updateQuestionStatsBadge(q) {
    const badge = document.getElementById("qStatsBadge");
    const badgeText = document.getElementById("qStatsBadgeText");
    if (!badge || !badgeText) return;

    if (!q || !q.id || !window.questionStatsService) {
      badge.classList.add("hidden");
      this.currentQuestionStats = null;
      return;
    }

    const testId = window.questionStatsService.resolveTestId(q);
    const stat = window.questionStatsService.getQuestionStat(testId, q.id);
    const threshold = window.questionStatsService.COLD_START_THRESHOLD || 20;

    // Soğuk Başlangıç Kuralı (Cold Start Threshold):
    // Eğer total çözülme sayısı 20'den az ise rozeti KESİNLİKLE render etme / gizle
    if (!stat || typeof stat.total !== "number" || stat.total < threshold) {
      badge.classList.add("hidden");
      this.currentQuestionStats = null;

      // İlgili test dokümanı henüz cache'e alınmadıysa arka planda tek seferlik getir
      if (!window.questionStatsService.statsCache[testId]) {
        window.questionStatsService.fetchTestStats(testId).then(data => {
          if (!data) return;
          const currentQ = this.filteredQuestions[this.currentIndex];
          if (currentQ && currentQ.id === q.id) {
            this.updateQuestionStatsBadge(currentQ);
          }
        }).catch(() => {});
      }
      return;
    }

    // Eşik sağlandı (total >= 20): Rozet gösterilir
    this.currentQuestionStats = {
      questionId: q.id,
      testId: testId,
      total: stat.total,
      correct: typeof stat.correct === "number" ? stat.correct : 0
    };

    badgeText.textContent = `${stat.total} çözdü`;
    badge.classList.remove("hidden");
  }

  showQuestionStatsTooltip(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.currentQuestionStats || typeof this.currentQuestionStats.total !== "number") {
      return;
    }

    const { total, correct = 0 } = this.currentQuestionStats;
    const threshold = window.questionStatsService?.COLD_START_THRESHOLD || 20;
    if (total < threshold) return;

    const successRate = Math.round((correct / total) * 100);
    const modal = document.getElementById("qStatsModal");
    const modalBody = document.getElementById("qStatsModalBody");

    if (modalBody) {
      modalBody.innerHTML = `
        <div class="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-center space-y-1">
          <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">%${successRate}</div>
          <div class="text-xs font-bold text-gray-700 dark:text-gray-300">Doğru Yanıtlama Oranı</div>
        </div>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-center px-1">
          Bu soruyu çözen adayların <strong>%${successRate}</strong>'i doğru yanıtladı.
        </p>
        <div class="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/60 px-1">
          <span>Toplam Çözülme: <strong class="text-gray-700 dark:text-gray-200">${total}</strong></span>
          <span>Doğru Yanıt: <strong class="text-emerald-600 dark:text-emerald-400">${correct}</strong></span>
        </div>
      `;
    }

    if (modal) {
      this.lockScroll();
      modal.classList.remove("hidden");
    }
  }

  closeQuestionStatsTooltip(event) {
    if (event && event.target && event.target.closest && event.target.closest(".transform")) {
      return;
    }
    this.unlockScroll();
    const modal = document.getElementById("qStatsModal");
    if (modal) modal.classList.add("hidden");
  }

  updateDailyQuestionStatsBadge(q) {
    const badge = document.getElementById("dailyQStatsBadge");
    const badgeText = document.getElementById("dailyQStatsBadgeText");
    if (!badge || !badgeText) return;

    if (!q || !q.id || !window.questionStatsService) {
      badge.classList.add("hidden");
      this.currentDailyQuestionStats = null;
      return;
    }

    const testId = window.questionStatsService.resolveTestId(q);
    const stat = window.questionStatsService.getQuestionStat(testId, q.id);
    const threshold = window.questionStatsService.COLD_START_THRESHOLD || 20;

    // Soğuk Başlangıç Kuralı (Cold Start Threshold):
    if (!stat || typeof stat.total !== "number" || stat.total < threshold) {
      badge.classList.add("hidden");
      this.currentDailyQuestionStats = null;

      if (!window.questionStatsService.statsCache[testId]) {
        window.questionStatsService.fetchTestStats(testId).then(data => {
          if (!data) return;
          if (this._dailyQuestion && this._dailyQuestion.id === q.id) {
            this.updateDailyQuestionStatsBadge(this._dailyQuestion);
          }
        }).catch(() => {});
      }
      return;
    }

    this.currentDailyQuestionStats = {
      questionId: q.id,
      testId: testId,
      total: stat.total,
      correct: typeof stat.correct === "number" ? stat.correct : 0
    };

    badgeText.textContent = `${stat.total} çözdü`;
    badge.classList.remove("hidden");
  }

  showDailyQuestionStatsTooltip(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.currentDailyQuestionStats) return;
    this.currentQuestionStats = this.currentDailyQuestionStats;
    this.showQuestionStatsTooltip(event);
  }

  queueStatSubmission(question, isCorrect) {
    if (!question || !question.id) return;
    const testId = window.questionStatsService?.resolveTestId(question) || "practice_all";
    if (!this.pendingSessionStats) this.pendingSessionStats = {};
    if (!this.pendingSessionStats[testId]) this.pendingSessionStats[testId] = [];

    const list = this.pendingSessionStats[testId];
    const existing = list.find(item => item.questionId === question.id);
    if (existing) {
      existing.isCorrect = isCorrect;
    } else {
      list.push({ questionId: question.id, isCorrect });
    }
  }

  flushPendingStats() {
    if (!this.pendingSessionStats || !window.questionStatsService) return;
    const testIds = Object.keys(this.pendingSessionStats);
    testIds.forEach(testId => {
      const results = this.pendingSessionStats[testId];
      if (results && results.length > 0) {
        window.questionStatsService.submitTestStats(testId, results);
      }
    });
    this.pendingSessionStats = {};
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  findQuestionById(id) {
    if (id === null || id === undefined) return null;
    const strId = String(id);
    
    // 1. window.questionRepo (getQuestionById)
    if (window.questionRepo && typeof window.questionRepo.getQuestionById === 'function') {
      try {
        const q = window.questionRepo.getQuestionById(strId);
        if (q) return q;
      } catch (_) {}
    }

    // 2. this.filteredQuestions
    if (Array.isArray(this.filteredQuestions)) {
      const q = this.filteredQuestions.find(x => String(x?.id) === strId);
      if (q) return q;
    }

    // 3. this.allQuestions
    if (Array.isArray(this.allQuestions)) {
      const q = this.allQuestions.find(x => String(x?.id) === strId);
      if (q) return q;
    }

    // 4. Custom Exams
    if (typeof CUSTOM_EXAM_QUESTIONS !== 'undefined' && Array.isArray(CUSTOM_EXAM_QUESTIONS)) {
      const q = CUSTOM_EXAM_QUESTIONS.find(x => String(x?.id) === strId);
      if (q) return q;
    }

    // 5. Practice Questions
    if (typeof PRACTICE_YDS_QUESTIONS !== 'undefined' && Array.isArray(PRACTICE_YDS_QUESTIONS)) {
      const q = PRACTICE_YDS_QUESTIONS.find(x => String(x?.id) === strId);
      if (q) return q;
    }

    return null;
  }

  // --- Tüm Soru Notlarım (Notlarım Sekmesi & Modalı) ---
  updateNotesCountBadge() {
    try {
      const noteKeys = Object.keys(this.notes || {}).filter(k => {
        const item = this.notes[k];
        return item && ((item.note && item.note.trim().length > 0) || (typeof item === 'string' && item.trim().length > 0));
      });
      const count = noteKeys.length;

      const topBadge = document.getElementById("notesCountBadge");
      if (topBadge) topBadge.textContent = count;

      const allNotesBadge = document.getElementById("allNotesCountBadge");
      if (allNotesBadge) allNotesBadge.textContent = count;

      const homeBadge = document.getElementById("homeNotesBadge");
      if (homeBadge) homeBadge.textContent = count;
    } catch (_) {}
  }

  openAllNotesModal() {
    try {
      const modal = document.getElementById("allNotesModal");
      if (!modal) return;
      this.lockScroll();
      const searchInput = document.getElementById("allNotesSearchInput");
      if (searchInput) searchInput.value = "";
      this.renderAllNotesList();
      modal.classList.remove("hidden");
    } catch (e) {
      console.error("Notlar modalı açılırken hata:", e);
      this.unlockScroll();
    }
  }

  closeAllNotesModal() {
    try {
      this.unlockScroll();
      document.getElementById("allNotesModal")?.classList.add("hidden");
    } catch (e) {
      console.error("Notlar modalı kapatılırken hata:", e);
      this.unlockScroll();
    }
  }

  renderAllNotesList() {
    try {
      const container = document.getElementById("allNotesListContainer");
      if (!container) return;

      const searchInput = document.getElementById("allNotesSearchInput");
      const searchFilter = (searchInput?.value || "").trim().toLowerCase();

      const noteEntries = Object.entries(this.notes || {}).filter(([qId, item]) => {
        if (!item) return false;
        const text = typeof item === 'string' ? item : (item.note || item.text || '');
        return text.trim().length > 0;
      });

      this.updateNotesCountBadge();

      if (noteEntries.length === 0) {
        container.innerHTML = `
          <div class="py-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
            <div class="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center shadow-xs">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </div>
            <h4 class="text-base font-bold text-gray-800 dark:text-gray-200">Henüz Kayıtlı Notunuz Yok</h4>
            <p class="text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Soruları çözerken soru başlığındaki <strong>"Not Al"</strong> butonuna tıklayarak soruya özel ipuçlarınızı ve kelime notlarınızı buraya kaydedebilirsiniz.
            </p>
          </div>
        `;
        return;
      }

      // Arama filtresi uygula
      const filteredEntries = noteEntries.filter(([qId, item]) => {
        if (!searchFilter) return true;
        const noteText = (typeof item === 'string' ? item : (item.note || item.text || '')).toLowerCase();
        
        const qObj = this.findQuestionById(qId);
        const qText = (qObj?.questionText || '').toLowerCase();
        const examName = (item?.exam || qObj?.exam || '').toLowerCase();

        return noteText.includes(searchFilter) || qText.includes(searchFilter) || examName.includes(searchFilter);
      });

      if (filteredEntries.length === 0) {
        container.innerHTML = `
          <div class="py-8 text-center text-gray-500 dark:text-gray-400">
            <p class="text-sm">"<strong>${this.escapeHtml(searchFilter)}</strong>" aramasına uygun kayıtlı bir not bulunamadı.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = "";

      filteredEntries.forEach(([qId, item]) => {
        const rawNoteText = typeof item === 'string' ? item : (item.note || item.text || '');
        const noteText = this.escapeHtml(rawNoteText);
        const examName = this.escapeHtml(item?.exam || "YDS Sorusu");
        const qNum = item?.questionNumber ? `Soru ${this.escapeHtml(item.questionNumber)}` : "Soru";
        
        let dateStr = "";
        if (item?.updatedAt) {
          try {
            const d = new Date(item.updatedAt);
            dateStr = d.toLocaleDateString("tr-TR", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
          } catch (_) {}
        }

        const qObj = this.findQuestionById(qId);
        const qStemPreview = qObj?.questionText ? this.escapeHtml(qObj.questionText.slice(0, 110) + (qObj.questionText.length > 110 ? "..." : "")) : "";

        const card = document.createElement("div");
        card.className = "p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all shadow-2xs space-y-3 cursor-pointer";
        
        card.innerHTML = `
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center space-x-2 min-w-0">
              <span class="px-2.5 py-0.5 rounded-lg text-[11px] font-black bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 truncate max-w-[200px] sm:max-w-none">
                ${examName}
              </span>
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">${qNum}</span>
            </div>
            ${dateStr ? `<span class="text-[11px] text-gray-400 font-medium whitespace-nowrap">${dateStr}</span>` : ""}
          </div>

          <div class="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/40 text-amber-950 dark:text-amber-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
            ${noteText}
          </div>

          ${qStemPreview ? `
            <div class="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2 pl-2 border-l-2 border-amber-400/80 dark:border-amber-600">
              "${qStemPreview}"
            </div>
          ` : ""}

          <div class="flex items-center justify-between pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
            <button type="button" class="delete-note-btn text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Sil</span>
            </button>

            <button type="button" class="goto-question-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xs transition transform active:scale-95">
              <span>Soruya Git</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </div>
        `;

        card.addEventListener("click", (e) => {
          if (e.target.closest('.delete-note-btn')) return;
          this.goToQuestionById(qId);
        });

        card.querySelector(".delete-note-btn")?.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm("Bu soruya aldığınız notu silmek istediğinize emin misiniz?")) {
            delete this.notes[qId];
            this.saveNotes();
            this.renderAllNotesList();
            const currentQ = this.filteredQuestions[this.currentIndex];
            if (currentQ && String(currentQ.id) === String(qId)) {
              this.updateQuestionNoteUI(currentQ);
            }
          }
        });

        container.appendChild(card);
      });
    } catch (e) {
      console.error("Not listesi renderlanırken hata:", e);
    }
  }

  goToQuestionById(questionId) {
    if (!questionId) return;

    this.closeAllNotesModal();
    this.closeQuestionNoteDrawer();

    const targetQ = this.findQuestionById(questionId);

    if (!targetQ) {
      alert("Soru bulunamadı.");
      return;
    }

    // Eğer soru gerçek bir YDS denemesine aitse
    if (targetQ.exam && !targetQ.exam.includes("Alıştırma") && window.questionRepo) {
      this.startExamMode(targetQ.exam);
      const idx = this.filteredQuestions.findIndex(q => String(q.id) === String(targetQ.id));
      if (idx >= 0) {
        this.currentIndex = idx;
        this.onQuestionChanged();
        this.renderQuestion();
      }
    } else {
      // Alıştırma modunda göster
      this.showQuestionView('practice');
      const scopeFilter = document.getElementById("searchScopeFilter");
      if (scopeFilter) scopeFilter.value = "all";
      const statusFilter = document.getElementById("statusFilter");
      if (statusFilter) statusFilter.value = "all";
      const catFilter = document.getElementById("categoryFilter");
      if (catFilter) catFilter.value = "all";
      const kwInput = document.getElementById("keywordInput");
      if (kwInput) kwInput.value = "";
      
      this.applyFilters();
      const idx = this.filteredQuestions.findIndex(q => String(q.id) === String(targetQ.id));
      if (idx >= 0) {
        this.currentIndex = idx;
        this.renderQuestion();
      } else {
        this.filteredQuestions = [targetQ];
        this.currentIndex = 0;
        this.renderQuestion();
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Ses Efektleri (Web Audio API) ---
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playCorrectSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.24); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) { console.warn("Audio error:", e); }
  }

  playWrongSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) { console.warn("Audio error:", e); }
  }

  // --- Filtreleme Motoru ---
  applyFilters() {
    const kwInput = document.getElementById("keywordInput");
    const isFocused = (document.activeElement === kwInput);
    const selStart = (isFocused && kwInput) ? kwInput.selectionStart : null;
    const selEnd = (isFocused && kwInput) ? kwInput.selectionEnd : null;

    const keyword = (kwInput?.value || "").trim().toLowerCase();
    const category = document.getElementById("categoryFilter")?.value || "all";
    const year = document.getElementById("yearFilter")?.value || "all";
    const status = document.getElementById("statusFilter")?.value || "all";
    const searchScope = document.getElementById("searchScopeFilter")?.value || "practice";

    const hasFilter = keyword !== "" || category !== "all" || year !== "all" || status !== "all" || (this.isPracticeMode && searchScope !== "practice");
    
    if (this._lastHasFilter === undefined) this._lastHasFilter = false;
    if (!this._lastHasFilter && hasFilter) {
      this.savedUnfilteredIndex = this.currentIndex;
    }

    this.activeKeyword = keyword;

    let poolToSearch = this.activePool || this.allQuestions;

    if (this.isPracticeMode) {
      if (searchScope === "exams") {
        poolToSearch = window.questionRepo ? window.questionRepo.getAllExamQuestions() : [];
      } else if (searchScope === "all") {
        poolToSearch = window.questionRepo ? window.questionRepo.getAllUserFacingQuestions() : [];
      } else {
        poolToSearch = window.questionRepo ? window.questionRepo.getAlistirmaQuestions() : [];
      }
    } else {
      poolToSearch = this.activePool || [];
    }

    this.filteredQuestions = poolToSearch.filter(q => {
      // 1. Kelime Filtresi (Örn: "apple", "conduct", "although")
      if (keyword) {
        const keywordRegex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\b', 'i');
        const qText = q.questionText || q.text || "";
        const inQuestion = keywordRegex.test(qText);
        const inPassage = keywordRegex.test(q.passage || "");
        const inOptions = Object.values(q.options || {}).some(opt => keywordRegex.test(String(opt)));
        const inTags = (q.tags || []).some(t => keywordRegex.test(String(t)));
        const inAnalysis = q.wordAnalysis && Object.keys(q.wordAnalysis).some(w => keywordRegex.test(w));

        if (!inQuestion && !inPassage && !inOptions && !inTags && !inAnalysis) {
          return false;
        }
      }

      // 2. Kategori Filtresi
      if (category !== "all" && q.category !== category) {
        return false;
      }

      // 3. Yıl Filtresi
      if (year !== "all" && String(q.year) !== String(year)) {
        return false;
      }

      // 4. Çözüm Durumu Filtresi
      const ans = this.userAnswers[q.id];
      const isFav = this.favorites.includes(q.id);
      const noteItem = this.notes ? this.notes[q.id] : null;
      const hasNote = !!(noteItem && ((noteItem.note && noteItem.note.trim().length > 0) || (typeof noteItem === 'string' && noteItem.trim().length > 0)));

      if (status === "unsolved" && ans) return false;
      if (status === "correct" && (!ans || !ans.isCorrect)) return false;
      if (status === "wrong" && (!ans || ans.isCorrect)) return false;
      if (status === "favorites" && !isFav) return false;
      if (status === "notes" && !hasNote) return false;

      return true;
    });

    if (this._lastHasFilter && !hasFilter) {
      this.currentIndex = this.savedUnfilteredIndex || 0;
    } else if (hasFilter) {
      this.currentIndex = 0;
    }

    if (this.currentIndex >= this.filteredQuestions.length) {
       this.currentIndex = Math.max(0, this.filteredQuestions.length - 1);
    }

    this._lastHasFilter = hasFilter;

    this.renderQuestion();
    this.updateFilterStatusBadge();
    this.renderQuestionGrid();

    // İmleç konumunu koru (Android sanal klavyede başa atlama ve kelimeyi ters çevirme sorununu önler)
    if (isFocused && kwInput && document.activeElement === kwInput && selStart !== null) {
      try {
        kwInput.setSelectionRange(selStart, selEnd);
      } catch (_) {}
    }
  }

  updateFilterStatusBadge() {
    const badge = document.getElementById("filterInfoBanner");
    const countSpan = document.getElementById("filteredCount");
    const keywordSpan = document.getElementById("filterKeywordName");
    const clearBtn = document.getElementById("clearFilterBtn");

    if (!badge || !countSpan) return;

    countSpan.textContent = this.filteredQuestions.length;

    // Sınav modunda filtre rozeti gösterilmez
    if (this.isExamMode) {
      badge.classList.add("hidden");
      if (clearBtn) clearBtn.classList.add("hidden");
      return;
    }

    const catVal = document.getElementById("categoryFilter")?.value || "all";
    const stVal = document.getElementById("statusFilter")?.value || "all";
    const scVal = document.getElementById("searchScopeFilter")?.value || "practice";

    if (this.activeKeyword) {
      badge.classList.remove("hidden");
      if (this.isPracticeMode) {
        if (scVal === "exams") {
          if (keywordSpan) {
            keywordSpan.textContent = `Deneme Soruları: "${this.activeKeyword}" (${this.filteredQuestions.length} soru)`;
          }
        } else if (scVal === "all") {
          if (keywordSpan) {
            keywordSpan.textContent = `Tüm Sorular: "${this.activeKeyword}" (${this.filteredQuestions.length} soru)`;
          }
        } else {
          if (keywordSpan) {
            keywordSpan.textContent = `"${this.activeKeyword}" (${this.filteredQuestions.length} soru)`;
          }
        }
      } else {
        if (keywordSpan) {
          keywordSpan.textContent = `"${this.activeKeyword}"`;
        }
      }
      if (clearBtn) clearBtn.classList.remove("hidden");
    } else if (
      catVal !== "all" ||
      stVal !== "all" ||
      (this.isPracticeMode && scVal !== "practice")
    ) {
      badge.classList.remove("hidden");
      if (keywordSpan) {
        let label = "Seçili Kriterler";
        if (catVal !== "all" && stVal === "all" && scVal === "practice") {
          label = catVal;
        } else if (stVal !== "all" && catVal === "all" && scVal === "practice") {
          const stNames = { unsolved: "Çözülmemişler", wrong: "Yanlış Yapılanlar", correct: "Doğru Yapılanlar", favorites: "Yıldızlılar" };
          label = stNames[stVal] || stVal;
        } else if (scVal === "exams" && catVal === "all" && stVal === "all") {
          label = "Deneme Sınavı Soruları";
        } else if (scVal === "all" && catVal === "all" && stVal === "all") {
          label = "Tüm Sorular (Alıştırma + Deneme)";
        }
        keywordSpan.textContent = label;
      }
      if (clearBtn) clearBtn.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
      if (clearBtn) clearBtn.classList.add("hidden");
    }
  }

  clearAllFilters() {
    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");
    const catSelect = document.getElementById("categoryFilter");
    const yrSelect = document.getElementById("yearFilter");
    const stSelect = document.getElementById("statusFilter");
    const scSelect = document.getElementById("searchScopeFilter");

    if (kwInput) kwInput.value = "";
    if (clearBtn) clearBtn.classList.add("hidden");
    if (catSelect) catSelect.value = "all";
    if (yrSelect) yrSelect.value = "all";
    if (stSelect) stSelect.value = "all";
    if (scSelect) scSelect.value = "practice";

    this.applyFilters();
  }

  // --- Soru Renderlama & İnteraktif Kelime Ayrıştırma ---
  renderQuestion() {
    this.expandHeaderBars?.();
    const container = document.getElementById("questionContainer");
    const emptyState = document.getElementById("emptyStateContainer");

    if (this.filteredQuestions.length === 0) {
      if (container) container.classList.add("hidden");
      if (emptyState) emptyState.classList.remove("hidden");
      this.updateNavigationControls();
      return;
    }

    if (container) container.classList.remove("hidden");
    if (emptyState) emptyState.classList.add("hidden");

    const q = this.filteredQuestions[this.currentIndex];
    if (!q) return;

    // Soru Başlığı Bilgileri
    const examBadge = document.getElementById("qExamBadge");
    const categoryBadge = document.getElementById("qCategoryBadge");
    const subCategoryBadge = document.getElementById("qSubCategoryBadge");
    const difficultyBadge = document.getElementById("qDifficultyBadge");
    const qNumberDisplay = document.getElementById("qNumberDisplay");
    const favoriteBtn = document.getElementById("favoriteBtn");

    if (examBadge) examBadge.textContent = `${q.exam || "YDS"} - ${q.year || ""}`;
    if (categoryBadge) categoryBadge.textContent = q.category || "Genel";
    if (subCategoryBadge) subCategoryBadge.textContent = q.subCategory || "";
    if (difficultyBadge) difficultyBadge.textContent = q.difficulty || "Orta";
    if (qNumberDisplay) qNumberDisplay.textContent = `Soru ${this.currentIndex + 1} / ${this.filteredQuestions.length}`;
    const qYdsDisplay = document.getElementById("qYdsNumberDisplay");
    if (qYdsDisplay) qYdsDisplay.textContent = `(YDS No: ${q.questionNumber || this.currentIndex + 1})`;

    // Favori durumu
    const isFav = this.favorites.includes(q.id);
    if (favoriteBtn) {
      favoriteBtn.innerHTML = isFav 
        ? `<svg class="w-5 h-5 fill-amber-400 text-amber-500" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`
        : `<svg class="w-5 h-5 text-gray-400 hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`;
    }

    // Soru Notu Göstergesi
    this.updateQuestionNoteUI(q);

    // Topluluk Soru Çözülme & Başarı Rozeti
    this.updateQuestionStatsBadge(q);

    // Paragraf varsa göster
    const passageContainer = document.getElementById("passageContainer");
    const passageTextEl = document.getElementById("passageText");
    if (q.passage && q.passage.trim().length > 0) {
      passageContainer.classList.remove("hidden");
      passageTextEl.innerHTML = this.tokenizeInteractiveText(q.passage);
    } else {
      passageContainer.classList.add("hidden");
    }

    // YDS Formatında Resmi Soru Yönergesi
    const directiveEl = document.getElementById("questionDirectiveText");
    if (directiveEl) {
      directiveEl.textContent = this.getQuestionDirective(q);
    }

    // Soru Metnini İnteraktif Hale Getir
    const questionTextEl = document.getElementById("questionText");
    if (questionTextEl) {
      questionTextEl.innerHTML = this.tokenizeInteractiveText(q.questionText);
    }

    // Şıkları Renderla
    const optionsContainer = document.getElementById("optionsContainer");
    if (optionsContainer) {
      optionsContainer.innerHTML = "";
      const existingAnswer = this.userAnswers[q.id];

      const sampleOptText = (q.options?.A || "") + " " + (q.options?.B || "");
      const isTurkishOptions = (q.subCategory && q.subCategory.includes("İngilizce -> Türkçe")) ||
                               (q.questionNumber >= 37 && q.questionNumber <= 39) ||
                               /[çğışöüÇĞİŞÖÜ]/.test(sampleOptText);

      const eliminatedForQ = Array.isArray(this.eliminatedOptions?.[q.id]) ? this.eliminatedOptions[q.id] : [];

      const optKeys = ["A", "B", "C", "D", "E"];
      optKeys.forEach(key => {
        const optText = q.options ? q.options[key] : null;
        if (!optText) return;

        const isEliminated = !existingAnswer && eliminatedForQ.includes(key);

        const optBtn = document.createElement("button");
        optBtn.className = "option-btn w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-left flex items-start space-x-3 group relative shadow-sm";
        optBtn.dataset.option = key;

        let statusClass = "";
        let badgeHtml = "";

        if (existingAnswer) {
          optBtn.classList.add("cursor-default");
          optBtn.setAttribute("aria-disabled", "true");
          if (key === q.correctAnswer) {
            statusClass = "option-correct";
            badgeHtml = `<span class="ml-auto text-emerald-600 dark:text-emerald-400 font-bold flex items-center text-sm"><svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Doğru Cevap</span>`;
          } else if (key === existingAnswer.selected && !existingAnswer.isCorrect) {
            statusClass = "option-wrong";
            badgeHtml = `<span class="ml-auto text-rose-600 dark:text-rose-400 font-bold flex items-center text-sm"><svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Yanlış</span>`;
          }
        } else if (isEliminated) {
          statusClass = "option-eliminated";
        }

        if (statusClass) {
          optBtn.className += ` ${statusClass}`;
        }

        const interactiveOptText = isTurkishOptions ? optText : this.tokenizeInteractiveText(optText);

        const eliminateBtnHtml = !existingAnswer ? `
          <span role="button" tabindex="0" data-eliminate-key="${key}" title="${isEliminated ? 'Elenen şıkkı geri aç' : 'Bu şıkkı ele (Üstünü çiz)'}"
            class="eliminate-opt-btn flex-shrink-0 ml-1 p-1.5 rounded-lg border transition-all ${
              isEliminated
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 hover:bg-rose-200'
                : 'bg-gray-50 dark:bg-gray-700/60 text-gray-400 dark:text-gray-400 border-gray-200/80 dark:border-gray-600/80 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }">
            ${isEliminated
              ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>`
              : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`
            }
          </span>
        ` : '';

        optBtn.innerHTML = `
<div class="flex flex-col w-full min-w-0">
  ${badgeHtml ? `<div class="w-full flex justify-start sm:justify-end mb-2">${badgeHtml}</div>` : ''}
  <div class="flex items-start gap-3 w-full">
    <span class="option-key-badge flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors mt-0.5">
      ${key}
    </span>
    <div class="option-text-content flex-1 text-gray-800 dark:text-gray-100 leading-relaxed font-medium break-words min-w-0 pt-1">
      ${interactiveOptText}
    </div>
    ${eliminateBtnHtml}
  </div>
</div>
`;

        optBtn.addEventListener("click", (e) => {
          // Şık eleme butonuna tıklandıysa şıkkı seçme, sadece ele/geri aç
          const elimBtn = e.target.closest(".eliminate-opt-btn");
          if (elimBtn) {
            e.preventDefault();
            e.stopPropagation();
            this.toggleEliminateOption(q.id, key, e);
            return;
          }
          // Eğer tıklanan eleman veya ebeveyni interaktif kelime ise şıkkı işaretleme, kelimeyi aç
          if (e.target.closest(".interactive-word")) return;
          // Zaten cevaplanmışsa yeni cevap seçme
          if (this.userAnswers[q.id]) return;
          // Eğer şık elenmişse yanlışlıkla seçilmesini önle, önce elemeyi kaldır
          if (Array.isArray(this.eliminatedOptions?.[q.id]) && this.eliminatedOptions[q.id].includes(key)) {
            this.toggleEliminateOption(q.id, key, e);
            return;
          }
          this.handleOptionSelect(key);
        });

        optionsContainer.appendChild(optBtn);
      });
    }

    // Yazı boyutu ölçeğini uygula
    this.applyQuestionFontSize();

    // Kaldığın yerden devam et bilgisini kaydet
    if (this.currentView === "question") {
      this.recordCurrentSessionPosition(q);
    }

    // Açıklama / Çözüm Kartı
    this.renderExplanationSection(q);

    // Navigasyon butonlarını güncelle
    this.updateNavigationControls();
  }

  // YDS Formatında Resmi Soru Yönergesi Üretici
  getQuestionDirective(q) {
    if (!q) return "Verilen soruyu en uygun seçeneği belirleyerek cevaplayınız.";
    const num = q.questionNumber || 0;
    const cat = (q.category || "").toLowerCase();

    if (cat.includes("kelime") || (num >= 1 && num <= 6)) {
      return "1 - 6. sorularda, cümlede boş bırakılan yere uygun düşen sözcük veya ifadeyi bulunuz.";
    }
    if (cat.includes("dilbilgisi") || (num >= 7 && num <= 16)) {
      return "7 - 16. sorularda, cümlede boş bırakılan yere uygun düşen sözcük veya ifadeyi bulunuz.";
    }
    if (cat.includes("cloze") || (num >= 17 && num <= 26)) {
      return "17 - 26. sorularda, aşağıdaki parçada numaralanmış yerlere uygun düşen sözcük veya ifadeyi bulunuz.";
    }
    if (cat.includes("cümle tamamlama") || (num >= 27 && num <= 36)) {
      return "27 - 36. sorularda, verilen cümleyi uygun şekilde tamamlayan ifadeyi bulunuz.";
    }
    if ((q.subCategory && q.subCategory.includes("İngilizce -> Türkçe")) || (num >= 37 && num <= 39)) {
      return "37 - 39. sorularda, verilen İngilizce cümlenin Türkçe dengini bulunuz.";
    }
    if ((q.subCategory && q.subCategory.includes("Türkçe -> İngilizce")) || (num >= 40 && num <= 42)) {
      return "40 - 42. sorularda, verilen Türkçe cümlenin İngilizce dengini bulunuz.";
    }
    if (cat.includes("anlamca en yakın") || (num >= 68 && num <= 71)) {
      return "68 - 71. sorularda, verilen cümleye anlamca en yakın ifadeyi bulunuz (Restatement).";
    }
    if (cat.includes("okuma") || cat.includes("parça") || (num >= 43 && num <= 62)) {
      return "43 - 62. sorularda, verilen parçaya göre soruları cevaplayınız.";
    }
    if (cat.includes("diyalog") || (num >= 63 && num <= 67)) {
      return "63 - 67. sorularda, karşılıklı konuşmanın boş bırakılan kısmını tamamlayabilecek ifadeyi bulunuz.";
    }
    if (cat.includes("paragraf tamamlama") || (num >= 72 && num <= 75)) {
      return "72 - 75. sorularda, parçada boş bırakılan yere anlam bütünlüğünü sağlamak için getirilebilecek cümleyi bulunuz.";
    }
    if (cat.includes("anlatım") || cat.includes("akışı bozan") || (num >= 76 && num <= 80)) {
      return "76 - 80. sorularda, cümleler sırasıyla okunduğunda parçanın anlam bütünlüğünü bozan cümleyi bulunuz.";
    }
    return "Verilen soruyu en uygun seçeneği belirleyerek cevaplayınız.";
  }

  // Metni interaktif kelimelere bölme ve arama kelimesini vurgulama
  tokenizeInteractiveText(rawText) {
    if (!rawText) return "";

    const turkWords = ['bir', 've', 'i�in', 'olarak', 'bu', 'ile', 'da', 'de', 'daha', 'olan', 'gibi', 'en', '�ok', 'veya', 'ki', 'kadar', 'ise', 'g�re', 'oldu�unu', 'yap�lan', 'edilmesi', 'etmek', '��nk�', 'ancak', 'nedeniyle', 'y�z�nden', 'ra�men', 'gerekir', '�nemli', 'b�y�k', 'taraf�ndan'];
    const words = rawText.toLowerCase().split(/[\s,.'"-]+/);
    let trCount = 0;
    for(let w of words) {
       if (turkWords.includes(w)) trCount++;
    }
    const charMatch = rawText.match(/[�����������]/g);
    if (trCount >= 2 || (trCount >= 1 && charMatch && charMatch.length >= 1) || (charMatch && charMatch.length >= 3)) {
       return rawText; // T�rk�e kelimeleri interaktif yapma!
    }

    const kw = this.activeKeyword;

    // Boşluklar ve kelimeleri yakala
    return rawText.split(/(\s+)/).map(part => {
      if (/^\s+$/.test(part)) return part; // Boşlukları olduğu gibi bırak

      // Kelimenin başındaki ve sonundaki noktalama işaretlerini ayıkla
      const match = part.match(/^([.,/#!$%^&*;:{}=\-_`~()?"'“”—]*)(.*?)([.,/#!$%^&*;:{}=\-_`~()?"'“”—]*)$/);
      if (!match) return part;

      const leading = match[1];
      const coreWord = match[2];
      const trailing = match[3];

      if (!coreWord) return part;

      const cleanForLookup = coreWord.toLowerCase();
      const isSearchMatch = kw && (cleanForLookup === kw);
      const clueClass = this.clueHighlightEnabled ? this.getClueHighlightClass(cleanForLookup) : "";

      const highlightClass = [isSearchMatch ? "search-highlight" : "", clueClass].filter(Boolean).join(" ");

      return `${leading}<span class="interactive-word ${highlightClass}" data-word="${encodeURIComponent(cleanForLookup)}">${coreWord}</span>${trailing}`;
    }).join("");
  }

  // Şık Seçimi ve Anında Değerlendirme
  handleOptionSelect(selectedOption) {
    const q = this.filteredQuestions[this.currentIndex];
    if (!q) return;

    if (this.userAnswers[q.id]) {
      return; // Zaten çözülmüş
    }

    // 80 SORULUK DENEME MODU: Kullanıcı şıkkı işaretlediği AN süreyi OTOMATİK DURDUR!
    // Böylece çözümü, çeviriyi ve taktiği incelerken sınav süresi haksız yere akmaz.
    if (this.isExamMode && this.autoPauseEnabled) {
      this.pauseExamSmartTimer();
    }

    const isCorrect = selectedOption === q.correctAnswer;
    let justMeltedMistake = false;

    // Akıllı Hata Eritme Modunda cevaplandıysa orijinal havuzunu da güncelle
    if (this.isMistakeMelterMode) {
      const origin = this.mistakeMelterOrigins?.[q.id] || "practice";
      delete this.mistakeMelterBackup?.[q.id];

      const recordObj = {
        selected: selectedOption,
        isCorrect: isCorrect,
        timestamp: Date.now()
      };

      if (origin === "exam") {
        this.examAnswers[q.id] = recordObj;
        this.saveExamAnswers();
      } else {
        this.practiceAnswers[q.id] = recordObj;
        this.savePracticeAnswers();
      }

      if (isCorrect) {
        justMeltedMistake = true;
        this.mistakeMelterSessionMelted = (this.mistakeMelterSessionMelted || 0) + 1;
        this.meltedMistakesCount = (this.meltedMistakesCount || 0) + 1;
        try {
          localStorage.setItem("yds_melted_mistakes_count", String(this.meltedMistakesCount));
        } catch (e) {}
      }
    }

    this.userAnswers[q.id] = {
      selected: selectedOption,
      isCorrect: isCorrect,
      timestamp: Date.now(),
      _justMelted: justMeltedMistake
    };

    if (this.isSprintMode) {
      this.sprintAnswers[q.id] = {
        selected: selectedOption,
        isCorrect: isCorrect,
        timestamp: Date.now()
      };
    }

    this.saveUserAnswers();
    this.recordDailyActivity(1);
    this.updateHomeStats();

    // Ses çal
    if (isCorrect) {
      this.playCorrectSound();
    } else {
      this.playWrongSound();
    }

    // Sayfayı yeniden renderla (renkler, çözüm yöntemi ve açıklama açılacak)
    this.renderQuestion();
    this.renderQuestionGrid();

    if (this.isSprintMode) {
      this.updateSprintBannerUI();
      const allSprintAnswered = this.filteredQuestions.length > 0 && this.filteredQuestions.every(item => this.sprintAnswers[item.id] || this.userAnswers[item.id]);
      if (allSprintAnswered) {
        this.stopSprintTimer();
        setTimeout(() => {
          this.finishSprintMode();
        }, 900);
      }
    }

    if (this.isMistakeMelterMode) {
      this.updateMistakeMelterBannerUI();
    }

    // Normal serbest soru çözme modunda periyodik geçiş reklamı kontrolü (her 20 soruda bir)
    if (!this.isExamMode && !this.isSprintMode) {
      window.ydsAdService?.onQuestionAnswered();
      this.queueStatSubmission(q, isCorrect);
    }

    // Sınav modundaysa ilerleme rozetini güncelle
    if (this.isExamMode) {
      this.updateExamProgressBanner();

      // Eğer 80 sorunun tamamı cevaplandıysa otomatik olarak tebrik et ve karnesini göster
      const allAnswered = this.activePool.length > 0 && this.activePool.every(item => this.userAnswers[item.id]);
      if (allAnswered) {
        setTimeout(() => {
          this.showExamScorecard();
        }, 1200);
      }
    }
  }

  // Çözüm ve Türkçe Açıklama Kartı
  renderExplanationSection(q) {
    const section = document.getElementById("explanationSection");
    if (!section) return;

    const answer = this.userAnswers[q.id];
    if (!answer) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");

    // Akıllı Süre Duraklatıldı Bildirimi
    const timerNotice = document.getElementById("explanationTimerNotice");
    if (timerNotice) {
      if (this.isExamMode) {
        timerNotice.classList.remove("hidden");
      } else {
        timerNotice.classList.add("hidden");
      }
    }

    // Çözüm Yöntemi kartını gizliyoruz, metin doğrudan Detaylı Çözüm & Türkçe Çeviri içine yerleştirilecek
    const solutionCard = document.getElementById("solutionMethodCard");
    if (solutionCard) {
      solutionCard.classList.add("hidden");
    }

    const feedbackBanner = document.getElementById("answerFeedbackBanner");
    if (feedbackBanner) {
      if (answer.isCorrect) {
        const meltedExtra = answer._justMelted
          ? `<span class="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white">Hata Havuzunuzdan Eritildi! (+1 Net)</span>`
          : "";
        feedbackBanner.className = "p-4 rounded-xl mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3";
        feedbackBanner.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <h4 class="font-bold text-base">Tebrikler! Doğru Cevap: (${q.correctAnswer})</h4>
            <p class="text-sm opacity-90">Soruyu başarıyla çözdünüz. Aşağıdaki özel taktiği ve açıklamayı inceleyebilirsiniz.</p>
            ${meltedExtra}
          </div>
        `;
      } else {
        feedbackBanner.className = "p-4 rounded-xl mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center space-x-3";
        feedbackBanner.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center flex-shrink-0 text-rose-600 dark:text-rose-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <div>
            <h4 class="font-bold text-base">Yanlış Cevap! İşaretlediğiniz: (${answer.selected}) | Doğru Seçenek: (${q.correctAnswer})</h4>
            <p class="text-sm opacity-90">Aşağıdaki çözüm yöntemini inceleyerek doğru cevabın mantığını öğrenebilirsiniz.</p>
          </div>
        `;
      }
    }

    const fullExplanation = (q.explanation && q.explanation.trim().length > 0 ? q.explanation : (q.solutionMethod || "")).trim();
    const explanationWrapper = document.getElementById("explanationCardWrapper");
    const explanationContent = document.getElementById("explanationContent");
    if (explanationContent) {
      if (fullExplanation && fullExplanation.length > 0) {
        if (explanationWrapper) explanationWrapper.classList.remove("hidden");
        explanationContent.innerHTML = fullExplanation.replace(/\n/g, "<br>");
      } else {
        if (explanationWrapper) explanationWrapper.classList.add("hidden");
        explanationContent.innerHTML = "";
      }
    }

    // Sorudaki Önemli Kelimeler Tablosu / Listesi
    const keyWordsContainer = document.getElementById("keyWordsContainer");
    if (keyWordsContainer) {
      keyWordsContainer.innerHTML = "";

      if (q.wordAnalysis && Object.keys(q.wordAnalysis).length > 0) {
        document.getElementById("keyWordsCard")?.classList.remove("hidden");

        Object.entries(q.wordAnalysis).forEach(([word, meaning]) => {
          const isSaved = this.learningPool.some(item => item.word.toLowerCase() === word.toLowerCase());
          const badge = document.createElement("div");
          badge.className = "flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm";
          badge.innerHTML = `
            <div>
              <span class="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onclick="ydsApp.openWordModal('${word}')">${word}</span>
              <span class="text-gray-600 dark:text-gray-300 ml-2">: ${meaning}</span>
            </div>
            <button class="add-to-pool-btn p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${isSaved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100'}">
              ${isSaved ? '<span>Havuzda</span>' : '<span>+ Havuza Ekle</span>'}
            </button>
          `;

          badge.querySelector(".add-to-pool-btn")?.addEventListener("click", () => {
            this.toggleLearningPool(word, meaning, q.questionText);
            this.renderExplanationSection(q);
          });

          keyWordsContainer.appendChild(badge);
        });
      } else {
        document.getElementById("keyWordsCard")?.classList.add("hidden");
      }
    }

    // Soru Notu Hatırlatıcısı (Çözüm Alanında)
    this.updateQuestionNoteUI(q);
  }

  // --- Kelimeye Tıklayınca Açılan Sözlük Penceresi ---
  async openWordModal(word) {
    if (!word) return;
    this.lockScroll();
    const modal = document.getElementById("wordInspectorModal");
    const titleEl = document.getElementById("modalWordTitle");
    const typeEl = document.getElementById("modalWordType");
    const meaningEl = document.getElementById("modalWordMeaning");
    const sampleEl = document.getElementById("modalWordSample");
    const addPoolBtn = document.getElementById("modalAddPoolBtn");
    const filterByWordBtn = document.getElementById("modalFilterByWordBtn");

    if (!modal) return;

    modal.classList.remove("hidden");
    titleEl.textContent = word;
    typeEl.textContent = "yükleniyor...";
    meaningEl.textContent = "Anlam aranıyor...";
    sampleEl.textContent = "";

    // Sözlükten ara
    const result = await window.ydsDictionary.lookup(word);

    if (result) {
      titleEl.textContent = result.word || word;
      typeEl.textContent = result.type ? `(${result.type})` : "";
      meaningEl.textContent = result.tr || "Türkçe anlamı bulunamadı.";
      sampleEl.textContent = result.sample ? `Örnek: "${result.sample}"` : "";

      // Havuzda var mı?
      const isSaved = this.learningPool.some(item => item.word.toLowerCase() === word.toLowerCase());
      this.updateModalAddBtn(isSaved);

      addPoolBtn.onclick = () => {
        const isNowSaved = this.toggleLearningPool(word, result.tr, result.sample || "");
        this.updateModalAddBtn(isNowSaved);
      };

      // Bu kelimeye göre filtrele butonu
      filterByWordBtn.onclick = () => {
        modal.classList.add("hidden");
        const kwInput = document.getElementById("keywordInput");
        const clearBtn = document.getElementById("clearKeywordBtn");
        if (kwInput) {
          kwInput.value = word;
          if (clearBtn) clearBtn.classList.remove("hidden");
        }
        this.applyFilters();
      };
    }
  }

  updateModalAddBtn(isSaved) {
    const btn = document.getElementById("modalAddPoolBtn");
    if (!btn) return;
    if (isSaved) {
      btn.className = "w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 bg-emerald-600 text-white hover:bg-emerald-700 transition";
      btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Öğrenme Havuzunda Ekli (Kaldır)</span>`;
    } else {
      btn.className = "w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 bg-indigo-600 text-white hover:bg-indigo-700 transition";
      btn.innerHTML = `<svg class="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg><span>Öğrenme Havuzuma Ekle</span>`;
    }
  }

  closeWordModal() {
    this.unlockScroll();
    document.getElementById("wordInspectorModal")?.classList.add("hidden");
  }

  // Kelimeyi anında ve gecikmesiz telaffuz et
  speakWord(text) {
    if (!text) return;
    const clean = text.trim();

    // 1. Cihazın yerleşik Web Speech API motorunu kullan (0 ms gecikme, çevrimdışı ve anında çalışır)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = "en-US";
        utterance.rate = 0.92;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang && (v.lang === 'en-US' || v.lang.startsWith('en')));
        if (enVoice) {
          utterance.voice = enVoice;
        }

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn("Web Speech API hatası, online TTS servisine geçiliyor:", err);
      }
    }

    // 2. Yedek: Google Translate Hızlı TTS Motoru
    this.fallbackSpeak(clean);
  }

  fallbackSpeak(text) {
    if (!this.audioCache) this.audioCache = {};
    const lowerText = text.toLowerCase();
    
    if (this.audioCache[lowerText]) {
      this.audioCache[lowerText].currentTime = 0;
      this.audioCache[lowerText].play().catch(() => {});
      return;
    }

    try {
      const url = "https://translate.googleapis.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(lowerText) + "&tl=en-US&client=tw-ob";
      const audio = new Audio(url);
      this.audioCache[lowerText] = audio;
      audio.play().catch(e => console.warn("Ses çalma hatası:", e));
    } catch (_) {}
  }

  // --- Öğrenme Havuzu (Vocabulary Learning Pool & Flashcards) ---
  toggleLearningPool(word, meaning, sample) {
    const cleanWord = word.trim().toLowerCase();
    const index = this.learningPool.findIndex(item => item.word.toLowerCase() === cleanWord);

    let isSaved = false;
    if (index >= 0) {
      this.learningPool.splice(index, 1);
      isSaved = false;
    } else {
      this.learningPool.push({
        id: "v-" + Date.now(),
        word: word.trim(),
        meaning: meaning || "YDS Kelimesi",
        sample: sample || "",
        dateAdded: new Date().toLocaleDateString("tr-TR"),
        mastered: false
      });
      isSaved = true;
    }

    this.saveLearningPool();
    return isSaved;
  }

  updateLearningPoolBadge() {
    const badge = document.getElementById("learningPoolCountBadge");
    if (badge) {
      badge.textContent = this.learningPool.length;
    }
  }

  openLearningPoolModal() {
    const modal = document.getElementById("learningPoolModal");
    if (!modal) return;
    this.lockScroll();
    modal.classList.remove("hidden");
    const masteredCountEl = document.getElementById("masteredTotalWords");
    if (masteredCountEl) masteredCountEl.textContent = this.masteredWords.length;
    this._showPoolTab("pool");
  }

  _showPoolTab(tab) {
    const poolBtn = document.getElementById("tabPoolWordsBtn");
    const masteredBtn = document.getElementById("tabMasteredWordsBtn");
    const poolList = document.getElementById("learningPoolList");
    const masteredList = document.getElementById("masteredWordsList");
    const actionsBar = document.getElementById("poolActionsBar");

    if (tab === "mastered") {
      poolBtn?.classList.remove("bg-indigo-600", "text-white", "shadow-sm");
      poolBtn?.classList.add("bg-gray-100", "dark:bg-gray-700", "text-gray-700", "dark:text-gray-300");
      masteredBtn?.classList.remove("bg-gray-100", "dark:bg-gray-700", "text-gray-700", "dark:text-gray-300");
      masteredBtn?.classList.add("bg-emerald-600", "text-white", "shadow-sm");
      poolList?.classList.add("hidden");
      masteredList?.classList.remove("hidden");
      actionsBar?.classList.add("hidden");
      this.renderMasteredWordsList();
    } else {
      masteredBtn?.classList.remove("bg-emerald-600", "text-white", "shadow-sm");
      masteredBtn?.classList.add("bg-gray-100", "dark:bg-gray-700", "text-gray-700", "dark:text-gray-300");
      poolBtn?.classList.remove("bg-gray-100", "dark:bg-gray-700", "text-gray-700", "dark:text-gray-300");
      poolBtn?.classList.add("bg-indigo-600", "text-white", "shadow-sm");
      masteredList?.classList.add("hidden");
      poolList?.classList.remove("hidden");
      actionsBar?.classList.remove("hidden");
      this.renderLearningPoolList();
    }
  }

  renderMasteredWordsList() {
    const container = document.getElementById("masteredWordsList");
    if (!container) return;

    if (this.masteredWords.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <p class="text-lg font-medium">Henüz öğrendiğin kelime yok.</p>
          <p class="text-sm mt-1">Flaş Kart modunda "Öğrendim" butonuna basarak kelimeleri buraya taşıyabilirsin.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    const mSorted = [...this.masteredWords].map(item => ({
      ...item,
      count: this.getExamOccurrenceCount(item.word)
    })).sort((a, b) => b.count - a.count);

    mSorted.forEach(item => {
      const dateStr = item.date ? new Date(item.date).toLocaleDateString("tr-TR") : "";
      const card = document.createElement("div");
      card.className = "p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 flex flex-col space-y-2";

      const meaningHtml = item.meaning ? `<p class="text-gray-700 dark:text-gray-300 text-sm mt-1">${item.meaning}</p>` : "";
      const dateHtml = dateStr ? `<p class="text-xs text-gray-400 mt-0.5">${dateStr} tarihinde öğrenildi</p>` : "";

      const safeWord = (item.word || "").replace(/"/g, "&quot;");

      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-lg text-emerald-700 dark:text-emerald-400">${item.word || ""}</span>
              <button class="text-gray-400 hover:text-emerald-600" onclick="ydsApp.speakWord(this.dataset.w)" data-w="${safeWord}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                </svg>
              </button>
              <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">Öğrenildi</span>
            </div>
            ${meaningHtml}
            ${dateHtml}
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
          <span class="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            YDS'de ${item.count} kez soruldu
          </span>
          <button class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg hover:bg-indigo-100 transition" onclick="ydsApp.searchWordInExams(this.dataset.w)" data-w="${safeWord}">
            Sorulara Git →
          </button>
        </div>
      `;

      container.appendChild(card);
    });
  }

  closeLearningPoolModal() {
    this.unlockScroll(); document.getElementById("learningPoolModal")?.classList.add("hidden");
  }

  getExamOccurrenceCount(word) {
    const pool = window.questionRepo ? window.questionRepo.getAll() : [];
    const keywordRegex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\b', 'i');
    let count = 0;
    pool.forEach(q => {
      const qText = q.questionText || q.text || "";
      const inQuestion = keywordRegex.test(qText);
      const inPassage = keywordRegex.test(q.passage || "");
      const inOptions = Object.values(q.options || {}).some(opt => keywordRegex.test(String(opt)));
      const inTags = (q.tags || []).some(t => keywordRegex.test(String(t)));
      const inAnalysis = q.wordAnalysis && Object.keys(q.wordAnalysis).some(w => keywordRegex.test(w));
      if (inQuestion || inPassage || inOptions || inTags || inAnalysis) count++;
    });
    return count;
  }

  searchWordInExams(word) {
      this.closeLearningPoolModal();
      this.showQuestionView("practice");
      this.startPracticeMode();

      const kwInput = document.getElementById("keywordInput");
      const clearBtn = document.getElementById("clearKeywordBtn");
      const scSelect = document.getElementById("searchScopeFilter");
      
      if (kwInput) {
        kwInput.value = word;
        if (clearBtn) clearBtn.classList.remove("hidden");
      }
      if (scSelect) {
        scSelect.value = "all";
      }
      
      this.applyFilters();
    }

  renderLearningPoolList() {
    const listContainer = document.getElementById("learningPoolList");
    const countEl = document.getElementById("poolTotalWords");
    if (!listContainer) return;

    if (countEl) countEl.textContent = this.learningPool.length;

    if (this.learningPool.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p class="text-lg font-medium">Öğrenme havuzunuzda henüz kelime bulunmuyor.</p>
          <p class="text-sm mt-1">Sorulardaki kelimelerin üzerine tıklayarak veya açıklamalar kısmından tek tıkla havuza ekleyebilirsiniz.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = "";
    // Öğrenme havuzunu görünme sıklığına göre (büyükten küçüğe) sırala
    const sortedPool = [...this.learningPool].map(item => ({
      ...item,
      occurrenceCount: this.getExamOccurrenceCount(item.word)
    })).sort((a, b) => b.occurrenceCount - a.occurrenceCount);

    sortedPool.forEach(item => {
      const occurrenceCount = item.occurrenceCount;
      const card = document.createElement("div");
      card.className = "p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col space-y-3";
      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-lg text-indigo-600 dark:text-indigo-400">${item.word}</span>
              <button class="text-gray-400 hover:text-indigo-600" onclick="ydsApp.speakWord('${item.word}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              </button>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">${item.meaning}</p>
            ${item.sample ? `<p class="text-xs text-gray-500 italic mt-1 font-serif">"${item.sample}"</p>` : ''}
          </div>
          <button class="text-gray-400 hover:text-rose-500 p-2" onclick="ydsApp.removeFromPool('${item.id}')" title="Havuzdan Kaldır">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <span class="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            YDS'de ${occurrenceCount} defa soruldu
          </span>
          <button class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg hover:bg-indigo-100 transition" onclick="ydsApp.searchWordInExams('${item.word}')">
            Sorulara Git
          </button>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }

  removeFromPool(id) {
    this.learningPool = this.learningPool.filter(i => i.id !== id);
    this.saveLearningPool();
    this.renderLearningPoolList();
  }

  // Flashcard Modu
  openFlashcardsModal() {
    if (this.learningPool.length === 0) {
      alert("Flaş kart çalışması için önce sorulardan birkaç kelimeyi öğrenme havuzuna eklemelisiniz.");
      return;
    }
    const modal = document.getElementById("flashcardModal");
    if (!modal) return;
    this.lockScroll();
    modal.classList.remove("hidden");
    this.flashcardIndex = 0;
    this.flashcardFlipped = false;
    this.renderFlashcard();
  }

  closeFlashcardsModal() {
    this.unlockScroll();
    document.getElementById("flashcardModal")?.classList.add("hidden");
  }

  renderFlashcard() {
    const card = this.learningPool[this.flashcardIndex];
    if (!card) return;

    const inner = document.getElementById("flashcardInner");
    const frontWord = document.getElementById("flashcardFrontWord");
    const frontSample = document.getElementById("flashcardFrontSample");
    const backMeaning = document.getElementById("flashcardBackMeaning");
    const progressEl = document.getElementById("flashcardProgress");

    if (inner) inner.classList.remove("flipped");
    this.flashcardFlipped = false;

    if (frontWord) frontWord.textContent = card.word;
    if (frontSample) frontSample.textContent = card.sample ? `"${card.sample}"` : "Örnek cümle bulunmuyor.";
    if (backMeaning) backMeaning.textContent = card.meaning;
    if (progressEl) progressEl.textContent = `${this.flashcardIndex + 1} / ${this.learningPool.length}`;
  }

  flipFlashcard() {
    const inner = document.getElementById("flashcardInner");
    this.flashcardFlipped = !this.flashcardFlipped;
    if (inner) {
      inner.classList.toggle("flipped", this.flashcardFlipped);
    }
  }

  nextFlashcard(markAsMastered = false) {
    if (markAsMastered && this.learningPool[this.flashcardIndex]) {
      const cardInner = document.getElementById("flashcardInner");
      if (cardInner) {
        cardInner.classList.add("flashcard-mastered-out");
      }

      setTimeout(() => {
        if (cardInner) {
          cardInner.classList.remove("flashcard-mastered-out");
          cardInner.classList.remove("flipped");
        }
        this.flashcardFlipped = false;

        const masteredWord = this.learningPool[this.flashcardIndex];
        if (masteredWord) {
          this.masteredWords.push({ word: masteredWord.word, date: new Date().toISOString() });
          this.saveMasteredWords();
          this.learningPool.splice(this.flashcardIndex, 1);
          this.saveLearningPool();
          this.updateLearningPoolBadge();
          this.renderLearningPoolList();
        }

        if (this.learningPool.length === 0) {
          this.closeFlashcardsModal();
          alert("Tebrikler! Öğrenme havuzundaki tüm kelimeleri başarıyla öğrendiniz.");
          return;
        }

        this.flashcardIndex = this.flashcardIndex % this.learningPool.length;
        this.renderFlashcard();

        if (cardInner) {
          cardInner.classList.add("flashcard-next-in");
          setTimeout(() => cardInner.classList.remove("flashcard-next-in"), 320);
        }
      }, 340);
      return;
    }

    this.flashcardIndex = (this.flashcardIndex + 1) % this.learningPool.length;
    this.renderFlashcard();
  }

  prevFlashcard() {
    this.flashcardIndex = (this.flashcardIndex - 1 + this.learningPool.length) % this.learningPool.length;
    this.renderFlashcard();
  }

  exportLearningPool(format = "csv") {
    if (this.learningPool.length === 0) {
      alert("Dışa aktarılacak kelime bulunmuyor.");
      return;
    }

    let dataStr = "";
    let fileName = `yds_ogrenme_havuzu_${Date.now()}`;

    if (format === "csv") {
      dataStr = "Kelime,Türkçe Anlamı,Örnek Cümle,Eklenme Tarihi\n" + 
        this.learningPool.map(i => `"${i.word}","${i.meaning}","${i.sample || ''}","${i.dateAdded}"`).join("\n");
      fileName += ".csv";
    } else {
      dataStr = JSON.stringify(this.learningPool, null, 2);
      fileName += ".json";
    }

    const blob = new Blob([dataStr], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Favori Soruları Yönetme ---
  toggleFavorite() {
    const q = this.filteredQuestions[this.currentIndex];
    if (!q) return;

    const idx = this.favorites.indexOf(q.id);
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.push(q.id);
    }
    this.saveFavorites();
    this.renderQuestion();
    this.renderQuestionGrid();
  }

  // --- Soru Navigasyonu ---
  nextQuestion() {
    if (this.currentIndex < this.filteredQuestions.length - 1) {
      this.currentIndex++;
      this.onQuestionChanged();
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.onQuestionChanged();
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  jumpToQuestion(idx) {
    if (idx >= 0 && idx < this.filteredQuestions.length) {
      this.currentIndex = idx;
      this.onQuestionChanged();
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onQuestionChanged() {
    if (!this.isExamMode) return;
    this.updateExamProgressBanner();

    const currentQ = this.filteredQuestions[this.currentIndex];
    if (!currentQ) return;

    // Eğer geçilen soru henüz cevaplanmamışsa: Akıllı süreyi otomatik olarak DEVAM ETTİR!
    // Eğer soru önceden cevaplanmışsa: Çözüm incelendiği için süreyi duraklatılmış tut!
    if (!this.userAnswers[currentQ.id]) {
      this.resumeExamSmartTimer();
    } else {
      if (this.autoPauseEnabled) {
        this.pauseExamSmartTimer();
      }
    }
  }

  updateNavigationControls() {
    const prevBtn = document.getElementById("prevQuestionBtn");
    const nextBtn = document.getElementById("nextQuestionBtn");
    const countIndicator = document.getElementById("navQuestionIndicator");

    if (prevBtn) prevBtn.disabled = this.currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = this.currentIndex >= this.filteredQuestions.length - 1;
    if (countIndicator) {
      countIndicator.textContent = this.filteredQuestions.length > 0
        ? `${this.currentIndex + 1} / ${this.filteredQuestions.length}`
        : "0 / 0";
    }
  }

  // Hızlı Soru Izgarası (Question Number Grid)
  renderQuestionGrid() {
    const grid = document.getElementById("questionNumberGrid");
    if (!grid) return;

    grid.innerHTML = "";
    this.filteredQuestions.forEach((q, idx) => {
      const btn = document.createElement("button");
      const ans = this.userAnswers[q.id];
      const isFav = this.favorites.includes(q.id);
      const isCurrent = idx === this.currentIndex;

      let bgClass = "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
      if (ans) {
        bgClass = ans.isCorrect
          ? "bg-emerald-500 text-white font-bold"
          : "bg-rose-500 text-white font-bold";
      }

      let borderClass = isCurrent ? "ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-900" : "";

      btn.className = `w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition ${bgClass} ${borderClass} relative`;
      btn.textContent = idx + 1;
      btn.title = `Soru ${idx + 1} (${q.category})`;

      if (isFav) {
        const star = document.createElement("span");
        star.className = "absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full";
        btn.appendChild(star);
      }

      btn.addEventListener("click", () => this.jumpToQuestion(idx));
      grid.appendChild(btn);
    });
  }

  // --- İstatistikler ---
  updateStats() {
    const totalQuestions = this.allQuestions.length;
    const answeredEntries = Object.values(this.userAnswers);
    const totalAnswered = answeredEntries.length;
    const totalCorrect = answeredEntries.filter(a => a.isCorrect).length;
    const totalWrong = totalAnswered - totalCorrect;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const statTotalEl = document.getElementById("statTotalQuestions");
    const statAnsweredEl = document.getElementById("statAnswered");
    const statCorrectEl = document.getElementById("statCorrect");
    const statWrongEl = document.getElementById("statWrong");
    const statAccuracyEl = document.getElementById("statAccuracy");
    const statProgressBar = document.getElementById("statProgressBar");

    if (statTotalEl) statTotalEl.textContent = totalQuestions;
    if (statAnsweredEl) statAnsweredEl.textContent = totalAnswered;
    if (statCorrectEl) statCorrectEl.textContent = totalCorrect;
    if (statWrongEl) statWrongEl.textContent = totalWrong;
    if (statAccuracyEl) statAccuracyEl.textContent = `%${accuracy}`;
    if (statProgressBar) statProgressBar.style.width = `${accuracy}%`;

    this.updateHomeStats();
  }

  // --- Sınav Süre Sayacı ---
  toggleTimer() {
    const timerBtn = document.getElementById("timerToggleBtn");
    const display = document.getElementById("timerDisplay");

    if (this.timerRunning) {
      clearInterval(this.timerInterval);
      this.timerRunning = false;
      if (timerBtn) timerBtn.textContent = "Başlat";
    } else {
      this.timerRunning = true;
      if (timerBtn) timerBtn.textContent = "Durdur";
      this.timerInterval = setInterval(() => {
        this.timerSeconds++;
        const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, "0");
        const secs = String(this.timerSeconds % 60).padStart(2, "0");
        if (display) display.textContent = `${mins}:${secs}`;
      }, 1000);
    }
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.timerRunning = false;
    this.timerSeconds = 0;
    const timerBtn = document.getElementById("timerToggleBtn");
    const display = document.getElementById("timerDisplay");
    if (timerBtn) timerBtn.textContent = "Başlat";
    if (display) display.textContent = "00:00";
  }

  // ============================================================
  // --- 80 SORULUK YIL DENEMESİ & AKILLI SÜRE MOTORU (EXAM ENGINE) ---
  // ============================================================

  startExamSmartTimer() {
    if (this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
    }
    this.isExamTimerPaused = false;
    this.updateExamSmartTimerUI();

    this.examTimerInterval = setInterval(() => {
      if (!this.isExamTimerPaused) {
        this.examTimerSeconds++;
        this.updateExamSmartTimerUI();
      }
    }, 1000);
  }

  pauseExamSmartTimer() {
    this.isExamTimerPaused = true;
    this.updateExamSmartTimerUI();
  }

  resumeExamSmartTimer() {
    this.isExamTimerPaused = false;
    if (!this.examTimerInterval) {
      this.startExamSmartTimer();
    } else {
      this.updateExamSmartTimerUI();
    }
  }

  stopExamSmartTimer() {
    if (this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
      this.examTimerInterval = null;
    }
  }

  toggleExamTimerManually() {
    if (this.isExamTimerPaused) {
      this.resumeExamSmartTimer();
    } else {
      this.pauseExamSmartTimer();
    }
  }

  updateExamSmartTimerUI() {
    const display = document.getElementById("examSmartTimerDisplay");
    const badge = document.getElementById("examSmartTimerBadge");
    const dot = document.getElementById("examSmartTimerDot");
    const statusText = document.getElementById("examSmartTimerStatusText");
    const playIcon = document.getElementById("examTimerPlayIcon");
    const pauseIcon = document.getElementById("examTimerPauseIcon");

    const hours = Math.floor(this.examTimerSeconds / 3600);
    const mins = Math.floor((this.examTimerSeconds % 3600) / 60);
    const secs = this.examTimerSeconds % 60;

    const timeStr = hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (display) display.textContent = timeStr;

    if (badge && statusText && dot) {
      if (this.isExamTimerPaused) {
        badge.className = "flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40";
        dot.className = "w-2 h-2 rounded-full bg-amber-400";
        statusText.textContent = "Süre Duraklatıldı (Manuel/Açıklama)";
        if (playIcon) playIcon.classList.remove("hidden");
        if (pauseIcon) pauseIcon.classList.add("hidden");
      } else {
        badge.className = "flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30";
        dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
        statusText.textContent = "Süre İşliyor";
        if (playIcon) playIcon.classList.add("hidden");
        if (pauseIcon) pauseIcon.classList.remove("hidden");
      }
    }
  }

  formatDuration(totalSecs) {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hours > 0) {
      return `${hours} sa ${mins} dk ${secs} sn`;
    }
    return `${mins} dk ${secs} sn`;
  }

  // --- Yıl Denemesi Modalı ve Seçimi ---
  openYearExamModal() {
    this.lockScroll();
    const modal = document.getElementById("yearExamModal");
    if (!modal) return;
    this.renderYearExamCards();
    modal.classList.remove("hidden");
  }

  closeYearExamModal() {
    this.unlockScroll();
    document.getElementById("yearExamModal")?.classList.add("hidden");
  }

  renderYearExamCards() {
    const grid = document.getElementById("yearExamCardsGrid");
    if (!grid) return;

    const availableExams = window.questionRepo ? window.questionRepo.getAvailableExams() : [];
    grid.innerHTML = "";

    availableExams.forEach(exam => {
      const examQuestions = window.questionRepo.getByExam(exam.name);
      const totalQ = examQuestions.length;
      
      const answeredInExam = examQuestions.filter(q => this.examAnswers[q.id]);
      const lastSession = this.examSessions[exam.name] || this.examSessions[exam.year];

      const card = document.createElement("div");
      card.className = "p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group";

      let statusBadge = "";
      if (lastSession) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Puan: ${lastSession.score}</span>`;
      } else if (answeredInExam.length > 0) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">${answeredInExam.length}/${totalQ} Çözüldü</span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Henüz Çözülmedi</span>`;
      }

      let actionButtons = "";
      if (lastSession) {
        actionButtons = `
          <button class="restart-year-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 transition active:scale-95">Baştan Başla</button>
          <button class="view-scorecard-btn px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 active:scale-95 flex items-center space-x-1.5">
            <svg class="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span>Karneni Gör</span>
          </button>
        `;
      } else if (answeredInExam.length > 0 && answeredInExam.length < totalQ) {
        actionButtons = `
          <button class="restart-year-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 transition active:scale-95">Baştan Başla</button>
          <button class="continue-year-btn px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20 active:scale-95">Devam Et</button>
        `;
      } else {
        actionButtons = `
          <button class="start-year-btn px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20 active:scale-95">Sınavı Başlat →</button>
        `;
      }

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-lg">${exam.year} YDS Formatında</span>
            ${statusBadge}
          </div>
          <h4 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            ${exam.name}
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${totalQ} Soru • YDS Özgün Soru Kitapçığı
          </p>
        </div>

        <div class="pt-2 border-t border-gray-100 dark:border-gray-700/80">
          <div class="flex items-center justify-between mb-2">
            <div class="text-[11px] text-gray-400 flex items-center space-x-1">
              <svg class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
              <span>Akıllı Süre Sayacı</span>
            </div>
          </div>
          <div class="flex items-center gap-2 justify-end">
            ${actionButtons}
          </div>
        </div>
      `;

      card.querySelector(".start-year-btn")?.addEventListener("click", () => {
        this.closeYearExamModal();
        this.startExamMode(exam.name);
      });
      card.querySelector(".continue-year-btn")?.addEventListener("click", () => {
        this.closeYearExamModal();
        this.startExamMode(exam.name);
      });
      card.querySelector(".view-scorecard-btn")?.addEventListener("click", () => {
        this.closeYearExamModal();
        this.showExamScorecard(exam.name);
      });
      card.querySelector(".restart-year-btn")?.addEventListener("click", () => {
        const confirmRestart = confirm("Tüm çözümleriniz ve süreniz sıfırlanacak. Baştan başlamak istediğinize emin misiniz?");
        if (confirmRestart) {
          examQuestions.forEach(q => {
            delete this.examAnswers[q.id];
            delete this.userAnswers[q.id];
          });
          this.saveExamAnswers();
          this.saveUserAnswers();
          
          let states = {};
          try { states = JSON.parse(localStorage.getItem("yds_exam_timers")) || {}; } catch (e) {}
          delete states[exam.name];
          delete states[exam.year];
          localStorage.setItem("yds_exam_timers", JSON.stringify(states));
          try {
            let pos = JSON.parse(localStorage.getItem("yds_exam_positions")) || {};
            delete pos[exam.name];
            delete pos[exam.year];
            localStorage.setItem("yds_exam_positions", JSON.stringify(pos));
          } catch (e) {}

          delete this.examSessions[exam.name];
          delete this.examSessions[exam.year];
          this.saveExamSessions();
          
          this.closeYearExamModal();
          this.startExamMode(exam.name);
        }
      });

      grid.appendChild(card);
    });
  }

  startExamMode(examIdentifier) {
    this.flushPendingStats();
    this.cleanupSpecialQuestionModes?.();
    this.practiceSessionActive = false;
    this.isPracticeMode = false;
    this.isExamMode = true;

    let examQuestions = [];
    let title = "";

    if (typeof examIdentifier === "string" && isNaN(Number(examIdentifier))) {
      examQuestions = window.questionRepo.getByExam(examIdentifier);
      this.currentExamName = examIdentifier;
      this.currentExamYear = examQuestions[0]?.year || null;
      title = examIdentifier;
    } else {
      const year = parseInt(examIdentifier);
      this.currentExamYear = year;
      this.currentExamName = null;
      examQuestions = window.questionRepo.getByYear(year);
      title = `${year} YDS Tam Deneme Sınavı`;
    }

    if (!examQuestions || examQuestions.length === 0) {
      alert(`${examIdentifier} için soru bulunamadı.`);
      return;
    }

    this.activePool = examQuestions;
    this.filteredQuestions = examQuestions;
    
    // Resume timer if exists
    const sessionKey = this.currentExamName || this.currentExamYear;
    let savedTime = 0;
    try { 
        const states = JSON.parse(localStorage.getItem("yds_exam_timers")) || {};
        savedTime = states[sessionKey] || 0;
    } catch (e) {}
    this.examTimerSeconds = savedTime;

    // Find first unsolved question
    this.currentIndex = 0;
    for (let i = 0; i < this.filteredQuestions.length; i++) {
        if (!this.userAnswers[this.filteredQuestions[i].id]) {
            this.currentIndex = i;
            break;
        }
    }

    // Filtreleri sıfırla
    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");
    const catSelect = document.getElementById("categoryFilter");
    const stSelect = document.getElementById("statusFilter");
    const yrSelect = document.getElementById("yearFilter");

    if (kwInput) kwInput.value = "";
    if (clearBtn) clearBtn.classList.add("hidden");
    if (catSelect) catSelect.value = "all";
    if (stSelect) stSelect.value = "all";
    if (yrSelect) yrSelect.value = "all";
    this.activeKeyword = "";
    this._lastHasFilter = false;

    // Denemenin kendi kategorileriyle dropdown'ı doldur
    this.populateFilterDropdowns(examQuestions);

    // Soru çözüm ekranını göster
    this.showQuestionView("exam");

    // Üst bannerı göster
    const banner = document.getElementById("examModeBanner");
    const titleEl = document.getElementById("activeExamTitle");
    if (banner) banner.classList.remove("hidden");
    if (titleEl) titleEl.textContent = title;

    this.updateExamProgressBanner();

    // Akıllı süreyi başlat (ilk soru cevaplanmamışsa süre akar, çözülmüşse duraklatılır)
    const currentQ = this.filteredQuestions[this.currentIndex];
    if (currentQ && this.userAnswers[currentQ.id]) {
      this.pauseExamSmartTimer();
    } else {
      this.resumeExamSmartTimer();
    }

    // Topluluk soru istatistiklerini bu deneme için tek seferde önceden çek (Firestore kota tasarrufu: tek doküman)
    const testId = window.questionStatsService?.resolveTestId(examQuestions[0]);
    if (testId) {
      window.questionStatsService?.fetchTestStats(testId).then(() => {
        const curQ = this.filteredQuestions[this.currentIndex];
        if (curQ) {
          this.updateQuestionStatsBadge(curQ);
        }
      }).catch(() => {});
    }

    this.updateFilterStatusBadge();
    this.renderQuestion();
    this.renderQuestionGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exitExamMode() {
    if (this.isExamMode) {
      const confirmExit = confirm("Deneme sınavından çıkmak istediğinize emin misiniz? Verdiğiniz cevaplar kaydedilecek ve ana menüye döneceksiniz.");
      if (!confirmExit) return;
      
      // Save timer progress
      const key = this.currentExamName || this.currentExamYear;
      if (key) {
        let states = {};
        try { states = JSON.parse(localStorage.getItem("yds_exam_timers")) || {}; } catch (e) {}
        states[key] = this.examTimerSeconds;
        localStorage.setItem("yds_exam_timers", JSON.stringify(states));
      }
    }

    this.stopExamSmartTimer();
    this.isExamMode = false;
    this.currentExamYear = null;

    document.getElementById("examModeBanner")?.classList.add("hidden");
    const yrSelect = document.getElementById("yearFilter");
    if (yrSelect) yrSelect.value = "all";
    this.applyFilters();
    this.showHomeView();
  }

  updateExamProgressBanner() {
    const badge = document.getElementById("activeExamProgressBadge");
    if (badge && this.isExamMode) {
      badge.textContent = `Soru ${this.currentIndex + 1} / ${this.filteredQuestions.length}`;
    }
  }

  // --- Sınav Karnesi & Sonuç Raporu ---
  showExamScorecard(targetExamKey = null) {
    let isViewingPast = false;
    let questions = [];
    let year = 2024;
    let examTitle = "";

    if (targetExamKey) {
      // Geçmiş tamamlanmış bir sınavın karnesini görüntülüyoruz
      isViewingPast = true;
      questions = window.questionRepo ? window.questionRepo.getByExam(targetExamKey) : [];
      if (!questions || questions.length === 0) {
        questions = window.questionRepo ? window.questionRepo.getByYear(parseInt(targetExamKey) || 2024) : [];
      }
      year = questions[0]?.year || 2024;
      examTitle = targetExamKey;
      this.currentExamName = targetExamKey;
      this.currentExamYear = year;
    } else {
      // Aktif sınav oturumunu sonlandırıp karneye bakıyoruz
      if (this.isExamMode) {
        const confirmFinish = confirm(
          "Deneme Sınavını Sonlandırmak Üzeresiniz!\n\n" +
          "Karnenizi görüntülediğinizde deneme sınavınız sonlandırılacak, resmi puanınız ve analizleriniz hesaplanacaktır. " +
          "Daha sonra kaldığınız yerden teste devam edemezsiniz.\n\n" +
          "Sınavı bitirip sonuçlarınızı görmek istiyor musunuz?"
        );
        if (!confirmFinish) {
          return;
        }
      }

      this.stopExamSmartTimer();
      this.isExamMode = false;
      document.getElementById("examModeBanner")?.classList.add("hidden");

      year = this.currentExamYear || (this.filteredQuestions[0]?.year) || 2024;
      questions = this.filteredQuestions.length > 0 ? this.filteredQuestions : (window.questionRepo ? window.questionRepo.getByYear(year) : []);
      examTitle = this.currentExamName || `${year} YDS Tam Deneme Sınavı`;
    }

    this.lockScroll();

    const totalQuestions = questions.length || 80;
    const answeredList = questions.map(q => this.examAnswers[q.id] || this.userAnswers[q.id]).filter(Boolean);
    const totalAnswered = answeredList.length;
    const correctCount = answeredList.filter(a => a.isCorrect).length;
    const wrongCount = answeredList.filter(a => !a.isCorrect).length;
    const blankCount = totalQuestions - totalAnswered;

    // Tahmini YDS Puanı: Doğru Sayısı x 1.25 (100 üzerinden)
    const ydsScore = Math.round(correctCount * 1.25 * 100) / 100;

    // Resmi YDS Seviyesi
    let levelText = "E Seviyesi (50-59)";
    let levelColor = "bg-amber-600";
    if (ydsScore >= 90) {
      levelText = "A Seviyesi (90-100) - Mükemmel";
      levelColor = "bg-emerald-600";
    } else if (ydsScore >= 80) {
      levelText = "B Seviyesi (80-89) - Çok Başarılı";
      levelColor = "bg-blue-600";
    } else if (ydsScore >= 70) {
      levelText = "C Seviyesi (70-79) - Başarılı";
      levelColor = "bg-indigo-600";
    } else if (ydsScore >= 60) {
      levelText = "D Seviyesi (60-69) - Orta Seviye";
      levelColor = "bg-yellow-600";
    } else if (ydsScore < 50) {
      levelText = "Geliştirilmeli (<50 Puan)";
      levelColor = "bg-rose-600";
    }

    // Skor Karnesi Elemanlarını Doldur
    const nameEl = document.getElementById("scorecardExamName");
    const pointsEl = document.getElementById("scorecardPoints");
    const levelBadge = document.getElementById("scorecardLevelBadge");
    const percentBadge = document.getElementById("scorecardPercentBadge");
    const correctEl = document.getElementById("scorecardCorrect");
    const wrongEl = document.getElementById("scorecardWrong");
    const blankEl = document.getElementById("scorecardBlank");
    const netTimeEl = document.getElementById("scorecardNetTime");
    const avgTimeEl = document.getElementById("scorecardAvgPerQuestion");

    if (nameEl) nameEl.textContent = examTitle;
    if (pointsEl) pointsEl.textContent = ydsScore.toFixed(2);
    
    if (levelBadge) {
      levelBadge.textContent = levelText;
      levelBadge.className = `px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold text-white shadow-xs ${levelColor}`;
    }

    if (percentBadge) {
      const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      percentBadge.textContent = `%${accuracy} Başarı Oranı`;
    }

    if (correctEl) correctEl.textContent = correctCount;
    if (wrongEl) wrongEl.textContent = wrongCount;
    if (blankEl) blankEl.textContent = blankCount;

    // Süre hesabı
    const sessionKey = this.currentExamName || `${year} YDS`;
    let durationSecs = this.examTimerSeconds || 0;
    if (isViewingPast && this.examSessions[sessionKey]) {
      durationSecs = this.examSessions[sessionKey].netSeconds || 0;
    }

    const netTimeStr = this.formatDuration(durationSecs);
    if (netTimeEl) netTimeEl.textContent = netTimeStr;

    const avgSeconds = totalAnswered > 0 ? Math.round(durationSecs / totalAnswered) : 0;
    if (avgTimeEl) avgTimeEl.textContent = `${avgSeconds} sn / soru`;

    // Soru Tipi Bazlı Başarı Analizi
    const catContainer = document.getElementById("scorecardCategoryList");
    if (catContainer) {
      catContainer.innerHTML = "";
      const catMap = {};
      questions.forEach(q => {
        const cat = q.category || "Genel";
        if (!catMap[cat]) catMap[cat] = { total: 0, correct: 0 };
        catMap[cat].total++;
        const ans = this.examAnswers[q.id] || this.userAnswers[q.id];
        if (ans?.isCorrect) {
          catMap[cat].correct++;
        }
      });

      Object.entries(catMap).forEach(([catName, data]) => {
        const pct = Math.round((data.correct / data.total) * 100);
        const row = document.createElement("div");
        row.className = "space-y-1";
        row.innerHTML = `
          <div class="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>${catName}</span>
            <span>${data.correct} / ${data.total} (%${pct})</span>
          </div>
          <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div class="h-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'} transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        `;
        catContainer.appendChild(row);
      });
    }

    // Oturumu kaydet (aktif sınav tamamlandığında)
    if (!isViewingPast) {
      this.examSessions[sessionKey] = {
        exam: sessionKey,
        year: year,
        score: ydsScore,
        correct: correctCount,
        wrong: wrongCount,
        blank: blankCount,
        netSeconds: durationSecs,
        timestamp: Date.now()
      };
      this.saveExamSessions();
      this.renderYearExamCards();

      // Topluluk soru istatistiklerini Firestore'a atomik batch olarak gönder (Fire-and-forget)
      if (questions && questions.length > 0) {
        const examResults = [];
        questions.forEach(q => {
          const ans = this.examAnswers[q.id] || this.userAnswers[q.id];
          if (ans) {
            examResults.push({
              questionId: q.id,
              isCorrect: !!ans.isCorrect
            });
          }
        });
        if (examResults.length > 0) {
          const testId = window.questionStatsService?.resolveTestId(questions[0]);
          if (testId) {
            window.questionStatsService?.submitTestStats(testId, examResults);
          }
        }
      }
    }

    // Reklam gösterimi
    if (!isViewingPast) {
      window.ydsAdService?.showInterstitial();
    }

    // Modalı aç
    document.getElementById("examScorecardModal")?.classList.remove("hidden");
  }

  closeExamScorecard() {
    this.unlockScroll();
    document.getElementById("examScorecardModal")?.classList.add("hidden");

    // Sınav modundan tamamen çık ve ana menüye dön
    this.stopExamSmartTimer();
    this.isExamMode = false;
    this.currentExamYear = null;
    document.getElementById("examModeBanner")?.classList.add("hidden");
    
    const yrSelect = document.getElementById("yearFilter");
    if (yrSelect) yrSelect.value = "all";
    this.applyFilters();
    this.showHomeView();
  }

  reviewWrongQuestions() {
    this.unlockScroll();
    document.getElementById("examScorecardModal")?.classList.add("hidden");
    this.stopExamSmartTimer();
    this.isExamMode = false;
    document.getElementById("examModeBanner")?.classList.add("hidden");

    const target = this.currentExamName || this.currentExamYear || 2024;
    const questions = this.currentExamName 
      ? window.questionRepo.getByExam(this.currentExamName)
      : window.questionRepo.getByYear(this.currentExamYear || 2024);

    const wrongOnly = questions.filter(q => (this.examAnswers[q.id] || this.userAnswers[q.id]) && !(this.examAnswers[q.id] || this.userAnswers[q.id]).isCorrect);
    if (wrongOnly.length === 0) {
      alert("Tebrikler! Bu denemede yanlış yaptığınız soru bulunmuyor.");
      this.showHomeView();
      return;
    }

    this.showQuestionView("practice");
    this.filteredQuestions = wrongOnly;
    this.currentIndex = 0;
    this.renderQuestion();
    this.renderQuestionGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  restartCurrentExam() {
    const confirmRestart = confirm("Bu deneme sınavındaki tüm cevaplarınızı sıfırlayıp baştan başlamak istediğinize emin misiniz?");
    if (!confirmRestart) return;

    this.unlockScroll();
    document.getElementById("examScorecardModal")?.classList.add("hidden");
    const target = this.currentExamName || this.currentExamYear || 2021;
    const questions = this.currentExamName 
      ? window.questionRepo.getByExam(this.currentExamName)
      : window.questionRepo.getByYear(target);

    // Bu sınavın cevaplarını sil
    questions.forEach(q => {
      delete this.userAnswers[q.id];
      delete this.examAnswers[q.id];
    });
    this.saveUserAnswers();
    this.saveExamAnswers();

    delete this.examSessions[this.currentExamName];
    delete this.examSessions[target];
    this.saveExamSessions();

    this.startExamMode(target);
  }

  // --- Filtre Dropdown Doldurma ---
  populateFilterDropdowns(pool) {
    const catSelect = document.getElementById("categoryFilter");
    const sourcePool = pool || this.activePool || this.allQuestions || [];

    if (catSelect) {
      catSelect.innerHTML = '<option value="all">Tüm Konular</option>';
      const categories = [...new Set(sourcePool.map(q => q.category).filter(Boolean))].sort();
      categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });
      catSelect.value = "all";
    }
  }

  // --- PDF İçe Aktarma Mantığı ---
  async handlePDFImport(file) {
    const statusBox = document.getElementById("pdfImportStatus");
    const statusText = document.getElementById("pdfStatusText");
    const progressBar = document.getElementById("pdfProgressBar");

    if (statusBox) statusBox.classList.remove("hidden");
    if (statusText) statusText.textContent = "PDF dosyası okunuyor...";
    if (progressBar) progressBar.style.width = "30%";

    try {
      const { fullText } = await window.ydsPDFParser.extractTextFromPDF(file);
      if (statusText) statusText.textContent = "YDS soruları ayrıştırılıyor...";
      if (progressBar) progressBar.style.width = "70%";

      const examName = file.name.replace(/\.[^/.]+$/, "");
      const customAnswers = document.getElementById("pdfAnswerKeyInput")?.value || "";
      let parsedQuestions = window.ydsPDFParser.parseQuestions(fullText, examName);

      if (customAnswers.trim()) {
        parsedQuestions = window.ydsPDFParser.applyCustomAnswerKey(parsedQuestions, customAnswers);
      }

      if (parsedQuestions.length === 0) {
        alert("PDF'te uygun YDS soru formatı tespit edilemedi. Lütfen geçerli bir YDS Formatında veya YDS kitapçığı yüklediğinizden emin olun.");
        if (statusBox) statusBox.classList.add("hidden");
        return;
      }

      const addedCount = window.questionRepo.addQuestions(parsedQuestions);
      if (progressBar) progressBar.style.width = "100%";
      if (statusText) statusText.textContent = `${addedCount} adet yeni soru başarıyla soru bankasına eklendi!`;

      // Uygulamayı güncelle
      this.allQuestions = window.PRACTICE_YDS_QUESTIONS || [];
      this.populateFilterDropdowns();
      this.applyFilters();
      this.updateStats();

      setTimeout(() => {
        document.getElementById("pdfImportModal")?.classList.add("hidden");
        this.unlockScroll();
        if (statusBox) statusBox.classList.add("hidden");
      }, 1500);

    } catch (err) {
      console.error("PDF yükleme hatası:", err);
      alert("PDF işlenirken bir hata oluştu: " + err.message);
      if (statusBox) statusBox.classList.add("hidden");
    }
  }

  // --- Ana Menü, Sayfa Gezinimi ve Dashboard ---
  goBack() {
    if (this.currentView === "report" && this.previousView === "question") {
      this.showQuestionView(this.isExamMode ? "exam" : "practice");
    } else if (this.isExamMode && this.currentView === "question") {
      this.exitExamMode();
    } else {
      this.showHomeView();
    }
  }

  saveExamCurrentProgress() {
    if (!this.isExamMode) return;
    const sessionKey = this.currentExamName || this.currentExamYear;
    if (sessionKey) {
      try {
        const timers = JSON.parse(localStorage.getItem("yds_exam_timers")) || {};
        timers[sessionKey] = this.examTimerSeconds;
        localStorage.setItem("yds_exam_timers", JSON.stringify(timers));

        const positions = JSON.parse(localStorage.getItem("yds_exam_positions")) || {};
        positions[sessionKey] = this.currentIndex;
        localStorage.setItem("yds_exam_positions", JSON.stringify(positions));
      } catch (e) {}
    }
  }

  handleHeaderHomeClick() {
    if (this.isExamMode && this.currentView === "question") {
      this.saveExamCurrentProgress();
      this.pauseExamSmartTimer();
      this.showHomeView();
    } else {
      this.showHomeView();
    }
  }

  showHomeView() {
    this.flushPendingStats();
    this.cleanupSpecialQuestionModes?.();
    if (this.isExamMode) {
      this.pauseExamSmartTimer();
      document.getElementById("examModeBanner")?.classList.add("hidden");
    }

    const homeView = document.getElementById("homeView");
    const questionView = document.getElementById("questionView");
    const reportView = document.getElementById("reportView");

    if (homeView) homeView.classList.remove("hidden");
    if (questionView) questionView.classList.add("hidden");
    if (reportView) reportView.classList.add("hidden");

    // Header ve Filtre Çubuğu: Ana Menü tertemiz ve sade olmalı
    document.getElementById("headerSearchContainer")?.classList.add("hidden");
    document.getElementById("filterBarContainer")?.classList.add("hidden");
    document.getElementById("searchScopeFilterWrapper")?.classList.add("hidden");
    document.getElementById("searchScopeFilterWrapper")?.classList.remove("flex");
    document.getElementById("headerBackHomeBtn")?.classList.add("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.remove("inline-flex");
    document.getElementById("headerBrandTitle")?.classList.remove("hidden");
    document.getElementById("navReportBtn")?.classList.add("hidden");
    document.getElementById("navReportBtn")?.classList.remove("inline-flex");

    const lastViewBeforeHome = this.currentView;
    this.previousView = this.currentView;
    const poolLabelH = document.getElementById("poolBtnLabel");
    if (poolLabelH) {
      poolLabelH.textContent = "Kelime Havuzum";
    }
    this.currentView = "home";
    this.expandHeaderBars?.();
    this.updateHomeStats();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Soru çözme veya kelime çalışmasından ana menüye dönerken doğal geçiş reklamı
    if (lastViewBeforeHome === "question" || lastViewBeforeHome === "vocab") {
      window.ydsAdService?.onNavigateHome();
    }

    // Ana ekranda alt banner reklamının aktif kalmasını sağla
    window.ydsAdService?.showBanner();
  }

  showQuestionView(mode = "practice") {
    window.ydsAdService?.resetQuestionSession();
    window.ydsAdService?.showBanner();
    const homeView = document.getElementById("homeView");
    const questionView = document.getElementById("questionView");
    const reportView = document.getElementById("reportView");

    if (homeView) homeView.classList.add("hidden");
    if (questionView) questionView.classList.remove("hidden");
    if (reportView) reportView.classList.add("hidden");

    // Header ve Filtre Çubuğu: Soru Çözüm Modunda Arama ve Filtreler aktif
    document.getElementById("headerSearchContainer")?.classList.remove("hidden");
    document.getElementById("filterBarContainer")?.classList.remove("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.remove("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.add("inline-flex");
    document.getElementById("headerBrandTitle")?.classList.add("hidden");
    document.getElementById("navReportBtn")?.classList.remove("hidden");
    document.getElementById("navReportBtn")?.classList.add("inline-flex");

    const yearWrapper = document.getElementById("yearFilterWrapper");
    if (yearWrapper) {
      if (mode === "exam") {
        yearWrapper.classList.add("hidden");
        yearWrapper.classList.remove("flex");
      } else {
        yearWrapper.classList.remove("hidden");
        yearWrapper.classList.add("flex");
      }
    }

    const scopeWrapper = document.getElementById("searchScopeFilterWrapper");
    if (scopeWrapper) {
      if (mode === "practice") {
        scopeWrapper.classList.remove("hidden");
        scopeWrapper.classList.add("flex");
      } else {
        scopeWrapper.classList.add("hidden");
        scopeWrapper.classList.remove("flex");
      }
    }

    this.previousView = this.currentView;
    const poolLabelQ = document.getElementById("poolBtnLabel");
    if (poolLabelQ) {
      poolLabelQ.classList.add("hidden");
      poolLabelQ.classList.remove("inline");
    }
    this.currentView = "question";
    this.expandHeaderBars?.();

    const modeBadge = document.getElementById("questionViewModeBadge");
    if (modeBadge) {
      if (mode === "practice") {
        modeBadge.textContent = "Alıştırma Modu (Bağımsız Havuz)";
        modeBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300";
      } else if (mode === "exam") {
        modeBadge.textContent = this.currentExamName || (this.currentExamYear ? this.currentExamYear + ' YDS' : 'YDS Tam Deneme');
        modeBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300";
      } else {
        modeBadge.textContent = "Soru Bankası";
        modeBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300";
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showReportView() {
    if (this.isExamMode) {
      this.pauseExamSmartTimer();
    }

    const homeView = document.getElementById("homeView");
    const questionView = document.getElementById("questionView");
    const reportView = document.getElementById("reportView");

    if (homeView) homeView.classList.add("hidden");
    if (questionView) questionView.classList.add("hidden");
    if (reportView) reportView.classList.remove("hidden");

    // Header ve Filtre Çubuğu: Rapor ekranında arama & filtre yok, Ana Menüye dönüş var
    document.getElementById("headerSearchContainer")?.classList.add("hidden");
    document.getElementById("filterBarContainer")?.classList.add("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.remove("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.add("inline-flex");
    document.getElementById("headerBrandTitle")?.classList.remove("hidden");
    document.getElementById("navReportBtn")?.classList.add("hidden");
    document.getElementById("navReportBtn")?.classList.remove("inline-flex");

    this.previousView = this.currentView;
    const poolLabelR = document.getElementById("poolBtnLabel");
    if (poolLabelR) {
      poolLabelR.classList.add("hidden");
      poolLabelR.classList.remove("inline");
    }
    this.currentView = "report";
    this.renderReportView();
    window.ydsAdService?.showBanner();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateHomeStats() {
    const homeName = document.getElementById("homeUserNameText");
    if (homeName) homeName.textContent = this.userName || "Aday";

    const combinedAnswers = { ...(this.practiceAnswers || {}), ...(this.examAnswers || {}) };
    const answeredEntries = Object.values(combinedAnswers);
    const totalSolved = answeredEntries.length;
    const totalCorrect = answeredEntries.filter(a => a && a.isCorrect).length;
    const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
    const totalExams = Object.keys(this.examSessions).length;

    const kpiSolved = document.getElementById("homeKpiSolved");
    const kpiAccuracy = document.getElementById("homeKpiAccuracy");
    const kpiExams = document.getElementById("homeKpiExams");

    if (kpiSolved) kpiSolved.textContent = totalSolved;
    if (kpiAccuracy) kpiAccuracy.textContent = `%${accuracy}`;
    if (kpiExams) kpiExams.textContent = totalExams;

    // Günlük Seri, Son Oturum, Zayıf Konu Koçu ve Paket 2 Kartlarını güncelle
    this.renderStreakAndGoalUI();
    this.updateContinueSessionUI();
    this.updateWeakTopicCoachUI();
    this.updateYdsScoreTargetUI?.();
    this.updateSprintHomeBadgeUI?.();
    this.updateMistakeMelterHomeUI?.();
  }

  initDailyTip() {
    const tipEl = document.getElementById("homeDailyTipText");
    if (!tipEl) return;
    const tips = [
      "Zıtlık bağlaçlarında (Although, While, Even though, In spite of) iki cümlenin anlam kutuplarına (+ / -) bakın. Biri başarı veya olumluluk anlatıyorsa diğeri engel veya zorluk anlatmalıdır.",
      "Çeviri sorularında cümlenin 'Ana Yüklemini (Main Verb)' ve 'Öznesini (Subject)' tespit edin. Şıklarda bu iki öğeyi tam karşılamayanları hemen eleyerek sürenizi yarı yarıya kısaltabilirsiniz.",
      "Paragraf tamamlama sorularında boşluğun hemen öncesindeki ve sonrasındaki referans zamirlere (this, these, such, however, therefore) odaklanın. Kopukluğu bu zamirler giderir.",
      "Preposition (edat) sorularında boşluktan önceki fiili veya boşluktan sonraki ismi kontrol edin; 'depend on', 'contribute to', 'prevent from' gibi kalıplaşmış edatlar belirleyicidir.",
      "Zaman (Tense) uyumu kuralını unutmayın: Yan cümlecikte 'Past' bir yapı varsa ana cümlede de 'Past' arayın; 'Since' kuralı hariç 'Present' ve 'Past' tense'ler doğrudan birbiriyle bağlanmaz.",
      "Akışı bozan cümle (Irrelevant Sentence) sorularında paragraftaki konunun odağını veya bakış açısını değiştiren, aşırı özele veya genele kayan cümleyi arayın.",
      "Restatement (Anlamca En Yakın) sorularında cümlenin kesinlik derecesine (must, may, might, certainly, probably) çok dikkat edin; olasılık anlatan cümle kesinlik şıkkıyla eşleşmez.",
      "Diyalog tamamlama sorularında boşluktan hemen sonraki kişinin verdiği tepkiye ve soruya dikkat edin. Verilen yanıt, boşluktaki cümlenin niteliğini doğrudan ele verir.",
      "Kelime sorularında özellikle Phrasal Verbleri (bring about, give up, put off, call off) ve sıfat-isim tamlamalarını eş anlamlılarıyla birlikte tekrar etmeyi unutmayın."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipEl.textContent = `"${randomTip}"`;
  }

  // --- Karne & Rapor Ekranı Hesaplamaları ---
  renderReportView() {
    const combinedAnswers = { ...(this.practiceAnswers || {}), ...(this.examAnswers || {}) };
    const answeredEntries = Object.values(combinedAnswers);
    const totalSolved = answeredEntries.length;
    const totalCorrect = answeredEntries.filter(a => a && a.isCorrect).length;
    const totalWrong = totalSolved - totalCorrect;
    const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

    const repTotal = document.getElementById("repTotalSolved");
    const repCorr = document.getElementById("repCorrectCount");
    const repWr = document.getElementById("repWrongCount");
    const repRate = document.getElementById("repSuccessRate");

    if (repTotal) repTotal.textContent = totalSolved;
    if (repCorr) repCorr.textContent = totalCorrect;
    if (repWr) repWr.textContent = totalWrong;
    if (repRate) repRate.textContent = `%${accuracy}`;

    const repLearnedTotal = document.getElementById("repLearnedTotal");
    const repLearnedWeek = document.getElementById("repLearnedWeek");
    
    if (repLearnedTotal) repLearnedTotal.textContent = this.masteredWords.length;
    
    if (repLearnedWeek) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyCount = this.masteredWords.filter(item => {
         if (!item.date) return false;
         return new Date(item.date) >= oneWeekAgo;
      }).length;
      repLearnedWeek.textContent = weeklyCount;
    }

    this.updateMistakeMelterHomeUI?.();
    this.renderWeeklyActivityChart?.();

    // Kategori Dağılım Çubukları
    this.renderCategoryReportBars();

    // Ödüllü Reklam Taktik Durumu
    this.tacticsUnlocked = localStorage.getItem("yds_tactics_unlocked") === "true";
    const lockedBanner = document.getElementById("lockedTacticsBanner");
    const unlockedBanner = document.getElementById("unlockedTacticsBanner");

    if (this.tacticsUnlocked) {
      if (lockedBanner) lockedBanner.classList.add("hidden");
      if (unlockedBanner) unlockedBanner.classList.remove("hidden");
      this.renderPersonalizedTactics();
    } else {
      if (lockedBanner) lockedBanner.classList.remove("hidden");
      if (unlockedBanner) unlockedBanner.classList.add("hidden");
    }
  }

  renderCategoryReportBars() {
    const container = document.getElementById("repCategoryBarsList");
    if (!container) return;
    container.innerHTML = "";

    const questionMap = new Map();
    if (window.questionRepo && typeof window.questionRepo.getAll === "function") {
      window.questionRepo.getAll().forEach(q => questionMap.set(q.id, q));
    }
    (this.allQuestions || []).forEach(q => questionMap.set(q.id, q));
    if (window.PRACTICE_YDS_QUESTIONS) {
      window.PRACTICE_YDS_QUESTIONS.forEach(q => questionMap.set(q.id, q));
    }

    const standardCategories = [
      { name: "Kelime Bilgisi (Vocabulary & Phrasal Verbs)", match: ["kelime", "vocabulary", "phrasal"] },
      { name: "Dilbilgisi & Zamanlar (Grammar & Tenses)", match: ["dilbilgisi", "grammar", "tenses", "preposition"] },
      { name: "Cloze Test (Parça İçi Boşluk)", match: ["cloze"] },
      { name: "Cümle Tamamlama (Sentence Completion)", match: ["cümle tamamlama", "sentence"] },
      { name: "Çeviri (İngilizce ↔ Türkçe)", match: ["çeviri", "translation"] },
      { name: "Okuma Parçaları (Reading Passages)", match: ["okuma", "parça", "reading"] },
      { name: "Diyalog Tamamlama (Dialogue)", match: ["diyalog", "dialogue"] },
      { name: "Anlamca En Yakın Cümle (Restatement)", match: ["anlamca en yakın", "restatement"] },
      { name: "Paragraf Tamamlama (Paragraph Completion)", match: ["paragraf tamamlama"] },
      { name: "Anlatım Bütünlüğü / Akışı Bozan (Irrelevant)", match: ["anlatım", "akışı bozan", "irrelevant"] }
    ];

    const statsByCategory = standardCategories.map(cat => ({
      ...cat,
      total: 0,
      correct: 0
    }));

    let otherTotal = 0;
    let otherCorrect = 0;

    const combinedAnswers = { ...(this.practiceAnswers || {}), ...(this.examAnswers || {}) };

    Object.entries(combinedAnswers).forEach(([qId, ans]) => {
      const q = questionMap.get(qId);
      if (!q) return;

      const qCat = ((q.category || "") + " " + (q.subCategory || "")).toLowerCase();
      let matched = false;

      for (const stat of statsByCategory) {
        if (stat.match.some(keyword => qCat.includes(keyword))) {
          stat.total++;
          if (ans.isCorrect) stat.correct++;
          matched = true;
          break;
        }
      }

      if (!matched) {
        otherTotal++;
        if (ans.isCorrect) otherCorrect++;
      }
    });

    const totalAnswered = Object.keys(combinedAnswers).length;
    if (totalAnswered === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-gray-400 text-xs sm:text-sm">
          Henüz soru çözülmedi. Alıştırma veya deneme çözdükçe soru tipi başarı dağılımınız burada görüntülenecektir.
        </div>
      `;
      return;
    }

    statsByCategory.forEach(stat => {
      if (stat.total === 0) return;
      const pct = Math.round((stat.correct / stat.total) * 100);
      let barColor = "bg-rose-500";
      let badgeTextColor = "text-rose-600 dark:text-rose-400";
      if (pct >= 70) {
        barColor = "bg-emerald-500";
        badgeTextColor = "text-emerald-600 dark:text-emerald-400";
      } else if (pct >= 50) {
        barColor = "bg-amber-500";
        badgeTextColor = "text-amber-600 dark:text-amber-400";
      }

      const row = document.createElement("div");
      row.className = "space-y-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/60";
      row.innerHTML = `
        <div class="flex items-center justify-between gap-2 text-xs sm:text-sm">
          <span class="font-bold text-gray-800 dark:text-gray-200">
            ${stat.name}
          </span>
          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="font-extrabold ${badgeTextColor}">
              ${stat.correct} / ${stat.total} Doğru (%${pct})
            </span>
            <button type="button" data-practice-cat="${stat.match[0]}" class="practice-cat-btn px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-600 dark:bg-indigo-950/80 dark:hover:bg-indigo-600 text-indigo-700 hover:text-white dark:text-indigo-300 dark:hover:text-white text-[11px] font-extrabold transition active:scale-95">
              Bu Konuyu Çalış →
            </button>
          </div>
        </div>
        <div class="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full rounded-full ${barColor} transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      `;
      row.querySelector(".practice-cat-btn")?.addEventListener("click", () => {
        this.startWeakTopicPractice(stat.match[0]);
      });
      container.appendChild(row);
    });

    if (otherTotal > 0) {
      const pct = Math.round((otherCorrect / otherTotal) * 100);
      const row = document.createElement("div");
      row.className = "space-y-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/60";
      row.innerHTML = `
        <div class="flex items-center justify-between text-xs sm:text-sm">
          <span class="font-bold text-gray-800 dark:text-gray-200">Diğer Soru Tipleri</span>
          <span class="font-extrabold text-indigo-600 dark:text-indigo-400">
            ${otherCorrect} / ${otherTotal} Doğru (%${pct})
          </span>
        </div>
        <div class="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full rounded-full bg-indigo-500 transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      `;
      container.appendChild(row);
    }
  }

  // --- Ödüllü Reklam ile Taktik Rehberini Açma ---
  requestRewardedTactics() {
    if (!window.ydsAdService) {
      this.unlockPersonalizedTactics();
      return;
    }

    window.ydsAdService.showRewarded(() => {
      this.unlockPersonalizedTactics();
    });
  }

  unlockPersonalizedTactics() {
    localStorage.setItem("yds_tactics_unlocked", "true");
    this.tacticsUnlocked = true;

    const lockedBanner = document.getElementById("lockedTacticsBanner");
    const unlockedBanner = document.getElementById("unlockedTacticsBanner");

    if (lockedBanner) lockedBanner.classList.add("hidden");
    if (unlockedBanner) unlockedBanner.classList.remove("hidden");

    this.renderPersonalizedTactics();
    this.playCorrectSound();
    alert("Harika! Ödüllü video izlendi ve Kişiselleştirilmiş Hata & Sınav Taktikleri Rehberinizin kilidi açıldı!");
  }

  renderPersonalizedTactics() {
    const container = document.getElementById("unlockedTacticsContent");
    if (!container) return;

    const questionMap = new Map();
    (this.allQuestions || []).forEach(q => questionMap.set(q.id, q));
    if (window.PRACTICE_YDS_QUESTIONS) {
      window.PRACTICE_YDS_QUESTIONS.forEach(q => questionMap.set(q.id, q));
    }

    const wrongList = [];
    Object.entries(this.userAnswers).forEach(([qId, ans]) => {
      if (!ans.isCorrect) {
        const q = questionMap.get(qId);
        if (q) wrongList.push({ id: qId, ans, q });
      }
    });

    if (wrongList.length === 0) {
      container.innerHTML = `
        <div class="space-y-4">
          <div class="p-3.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
            <h5 class="font-extrabold text-amber-300 text-sm sm:text-base">Tebrikler! Henüz Yanlış Cevabınız Bulunmuyor.</h5>
            <p class="mt-1 text-xs sm:text-sm text-indigo-100">
              YDS hazırlığınız harika gidiyor! Sınavda 80+ üstü puanı garantilemek için altın değerindeki bu 4 evrensel YDS taktiğini mutlaka uygulayın:
            </p>
          </div>
          
          <div class="space-y-3">
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="font-bold text-amber-300 block">1. Çeviri Sorularında "Özne + Yüklem" Formülü:</span>
              <span class="text-xs text-indigo-100">YDS Formatında çeviri sorularında cümlenin ana yüklemini ve öznesini bulun. 5 şıktan en az 3'ü yalnızca yüklemin zamanı (Tense) veya öznenin eksikliği nedeniyle anında elenir. Soruyu 30 saniyede çözebilirsiniz.</span>
            </div>
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="font-bold text-amber-300 block">2. Zıtlık Bağlaçlarında Kutup (+ / -) Analizi:</span>
              <span class="text-xs text-indigo-100">Although, While, Despite gibi zıtlık bağlaçlarında iki cümlenin anlam kutbunu belirleyin. Bir taraf pozitif bir gelişmeden bahsediyorsa diğer taraf kesinlikle engel veya negatif bir durum içermelidir.</span>
            </div>
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="font-bold text-amber-300 block">3. Paragraf Sorularında Kesinlik Tuzakları:</span>
              <span class="text-xs text-indigo-100">Şıklarda "all, always, never, solely, only, entirely" gibi aşırı kesinlik belirten sözcükler varsa dikkatli olun. Parçada açıkça belirtilmedikçe bu şıklar neredeyse her zaman çeldiricidir. YDS Formatında ılımlı (may, might, likely, tend to) şıkları sever.</span>
            </div>
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="font-bold text-amber-300 block">4. Akıllı Zaman Yönetimi:</span>
              <span class="text-xs text-indigo-100">YDS 80 soru ve 180 dakikadır. İlk 36 soruyu (Kelime, Dilbilgisi, Cloze, Cümle Tamamlama) 45-50 dakikada tamamlayıp, kalan süreyi okuma parçalarına ayırmak sınav başarısının anahtarıdır.</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const categoryMistakes = {};
    wrongList.forEach(item => {
      const cat = item.q.category || "Genel";
      categoryMistakes[cat] = (categoryMistakes[cat] || 0) + 1;
    });

    const sortedWeak = Object.entries(categoryMistakes).sort((a, b) => b[1] - a[1]);

    let tacticsHtml = `
      <div class="space-y-4">
        <div class="p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/30">
          <h5 class="font-extrabold text-amber-300 text-sm sm:text-base">Kişiselleştirilmiş Hata Analiziniz (${wrongList.length} Yanlış Tespit Edildi)</h5>
          <p class="mt-1 text-xs sm:text-sm text-indigo-100">
            Yapay zeka analiz motorumuz hata yaptığınız soruları kategorize etti. İşte en çok puan kaybettiğiniz alanlar ve nokta atışı çözüm reçeteleri:
          </p>
        </div>

        <div class="space-y-3">
    `;

    sortedWeak.forEach(([catName, count]) => {
      const lower = catName.toLowerCase();
      let tacticTitle = `${catName} (${count} Hata)`;
      let tacticBody = "";

      if (lower.includes("kelime") || lower.includes("vocabulary")) {
        tacticBody = "Kelimeleri tek başına Türkçe anlamıyla değil, yanındaki edatıyla (collocation) öğrenin. Örneğin 'rely ON', 'result IN/FROM', 'comply WITH'. Boşluktan sonraki edat veya isim, doğru cevabı ele verir. Hata yaptığınız kelimeleri 'Öğrenme Havuzu'na ekleyip flaş kart olarak tekrar edin.";
      } else if (lower.includes("dilbilgisi") || lower.includes("grammar") || lower.includes("zaman")) {
        tacticBody = "Zaman (Tense) uyumuna dikkat edin. Yan cümlede 'past' bir yapı varsa ana cümlede present/future aranmaz. Ayrıca 'Since' yapısı hariç Past Perfect (had V3) tek başına bir cümlede duramaz; mutlaka öncesinde Simple Past (V2) bir olay olmalıdır.";
      } else if (lower.includes("çeviri") || lower.includes("translation")) {
        tacticBody = "Çeviri sorularında tüm cümleyi çevirmeye kalkışmayın! Önce ana cümlenin yüklemini ve tense'ini bulun. Ardından özneyi bulun. Bu iki kural ile 5 seçenekten en az 3'ü saniyeler içinde elenir.";
      } else if (lower.includes("cümle tamamlama") || lower.includes("sentence")) {
        tacticBody = "Bağlacın türünü belirleyin: Zıtlık (Although/However) mı, Neden-Sonuç (Because/Therefore) mı? İki cümlenin kutuplarını (+ / -) eşleştirin ve şıklardaki referans zamirlere (they, this, such) dikkat edin.";
      } else if (lower.includes("okuma") || lower.includes("parça") || lower.includes("reading")) {
        tacticBody = "Önce paragrafı değil, soru kökünü okuyun. 'According to the passage' sorularında kendi yorumunuzu katmayın, sadece metindeki eşanlamlı kelimeyi (paraphrasing) arayın. 'Only, all, never' gibi radikal kelimeler içeren şıklardan uzak durun.";
      } else if (lower.includes("diyalog") || lower.includes("dialogue")) {
        tacticBody = "Boşluktan HEMEN SONRA gelen kişinin verdiği cevaba bakın. Karşı taraf 'I don't think so' diyorsa boşlukta bir fikir veya öneri cümlesi olmalıdır. Duygu ve nezaket derecesini eşleştirin.";
      } else if (lower.includes("anlatım") || lower.includes("akışı bozan") || lower.includes("irrelevant")) {
        tacticBody = "Her cümlenin ana fikrini tek bir kelimeyle özetleyin. Akışı bozan cümle aynı konudan bahsediyor gibi görünse de konunun yönünü (örneğin faydalarından bahsederken aniden maliyetine geçmek) değiştirir.";
      } else {
        tacticBody = "Bu soru tipinde şıkları doğrudan doğruya soru kökündeki anahtar kelimelerle eşleştirin. Çeldirici şıklar genellikle sorudaki kelimeleri birebir geçirip anlamı ters yüz eder; doğru cevap ise eş anlamlı kelimelerle ifade edilir.";
      }

      tacticsHtml += `
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
          <span class="font-extrabold text-amber-300 text-xs sm:text-sm block">${tacticTitle}</span>
          <p class="text-xs sm:text-sm text-indigo-100 leading-relaxed">${tacticBody}</p>
        </div>
      `;
    });

    tacticsHtml += `
        </div>
      </div>
    `;

    container.innerHTML = tacticsHtml;
  }

  // --- Alıştırmalık Sorular Modu (Denemelerden Tamamen Bağımsız Havuz) ---
  startPracticeMode() {
    this.cleanupSpecialQuestionModes?.();
    if (this.isExamMode) {
      this.stopExamSmartTimer();
      this.isExamMode = false;
      this.currentExamYear = null;
      document.getElementById("examModeBanner")?.classList.add("hidden");
    }

    this.isPracticeMode = true;

    const practiceQuestions = window.questionRepo ? window.questionRepo.getAlistirmaQuestions() : (window.PRACTICE_YDS_QUESTIONS || []).slice(0, 330);
    if (practiceQuestions.length === 0) {
      alert("Alıştırmalık soru havuzu yüklenemedi.");
      return;
    }
    this.activePool = practiceQuestions;

    // Alıştırma moduna girildiğinde daima taze alıştırma havuzu yüklenir (deneme soruları karışamaz)
    const shuffled = [...practiceQuestions].sort(() => Math.random() - 0.5);
    this.filteredQuestions = shuffled;
    this.currentIndex = 0;
    this.savedUnfilteredIndex = 0;
    this.practiceSessionActive = true;

    // Filtreleri sıfırla
    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");
    const catSelect = document.getElementById("categoryFilter");
    const stSelect = document.getElementById("statusFilter");
    const yrSelect = document.getElementById("yearFilter");

    if (kwInput) kwInput.value = "";
    if (clearBtn) clearBtn.classList.add("hidden");
    if (catSelect) catSelect.value = "all";
    if (stSelect) stSelect.value = "all";
    if (yrSelect) yrSelect.value = "all";
    const scSelect = document.getElementById("searchScopeFilter");
    if (scSelect) scSelect.value = "practice";
    this.activeKeyword = "";
    this._lastHasFilter = false;

    // Alıştırmanın kategorileriyle dropdown'ı doldur
    this.populateFilterDropdowns(practiceQuestions);

    // Topluluk soru istatistiklerini alıştırma havuzu için tek seferde arka planda çek (Firestore kota tasarrufu: tek doküman)
    window.questionStatsService?.fetchTestStats("practice_all").then(() => {
      const curQ = this.filteredQuestions[this.currentIndex];
      if (curQ) {
        this.updateQuestionStatsBadge(curQ);
      }
    }).catch(() => {});

    this.showQuestionView("practice");
    this.updateFilterStatusBadge();
    this.renderQuestion();
    this.renderQuestionGrid();
  }

  // --- Kullanıcı İsmi ve Onboarding ---
  openNameModal() {
    this.lockScroll();
    const modal = document.getElementById("namePromptModal");
    const input = document.getElementById("nameModalInput");
    if (modal) {
      modal.classList.remove("hidden");
      if (input) {
        input.value = this.userName || "";
        setTimeout(() => input.focus(), 200);
      }
    }
  }

  closeNameModal() {
    this.unlockScroll();
    document.getElementById("namePromptModal")?.classList.add("hidden");
  }

  saveNameModal() {
    const input = document.getElementById("nameModalInput");
    const name = input ? input.value.trim() : "";
    this.userName = name || "Aday";
    localStorage.setItem("yds_user_name", this.userName);

    const homeName = document.getElementById("homeUserNameText");
    if (homeName) homeName.textContent = this.userName;
    const settingsInput = document.getElementById("settingsNameInput");
    if (settingsInput) settingsInput.value = this.userName;

    this.closeNameModal();
  }

  // --- Uygulama Ayarları Modalı ---
  openSettingsModal() {
    this.lockScroll();
    this.updateAdFreeUI();
    const modal = document.getElementById("settingsModal");
    const input = document.getElementById("settingsNameInput");
    const soundToggle = document.getElementById("settingsSoundToggle");
    const autoPauseToggle = document.getElementById("settingsAutoPauseToggle");

    if (input) input.value = this.userName || "";
    if (soundToggle) soundToggle.checked = this.soundEnabled;
    if (autoPauseToggle) autoPauseToggle.checked = this.autoPauseEnabled;

    if (modal) modal.classList.remove("hidden");
  }

  closeSettingsModal() {
    this.unlockScroll();
    document.getElementById("settingsModal")?.classList.add("hidden");
  }

  // --- Reklamsız Mod (Ad-Free / Premium) Yönetimi ---
  openAdFreeModal() {
    this.lockScroll();
    this.updateAdFreeUI();
    this.loadStorePrice();
    const modal = document.getElementById("adFreeModal");
    if (modal) modal.classList.remove("hidden");
  }

  async loadStorePrice() {
    const isIOS = window.Capacitor?.getPlatform() === 'ios' || /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const Billing = isIOS 
      ? (window.Capacitor?.Plugins?.AppStoreBilling)
      : (window.Capacitor?.Plugins?.GooglePlayBilling);

    if (Billing && typeof Billing.getProductDetails === 'function') {
      try {
        const details = await Billing.getProductDetails({ productId: 'remove_ads' });
        if (details && details.formattedPrice) {
          const badge = document.getElementById("adFreePriceTag");
          if (badge) {
            badge.textContent = details.formattedPrice;
          }
        }
      } catch (e) {
        // Varsayılan fiyat zaten gösterimde
      }
    }
  }

  closeAdFreeModal(event) {
    if (event && event.target && event.target.closest && event.target.closest(".bg-white")) {
      return;
    }
    this.unlockScroll();
    const modal = document.getElementById("adFreeModal");
    if (modal) modal.classList.add("hidden");
  }

  updateAdFreeUI() {
    const isAdFree = !!(window.ydsAdService?.getAdFree());
    const badge = document.getElementById("adFreeStatusBadge");
    const desc = document.getElementById("adFreeStatusDesc");
    const inactiveBox = document.getElementById("adFreeInactiveContainer");
    const activeBox = document.getElementById("adFreeActiveContainer");

    if (badge) {
      if (isAdFree) {
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }

    if (desc) {
      desc.textContent = isAdFree 
        ? "Examgo Premium aktif. Tüm reklamlar kaldırıldı."
        : "Tüm banner ve geçiş reklamlarını kaldırın.";
    }

    if (inactiveBox && activeBox) {
      if (isAdFree) {
        inactiveBox.classList.add("hidden");
        activeBox.classList.remove("hidden");
      } else {
        inactiveBox.classList.remove("hidden");
        activeBox.classList.add("hidden");
      }
    }
  }

  async purchaseAdFree() {
    const isIOS = window.Capacitor?.getPlatform() === 'ios' || /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const Billing = isIOS
      ? (window.Capacitor?.Plugins?.AppStoreBilling)
      : (window.Capacitor?.Plugins?.GooglePlayBilling);
    const storeName = isIOS ? "App Store" : "Google Play";

    const btn = document.getElementById("purchaseAdFreeBtn");
    const priceTag = document.getElementById("adFreePriceTag");
    const currentPrice = priceTag ? priceTag.textContent : "₺23,99";

    if (Billing && typeof Billing.purchase === 'function') {
      try {
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = `<span class="flex items-center gap-2"><span>${storeName} Bağlanıyor...</span></span><span class="text-xs bg-black/20 px-2.5 py-1 rounded-full font-bold tracking-wide">${currentPrice}</span>`;
        }

        const res = await Billing.purchase({ productId: 'remove_ads' });

        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Reklamsız Sürüme Geç</span></span><span class="text-xs bg-black/20 px-2.5 py-1 rounded-full font-bold tracking-wide" id="adFreePriceTag">${currentPrice}</span>`;
        }

        if (res && (res.success || res.isAdFree)) {
          window.ydsAdService?.setAdFree(true);
          this.updateAdFreeUI();
          alert("Examgo Premium başarıyla satın alındı ve aktif edildi.");
        }
      } catch (err) {
        console.warn(`${storeName} satın alma hatası/iptal:`, err);
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Reklamsız Sürüme Geç</span></span><span class="text-xs bg-black/20 px-2.5 py-1 rounded-full font-bold tracking-wide" id="adFreePriceTag">${currentPrice}</span>`;
        }
        const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
        if (msg && (msg.toLowerCase().includes("iptal") || msg.toLowerCase().includes("cancel"))) {
          // İptal edildi, sessizce çık
        } else {
          alert(`${storeName} satın alma işlemi gerçekleştirilemedi:\n` + msg);
        }
      }
    } else {
      alert(`Examgo Premium mobil cihazlarda ${storeName} üzerinden satın alınabilir.`);
    }
  }

  async restorePurchases() {
    const isIOS = window.Capacitor?.getPlatform() === 'ios' || /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const Billing = isIOS
      ? (window.Capacitor?.Plugins?.AppStoreBilling)
      : (window.Capacitor?.Plugins?.GooglePlayBilling);
    const storeName = isIOS ? "App Store" : "Google Play";

    if (Billing && (typeof Billing.queryPurchases === 'function' || typeof Billing.restorePurchases === 'function')) {
      try {
        const queryFn = typeof Billing.queryPurchases === 'function' ? Billing.queryPurchases : Billing.restorePurchases;
        const res = await queryFn({ productId: 'remove_ads' });
        if (res && (res.hasPurchased || res.isAdFree)) {
          window.ydsAdService?.setAdFree(true);
          this.updateAdFreeUI();
          alert("Satın alımınız doğrulandı! Examgo Premium hesabınızda başarıyla geri yüklendi.");
        } else {
          alert(`${storeName} hesabınızda kayıtlı geçmiş bir satın alma bulunamadı.`);
        }
      } catch (err) {
        console.warn("Restore hatası:", err);
        alert("Satın alma kontrolü sırasında bir hata oluştu: " + (err?.message || err));
      }
    } else {
      const isAdFree = !!(window.ydsAdService?.getAdFree());
      if (isAdFree) {
        alert("Satın alımlarınız kontrol edildi: Examgo Premium hesabınızda zaten aktif.");
      } else {
        alert(`${storeName} hesabınızda kayıtlı geçmiş bir satın alma bulunamadı.`);
      }
    }
  }

  toggleAdFreeForTesting() {
    const current = !!(window.ydsAdService?.getAdFree());
    window.ydsAdService?.setAdFree(!current);
    this.updateAdFreeUI();
    alert(`Reklamsız mod ${!current ? 'AÇILDI' : 'KAPATILDI (Reklamlar tekrar aktif)'}.`);
  }

  saveSettingsName() {
    const input = document.getElementById("settingsNameInput");
    const name = input ? input.value.trim() : "";
    if (!name) {
      alert("Lütfen geçerli bir isim giriniz.");
      return;
    }
    this.userName = name;
    localStorage.setItem("yds_user_name", this.userName);

    const homeName = document.getElementById("homeUserNameText");
    if (homeName) homeName.textContent = this.userName;

    alert("İsminiz başarıyla kaydedildi!");
  }

  toggleSoundSetting(checked) {
    this.soundEnabled = !!checked;
    localStorage.setItem("yds_sound_enabled", this.soundEnabled ? "true" : "false");
  }

  toggleAutoPauseSetting(checked) {
    this.autoPauseEnabled = !!checked;
    localStorage.setItem("yds_auto_pause", this.autoPauseEnabled ? "true" : "false");
  }

  resetAllProgress() {
    const confirmed = confirm("Tüm çözülen sorular, sınav karneleri ve başarı verileriniz silinecektir. Devam etmek istediğinize emin misiniz?");
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEYS.USER_ANSWERS);
    localStorage.removeItem("yds_practice_answers");
    localStorage.removeItem("yds_exam_answers");
    localStorage.removeItem(STORAGE_KEYS.EXAM_SESSIONS);
    localStorage.removeItem("yds_tactics_unlocked");
    localStorage.removeItem("yds_mastered_words");
    localStorage.removeItem("yds_eliminated_options");
    localStorage.removeItem("yds_last_session");
    localStorage.removeItem("yds_sprint_records");
    localStorage.removeItem("yds_melted_mistakes_count");
    localStorage.removeItem("yds_streak_data");

    this.practiceAnswers = {};
    this.examAnswers = {};
    this.examSessions = {};
    this.masteredWords = [];
    this.eliminatedOptions = {};
    this.lastSession = null;
    this.sprintRecords = { bestScore: 0, bestTime: null, totalSprints: 0 };
    this.meltedMistakesCount = 0;
    this.streakData = this.loadStreakData();
    this.tacticsUnlocked = false;

    this.updateStats();
    this.updateHomeStats();
    if (this.currentView === "report") {
      this.renderReportView();
    }

    if (this.currentView === "question") {
      this.renderQuestion();
      this.renderQuestionGrid();
    }

    this.closeSettingsModal();
    alert("Tüm ilerlemeniz başarıyla sıfırlandı.");
  }

  // --- Event Listener'lar ---
  setupEventListeners() {
    // dailyQuestionModalTouchGuard: Günün Sorusu modalında arka plan kaymasını engelle
    const dqModal = document.getElementById("dailyQuestionModal");
    if (dqModal) {
      dqModal.addEventListener("touchmove", (e) => {
        const content = document.getElementById("dailyQuestionContent");
        if (!content || !content.contains(e.target) || content.scrollHeight <= content.clientHeight) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    // Arama Çubuğu (Ters yazım engelleme, imleç koruması ve klavye desteği)
    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");

    if (kwInput) {
      let debounceTimer = null;
      let isComposing = false;

      // Sanal klavye kelime tamamlama / heceleme (IME composition) kontrolü
      kwInput.addEventListener("compositionstart", () => {
        isComposing = true;
      });

      kwInput.addEventListener("compositionend", () => {
        isComposing = false;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => this.applyFilters(), 350);
      });

      kwInput.addEventListener("input", () => {
        if (clearBtn) {
          clearBtn.classList.toggle("hidden", !kwInput.value);
        }
        if (isComposing) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => this.applyFilters(), 350);
      });

      kwInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          clearTimeout(debounceTimer);
          this.applyFilters();
        }
      });

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          kwInput.value = "";
          clearBtn.classList.add("hidden");
          this.applyFilters();
          kwInput.focus();
        });
      }
    }

    // Filtre Seçiciler
    document.getElementById("categoryFilter")?.addEventListener("change", () => this.applyFilters());
    document.getElementById("yearFilter")?.addEventListener("change", () => this.applyFilters());
    document.getElementById("statusFilter")?.addEventListener("change", () => this.applyFilters());
    document.getElementById("searchScopeFilter")?.addEventListener("change", () => this.applyFilters());
    document.getElementById("clearFilterBtn")?.addEventListener("click", () => this.clearAllFilters());

    // Navigasyon
    document.getElementById("prevQuestionBtn")?.addEventListener("click", () => this.prevQuestion());
    document.getElementById("nextQuestionBtn")?.addEventListener("click", () => this.nextQuestion());
    document.getElementById("favoriteBtn")?.addEventListener("click", () => this.toggleFavorite());

    // Soru Notu Olayları
    document.getElementById("questionNoteBtn")?.addEventListener("click", () => this.openQuestionNoteDrawer());
    document.getElementById("questionNoteTextarea")?.addEventListener("input", () => this.updateQuestionNoteCharCount());
    document.getElementById("saveQuestionNoteBtn")?.addEventListener("click", () => this.saveCurrentQuestionNote());
    document.getElementById("deleteQuestionNoteBtn")?.addEventListener("click", () => this.deleteCurrentQuestionNote());
    document.getElementById("openNotesModalBtn")?.addEventListener("click", () => this.openAllNotesModal());
    document.getElementById("closeAllNotesModalBtn")?.addEventListener("click", () => this.closeAllNotesModal());
    document.getElementById("allNotesModal")?.addEventListener("click", (e) => {
      if (e.target.id === "allNotesModal") this.closeAllNotesModal();
    });
    document.getElementById("allNotesSearchInput")?.addEventListener("input", () => this.renderAllNotesList());

    // Zamanlayıcı
    document.getElementById("timerToggleBtn")?.addEventListener("click", () => this.toggleTimer());
    document.getElementById("timerResetBtn")?.addEventListener("click", () => this.resetTimer());

    // 80 Soruluk Yıl Denemesi Modu Olayları
    document.getElementById("openYearExamBtn")?.addEventListener("click", () => this.openYearExamModal());
    document.getElementById("closeYearExamModalBtn")?.addEventListener("click", () => this.closeYearExamModal());
    document.getElementById("finishExamBtn")?.addEventListener("click", () => this.showExamScorecard());
    document.getElementById("exitExamBtn")?.addEventListener("click", () => this.exitExamMode());

    
  // --- Geri Tuşu / Uygulama İçi Navigasyon Yönetimi ---
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', (e) => {
        this.handleHardwareBackButton();
      });
    } else {
      document.addEventListener("backbutton", (e) => {
        e.preventDefault();
        this.handleHardwareBackButton();
      }, false);
    }
    
    // Çıkış modal butonları
    document.getElementById("cancelExitBtn")?.addEventListener("click", () => {
      document.getElementById("exitConfirmModal")?.classList.add("hidden");
    });
    document.getElementById("confirmExitBtn")?.addEventListener("click", () => {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
      } else {
        window.close(); // Web fallback
      }
    });

    // Sınav Karnesi Modalı Olayları
    document.getElementById("closeScorecardModalBtn")?.addEventListener("click", () => this.closeExamScorecard());
    document.getElementById("scorecardReviewWrongBtn")?.addEventListener("click", () => this.reviewWrongQuestions());
    document.getElementById("scorecardRestartExamBtn")?.addEventListener("click", () => this.restartCurrentExam());
    document.getElementById("scorecardChangeYearBtn")?.addEventListener("click", () => {
      this.closeExamScorecard();
      this.openYearExamModal();
    });
    document.getElementById("scorecardRewardedAdBtn")?.addEventListener("click", () => {
      this.requestRewardedTactics();
    });

    // İsim Giriş Inputları (Enter Desteği)
    document.getElementById("nameModalInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.saveNameModal();
    });
    document.getElementById("settingsNameInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.saveSettingsName();
    });

    // Modallar
    document.getElementById("openPoolBtn")?.addEventListener("click", () => this.openLearningPoolModal());
    document.getElementById("closePoolModalBtn")?.addEventListener("click", () => this.closeLearningPoolModal());
    document.getElementById("openFlashcardsBtn")?.addEventListener("click", () => {
      this.closeLearningPoolModal();
      this.openFlashcardsModal();
    });
    document.getElementById("closeFlashcardsModalBtn")?.addEventListener("click", () => this.closeFlashcardsModal());

    // Flaş Kart Butonları
    document.getElementById("flashcardInner")?.addEventListener("click", () => this.flipFlashcard());
    document.getElementById("flashcardPrevBtn")?.addEventListener("click", () => this.prevFlashcard());
    document.getElementById("flashcardNextBtn")?.addEventListener("click", () => this.nextFlashcard(false));
    document.getElementById("flashcardMasteredBtn")?.addEventListener("click", () => this.nextFlashcard(true));

    // Dışa aktarma
    document.getElementById("exportCsvBtn")?.addEventListener("click", () => this.exportLearningPool("csv"));
    document.getElementById("exportJsonBtn")?.addEventListener("click", () => this.exportLearningPool("json"));

    // PDF Modalı
    document.getElementById("openPdfModalBtn")?.addEventListener("click", () => {
      document.getElementById("pdfImportModal")?.classList.remove("hidden");
      this.lockScroll();
    });
    document.getElementById("closePdfModalBtn")?.addEventListener("click", () => {
      document.getElementById("pdfImportModal")?.classList.add("hidden");
    });

    const pdfFileInput = document.getElementById("pdfFileInput");
    if (pdfFileInput) {
      pdfFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handlePDFImport(e.target.files[0]);
        }
      });
    }

    // Kelime Arama Modal Kapatma
    document.getElementById("closeWordModalBtn")?.addEventListener("click", () => this.closeWordModal());

    // Tıklanabilir Kelimeler Olayı (Event Delegation)
    document.addEventListener("click", (e) => {
      const wordSpan = e.target.closest(".interactive-word");
      if (wordSpan) {
        e.preventDefault();
        e.stopPropagation();
        const word = decodeURIComponent(wordSpan.dataset.word || wordSpan.textContent);
        this.openWordModal(word);
      }
    });

    // Sesli Telaffuz Butonu
    document.getElementById("modalSpeakBtn")?.addEventListener("click", () => {
      const word = document.getElementById("modalWordTitle")?.textContent;
      if (word) this.speakWord(word);
    });

    // Klavye Kısayolları (A-B-C-D-E şıkları için 1-5 veya A-E, sağ-sol ok tuşları ile soru geçişi)
    document.addEventListener("keydown", (e) => {
      // Eğer input odaklıysa kısayolları yoksay
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(key)) {
        this.handleOptionSelect(key);
      } else if (e.key === "ArrowRight") {
        this.nextQuestion();
      } else if (e.key === "ArrowLeft") {
        this.prevQuestion();
      } else if (e.key === "f" || e.key === "F") {
        this.toggleFavorite();
      } else if (e.key === " " && !document.getElementById("flashcardModal")?.classList.contains("hidden")) {
        e.preventDefault();
        this.flipFlashcard();
      }
    });

    // Gece/Gündüz Modu Butonu
    document.getElementById("themeToggleBtn")?.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      if (isDark) {
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
      }
      localStorage.setItem("yds_theme", isDark ? "dark" : "light");
    });

    // Kayıtlı tema yükleme
    if (localStorage.getItem("yds_theme") === "dark" || (!localStorage.getItem("yds_theme") && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    // Üst filtre ve deneme barları kaydırma dinleyicisi
    this.initScrollHeaderBars();
  }

  // --- Üst Barların Kaydırma Davranışı (Scroll Auto-Collapse) İPTAL EDİLDİ ---
  initScrollHeaderBars() {
    // Scroll ile yapay gizleme/gösterme iptal edildi, çünkü header'ın kendisi sticky olmaktan çıkarıldı 
    // ve doğal olarak sayfa ile kaydırılması istendi.
    this.expandHeaderBars = () => {
      const barsContainer = document.getElementById('collapsibleHeaderBars');
      if (barsContainer) {
        barsContainer.classList.remove('collapsed-header-bars');
      }
    };
  }

  // --- Günün Sorusu Sistemi ---
  openDailyQuestion() {
    this.lockScroll();
    const modal = document.getElementById("dailyQuestionModal");
    if (modal) modal.classList.remove("hidden");
    
    this.renderDailyQuestion();
  }

  closeDailyQuestion() {
    this.unlockScroll();
    const modal = document.getElementById("dailyQuestionModal");
    if (modal) modal.classList.add("hidden");
  }

  renderDailyQuestion() {
    const container = document.getElementById("dailyQuestionContent");
    if (!container) return;

    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    
    // Use the authentic YDS question pool
    const authenticPool = window.questionRepo ? window.questionRepo.getAll() : [];
    
    if (authenticPool.length === 0) {
      container.innerHTML = '<p class="text-center p-4">Soru havuzu yüklenemedi.</p>';
      return;
    }
    
    const qIndex = dayOfYear % authenticPool.length;
    const q = authenticPool[qIndex];
    const actualAnswer = q.answer || q.correctAnswer;

    this._dailyQuestion = q;
    this.updateDailyQuestionStatsBadge(q);
    
    const answeredKey = "yds_daily_" + today.toLocaleDateString("tr-TR");
    const isAnswered = localStorage.getItem(answeredKey);
    
    let optionsHtml = '';
    if (q.options) {
      Object.entries(q.options).forEach(([key, value]) => {
        let extraClass = "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700";
        
        if (isAnswered) {
          if (key === actualAnswer) {
            extraClass = "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-500 dark:text-emerald-300";
          } else if (key === isAnswered) {
             extraClass = "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-300";
          } else {
             extraClass = "opacity-50 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700";
          }
        }
        
        // Wrap words in options too!
        const wrappedValue = this.tokenizeInteractiveText(value.toString());
        
        optionsHtml += `
          <button onclick="ydsApp.answerDailyQuestion('${key}', event)" class="w-full text-left p-3.5 sm:p-4 rounded-xl transition-all ${extraClass} flex items-start gap-3 ${isAnswered ? 'cursor-default' : ''}">
            <span class="font-bold flex-shrink-0 w-6 text-center">${key}</span>
            <span class="text-sm sm:text-base leading-relaxed">${wrappedValue}</span>
          </button>
        `;
      });
    }

    let explanationHtml = '';
    if (isAnswered) {
      const isCorrect = isAnswered === actualAnswer;
      const explanationText = (q.explanation && q.explanation.trim() ? q.explanation : (q.solutionMethod || '')).trim();
      explanationHtml = `
        <div class="mt-5 p-4 sm:p-5 rounded-2xl ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'} animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h4 class="font-bold ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'} text-lg mb-2 flex items-center gap-2">
             ${isCorrect ? 'Tebrikler, Doğru!' : 'Maalesef Yanlış.'}
          </h4>
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 ${explanationText ? 'mb-2' : ''}">Doğru Cevap: ${actualAnswer}</p>
          ${explanationText ? `
          <div class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
            ${explanationText.replace(/\n/g, '<br>')}
          </div>` : ''}
        </div>
      `;
    }

    let passageHtml = '';
    if (q.passage) {
      const wrappedPassage = this.tokenizeInteractiveText(q.passage);
      passageHtml = `
        <div class="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 rounded-xl text-sm italic border border-amber-100 dark:border-amber-800/30 leading-relaxed">
          ${wrappedPassage}
        </div>
      `;
    }
    
    const questionText = q.questionText || q.text || '';
    const wrappedQuestion = this.tokenizeInteractiveText(questionText);

    container.innerHTML = `
      ${passageHtml}
      <div class="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 p-4 sm:p-5 rounded-2xl font-medium text-sm sm:text-base border border-indigo-100 dark:border-indigo-800/50 leading-relaxed shadow-sm">
        ${wrappedQuestion}
      </div>
      <div class="space-y-2.5 mt-5">
        ${optionsHtml}
      </div>
      ${explanationHtml}
    `;
  }

  answerDailyQuestion(selectedKey, event) {
    // 1. Eğer tıklanan eleman veya ebeveyni .interactive-word ise şıkkı işaretleme!
    if (event && event.target && event.target.closest(".interactive-word")) return;

    if (!this._dailyQuestion) return;
    const today = new Date().toLocaleDateString("tr-TR");
    // Zaten cevaplanmışsa tekrar cevaplama
    if (localStorage.getItem("yds_daily_" + today)) return;

    localStorage.setItem("yds_daily_" + today, selectedKey);

    // Günlük aktivite ve seri sayacını güncelle
    this.recordDailyActivity(1);

    // Günün sorusu cevabını anında topluluk istatistiklerine atomik olarak aktar
    const actualAnswer = this._dailyQuestion.answer || this._dailyQuestion.correctAnswer;
    const isCorrect = selectedKey === actualAnswer;
    const testId = window.questionStatsService?.resolveTestId(this._dailyQuestion);
    if (testId) {
      window.questionStatsService?.submitTestStats(testId, [{
        questionId: this._dailyQuestion.id,
        isCorrect: isCorrect
      }]);
    }

    this.renderDailyQuestion();
    
    // Konfeti veya ses efekti eklenebilir
    if (this.soundEnabled && typeof window.AudioContext !== 'undefined') {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        const actualAnswer = this._dailyQuestion.answer || this._dailyQuestion.correctAnswer;
        if (selectedKey === actualAnswer) {
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        } else {
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        }
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } catch (e) {}
    }
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 1: ŞIK ELEME & YAZI BOYUTU (A- / A+) ---
  // ============================================================

  loadEliminatedOptions() {
    try {
      const raw = localStorage.getItem("yds_eliminated_options");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveEliminatedOptions() {
    try {
      localStorage.setItem("yds_eliminated_options", JSON.stringify(this.eliminatedOptions || {}));
    } catch (e) {}
  }

  toggleEliminateOption(questionId, optKey, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!questionId || !optKey) return;
    if (this.userAnswers[questionId]) return;

    if (!this.eliminatedOptions) this.eliminatedOptions = {};
    const list = Array.isArray(this.eliminatedOptions[questionId])
      ? [...this.eliminatedOptions[questionId]]
      : [];

    const idx = list.indexOf(optKey);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(optKey);
    }

    if (list.length > 0) {
      this.eliminatedOptions[questionId] = list;
    } else {
      delete this.eliminatedOptions[questionId];
    }

    this.saveEliminatedOptions();
    this.renderQuestion();
  }

  changeQuestionFontSize(delta) {
    const next = Math.max(-1, Math.min(2, (this.fontSizeScale || 0) + delta));
    this.fontSizeScale = next;
    try {
      localStorage.setItem("yds_font_scale", String(this.fontSizeScale));
    } catch (e) {}
    this.applyQuestionFontSize();
  }

  applyQuestionFontSize() {
    const container = document.getElementById("questionContainer");
    const indicator = document.getElementById("fontSizeIndicator");
    const scale = Math.max(-1, Math.min(2, this.fontSizeScale || 0));

    if (container) {
      container.classList.remove("q-font-scale--1", "q-font-scale-0", "q-font-scale-1", "q-font-scale-2");
      container.classList.add(`q-font-scale-${scale}`);
    }

    if (indicator) {
      const labelMap = {
        "-1": "%90",
        "0": "%100",
        "1": "%112",
        "2": "%125"
      };
      indicator.textContent = labelMap[String(scale)] || "%100";
    }
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 2: GÜNLÜK SERİ (STREAK), HEDEF & SON OTURUM ---
  // ============================================================

  getLocalISODate(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  getYesterdayISODate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return this.getLocalISODate(d);
  }

  loadStreakData() {
    const today = this.getLocalISODate();
    const yesterday = this.getYesterdayISODate();
    const defaults = {
      currentStreak: 0,
      bestStreak: 0,
      lastActiveDate: null,
      todayDate: today,
      todayCount: 0,
      dailyTarget: 15,
      dailyHistory: {}
    };

    try {
      const raw = localStorage.getItem("yds_streak_data");
      if (!raw) return defaults;
      const parsed = { ...defaults, ...JSON.parse(raw) };
      if (!parsed.dailyHistory || typeof parsed.dailyHistory !== "object") {
        parsed.dailyHistory = {};
      }

      // Önceki günün sayacını geçmişe kaydet
      if (parsed.todayDate && parsed.todayCount > 0) {
        parsed.dailyHistory[parsed.todayDate] = Math.max(parsed.dailyHistory[parsed.todayDate] || 0, parsed.todayCount);
      }

      // Gün değişmişse bugünkü sayacı sıfırla
      if (parsed.todayDate !== today) {
        parsed.todayDate = today;
        parsed.todayCount = parsed.dailyHistory[today] || 0;
      }

      // Son aktif olunan gün dün veya bugün değilse seri sıfırlanır
      if (parsed.lastActiveDate && parsed.lastActiveDate !== today && parsed.lastActiveDate !== yesterday) {
        parsed.currentStreak = 0;
      }

      return parsed;
    } catch {
      return defaults;
    }
  }

  saveStreakData() {
    try {
      localStorage.setItem("yds_streak_data", JSON.stringify(this.streakData));
    } catch (e) {}
  }

  recordDailyActivity(amount = 1) {
    if (!this.streakData) {
      this.streakData = this.loadStreakData();
    }
    const today = this.getLocalISODate();
    const yesterday = this.getYesterdayISODate();

    if (!this.streakData.dailyHistory || typeof this.streakData.dailyHistory !== "object") {
      this.streakData.dailyHistory = {};
    }

    if (this.streakData.todayDate !== today) {
      this.streakData.todayDate = today;
      this.streakData.todayCount = this.streakData.dailyHistory[today] || 0;
    }

    this.streakData.todayCount = Math.max(0, (this.streakData.todayCount || 0) + amount);
    this.streakData.dailyHistory[today] = this.streakData.todayCount;

    if (this.streakData.lastActiveDate !== today) {
      if (this.streakData.lastActiveDate === yesterday) {
        this.streakData.currentStreak = (this.streakData.currentStreak || 0) + 1;
      } else {
        this.streakData.currentStreak = 1;
      }
      this.streakData.lastActiveDate = today;
    }

    if ((this.streakData.currentStreak || 0) > (this.streakData.bestStreak || 0)) {
      this.streakData.bestStreak = this.streakData.currentStreak;
    }

    this.saveStreakData();
    this.renderStreakAndGoalUI();
  }

  setDailyTarget(target) {
    const validTarget = [10, 15, 25].includes(Number(target)) ? Number(target) : 15;
    if (!this.streakData) this.streakData = this.loadStreakData();
    this.streakData.dailyTarget = validTarget;
    this.saveStreakData();
    this.renderStreakAndGoalUI();
  }

  renderStreakAndGoalUI() {
    if (!this.streakData) this.streakData = this.loadStreakData();
    const today = this.getLocalISODate();
    if (this.streakData.todayDate !== today) {
      this.streakData = this.loadStreakData();
    }

    const { currentStreak, bestStreak, todayCount, dailyTarget } = this.streakData;
    const target = dailyTarget || 15;
    const count = todayCount || 0;
    const pct = Math.min(100, Math.round((count / target) * 100));

    const dayCountEl = document.getElementById("streakDayCount");
    const bestBadgeEl = document.getElementById("streakBestBadge");
    const motivEl = document.getElementById("streakMotivationText");
    const progTextEl = document.getElementById("dailyGoalProgressText");
    const statusBadgeEl = document.getElementById("dailyGoalStatusBadge");
    const barEl = document.getElementById("dailyGoalProgressBar");

    if (dayCountEl) dayCountEl.textContent = `${currentStreak || 0} Gün`;
    if (bestBadgeEl) bestBadgeEl.textContent = `En İyi: ${bestStreak || 0} Gün`;

    if (motivEl) {
      if (count === 0) {
        motivEl.textContent = "Bugün 1 soru veya kelime çalışarak serinizi başlatın!";
      } else if (count < target) {
        motivEl.textContent = `Harika gidiyorsunuz! Günlük hedefe ${target - count} adım kaldı.`;
      } else {
        motivEl.textContent = "Tebrikler! Bugünkü YDS çalışma hedefinizi tamamladınız.";
      }
    }

    if (progTextEl) progTextEl.textContent = `${count} / ${target} Tamamlandı`;
    if (barEl) barEl.style.width = `${pct}%`;

    if (statusBadgeEl) {
      if (count >= target) {
        statusBadgeEl.textContent = "Hedef Tamamlandı!";
        statusBadgeEl.className = "text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400";
      } else {
        statusBadgeEl.textContent = `%${pct}`;
        statusBadgeEl.className = "text-[11px] font-bold text-amber-600 dark:text-amber-400";
      }
    }

    [10, 15, 25].forEach(val => {
      const btn = document.getElementById(`dailyTargetBtn${val}`);
      if (!btn) return;
      if (val === target) {
        btn.className = "px-2 py-0.5 rounded-md text-[10px] font-extrabold transition bg-amber-500 text-white shadow-2xs";
      } else {
        btn.className = "px-2 py-0.5 rounded-md text-[10px] font-extrabold transition text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
      }
    });
  }

  loadLastSession() {
    try {
      const raw = localStorage.getItem("yds_last_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  saveLastSession(sessionData) {
    this.lastSession = sessionData;
    try {
      localStorage.setItem("yds_last_session", JSON.stringify(sessionData));
    } catch (e) {}
  }

  recordCurrentSessionPosition(q) {
    if (!q) return;
    const mode = this.isExamMode ? "exam" : "practice";
    const examName = this.isExamMode ? (this.currentExamName || (this.currentExamYear ? `${this.currentExamYear} YDS` : "YDS Denemesi")) : null;
    const sessionData = {
      mode,
      examName,
      examYear: this.currentExamYear || q.year || null,
      questionId: q.id,
      questionIndex: this.currentIndex,
      totalQuestions: this.filteredQuestions.length || 1,
      category: q.category || "Karma Konular",
      timestamp: Date.now()
    };
    this.saveLastSession(sessionData);
  }

  updateContinueSessionUI() {
    const badgeEl = document.getElementById("continueSessionBadge");
    const pillEl = document.getElementById("continueSessionProgressPill");
    const titleEl = document.getElementById("continueSessionTitle");
    const descEl = document.getElementById("continueSessionDesc");
    const btnTextEl = document.getElementById("continueSessionBtnText");

    const s = this.lastSession || this.loadLastSession();

    if (!s || !s.questionId) {
      if (badgeEl) badgeEl.textContent = "Hızlı Başlangıç";
      if (pillEl) pillEl.textContent = "Hazır";
      if (titleEl) titleEl.textContent = "Hemen Soru Çözmeye Başla";
      if (descEl) descEl.textContent = "ÖSYM ayarında özgün YDS alıştırma sorularıyla pratik yapmaya başlayın.";
      if (btnTextEl) btnTextEl.textContent = "Alıştırma Modunu Başlat";
      return;
    }

    if (s.mode === "exam" && s.examName) {
      if (badgeEl) badgeEl.textContent = "Deneme Oturumu";
      if (pillEl) pillEl.textContent = `Soru ${(s.questionIndex || 0) + 1} / ${s.totalQuestions || 80}`;
      if (titleEl) titleEl.textContent = `${s.examName}`;
      if (descEl) descEl.textContent = `En son ${(s.questionIndex || 0) + 1}. soruda (${s.category || "Genel"}) kaldınız. Süreniz korunarak devam edin.`;
      if (btnTextEl) btnTextEl.textContent = `${(s.questionIndex || 0) + 1}. Sorudan Denemeye Devam Et`;
    } else {
      if (badgeEl) badgeEl.textContent = "Son Alıştırma";
      if (pillEl) pillEl.textContent = `Soru ${(s.questionIndex || 0) + 1} / ${s.totalQuestions || 330}`;
      if (titleEl) titleEl.textContent = `Alıştırma Modu • ${s.category || "Karma"}`;
      if (descEl) descEl.textContent = `Son çalıştığınız oturuma kaldığınız sorudan tek tıkla geri dönün.`;
      if (btnTextEl) btnTextEl.textContent = "Kaldığın Sorudan Devam Et";
    }
  }

  continueLastSession() {
    const s = this.lastSession || this.loadLastSession();
    if (!s || !s.questionId) {
      this.startPracticeMode();
      return;
    }

    if (s.mode === "exam" && s.examName) {
      this.startExamMode(s.examName);
      const foundIdx = this.filteredQuestions.findIndex(q => q.id === s.questionId);
      if (foundIdx >= 0) {
        this.currentIndex = foundIdx;
        this.renderQuestion();
        this.renderQuestionGrid();
      }
      return;
    }

    // Alıştırma modunda kaldığı soruyu bul ve aç
    this.startPracticeMode();
    const allPractice = window.questionRepo ? window.questionRepo.getAlistirmaQuestions() : (window.PRACTICE_YDS_QUESTIONS || []);
    const targetQ = allPractice.find(q => q.id === s.questionId) || (this.allQuestions || []).find(q => q.id === s.questionId);
    if (targetQ) {
      const existingIdx = this.filteredQuestions.findIndex(q => q.id === targetQ.id);
      if (existingIdx >= 0) {
        this.currentIndex = existingIdx;
      } else {
        this.filteredQuestions.unshift(targetQ);
        this.currentIndex = 0;
      }
      this.renderQuestion();
      this.renderQuestionGrid();
    }
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 3: ZAYIF KONU KOÇU & TEK TIKLA ANTRENMAN ---
  // ============================================================

  analyzeCategoryPerformance() {
    const questionMap = new Map();
    if (window.questionRepo && typeof window.questionRepo.getAll === "function") {
      window.questionRepo.getAll().forEach(q => questionMap.set(q.id, q));
    }
    (this.allQuestions || []).forEach(q => questionMap.set(q.id, q));
    if (window.PRACTICE_YDS_QUESTIONS) {
      window.PRACTICE_YDS_QUESTIONS.forEach(q => questionMap.set(q.id, q));
    }

    const standardCategories = [
      {
        id: "kelime",
        shortName: "Kelime Bilgisi",
        name: "Kelime Bilgisi (Vocabulary & Phrasal Verbs)",
        match: ["kelime", "vocabulary", "phrasal"],
        advice: "Boşluktan sonraki edat ve isim tamlamalarına (collocation) dikkat edin; bilmediğiniz kelimeleri havuza ekleyip tekrar edin."
      },
      {
        id: "dilbilgisi",
        shortName: "Dilbilgisi & Zamanlar",
        name: "Dilbilgisi & Zamanlar (Grammar & Tenses)",
        match: ["dilbilgisi", "grammar", "tenses", "preposition", "zaman"],
        advice: "Cümledeki zaman zarflarına (by the time, since, during) ve ana-yan cümle Tense uyumuna odaklanarak şıkları eleyin."
      },
      {
        id: "cloze",
        shortName: "Cloze Test",
        name: "Cloze Test (Parça İçi Boşluk)",
        match: ["cloze"],
        advice: "Parçanın genel zamanını (Past/Present) ve cümleler arası zıtlık/neden-sonuç geçiş bağlaçlarını bütünlük içinde değerlendirin."
      },
      {
        id: "cümle tamamlama",
        shortName: "Cümle Tamamlama",
        name: "Cümle Tamamlama (Sentence Completion)",
        match: ["cümle tamamlama", "sentence"],
        advice: "Bağlaçların anlam kutuplarını (+ / -) ve şıklardaki referans zamir karşılıklarını (this, such, they) öncelikli kontrol edin."
      },
      {
        id: "çeviri",
        shortName: "Çeviri Soruları",
        name: "Çeviri (İngilizce ↔ Türkçe)",
        match: ["çeviri", "translation"],
        advice: "Önce cümlenin ana yüklemini ve öznesini eşleştirin; bu yöntemle 5 şıktan en az 3'ünü saniyeler içinde eleyebilirsiniz."
      },
      {
        id: "okuma",
        shortName: "Okuma Parçaları",
        name: "Okuma Parçaları (Reading Passages)",
        match: ["okuma", "parça", "reading"],
        advice: "Önce soru köklerini okuyun ve parçada 'only, never, completely' gibi aşırı kesinlik içeren çeldiricilere karşı dikkatli olun."
      },
      {
        id: "diyalog",
        shortName: "Diyalog Tamamlama",
        name: "Diyalog Tamamlama (Dialogue)",
        match: ["diyalog", "dialogue"],
        advice: "Boşluktan hemen sonraki konuşmacının verdiği tepkiye ve soruya odaklanarak konu bütünlüğünü yakalayın."
      },
      {
        id: "anlamca en yakın",
        shortName: "Restatement (Yakın Anlam)",
        name: "Anlamca En Yakın Cümle (Restatement)",
        match: ["anlamca en yakın", "restatement"],
        advice: "Soru cümlesindeki miktar, karşılaştırma (more/less/as...as) ve olasılık (may/must) derecelerini koruyan şıkkı seçin."
      },
      {
        id: "paragraf tamamlama",
        shortName: "Paragraf Tamamlama",
        name: "Paragraf Tamamlama (Paragraph Completion)",
        match: ["paragraf tamamlama"],
        advice: "Boşluktan önceki ve sonraki cümlelerdeki zamir takibine ve konu daralması/genişlemesi geçişlerine dikkat edin."
      },
      {
        id: "anlatım",
        shortName: "Akışı Bozan Cümle",
        name: "Anlatım Bütünlüğü / Akışı Bozan (Irrelevant)",
        match: ["anlatım", "akışı bozan", "irrelevant"],
        advice: "Paragrafın ana öznesinden veya savunduğu bakış açısından sapan cümleyi tespit edin."
      }
    ];

    const stats = standardCategories.map(c => ({
      ...c,
      total: 0,
      correct: 0,
      wrong: 0,
      accuracy: 0
    }));

    const combinedAnswers = { ...(this.practiceAnswers || {}), ...(this.examAnswers || {}) };
    let totalAnswered = 0;

    Object.entries(combinedAnswers).forEach(([qId, ans]) => {
      const q = questionMap.get(qId);
      if (!q) return;
      totalAnswered++;

      const qCat = ((q.category || "") + " " + (q.subCategory || "")).toLowerCase();
      for (const item of stats) {
        if (item.match.some(kw => qCat.includes(kw))) {
          item.total++;
          if (ans.isCorrect) item.correct++;
          else item.wrong++;
          break;
        }
      }
    });

    stats.forEach(item => {
      item.accuracy = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
    });

    const attempted = stats.filter(s => s.total > 0);
    // En zayıf konuyu sırala: önce en düşük başarı yüzdesi, eşitlikte daha çok yanlış sayısı
    const sortedWeak = [...attempted].sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.wrong - a.wrong;
    });

    return {
      totalAnswered,
      attempted,
      weakest: sortedWeak[0] || null,
      secondWeakest: sortedWeak[1] || null
    };
  }

  updateWeakTopicCoachUI() {
    const badgesEl = document.getElementById("weakCoachBadges");
    const titleEl = document.getElementById("weakCoachTitle");
    const descEl = document.getElementById("weakCoachDesc");
    const btnTextEl = document.getElementById("weakCoachActionBtnText");

    if (!titleEl || !descEl) return;

    const analysis = this.analyzeCategoryPerformance();

    if (analysis.totalAnswered < 3 || !analysis.weakest) {
      this._recommendedWeakCategory = null;
      if (badgesEl) {
        badgesEl.innerHTML = `
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            Akıllı Zayıf Konu Koçu
          </span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            Veri Toplanıyor (${analysis.totalAnswered}/3 Soru)
          </span>
        `;
      }
      titleEl.textContent = "Zayıf Konu Analiziniz İçin Birkaç Soru Çözün";
      descEl.textContent = "En az 3 soru çözdüğünüzde yapay zeka koçunuz en çok zorlandığınız soru tipini tespit eder ve tek tıkla özel antrenman hazırlar.";
      if (btnTextEl) btnTextEl.textContent = "Tanı Antrenmanına Başla";
      return;
    }

    const w = analysis.weakest;
    this._recommendedWeakCategory = w.id;

    const statusColor = w.accuracy < 50
      ? "bg-rose-100 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
      : w.accuracy < 75
      ? "bg-amber-100 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      : "bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

    if (badgesEl) {
      badgesEl.innerHTML = `
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
          Zayıf Konu Koçu
        </span>
        <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusColor}">
          %${w.accuracy} Başarı (${w.correct}/${w.total} Doğru)
        </span>
      `;
    }

    titleEl.textContent = `Odak Konunuz: ${w.shortName}`;
    descEl.textContent = w.advice;
    if (btnTextEl) btnTextEl.textContent = `${w.shortName} Antrenmanı Başlat`;
  }

  startWeakTopicPractice(categoryKeyword = null) {
    const targetKeyword = (categoryKeyword || this._recommendedWeakCategory || "").toLowerCase().trim();

    if (!targetKeyword) {
      this.startPracticeMode();
      return;
    }

    this.cleanupSpecialQuestionModes?.();

    if (this.isExamMode) {
      this.stopExamSmartTimer();
      this.isExamMode = false;
      this.currentExamYear = null;
      document.getElementById("examModeBanner")?.classList.add("hidden");
    }

    this.isPracticeMode = true;
    const practicePool = window.questionRepo
      ? window.questionRepo.getAlistirmaQuestions()
      : (window.PRACTICE_YDS_QUESTIONS || []);
    const fallbackPool = window.questionRepo ? window.questionRepo.getAll() : (this.allQuestions || []);

    const matchQuestion = (q) => {
      const qCat = ((q.category || "") + " " + (q.subCategory || "")).toLowerCase();
      return qCat.includes(targetKeyword);
    };

    let matchedQuestions = practicePool.filter(matchQuestion);
    if (matchedQuestions.length < 5) {
      const extra = fallbackPool.filter(q => matchQuestion(q) && !matchedQuestions.some(m => m.id === q.id));
      matchedQuestions = [...matchedQuestions, ...extra];
    }

    if (matchedQuestions.length === 0) {
      this.startPracticeMode();
      return;
    }

    // Önce çözülmemiş ve yanlış yapılmış soruları öne al
    const wrongOrUnsolved = matchedQuestions.filter(q => {
      const ans = this.practiceAnswers[q.id] || this.examAnswers[q.id];
      return !ans || !ans.isCorrect;
    });
    const correctOnes = matchedQuestions.filter(q => {
      const ans = this.practiceAnswers[q.id] || this.examAnswers[q.id];
      return ans && ans.isCorrect;
    });

    const ordered = [
      ...wrongOrUnsolved.sort(() => Math.random() - 0.5),
      ...correctOnes.sort(() => Math.random() - 0.5)
    ];

    this.activePool = practicePool.length > 0 ? practicePool : fallbackPool;
    this.populateFilterDropdowns(this.activePool);

    // Kategori filtresinde eşleşen seçeneği seç
    const catSelect = document.getElementById("categoryFilter");
    if (catSelect) {
      const matchingOption = Array.from(catSelect.options).find(opt =>
        opt.value.toLowerCase().includes(targetKeyword)
      );
      catSelect.value = matchingOption ? matchingOption.value : "all";
    }

    this.filteredQuestions = ordered;
    this.currentIndex = 0;
    this.practiceSessionActive = true;

    this.showQuestionView("practice");

    const modeBadge = document.getElementById("questionViewModeBadge");
    if (modeBadge) {
      const matchedCatName = ordered[0]?.category || "Hedef Konu";
      modeBadge.textContent = `Koç Antrenmanı: ${matchedCatName} (${ordered.length} Soru)`;
      modeBadge.className = "px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60";
    }

    this.updateFilterStatusBadge();
    this.renderQuestion();
    this.renderQuestionGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 4: ÇOKTAN SEÇMELİ KELİME QUİZİ MODU ---
  // ============================================================

  openVocabQuizModal(mode = "pool") {
    const poolModal = document.getElementById("learningPoolModal");
    if (poolModal && !poolModal.classList.contains("hidden")) {
      poolModal.classList.add("hidden");
    }

    const modal = document.getElementById("vocabQuizModal");
    if (!modal) return;

    this.lockScroll();
    modal.classList.remove("hidden");

    const effectiveMode = (mode === "pool" && (!this.learningPool || this.learningPool.length === 0))
      ? "pool"
      : (mode || "pool");

    this.switchVocabQuizMode(effectiveMode);
  }

  closeVocabQuizModal() {
    this.unlockScroll();
    document.getElementById("vocabQuizModal")?.classList.add("hidden");
  }

  switchVocabQuizMode(mode = "pool") {
    this.vocabQuizState.mode = mode;

    const poolBtn = document.getElementById("vocabQuizModePoolBtn");
    const allBtn = document.getElementById("vocabQuizModeAllBtn");

    if (poolBtn && allBtn) {
      if (mode === "pool") {
        poolBtn.className = "flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-300 shadow-2xs";
        allBtn.className = "flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200";
      } else {
        allBtn.className = "flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition bg-white dark:bg-gray-800 text-violet-700 dark:text-violet-300 shadow-2xs";
        poolBtn.className = "flex-1 py-1.5 px-3 rounded-lg text-xs font-extrabold transition text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200";
      }
    }

    this.restartVocabQuiz();
  }

  generateVocabQuizQuestions(mode = "pool", count = 10) {
    const globalList = (typeof VOCAB_LIST !== "undefined" && Array.isArray(VOCAB_LIST)) ? VOCAB_LIST : [];
    const poolItems = Array.isArray(this.learningPool) ? this.learningPool : [];

    // Tüm çeldirici anlam havuzu
    const allMeaningsPool = [];
    globalList.forEach(item => {
      if (item.word && item.tr) {
        allMeaningsPool.push({ word: item.word.toLowerCase(), meaning: item.tr.trim() });
      }
    });
    poolItems.forEach(item => {
      if (item.word && item.meaning) {
        allMeaningsPool.push({ word: item.word.toLowerCase(), meaning: item.meaning.trim() });
      }
    });

    const sourceItems = [];
    const usedWords = new Set();

    if (mode === "pool") {
      const shuffledPool = [...poolItems].sort(() => Math.random() - 0.5);
      shuffledPool.forEach(p => {
        if (!p.word || !p.meaning) return;
        const wLower = p.word.toLowerCase();
        if (usedWords.has(wLower)) return;
        usedWords.add(wLower);
        const foundGlobal = globalList.find(g => g.word.toLowerCase() === wLower);
        sourceItems.push({
          word: p.word,
          meaning: p.meaning,
          sample: p.sample || "",
          freq: foundGlobal ? foundGlobal.freq : this.getExamOccurrenceCount(p.word),
          sourceLabel: "Kelime Havuzunuzdan",
          fromPool: true
        });
      });

      // Eğer havuzda 10 kelimeden az varsa kalan soruları YDS Sık Çıkanlar ile tamamla
      if (sourceItems.length < count && globalList.length > 0) {
        const shuffledGlobal = [...globalList].sort(() => Math.random() - 0.5);
        for (const g of shuffledGlobal) {
          if (sourceItems.length >= count) break;
          const wLower = g.word.toLowerCase();
          if (usedWords.has(wLower)) continue;
          usedWords.add(wLower);
          sourceItems.push({
            word: g.word,
            meaning: g.tr,
            sample: "",
            freq: g.freq || 1,
            sourceLabel: poolItems.length === 0 ? "YDS Sık Çıkanlar (Havuzunuz Boş)" : "YDS Sık Çıkanlar (Tamamlama)",
            fromPool: false
          });
        }
      }
    } else {
      const shuffledGlobal = [...globalList].sort(() => Math.random() - 0.5);
      for (const g of shuffledGlobal) {
        if (sourceItems.length >= count) break;
        const wLower = g.word.toLowerCase();
        if (usedWords.has(wLower)) continue;
        usedWords.add(wLower);
        const inPool = poolItems.find(p => p.word.toLowerCase() === wLower);
        sourceItems.push({
          word: g.word,
          meaning: g.tr,
          sample: inPool?.sample || "",
          freq: g.freq || 1,
          sourceLabel: "YDS Sık Çıkanlar",
          fromPool: !!inPool
        });
      }
    }

    const selectedTargets = sourceItems.slice(0, count);

    return selectedTargets.map(target => {
      const correctMeaning = target.meaning;
      const targetLower = target.word.toLowerCase();

      // 4 benzersiz çeldirici seç
      const distractors = [];
      const usedMeanings = new Set([correctMeaning.toLowerCase()]);
      const shuffledCandidates = [...allMeaningsPool].sort(() => Math.random() - 0.5);

      for (const cand of shuffledCandidates) {
        if (distractors.length >= 4) break;
        if (cand.word === targetLower) continue;
        const mLower = cand.meaning.toLowerCase();
        if (usedMeanings.has(mLower)) continue;
        usedMeanings.add(mLower);
        distractors.push(cand.meaning);
      }

      const options = [correctMeaning, ...distractors].sort(() => Math.random() - 0.5);
      const correctIndex = options.indexOf(correctMeaning);

      return {
        ...target,
        options,
        correctIndex
      };
    });
  }

  restartVocabQuiz() {
    const mode = this.vocabQuizState?.mode || "pool";
    const questions = this.generateVocabQuizQuestions(mode, 10);

    this.vocabQuizState = {
      mode,
      questions,
      currentIndex: 0,
      correct: 0,
      wrong: 0,
      missed: [],
      answered: false
    };

    document.getElementById("vocabQuizResultBody")?.classList.add("hidden");
    document.getElementById("vocabQuizActiveBody")?.classList.remove("hidden");

    this.renderVocabQuizQuestion();
  }

  renderVocabQuizQuestion() {
    const state = this.vocabQuizState;
    if (!state || !state.questions || state.questions.length === 0) return;

    const q = state.questions[state.currentIndex];
    if (!q) {
      this.renderVocabQuizSummary();
      return;
    }

    state.answered = false;

    const total = state.questions.length;
    const currentNum = state.currentIndex + 1;
    const pct = Math.round(((currentNum - 1) / total) * 100);

    const progressEl = document.getElementById("vocabQuizProgressText");
    const corrEl = document.getElementById("vocabQuizCorrectCount");
    const wrongEl = document.getElementById("vocabQuizWrongCount");
    const barEl = document.getElementById("vocabQuizProgressBar");
    const sourceBadgeEl = document.getElementById("vocabQuizSourceBadge");
    const freqBadgeEl = document.getElementById("vocabQuizFreqBadge");
    const wordTitleEl = document.getElementById("vocabQuizWord");
    const optionsEl = document.getElementById("vocabQuizOptionsContainer");
    const footerEl = document.getElementById("vocabQuizFeedbackFooter");

    if (progressEl) progressEl.textContent = `Soru ${currentNum} / ${total}`;
    if (corrEl) corrEl.textContent = String(state.correct);
    if (wrongEl) wrongEl.textContent = String(state.wrong);
    if (barEl) barEl.style.width = `${pct}%`;

    if (sourceBadgeEl) sourceBadgeEl.textContent = q.sourceLabel || "YDS Kelimesi";
    if (freqBadgeEl) freqBadgeEl.textContent = `YDS'de ${q.freq || 1} Kez`;
    if (wordTitleEl) wordTitleEl.textContent = q.word;

    if (footerEl) {
      footerEl.classList.add("hidden");
    }

    if (optionsEl) {
      optionsEl.innerHTML = "";
      const letters = ["A", "B", "C", "D", "E"];
      q.options.forEach((optText, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.idx = String(idx);
        btn.className = "vocab-quiz-opt-btn w-full p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-gray-700/70 text-left flex items-center gap-3 transition shadow-2xs group";
        btn.innerHTML = `
          <span class="vocab-quiz-opt-letter w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 group-hover:bg-indigo-600 group-hover:text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 transition">
            ${letters[idx] || idx + 1}
          </span>
          <span class="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug flex-1">
            ${optText}
          </span>
        `;
        btn.addEventListener("click", () => this.selectVocabQuizOption(idx));
        optionsEl.appendChild(btn);
      });
    }
  }

  selectVocabQuizOption(selectedIdx) {
    const state = this.vocabQuizState;
    if (!state || state.answered) return;

    const q = state.questions[state.currentIndex];
    if (!q) return;

    state.answered = true;
    const isCorrect = selectedIdx === q.correctIndex;

    if (isCorrect) {
      state.correct++;
      this.playCorrectSound();
    } else {
      state.wrong++;
      state.missed.push(q);
      this.playWrongSound();
    }

    // Günlük hedef ve seriye katkı sağla
    this.recordDailyActivity(1);

    const corrEl = document.getElementById("vocabQuizCorrectCount");
    const wrongEl = document.getElementById("vocabQuizWrongCount");
    const barEl = document.getElementById("vocabQuizProgressBar");
    if (corrEl) corrEl.textContent = String(state.correct);
    if (wrongEl) wrongEl.textContent = String(state.wrong);
    if (barEl) {
      const pct = Math.round(((state.currentIndex + 1) / state.questions.length) * 100);
      barEl.style.width = `${pct}%`;
    }

    const optionsEl = document.getElementById("vocabQuizOptionsContainer");
    if (optionsEl) {
      const buttons = optionsEl.querySelectorAll(".vocab-quiz-opt-btn");
      buttons.forEach((btn, idx) => {
        btn.disabled = true;
        btn.classList.remove("hover:border-indigo-400", "dark:hover:border-indigo-500", "hover:bg-indigo-50/40", "dark:hover:bg-gray-700/70");
        const letterBadge = btn.querySelector(".vocab-quiz-opt-letter");

        if (idx === q.correctIndex) {
          btn.className = "vocab-quiz-opt-btn w-full p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-left flex items-center gap-3 transition shadow-xs";
          if (letterBadge) {
            letterBadge.className = "vocab-quiz-opt-letter w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0";
          }
        } else if (idx === selectedIdx && !isCorrect) {
          btn.className = "vocab-quiz-opt-btn w-full p-3.5 rounded-xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-left flex items-center gap-3 transition shadow-xs";
          if (letterBadge) {
            letterBadge.className = "vocab-quiz-opt-letter w-7 h-7 rounded-lg bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0";
          }
        } else {
          btn.classList.add("opacity-55");
        }
      });
    }

    const footerEl = document.getElementById("vocabQuizFeedbackFooter");
    const nextBtnText = document.getElementById("vocabQuizNextBtnText");
    const goQBtn = document.getElementById("vocabQuizGoQuestionsBtn");
    const isLast = state.currentIndex >= state.questions.length - 1;

    if (nextBtnText) {
      nextBtnText.textContent = isLast ? "Sonuçları Gör" : "Sonraki Soru";
    }
    if (goQBtn) {
      goQBtn.onclick = () => {
        this.closeVocabQuizModal();
        this.searchWordInExams(q.word);
      };
    }
    if (footerEl) {
      footerEl.classList.remove("hidden");
    }
  }

  addWordToPoolFromQuiz(word, meaning, btnEl = null) {
    if (!word || !meaning) return;
    const exists = this.learningPool.some(i => i.word.toLowerCase() === word.toLowerCase());
    if (!exists) {
      this.learningPool.push({
        id: "pool_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        word: word,
        meaning: meaning,
        sample: "",
        dateAdded: new Date().toLocaleDateString("tr-TR")
      });
      this.saveLearningPool();
      this.renderLearningPoolList();
    }
    if (btnEl) {
      btnEl.textContent = "Havuza Eklendi";
      btnEl.disabled = true;
      btnEl.className = "px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold";
    }
  }

  nextVocabQuizQuestion() {
    const state = this.vocabQuizState;
    if (!state) return;

    if (state.currentIndex < state.questions.length - 1) {
      state.currentIndex++;
      this.renderVocabQuizQuestion();
    } else {
      this.renderVocabQuizSummary();
    }
  }

  renderVocabQuizSummary() {
    const state = this.vocabQuizState;
    if (!state) return;

    document.getElementById("vocabQuizActiveBody")?.classList.add("hidden");
    document.getElementById("vocabQuizResultBody")?.classList.remove("hidden");

    const total = state.questions.length || 1;
    const pct = Math.round((state.correct / total) * 100);

    const scoreEl = document.getElementById("vocabQuizSummarySubtext");
    const corrEl = document.getElementById("vocabQuizFinalCorrect");
    const wrongEl = document.getElementById("vocabQuizFinalWrong");
    const rateEl = document.getElementById("vocabQuizFinalRate");
    const missedBox = document.getElementById("vocabQuizMissedContainer");

    if (scoreEl) scoreEl.textContent = `${total} kelimede ${state.correct} doğru yanıt verdiniz.`;
    if (corrEl) corrEl.textContent = String(state.correct);
    if (wrongEl) wrongEl.textContent = String(state.wrong);
    if (rateEl) rateEl.textContent = `%${pct}`;

    if (missedBox) {
      if (state.missed.length === 0) {
        missedBox.innerHTML = `
          <div class="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Tebrikler! Bu setteki tüm kelimeleri hatasız bildiniz.
          </div>
        `;
      } else {
        missedBox.innerHTML = `<h5 class="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1.5">Hata Yapılan Kelimeler</h5>`;
        state.missed.forEach(item => {
          const inPool = this.learningPool.some(p => p.word.toLowerCase() === item.word.toLowerCase());
          const row = document.createElement("div");
          row.className = "p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-rose-100 dark:border-gray-600 flex items-center justify-between gap-2";
          row.innerHTML = `
            <div class="min-w-0">
              <span class="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">${item.word}</span>
              <p class="text-[11px] text-gray-600 dark:text-gray-300 truncate">${item.options[item.correctIndex]}</p>
            </div>
            ${!inPool ? `
              <button type="button" class="missed-add-pool-btn flex-shrink-0 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold transition">
                + Havuza Ekle
              </button>
            ` : `
              <span class="flex-shrink-0 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Havuzda</span>
            `}
          `;
          const btn = row.querySelector(".missed-add-pool-btn");
          if (btn) {
            btn.addEventListener("click", () => {
              this.addWordToPoolFromQuiz(item.word, item.options[item.correctIndex], btn);
            });
          }
          missedBox.appendChild(row);
        });
      }
    }
  }

  speakVocabQuizWord() {
    const state = this.vocabQuizState;
    const q = state?.questions?.[state.currentIndex];
    if (q && q.word) {
      this.speakWord(q.word);
    }
  }

  resetLearnedVocab() {
    if (window.vocabTrainer && typeof window.vocabTrainer.resetLearnedVocab === "function") {
      window.vocabTrainer.resetLearnedVocab();
    }
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 2.1: YDS PUAN HEDEFİ & DİNAMİK SEVİYE ---
  // ============================================================

  setYdsScoreTarget(target) {
    const valid = [55, 70, 80, 90].includes(Number(target)) ? Number(target) : 70;
    this.ydsScoreTarget = valid;
    try {
      localStorage.setItem("yds_score_target", String(valid));
    } catch (e) {}
    this.updateYdsScoreTargetUI();
  }

  calculateEstimatedYdsScore() {
    const combined = { ...(this.practiceAnswers || {}), ...(this.examAnswers || {}) };
    const entries = Object.values(combined).filter(Boolean);
    const totalSolved = entries.length;
    const totalCorrect = entries.filter(a => a.isCorrect).length;

    if (totalSolved === 0) {
      return { totalSolved: 0, totalCorrect: 0, estimatedScore: 0, bandLabel: "Veri Bekleniyor" };
    }

    // YDS 80 soru = 100 puan (Her doğru 1.25 puan, doğruluk yüzdesi = 100 üzerinden puan karşılığı)
    const rawScore = (totalCorrect / totalSolved) * 100;
    const estimatedScore = Math.round(rawScore * 10) / 10;

    let bandLabel = "Başlangıç (<50)";
    if (estimatedScore >= 90) bandLabel = "A Seviyesi (90-100)";
    else if (estimatedScore >= 80) bandLabel = "B Seviyesi (80-89)";
    else if (estimatedScore >= 70) bandLabel = "C Seviyesi (70-79)";
    else if (estimatedScore >= 60) bandLabel = "D Seviyesi (60-69)";
    else if (estimatedScore >= 50) bandLabel = "E Seviyesi (50-59)";

    if (totalSolved < 10) {
      bandLabel += ` • Ön Tahmin (${totalSolved} Soru)`;
    }

    return { totalSolved, totalCorrect, estimatedScore, bandLabel };
  }

  updateYdsScoreTargetUI() {
    const scoreTextEl = document.getElementById("estimatedYdsScoreText");
    const bandBadgeEl = document.getElementById("estimatedYdsBandBadge");
    const diffTextEl = document.getElementById("ydsTargetDiffText");
    const scaleLabelEl = document.getElementById("ydsScoreScaleLabel");
    const pctBadgeEl = document.getElementById("ydsTargetPercentBadge");
    const barEl = document.getElementById("ydsScoreProgressBar");

    const target = this.ydsScoreTarget || 70;
    const { totalSolved, estimatedScore, bandLabel } = this.calculateEstimatedYdsScore();

    if (scoreTextEl) scoreTextEl.textContent = `${estimatedScore.toFixed(1)} Puan`;
    if (bandBadgeEl) bandBadgeEl.textContent = bandLabel;

    const targetNames = {
      55: "55 Puan (Akademik Baraj)",
      70: "70 Puan (C Seviyesi)",
      80: "80 Puan (B Seviyesi)",
      90: "90 Puan (A Seviyesi)"
    };
    const targetLabel = targetNames[target] || `${target} Puan`;

    if (scaleLabelEl) {
      scaleLabelEl.textContent = `0 Puan → Hedef: ${targetLabel}`;
    }

    const progressPct = totalSolved === 0 ? 0 : Math.min(100, Math.round((estimatedScore / target) * 100));
    if (barEl) barEl.style.width = `${progressPct}%`;

    if (pctBadgeEl) {
      if (totalSolved === 0) {
        pctBadgeEl.textContent = "Hedefe %0 Ulaşıldı";
      } else if (estimatedScore >= target) {
        pctBadgeEl.textContent = "Hedef Puan Aşıldı!";
      } else {
        pctBadgeEl.textContent = `Hedefe %${progressPct} Yaklaşıldı`;
      }
    }

    if (diffTextEl) {
      if (totalSolved === 0) {
        diffTextEl.textContent = `Seçili hedefiniz: ${targetLabel}. Tahmini YDS puanınızı görmek için soru çözmeye başlayın.`;
      } else if (estimatedScore >= target) {
        const surplus = (estimatedScore - target).toFixed(1);
        diffTextEl.textContent = `Tebrikler! Seçili hedefiniz olan ${target} puanın +${surplus} puan üzerindesiniz. Bir üst hedefi seçebilirsiniz!`;
      } else {
        const remainingPts = (target - estimatedScore).toFixed(1);
        const approxNetNeeded = Math.max(1, Math.ceil((target - estimatedScore) / 1.25));
        diffTextEl.textContent = `Hedefiniz: ${targetLabel} • Hedefe ulaşmak için ${remainingPts} puan (80 soruda yaklaşık +${approxNetNeeded} net) kaldı.`;
      }
    }

    [55, 70, 80, 90].forEach(val => {
      const btn = document.getElementById(`ydsTargetBtn${val}`);
      if (!btn) return;
      if (val === target) {
        btn.className = "px-2 py-1 rounded-lg text-[11px] font-extrabold transition bg-emerald-600 text-white shadow-2xs";
      } else {
        btn.className = "px-2 py-1 rounded-lg text-[11px] font-extrabold transition text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
      }
    });
  }

  // ============================================================
  // --- ÖZEL MOD TEMİZLİĞİ (SPRINT & HATA ERİTME) ---
  // ============================================================

  cleanupSpecialQuestionModes() {
    // 1. Aktif Sprint modu varsa durdur ve yedek cevapları geri yükle
    if (this.isSprintMode) {
      this.stopSprintTimer();
      if (this.sprintBackupAnswers && typeof this.sprintBackupAnswers === "object") {
        Object.entries(this.sprintBackupAnswers).forEach(([qId, backupAns]) => {
          if (!this.sprintAnswers?.[qId] && backupAns) {
            this.practiceAnswers[qId] = backupAns;
          }
        });
        this.savePracticeAnswers();
      }
      this.isSprintMode = false;
      this.sprintBackupAnswers = {};
    }
    document.getElementById("sprintModeBanner")?.classList.add("hidden");

    // 2. Aktif Hata Eritme modu varsa çözülmemiş soruların hata kaydını geri yükle
    if (this.isMistakeMelterMode) {
      if (this.mistakeMelterBackup && typeof this.mistakeMelterBackup === "object") {
        Object.entries(this.mistakeMelterBackup).forEach(([qId, backupAns]) => {
          const origin = this.mistakeMelterOrigins?.[qId] || "practice";
          if (origin === "exam") {
            this.examAnswers[qId] = backupAns;
          } else {
            this.practiceAnswers[qId] = backupAns;
          }
        });
        this.savePracticeAnswers();
        this.saveExamAnswers();
      }
      this.isMistakeMelterMode = false;
      this.mistakeMelterBackup = {};
      this.mistakeMelterOrigins = {};
    }
    document.getElementById("mistakeMelterBanner")?.classList.add("hidden");
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 2.2: 5 DAKİKADA 10 SORU HIZLI SPRINT MODU ---
  // ============================================================

  loadSprintRecords() {
    const defaults = { bestScore: 0, bestTime: null, totalSprints: 0 };
    try {
      const raw = localStorage.getItem("yds_sprint_records");
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch {
      return defaults;
    }
  }

  saveSprintRecords() {
    try {
      localStorage.setItem("yds_sprint_records", JSON.stringify(this.sprintRecords));
    } catch (e) {}
  }

  updateSprintHomeBadgeUI() {
    const badgeEl = document.getElementById("homeSprintRecordBadge");
    if (!badgeEl) return;
    if (!this.sprintRecords) this.sprintRecords = this.loadSprintRecords();
    if (this.sprintRecords.totalSprints > 0) {
      badgeEl.textContent = `REKOR: %${this.sprintRecords.bestScore}`;
    } else {
      badgeEl.textContent = "5 DK • 10 SORU";
    }
  }

  startSprintMode() {
    this.closeSprintResultModal();
    this.cleanupSpecialQuestionModes();

    if (this.isExamMode) {
      this.stopExamSmartTimer();
      this.isExamMode = false;
      this.currentExamYear = null;
      document.getElementById("examModeBanner")?.classList.add("hidden");
    }

    const practicePool = window.questionRepo
      ? window.questionRepo.getAlistirmaQuestions()
      : (window.PRACTICE_YDS_QUESTIONS || []);
    const fallbackPool = window.questionRepo ? window.questionRepo.getAll() : (this.allQuestions || []);
    const sourcePool = practicePool.length >= 10 ? practicePool : fallbackPool;

    if (!sourcePool || sourcePool.length === 0) {
      alert("Soru havuzu yüklenemedi.");
      return;
    }

    // Öncelikle çözülmemiş soruları seç, yetmezse rastgele tamamla
    const unsolved = sourcePool.filter(q => !this.practiceAnswers[q.id]);
    const solved = sourcePool.filter(q => !!this.practiceAnswers[q.id]);

    const selected = [
      ...unsolved.sort(() => Math.random() - 0.5),
      ...solved.sort(() => Math.random() - 0.5)
    ].slice(0, 10);

    this.sprintBackupAnswers = {};
    this.sprintAnswers = {};
    selected.forEach(q => {
      if (this.practiceAnswers[q.id]) {
        this.sprintBackupAnswers[q.id] = this.practiceAnswers[q.id];
        delete this.practiceAnswers[q.id];
      }
    });

    this.isPracticeMode = true;
    this.isSprintMode = true;
    this.sprintTotalSeconds = 300; // 5 dakika
    this.sprintSecondsLeft = 300;

    this.activePool = selected;
    this.filteredQuestions = selected;
    this.currentIndex = 0;
    this.practiceSessionActive = true;

    this.showQuestionView("practice");

    document.getElementById("sprintModeBanner")?.classList.remove("hidden");
    document.getElementById("mistakeMelterBanner")?.classList.add("hidden");

    const modeBadge = document.getElementById("questionViewModeBadge");
    if (modeBadge) {
      modeBadge.textContent = "Hızlı Sprint (5 Dakika • 10 Soru)";
      modeBadge.className = "px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300";
    }

    this.updateSprintBannerUI();
    this.startSprintTimer();
    this.updateStats();
    this.renderQuestion();
    this.renderQuestionGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  startSprintTimer() {
    this.stopSprintTimer();
    this.sprintTimerInterval = setInterval(() => {
      if (!this.isSprintMode) {
        this.stopSprintTimer();
        return;
      }
      this.sprintSecondsLeft = Math.max(0, (this.sprintSecondsLeft || 0) - 1);
      this.updateSprintBannerUI();

      if (this.sprintSecondsLeft <= 0) {
        this.stopSprintTimer();
        this.finishSprintMode(true);
      }
    }, 1000);
  }

  stopSprintTimer() {
    if (this.sprintTimerInterval) {
      clearInterval(this.sprintTimerInterval);
      this.sprintTimerInterval = null;
    }
  }

  updateSprintBannerUI() {
    const progEl = document.getElementById("sprintProgressBadge");
    const timerEl = document.getElementById("sprintTimerDisplay");
    const pillEl = document.getElementById("sprintTimerPill");

    const total = this.filteredQuestions.length || 10;
    const answeredList = Object.values(this.sprintAnswers || {});
    const answeredCount = answeredList.length;
    const correctCount = answeredList.filter(a => a.isCorrect).length;
    const wrongCount = answeredCount - correctCount;

    if (progEl) {
      progEl.textContent = `${answeredCount} / ${total} Cevaplandı • ${correctCount} D / ${wrongCount} Y`;
    }

    const secs = Math.max(0, this.sprintSecondsLeft || 0);
    const mins = String(Math.floor(secs / 60)).padStart(2, "0");
    const remSecs = String(secs % 60).padStart(2, "0");

    if (timerEl) {
      timerEl.textContent = `${mins}:${remSecs}`;
    }

    if (pillEl) {
      if (secs <= 60) {
        pillEl.className = "px-3 py-1.5 rounded-xl bg-rose-600/90 border border-rose-300 flex items-center space-x-1.5 font-mono text-sm font-black text-white sprint-timer-urgent";
      } else {
        pillEl.className = "px-3 py-1.5 rounded-xl bg-black/30 border border-white/20 flex items-center space-x-1.5 font-mono text-sm font-black text-amber-300";
      }
    }
  }

  finishSprintMode(timeExpired = false) {
    this.stopSprintTimer();

    const total = this.filteredQuestions.length || 10;
    const answeredList = Object.values(this.sprintAnswers || {});
    const answeredCount = answeredList.length;
    const correct = answeredList.filter(a => a.isCorrect).length;
    const wrong = answeredCount - correct;
    const empty = Math.max(0, total - answeredCount);
    const scorePct = Math.round((correct / total) * 100);

    const elapsedSeconds = Math.max(1, (this.sprintTotalSeconds || 300) - (this.sprintSecondsLeft || 0));
    const avgSec = answeredCount > 0 ? Math.round(elapsedSeconds / answeredCount) : 0;

    const eMin = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    const eSec = String(elapsedSeconds % 60).padStart(2, "0");

    if (!this.sprintRecords) this.sprintRecords = this.loadSprintRecords();
    this.sprintRecords.totalSprints = (this.sprintRecords.totalSprints || 0) + 1;
    if (scorePct > (this.sprintRecords.bestScore || 0)) {
      this.sprintRecords.bestScore = scorePct;
    }
    if (!this.sprintRecords.bestTime || (correct >= 7 && elapsedSeconds < this.sprintRecords.bestTime)) {
      this.sprintRecords.bestTime = elapsedSeconds;
    }
    this.saveSprintRecords();
    this.updateSprintHomeBadgeUI();

    const subEl = document.getElementById("sprintResultSubtext");
    const scoreEl = document.getElementById("sprintFinalScoreText");
    const bestEl = document.getElementById("sprintBestRecordText");
    const corrEl = document.getElementById("sprintFinalCorrect");
    const wrongEl = document.getElementById("sprintFinalWrong");
    const emptyEl = document.getElementById("sprintFinalEmpty");
    const timeEl = document.getElementById("sprintFinalTimeText");
    const avgEl = document.getElementById("sprintFinalAvgTimeText");

    if (subEl) {
      subEl.textContent = timeExpired
        ? "5 dakikalık süre doldu! İşte hız ve doğruluk karneniz:"
        : "Sprint tamamlandı! İşte hız ve doğruluk karneniz:";
    }
    if (scoreEl) scoreEl.textContent = `%${scorePct} (${correct}/${total})`;
    if (bestEl) bestEl.textContent = `En İyi Sprint Rekorunuz: %${this.sprintRecords.bestScore}`;
    if (corrEl) corrEl.textContent = String(correct);
    if (wrongEl) wrongEl.textContent = String(wrong);
    if (emptyEl) emptyEl.textContent = String(empty);
    if (timeEl) timeEl.textContent = `${eMin}:${eSec}`;
    if (avgEl) avgEl.textContent = answeredCount > 0 ? `${avgSec} sn / soru` : "-";

    const modal = document.getElementById("sprintResultModal");
    if (modal) {
      this.lockScroll();
      modal.classList.remove("hidden");
    }
  }

  closeSprintResultModal() {
    this.unlockScroll();
    document.getElementById("sprintResultModal")?.classList.add("hidden");
  }

  exitSprintMode(goHome = true) {
    this.cleanupSpecialQuestionModes();
    if (goHome) {
      this.showHomeView();
    }
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 2.3: İNATÇI HATALARIM (AKILLI HATA ERİTME) ---
  // ============================================================

  getWrongQuestionsList() {
    const questionMap = new Map();
    if (window.questionRepo && typeof window.questionRepo.getAll === "function") {
      window.questionRepo.getAll().forEach(q => questionMap.set(q.id, q));
    }
    (this.allQuestions || []).forEach(q => questionMap.set(q.id, q));
    if (window.PRACTICE_YDS_QUESTIONS) {
      window.PRACTICE_YDS_QUESTIONS.forEach(q => questionMap.set(q.id, q));
    }

    const wrongItems = [];
    const seen = new Set();

    Object.entries(this.practiceAnswers || {}).forEach(([qId, ans]) => {
      if (ans && ans.isCorrect === false && !seen.has(qId)) {
        const q = questionMap.get(qId);
        if (q) {
          seen.add(qId);
          wrongItems.push({ q, origin: "practice", ans });
        }
      }
    });

    Object.entries(this.examAnswers || {}).forEach(([qId, ans]) => {
      if (ans && ans.isCorrect === false && !seen.has(qId)) {
        const q = questionMap.get(qId);
        if (q) {
          seen.add(qId);
          wrongItems.push({ q, origin: "exam", ans });
        }
      }
    });

    // Aktif hata eritme oturumunda henüz cevaplanmamış yedekleri de say
    Object.entries(this.mistakeMelterBackup || {}).forEach(([qId, ans]) => {
      if (ans && ans.isCorrect === false && !seen.has(qId)) {
        const q = questionMap.get(qId);
        if (q) {
          seen.add(qId);
          wrongItems.push({ q, origin: this.mistakeMelterOrigins?.[qId] || "practice", ans });
        }
      }
    });

    return wrongItems;
  }

  updateMistakeMelterHomeUI() {
    const wrongList = this.getWrongQuestionsList();
    const wrongCount = wrongList.length;
    const meltedCount = this.meltedMistakesCount || 0;

    const homeMistakeBadge = document.getElementById("homeMistakeCountBadge");
    const homeMeltedBadge = document.getElementById("homeMeltedCountBadge");
    const homeBtnText = document.getElementById("homeMistakeBtnText");
    const repSummaryText = document.getElementById("repMistakeSummaryText");
    const repMeltedText = document.getElementById("repMeltedCountText");

    if (homeMistakeBadge) {
      homeMistakeBadge.textContent = wrongCount > 0 ? `${wrongCount} Hatalı Soru` : "0 Hata";
    }
    if (homeMeltedBadge) {
      homeMeltedBadge.textContent = `${meltedCount} Eritildi`;
    }
    if (homeBtnText) {
      homeBtnText.textContent = wrongCount > 0
        ? `${wrongCount} Hatalı Soruyu Eritmeye Başla`
        : "Hata Havuzunu Kontrol Et";
    }
    if (repMeltedText) {
      repMeltedText.textContent = `${meltedCount} Hata Eritildi`;
    }
    if (repSummaryText) {
      repSummaryText.textContent = wrongCount > 0
        ? `Şu an hata havuzunuzda tekrar çözülmeyi bekleyen ${wrongCount} yanlış sorunuz var. Doğru çözdüğünüz her soru havuzdan düşer!`
        : `Harika! Hata havuzunuzda bekleyen yanlış soru bulunmuyor. Şimdiye kadar toplam ${meltedCount} hatayı erittiniz.`;
    }
  }

  startMistakeMelterMode() {
    this.cleanupSpecialQuestionModes();

    const wrongItems = this.getWrongQuestionsList();
    if (wrongItems.length === 0) {
      alert("Harika! Şu an hata havuzunuzda yanlış cevaplanmış soru bulunmuyor. Yeni sorular çözerek kendinizi test edebilirsiniz.");
      return;
    }

    if (this.isExamMode) {
      this.stopExamSmartTimer();
      this.isExamMode = false;
      this.currentExamYear = null;
      document.getElementById("examModeBanner")?.classList.add("hidden");
    }

    this.isPracticeMode = true;
    this.isMistakeMelterMode = true;
    this.mistakeMelterSessionMelted = 0;
    this.mistakeMelterBackup = {};
    this.mistakeMelterOrigins = {};

    const questionsToMelt = wrongItems.map(item => {
      const qId = item.q.id;
      this.mistakeMelterBackup[qId] = item.ans;
      this.mistakeMelterOrigins[qId] = item.origin;
      // Sorunun yeniden çözülebilmesi için mevcut kilidi geçici olarak kaldır
      delete this.practiceAnswers[qId];
      delete this.examAnswers[qId];
      return item.q;
    });

    this.activePool = questionsToMelt;
    this.filteredQuestions = questionsToMelt;
    this.currentIndex = 0;
    this.practiceSessionActive = true;

    this.showQuestionView("practice");

    document.getElementById("mistakeMelterBanner")?.classList.remove("hidden");
    document.getElementById("sprintModeBanner")?.classList.add("hidden");

    const modeBadge = document.getElementById("questionViewModeBadge");
    if (modeBadge) {
      modeBadge.textContent = `Hata Eritme Modu (${questionsToMelt.length} Soru)`;
      modeBadge.className = "px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300";
    }

    this.updateMistakeMelterBannerUI();
    this.updateStats();
    this.renderQuestion();
    this.renderQuestionGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateMistakeMelterBannerUI() {
    const badgeEl = document.getElementById("mistakeMelterSessionBadge");
    const statusEl = document.getElementById("mistakeMelterStatusText");

    const remainingUnanswered = Object.keys(this.mistakeMelterBackup || {}).length;
    if (badgeEl) {
      badgeEl.textContent = `Bu Oturumda ${this.mistakeMelterSessionMelted || 0} Hata Eritildi`;
    }
    if (statusEl) {
      statusEl.textContent = remainingUnanswered > 0
        ? `Kalan ${remainingUnanswered} hatalı soruyu doğru yanıtlayarak hata havuzunuzu sıfırlayın.`
        : `Bu oturumdaki tüm hatalı soruları tamamladınız! Toplam ${this.mistakeMelterSessionMelted || 0} hata eritildi.`;
    }
  }

  exitMistakeMelterMode() {
    this.cleanupSpecialQuestionModes();
    this.showHomeView();
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 2.4: OKUMA MODU (İPUCU VURGULAMA) & HIZLI KAMP REHBERİ ---
  // ============================================================

  getClueHighlightClass(cleanWord) {
    if (!cleanWord) return "";
    const contrastWords = new Set([
      "although", "though", "despite", "however", "nevertheless", "nonetheless",
      "whereas", "while", "yet", "still", "conversely", "contrary", "unlike",
      "instead", "regardless", "albeit", "even"
    ]);
    const causeWords = new Set([
      "because", "since", "therefore", "thus", "hence", "consequently",
      "accordingly", "due", "owing", "thanks", "result", "results", "resulting",
      "lead", "leads", "leading", "trigger", "triggers", "stem", "stems", "thereby"
    ]);
    const timeConditionWords = new Set([
      "unless", "provided", "providing", "whether", "until", "during", "once",
      "whenever", "only", "never", "always", "completely", "entirely", "solely",
      "merely", "hardly", "scarcely", "barely", "rarely", "notably"
    ]);

    if (contrastWords.has(cleanWord)) return "clue-contrast";
    if (causeWords.has(cleanWord)) return "clue-cause";
    if (timeConditionWords.has(cleanWord)) return "clue-time";
    return "";
  }

  toggleClueHighlight() {
    this.clueHighlightEnabled = !this.clueHighlightEnabled;
    try {
      localStorage.setItem("yds_clue_highlight", this.clueHighlightEnabled ? "true" : "false");
    } catch (e) {}
    this.updateClueHighlightButtonUI();
    if (this.currentView === "question") {
      this.renderQuestion();
    }
  }

  updateClueHighlightButtonUI() {
    const btn = document.getElementById("clueHighlightBtn");
    const textEl = document.getElementById("clueHighlightBtnText");
    const legendEl = document.getElementById("clueLegendBar");

    if (btn) {
      if (this.clueHighlightEnabled) {
        btn.className = "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold bg-indigo-600 text-white border border-indigo-600 shadow-xs transition active:scale-95";
      } else {
        btn.className = "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-indigo-400 transition active:scale-95 shadow-2xs";
      }
    }
    if (textEl) {
      textEl.textContent = this.clueHighlightEnabled ? "İpuçları Açık" : "İpucu Vurgula";
    }
    if (legendEl) {
      if (this.clueHighlightEnabled) {
        legendEl.classList.remove("hidden");
      } else {
        legendEl.classList.add("hidden");
      }
    }
  }

  getGrammarCampData() {
    return [
      // 1. BAĞLAÇLAR (CONJUNCTIONS)
      {
        type: "conjunction",
        title: "Although / Even though / Though",
        rule: "+ Tam Cümle (SVO)",
        polarity: "Zıtlık (+ / -)",
        meaning: "-e rağmen, her ne kadar ... olsa da",
        tip: "Yan cümlede olumlu bir durum varsa ana cümlede beklenmedik bir engel veya olumsuzluk aranır.",
        sample: "Although the treatment is effective, it has severe side effects.",
        searchKw: "although"
      },
      {
        type: "conjunction",
        title: "Despite / In spite of / Notwithstanding",
        rule: "+ İsim / V-ing / the fact that SVO",
        polarity: "Zıtlık (+ / -)",
        meaning: "-e rağmen, -e karşın",
        tip: "Arkasından tam cümle (SVO) doğrudan gelmez; isim grubu veya 'the fact that + cümle' alır.",
        sample: "Despite dramatic advances in medicine, malaria remains a global threat.",
        searchKw: "despite"
      },
      {
        type: "conjunction",
        title: "Whereas / While",
        rule: "+ Tam Cümle (SVO)",
        polarity: "Taban Tabana Zıtlık",
        meaning: "-iken, oysa (iki farklı özneyi karşılaştırır)",
        tip: "Genellikle iki farklı kavramı, ülkeyi veya dönemi zıt özellikleriyle kıyaslarken kullanılır.",
        sample: "While some species thrive in arid climates, others require constant moisture.",
        searchKw: "whereas"
      },
      {
        type: "conjunction",
        title: "However / Nevertheless / Nonetheless",
        rule: "Noktalı virgül veya yeni cümle başı (+ SVO)",
        polarity: "Zıtlık (+ / -)",
        meaning: "Ancak, buna rağmen, yine de",
        tip: "İki cümle arasında geçiş yapar; kendisinden sonra genellikle virgül (,) gelir.",
        sample: "The initial experiment failed; however, subsequent trials proved successful.",
        searchKw: "however"
      },
      {
        type: "conjunction",
        title: "Because / Since / As / Now that",
        rule: "+ Tam Cümle (SVO)",
        polarity: "Neden - Sonuç (+/+ veya -/-)",
        meaning: "-dığı için, çünkü, madem ki",
        tip: "Cümleye neden-sonuç anlamı katar; iki tarafın anlam kutbu genellikle paraleldir.",
        sample: "Since fossil fuels are depleting rapidly, renewable energy is vital.",
        searchKw: "since"
      },
      {
        type: "conjunction",
        title: "Due to / Owing to / On account of",
        rule: "+ İsim / V-ing / the fact that SVO",
        polarity: "Neden - Sonuç",
        meaning: "-den dolayı, yüzünden, nedeniyle",
        tip: "Boşluktan sonra tam cümle değil isim tamlaması varsa 'because' yerine bu grup seçilir.",
        sample: "Many flights were cancelled due to adverse weather conditions.",
        searchKw: "due"
      },
      {
        type: "conjunction",
        title: "Thanks to",
        rule: "+ İsim / V-ing",
        polarity: "Olumlu Neden - Sonuç (+)",
        meaning: "... sayesinde",
        tip: "Sonuç cümlesi почти her zaman olumlu bir gelişmeyi veya başarıyı anlatır.",
        sample: "Thanks to early diagnosis, the survival rate has increased significantly.",
        searchKw: "thanks"
      },
      {
        type: "conjunction",
        title: "Therefore / Consequently / Thus / Hence",
        rule: "+ Tam Cümle (veya V-ing kısaltma)",
        polarity: "Sonuç / Çıkarım",
        meaning: "Bu yüzden, dolayısıyla, sonuç olarak",
        tip: "Önceki cümlede anlatılan nedenin doğal sonucunu bağlar.",
        sample: "The soil lacks essential nutrients; therefore, crop yields remain low.",
        searchKw: "therefore"
      },
      {
        type: "conjunction",
        title: "Unless",
        rule: "+ Olumlu Yapıda Cümle (Present)",
        polarity: "Olumsuz Koşul (If ... not)",
        meaning: "-medikçe, -madıkça, ... olmazsa",
        tip: "Kendi içinde 'not' barındırdığı için yan cümlesi genellikle olumlu fiille kurulur, ana cümle olumsuz sonuç bildirir.",
        sample: "Unless immediate measures are taken, the ecosystem will collapse.",
        searchKw: "unless"
      },
      {
        type: "conjunction",
        title: "Provided that / As long as / So long as",
        rule: "+ Tam Cümle (SVO)",
        polarity: "Koşul",
        meaning: "... şartıyla, ... sürece",
        tip: "Güçlü bir şart bildirir; 'If' bağlacının resmi akademik karşılığıdır.",
        sample: " Economic growth is sustainable provided that inflation remains under control.",
        searchKw: "provided"
      },
      {
        type: "conjunction",
        title: "In case",
        rule: "+ Tam Cümle (SVO)",
        polarity: "Tedbir / Önlem",
        meaning: "... olursa diye, ihtimaline karşı",
        tip: "Öncesinde yapılan bir hazırlığı veya alınan bir tedbiri (take precaution) anlatır.",
        sample: "Keep emergency supplies ready in case an earthquake strikes.",
        searchKw: "case"
      },
      {
        type: "conjunction",
        title: "So that / In order that",
        rule: "+ Tam Cümle (genellikle can/could/may/will)",
        polarity: "Amaç",
        meaning: "-sın diye, ... amacıyla",
        tip: "Devamındaki cümlede %90 oranında 'can, could, may, might, will, would' gibi bir modal bulunur.",
        sample: "The government lowered taxes so that small businesses could expand.",
        searchKw: "order"
      },
      {
        type: "conjunction",
        title: "In order to / So as to",
        rule: "+ V1 (Yalın Fiil)",
        polarity: "Amaç",
        meaning: "-mek / -mak için, amacıyla",
        tip: "Olumsuz hali 'in order not to / so as not to V1' şeklinde yazılır.",
        sample: "Researchers analyzed thousands of samples in order to identify the virus.",
        searchKw: "order"
      },
      {
        type: "conjunction",
        title: "Not only ... but also ...",
        rule: "Paralel Yapı (Cümle başında devrik: Not only did/is...)",
        polarity: "Ek Bilgi & Vurgu",
        meaning: "Sadece ... değil, aynı zamanda ... da",
        tip: "Cümle en başında 'Not only' varsa birinci cümle soru formunda devrik (Inversion) olur!",
        sample: "Not only does exercise improve physical health, but it also reduces stress.",
        searchKw: "only"
      },
      {
        type: "conjunction",
        title: "No sooner ... than / Hardly ... when",
        rule: "Past Perfect (had V3) ... Simple Past (V2)",
        polarity: "Zaman (Tam ... olmuştu ki)",
        meaning: "Tam ... olmuştu ki ... oldu",
        tip: "No sooner her zaman 'than' ile, Hardly/Scarcely/Barely ise 'when' ile eşleşir.",
        sample: "Hardly had the treaty been signed when border tensions erupted again.",
        searchKw: "hardly"
      },

      // 2. EDATLAR & KALIPLAR (PREPOSITIONS)
      {
        type: "preposition",
        title: "Dependent on / Rely on / Count on",
        rule: "Sıfat/Fiil + ON",
        polarity: "Bağımlılık / Güven",
        meaning: "-e bağımlı olmak, -e bel bağlamak",
        tip: "YDS'de 'on/upon' edatıyla en sık sorulan üçlüdür (independent OF ile karıştırmayın!).",
        sample: "Many developing nations are heavily dependent on agricultural exports.",
        searchKw: "dependent"
      },
      {
        type: "preposition",
        title: "Associated with / Linked to",
        rule: "Fiil/Sıfat + WITH / TO",
        polarity: "İlişki / Bağlantı",
        meaning: "... ile ilişkili, bağlantılı",
        tip: "Hastalık, risk veya bilimsel bulguların bir faktörle ilişkisini anlatırken çok sık çıkar.",
        sample: "Air pollution is closely associated with respiratory diseases.",
        searchKw: "associated"
      },
      {
        type: "preposition",
        title: "Result in vs. Result from",
        rule: "Result IN (Sonuç) / Result FROM (Kaynak)",
        polarity: "Neden - Sonuç Fiili",
        meaning: "Result in: -e yol açmak • Result from: -den kaynaklanmak",
        tip: "Result IN = Lead to / Bring about. Result FROM = Stem from / Arise from.",
        sample: "Prolonged drought can result in severe food shortages.",
        searchKw: "result"
      },
      {
        type: "preposition",
        title: "Contribute to / Lead to / Give rise to",
        rule: "Fiil + TO (+ İsim / V-ing)",
        polarity: "Katkı / Yol Açma",
        meaning: "-e katkıda bulunmak, -e yol açmak",
        tip: "Buradaki 'to' yönelme edatıdır; kendisinden sonra fiil gelirse V-ing alır.",
        sample: "Deforestation significantly contributes to global warming.",
        searchKw: "contribute"
      },
      {
        type: "preposition",
        title: "Vulnerable to / Susceptible to / Prone to",
        rule: "Sıfat + TO",
        polarity: "Hassasiyet / Savunmasızlık (-)",
        meaning: "-e karşı savunmasız, açık, yatkın",
        tip: "Özellikle sağlık, ekonomi ve ekoloji metinlerinde 'to' edatıyla banko sorulur.",
        sample: "Coastal cities are increasingly vulnerable to rising sea levels.",
        searchKw: "vulnerable"
      },
      {
        type: "preposition",
        title: "Prevent from / Abstain from / Refrain from",
        rule: "Fiil + FROM (+ V-ing)",
        polarity: "Engelleme / Kaçınma",
        meaning: "-den alıkoymak, -den kaçınmak / uzak durmak",
        tip: "Engelleme ve uzak durma fiilleri YDS'de daima 'from' edatı alır.",
        sample: "Strict regulations prevent factories from dumping toxic waste.",
        searchKw: "prevent"
      },
      {
        type: "preposition",
        title: "Responsible for / Account for",
        rule: "Sıfat/Fiil + FOR",
        polarity: "Sorumluluk / Oran Oluşturma",
        meaning: "-den sorumlu olmak, (belli bir oranı) oluşturmak",
        tip: "'Account for' yüzdelik oranlarla (%40 of...) kullanıldığında 'oluşturmak/teşkil etmek' demektir.",
        sample: "Transport accounts for nearly a quarter of global carbon emissions.",
        searchKw: "responsible"
      },
      {
        type: "preposition",
        title: "Compatible with / Consistent with",
        rule: "Sıfat + WITH",
        polarity: "Uyum / Tutarlılık (+)",
        meaning: "... ile uyumlu, ... ile tutarlı",
        tip: "Kanıtların veya verilerin bir teoriyle tutarlı olduğunu anlatırken 'with' alır.",
        sample: "The new findings are fully consistent with previous geological models.",
        searchKw: "consistent"
      },
      {
        type: "preposition",
        title: "Consist of / Composed of / Comprise",
        rule: "Consist OF / Be composed OF (Comprise edat almaz!)",
        polarity: "İçerik / Oluşum",
        meaning: "-den oluşmak, meydana gelmek",
        tip: "Consist of pasif yapılmaz; composed of ise daima 'be composed of' şeklinde pasif kullanılır.",
        sample: "The committee consists of ten independent scientists.",
        searchKw: "consist"
      },
      {
        type: "preposition",
        title: "Capable of / Aware of / Deprived of",
        rule: "Sıfat + OF",
        polarity: "Yetenek / Farkındalık / Yoksunluk",
        meaning: "-e muktedir, -nın farkında, -den yoksun",
        tip: "Arkasından gelen fiil daima V-ing (gerund) formunda olur.",
        sample: "Many rural areas remain deprived of basic healthcare services.",
        searchKw: "capable"
      },
      {
        type: "preposition",
        title: "Exposure to / Access to / Threat to",
        rule: "İsim + TO",
        polarity: "Yönelme İsimleri",
        meaning: "-e maruz kalma, -e erişim, -e yönelik tehdit",
        tip: "Boşluktan önce 'exposure, access, threat, resistance, solution, key' varsa doğru edat 'to'dur.",
        sample: "Long-term exposure to ultraviolet radiation damages skin cells.",
        searchKw: "exposure"
      },
      {
        type: "preposition",
        title: "In terms of / With respect to / Regarding",
        rule: "Karma Edat + İsim",
        polarity: "Bakımından / Açısından",
        meaning: "... açısından, ... bakımından, ... ile ilgili olarak",
        tip: "Cümlede konunun hangi boyutuyla ele alındığını belirtir.",
        sample: "The two regions differ sharply in terms of annual rainfall.",
        searchKw: "terms"
      },
      {
        type: "preposition",
        title: "By means of / Through / Via",
        rule: "Edat + İsim / V-ing",
        polarity: "Araç / Yöntem",
        meaning: "... aracılığıyla, vasıtasıyla, yoluyla",
        tip: "Bir işlemin hangi yöntem veya araç kullanılarak yapıldığını gösterir.",
        sample: "Heat is transferred through the atmosphere by means of radiation.",
        searchKw: "means"
      },
      {
        type: "preposition",
        title: "At the expense of",
        rule: "Kalıp + İsim",
        polarity: "Pahasına / Uğruna (-)",
        meaning: "... pahasına, ...-yı feda etme uğruna",
        tip: "Bir kazancın başka bir şeyin zarar görmesi pahasına elde edildiğini anlatır.",
        sample: "Rapid industrialization was achieved at the expense of environmental quality.",
        searchKw: "expense"
      },
      {
        type: "preposition",
        title: "In accordance with / In compliance with",
        rule: "Kalıp + İsim",
        polarity: "Uyum / Kurallara Göre",
        meaning: "... ile uyumlu olarak, ...-e göre / uyarınca",
        tip: "Yasa, yönetmelik veya standartlara uygun hareket edildiğini belirtir.",
        sample: "All clinical trials must be conducted in accordance with ethical guidelines.",
        searchKw: "accordance"
      },

      // 3. PHRASAL VERBS
      {
        type: "phrasal",
        title: "Bring about / Give rise to",
        rule: "Eş anlam: Cause, Lead to, Trigger",
        polarity: "Neden Olmak",
        meaning: "Meydana getirmek, sebep olmak, yol açmak",
        tip: "YDS kelime sorularında en çok doğru cevap olan Phrasal Verb'dür.",
        sample: "The industrial revolution brought about profound social changes.",
        searchKw: "brought"
      },
      {
        type: "phrasal",
        title: "Carry out / Conduct",
        rule: "Eş anlam: Perform, Execute, Implement",
        polarity: "Yürütmek / Uygulamak",
        meaning: "(Deney, araştırma, görev) yürütmek, gerçekleştirmek",
        tip: "Nesnesi 'experiment, research, survey, study, reform' ise ilk akla gelmelidir.",
        sample: "Scientists carried out extensive experiments to test the hypothesis.",
        searchKw: "carried"
      },
      {
        type: "phrasal",
        title: "Put off / Call off",
        rule: "Put off = Postpone • Call off = Cancel",
        polarity: "Ertelemek / İptal Etmek",
        meaning: "Put off: Ertelemek • Call off: İptal etmek",
        tip: "İkisi sıkça aynı şıklarda verilir; erteleme mi yoksa tamamen iptal mi olduğuna dikkat edin.",
        sample: "The summit was put off until next month due to diplomatic tensions.",
        searchKw: "put"
      },
      {
        type: "phrasal",
        title: "Figure out / Make out / Work out",
        rule: "Eş anlam: Understand, Solve, Decipher",
        polarity: "Anlamak / Çözmek",
        meaning: "Anlamak, çözmek, kavrayıp ortaya çıkarmak",
        tip: "Karmaşık bir mekanizmanın veya sorunun nasıl çalıştığını çözmek anlamında kullanılır.",
        sample: "Astronomers are still trying to figure out the origin of dark matter.",
        searchKw: "figure"
      },
      {
        type: "phrasal",
        title: "Make up for / Compensate for",
        rule: "3 kelimeli Phrasal Verb",
        polarity: "Telafi Etmek (+)",
        meaning: "Telafi etmek, eksikliğini kapatmak",
        tip: "Bir kaybı veya eksikliği dengelemek anlamında 'compensate for' ile tam eş anlamlıdır.",
        sample: "Increased exports helped make up for the decline in domestic demand.",
        searchKw: "compensate"
      },
      {
        type: "phrasal",
        title: "Put up with / Tolerate",
        rule: "Eş anlam: Endure, Bear, Stand",
        polarity: "Katlanmak / Tahammül Etmek",
        meaning: "Katlanmak, tahammül etmek, hoş görmek",
        tip: "Zorlu koşullar, gürültü veya olumsuz durumlara katlanmak bağlamında sorulur.",
        sample: "Residents refused to put up with the constant noise from the airport.",
        searchKw: "tolerate"
      },
      {
        type: "phrasal",
        title: "Look into / Investigate",
        rule: "Eş anlam: Examine, Inspect, Probe",
        polarity: "İncelemek / Araştırmak",
        meaning: "Araştırmak, incelemek, soruşturmak",
        tip: "Bir komisyonun veya bilim insanlarının bir sorunu derinlemesine incelemesini anlatır.",
        sample: "A special committee was set up to look into the causes of the accident.",
        searchKw: "investigate"
      },
      {
        type: "phrasal",
        title: "Turn down / Reject",
        rule: "Eş anlam: Refuse, Decline, Dismiss",
        polarity: "Reddetmek (-)",
        meaning: "Geri çevirmek, reddetmek (veya sesi/ısıyı kısmak)",
        tip: "Teklif, başvuru veya öneri (offer, proposal) nesneleriyle 'reddetmek' anlamında çıkar.",
        sample: "The board turned down the merger proposal due to financial risks.",
        searchKw: "turned"
      },
      {
        type: "phrasal",
        title: "Take over / Assume control",
        rule: "Phrasal Verb",
        polarity: "Devralmak",
        meaning: "Devralmak, yönetimini/kontrolünü üstlenmek",
        tip: "Şirketlerin, kurumların veya görevlerin el değiştirmesini anlatır.",
        sample: "Automated systems have taken over many routine manufacturing tasks.",
        searchKw: "taken"
      },
      {
        type: "phrasal",
        title: "Wipe out / Eradicate",
        rule: "Eş anlam: Destroy, Eliminate, Obliterate",
        polarity: "Yok Etmek / Kökünü Kazımak (-)",
        meaning: "Tamamen yok etmek, ortadan kaldırmak",
        tip: "Salgın hastalıkların veya canlı türlerinin yok olması bağlamında çok sık çıkar.",
        sample: "Vaccination campaigns have nearly wiped out polio worldwide.",
        searchKw: "wiped"
      },
      {
        type: "phrasal",
        title: "Come up with / Devise",
        rule: "3 kelimeli Phrasal Verb",
        polarity: "Üretmek / Bulmak (+)",
        meaning: "(Fikir, çözüm, plan) bulmak, ortaya atmak, geliştirmek",
        tip: "Nesnesi her zaman 'solution, idea, plan, alternative, theory' gibi soyut bir üretimdir.",
        sample: "Engineers came up with an innovative solution to reduce fuel consumption.",
        searchKw: "solution"
      },
      {
        type: "phrasal",
        title: "Point out / Indicate",
        rule: "Eş anlam: Highlight, Emphasize, Note",
        polarity: "Belirtmek / Dikkat Çekmek",
        meaning: "Dikkat çekmek, işaret etmek, belirtmek",
        tip: "Uzmanların veya raporların önemli bir gerçeğe dikkat çektiğini ifade eder.",
        sample: "Economists point out that inflation affects low-income households most.",
        searchKw: "point"
      },
      {
        type: "phrasal",
        title: "Rule out / Exclude",
        rule: "Eş anlam: Eliminate, Dismiss, Preclude",
        polarity: "İhtimal Dışı Bırakmak",
        meaning: "Göz ardı etmek, ihtimal dışı bırakmak, elemek",
        tip: "Genellikle 'cannot rule out the possibility' (ihtimalini göz ardı edemeyiz) kalıbıyla sorulur.",
        sample: "Doctors cannot rule out the possibility of a genetic predisposition.",
        searchKw: "rule"
      },
      {
        type: "phrasal",
        title: "Stem from / Arise from",
        rule: "Eş anlam: Originate from, Result from, Derive from",
        polarity: "Kaynaklanmak",
        meaning: "-den kaynaklanmak, köken almak, ileri gelmek",
        tip: "Bir sorunun veya geleneğin nereden doğduğunu anlatır.",
        sample: "Many modern legal principles stem from ancient Roman law.",
        searchKw: "stem"
      },
      {
        type: "phrasal",
        title: "Break out / Erupt",
        rule: "Nesne Almaz (Intransitive)",
        polarity: "Patlak Vermek (-)",
        meaning: "(Savaş, salgın, yangın, kriz) aniden patlak vermek, başlamak",
        tip: "Öznesi 'war, conflict, epidemic, fire, violence' ise banko seçenektir.",
        sample: "Severe cholera epidemics broke out in several overcrowded cities.",
        searchKw: "broke"
      }
    ];
  }

  openGrammarCampModal(initialTab = "all") {
    const modal = document.getElementById("grammarCampModal");
    if (!modal) return;
    this.lockScroll();
    modal.classList.remove("hidden");
    this.switchGrammarCampTab(initialTab || this.grammarCampTab || "all");
  }

  closeGrammarCampModal() {
    this.unlockScroll();
    document.getElementById("grammarCampModal")?.classList.add("hidden");
  }

  switchGrammarCampTab(tab = "all") {
    this.grammarCampTab = tab;
    const tabs = [
      { id: "campTabAll", key: "all" },
      { id: "campTabConjunctions", key: "conjunction" },
      { id: "campTabPrepositions", key: "preposition" },
      { id: "campTabPhrasal", key: "phrasal" }
    ];

    tabs.forEach(t => {
      const btn = document.getElementById(t.id);
      if (!btn) return;
      if (t.key === tab) {
        btn.className = "px-3 py-1.5 rounded-xl text-xs font-extrabold transition bg-purple-600 text-white shadow-xs";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl text-xs font-extrabold transition bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600";
      }
    });

    this.renderGrammarCampList();
  }

  renderGrammarCampList() {
    const container = document.getElementById("grammarCampListContainer");
    if (!container) return;

    const searchInput = document.getElementById("grammarCampSearchInput");
    const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    const activeTab = this.grammarCampTab || "all";

    const data = this.getGrammarCampData().filter(item => {
      if (activeTab !== "all" && item.type !== activeTab) return false;
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.meaning.toLowerCase().includes(query) ||
        item.rule.toLowerCase().includes(query) ||
        item.polarity.toLowerCase().includes(query) ||
        item.tip.toLowerCase().includes(query) ||
        item.sample.toLowerCase().includes(query)
      );
    });

    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Aradığınız kritere uygun bağlaç, edat veya phrasal verb bulunamadı.
        </div>
      `;
      return;
    }

    const typeBadges = {
      conjunction: { label: "Bağlaç", cls: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
      preposition: { label: "Edat / Kalıp", cls: "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
      phrasal: { label: "Phrasal Verb", cls: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" }
    };

    data.forEach(item => {
      const badge = typeBadges[item.type] || typeBadges.conjunction;
      const card = document.createElement("div");
      card.className = "p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/90 dark:border-gray-700 shadow-2xs flex flex-col justify-between space-y-3";
      card.innerHTML = `
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-1.5">
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${badge.cls}">
              ${badge.label} • ${item.polarity}
            </span>
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              ${item.rule}
            </span>
          </div>
          <h4 class="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-snug">
            ${item.title}
          </h4>
          <p class="text-xs font-extrabold text-purple-700 dark:text-purple-300">
            Anlamı: ${item.meaning}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            <strong class="text-gray-800 dark:text-gray-100">YDS İpucu:</strong> ${item.tip}
          </p>
          <div class="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/70 text-[11px] italic text-gray-600 dark:text-gray-300">
            "${item.sample}"
          </div>
        </div>
        <div class="pt-1 flex items-center justify-between gap-2">
          <button type="button" class="camp-speak-btn px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-1 transition">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
            <span>Dinle</span>
          </button>
          <button type="button" class="camp-filter-btn px-3 py-1.5 rounded-xl text-[11px] font-extrabold bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1 transition">
            <span>Sorularda Gör</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>
        </div>
      `;

      card.querySelector(".camp-speak-btn")?.addEventListener("click", () => {
        const firstPhrase = item.title.split("/")[0].trim();
        this.speakWord(firstPhrase);
      });
      card.querySelector(".camp-filter-btn")?.addEventListener("click", () => {
        this.filterQuestionsFromGrammarCamp(item.searchKw);
      });

      container.appendChild(card);
    });
  }

  filterQuestionsFromGrammarCamp(keyword) {
    if (!keyword) return;
    this.closeGrammarCampModal();
    this.searchWordInExams(keyword);
  }

  // ============================================================
  // --- ÖZELLİK PAKETİ 2.5: SON 7 GÜNLÜK ÇÖZÜM GRAFİĞİ ---
  // ============================================================

  getLast7DaysActivity() {
    if (!this.streakData) this.streakData = this.loadStreakData();
    const history = this.streakData.dailyHistory || {};
    const target = this.streakData.dailyTarget || 15;
    const todayISO = this.getLocalISODate();

    // Ayrıca practiceAnswers ve examAnswers içindeki timestamp'lerden de günlük sayıları çıkar
    const timestampCounts = {};
    const combinedAnswers = { ...(this.practiceAnswers || {}), ...(this.examAnswers || {}) };
    Object.values(combinedAnswers).forEach(ans => {
      if (ans && ans.timestamp) {
        const dStr = this.getLocalISODate(new Date(ans.timestamp));
        timestampCounts[dStr] = (timestampCounts[dStr] || 0) + 1;
      }
    });

    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = this.getLocalISODate(d);
      const fromHistory = iso === todayISO
        ? Math.max(this.streakData.todayCount || 0, history[iso] || 0)
        : (history[iso] || 0);
      const fromTimestamps = timestampCounts[iso] || 0;
      const count = Math.max(fromHistory, fromTimestamps);

      days.push({
        iso,
        dayLabel: i === 0 ? "Bugün" : dayNames[d.getDay()],
        shortDate: `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`,
        count,
        goalMet: count >= target
      });
    }

    return { days, target };
  }

  renderWeeklyActivityChart() {
    const container = document.getElementById("weeklyChartBarsContainer");
    if (!container) return;

    const { days, target } = this.getLast7DaysActivity();
    const total7Days = days.reduce((sum, d) => sum + d.count, 0);
    const avgDaily = Math.round((total7Days / 7) * 10) / 10;
    const goalDays = days.filter(d => d.goalMet).length;

    const maxVal = Math.max(target, ...days.map(d => d.count), 10);

    const totalBadge = document.getElementById("weeklyTotalSolvedBadge");
    const avgBadge = document.getElementById("weeklyDailyAvgBadge");
    const goalBadge = document.getElementById("weeklyGoalDaysBadge");
    const bestDayEl = document.getElementById("weeklyBestDayText");

    if (totalBadge) totalBadge.textContent = `7 Gün Toplam: ${total7Days}`;
    if (avgBadge) avgBadge.textContent = `Günlük Ort: ${avgDaily}`;
    if (goalBadge) goalBadge.textContent = `Hedef: ${goalDays}/7 Gün`;

    const bestDay = [...days].sort((a, b) => b.count - a.count)[0];
    if (bestDayEl) {
      bestDayEl.textContent = bestDay && bestDay.count > 0
        ? `En Verimli Gün: ${bestDay.dayLabel} (${bestDay.count} Soru/Kelime)`
        : "Bu hafta henüz aktivite kaydı yok";
    }

    container.innerHTML = "";
    days.forEach(d => {
      const heightPct = d.count === 0 ? 6 : Math.max(12, Math.min(100, Math.round((d.count / maxVal) * 100)));
      const barColor = d.goalMet
        ? "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-xs shadow-emerald-500/20"
        : d.count > 0
        ? "bg-gradient-to-t from-indigo-600 to-violet-500 shadow-xs shadow-indigo-500/20"
        : "bg-gray-200 dark:bg-gray-700";

      const col = document.createElement("div");
      col.className = "flex flex-col items-center justify-end h-full group";
      col.innerHTML = `
        <span class="text-[10px] sm:text-xs font-extrabold ${d.count > 0 ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'} mb-1">
          ${d.count}
        </span>
        <div class="w-full max-w-[34px] h-28 flex items-end justify-center">
          <div class="w-full rounded-t-xl transition-all duration-500 ${barColor}" style="height: ${heightPct}%" title="${d.shortDate}: ${d.count} Soru/Kelime"></div>
        </div>
        <span class="text-[10px] sm:text-[11px] font-bold ${d.dayLabel === 'Bugün' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-gray-500 dark:text-gray-400'} mt-1.5">
          ${d.dayLabel}
        </span>
      `;
      container.appendChild(col);
    });
  }

  handleHardwareBackButton() {
    // 1. Açık bir modal veya çekmece varsa kapat (en üstteki panel)
    const modals = [
      { id: "sprintResultModal", closeFn: () => this.closeSprintResultModal() },
      { id: "grammarCampModal", closeFn: () => this.closeGrammarCampModal() },
      { id: "vocabQuizModal", closeFn: () => this.closeVocabQuizModal() },
      { id: "adFreeModal", closeFn: () => this.closeAdFreeModal() },
      { id: "allNotesModal", closeFn: () => this.closeAllNotesModal() },
      { id: "questionNoteDrawer", closeFn: () => this.closeQuestionNoteDrawer() },
      { id: "learnedVocabModal", closeFn: () => this.closeLearnedVocabModal() },
      { id: "dailyQuestionModal", closeFn: () => this.closeDailyQuestion() },
      { id: "wordInspectorModal", closeFn: () => this.closeWordModal() },
      { id: "flashcardModal", closeFn: () => this.closeFlashcardsModal() },
      { id: "learningPoolModal", closeFn: () => this.closeLearningPoolModal() },
      { id: "yearExamModal", closeFn: () => this.closeYearExamModal() },
      { id: "pdfImportModal", closeFn: () => document.getElementById("pdfImportModal")?.classList.add("hidden") },
      { id: "settingsModal", closeFn: () => document.getElementById("settingsModal")?.classList.add("hidden") },
      { id: "examScorecardModal", closeFn: () => this.closeExamScorecard() },
      { id: "namePromptModal", closeFn: () => {} } // İsim zorunluysa kapatılamaz
    ];

    for (const modal of modals) {
      const el = document.getElementById(modal.id);
      if (el && !el.classList.contains("hidden")) {
        if (modal.id === "namePromptModal") return; // Geri tuşu ile geçilemez
        modal.closeFn();
        return; // Sadece en üsttekini kapat ve çık
      }
    }

    // 2. Eğer Question veya Report view'daysak Home'a dön
    if (this.currentView === "question") {
      if (this.isExamMode) {
        this.exitExamMode();
      } else {
        this.showHomeView();
      }
      return;
    }
    if (this.currentView === "report") {
      this.goBack();
      return;
    }

    // 3. Eğer Home view'daysak, çıkış uyarısı göster
    if (this.currentView === "home") {
      const exitModal = document.getElementById("exitConfirmModal");
      if (exitModal && exitModal.classList.contains("hidden")) {
        exitModal.classList.remove("hidden");
      } else if (exitModal) {
        exitModal.classList.add("hidden"); // Zaten açıksa ve tekrar basıldıysa kapat
      }
    }
  }
}

// Uygulamayı Başlat
window.addEventListener("DOMContentLoaded", () => {
  window.ydsApp = new YDSApp();
});
