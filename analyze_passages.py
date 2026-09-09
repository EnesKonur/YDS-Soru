# -*- coding: utf-8 -*-
"""
Analyze which exams have passage propagation issues.
For paragraph questions (43-62), check if any question in the group has the passage.
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
        return json.loads(json_str)
    except json.decoder.JSONDecodeError as e:
        json_str = json_str[:e.pos]
        end_idx2 = json_str.rfind(']')
        json_str = json_str[:end_idx2+1]
        return json.loads(json_str)

questions = load_questions('questions.js')

# Group by exam
exams = {}
for q in questions:
    exam = q.get('exam', 'Unknown')
    if exam not in exams:
        exams[exam] = {}
    exams[exam][q.get('questionNumber', 0)] = q

# Standard YDS passage groups
passage_groups = [(43,46), (47,50), (51,54), (55,58), (59,62)]

for exam_name in sorted(exams.keys()):
    exam_qs = exams[exam_name]
    print(f"\n{'='*60}")
    print(f"EXAM: {exam_name}")
    
    for start, end in passage_groups:
        group_qs = [exam_qs.get(n) for n in range(start, end+1) if n in exam_qs]
        if not group_qs:
            continue
        
        # Check which questions have passages
        has_passage = []
        no_passage = []
        for q in group_qs:
            p = q.get('passage', '')
            if p and len(p.strip()) > 30:
                has_passage.append(q['questionNumber'])
            else:
                no_passage.append(q['questionNumber'])
        
        if no_passage and has_passage:
            # Some have passage, some don't - propagation issue
            print(f"  [PARTIAL] Q{start}-{end}: Has passage: {has_passage}, Missing: {no_passage}")
            # Show the passage from the first question that has it
            for q in group_qs:
                p = q.get('passage', '')
                if p and len(p.strip()) > 30:
                    print(f"    -> Source passage (Q{q['questionNumber']}): {p[:80]}...")
                    break
        elif not has_passage and no_passage:
            print(f"  [ALL MISSING] Q{start}-{end}: No passage for any question in group!")
        # If all have passage, it's fine - don't print

    # Also check cloze test groups (16-21)
    cloze_qs = [exam_qs.get(n) for n in range(16, 22) if n in exam_qs]
    if cloze_qs:
        has_passage = []
        no_passage = []
        for q in cloze_qs:
            p = q.get('passage', '')
            if p and len(p.strip()) > 30:
                has_passage.append(q['questionNumber'])
            else:
                no_passage.append(q['questionNumber'])
        if no_passage and has_passage:
            print(f"  [PARTIAL CLOZE] Q16-21: Has: {has_passage}, Missing: {no_passage}")
        elif not has_passage and no_passage:
            print(f"  [ALL MISSING CLOZE] Q16-21: No passage for any question in cloze group!")
