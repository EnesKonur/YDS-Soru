# -*- coding: utf-8 -*-
import pymupdf, json, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

OCR_DIR = "ocr_results"

EXAMS = [
    "2023_YDS2_ingilizce",
    "2024_YDS2_ingilizce",
    "2025_YDS1_Ingilizce"
]

EXAM_MAP = {
    "2023_YDS2_ingilizce": "2023 YDS/2",
    "2024_YDS2_ingilizce": "2024 YDS/2 (Kasım)",
    "2025_YDS1_Ingilizce": "2025 YDS/1"
}

def clean_passage(text):
    if not text: return ""
    text = re.sub(r'20\d{2}\s+(YDS|YOKDIL|NiSAN).*?\n', '', text, flags=re.IGNORECASE)
    text = re.sub(r'OSYM\d*\n?', '', text)
    text = re.sub(r'---PAGE_\d+---', '', text)
    text = re.sub(r'\n{2,}', '\n', text)
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

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
    if not os.path.exists(json_path): continue
        
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
            
        # Much looser regex: a newline, some spaces, the number, then ANY character
        q_pattern = re.compile(rf'(?:^|\n)\s*{start_q}\s*[\.\-\—\_\s\n]', re.MULTILINE)
        q_matches = list(q_pattern.finditer(full_text))
        
        if not q_matches:
            q_pattern2 = re.compile(rf'Soru No:\s*{start_q}\b', re.IGNORECASE)
            q_matches = list(q_pattern2.finditer(full_text))
            if not q_matches:
                print(f"  Q{start_q}-{end_q}: [NOT FOUND Q{start_q}]")
                continue
                
        q_pos = q_matches[0].start()
        
        search_region = full_text[:q_pos]
        
        # End of previous question
        prev_q = start_q - 1
        prev_q_pattern = re.compile(rf'(?:^|\n)\s*{prev_q}\b', re.MULTILINE)
        prev_matches = list(prev_q_pattern.finditer(search_region))
        
        passage_start = 0
        if prev_matches:
            prev_match = prev_matches[-1]
            # Try to find 'E)'
            end_of_prev = search_region.rfind('E)', prev_match.end())
            if end_of_prev != -1:
                newline_after = search_region.find('\n', end_of_prev)
                passage_start = newline_after if newline_after != -1 else end_of_prev + 2
            else:
                passage_start = prev_match.end()
        
        last_page_marker = search_region.rfind('---PAGE_')
        actual_start = max(passage_start, last_page_marker)
        
        if actual_start == last_page_marker:
            marker_end = search_region.find('\n', last_page_marker)
            if marker_end != -1:
                actual_start = marker_end
                
        instr_pattern = re.compile(rf'{start_q}\s*[\-\u2013\u2014]\s*{end_q}.*?\n', re.IGNORECASE)
        instr_match = instr_pattern.search(search_region[actual_start:])
        if instr_match:
            actual_start += instr_match.end()
            
        passage = clean_passage(search_region[actual_start:].strip())
        
        if len(passage) < 100 and start_q == 16:
            # Let's try to extract from Q17
            q17_pattern = re.compile(rf'(?:^|\n)\s*17\b', re.MULTILINE)
            q17_matches = list(q17_pattern.finditer(full_text))
            if q17_matches:
                q17_pos = q17_matches[0].start()
                search_region17 = full_text[:q17_pos]
                last_page_17 = search_region17.rfind('---PAGE_')
                marker_end_17 = search_region17.find('\n', last_page_17)
                start_17 = max(marker_end_17, search_region17.rfind('E)', 0, last_page_17))
                if start_17 > last_page_17: 
                    start_17 = search_region17.find('\n', start_17)
                instr_17 = instr_pattern.search(search_region17[start_17:])
                if instr_17: start_17 += instr_17.end()
                passage = clean_passage(search_region17[start_17:].strip())
        
        if len(passage) > 100:
            print(f"  Q{start_q}-{end_q}: Found passage ({len(passage)} chars)")
            for qnum in range(start_q, end_q + 1):
                key = (exam_name, qnum)
                if key in q_lookup:
                    q_lookup[key]['passage'] = passage
                    total_fixed += 1
        else:
            print(f"  Q{start_q}-{end_q}: [TOO SHORT] {len(passage)} chars -> '{passage}'")

print(f"\nTotal passages injected: {total_fixed}")
if total_fixed > 0:
    new_json_str = json.dumps(questions, ensure_ascii=False, indent=2)
    new_content = raw_content[:start_idx] + new_json_str + raw_content[end_idx+1:]
    with open('questions.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("questions.js UPDATED!")
