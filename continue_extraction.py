import os
import json
import base64
import fitz
import sys
from google import genai
from google.genai import types
import time
import re

def clean_json_string(s):
    s = s.strip()
    if s.startswith("```json"): s = s[7:]
    if s.startswith("```"): s = s[3:]
    if s.endswith("```"): s = s[:-3]
    return s.strip()

def extract_page_with_gemini(pdf_path, page_num, api_key):
    print(f"Extracting page {page_num+1}...")
    client = genai.Client(api_key=api_key)
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    pix = page.get_pixmap(dpi=200)
    image_bytes = pix.tobytes("png")
    
    prompt = """
You are an expert OCR and data extraction system.
Extract all multiple-choice questions from the provided image of a Turkish exam (YDS).
Output the result ONLY as a JSON list of objects. Do not include any other text.
If there are no questions on the page, return an empty list: []

Each object must follow this exact structure:
{
  "question_number": int,
  "question_text": "string (the main question text, including any context paragraphs or the sentence with blanks.)",
  "options": {
    "A": "string",
    "B": "string",
    "C": "string",
    "D": "string",
    "E": "string"
  },
  "correct_answer": ""
}
"""
    try:
        response = client.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=[types.Part.from_bytes(data=image_bytes, mime_type='image/png'), prompt],
            config=types.GenerateContentConfig(temperature=0.0)
        )
        json_text = clean_json_string(response.text)
        return json.loads(json_text)
    except Exception as e:
        print(f"Error on page {page_num+1}: {e}")
        return None

def process_pdf(pdf_path, api_key):
    doc = fitz.open(pdf_path)
    
    # Load existing to know what we have
    if os.path.exists("extracted_2022_YDS1_ingilizce.json"):
        with open("extracted_2022_YDS1_ingilizce.json", "r", encoding="utf-8") as f:
            all_questions = json.load(f)
    else:
        all_questions = []
        
    existing_q_nums = {q.get('question_number') for q in all_questions if q}
    
    # Let's just scan all pages, but if we already have the questions that are likely on this page, we skip.
    # Usually page N has questions around N*2. We can just run from page 20 to the end.
    for i in range(20, len(doc)):
        questions = extract_page_with_gemini(pdf_path, i, api_key)
        if questions:
            print(f"  Found {len(questions)} questions on page {i+1}.")
            # Append if not exists
            for q in questions:
                if q.get('question_number') not in existing_q_nums:
                    all_questions.append(q)
                    existing_q_nums.add(q.get('question_number'))
        else:
            print(f"  Found 0 questions on page {i+1}.")
            
        with open("extracted_2022_YDS1_ingilizce.json", "w", encoding="utf-8") as f:
            json.dump(all_questions, f, ensure_ascii=False, indent=2)
            
        time.sleep(2)
        
    return all_questions

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    api_key = sys.argv[2]
    process_pdf(pdf_path, api_key)
