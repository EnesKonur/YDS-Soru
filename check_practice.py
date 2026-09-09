import json
with open('practice_questions.js', 'r', encoding='utf-8') as f:
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
    for opt_key, opt_val in q.get('options', {}).items():
        if isinstance(opt_val, str) and len(opt_val) > 200:
            if '-16' in q['id'] or '-21' in q['id']:
                print(f"PRACTICE Q: {q['id']} Opt: {opt_key}")
