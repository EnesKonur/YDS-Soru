import json
import re

with open('questions.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('[')
end_idx = content.rfind(']')

# In case there are multiple arrays, we might need to be careful, but window.questionRepo is usually the last big one.
json_str = content[start_idx:end_idx+1]
try:
    questions = json.loads(json_str)
except json.decoder.JSONDecodeError as e:
    print(f'JSON Error: {e}')
    # Try to clean up
    json_str = json_str[:e.pos]
    end_idx = json_str.rfind(']')
    json_str = json_str[:end_idx+1]
    questions = json.loads(json_str)

anomalies = []
for q in questions:
    for opt_key, opt_val in q.get('options', {}).items():
        if len(opt_val) > 400:
            anomalies.append({
                'id': q['id'],
                'exam': q.get('exam', ''),
                'year': q.get('year', ''),
                'option': opt_key,
                'length': len(opt_val),
                'text': opt_val[:100].replace('\n', ' ') + '...'
            })
        elif re.search(r'\d{2}\s*-\s*\d{2}', opt_val):
            anomalies.append({
                'id': q['id'],
                'exam': q.get('exam', ''),
                'year': q.get('year', ''),
                'option': opt_key,
                'length': len(opt_val),
                'text': opt_val[:100].replace('\n', ' ') + '...'
            })

print(f'Found {len(anomalies)} anomalies in options.')
for a in anomalies:
    print(f"[{a['exam']}] Q-ID: {a['id']} Opt: {a['option']} (Len: {a['length']}) - {a['text']}")
