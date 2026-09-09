import os
import json
import fitz
import sys
import time
from google import genai
from google.genai import types

def clean_json_string(s):
    s = s.strip()
    if s.startswith("```json"): s = s[7:]
    if s.startswith("```"): s = s[3:]
    if s.endswith("```"): s = s[:-3]
    return s.strip()

def extract_all(pdf_path, api_key, output_json):
    print(f"Processing all pages of {pdf_path}...")
    client = genai.Client(api_key=api_key)
    doc = fitz.open(pdf_path)
    
    all_questions = []
    
    prompt = """
You are an expert OCR and data extraction system.
Extract all multiple-choice questions from the provided image of a Turkish exam (YDS).
Output the result ONLY as a JSON list of objects.
If there are no questions on the page, return an empty list: []

Each object must follow this exact structure:
{
  "question_number": int,
  "question_text": "string (the main question text, including any context paragraphs or the sentence with blanks.)",
  "options": { "A": "string", "B": "string", "C": "string", "D": "string", "E": "string" },
  "correct_answer": ""
}
"""
    # Start from index 0 to len(doc)
    for i in range(len(doc)):
        try:
            print(f"Extracting page {i+1}/{len(doc)}...")
            page = doc[i]
            pix = page.get_pixmap(dpi=200)
            image_bytes = pix.tobytes("png")
            
            response = client.models.generate_content(
                model='gemini-3.5-flash-lite',
                contents=[types.Part.from_bytes(data=image_bytes, mime_type='image/png'), prompt],
                config=types.GenerateContentConfig(temperature=0.0)
            )
            qs = json.loads(clean_json_string(response.text))
            
            if qs:
                print(f"  Found {len(qs)} questions.")
                all_questions.extend(qs)
            else:
                print(f"  Found 0 questions.")
                
        except Exception as e:
            print(f"Error on page {i+1}: {e}")
            
        # Optional sleep to avoid rapid bursts
        time.sleep(1)
        
    print(f"Total extracted: {len(all_questions)}")
    
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, ensure_ascii=False, indent=2)
    print(f"Saved all to {output_json}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_all.py <pdf> <api_key>")
        sys.exit(1)
    extract_all(sys.argv[1], sys.argv[2], "sorular.json")
