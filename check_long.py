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

anomalies = []
for q in questions:
    for opt_key, opt_val in q.get('options', {}).items():
        if isinstance(opt_val, str) and len(opt_val) > 400:
            anomalies.append({
                'id': q['id'],
                'option': opt_key,
                'length': len(opt_val),
                'text': opt_val[:100] + '...'
            })

for a in anomalies:
    print(f"Q-ID: {a['id']} Opt: {a['option']} (Len: {a['length']})")
