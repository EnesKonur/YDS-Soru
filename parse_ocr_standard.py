# -*- coding: utf-8 -*-
"""
Run the v2 regex passage extraction on the OCR'd texts
"""
import pymupdf, json, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

OCR_DIR = "ocr_results"

# We only care about the ones that failed the first parsing pass
EXAMS = [
    "2023_YDS1_ingilizce", # Q17 failed
    "2023_YDS2_ingilizce",
    "2024_YDS2_ingilizce",
    "2025_YDS1_Ingilizce"
]

EXAM_MAP = {
    "2023_YDS1_ingilizce": "2023 YDS/1",
    "2023_YDS2_ingilizce": "2023 YDS/2",
    "2024_YDS2_ingilizce": "2024 YDS/2 (Kasım)",
    "2025_YDS1_Ingilizce": "2025 YDS/1"
}

def extract_passage_for_group(full_text, start_q, end_q):
    # Same logic as v2
    q_pattern = re.compile(
        rf'(?:^|\n)\s*{start_q}\.\s+(?!\s*soru)',
        re.MULTILINE
    )
    
    q_matches = list(q_pattern.finditer(full_text))
    if not q_matches:
        # Try without the dot, OCR is messy
        q_pattern2 = re.compile(rf'(?:^|\n)\s*{start_q}\s+(?!\s*soru)', re.MULTILINE)
        q_matches = list(q_pattern2.finditer(full_text))
        if not q_matches:
            return None
    
    q_pos = q_matches[0].start()
    
    instruction_pattern = re.compile(
        rf'{start_q}\s*[\-\u2013\u2014]\s*{end_q}\.',
        re.IGNORECASE
    )
    
    search_region = full_text[max(0, q_pos - 5000):q_pos]
    inst_matches = list(instruction_pattern.finditer(search_region))
    
    if not inst_matches:
        # OCR might have read it as 43-46:
        instruction_pattern2 = re.compile(
            rf'{start_q}\s*[\-\u2013\u2014]\s*{end_q}[:\.]?',
            re.IGNORECASE
        )
        inst_matches = list(instruction_pattern2.finditer(search_region))
        if not inst_matches:
            return None
    
    inst_match = inst_matches[-1]
    inst_abs_pos = max(0, q_pos - 5000) + inst_match.end()
    
    inst_line_end = full_text.find('\n', inst_abs_pos)
    if inst_line_end == -1:
        return None
        
    passage_start = inst_line_end + 1
    passage = full_text[passage_start:q_pos].strip()
    
    passage = re.sub(r'\d{4}[\-\s]*YDS.*?English\s*\n?', '', passage)
    passage = re.sub(r'Go on to the next page\.?\s*\n?', '', passage, flags=re.IGNORECASE)
    passage = re.sub(r'OSYM\d+\s*\n?', '', passage)
    passage = re.sub(r'---PAGE_\d+---', '', passage)
    passage = re.sub(r'\n{2,}', '\n', passage)
    passage = re.sub(r'(?<!\n)\n(?!\n)', ' ', passage) # rejoin lines
    passage = passage.strip()
    
    return passage if len(passage) > 80 else None

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

questions, raw_content, start_idx, end_idx = load_questions()
q_lookup = {}
for q in questions:
    key = (q.get('exam', ''), q.get('questionNumber', 0))
    q_lookup[key] = q

groups = [(16, 21), (22, 26), (43, 46), (47, 50), (51, 54), (55, 58), (59, 62)]

total_fixed = 0

for ocr_file in EXAMS:
    exam_name = EXAM_MAP[ocr_file]
    json_path = os.path.join(OCR_DIR, f"{ocr_file}.json")
    if not os.path.exists(json_path):
        continue
        
    print(f"\n=== {exam_name} ===")
    with open(json_path, 'r', encoding='utf-8') as f:
        pages = json.load(f)
        
    full_text = ""
    for page_num in sorted([int(k) for k in pages.keys()]):
        full_text += f"\n---PAGE_{page_num}---\n" + pages[str(page_num)]
        
    for start_q, end_q in groups:
        needs_passage = False
        for qnum in range(start_q, end_q + 1):
            key = (exam_name, qnum)
            if key in q_lookup:
                p = q_lookup[key].get('passage', '')
                if not p or len(p.strip()) < 50:
                    needs_passage = True
                    break
                    
        if not needs_passage:
            continue
            
        passage = extract_passage_for_group(full_text, start_q, end_q)
        
        # Cloze test 1 special case (16-21 instruction but passage is for 17-21 sometimes)
        if not passage and start_q == 16:
            passage = extract_passage_for_group(full_text, 17, 21)
            
        if passage:
            print(f"  Q{start_q}-{end_q}: Found passage ({len(passage)} chars)")
            for qnum in range(start_q, end_q + 1):
                key = (exam_name, qnum)
                if key in q_lookup:
                    q_lookup[key]['passage'] = passage
                    total_fixed += 1
        else:
            print(f"  Q{start_q}-{end_q}: [NOT FOUND]")

print(f"\nTotal passages injected: {total_fixed}")

if total_fixed > 0:
    new_json_str = json.dumps(questions, ensure_ascii=False, indent=2)
    new_content = raw_content[:start_idx] + new_json_str + raw_content[end_idx+1:]
    with open('questions.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("questions.js UPDATED!")
