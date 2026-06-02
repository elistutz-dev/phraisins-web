"""Generate star-words/og-image.png.

Mirrors the Wizarding Words og-image approach: take the base Phraisins
og-image (raisin + wordmark) and add a themed prop on the right — here, two
crossed lightsabers (one blue, one red) instead of a wand.

Per project convention we use Pillow (not cairo/rsvg) for SVG-ish -> PNG work,
drawing the sabers directly with ImageDraw and a blurred glow layer.
"""
import math
from PIL import Image, ImageDraw, ImageFilter

BASE = "og-image.png"
OUT = "star-words/og-image.png"


def draw_saber(img, hilt_end, tip, blade_rgb):
    hx, hy = hilt_end
    tx, ty = tip
    dx, dy = tx - hx, ty - hy
    length = math.hypot(dx, dy)
    ux, uy = dx / length, dy / length

    hilt_len = 80
    bx, by = hx + ux * hilt_len, hy + uy * hilt_len  # blade base

    # Glow layer
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.line([(bx, by), (tx, ty)], fill=blade_rgb + (180,), width=26)
    glow = glow.filter(ImageFilter.GaussianBlur(11))
    img.alpha_composite(glow)

    d = ImageDraw.Draw(img)
    # Blade outer (saturated colour)
    d.line([(bx, by), (tx, ty)], fill=blade_rgb + (235,), width=12)
    # Blade core (hot white)
    d.line([(bx, by), (tx, ty)], fill=(255, 255, 255, 240), width=5)

    # --- Hilt (metallic grey grip) ---
    # Perpendicular unit vector for drawing bands across the grip.
    px, py = -uy, ux
    d.line([(hx, hy), (bx, by)], fill=(154, 154, 154, 255), width=15)
    # Pommel cap at the very base
    d.line([(hx - ux * 4, hy - uy * 4), (hx + ux * 6, hy + uy * 6)],
           fill=(106, 106, 106, 255), width=19)
    # Dark detail bands along the grip
    for t in (0.30, 0.52, 0.72):
        cx, cy = hx + ux * hilt_len * t, hy + uy * hilt_len * t
        d.line([(cx - px * 8, cy - py * 8), (cx + px * 8, cy + py * 8)],
               fill=(58, 58, 58, 255), width=4)
    # Emitter ring where blade meets hilt
    d.line([(bx - px * 8, by - py * 8), (bx + px * 8, by + py * 8)],
           fill=(212, 212, 212, 255), width=5)


def main():
    img = Image.open(BASE).convert("RGBA")
    # Two crossed sabers in the upper-right, echoing the wand placement.
    draw_saber(img, hilt_end=(792, 384), tip=(1004, 96), blade_rgb=(78, 201, 255))   # blue
    draw_saber(img, hilt_end=(1012, 384), tip=(800, 96), blade_rgb=(255, 80, 80))    # red
    img.save(OUT)
    print("wrote", OUT, img.size)


if __name__ == "__main__":
    main()
