import fitz
import sys
import json
from google import genai
from google.genai import types

def extract_answer_key(pdf_path, api_key):
    doc = fitz.open(pdf_path)
    client = genai.Client(api_key=api_key)
    
    # We assume the answer key is on the last page or last two pages
    # Usually it's just the last page
    page = doc[-1]
    pix = page.get_pixmap(dpi=200)
    image_bytes = pix.tobytes("png")
    
    prompt = """
Extract the answer key from this image.
The image contains the correct answers for a Turkish exam (YDS).
Return ONLY a JSON dictionary where the keys are the question numbers (as strings, e.g. "1") and the values are the correct options (e.g. "A", "B", "C", "D", "E").
Do not include any other text or markdown.
"""
    try:
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type='image/png'),
                prompt
            ],
            config=types.GenerateContentConfig(temperature=0.0)
        )
        s = response.text.strip()
        if s.startswith("```json"): s = s[7:]
        if s.startswith("```"): s = s[3:]
        if s.endswith("```"): s = s[:-3]
        print(s.strip())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_answer_key(sys.argv[1], sys.argv[2])
