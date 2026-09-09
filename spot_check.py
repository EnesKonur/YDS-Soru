"""Spot-check: verify a handful of questions against known answers."""
import json

with open('parsed_2018_ilkbahar.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

# Check specific questions for content accuracy
checks = [
    (1, "C", "implications"),  # Q1 answer is C
    (2, "C", "detection"),     # Q2 answer is C
    (3, "B", "excessive"),     # Q3 answer is B  
    (6, "E", "come up with"),  # Q6 answer is E
    (7, "C", None),            # Q7 answer is C (grammar)
    (14, "D", "although"),     # Q14 answer is D
    (17, "E", None),           # Q17 answer is E (cloze)
    (37, "B", None),           # Q37 answer is B (translation)
    (80, "B", None),           # Q80 answer is B
]

print("=== Spot Check: 2018 YDS Ilkbahar ===")
all_ok = True
for qnum, expected_ans, expected_opt_text in checks:
    q = [x for x in qs if x['questionNumber'] == qnum][0]
    ans_ok = q['correctAnswer'] == expected_ans
    
    if expected_opt_text:
        opt_text = q['options'].get(expected_ans, '')
        text_ok = expected_opt_text.lower() in opt_text.lower()
    else:
        text_ok = True
    
    status = "[OK]" if (ans_ok and text_ok) else "[FAIL]"
    if status == "[FAIL]":
        all_ok = False
    
    print(f"  {status} Q{qnum}: answer={q['correctAnswer']} (expected {expected_ans})", end="")
    if expected_opt_text:
        opt_val = q['options'].get(expected_ans, 'N/A')
        print(f" | opt text='{opt_val}' (expected '{expected_opt_text}')", end="")
    print()

print()
if all_ok:
    print("[OK] All spot checks passed!")
else:
    print("[FAIL] Some checks failed!")

# Print summary stats
print(f"\nTotal questions: {len(qs)}")
cats = {}
for q in qs:
    c = q['category']
    cats[c] = cats.get(c, 0) + 1
print("Categories:")
for c, n in sorted(cats.items(), key=lambda x: x[1], reverse=True):
    print(f"  {c}: {n}")
