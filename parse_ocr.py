# -*- coding: utf-8 -*-
"""
Parse the OCR results (JSON) and inject passages into questions.js
for the scanned exams (2022-2025).
"""
import json
import re
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

OCR_DIR = "ocr_results"
EXAM_MAP = {
    "2022_YDS1_ingilizce": "2022 YDS/1 (Nisan)",
    "2022_YDS2_ingilizce": "2022 YDS/2 (Ekim)",
    "2023_YDS1_ingilizce": "2023 YDS/1",
    "2023_YDS2_ingilizce": "2023 YDS/2",
    "2024_YDS2_ingilizce": "2024 YDS/2 (Kasım)",
    "2025_YDS1_Ingilizce": "2025 YDS/1"
}

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

def clean_passage(text):
    if not text:
        return ""
    # Remove header strings
    text = re.sub(r'20\d{2}\s+(YDS|YOKDIL).*?\n', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Soru No:.*?\n?', '', text, flags=re.IGNORECASE)
    # Remove page numbers on solitary lines
    text = re.sub(r'(?m)^\s*\d+\s*$', '', text)
    # Rejoin broken lines (if not a paragraph break)
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

questions, raw_content, start_idx, end_idx = load_questions()

q_lookup = {}
for q in questions:
    key = (q.get('exam', ''), q.get('questionNumber', 0))
    q_lookup[key] = q

targets = [
    (17, [16, 17, 18, 19, 20, 21]),
    (22, [22, 23, 24, 25, 26]),
    (43, [43, 44, 45, 46]),
    (47, [47, 48, 49, 50]),
    (51, [51, 52, 53, 54]),
    (55, [55, 56, 57, 58]),
    (59, [59, 60, 61, 62]),
]

total_fixed = 0

for ocr_file, exam_name in EXAM_MAP.items():
    json_path = os.path.join(OCR_DIR, f"{ocr_file}.json")
    if not os.path.exists(json_path):
        continue
        
    print(f"\n=== Processing {exam_name} ===")
    with open(json_path, 'r', encoding='utf-8') as f:
        pages = json.load(f)
    
    # Combine pages into a continuous string with markers
    full_text = ""
    for page_num in sorted([int(k) for k in pages.keys()]):
        full_text += f"\n---PAGE_{page_num}---\n" + pages[str(page_num)]
        
    for target_q, group_qs in targets:
        # Find where the question starts
        q_pattern = re.compile(rf'Soru No:\s*{target_q}\b', re.IGNORECASE)
        match = q_pattern.search(full_text)
        
        if not match:
            print(f"  [NOT FOUND] Soru No: {target_q}")
            continue
            
        q_pos = match.start()
        
        # Look backwards for the previous Soru No or PAGE marker
        # The passage should be between the previous question end and this question start
        search_region = full_text[:q_pos]
        
        prev_q_pattern = re.compile(r'Soru No:\s*\d+\b', re.IGNORECASE)
        prev_matches = list(prev_q_pattern.finditer(search_region))
        
        passage_start = 0
        if prev_matches:
            # Passage starts after the options of the previous question
            # Since OCR is messy, we'll just take the text from the start of the current page,
            # or after the last "E) ..." of the previous question
            last_q_match = prev_matches[-1]
            # Try to find the end of the previous question
            end_of_prev = search_region.rfind('E)', last_q_match.end())
            if end_of_prev != -1:
                # Find the end of that line
                newline_after_E = search_region.find('\n', end_of_prev)
                passage_start = newline_after_E if newline_after_E != -1 else end_of_prev + 2
            else:
                passage_start = last_q_match.end()
                
        # Also respect PAGE markers
        last_page_marker = search_region.rfind('---PAGE_')
        
        # Usually, the passage starts at the top of the page.
        # If the last question ended on the previous page, the passage starts after the PAGE marker
        actual_start = max(passage_start, last_page_marker)
        if actual_start == last_page_marker:
            # Move past the marker
            marker_end = search_region.find('\n', last_page_marker)
            if marker_end != -1:
                actual_start = marker_end
                
        raw_passage = search_region[actual_start:].strip()
        passage = clean_passage(raw_passage)
        
        # Check if passage is suspiciously short (maybe it started on the previous page)
        if len(passage) < 200 and prev_matches:
            # Let's widen the search to the end of the previous question
            widen_start = passage_start
            raw_passage = search_region[widen_start:].strip()
            # Clean page markers
            raw_passage = re.sub(r'---PAGE_\d+---', '', raw_passage)
            passage = clean_passage(raw_passage)

        if len(passage) > 100:
            print(f"  Found passage for Q{target_q} ({len(passage)} chars)")
            # Inject into questions
            for qnum in group_qs:
                key = (exam_name, qnum)
                if key in q_lookup:
                    q_lookup[key]['passage'] = passage
                    total_fixed += 1
        else:
            print(f"  [SHORT PASSAGE] Q{target_q}: {len(passage)} chars - '{passage[:30]}'")

print(f"\nTotal passages injected: {total_fixed}")

if total_fixed > 0:
    new_json_str = json.dumps(questions, ensure_ascii=False, indent=2)
    new_content = raw_content[:start_idx] + new_json_str + raw_content[end_idx+1:]
    with open('questions.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("questions.js UPDATED!")
