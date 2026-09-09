# YDS Soru - Google Play Store & Apple App Store Yayinlama Kilavuzu

Bu belge, uygulamanizi resmi magazalarda yayinlamak icin adim adim izlemeniz gereken resmi prosedurleri aciklar.

---

## 1. Google Play Store Yayinlama Adimlari

Google Play Store, yeni uygulamalar icin **.aab (Android App Bundle)** formatini zorunlu tutmaktadir. Projeniz bu formati tek tikla uretecek sekilde hazirlandi.

### Adim 1: Google Play Developer Hesabi
1. https://play.google.com/console adresine gidin.
2. Google hesabinizla giris yapin ve tek seferlik 25$ gelistirici kayit ucretini odeyin.
3. Kimlik dogrulama adimlarini tamamlayin.

### Adim 2: Uygulama Kaydi
1. Play Console'da **Uygulama Olustur** (Create App) butonuna tiklayin.
2. Uygulama Adi: YDS Soru Filtreleme
3. Varsayilan Dil: Turkce (tr-TR)
4. Tur: Uygulama | Ucretsiz / Ucretli: Ucretsiz

### Adim 3: Magaza Girisi ve Gizlilik Politikasi
1. **Gizlilik Politikasi:** Proje kokundeki privacy_policy.html dosyasini GitHub Pages veya web adresine yukleyip linkini buraya yapistirin.
2. **Hedef Kitle:** 13 yas ve uzeri.
3. **Kategori:** Egitim (Education).
4. **Grafik Varliklar:**
   - Uygulama Simgesi: 512x512 PNG (icon-512.png hazir).
   - Ozellik Grafigi: 1024x500 PNG.
   - Telefon Ekran Goruntuleri: Uygulamadan 2-8 adet ekran goruntusu.

### Adim 4: Paketi Yukleme (.aab)
1. Sol menuden **Uretim (Production)** -> **Yeni Surum Olustur** bolumune girin.
2. uild_all_stores.ps1 scripti ile uretilen yds-soru-googleplay.aab dosyasini surukleyip birakin.
3. Surum notlarini yazin (1.0.0 - YDS 2018-2024 soru filtreleme ve deneme motoru).
4. **Incelemeye Gonder** butonuna basin.

---

## 2. Apple App Store Yayinlama Adimlari

Apple, uygulamalari **Xcode** uzerinden derlenmis ve imzalanmis olarak kabul eder.

### Adim 1: Apple Developer Program Kaydi
1. https://developer.apple.com adresine gidin.
2. Apple ID ile **Apple Developer Program**'a kaydolun (Yillik 99$).

### Adim 2: App Store Connect Uzerinde Uygulama Acma
1. https://appstoreconnect.apple.com adresine girin.
2. **Uygulamalarim (+)** -> **Yeni Uygulama** secin.
3. Platform: iOS
4. Ad: YDS Soru
5. Paket Kimligi (Bundle ID): com.yds.sorufiltreleme
6. SKU: yds-soru-01

### Adim 3: Xcode ile Derleme ve Yukleme (Mac Kullanicilari Icin)
1. Projedeki ios/App/App.xcworkspace dosyasini Mac'inizde **Xcode** ile acin.
2. Sol tarafta **App** hedefini secin, **Signing & Capabilities** sekmesinde Apple Developer hesabinizi (Team) secin.
3. Cihaz hedefi olarak **Any iOS Device (arm64)** secin.
4. Menuden **Product -> Archive** secenegine tiklayin.
5. Acilan pencerede **Distribute App** -> **App Store Connect** -> **Upload** adimlarini izleyin.

### Alternatif: Mac'iniz Yoksa (GitHub Actions ile Otomatik Derleme)
Projenizin .github/workflows/build-ios.yml dosyasi hazirdir:
1. Projeyi GitHub'a yuklediginizde GitHub'in ucretsiz macOS sunuculari uygulamayi otomatik derler.
2. **Actions** sekmesinden derlenmis hazir .ipa veya .xcarchive dosyasini indirebilirsiniz.

### Adim 4: Incelemeye Gonderme
1. App Store Connect'te yuklenen surumu secin.
2. Ekran goruntulerini, aciklama metnini ve privacy_policy.html baglantisini girin.
3. Ihracat Uyumlulugu: Projede ITSAppUsesNonExemptEncryption = NO ayarlandigi icin sifreleme sorulmadan gecer.
4. **Incelemeye Gonder** butonuna basin.
