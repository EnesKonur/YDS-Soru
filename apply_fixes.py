import json

fixes = {
    'yds-2021-yds2-16': 'Despite',
    'yds-2021-yds2-21': 'devastated',
    'yds-2021-yds1-16': 'on the basis of',
    'yds-2021-yds1-21': 'to be accepting',
    'yds-2020-yds1-16': 'Unlike',
    'yds-2020-yds1-21': 'threatened',
    'yds-2019-yds3-16': 'For the purpose of',
    'yds-2019-yds3-21': 'with',
    'yds-2018-yds3-16': 'Due to',
    'yds-2018-yds3-21': 'In case',
    'yds-2018-sonbahar-16': 'Instead of',
    'yds-2018-sonbahar-21': 'to have been said',
    'yds-2018-ilkbahar-16': 'in case of',
    'yds-2018-ilkbahar-21': 'over'
}

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
    end_idx = start_idx + len(json_str) - 1

for q in questions:
    if q['id'] in fixes:
        q['options']['E'] = fixes[q['id']]
        print(f"Fixed {q['id']}")

new_json_str = json.dumps(questions, ensure_ascii=False, indent=2)
new_content = content[:start_idx] + new_json_str + content[end_idx+1:]
with open('questions.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('All 14 cloze test bleed-overs fixed.')
