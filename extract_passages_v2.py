# -*- coding: utf-8 -*-
"""
Phase 1: Extract passages from text-based PDFs (2018-2021).
These PDFs have extractable text. We need to identify the passage text
between group headers (like "43 - 46. sorularda...") and the first question.
"""
import pymupdf, json, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

PDF_DIR = "pdf_kaynaklar"

# Only text-based PDFs
TEXT_PDFS = {
    "2018_ilkbahar_ING.pdf": "2018 YDS İlkbahar",
    "2018_yds_sonbahar_ingilizce.pdf": "2018 YDS Sonbahar",
    "2018_yds3_ingilizce.pdf": "2018 YDS/3",
    "2019_YDS1_ingilizce.pdf": "2019 YDS/1 (İlkbahar)",
    "2019_YDS2_ingilizce.pdf": "2019 YDS/2 (Sonbahar)",
    "2019_YDS3_ingilizce.pdf": "2019 YDS/3",
    "2020_YDS1_ingilizce.pdf": "2020 YDS/1",
    "2021_YDS1_ingilizce.pdf": "2021 YDS/1 (İlkbahar)",
    "2021_YDS2_ingilizce.pdf": "2021 YDS/2 (Sonbahar)",
}

def get_full_text(pdf_path):
    doc = pymupdf.open(pdf_path)
    pages = []
    for page in doc:
        pages.append(page.get_text("text"))
    doc.close()
    return pages

def extract_passage_for_group(full_text, start_q, end_q):
    """
    Extract the passage text for a question group.
    Strategy: Find the passage text that appears before the first question 
    of the group in the PDF text.
    
    In YDS PDFs, the structure is:
    [instruction like "43 - 46. sorularda..."]
    [PASSAGE TEXT - multiple paragraphs]
    [43. question text...]
    """
    # First, find where question start_q begins
    # Questions are numbered like "43." at the start of a line
    q_pattern = re.compile(
        rf'(?:^|\n)\s*{start_q}\.\s+(?!\s*soru)',
        re.MULTILINE
    )
    
    q_matches = list(q_pattern.finditer(full_text))
    if not q_matches:
        return None
    
    q_pos = q_matches[0].start()
    
    # Now look backwards from q_pos to find where the passage starts.
    # The passage starts after the group instruction header.
    # Look for patterns like "43 - 46." or "43 – 46."
    instruction_pattern = re.compile(
        rf'{start_q}\s*[\-\u2013\u2014]\s*{end_q}\.',
        re.IGNORECASE
    )
    
    # Search in the region before q_pos
    search_region = full_text[max(0, q_pos - 5000):q_pos]
    inst_matches = list(instruction_pattern.finditer(search_region))
    
    if not inst_matches:
        # Try broader search
        return None
    
    # The instruction line ends at the end of its line
    inst_match = inst_matches[-1]  # Take the closest one
    inst_abs_pos = max(0, q_pos - 5000) + inst_match.end()
    
    # Find end of instruction line
    inst_line_end = full_text.find('\n', inst_abs_pos)
    if inst_line_end == -1:
        return None
    
    # Sometimes there are additional instruction lines, skip them
    # The passage starts after all instruction text
    passage_start = inst_line_end + 1
    
    # The passage is between passage_start and q_pos
    passage = full_text[passage_start:q_pos].strip()
    
    # Clean up
    passage = re.sub(r'\d{4}[\-\s]*YDS.*?English\s*\n?', '', passage)
    passage = re.sub(r'Go on to the next page\.?\s*\n?', '', passage, flags=re.IGNORECASE)
    passage = re.sub(r'OSYM\d+\s*\n?', '', passage)
    passage = re.sub(r'\n{3,}', '\n', passage)
    passage = passage.strip()
    
    return passage if len(passage) > 80 else None

# Load questions
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

# Standard groups to look for
groups = [(16, 21), (22, 26), (43, 46), (47, 50), (51, 54), (55, 58), (59, 62)]

total_fixed = 0

for pdf_file, exam_name in sorted(TEXT_PDFS.items()):
    pdf_path = os.path.join(PDF_DIR, pdf_file)
    if not os.path.exists(pdf_path):
        continue
    
    pages = get_full_text(pdf_path)
    full_text = '\n'.join(pages)
    
    alpha_count = sum(1 for c in full_text if c.isalpha())
    if alpha_count < 1000:
        print(f"[SKIP] {pdf_file}: Only {alpha_count} alpha chars (scanned?)")
        continue
    
    print(f"\n=== {pdf_file} -> {exam_name} ===")
    
    for start_q, end_q in groups:
        # Check if any question in the group needs a passage
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
        
        if passage:
            print(f"  Q{start_q}-{end_q}: Found passage ({len(passage)} chars): \"{passage[:60]}...\"")
            for qnum in range(start_q, end_q + 1):
                key = (exam_name, qnum)
                if key in q_lookup:
                    existing = q_lookup[key].get('passage', '')
                    if not existing or len(existing.strip()) < 50:
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
