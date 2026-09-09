import json
import re

def fix_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
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
        # Update end_idx to match the truncated string for replacement later
        end_idx = start_idx + len(json_str) - 1

    changed = 0
    # Patterns that indicate the start of extraneous reading passage instructions
    patterns = [
        r'\b\d{2}\s*-\s*\d{2}\s*[:.]?\s*(?:Answer|soruları|According)\b',
        r'Go on to the next page',
        r'47-50\s*:',
        r'51-54\s*:',
        r'55-58\s*:',
        r'59-62\s*:',
        r'43-46\s*:'
    ]
    
    combined_pattern = re.compile('(' + '|'.join(patterns) + ')', re.IGNORECASE)

    for q in questions:
        options = q.get('options', {})
        for opt_key, opt_val in options.items():
            if not isinstance(opt_val, str): continue
            
            match = combined_pattern.search(opt_val)
            if match:
                # Truncate at the start of the match
                clean_opt = opt_val[:match.start()].strip()
                # Remove trailing dots/hyphens if they were part of the cutoff
                clean_opt = re.sub(r'[\s.\-]*$', '', clean_opt)
                if not clean_opt.endswith('.'):
                    clean_opt += '.'
                
                print(f"[{filename}] Q:{q['id']} Opt:{opt_key}\n  OLD: {opt_val[:80]}...\n  NEW: {clean_opt[:80]}...\n")
                options[opt_key] = clean_opt
                changed += 1

    if changed > 0:
        new_json_str = json.dumps(questions, ensure_ascii=False, indent=2)
        new_content = content[:start_idx] + new_json_str + content[end_idx+1:]
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {changed} options in {filename}")
    else:
        print(f"No fixes needed in {filename}")

fix_file('questions.js')
fix_file('practice_questions.js')
