import json
import re

def inject_to_db(json_file, exam_name):
    with open(json_file, 'r', encoding='utf-8') as f:
        new_questions = json.load(f)
        
    js_path = 'questions.js'
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # We will format the new questions as a string and insert them into INITIAL_YDS_QUESTIONS array
    # Format of a question:
    # {
    #     id: 721,
    #     exam: "2022 YDS/1 (Nisan)",
    #     year: 2022,
    #     type: "Original",
    #     text: "question_text",
    #     options: ["A", "B", "C", "D", "E"],
    #     correctAnswer: 0 // (0-4)
    # }
    
    # Let's find the current max ID to assign new IDs
    id_matches = re.findall(r'id:\s*(\d+)', content)
    next_id = max([int(i) for i in id_matches]) + 1 if id_matches else 1
    
    js_objects = []
    
    option_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4}
    
    # Extract year from exam name if possible
    year_match = re.search(r'(20\d\d)', exam_name)
    exam_year = int(year_match.group(1)) if year_match else 2022

    for q in new_questions:
        ans_idx = option_map.get(q['correct_answer'], 0)
        options_list = [
            q['options'].get('A', ''),
            q['options'].get('B', ''),
            q['options'].get('C', ''),
            q['options'].get('D', ''),
            q['options'].get('E', '')
        ]
        
        # Escape quotes
        text_escaped = q['question_text'].replace('"', '\\"').replace('\n', ' ')
        opts_escaped = [opt.replace('"', '\\"').replace('\n', ' ') for opt in options_list]
        
        opts_str = ", ".join([f'"{opt}"' for opt in opts_escaped])
        
        obj_str = f"""    {{
        id: {next_id},
        exam: "{exam_name}",
        year: {exam_year},
        type: "Original",
        text: "{text_escaped}",
        options: [{opts_str}],
        correctAnswer: {ans_idx}
    }}"""
        js_objects.append(obj_str)
        next_id += 1
        
    insertion_string = ",\n".join(js_objects)
    
    # We find the end of INITIAL_YDS_QUESTIONS array.
    start_idx = content.find('const INITIAL_YDS_QUESTIONS = [')
    end_idx = content.find('];', start_idx)
    
    # if it doesn't end with a comma, add one
    array_content = content[start_idx:end_idx].rstrip()
    if not array_content.endswith(','):
        insertion_string = ",\n" + insertion_string
    else:
        insertion_string = "\n" + insertion_string
        
    new_content = content[:end_idx] + insertion_string + "\n" + content[end_idx:]
    
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Injected {len(new_questions)} questions into {js_path} as {exam_name}")

if __name__ == "__main__":
    import sys
    json_f = sys.argv[1] if len(sys.argv) > 1 else "validated_2022_YDS1_ingilizce.json"
    exam_n = sys.argv[2] if len(sys.argv) > 2 else "2022 YDS/1 (Nisan)"
    inject_to_db(json_f, exam_n)
