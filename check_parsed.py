import json

with open('parsed_2018_ilkbahar.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)

print("=== Cloze Test Questions (17-26) ===")
for q in qs:
    n = q['questionNumber']
    if 17 <= n <= 26:
        print(f"Q{n}: text='{q['questionText'][:60]}' | passage='{q['passage'][:80]}' | opts={list(q['options'].keys())} correct={q['correctAnswer']}")

print("\n=== ALL Issues ===")
for q in qs:
    n = q['questionNumber']
    opts = q['options']
    ca = q['correctAnswer']
    
    if ca and ca not in opts:
        print(f"Q{n}: ANSWER {ca} not in opts {list(opts.keys())}")
    
    if len(opts) < 5:
        print(f"Q{n}: Only {len(opts)} opts: {list(opts.keys())}")
    
    for k, v in opts.items():
        if not v.strip():
            print(f"Q{n}: Option {k} is EMPTY")
    
    if len(q['questionText']) < 10:
        print(f"Q{n}: Short text: '{q['questionText']}'")

print("\n=== Sample Q1 ===")
q1 = qs[0]
for k, v in q1['options'].items():
    print(f"  {k}) {v}")
