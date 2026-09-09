import sys
import json
import fitz
import os
from google import genai
from google.genai import types

def clean_json_string(s):
    s = s.strip()
    if s.startswith("```json"): s = s[7:]
    if s.startswith("```"): s = s[3:]
    if s.endswith("```"): s = s[:-3]
    return s.strip()

def extract_page_with_gemini(pdf_path, page_num, api_key):
    client = genai.Client(api_key=api_key)
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    pix = page.get_pixmap(dpi=200)
    image_bytes = pix.tobytes("png")
    
    prompt = """
Extract all multiple-choice questions from the provided image of a Turkish exam (YDS).
Output the result ONLY as a JSON list of objects.
Each object must follow this exact structure:
{
  "question_number": int,
  "question_text": "string (the main question text, including any context paragraphs or the sentence with blanks.)",
  "options": { "A": "string", "B": "string", "C": "string", "D": "string", "E": "string" },
  "correct_answer": ""
}
"""
    response = client.models.generate_content(
        model='gemini-3.5-flash-lite',
        contents=[types.Part.from_bytes(data=image_bytes, mime_type='image/png'), prompt],
        config=types.GenerateContentConfig(temperature=0.0)
    )
    return json.loads(clean_json_string(response.text))

if __name__ == "__main__":
    pdf = sys.argv[1]
    api_key = sys.argv[2]
    
    missing_pages = [2, 23, 24, 25] # 1,2,3 are on page 2. 43 is probably on page 24 (since 42 is 23, 44 is 25).
    
    extracted = []
    if os.path.exists("extracted_2022_YDS1_ingilizce.json"):
        with open("extracted_2022_YDS1_ingilizce.json", "r", encoding="utf-8") as f:
            extracted = json.load(f)
            
    existing = {q.get('question_number') for q in extracted if q}
    
    for p in missing_pages:
        try:
            print(f"Extracting page {p}...")
            qs = extract_page_with_gemini(pdf, p-1, api_key)
            for q in qs:
                if q.get('question_number') not in existing:
                    extracted.append(q)
                    existing.add(q.get('question_number'))
        except Exception as e:
            print(f"Error on page {p}: {e}")
            
    with open("extracted_2022_YDS1_ingilizce.json", "w", encoding="utf-8") as f:
        json.dump(extracted, f, ensure_ascii=False, indent=2)
