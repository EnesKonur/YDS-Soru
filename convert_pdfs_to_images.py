# -*- coding: utf-8 -*-
"""
Extract passages from scanned YDS PDFs by converting pages to images
and using OCR or manual text extraction.
Step 1: Convert relevant pages to images for inspection.
"""
import pymupdf
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

PDF_DIR = "pdf_kaynaklar"
OUTPUT_DIR = "pdf_page_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Scanned PDFs that need OCR
SCANNED_PDFS = [
    "2022_YDS1_ingilizce.pdf",
    "2022_YDS2_ingilizce.pdf",
    "2023_YDS1_ingilizce.pdf",
    "2023_YDS2_ingilizce.pdf",
    "2024_YDS2_ingilizce.pdf",
    "2025_YDS1_Ingilizce.pdf",
]

for pdf_file in SCANNED_PDFS:
    pdf_path = os.path.join(PDF_DIR, pdf_file)
    if not os.path.exists(pdf_path):
        print(f"[SKIP] {pdf_file} not found")
        continue
    
    doc = pymupdf.open(pdf_path)
    print(f"{pdf_file}: {len(doc)} pages")
    
    # Convert all pages to images
    pdf_name = os.path.splitext(pdf_file)[0]
    pdf_out_dir = os.path.join(OUTPUT_DIR, pdf_name)
    os.makedirs(pdf_out_dir, exist_ok=True)
    
    for i in range(len(doc)):
        page = doc[i]
        # Render at 200 DPI for good OCR quality
        pix = page.get_pixmap(dpi=200)
        img_path = os.path.join(pdf_out_dir, f"page_{i+1:02d}.png")
        pix.save(img_path)
    
    print(f"  Saved {len(doc)} page images to {pdf_out_dir}/")
    doc.close()

print("\nDone! All pages converted to images.")
