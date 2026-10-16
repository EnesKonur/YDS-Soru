// YDS Soru Filtreleme - Google AdMob Canlı Reklam Yönetim Servisi (ad-service.js)
// %100 Canlı Reklam Modu (Kesinlikle test ID kullanılmaz)

class YDSAdService {
  constructor() {
    this.isNative = false;
    this.platform = 'web'; // 'android', 'ios', 'web'
    this.isInitialized = false;
    this.initInProgress = false;
    this.interstitialLoaded = false;
    this.rewardedLoaded = false;
    this.bannerVisible = false;
    this.bannerLoading = false;

    // Google AdMob Canlı Üretim Kimlikleri
    this.adUnits = {
      android: {
        banner: 'ca-app-pub-4561261731825506/3794853851',
        interstitial: 'ca-app-pub-4561261731825506/3950037571',
        rewarded: 'ca-app-pub-4561261731825506/7328728589'
      },
      ios: {
        banner: 'ca-app-pub-4561261731825506/7335195922',
        interstitial: 'ca-app-pub-4561261731825506/3755877715',
        rewarded: 'ca-app-pub-4561261731825506/5891086469'
      }
    };

    // Soru sayacı ve sıklık ayarları (Kullanıcı dostu optimize değerler)
    this.practiceAnswerCount = 0;
    this.interstitialInterval = 10; // Her 10 soruda bir geçiş reklamı (önceden 6 idi)
    this.sessionQuestionsSolved = 0; // Bu oturumda çözülen soru sayısı
    this.vocabSwipeCount = 0; // Kelime kartı swipe sayacı
    this.sessionVocabSwiped = 0;

    // Akıllı Soğuma Süresi (Cooldown) - En az 90 sn (kesinlikle üst üste çıkmaz)
    this.lastInterstitialTime = 0;
    this.minInterstitialIntervalMs = 90 * 1000;

    // Reklamsız Mod (Ad-Free / Premium) Durumu
    this.isAdFree = localStorage.getItem("examgo_ad_free") === "true" || localStorage.getItem("examdil_ad_free") === "true";

    this.checkPlatform();
    this.bootstrap();
  }

  checkPlatform() {
    this.isNative = typeof window.Capacitor !== 'undefined' && 
                    typeof window.Capacitor.isNativePlatform === 'function' && 
                    window.Capacitor.isNativePlatform();
    this.platform = this.isNative ? window.Capacitor.getPlatform() : 'web';
  }

  bootstrap() {
    // 1. Hemen deneme yap
    this.init();

    // 2. DOMContentLoaded olduğunda kontrol et
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.checkPlatform();
        if (!this.isInitialized) this.init();
      });
    } else {
      this.checkPlatform();
      if (!this.isInitialized) this.init();
    }

    // 3. deviceready güvencesi
    document.addEventListener('deviceready', () => {
      this.checkPlatform();
      if (!this.isInitialized) this.init();
    });

    // 4. Capacitor eklentilerinin gecikmeli yüklenmesine karşı retry mekanizması
    let retryCount = 0;
    const retryInterval = setInterval(() => {
      retryCount++;
      this.checkPlatform();
      if (this.isNative && window.Capacitor?.Plugins?.AdMob) {
        if (!this.isInitialized) {
          this.init();
        }
        clearInterval(retryInterval);
      } else if (retryCount > 10) {
        clearInterval(retryInterval);
      }
    }, 500);

    // Google Play Satın Alım Otomatik Kontrolü
    this.checkSavedPurchases();
  }

  checkSavedPurchases() {
    const Billing = window.Capacitor?.Plugins?.GooglePlayBilling;
    if (Billing && typeof Billing.queryPurchases === 'function') {
      Billing.queryPurchases()
        .then(res => {
          if (res && (res.hasPurchased || res.isAdFree)) {
            console.log('👑 [YDSAdService] Google Play satın alımı doğrulandı, reklamsız mod aktif ediliyor.');
            this.setAdFree(true);
          }
        })
        .catch(err => {
          console.warn('Google Play satın alım kontrolü:', err);
        });

      try {
        Billing.addListener('onPurchaseCompleted', (data) => {
          if (data && data.isAdFree) {
            this.setAdFree(true);
          }
        });
      } catch (e) {}
    }
  }

  async init() {
    this.checkPlatform();
    if (!this.isNative) {
      console.log('ℹ️ [YDSAdService] Web ortamında çalışıyor. Reklamlar simülasyon modunda.');
      this.isInitialized = true;
      return;
    }

    if (this.isInitialized || this.initInProgress) return;
    this.initInProgress = true;

    try {
      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (!AdMob) {
        console.warn('⏳ [YDSAdService] AdMob eklentisi henüz hazır değil...');
        this.initInProgress = false;
        return;
      }

      // iOS ATT İzni İsteme
      if (this.platform === 'ios') {
        try {
          await AdMob.requestTrackingAuthorization();
        } catch (e) {
          console.log('ATT authorization request:', e);
        }
      }

      // AdMob SDK'sını Canlı Modda Başlat (Test modu KAPALI)
      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: false
      });

      this.isInitialized = true;
      this.initInProgress = false;
      console.log('✅ [YDSAdService] AdMob CANLI modda başarıyla başlatıldı. Platform:', this.platform);

      // Dinleyicileri kur
      this.setupAdListeners(AdMob);

      // 1. Canlı Alt Banner Reklamını Başlat
      await this.showBanner();

      // 2. Canlı Geçiş ve Ödüllü Reklamları Önceden Hazırla
      await this.prepareInterstitial();
      await this.prepareRewarded();

    } catch (err) {
      console.error('❌ [YDSAdService] AdMob başlatma hatası:', err);
      this.initInProgress = false;
    }
  }

  setupAdListeners(AdMob) {
    try {
      // --- Geçiş Reklamı Olayları ---
      AdMob.addListener('interstitialAdDismissed', () => {
        this.interstitialLoaded = false;
        setTimeout(() => this.prepareInterstitial(), 1500);
      });

      AdMob.addListener('interstitialAdFailedToLoad', (err) => {
        this.interstitialLoaded = false;
        console.warn('[YDSAdService] Canlı geçiş reklamı yüklenemedi (15sn sonra tekrar denenecek):', err);
        setTimeout(() => this.prepareInterstitial(), 15000);
      });

      // --- Ödüllü Reklam Olayları ---
      AdMob.addListener('onRewardedVideoAdDismissed', () => {
        this.rewardedLoaded = false;
        setTimeout(() => this.prepareRewarded(), 1500);
      });

      AdMob.addListener('onRewardedVideoAdFailedToLoad', (err) => {
        this.rewardedLoaded = false;
        console.warn('[YDSAdService] Canlı ödüllü reklam yüklenemedi (15sn sonra tekrar denenecek):', err);
        setTimeout(() => this.prepareRewarded(), 15000);
      });

      // --- Banner Reklam Olayları ---
      AdMob.addListener('bannerAdLoaded', () => {
        console.log('🎉 [YDSAdService] Canlı banner reklamı başarıyla yüklendi ve gösteriliyor!');
        this.bannerVisible = true;
        this.bannerLoading = false;
      });

      AdMob.addListener('bannerAdFailedToLoad', (err) => {
        console.warn('⚠️ [YDSAdService] Canlı banner yüklenemedi (10sn sonra tekrar canlı denenecek):', err);
        this.bannerVisible = false;
        this.bannerLoading = false;

        // Kesinlikle test reklamına dönülmez; belirli aralıklarla canlı reklam tekrar istenir
        setTimeout(() => {
          if (!this.bannerVisible) {
            this.showBanner();
          }
        }, 10000);
      });
    } catch (e) {
      console.warn('AdMob dinleyici kurma uyarısı:', e);
    }
  }

  getAdUnitId(type) {
    const p = this.platform === 'ios' ? 'ios' : 'android';
    return this.adUnits[p][type];
  }

  // --- 1. Tam Ekran Canlı Geçiş Reklamı (Interstitial) ---
  async prepareInterstitial() {
    if (!this.isNative) return;
    try {
      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (!AdMob) return;

      const adId = this.getAdUnitId('interstitial');
      await AdMob.prepareInterstitial({
        adId: adId,
        isTesting: false
      });
      this.interstitialLoaded = true;
      console.log('✅ [YDSAdService] Canlı geçiş reklamı belleğe yüklendi.');
    } catch (e) {
      this.interstitialLoaded = false;
      console.warn('Canlı geçiş reklamı hazırlama uyarısı:', e);
    }
  }

  async showInterstitial(force = false) {
    if (this.isAdFree) {
      console.log('👑 [YDSAdService] Reklamsız mod aktif: Geçiş reklamı gösterilmedi.');
      return false;
    }

    const now = Date.now();
    if (!force && (now - this.lastInterstitialTime < this.minInterstitialIntervalMs)) {
      console.log('⏳ [YDSAdService] Geçiş reklamı soğuma süresinde, bekleniyor.');
      return false;
    }

    if (!this.isNative) {
      this.lastInterstitialTime = now;
      this.showWebMockToast('[Web Modu] Canlı Geçiş Reklamı Gösterildi');
      return true;
    }

    try {
      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (!AdMob) return false;

      if (!this.interstitialLoaded) {
        await this.prepareInterstitial();
      }

      await AdMob.showInterstitial();
      this.lastInterstitialTime = now;
      this.interstitialLoaded = false;
      setTimeout(() => this.prepareInterstitial(), 2000);
      return true;
    } catch (err) {
      console.warn('[YDSAdService] Canlı geçiş reklamı gösterilemedi:', err);
      setTimeout(() => this.prepareInterstitial(), 5000);
      return false;
    }
  }

  // Soru çözümünde sayaç artır ve gerekirse reklam göster
  onQuestionAnswered() {
    if (this.isAdFree) return;
    this.practiceAnswerCount++;
    this.sessionQuestionsSolved++;

    if (this.practiceAnswerCount >= this.interstitialInterval) {
      this.practiceAnswerCount = 0;
      setTimeout(() => {
        this.showInterstitial();
      }, 1000);
    }
  }

  // Ana menüye dönerken doğal geçiş reklamı
  onNavigateHome() {
    if (this.isAdFree) return;
    if (this.sessionQuestionsSolved >= 3 || this.sessionVocabSwiped >= 8) {
      this.sessionQuestionsSolved = 0;
      this.sessionVocabSwiped = 0;
      this.practiceAnswerCount = 0;
      this.vocabSwipeCount = 0;
      this.showInterstitial();
    }
  }

  // Kelime kartı çevrildiğinde
  onVocabSwiped() {
    if (this.isAdFree) return;
    this.vocabSwipeCount++;
    this.sessionVocabSwiped++;

    if (this.vocabSwipeCount >= 14) {
      this.vocabSwipeCount = 0;
      setTimeout(() => {
        this.showInterstitial();
      }, 600);
    }
  }

  resetQuestionSession() {
    this.sessionQuestionsSolved = 0;
  }

  resetVocabSession() {
    this.sessionVocabSwiped = 0;
    this.vocabSwipeCount = 0;
  }

  // --- 2. Canlı Ödüllü Video Reklamı (Rewarded Ads) ---
  async prepareRewarded() {
    if (!this.isNative) return;
    try {
      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (!AdMob) return;

      const adId = this.getAdUnitId('rewarded');
      await AdMob.prepareRewardVideoAd({
        adId: adId,
        isTesting: false
      });
      this.rewardedLoaded = true;
      console.log('✅ [YDSAdService] Canlı ödüllü video belleğe yüklendi.');
    } catch (e) {
      this.rewardedLoaded = false;
      console.warn('Canlı ödüllü reklam hazırlama uyarısı:', e);
    }
  }

  async showRewarded(onRewardCallback) {
    if (this.isAdFree) {
      console.log('👑 [YDSAdService] Reklamsız mod aktif: Ödül doğrudan verildi.');
      if (typeof onRewardCallback === 'function') {
        onRewardCallback({ amount: 1, type: 'reward' });
      }
      return;
    }

    if (!this.isNative) {
      this.showWebMockToast('[Web Modu] 15 sn Ödüllü Video İzlendi. Ödül Açıldı!');
      if (typeof onRewardCallback === 'function') {
        onRewardCallback({ amount: 1, type: 'reward' });
      }
      return;
    }

    try {
      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (!AdMob) return;

      if (!this.rewardedLoaded) {
        await this.prepareRewarded();
      }

      const rewardListener = await AdMob.addListener('onRewardedVideoAdReward', (reward) => {
        console.log('🎉 [YDSAdService] Canlı ödül kazanıldı:', reward);
        if (typeof onRewardCallback === 'function') {
          onRewardCallback(reward);
        }
        rewardListener.remove();
      });

      await AdMob.showRewardVideoAd();
      this.rewardedLoaded = false;
      setTimeout(() => this.prepareRewarded(), 2000);

    } catch (err) {
      console.error('[YDSAdService] Canlı ödüllü reklam gösterilemedi:', err);
      alert('Reklam yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.');
      setTimeout(() => this.prepareRewarded(), 5000);
    }
  }

  // --- 3. Canlı Alt Banner Reklamı (%100 Canlı Üretim Kimliği) ---
  async resumeBanner() {
    this.checkPlatform();
    if (this.isAdFree || !this.isNative) return;
    try {
      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (AdMob && typeof AdMob.resumeBanner === 'function') {
        await AdMob.resumeBanner();
        this.bannerVisible = true;
        this.bannerHidden = false;
        console.log('✅ [YDSAdService] Banner başarıyla geri gösterildi (resume).');
        return;
      }
    } catch (e) {
      console.warn('resumeBanner uyarısı, showBanner çağrılıyor:', e);
    }
    this.showBanner();
  }

  async showBanner() {
    this.checkPlatform();
    if (this.isAdFree) {
      this.hideBanner();
      return;
    }

    if (!this.isNative) {
      return;
    }

    // Eğer banner daha önce oluşturulmuş ve sadece gizlenmişse, direkt görünür yap
    if (this.bannerHidden) {
      return this.resumeBanner();
    }

    if (this.bannerVisible) {
      return;
    }

    if (this.bannerLoading) return;
    this.bannerLoading = true;

    try {
      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (!AdMob) {
        console.warn('⚠️ [YDSAdService] Banner gösterilemedi: AdMob eklentisi henüz hazır değil.');
        this.bannerLoading = false;
        return;
      }

      if (!this.isInitialized) {
        await this.init();
      }

      const adId = this.getAdUnitId('banner');
      console.log('📡 [YDSAdService] Canlı banner reklamı isteniyor. Canlı Ad ID:', adId);

      await AdMob.showBanner({
        adId: adId,
        adSize: 'ADAPTIVE_BANNER',
        position: 'BOTTOM_CENTER',
        margin: 0,
        isTesting: false
      });

      this.bannerVisible = true;
      this.bannerHidden = false;
    } catch (e) {
      console.warn('⚠️ [YDSAdService] Canlı banner showBanner çağrısı hata verdi:', e);
      this.bannerLoading = false;
      this.bannerVisible = false;

      // Hata durumunda da tekrar canlı ID ile 10 sn sonra dene
      setTimeout(() => {
        if (!this.bannerVisible && !this.isAdFree) {
          this.showBanner();
        }
      }, 10000);
    }
  }

  async hideBanner() {
    if (!this.isNative) return;
    try {
      const AdMob = window.Capacitor?.Plugins?.AdMob;
      if (AdMob) {
        await AdMob.hideBanner();
        this.bannerVisible = false;
        this.bannerHidden = true;
      }
    } catch (e) {
      console.warn('Banner gizleme uyarısı:', e);
    }
  }

  // --- Reklamsız Mod Yönetimi ---
  setAdFree(enabled) {
    this.isAdFree = !!enabled;
    localStorage.setItem("examgo_ad_free", this.isAdFree ? "true" : "false");
    localStorage.setItem("examdil_ad_free", this.isAdFree ? "true" : "false");
    if (this.isAdFree) {
      this.hideBanner();
    } else {
      this.showBanner();
    }
    window.dispatchEvent(new CustomEvent('adFreeStatusChanged', { detail: { isAdFree: this.isAdFree } }));
    console.log(`👑 [YDSAdService] Reklamsız mod ${this.isAdFree ? 'AKTİF EDİLDİ' : 'DEVRE DIŞI BIRAKILDI'}.`);
  }

  getAdFree() {
    return this.isAdFree;
  }

  // Web / Safari Testinde bildirim
  showWebMockToast(message) {
    const existing = document.getElementById('adMockToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'adMockToast';
    toast.className = "fixed bottom-16 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-2xl bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 text-xs font-semibold shadow-xl backdrop-blur-sm flex items-center gap-1.5 animate-in fade-in";
    toast.innerHTML = '<svg class="w-4 h-4 inline mr-1 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg><span>' + message + '</span>';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
}

// Global Ad Service örneğini başlat
window.ydsAdService = new YDSAdService();
