import json
import re

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

for q in questions:
    if q['id'] in ('yds-2020-yds1-42', 'yds-2020-yds1-43'):
        print(f"--- {q['id']} ---")
        print(f"Passage: {repr(q.get('passage', ''))[:100]}")
        print(f"Option E: {repr(q.get('options', {}).get('E', ''))[:100]}")
