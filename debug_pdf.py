# -*- coding: utf-8 -*-
import pymupdf, re, sys
sys.stdout.reconfigure(encoding='utf-8')

# Try all PDFs and check text extraction quality
pdfs = [
    '2018_yds3_ingilizce.pdf',
    '2022_YDS1_ingilizce.pdf', 
    '2025_YDS1_Ingilizce.pdf'
]

for pdf_file in pdfs:
    path = f'pdf_kaynaklar/{pdf_file}'
    doc = pymupdf.open(path)
    total_chars = 0
    total_alpha = 0
    for page in doc:
        text = page.get_text('text')
        total_chars += len(text)
        total_alpha += sum(1 for c in text if c.isalpha())
    
    print(f'{pdf_file}: {len(doc)} pages, {total_chars} chars, {total_alpha} alpha chars')
    
    # Show pages with substantial text
    for i in range(len(doc)):
        text = doc[i].get_text('text')
        alpha = sum(1 for c in text if c.isalpha())
        if alpha > 200:
            # Look for "43" pattern on this page
            has_43 = '43' in text and ('passage' in text.lower() or 'par' in text.lower())
            marker = ' ***HAS 43+passage***' if has_43 else ''
            print(f'  Page {i+1}: {alpha} alpha chars{marker}')
            # Look for any question instruction text
            if re.search(r'(sorular|questions|passage|Answer)', text, re.IGNORECASE):
                snippet = text[:200].replace('\n', '|')
                print(f'    -> {snippet}')
    doc.close()
    print()
