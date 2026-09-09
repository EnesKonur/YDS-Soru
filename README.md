# YDS Soru Filtreleme & Kelime Odaklı Pratik Platformu

Bu uygulama, YDS sınavlarına hazırlanan adayların soruları **istedikleri herhangi bir kelimeye** (örneğin `"apple"`, `"conduct"`, `"although"`, `"climate"`, `"sustainable"` vb.), soru tiplerine, yıllara ve çözüm durumuna göre anında filtreleyip ekranda tek tek çözebilmelerini sağlayan interaktif bir web platformudur.

---

## 🌟 Öne Çıkan Özellikler

1. **Kelimeye Göre Anında Filtreleme:**
   - Üstteki arama kutusuna herhangi bir kelime yazdığınızda (örneğin `"apple"`), soru metninde, şıklarda, paragrafta veya etiketlerde o kelimenin geçtiği tüm sorular saniyeler içinde filtrelenir.
   - Bulunan kelimeler soru içinde parlayan sarı renkle (`<mark>`) vurgulanır.
   - Sorular `Soru 1 / N` şeklinde ardışık olarak kullanıcının önüne getirilir.

2. **İnteraktif Tıklanabilir Kelime Sözlüğü (Word Inspector):**
   - Soruda veya şıklarda gördüğünüz **her kelimenin** üzerine tıklayarak Türkçe karşılığını, kelime türünü (isim, fiil, sıfat vb.) ve örnek cümlesini anında görebilirsiniz.
   - Dahili binlerce YDS akademik kelime veritabanı çevrimdışı çalışır; sözlükte olmayan kelimeler için otomatik internet çevirisi devreye girer.
   - Kelimenin telaffuzunu dinleyebileceğiniz sesli telaffuz desteği (Web Speech API) bulunur.
   - Kelime penceresinden tek tıkla **"Bu Kelimeyi İçeren Tüm Soruları Getir"** butonuna basarak doğrudan o kelimenin sorularına geçiş yapabilirsiniz.

3. **Anında Doğru / Yanlış Değerlendirmesi:**
   - Şıklardan birine tıkladığınızda sistem anında cevap verir:
     - Doğruysa: Seçenek zümrüt yeşili olur, ödüllendirici başarı sesi çalar ve tebrik rozeti çıkar.
     - Yanlışsa: İşaretlenen şık kırmızı renkte titrer, doğru olan şık yeşil renkle aydınlatılır ve uyarı sesi çalar.
   - Sorunun hemen altında **Detaylı Çözüm & Türkçe Çeviri** ile **Soruda Geçen Önemli Kelimeler** kutusu açılır.

4. **Tek Tıkla Öğrenme Havuzu & 3D Flaş Kartlar (Flashcards):**
   - Bilmediğiniz veya pratik yapmak istediğiniz kelimeleri tek tıkla **"⭐️ Öğrenme Havuzuna Ekle"** butonuna basarak kaydedebilirsiniz.
   - Havuzdaki kelimeleri **3D Flaş Kart Modu** ile çalışabilir (ön yüz: İngilizce, tıklayınca dönen arka yüz: Türkçe) ve öğrendiklerinizi işaretleyebilirsiniz.
   - Kelimelerinizi tek tıkla Excel/Anki için CSV veya JSON formatında dışa aktarabilirsiniz.

5. **PDF'den Soru Aktarma Sihirbazı:**
   - ÖSYM YDS kitapçıklarını doğrudan tarayıcıya sürükleyip bırakarak soruları içe aktarabilirsiniz.
   - Sorular otomatik olarak 1'den 80'e kadar ayrıştırılır, şıkları bağlanır ve soru bankanıza eklenir.
   - Alternatif olarak terminal üzerinden toplu PDF ayrıştırmak için `python parse_yds_pdf.py <dosya.pdf>` scripti de mevcuttur.

6. **Ekstra Fonksiyonlar:**
   - Soru tipi filtreleri (Kelime, Dilbilgisi, Cümle Tamamlama, Çeviri, Paragraf, Diyalog, Restatement vb.)
   - Yıl filtreleri (2020 - 2024)
   - Durum filtreleri (Çözülmemişler, Yanlış Yapılanlar / Hata Havuzu, Doğrular, Favoriler)
   - Başarı istatistikleri ve doğruluk oranı yüzdesi
   - Hızlı soru numarası atlama ızgarası
   - Sınav kronometresi / süre sayacı
   - Gece / Gündüz teması (Dark Mode)
   - Klavye kısayolları (`A-E` ile şık işaretleme, `←` ve `→` ile soru geçişi)

---

## 🚀 Nasıl Çalıştırılır?

Hiçbir paket kurulumuna veya sunucuya gerek yoktur. 

1. `index.html` dosyasına çift tıklayarak herhangi bir modern tarayıcıda (Chrome, Edge, Firefox, Safari) doğrudan açabilirsiniz.
2. Ya da terminalden yerel bir sunucu başlatmak isterseniz:
   ```bash
   # Python ile
   python -m http.server 8080
   # Tarayıcıda http://localhost:8080 adresini açın
   ```

---

## 📁 Proje Yapısı

- `index.html`: Kullanıcı arayüzü, responsive tasarım, sınav ekranı ve modallar.
- `style.css`: Modern tipografi, 3D kart efektleri, arama kelimesi vurgusu ve şık animasyonlar.
- `app.js`: Filtreleme motoru, anında değerlendirme, ses sentezleyici, interaktif kelime denetleyicisi ve flashcard mantığı.
- `dictionary.js`: Kapsamlı YDS ve akademik İngilizce-Türkçe yerel sözlük motoru.
- `questions.js`: Farklı soru tipleri ve yıllardan hazır soru bankası (içinde "apple" gibi test kelimeleri de barındırır).
- `pdf-parser.js`: Tarayıcı içi PDF.js tabanlı kitapçık okuyucu.
- `parse_yds_pdf.py`: Harici Python tabanlı PDF ayıklama aracı.
