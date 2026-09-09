import os
from PIL import Image, ImageDraw, ImageFont

def create_app_icon(output_path, size=512):
    # Create image with RGBA
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded rectangle background with indigo gradient
    r = int(size * 0.22)
    
    # Draw gradient-like background
    for i in range(size):
        ratio = i / size
        # From #4f46e5 (79, 70, 229) to #7c3aed (124, 58, 237)
        cr = int(79 + (124 - 79) * ratio)
        cg = int(70 + (58 - 70) * ratio)
        cb = int(229 + (237 - 229) * ratio)
        draw.line([(0, i), (size, i)], fill=(cr, cg, cb, 255))

    # Mask with rounded rectangle
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=r, fill=255)
    img.putalpha(mask)

    draw = ImageDraw.Draw(img)

    # Draw a stylized book or badge
    cx, cy = size // 2, size // 2

    # Draw book pages (white shapes)
    margin = size * 0.22
    book_w = size * 0.56
    book_h = size * 0.38
    bx = (size - book_w) / 2
    by = size * 0.28

    # Left page
    left_page = [
        (bx, by),
        (cx - 8, by + 12),
        (cx - 8, by + book_h + 12),
        (bx, by + book_h)
    ]
    draw.polygon(left_page, fill=(255, 255, 255, 240))

    # Right page
    right_page = [
        (cx + 8, by + 12),
        (bx + book_w, by),
        (bx + book_w, by + book_h),
        (cx + 8, by + book_h + 12)
    ]
    draw.polygon(right_page, fill=(255, 255, 255, 240))

    # Central spine line
    draw.line([(cx, by + 12), (cx, by + book_h + 12)], fill=(200, 210, 255, 255), width=int(size * 0.015))

    # Bookmark ribbon (gold)
    ribbon = [
        (cx - 10, by + 10),
        (cx + 10, by + 10),
        (cx + 10, by + book_h + 40),
        (cx, by + book_h + 25),
        (cx - 10, by + book_h + 40)
    ]
    draw.polygon(ribbon, fill=(245, 158, 11, 255))

    # "YDS" text badge at the bottom
    # Draw badge background
    badge_w = size * 0.6
    badge_h = size * 0.2
    badge_x = (size - badge_w) / 2
    badge_y = size * 0.72
    draw.rounded_rectangle(
        [(badge_x, badge_y), (badge_x + badge_w, badge_y + badge_h)],
        radius=int(badge_h / 2),
        fill=(255, 255, 255, 255)
    )

    # Draw text if font available, else simple lines/letters
    try:
        font = ImageFont.truetype("arialbd.ttf", int(badge_h * 0.7))
    except Exception:
        font = ImageFont.load_default()

    # Draw "YDS" centered
    bbox = draw.textbbox((0, 0), "YDS", font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = badge_x + (badge_w - tw) / 2
    ty = badge_y + (badge_h - th) / 2 - bbox[1]
    draw.text((tx, ty), "YDS", font=font, fill=(79, 70, 229, 255))

    img.save(output_path, "PNG")
    print(f"Generated icon: {output_path} ({size}x{size})")

if __name__ == "__main__":
    create_app_icon("icon-512.png", 512)
    create_app_icon("icon-192.png", 192)
