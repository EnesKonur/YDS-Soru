import fitz  # PyMuPDF
import os
import re
import json

def process_pdfs(pdf_dir):
    files = [f for f in os.listdir(pdf_dir) if f.lower().endswith('.pdf')]
    results = {}
    
    for f in files:
        filepath = os.path.join(pdf_dir, f)
        try:
            doc = fitz.open(filepath)
        except Exception as e:
            results[f] = {'count': 0, 'error': str(e)}
            continue
            
        full_text = ""
        
        for page in doc:
            rect = page.rect
            width = rect.width
            
            blocks = page.get_text("blocks")
            text_blocks = [b for b in blocks if b[6] == 0]
            
            right_blocks = [b for b in text_blocks if (b[0] + b[2])/2 > width * 0.6]
            is_two_column = len(right_blocks) > 2
            
            if is_two_column:
                left_col = []
                right_col = []
                for b in text_blocks:
                    cx = (b[0] + b[2]) / 2
                    if cx < width * 0.5:
                        left_col.append(b)
                    else:
                        right_col.append(b)
                
                left_col.sort(key=lambda b: b[1])
                right_col.sort(key=lambda b: b[1])
                sorted_blocks = left_col + right_col
            else:
                sorted_blocks = sorted(text_blocks, key=lambda b: b[1])
                
            for b in sorted_blocks:
                text = b[4].strip()
                if text:
                    full_text += text + "\n\n"
                    
        doc.close()
        
        questions = extract_questions(full_text)
        results[f] = {
            'count': len(questions),
            'questions': questions
        }
        
    return results

def extract_questions(text):
    # Match patterns like:
    # 1. 
    # 1- 
    # 1 .
    # Soru 1:
    pattern = r'(?:\n|^)(?:Soru\s+)?(\d{1,2})[\.\-:]\s*([A-ZÇĞİÖŞÜa-zçğıöşü\s\S]+?)(?=(?:\n|^)(?:Soru\s+)?\d{1,2}[\.\-:]\s*|$)'
    matches = re.finditer(pattern, text)
    
    questions = []
    seen = set()
    for match in matches:
        q_num = int(match.group(1))
        q_text = match.group(2).strip()
        
        if 1 <= q_num <= 80 and q_num not in seen:
            questions.append({
                'number': q_num,
                'content': q_text
            })
            seen.add(q_num)
            
    return questions

if __name__ == "__main__":
    pdf_dir = "pdf_kaynaklar"
    if not os.path.exists(pdf_dir):
        print("Directory not found")
        exit()
        
    results = process_pdfs(pdf_dir)
    results_meta = {}
    for f, data in results.items():
        results_meta[f] = data.get('count', 0)
        
    with open("extract_results.json", "w", encoding="utf-8") as f:
        json.dump(results_meta, f, ensure_ascii=False, indent=2)
    print("Done")
