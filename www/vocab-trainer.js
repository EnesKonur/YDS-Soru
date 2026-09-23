// YDS Kelime Antrenmanı (Tinder Tarzı Swipe & Flashcard Motoru)

class VocabTrainer {
  constructor() {
    this.vocabList = [];
    this.learnedVocab = new Set();
    this.unlearnedQueue = [];
    this.container = null;
    this.currentCard = null;
    this.isAnimating = false;
    this.swipeThreshold = 75;

    this.init();
  }

  init() {
    try {
      const saved = localStorage.getItem('learned_vocab');
      if (saved) {
        this.learnedVocab = new Set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading learned vocab:', e);
    }

    this.loadVocabList();
  }

  loadVocabList() {
    if (typeof VOCAB_LIST !== 'undefined' && Array.isArray(VOCAB_LIST) && VOCAB_LIST.length > 0) {
      this.vocabList = VOCAB_LIST;
      this.prepareQueue();
    } else {
      setTimeout(() => {
        if (typeof VOCAB_LIST !== 'undefined' && Array.isArray(VOCAB_LIST)) {
          this.vocabList = VOCAB_LIST;
          this.prepareQueue();
        }
      }, 300);
    }
  }

  prepareQueue() {
    if (!this.vocabList || this.vocabList.length === 0) {
      if (typeof VOCAB_LIST !== 'undefined' && Array.isArray(VOCAB_LIST)) {
        this.vocabList = VOCAB_LIST;
      }
    }

    this.unlearnedQueue = (this.vocabList || [])
      .filter(v => !this.learnedVocab.has(v.word))
      .sort(() => Math.random() - 0.5);

    this.updateStats();
  }

  updateStats() {
    const countEl = document.getElementById('vocabRemainingCount');
    if (countEl) {
      countEl.textContent = this.unlearnedQueue.length;
    }
    const badgeEl = document.getElementById('vocabLearnedBadge');
    if (badgeEl) {
      badgeEl.textContent = this.learnedVocab.size;
    }
  }

  start() {
    this.loadVocabList();

    const homeView = document.getElementById('homeView');
    const reportView = document.getElementById('reportView');
    const questionView = document.getElementById('questionView');
    const vocabView = document.getElementById('vocabTrainingView');

    if (homeView) homeView.classList.add('hidden');
    if (reportView) reportView.classList.add('hidden');
    if (questionView) questionView.classList.add('hidden');
    if (vocabView) vocabView.classList.remove('hidden');

    if (window.ydsApp) {
      window.ydsApp.currentView = 'vocab';
    }

    const backBtn = document.getElementById('headerBackHomeBtn');
    const brandTitle = document.getElementById('headerBrandTitle');
    const searchContainer = document.getElementById('headerSearchContainer');
    const filterBar = document.getElementById('filterBarContainer');
    const examBanner = document.getElementById('examModeBanner');

    if (backBtn) {
      backBtn.classList.remove('hidden');
      backBtn.classList.add('flex');
      backBtn.onclick = (e) => {
        if (e) e.preventDefault();
        this.exit();
      };
    }
    if (brandTitle) brandTitle.classList.add('hidden');
    if (searchContainer) searchContainer.classList.add('hidden');
    if (filterBar) filterBar.classList.add('hidden');
    if (examBanner) examBanner.classList.add('hidden');

    this.container = document.getElementById('vocabCardContainer');
    this.renderCards();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exit() {
    const vocabView = document.getElementById('vocabTrainingView');
    if (vocabView) vocabView.classList.add('hidden');

    if (window.ydsApp && typeof window.ydsApp.showHomeView === 'function') {
      window.ydsApp.showHomeView();
    } else {
      const homeView = document.getElementById('homeView');
      if (homeView) homeView.classList.remove('hidden');
      const backBtn = document.getElementById('headerBackHomeBtn');
      if (backBtn) {
        backBtn.classList.add('hidden');
        backBtn.classList.remove('flex');
      }
      const brandTitle = document.getElementById('headerBrandTitle');
      if (brandTitle) brandTitle.classList.remove('hidden');
    }
  }

  getWordOccurrenceCount(word) {
    if (window.ydsApp && typeof window.ydsApp.getExamOccurrenceCount === 'function') {
      const c = window.ydsApp.getExamOccurrenceCount(word);
      if (c > 0) return c;
    }
    const found = (this.vocabList || []).find(v => v.word.toLowerCase() === word.toLowerCase());
    return found ? found.freq : 1;
  }

  renderCards() {
    if (!this.container) {
      this.container = document.getElementById('vocabCardContainer');
      if (!this.container) return;
    }
    this.container.innerHTML = '';
    this.currentCard = null;

    if (this.unlearnedQueue.length === 0) {
      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-indigo-100 dark:border-gray-700">
          <div class="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-4xl mb-3 shadow-inner">🏆</div>
          <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-1">Tebrikler!</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Tüm kelimeleri başarıyla öğrendiniz.</p>
          <button onclick="window.vocabTrainer.resetLearnedVocab()" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition">
            Sıfırla ve Yeniden Başla
          </button>
        </div>
      `;
      return;
    }

    // İlk 3 kartı al ve ters sırada ekle
    const cardsToRender = this.unlearnedQueue.slice(0, 3).reverse();

    cardsToRender.forEach((item, idx) => {
      const isTop = (idx === cardsToRender.length - 1);
      const qCount = this.getWordOccurrenceCount(item.word);
      const cardEl = document.createElement('div');
      cardEl.className = 'vocab-card';
      cardEl.dataset.word = item.word;

      // Türkçe anlamları virgülle ayrılmışsa diziye çevir
      const meanings = String(item.tr || '').split(',').map(m => m.trim()).filter(Boolean);

      cardEl.innerHTML = `
        <!-- ÖN YÜZ (İngilizce) -->
        <div class="vocab-card-face vocab-card-front bg-gradient-to-b from-white via-white to-slate-50 dark:from-gray-800 dark:via-gray-800 dark:to-slate-850">
          <!-- Üst Bilgi Barı -->
          <div class="flex items-center justify-between w-full z-10 pointer-events-auto">
            <div class="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 text-[11px] font-black shadow-2xs">
              <span>🔥</span>
              <span>YDS'de ${item.freq} Kez</span>
            </div>
            
            <button type="button" class="goToQuestionsBtn flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-[11px] font-extrabold shadow-sm shadow-indigo-500/30 transition transform active:scale-95" title="Kelimenin geçtiği sorulara git">
              <span>📖</span>
              <span>${qCount} Soruya Git</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Geri Bildirim Rozetleri -->
          <div class="vocab-feedback nope">BİLMİYORUM</div>
          <div class="vocab-feedback like">ÖĞRENDİM</div>

          <!-- Kelime ve İpucu (Orta) -->
          <div class="flex-1 flex flex-col items-center justify-center my-4">
            <h2 class="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white capitalize tracking-tight text-center px-4 leading-tight">
              ${item.word}
            </h2>
            <div class="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-900/40 animate-pulse">
              <span>👆</span>
              <span>Anlamı görmek için dokunun</span>
            </div>
          </div>

          <!-- Alt Çevir Butonu -->
          <div class="w-full flex justify-center z-10 pointer-events-auto">
            <button type="button" class="flipCardBtn w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold flex items-center justify-center space-x-2 transition active:scale-98">
              <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Türkçe Anlamı Göster</span>
            </button>
          </div>
        </div>

        <!-- ARKA YÜZ (Türkçe Anlamlar) -->
        <div class="vocab-card-face vocab-card-back bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 dark:from-slate-850 dark:via-gray-800 dark:to-indigo-950/30">
          <!-- Üst Bilgi Barı -->
          <div class="flex items-center justify-between w-full z-10 pointer-events-auto">
            <span class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
              Türkçe Karşılıkları
            </span>
            
            <button type="button" class="goToQuestionsBtn flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-[11px] font-extrabold shadow-sm shadow-indigo-500/30 transition transform active:scale-95" title="Kelimenin geçtiği sorulara git">
              <span>📖</span>
              <span>${qCount} Soruya Git</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Türkçe Anlam Kutusu (Orta) -->
          <div class="flex-1 flex flex-col items-center justify-center my-3 space-y-3 px-2">
            <h3 class="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 capitalize">
              ${item.word}
            </h3>

            <div class="w-full flex flex-col items-center gap-2">
              ${meanings.map(m => `
                <div class="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-bold text-base sm:text-lg border border-indigo-100/80 dark:border-gray-600 shadow-2xs text-center w-full max-w-[280px]">
                  ${m}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Alt Çevir Butonu -->
          <div class="w-full flex justify-center z-10 pointer-events-auto">
            <button type="button" class="flipCardBtn w-full py-2.5 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold flex items-center justify-center space-x-2 transition active:scale-98">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Karta Geri Dön</span>
            </button>
          </div>
        </div>
      `;

      // Buton olayları
      const qBtns = cardEl.querySelectorAll('.goToQuestionsBtn');
      qBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.goToQuestions(item.word);
        });
      });

      const flipBtns = cardEl.querySelectorAll('.flipCardBtn');
      flipBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.flipCard(cardEl);
        });
      });

      if (isTop) {
        this.currentCard = cardEl;
        this.attachCardEvents(cardEl);
      }

      this.container.appendChild(cardEl);
    });
  }

  flipCard(card) {
    if (!card) card = this.currentCard;
    if (card) {
      card.classList.toggle('flipped');
    }
  }

  flipCurrent() {
    this.flipCard(this.currentCard);
  }

  attachCardEvents(card) {
    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;

    const onPointerDown = (e) => {
      if (this.isAnimating) return;
      if (e.target.closest('button')) return;

      isPointerDown = true;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      currentX = 0;
      currentY = 0;

      card.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isPointerDown) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (!isDragging) {
        if (Math.hypot(deltaX, deltaY) > 8) {
          isDragging = true;
          card.classList.add('dragging');
        }
      }

      if (isDragging) {
        currentX = deltaX;
        currentY = deltaY;

        const rotate = currentX * 0.08;
        card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotate}deg)`;

        const nopeEl = card.querySelector('.vocab-feedback.nope');
        const likeEl = card.querySelector('.vocab-feedback.like');

        if (currentX > 0) {
          if (likeEl) likeEl.style.opacity = Math.min(currentX / 70, 1);
          if (nopeEl) nopeEl.style.opacity = 0;
          card.style.borderColor = 'rgba(16, 185, 129, 0.5)';
        } else {
          if (nopeEl) nopeEl.style.opacity = Math.min(Math.abs(currentX) / 70, 1);
          if (likeEl) likeEl.style.opacity = 0;
          card.style.borderColor = 'rgba(239, 68, 68, 0.5)';
        }
      }
    };

    const onPointerUp = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      try {
        card.releasePointerCapture(e.pointerId);
      } catch (err) {}

      card.classList.remove('dragging');

      if (!isDragging) {
        // Tıklama / Dokunma -> Kartı Çevir
        this.flipCard(card);
        return;
      }

      isDragging = false;

      if (currentX > this.swipeThreshold) {
        this.executeSwipe('right', card);
      } else if (currentX < -this.swipeThreshold) {
        this.executeSwipe('left', card);
      } else {
        // Geri toparlan
        card.style.transition = 'transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.25), border-color 0.25s ease';
        card.style.transform = '';
        card.style.borderColor = '';
        const nopeEl = card.querySelector('.vocab-feedback.nope');
        const likeEl = card.querySelector('.vocab-feedback.like');
        if (nopeEl) nopeEl.style.opacity = 0;
        if (likeEl) likeEl.style.opacity = 0;

        setTimeout(() => {
          card.style.transition = '';
        }, 280);
      }
    };

    const onPointerCancel = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      isDragging = false;
      card.classList.remove('dragging');
      card.style.transform = '';
      card.style.borderColor = '';
    };

    card.addEventListener('pointerdown', onPointerDown);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp);
    card.addEventListener('pointercancel', onPointerCancel);
  }

  swipeCurrent(direction) {
    if (this.isAnimating || !this.currentCard) return;
    this.executeSwipe(direction, this.currentCard);
  }

  executeSwipe(direction, card) {
    if (this.isAnimating || !card) return;
    this.isAnimating = true;

    const isLearned = (direction === 'right');
    const wordObj = this.unlearnedQueue.shift();

    if (isLearned) {
      card.classList.add('swipe-right');
      const likeEl = card.querySelector('.vocab-feedback.like');
      if (likeEl) likeEl.style.opacity = 1;
      if (wordObj) {
        this.learnedVocab.add(wordObj.word);
        this.saveLearnedVocab();
      }
    } else {
      card.classList.add('swipe-left');
      const nopeEl = card.querySelector('.vocab-feedback.nope');
      if (nopeEl) nopeEl.style.opacity = 1;
      if (wordObj) {
        this.unlearnedQueue.push(wordObj);
      }
    }

    this.updateStats();

    setTimeout(() => {
      this.isAnimating = false;
      this.renderCards();
    }, 320);
  }

  goToQuestions(word) {
    const vocabView = document.getElementById('vocabTrainingView');
    if (vocabView) vocabView.classList.add('hidden');

    if (window.ydsApp && typeof window.ydsApp.searchWordInExams === 'function') {
      window.ydsApp.searchWordInExams(word);
    } else if (window.ydsApp && typeof window.ydsApp.showQuestionView === 'function') {
      window.ydsApp.showQuestionView('practice');
      const kwInput = document.getElementById('keywordInput');
      if (kwInput) {
        kwInput.value = word;
        const clearBtn = document.getElementById('clearKeywordBtn');
        if (clearBtn) clearBtn.classList.remove('hidden');
      }
      if (typeof window.ydsApp.applyFilters === 'function') {
        window.ydsApp.applyFilters();
      }
    }
  }

  saveLearnedVocab() {
    try {
      localStorage.setItem('learned_vocab', JSON.stringify(Array.from(this.learnedVocab)));
    } catch (e) {
      console.error('Could not save learned vocab:', e);
    }
  }

  openLearnedVocabModal() {
    const modal = document.getElementById('learnedVocabModal');
    const container = document.getElementById('learnedVocabListContainer');
    if (!modal || !container) return;

    if (this.learnedVocab.size === 0) {
      container.innerHTML = `
        <div class="text-center py-10 text-gray-400 dark:text-gray-500">
          <div class="text-4xl mb-2">⭐</div>
          <p class="font-bold text-sm">Henüz öğrendiğiniz bir kelime yok.</p>
          <p class="text-xs mt-1">Kartı sağa kaydırarak veya yeşil butona basarak kelimeleri buraya ekleyebilirsiniz.</p>
        </div>
      `;
    } else {
      const arr = Array.from(this.learnedVocab);
      let html = '';

      arr.forEach(word => {
        const found = (this.vocabList || []).find(v => v.word.toLowerCase() === word.toLowerCase()) || { word, tr: 'Çeviri mevcut', freq: 1 };
        const qCount = this.getWordOccurrenceCount(found.word);

        html += `
          <div class="flex items-center justify-between p-3.5 bg-white dark:bg-gray-700/60 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-2xs hover:border-indigo-200 dark:hover:border-indigo-500 transition">
            <div class="min-w-0 flex-1 pr-3">
              <div class="font-black text-gray-900 dark:text-white capitalize text-base tracking-tight">${found.word}</div>
              <div class="text-xs text-gray-500 dark:text-gray-300 font-medium truncate">${found.tr}</div>
            </div>
            <button onclick="window.vocabTrainer.closeLearnedVocabModal(); window.vocabTrainer.goToQuestions('${found.word}')" class="flex-shrink-0 flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl hover:bg-indigo-100 transition shadow-2xs" title="Sorularda Gör">
              <span>📖</span>
              <span>${qCount} Soru</span>
            </button>
          </div>
        `;
      });
      container.innerHTML = html;
    }

    modal.classList.remove('hidden');
    const modalBox = modal.querySelector('div:nth-child(2)');
    if (modalBox) {
      setTimeout(() => {
        modalBox.classList.remove('scale-95', 'opacity-0');
      }, 10);
    }
  }

  closeLearnedVocabModal() {
    const modal = document.getElementById('learnedVocabModal');
    if (!modal) return;
    const modalBox = modal.querySelector('div:nth-child(2)');
    if (modalBox) modalBox.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }

  resetLearnedVocab() {
    if (confirm('Tüm kelime öğrenme geçmişini sıfırlamak istediğinize emin misiniz?')) {
      this.learnedVocab.clear();
      this.saveLearnedVocab();
      this.prepareQueue();
      this.renderCards();
      this.closeLearnedVocabModal();
    }
  }
}

// Global örnek ve kancalar
window.vocabTrainer = new VocabTrainer();

window.startVocabTraining = function() {
  if (window.vocabTrainer) {
    window.vocabTrainer.start();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  if (!window.vocabTrainer) {
    window.vocabTrainer = new VocabTrainer();
  }

  function attachToApp() {
    if (window.ydsApp) {
      window.ydsApp.startVocabTraining = () => window.vocabTrainer.start();
      window.ydsApp.openLearnedVocabModal = () => window.vocabTrainer.openLearnedVocabModal();
      window.ydsApp.closeLearnedVocabModal = () => window.vocabTrainer.closeLearnedVocabModal();
      window.ydsApp.resetLearnedVocab = () => window.vocabTrainer.resetLearnedVocab();

      const origHome = window.ydsApp.showHomeView;
      if (origHome && !window.ydsApp._vocabPatched) {
        window.ydsApp._vocabPatched = true;
        window.ydsApp.showHomeView = function() {
          const vocabView = document.getElementById('vocabTrainingView');
          if (vocabView) vocabView.classList.add('hidden');
          origHome.call(this);
        };
      }
    } else {
      setTimeout(attachToApp, 100);
    }
  }
  attachToApp();
});
