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
    # Remove markdown code blocks if present
    s = s.strip()
    if s.startswith("```json"):
        s = s[7:]
    if s.startswith("```"):
        s = s[3:]
    if s.endswith("```"):
        s = s[:-3]
    return s.strip()

def extract_page_with_gemini(pdf_path, page_num, api_key):
    print(f"Extracting page {page_num+1}...")
    
    # Initialize client
    client = genai.Client(api_key=api_key)
    
    # Get image of the page
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    
    # We want a high quality image so the model can read small text
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
  "question_text": "string (the main question text, including any context paragraphs or the sentence with blanks. If it's a cloze test (e.g. 17-21) where the question is just a number in a passage, set question_text to the sentence or passage where the blank is, or inject '___ için en uygun ifadeyi seçiniz.')",
  "options": {
    "A": "string",
    "B": "string",
    "C": "string",
    "D": "string",
    "E": "string"
  },
  "correct_answer": ""
}

Pay EXTREME attention to accuracy:
1. Do not join words that should be separate, and do not separate words that should be joined.
2. Maintain the exact wording of the original text.
3. For options containing slashes (e.g., "was / were"), make sure to include the slash correctly.
4. Ignore headers like "2022 NİSAN YDS" or page numbers.
5. If an option is spread across multiple lines in the image, join it into a single string.
"""
    
    try:
        response = client.models.generate_content(
            model='gemini-3.5-flash-lite',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type='image/png'),
                prompt
            ],
            config=types.GenerateContentConfig(
                temperature=0.0
            )
        )
        
        json_text = clean_json_string(response.text)
        return json.loads(json_text)
    except Exception as e:
        print(f"Error on page {page_num+1}: {e}")
        return None

def process_pdf(pdf_path, api_key):
    doc = fitz.open(pdf_path)
    all_questions = []
    
    # Process from page 2 onwards (usually page 1 is title)
    for i in range(1, len(doc)):
        questions = extract_page_with_gemini(pdf_path, i, api_key)
        if questions:
            print(f"  Found {len(questions)} questions on page {i+1}.")
            all_questions.extend(questions)
        else:
            print(f"  Found 0 questions on page {i+1}.")
            
        # Optional: save progress incrementally
        with open("temp_extracted.json", "w", encoding="utf-8") as f:
            json.dump(all_questions, f, ensure_ascii=False, indent=2)
            
        # Avoid rate limits
        time.sleep(2)
        
    return all_questions

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_with_gemini.py <path_to_pdf> <api_key>")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    api_key = sys.argv[2]
    
    print(f"Processing {pdf_path}...")
    questions = process_pdf(pdf_path, api_key)
    print(f"\nTotal questions extracted: {len(questions)}")
    
    out_file = "extracted_" + os.path.basename(pdf_path).replace(".pdf", ".json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"Saved to {out_file}")
