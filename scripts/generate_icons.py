"""Generate PWA icons: light background + dark checklist (3 ticks + bars)."""
from PIL import Image, ImageDraw
import os

BG   = (255, 255, 255, 255)  # white
FG   = (61,  61,  61,  255)  # #3d3d3d dark gray

def draw_checklist(draw, size, pad):
    """Draw 3 checkmarks with horizontal bars, like a task list."""
    inner  = size - 2 * pad
    rows   = 3
    row_h  = inner / rows
    sw     = max(int(size * 0.045), 2)   # stroke width
    bar_sw = max(int(size * 0.055), 2)   # bar height

    # left margin and widths (relative to inner area)
    lx = pad + inner * 0.08   # left edge of tick area
    tick_w = inner * 0.22     # width of tick glyph area
    bar_x  = pad + inner * 0.36  # bar starts here
    bar_w  = inner * 0.54     # bar width

    for i in range(rows):
        cy = pad + row_h * i + row_h * 0.5   # vertical center of row

        # --- checkmark ---
        # three points: left, bottom-center, right-top
        t_left  = (lx,              cy + tick_w * 0.05)
        t_mid   = (lx + tick_w * 0.4, cy + tick_w * 0.45)
        t_right = (lx + tick_w,     cy - tick_w * 0.35)

        draw.line([t_left, t_mid], fill=FG, width=sw)
        draw.line([t_mid, t_right], fill=FG, width=sw)

        # smooth joint
        r = sw // 2
        draw.ellipse([t_mid[0]-r, t_mid[1]-r, t_mid[0]+r, t_mid[1]+r], fill=FG)

        # --- horizontal bar ---
        bar_y = cy - bar_sw // 2
        draw.rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_sw], fill=FG)

def make_icon(size: int, path: str, pad_pct: float = 0.0) -> None:
    img  = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    pad = int(size * pad_pct) + int(size * 0.12)  # inner padding + safe zone
    draw_checklist(draw, size, pad)

    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    img.save(path, "PNG")
    print(f"  {path} ({size}x{size})")

if __name__ == "__main__":
    make_icon(192, "icons/icon-192.png")
    make_icon(512, "icons/icon-512.png", pad_pct=0.10)  # 10% safe zone for maskable
    make_icon(180, "icons/apple-touch-icon.png")
    print("Done.")
