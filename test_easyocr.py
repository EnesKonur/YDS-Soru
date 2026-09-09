import fitz
import easyocr
import numpy as np
import cv2

def main():
    doc = fitz.open("pdf_kaynaklar/2022_YDS1_ingilizce.pdf")
    page = doc[2]  # Usually page 3 has questions
    
    # Get pixmap
    pix = page.get_pixmap(dpi=150)
    
    # Convert to numpy array for cv2
    img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    if pix.n == 4:
        img_np = cv2.cvtColor(img_np, cv2.COLOR_RGBA2RGB)

    
    # Use easyocr
    print("Initializing EasyOCR...")
    reader = easyocr.Reader(['tr', 'en'])
    print("Reading text...")
    result = reader.readtext(img_np, paragraph=False)
    
    print("\n--- EXTRACTED TEXT ---")
    for (bbox, text, prob) in result:
        print(text)

if __name__ == "__main__":
    main()
