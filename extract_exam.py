import os
import json
import fitz
import sys
import time
import re
from google import genai
from google.genai import types

def clean_json_string(s):
    s = s.strip()
    if s.startswith("```json"): s = s[7:]
    if s.startswith("```"): s = s[3:]
    if s.endswith("```"): s = s[:-3]
    return s.strip()

def get_text_from_response(response):
    if response.text:
        return response.text
    if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'text') and part.text:
                return part.text
    return ""

def extract_page(client, page, page_num):
    pix = page.get_pixmap(dpi=200)
    image_bytes = pix.tobytes("png")
    
    prompt = f"""
You are an expert OCR and data extraction system for Turkish ÖSYM YDS examinations.
Extract all multiple-choice questions from the provided image of page {page_num}.
Output the result ONLY as a JSON list of objects.
If there are genuinely no exam questions on the page (e.g. cover page or blank), return: []

IMPORTANT GUIDANCE:
1. Questions can be vocabulary, grammar, cloze test, sentence completion, translation, reading comprehension, dialogue completion, restatement, or paragraph flow.
2. Even if a question does NOT have an explicit "Soru No:" label (for example dialogue questions with speaker lines, or translation questions), EXTRACT IT!
3. If the question number is missing on the page, infer it accurately from the sequence of surrounding questions or the page number.
4. Keep all text accurate, preserve English and Turkish characters, do not merge or omit words.

Each object must follow this exact structure:
{{
  "question_number": int,
  "question_text": "string (the question prompt, dialogue, or sentence with blanks)",
  "options": {{ "A": "string", "B": "string", "C": "string", "D": "string", "E": "string" }},
  "correct_answer": ""
}}
"""
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model='gemini-3.5-flash-lite',
                contents=[types.Part.from_bytes(data=image_bytes, mime_type='image/png'), prompt],
                config=types.GenerateContentConfig(temperature=0.0)
            )
            text = get_text_from_response(response)
            cleaned = clean_json_string(text)
            if cleaned:
                return json.loads(cleaned)
            return []
        except Exception as e:
            if attempt == 0:
                time.sleep(1.5)
            else:
                print(f"Error on page {page_num}: {e}", flush=True)
                return []
    return []

def main():
    pdf_path = sys.argv[1]
    api_key = sys.argv[2]
    out_file = sys.argv[3] if len(sys.argv) > 3 else "sorular_2022_yds2.json"
    
    client = genai.Client(api_key=api_key)
    doc = fitz.open(pdf_path)
    
    all_questions = []
    seen_q = set()
    if os.path.exists(out_file):
        try:
            with open(out_file, 'r', encoding='utf-8') as f:
                all_questions = json.load(f)
                seen_q = set(q['question_number'] for q in all_questions if 'question_number' in q)
                print(f"Resuming with {len(seen_q)} existing questions from {out_file}", flush=True)
        except Exception:
            pass
    
    # Optional max_page and start_page (1-based)
    max_page = int(sys.argv[4]) if len(sys.argv) > 4 else min(len(doc), 45)
    start_page = int(sys.argv[5]) if len(sys.argv) > 5 else 1
    print(f"Starting extraction for {pdf_path} (pages {start_page} to {max_page})...", flush=True)
    
    for i in range(start_page - 1, max_page):
        p_num = i + 1
        qs = extract_page(client, doc[i], p_num)
        new_qs = 0
        for q in qs:
            q_num = q.get('question_number')
            if q_num and q_num not in seen_q:
                seen_q.add(q_num)
                all_questions.append(q)
                new_qs += 1
        print(f"Page {p_num}/{max_page}: Extracted {new_qs} questions (Total unique: {len(seen_q)})", flush=True)
        
        # Save progress
        with open(out_file, 'w', encoding='utf-8') as f:
            json.dump(all_questions, f, ensure_ascii=False, indent=2)
            
        time.sleep(0.5)

    print(f"\nExtraction completed! Total unique questions: {len(seen_q)}", flush=True)

if __name__ == "__main__":
    main()
