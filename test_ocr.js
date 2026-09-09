const Tesseract = require('tesseract.js');
const path = require('path');

const imgPath = path.join(__dirname, 'pdf_page_images', '2022_YDS1_ingilizce', 'page_25.png');

console.log(`Starting OCR on ${imgPath}...`);

Tesseract.recognize(
  imgPath,
  'eng',
  { logger: m => { if (m.status === 'recognizing text' && m.progress % 0.2 < 0.01) console.log(m.progress); } }
).then(({ data: { text } }) => {
  console.log('\n--- OCR RESULT ---');
  console.log(text);
});
