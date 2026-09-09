"""Generic post-processing fix for any parsed JSON - fixes Cloze and merged options."""
import json, sys

filename = sys.argv[1] if len(sys.argv) > 1 else "parsed_2018_yds3.json"

with open(filename, 'r', encoding='utf-8') as f:
    qs = json.load(f)

for q in qs:
    n = q['questionNumber']
    
    # Fix Cloze Test questions (17-26)
    if 17 <= n <= 26 and not q['questionText'].strip():
        q['questionText'] = f"({n})---- icin en uygun ifadeyi seciniz."
    
    # Fix merged C/D options
    opts = q['options']
    for letter in ['A','B','C','D']:
        next_letter = chr(ord(letter)+1)
        if next_letter in opts and opts.get(next_letter,'').strip() == '' and ' ' in opts.get(letter,''):
            words = opts[letter].split()
            if len(words) >= 2:
                mid = len(words) // 2
                opts[letter] = ' '.join(words[:mid])
                opts[next_letter] = ' '.join(words[mid:])

# Validate
issues = []
for q in qs:
    n = q['questionNumber']
    opts = q['options']
    ca = q['correctAnswer']
    if ca and ca not in opts: issues.append(f"Q{n}: Answer {ca} not in {list(opts.keys())}")
    if len(opts) < 5: issues.append(f"Q{n}: Only {len(opts)} opts")
    for k, v in opts.items():
        if not v.strip(): issues.append(f"Q{n}: Option {k} empty")
    if len(q['questionText']) < 5: issues.append(f"Q{n}: Text too short")

if issues:
    print(f"Remaining issues: {len(issues)}")
    for i in issues: print(f"  - {i}")
else:
    print(f"[OK] All {len(qs)} questions clean!")

with open(filename, 'w', encoding='utf-8') as f:
    json.dump(qs, f, ensure_ascii=False, indent=2)
print("Saved.")
