import json
with open('questions.js', 'r', encoding='utf-8') as f:
    text = f.read()
try:
    q = json.loads(text[text.find('['):text.rfind(']')+1])
except BaseException as e:
    json_str = text[text.find('['):text.find('[')+e.pos]
    q = json.loads(json_str[:json_str.rfind(']')+1])

q13 = [x for x in q if x['exam'] == '2018 YDS Sonbahar' and x['questionNumber'] == 13][0]
print("Q13:", q13['category'], q13['subCategory'])

q78 = [x for x in q if x['exam'] == '2018 YDS/3' and x['questionNumber'] == 78][0]
print("Q78:", q78['category'], q78['subCategory'])
