const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

const PDF_DIR = path.join(__dirname, 'pdf_page_images');
const OUTPUT_DIR = path.join(__dirname, 'ocr_results');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const EXAMS = [
  "2022_YDS1_ingilizce",
  "2022_YDS2_ingilizce",
  "2023_YDS1_ingilizce",
  "2023_YDS2_ingilizce",
  "2024_YDS2_ingilizce",
  "2025_YDS1_Ingilizce"
];

async function processExam(exam) {
  const examDir = path.join(PDF_DIR, exam);
  if (!fs.existsSync(examDir)) return;
  
  const files = fs.readdirSync(examDir).filter(f => f.endsWith('.png')).sort();
  const results = {};
  
  console.log(`Processing ${exam} (${files.length} pages)...`);
  
  // We only need to OCR pages that likely contain passages.
  // Cloze tests: ~page 5-12
  // Reading: ~page 18-35
  for (let i = 0; i < files.length; i++) {
    // Optimization: Skip first 3 pages and pages after 35
    if (i < 3 || i > 35) continue;
    
    const file = files[i];
    const imgPath = path.join(examDir, file);
    try {
      const { data: { text } } = await Tesseract.recognize(imgPath, 'eng');
      results[i + 1] = text;
      
      // Stop if we've seen Soru No: 62 (last reading question)
      if (text.includes('Soru No: 62') || text.includes('Soru No: 63')) {
         // keep going a bit just in case
      }
    } catch (e) {
      console.error(`Error on ${exam} page ${i+1}:`, e.message);
    }
  }
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${exam}.json`), 
    JSON.stringify(results, null, 2)
  );
  console.log(`Finished ${exam}`);
}

async function run() {
  for (const exam of EXAMS) {
    await processExam(exam);
  }
  console.log('ALL DONE');
}

run();
