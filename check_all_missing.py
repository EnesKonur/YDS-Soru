import json

with open('questions.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('[')
end_idx = content.rfind(']')
json_str = content[start_idx:end_idx+1]
try:
    questions = json.loads(json_str)
except json.decoder.JSONDecodeError as e:
    json_str = json_str[:e.pos]
    end_idx = json_str.rfind(']')
    json_str = json_str[:end_idx+1]
    questions = json.loads(json_str)

missing_groups = {}
for q in questions:
    qnum = q.get('questionNumber')
    if (16 <= qnum <= 26) or (43 <= qnum <= 62):
        passage = q.get('passage', '')
        if not passage or len(passage.strip()) < 30:
            exam = q.get('exam')
            if exam not in missing_groups:
                missing_groups[exam] = set()
            missing_groups[exam].add(qnum)

for exam, qnums in sorted(missing_groups.items()):
    print(f"{exam}: Missing passages for Qs {sorted(list(qnums))}")
