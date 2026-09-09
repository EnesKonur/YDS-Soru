# -*- coding: utf-8 -*-
"""
Deep Audit Script: Finds ALL structural problems in questions.js
1. Paragraph questions (43-62 range) with empty/missing passages
2. Options that are suspiciously long (passage text bleeding in)
3. Questions referencing passages but having no passage field
4. Cloze test questions (16-21 range) with passage bleeding into options
"""
import json
import re

def load_questions(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    json_str = content[start_idx:end_idx+1]
    try:
        return json.loads(json_str), content, start_idx, end_idx
    except json.decoder.JSONDecodeError as e:
        json_str = json_str[:e.pos]
        end_idx2 = json_str.rfind(']')
        json_str = json_str[:end_idx2+1]
        return json.loads(json_str), content, start_idx, start_idx + end_idx2

questions, raw_content, start_idx, end_idx = load_questions('questions.js')

print(f"Total questions loaded: {len(questions)}")
print("=" * 80)

# Group questions by exam
exams = {}
for q in questions:
    exam = q.get('exam', 'Unknown')
    if exam not in exams:
        exams[exam] = []
    exams[exam].append(q)

# Sort each exam's questions by questionNumber
for exam in exams:
    exams[exam].sort(key=lambda q: q.get('questionNumber', 0))

issues = []

for exam_name, exam_qs in sorted(exams.items()):
    print(f"\n{'='*60}")
    print(f"EXAM: {exam_name} ({len(exam_qs)} questions)")
    print(f"{'='*60}")
    
    # Check question number coverage
    q_nums = [q.get('questionNumber', 0) for q in exam_qs]
    expected = set(range(1, 81))
    actual = set(q_nums)
    missing = expected - actual
    extra = actual - expected
    if missing:
        print(f"  [MISSING Q#]: {sorted(missing)}")
        issues.append(f"{exam_name}: Missing question numbers: {sorted(missing)}")
    if extra:
        print(f"  [EXTRA Q#]: {sorted(extra)}")
    
    for q in exam_qs:
        qid = q['id']
        qnum = q.get('questionNumber', 0)
        passage = q.get('passage', '')
        qtext = q.get('questionText', q.get('text', ''))
        options = q.get('options', {})
        correct = q.get('correctAnswer', '')
        
        # 1. Paragraph questions without passages
        is_passage_question = bool(re.search(
            r'(according to|passage|paragraph|parça|infer|implied|main idea|purpose|author)',
            qtext, re.IGNORECASE
        ))
        
        if is_passage_question and (not passage or len(passage.strip()) < 30):
            print(f"  [NO PASSAGE] Q#{qnum} ({qid}): '{qtext[:80]}...'")
            issues.append(f"{exam_name} Q#{qnum}: Passage question has no passage text")
        
        # 2. Options that are too long (> 300 chars is suspicious for most question types)
        for opt_key, opt_val in options.items():
            if isinstance(opt_val, str) and len(opt_val) > 300:
                print(f"  [LONG OPT] Q#{qnum} ({qid}) Opt:{opt_key} len={len(opt_val)}")
                issues.append(f"{exam_name} Q#{qnum} Opt:{opt_key}: Suspiciously long ({len(opt_val)} chars)")
        
        # 3. Missing correct answer
        if not correct:
            print(f"  [NO ANSWER] Q#{qnum} ({qid})")
            issues.append(f"{exam_name} Q#{qnum}: No correct answer specified")
        elif correct not in options:
            print(f"  [BAD ANSWER] Q#{qnum} ({qid}): Answer '{correct}' not in options {list(options.keys())}")
            issues.append(f"{exam_name} Q#{qnum}: Correct answer '{correct}' not found in options")
        
        # 4. Empty question text
        if not qtext or len(qtext.strip()) < 5:
            print(f"  [EMPTY Q] Q#{qnum} ({qid}): Question text is empty or too short")
            issues.append(f"{exam_name} Q#{qnum}: Empty question text")
        
        # 5. Missing options (should have A-E)
        expected_opts = {'A', 'B', 'C', 'D', 'E'}
        actual_opts = set(options.keys())
        missing_opts = expected_opts - actual_opts
        if missing_opts:
            print(f"  [MISSING OPTS] Q#{qnum} ({qid}): Missing options {sorted(missing_opts)}")
            issues.append(f"{exam_name} Q#{qnum}: Missing options {sorted(missing_opts)}")
        
        # 6. Empty options
        for opt_key in options:
            if not options[opt_key] or (isinstance(options[opt_key], str) and len(options[opt_key].strip()) < 1):
                print(f"  [EMPTY OPT] Q#{qnum} ({qid}) Opt:{opt_key}")
                issues.append(f"{exam_name} Q#{qnum} Opt:{opt_key}: Empty option text")

print(f"\n{'='*80}")
print(f"TOTAL ISSUES FOUND: {len(issues)}")
for i, issue in enumerate(issues, 1):
    print(f"  {i}. {issue}")
