import json
with open('questions.js', 'r', encoding='utf-8') as f:
    text = f.read()
try:
    q = json.loads(text[text.find('['):text.rfind(']')+1])
except BaseException as e:
    json_str = text[text.find('['):text.find('[')+e.pos]
    q = json.loads(json_str[:json_str.rfind(']')+1])

for year in ['2023', '2024', '2025']:
    texts = [x['questionText'] for x in q if x['questionNumber']==43 and year in x['exam']]
    print(f'{year}:', texts)
