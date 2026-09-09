# -*- coding: utf-8 -*-
"""
Extract passages from YDS PDF files and inject into questions.js.
Handles both text-based and scanned PDFs.
"""
import json
import re
import os
import sys

import pymupdf

PDF_DIR = "pdf_kaynaklar"

PDF_EXAM_MAP = {
    "2018_ilkbahar_ING.pdf": "2018 YDS İlkbahar",
    "2018_yds_sonbahar_ingilizce.pdf": "2018 YDS Sonbahar",
    "2018_yds3_ingilizce.pdf": "2018 YDS/3",
    "2019_YDS1_ingilizce.pdf": "2019 YDS/1 (İlkbahar)",
    "2019_YDS2_ingilizce.pdf": "2019 YDS/2 (Sonbahar)",
    "2019_YDS3_ingilizce.pdf": "2019 YDS/3",
    "2020_YDS1_ingilizce.pdf": "2020 YDS/1",
    "2021_YDS1_ingilizce.pdf": "2021 YDS/1 (İlkbahar)",
    "2021_YDS2_ingilizce.pdf": "2021 YDS/2 (Sonbahar)",
    "2022_YDS1_ingilizce.pdf": "2022 YDS/1 (Nisan)",
    "2022_YDS2_ingilizce.pdf": "2022 YDS/2 (Ekim)",
    "2023_YDS1_ingilizce.pdf": "2023 YDS/1",
    "2023_YDS2_ingilizce.pdf": "2023 YDS/2",
    "2024_YDS2_ingilizce.pdf": "2024 YDS/2 (Kasım)",
    "2025_YDS1_Ingilizce.pdf": "2025 YDS/1",
}

def extract_full_text(pdf_path):
    doc = pymupdf.open(pdf_path)
    full_text = ""
    for page in doc:
        text = page.get_text("text")
        full_text += text + "\n"
    doc.close()
    return full_text

def is_scanned_pdf(text):
    """Check if a PDF is mostly scanned (very little extractable text)."""
    # Count meaningful text (letters)
    letters = sum(1 for c in text if c.isalpha())
    return letters < 500

def find_passages_in_text(text):
    """Find passage blocks between group headers and first question."""
    passages = {}
    
    # Pattern for group headers like "16 – 21. sorulardaki" or "43 - 46. sorularda"
    group_header_pattern = re.compile(
        r'(\d{1,2})\s*[\-\u2013\u2014]\s*(\d{1,2})\.\s*soru',
        re.IGNORECASE
    )
    
    headers = list(group_header_pattern.finditer(text))
    
    for header in headers:
        start_q = int(header.group(1))
        end_q = int(header.group(2))
        
        # Find the end of the instruction line
        header_pos = header.end()
        # Look for end of instruction (usually ends with a period or newline after instruction text)
        instruction_end = text.find('\n', header_pos)
        if instruction_end == -1:
            continue
        
        # Skip past the instruction line(s) - there might be multi-line instructions
        # Look for the next substantial text block
        search_start = instruction_end + 1
        
        # Find the first question number in the group
        first_q_pattern = re.compile(
            rf'(?:^|\n)\s*{start_q}\.\s+\S',
            re.MULTILINE
        )
        first_q_match = first_q_pattern.search(text, search_start)
        
        if first_q_match:
            passage_text = text[search_start:first_q_match.start()].strip()
            
            # Clean up passage
            passage_text = re.sub(r'\n{3,}', '\n', passage_text)
            # Remove page headers/footers
            passage_text = re.sub(r'\d{4}[\-\s]*YDS.*?English\n?', '', passage_text)
            passage_text = re.sub(r'Go on to the next page\.?\n?', '', passage_text, flags=re.IGNORECASE)
            passage_text = re.sub(r'OSYM\d+\n?', '', passage_text)
            passage_text = passage_text.strip()
            
            if len(passage_text) > 80:
                passages[(start_q, end_q)] = passage_text
    
    return passages

def load_questions():
    with open('questions.js', 'r', encoding='utf-8') as f:
        content = f.read()
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    json_str = content[start_idx:end_idx+1]
    try:
        questions = json.loads(json_str)
    except json.decoder.JSONDecodeError as e:
        json_str = json_str[:e.pos]
        end_idx2 = json_str.rfind(']')
        json_str = json_str[:end_idx2+1]
        questions = json.loads(json_str)
        end_idx = start_idx + end_idx2
    return questions, content, start_idx, end_idx

def save_questions(questions, content, start_idx, end_idx):
    new_json_str = json.dumps(questions, ensure_ascii=False, indent=2)
    new_content = content[:start_idx] + new_json_str + content[end_idx+1:]
    with open('questions.js', 'w', encoding='utf-8') as f:
        f.write(new_content)

# Main
questions, raw_content, start_idx, end_idx = load_questions()

q_lookup = {}
for q in questions:
    key = (q.get('exam', ''), q.get('questionNumber', 0))
    q_lookup[key] = q

total_fixed = 0
scanned_pdfs = []

for pdf_file, exam_name in sorted(PDF_EXAM_MAP.items()):
    pdf_path = os.path.join(PDF_DIR, pdf_file)
    if not os.path.exists(pdf_path):
        continue
    
    text = extract_full_text(pdf_path)
    
    if is_scanned_pdf(text):
        scanned_pdfs.append((pdf_file, exam_name))
        continue
    
    passages = find_passages_in_text(text)
    
    for (start_q, end_q), passage_text in passages.items():
        for qnum in range(start_q, end_q + 1):
            key = (exam_name, qnum)
            if key in q_lookup:
                existing = q_lookup[key].get('passage', '')
                if not existing or len(existing.strip()) < 30:
                    q_lookup[key]['passage'] = passage_text
                    total_fixed += 1

print(f"Text-based PDFs: Fixed {total_fixed} passages")
print(f"Scanned PDFs (need OCR): {[s[0] for s in scanned_pdfs]}")

# Now handle cloze test Q16 propagation from Q17
# For all exams, if Q16 has no passage but Q17 does, copy it
cloze_fixed = 0
for q in questions:
    if q.get('questionNumber') == 16:
        exam = q.get('exam', '')
        passage = q.get('passage', '')
        if not passage or len(passage.strip()) < 30:
            # Find Q17 in same exam
            key17 = (exam, 17)
            if key17 in q_lookup:
                p17 = q_lookup[key17].get('passage', '')
                if p17 and len(p17.strip()) > 30:
                    q['passage'] = p17
                    cloze_fixed += 1

print(f"Cloze Q16 fixed from Q17: {cloze_fixed}")

if total_fixed > 0 or cloze_fixed > 0:
    save_questions(questions, raw_content, start_idx, end_idx)
    print("questions.js UPDATED!")

# Summary of still-missing exams
print("\n=== STILL MISSING PASSAGES (scanned PDFs) ===")
for pdf_file, exam_name in scanned_pdfs:
    # Check what groups still need passages
    for start_q, end_q in [(16,21), (43,46), (47,50), (51,54), (55,58), (59,62)]:
        key = (exam_name, start_q)
        if key in q_lookup:
            p = q_lookup[key].get('passage', '')
            if not p or len(p.strip()) < 30:
                print(f"  {exam_name}: Q{start_q}-{end_q} missing")
