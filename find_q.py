import json
with open('questions.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('[')
end_idx = content.rfind(']')
json_str = content[start_idx:end_idx+1]
try:
    questions = json.loads(json_str)
except Exception as e:
    json_str = json_str[:e.pos]
    end_idx = json_str.rfind(']')
    json_str = json_str[:end_idx+1]
    questions = json.loads(json_str)

for q in questions:
    optE = q.get('options', {}).get('E', '')
    if 'Azerbaijan' in optE:
        print(f"Exam: {q['exam']}, ID: {q['id']}")
