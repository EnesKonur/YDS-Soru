import re

# 1. Update dictionary.js
with open('dictionary.js', 'r', encoding='utf-8') as f:
    dict_content = f.read()

dict_content = dict_content.replace('tr: "Türkçe karþýlýðý aranýyor..."', 'tr: "Çeviri bulunamadý (API Hatasý)"')
with open('dictionary.js', 'w', encoding='utf-8') as f:
    f.write(dict_content)


# 2. Update app.js
with open('app.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Fix speakWord
speak_regex = re.compile(r'speakWord\(text\)\s*\{[^\}]+try\s*\{.*?catch\s*\(e\)\s*\{\s*console\.error\("TTS Error:",\s*e\);\s*\}\s*\}', re.DOTALL)

new_speak_word = """speakWord(text) {
    if (!text) return;
    if (!this.audioCache) this.audioCache = {};
    const lowerText = text.toLowerCase();
    
    if (this.audioCache[lowerText]) {
      this.audioCache[lowerText].currentTime = 0;
      this.audioCache[lowerText].play().catch(e => console.warn("Audio play error", e));
      return;
    }
    
    try {
      // 1. Ücretsiz dictionaryapi (Yüksek kaliteli insan sesi)
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lowerText)}`)
        .then(res => res.json())
        .then(data => {
            let audioUrl = null;
            if (data && data[0] && data[0].phonetics) {
                const audioObj = data[0].phonetics.find(p => p.audio && p.audio.length > 0);
                if (audioObj) audioUrl = audioObj.audio;
            }
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                this.audioCache[lowerText] = audio;
                audio.play().catch(e => this.fallbackSpeak(text, lowerText));
            } else {
                this.fallbackSpeak(text, lowerText);
            }
        })
        .catch(err => this.fallbackSpeak(text, lowerText));
    } catch (e) {
      this.fallbackSpeak(text, lowerText);
    }
  }

  fallbackSpeak(text, lowerText) {
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(lowerText)}&tl=en-US&client=tw-ob`;
    const audio = new Audio(url);
    this.audioCache[lowerText] = audio;
    audio.play().catch(e => {
      console.warn("Audio play error, falling back to Web Speech API", e);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    });
  }"""

app_content = speak_regex.sub(new_speak_word, app_content)

# Fix openWordModal missing overflow hidden
app_content = app_content.replace('async openWordModal(word) {\n    if (!word) return;\n\n    const modal = document.getElementById("wordInspectorModal");',
                                  'async openWordModal(word) {\n    if (!word) return;\n    document.body.style.overflow = "hidden";\n    document.documentElement.style.overflow = "hidden";\n    const modal = document.getElementById("wordInspectorModal");')

# Fix closeWordModal overflow hidden
app_content = app_content.replace('closeWordModal() {\n    document.body.style.overflow = "";\n    document.getElementById("wordInspectorModal")?.classList.add("hidden");',
                                  'closeWordModal() {\n    document.body.style.overflow = "";\n    document.documentElement.style.overflow = "";\n    document.getElementById("wordInspectorModal")?.classList.add("hidden");')

# Let's just blindly add documentElement to all overflow clears in app.js
app_content = app_content.replace('document.body.style.overflow = "hidden";', 'document.body.style.overflow = "hidden"; document.documentElement.style.overflow = "hidden";')
app_content = app_content.replace('document.body.style.overflow = "";', 'document.body.style.overflow = ""; document.documentElement.style.overflow = "";')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_content)


# 3. Update index.html for filterBarContainer
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

old_filter_header = """<div id="filterBarContainer" class="hidden bg-gray-50/95 dark:bg-gray-800/90 border-t border-gray-200/60 dark:border-gray-700/60 px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-2.5 text-xs sm:text-sm min-w-max">"""

new_filter_header = """<div id="filterBarContainer" class="hidden bg-gray-50/95 dark:bg-gray-800/90 border-t border-gray-200/60 dark:border-gray-700/60 px-3 py-2 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">"""

html_content = html_content.replace(old_filter_header, new_filter_header)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Done python script")
