const fs = require('fs');
const path = 'dictionary.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /\/\/ 2\. Dahili zengin sözlük \(Tam eþleþme\)\r?\n    if \(BUILTIN_DICTIONARY\[cleaned\]\) \{/,
    // 2. Ýnternet varsa, daima en güncel ve zengin çeviri için Google'ý dene (En az 2 anlamlý)
    if (navigator.onLine) {
      try {
        const gtxResult = await this.fetchGoogleTranslation(cleaned);
        if (gtxResult && this.isValidTranslation(gtxResult, cleaned)) {
          const res = {
            word: cleaned,
            tr: gtxResult,
            type: "çeviri",
            source: "google_gtx"
          };
          this.cache.set(cleaned, res);
          return res;
        }
      } catch (e) {
        console.warn("Google GTX API Hatasý, yerele düþülüyor:", e);
      }
    }

    // 3. Dahili zengin sözlük (Tam eþleþme)
    if (BUILTIN_DICTIONARY[cleaned]) {
);

content = content.replace(
    /\/\/ 3\. Sorulardan hasat edilen doðrulanmýþ ÖSYM analizi/,
    '// 4. Sorulardan hasat edilen doðrulanmýþ ÖSYM analizi'
);
content = content.replace(
    /\/\/ 4\. Morfolojik Kök Türetme \(Lemmatization\)/,
    '// 5. Morfolojik Kök Türetme (Lemmatization)'
);

// Remove the old Google GTX block (now moved up)
content = content.replace(
    /\/\/ 5\. Yüksek Doðruluklu Google Translate GTX Çevirisi[\s\S]*?\/\/ 6\. Yedek: MyMemory/,
    '// 6. Yedek: MyMemory'
);

content = content.replace(
    /async fetchGoogleTranslation\(word\) \{\s+const url = https:\/\/translate\.googleapis\.com\/translate_a\/single\?client=gtx&sl=en&tl=tr&dt=t&q=\$\{encodeURIComponent\(word\)\};[\s\S]*?return null;\s+\}/,
    sync fetchGoogleTranslation(word) {
    const lowerWord = word.toLowerCase();
    const url = \https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&dt=bd&q=\\;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const data = await response.json();

    let translation = null;

    if (data && data[1] && data[1].length > 0) {
      let meanings = [];
      data[1].forEach(part => {
        if (part[1]) {
          part[1].forEach(meaning => {
            const m = meaning.toLowerCase().trim();
            if (m && !meanings.includes(m)) {
              meanings.push(m);
            }
          });
        }
      });
      if (meanings.length > 0) {
        translation = meanings.slice(0, 2).join(', ');
      }
    }

    if (!translation && data && data[0] && data[0][0] && data[0][0][0]) {
      translation = data[0][0][0].trim().toLowerCase();
    }
    
    return translation;
  }
);

fs.writeFileSync(path, content);
console.log('dictionary.js root updated.');
