import fitz

def parse_columns(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc[2]
    words = page.get_text("words")
    width = page.rect.width
    
    left_words = [w for w in words if w[0] < width * 0.5]
    right_words = [w for w in words if w[0] >= width * 0.5]
    
    left_words.sort(key=lambda w: (w[1]//10, w[0]))
    right_words.sort(key=lambda w: (w[1]//10, w[0]))
    
    def extract_lines(word_list):
        lines = []
        current_line = []
        current_y = None
        for w in word_list:
            y0 = w[1]
            word = w[4]
            if current_y is None:
                current_y = y0
                current_line.append(word)
            elif abs(y0 - current_y) < 5:
                current_line.append(word)
            else:
                lines.append(" ".join(current_line))
                current_y = y0
                current_line = [word]
        if current_line:
            lines.append(" ".join(current_line))
        return lines

    left_lines = extract_lines(left_words)
    right_lines = extract_lines(right_words)
    
    doc.close()
    return left_lines + ["---COLUMN BREAK---"] + right_lines

if __name__ == "__main__":
    lines = parse_columns("pdf_kaynaklar/2023_YDS2_ingilizce.pdf")
    for l in lines[:40]:
        print(l)
