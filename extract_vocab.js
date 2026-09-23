const fs = require('fs');
const https = require('https');

// Read questions.js
const questionsContent = fs.readFileSync('questions.js', 'utf8');

// A simple way to get INITIAL_YDS_QUESTIONS from the file.
// Since it's a browser JS file with window/var assignments, we can evaluate a mock environment.
const mockWindow = {};
const mockConsts = {};

// We will just regex match the JSON-like array for INITIAL_YDS_QUESTIONS
const extractArray = (content, varName) => {
    const regex = new RegExp(`const\\s+${varName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'i');
    const match = content.match(regex);
    if (match) {
        return eval(match[1]);
    }
    return null;
};

let questions = extractArray(questionsContent, 'INITIAL_YDS_QUESTIONS');

if (!questions) {
    console.log("Could not extract INITIAL_YDS_QUESTIONS by regex. Falling back to eval...");
    // alternative: replace const with var and eval
    let script = questionsContent.replace(/const /g, 'var ');
    script = script.replace(/window\.questionRepo/g, 'var dummy');
    script = script.replace(/class /g, 'var DummyClass = function() {}; // class ');
    eval(script);
    questions = INITIAL_YDS_QUESTIONS;
}

const STOP_WORDS = new Set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    // numbers and roman numerals
    "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "can", "will", "may", "might", "shall", "ought",
    "many", "much", "some", "any", "no", "every", "all", "both", "either", "neither", "each", "other", "another",
    "such", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "first", "second", "third",
    "also", "just", "now", "even", "still", "well", "way", "make", "made", "make", "take", "took", "taken",
    "get", "got", "getting", "see", "saw", "seen", "say", "said", "saying", "go", "went", "gone", "going",
    "come", "came", "coming", "know", "knew", "known", "think", "thought", "look", "looked", "looking",
    "find", "found", "give", "gave", "given", "tell", "told", "work", "worked", "working", "use", "used", "using",
    "need", "needed", "feel", "felt", "become", "became", "leave", "left", "put", "mean", "meant", "keep", "kept",
    "let", "begin", "began", "begun", "seem", "seemed", "help", "helped", "show", "showed", "shown", "hear", "heard",
    "play", "played", "run", "ran", "move", "moved", "like", "liked", "live", "lived", "believe", "believed",
    "hold", "held", "bring", "brought", "happen", "happened", "write", "wrote", "written", "provide", "provided",
    "sit", "sat", "stand", "stood", "lose", "lost", "pay", "paid", "meet", "met", "include", "included",
    "continue", "continued", "set", "learn", "learned", "change", "changed", "lead", "led", "understand", "understood",
    "watch", "watched", "follow", "followed", "stop", "stopped", "create", "created", "speak", "spoke", "spoken",
    "read", "allow", "allowed", "add", "added", "spend", "spent", "grow", "grew", "grown", "open", "opened",
    "walk", "walked", "win", "won", "offer", "offered", "remember", "remembered", "love", "loved", "consider", "considered",
    "appear", "appeared", "buy", "bought", "wait", "waited", "serve", "served", "die", "died", "send", "sent",
    "expect", "expected", "build", "built", "stay", "stayed", "fall", "fell", "fallen", "cut", "reach", "reached",
    "kill", "killed", "remain", "remained", "suggest", "suggested", "raise", "raised", "pass", "passed", "sell", "sold",
    "require", "required", "report", "reported", "decide", "decided", "pull", "pulled",
    // other common bits
    "however", "although", "though", "while", "whereas", "therefore", "thus", "hence", "furthermore", "moreover",
    "despite", "instead", "rather", "whether", "often", "always", "sometimes", "never", "usually", "generally",
    "almost", "already", "perhaps", "probably", "possibly", "especially", "actually", "simply", "really", "certainly",
    "recently", "today", "tomorrow", "yesterday", "years", "time", "day", "people", "man", "woman", "men", "women",
    "child", "children", "life", "world", "thing", "things", "fact", "number", "part", "problem", "way", "case",
    "point", "government", "company", "group", "country", "family", "system", "program", "question", "work", "state",
    "water", "place", "form", "level", "area", "history", "idea", "result", "change", "study", "process", "result",
    "line", "word", "order", "name", "end", "reason", "century", "power", "kind", "force", "development", "effect",
    "result", "research", "nature", "book", "law", "control", "period", "rate", "art", "music", "food", "example",
    "since", "among", "without", "within", "throughout", "along", "upon", "until", "toward", "towards", "beyond"
]);

const wordCounts = {};

questions.forEach(q => {
    const textToAnalyze = q.questionText + " " + Object.values(q.options).join(" ");
    
    // Normalize: remove punctuation, lowercase, split by whitespace
    const words = textToAnalyze.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    
    words.forEach(w => {
        if (w.length > 2 && !STOP_WORDS.has(w)) {
            wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
    });
});

// Sort by frequency
const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 500);

console.log(`Found ${sortedWords.length} top words.`);

const fetchTranslation = (word) => {
    return new Promise((resolve) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&dt=at&q=${encodeURIComponent(word)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    // Google Translate gives:
                    // parsed[0][0][0] -> direct translation
                    // parsed[1] -> alternate translations (array of parts of speech)
                    
                    let meanings = [];
                    
                    if (parsed[1] && parsed[1].length > 0) {
                        // Extract up to 3 alternate meanings from the first part of speech
                        const terms = parsed[1][0][1];
                        if (terms && terms.length > 0) {
                            meanings = terms.slice(0, 3);
                        }
                    } 
                    
                    if (meanings.length === 0 && parsed[0] && parsed[0][0]) {
                        // fallback to direct translation
                        meanings.push(parsed[0][0][0]);
                    }
                    
                    resolve(meanings.join(', '));
                } catch (e) {
                    resolve('çeviri bulunamadı');
                }
            });
        }).on('error', () => {
            resolve('çeviri bulunamadı');
        });
    });
};

async function processWords() {
    const vocabList = [];
    console.log("Fetching translations...");
    
    for (let i = 0; i < sortedWords.length; i++) {
        const [word, freq] = sortedWords[i];
        process.stdout.write(`Translating ${i+1}/${sortedWords.length}: ${word}... `);
        const tr = await fetchTranslation(word);
        console.log(tr);
        vocabList.push({ word, tr, freq });
        
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
    }
    
    const jsContent = `// Auto-generated Vocab List for YDS (Top 500 words)\nconst VOCAB_LIST = ${JSON.stringify(vocabList, null, 2)};\n`;
    fs.writeFileSync('vocab-data.js', jsContent);
    
    // Copy to www/ if it exists
    if (fs.existsSync('www')) {
        fs.writeFileSync('www/vocab-data.js', jsContent);
    }
    
    console.log("Done! Saved to vocab-data.js");
}

processWords();
