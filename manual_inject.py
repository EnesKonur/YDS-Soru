# -*- coding: utf-8 -*-
import json
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

passage_2023_yds2 = """There is currently no single test that can be given to diagnose Attention Deficit Hyperactivity Disorder (ADHD). Since some biological and psychological disorders can appear similar to ADHD, these should be taken into consideration and ruled out before a diagnosis of ADHD is made. A comprehensive evaluation is necessary to establish a diagnosis of ADHD. This includes information and observations from parents, teachers, school psychologists, and pediatricians. Parents see their children at home and in small social groups. Classroom teachers can be of assistance since they see how well children perform school work and how children interact with their peers. School psychologists can make behavioural observations in multiple settings and interview the child. Pediatricians provide needed medical information. Completion of behavioural checklists is also part of a comprehensive evaluation. The checklists rate the seriousness of ADHD symptoms and are completed by primary caregivers such as parents or guardians and classroom teachers. Items on the checklist include behaviours such as having no sense of fair play, temper outbursts, unpredictable behaviour, and excessive demands for attention. In addition to this information, a thorough evaluation is needed of the child's current level of academic, social, and emotional functioning. Careful consideration and review of all the information gathered is needed before the evaluation is complete."""

passage_2025_yds1 = """Hundreds of papyrus scrolls from Herculaneum, damaged by the eruption of Mount Vesuvius in 79 CE, constitute the only intact Greco-Roman library known to survive from antiquity. Researchers are using advanced imaging technologies and machine learning to reveal writings that have remained undetectable for thousands of years. Previous attempts to unroll the scrolls were destructive. Today, non-invasive methods that involve high-energy X-ray micro-computed tomography (micro-CT) can produce high-resolution, digital images of the internal structures of the scrolls without further damaging them. Identifying the location of ink on the scrolls, which would reveal the written text, is challenging because both the papyrus and the ink are carbon-based: there is little visible contrast between the two, making the text seem invisible. However, machine learning may be able to discern what is challenging for the human eye. Researchers point the artificial intelligence (AI) to areas of known ink coverage to study those areas. Then, AI applies what it learns to new areas where no contrast can be detected by the human eye to reveal writing not seen for thousands of years. The study resulted in 2,000 characters of previously unread text — a passage probably by Philodemus. What is most striking for papyrologists, though, is the speed at which the AI is now finding identifiable letters. Going from three letters to columns of text, which took AI a month, usually takes papyrologists 20 years of intense study."""

def load_questions():
    with open('questions.js', 'r', encoding='utf-8') as f:
        content = f.read()
    start_idx = content.find('[')
    end_idx = content.rfind(']')
    json_str = content[start_idx:end_idx+1]
    try:
        questions = json.loads(json_str)
    except json.decoder.JSONDecodeError as e:
        json_str = json_str[:e.pos]
        end_idx2 = json_str.rfind(']')
        json_str = json_str[:end_idx2+1]
        questions = json.loads(json_str)
        end_idx = start_idx + end_idx2
    return questions, content, start_idx, end_idx

questions, raw_content, start_idx, end_idx = load_questions()

fixed = 0
for q in questions:
    if q.get('exam') == '2023 YDS/2' and 43 <= q.get('questionNumber') <= 46:
        q['passage'] = passage_2023_yds2
        fixed += 1
    if q.get('exam') == '2025 YDS/1' and 47 <= q.get('questionNumber') <= 50:
        q['passage'] = passage_2025_yds1
        fixed += 1

new_json_str = json.dumps(questions, ensure_ascii=False, indent=2)
new_content = raw_content[:start_idx] + new_json_str + raw_content[end_idx+1:]
with open('questions.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print(f"Manually injected {fixed} passages.")
