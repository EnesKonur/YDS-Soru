import json
qs=json.load(open('parsed_2019_yds1.json','r',encoding='utf-8'))
q50=[q for q in qs if q['questionNumber']==50][0]
print('Q50 text:')
print(q50['questionText'][:300])
print('Options:', q50['options'])
print('Answer:', q50['correctAnswer'])
print()
for n in [49,51]:
    q=[x for x in qs if x['questionNumber']==n][0]
    print(f"Q{n}: opts={list(q['options'].keys())} ans={q['correctAnswer']}")
    print(f"  text: {q['questionText'][:80]}")
