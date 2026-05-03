"""Generate PWA icons: dark background #0e1116 + blue checkmark #2f6feb."""
from PIL import Image, ImageDraw
import os

BG   = (14, 17, 22, 255)    # #0e1116
TICK = (47, 111, 235, 255)  # #2f6feb

def make_icon(size: int, path: str, pad_pct: float = 0.0) -> None:
    img  = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    pad   = int(size * pad_pct)
    inner = size - 2 * pad
    cx    = size / 2
    cy    = size / 2
    s     = inner * 0.28
    sw    = max(int(size * 0.09), 3)

    p1 = (cx - s * 0.65, cy + s * 0.10)
    p2 = (cx - s * 0.05, cy + s * 0.70)
    p3 = (cx + s * 0.65, cy - s * 0.55)

    draw.line([p1, p2], fill=TICK, width=sw)
    draw.line([p2, p3], fill=TICK, width=sw)

    # Smooth the joint at p2
    r = sw // 2
    draw.ellipse([p2[0]-r, p2[1]-r, p2[0]+r, p2[1]+r], fill=TICK)

    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    img.save(path, "PNG")
    print(f"  {path} ({size}x{size})")

if __name__ == "__main__":
    make_icon(192, "icons/icon-192.png")
    make_icon(512, "icons/icon-512.png", pad_pct=0.10)  # 10% safe zone for maskable
    make_icon(180, "icons/apple-touch-icon.png")
    print("Done.")
