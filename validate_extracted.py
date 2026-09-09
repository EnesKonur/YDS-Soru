import json
import re
import sys

def validate_and_fix(extracted_json, answer_key_json, output_json):
    with open(extracted_json, 'r', encoding='utf-8') as f:
        questions = json.load(f)
        
    with open(answer_key_json, 'r', encoding='utf-8-sig') as f:
        answers = json.load(f)
        
    # Remove duplicates
    unique_questions = {}
    for q in questions:
        if q and 'question_number' in q:
            unique_questions[q['question_number']] = q
            
    final_list = []
    missing = []
    
    for i in range(1, 81):
        if i in unique_questions:
            q = unique_questions[i]
            q['correct_answer'] = answers.get(str(i), "")
            
            # Simple cleanup
            q['question_text'] = q['question_text'].replace('\n', ' ').strip()
            # Normalize spacing
            q['question_text'] = re.sub(r'\s+', ' ', q['question_text'])
            
            for opt in ['A', 'B', 'C', 'D', 'E']:
                if opt in q.get('options', {}):
                    q['options'][opt] = q['options'][opt].replace('\n', ' ').strip()
                    q['options'][opt] = re.sub(r'\s+', ' ', q['options'][opt])
            
            final_list.append(q)
        else:
            missing.append(i)
            
    print(f"Total processed: {len(final_list)} / 80")
    if missing:
        print(f"Missing questions: {missing}")
        
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)
        
    print(f"Saved to {output_json}")

if __name__ == "__main__":
    validate_and_fix(sys.argv[1], sys.argv[2], sys.argv[3])
