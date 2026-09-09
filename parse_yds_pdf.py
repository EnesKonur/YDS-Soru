"""
YDS PDF -> JSON Question Extractor v2
Robust multi-line option parsing for all YDS question types.
"""
import fitz
import re
import json
import sys
import os


def extract_text_columns(pdf_path):
    """Extract text from PDF respecting 2-column layout."""
    doc = fitz.open(pdf_path)
    full = ''
    for page in doc:
        w = page.rect.width
        words = page.get_text('words')
        if not words:
            continue
        left = [x for x in words if x[0] < w * 0.48]
        right = [x for x in words if x[0] >= w * 0.48]
        left.sort(key=lambda x: (round(x[1] / 8), x[0]))
        right.sort(key=lambda x: (round(x[1] / 8), x[0]))

        def to_lines(wlist):
            lines = []
            cur = []
            cy = None
            for w in wlist:
                if cy is None or abs(w[1] - cy) < 8:
                    cur.append(w[4])
                    cy = w[1] if cy is None else cy
                else:
                    lines.append(' '.join(cur))
                    cur = [w[4]]
                    cy = w[1]
            if cur:
                lines.append(' '.join(cur))
            return lines

        for l in to_lines(left):
            full += l + '\n'
        for l in to_lines(right):
            full += l + '\n'
    doc.close()
    return full


def extract_answer_key(text):
    """Extract the answer key from the end of the document."""
    answers = {}
    # Find the answer key section - look for markers in the last 30%
    key_start = None
    for marker in ['CHECK YOUR ANSWERS', 'CEVAP ANAHTARI', 'CEVAP']:
        idx = text.rfind(marker)
        if idx > len(text) * 0.7:
            key_start = idx
            break
    
    if key_start is None:
        key_start = int(len(text) * 0.8)
    
    key_section = text[key_start:]
    pattern = re.compile(r'(\d{1,2})\.\s*([A-E])\b')
    for m in pattern.finditer(key_section):
        qnum = int(m.group(1))
        ans = m.group(2)
        if 1 <= qnum <= 80:
            answers[qnum] = ans
    
    return answers


def split_into_question_blocks(text):
    """Split the full text into individual question blocks using question numbers."""
    lines = text.split('\n')
    
    # Find the cutoff (answer key)
    cutoff = len(lines)
    for i, line in enumerate(lines):
        s = line.strip()
        if any(m in s for m in ['END OF THE TEST', 'CHECK YOUR ANSWERS', 'CEVAP ANAHTARI']):
            cutoff = i
            break
    
    # Find all question start positions
    q_positions = []
    for i, line in enumerate(lines):
        if i >= cutoff:
            break
        s = line.strip()
        # Match "N." at the start of a line, MUST be followed by a space or end of string,
        # but for cloze tests sometimes it's just "17." with no space.
        # So we use \s+ or end of line or an uppercase letter (just in case).
        # To avoid decimals like "50.6", we use (?!\d) to ensure no digit follows the dot.
        m = re.match(r'^(\d{1,2})\.(?!\d)\s*', s)
        if m:
            qnum = int(m.group(1))
            if 1 <= qnum <= 80:
                q_positions.append((i, qnum))
    
    # Also find section/passage headers like "17-21: For these questions..."
    # and capture passage text that appears between a header and the first question in that range
    section_headers = []
    for i, line in enumerate(lines):
        if i >= cutoff:
            break
        s = line.strip()
        m = re.match(r'^(\d{1,2})-(\d{1,2}):\s', s)
        if m:
            start_q = int(m.group(1))
            end_q = int(m.group(2))
            section_headers.append((i, start_q, end_q))
    
    # Build question blocks
    blocks = {}
    for idx, (line_idx, qnum) in enumerate(q_positions):
        # Find end of this question
        if idx + 1 < len(q_positions):
            end_idx = q_positions[idx + 1][0]
        else:
            end_idx = cutoff
        
        block_lines = lines[line_idx:end_idx]
        # Clean: remove page markers
        cleaned = []
        for bl in block_lines:
            s = bl.strip()
            if re.match(r'^\d+\s+Go on to the next page', s):
                continue
            if re.match(r'^20\d{2}-YDS', s):
                continue
            if s == 'ENGLISH':
                continue
            if re.match(r'^\d{1,2}-\d{1,2}:\s+For these questions', s):
                continue
            if s.startswith('word(s) or expression') or s.startswith('word or expression'):
                continue
            if s.startswith('passage.') or s.startswith('passage below.'):
                continue
            cleaned.append(bl)
        
        block_text = '\n'.join(cleaned).strip()
        
        # Check if there's a passage/header for this question's section
        passage = ''
        for (h_line, h_start, h_end) in section_headers:
            if h_start <= qnum <= h_end:
                # Find passage text between header and first question of this section
                first_q_in_section = None
                for (ql, qn) in q_positions:
                    if qn == h_start:
                        first_q_in_section = ql
                        break
                if first_q_in_section and first_q_in_section > h_line:
                    # Passage is text between header+instructions and first question
                    passage_lines = []
                    for pi in range(h_line, first_q_in_section):
                        s = lines[pi].strip()
                        # Skip the header line itself and instruction lines
                        if re.match(r'^\d{1,2}-\d{1,2}:', s):
                            continue
                        if 'For these questions' in s or 'choose the' in s:
                            continue
                        if 'word(s) or expression' in s or 'word or expression' in s:
                            continue
                        if 'fill the space' in s:
                            continue
                        if 'passage' in s.lower() and len(s) < 50:
                            continue
                        if re.match(r'^\d+\s+Go on', s):
                            continue
                        if re.match(r'^20\d{2}-YDS', s):
                            continue
                        if s == 'ENGLISH' or s == '':
                            continue
                        passage_lines.append(s)
                    passage = '\n'.join(passage_lines).strip()
                break
        
        blocks[qnum] = {
            'raw': block_text,
            'passage': passage
        }
    
    return blocks


def parse_options_from_block(block_text):
    """Extract options A-E from a question block, handling multi-line options."""
    # First, fix common 2-column merge issues like "C) D) word1 word2"
    # This happens when left column has "C) word1" and right has "D) word2"
    # but they merge into "C) D) word1 word2"
    
    # Fix pattern: two consecutive option letters with text after
    # e.g. "C) D) implications drawbacks" -> "C) implications D) drawbacks"
    def fix_merged_options(text):
        # Pattern: "X) Y) word1 word2..." where X and Y are consecutive letters
        pattern = re.compile(r'([A-E])\)\s+([A-E])\)\s+((?:\S+\s+)+\S+)')
        
        def split_merge(m):
            letter1 = m.group(1)
            letter2 = m.group(2)
            words = m.group(3).strip().split()
            if len(words) >= 2:
                mid = len(words) // 2
                return f"{letter1}) {' '.join(words[:mid])} {letter2}) {' '.join(words[mid:])}"
            return m.group(0)
        
        return pattern.sub(split_merge, text)
    
    block_text = fix_merged_options(block_text)
    
    # Find all option start positions
    option_positions = []
    for m in re.finditer(r'([A-E])\)\s*', block_text):
        option_positions.append((m.start(), m.group(1), m.end()))
    
    if not option_positions:
        return {}
    
    options = {}
    for i, (pos, letter, text_start) in enumerate(option_positions):
        if i + 1 < len(option_positions):
            next_pos = option_positions[i + 1][0]
            opt_text = block_text[text_start:next_pos]
        else:
            opt_text = block_text[text_start:]
        
        opt_text = opt_text.strip()
        opt_text = re.sub(r'\n', ' ', opt_text)
        opt_text = re.sub(r'\s+', ' ', opt_text).strip()
        opt_text = re.sub(r'\d+\s+Go on to the next page.*', '', opt_text).strip()
        
        if letter not in options:
            options[letter] = opt_text
    
    return options


def extract_question_text(block_text, qnum):
    """Extract the question stem (text before options)."""
    # Find the first A) - everything before it is the question text
    m = re.search(r'\bA\)\s', block_text)
    if m:
        q_text = block_text[:m.start()].strip()
    else:
        q_text = block_text.strip()
    
    # Remove question number prefix
    q_text = re.sub(r'^\d{1,2}\.\s*', '', q_text)
    
    # Clean up
    q_text = q_text.strip()
    
    return q_text


def build_json_questions(blocks, answer_key, exam_name, year, term):
    """Convert parsed blocks to app JSON format."""
    result = []
    
    for qnum in sorted(blocks.keys()):
        block = blocks[qnum]
        raw = block['raw']
        passage = block.get('passage', '')
        
        options = parse_options_from_block(raw)
        q_text = extract_question_text(raw, qnum)
        correct = answer_key.get(qnum, '')
        
        qid = f"yds-{year}-{term.lower().replace(' ', '').replace('/', '')}-{qnum}"
        
        # Category based on question number
        n = qnum
        if n <= 6:
            category = "Kelime Bilgisi"
        elif n <= 16:
            category = "Dilbilgisi"
        elif n <= 26:
            category = "Cloze Test"
        elif n <= 36:
            category = "Ceviri"
        elif n <= 46:
            category = "Paragraf Tamamlama"
        elif n <= 62:
            category = "Okuma Anlama"
        elif n <= 67:
            category = "Verilen Cumlenin Yeri"
        elif n <= 72:
            category = "Okuma Anlama"
        elif n <= 76:
            category = "Diyalog Tamamlama"
        else:
            category = "Anlam Butunlugunu Bozan Cumle"
        
        obj = {
            "id": qid,
            "exam": exam_name,
            "year": year,
            "term": term,
            "questionNumber": n,
            "category": category,
            "passage": passage,
            "questionText": q_text,
            "options": options,
            "correctAnswer": correct,
            "tags": []
        }
        result.append(obj)
    
    return result


def validate_questions(questions):
    """Validate extracted questions."""
    issues = []
    nums = [q['questionNumber'] for q in questions]
    
    if len(questions) != 80:
        issues.append(f"Expected 80 questions, got {len(questions)}")
    
    missing = [i for i in range(1, 81) if i not in nums]
    if missing:
        issues.append(f"Missing question numbers: {missing}")
    
    for q in questions:
        n = q['questionNumber']
        opts = q['options']
        
        if len(opts) < 5:
            issues.append(f"Q{n}: Only {len(opts)} options: {list(opts.keys())}")
        
        if not q['correctAnswer']:
            issues.append(f"Q{n}: No correct answer")
        elif q['correctAnswer'] not in opts:
            issues.append(f"Q{n}: Answer '{q['correctAnswer']}' not in options {list(opts.keys())}")
        
        if len(q['questionText']) < 10:
            issues.append(f"Q{n}: Text too short: '{q['questionText'][:50]}'")
    
    return issues


if __name__ == "__main__":
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else "pdf_kaynaklar/2018_ilkbahar_ING.pdf"
    exam_name = sys.argv[2] if len(sys.argv) > 2 else "2018 YDS Ilkbahar"
    year = int(sys.argv[3]) if len(sys.argv) > 3 else 2018
    term = sys.argv[4] if len(sys.argv) > 4 else "Ilkbahar"
    
    print(f"Processing: {pdf_path}")
    print(f"Exam: {exam_name} | Year: {year} | Term: {term}")
    print("=" * 60)
    
    text = extract_text_columns(pdf_path)
    print(f"Extracted {len(text)} chars")
    
    answer_key = extract_answer_key(text)
    print(f"Answer key: {len(answer_key)} answers found")
    
    blocks = split_into_question_blocks(text)
    print(f"Question blocks: {len(blocks)}")
    
    json_questions = build_json_questions(blocks, answer_key, exam_name, year, term)
    
    issues = validate_questions(json_questions)
    
    if issues:
        print(f"\n[WARNING] {len(issues)} issues:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("\n[OK] All 80 questions validated!")
    
    out_name = f"parsed_{year}_{term.lower().replace(' ', '_')}.json"
    with open(out_name, 'w', encoding='utf-8') as f:
        json.dump(json_questions, f, ensure_ascii=False, indent=2)
    print(f"\nSaved: {out_name}")
    
    # Show samples
    for q in json_questions[:3]:
        n = q['questionNumber']
        print(f"\n--- Q{n} ---")
        print(f"  Text: {q['questionText'][:120]}")
        print(f"  Opts: {list(q['options'].keys())} = {[v[:30] for v in q['options'].values()]}")
        print(f"  Ans:  {q['correctAnswer']}")
