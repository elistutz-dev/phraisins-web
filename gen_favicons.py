"""Regenerate raisin favicon PNGs from the SVG paths using Pillow.

Parses the M/c/z commands from favicon.svg-style path data, renders the body
fill, wrinkle strokes, soft highlight and stem at 4x supersample, then
downsamples with LANCZOS. The base body fill is lightened to match the two
raisins at the top of the site.
"""
import re
from PIL import Image, ImageDraw, ImageFilter

VB_W, VB_H = 52, 48

BODY = "M26 8c-6-1-12 2-16 8-3 5-4 11-2 16 2 6 7 10 14 11 3 0 6 0 9-2 5-3 9-8 10-14 1-5-1-10-4-14-3-3-7-5-11-5z"

# (path, stroke_hex, width, opacity)
WRINKLES = [
    ("M14 16c3 4 5 8 4 13", "#381855", 1.4, 0.70),
    ("M19 12c1 6-1 13-2 18", "#381855", 1.2, 0.60),
    ("M26 10c0 7-2 14-4 20", "#381855", 1.3, 0.65),
    ("M32 13c-1 5-3 10-5 15", "#381855", 1.1, 0.55),
    ("M36 18c-2 4-3 9-4 12", "#381855", 1.0, 0.50),
    ("M12 22c6-2 14-1 22 1", "#381855", 0.9, 0.40),
    ("M14 30c5-1 11-2 18 0", "#381855", 0.8, 0.35),
    ("M20 13c2 5 1 11-1 17", "#703ca0", 0.8, 0.50),
]
STEMS = [
    ("M26 8c0-3 1-5 3-7", "#6b8a3a", 2.0, 1.0),
    ("M27 4c2-1 4-1 5 0", "#6b8a3a", 1.2, 0.60),
]

BODY_FILL = "#6a3a98"   # lightened from #542a78 to match top-of-site raisins
HIGHLIGHT = (128, 80, 184)  # #8050b8


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def cubic(p0, p1, p2, p3, n=24):
    pts = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def parse_path(d):
    """Return list of (x, y) points. Supports M, c (relative cubic, chained), z."""
    tokens = re.findall(r"[MmCcZz]|-?\d*\.?\d+", d)
    pts = []
    cur = (0.0, 0.0)
    i = 0
    cmd = None
    while i < len(tokens):
        t = tokens[i]
        if t in "MmCcZz":
            cmd = t
            i += 1
            if cmd in "Zz":
                continue
        if cmd in "Mm":
            x, y = float(tokens[i]), float(tokens[i + 1])
            i += 2
            cur = (cur[0] + x, cur[1] + y) if cmd == "m" else (x, y)
            pts.append(cur)
            cmd = "l" if cmd == "m" else "L"  # subsequent pairs are lineto
        elif cmd in "Cc":
            c1 = (float(tokens[i]), float(tokens[i + 1]))
            c2 = (float(tokens[i + 2]), float(tokens[i + 3]))
            end = (float(tokens[i + 4]), float(tokens[i + 5]))
            i += 6
            if cmd == "c":
                c1 = (cur[0] + c1[0], cur[1] + c1[1])
                c2 = (cur[0] + c2[0], cur[1] + c2[1])
                end = (cur[0] + end[0], cur[1] + end[1])
            pts.extend(cubic(cur, c1, c2, end))
            cur = end
        else:  # L/l fallthrough
            x, y = float(tokens[i]), float(tokens[i + 1])
            i += 2
            cur = (cur[0] + x, cur[1] + y) if cmd == "l" else (x, y)
            pts.append(cur)
    return pts


def render(size, bg=None):
    SS = 8 if size <= 32 else 4
    W = H = size * SS
    sx = W / VB_W
    sy = H / VB_H
    # center the 52x48 viewBox into the square keeping aspect
    s = min(sx, sy)
    ox = (W - VB_W * s) / 2
    oy = (H - VB_H * s) / 2

    def T(p):
        return (ox + p[0] * s, oy + p[1] * s)

    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    body_pts = [T(p) for p in parse_path(BODY)]
    draw.polygon(body_pts, fill=hex_rgb(BODY_FILL) + (255,))

    # soft radial highlight (matches the rg1/rg2 gradient on the site raisins)
    hl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    cx, cy = T((0.30 * VB_W + 4, 0.30 * VB_H + 2))
    r = 0.42 * VB_W * s
    steps = 40
    for k in range(steps, 0, -1):
        a = int(90 * (k / steps) ** 2 * (1 - k / steps + 0.25))
        rr = r * k / steps
        hd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=HIGHLIGHT + (max(a, 0),))
    hl = hl.filter(ImageFilter.GaussianBlur(r * 0.18))
    # clip highlight to body
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(body_pts, fill=255)
    img.paste(Image.alpha_composite(img, hl), (0, 0), mask)

    def stroke(paths):
        for d, hexc, w, op in paths:
            line = parse_path(d)
            col = hex_rgb(hexc) + (int(255 * op),)
            wpx = max(int(round(w * s)), 1)
            seg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(seg).line([T(p) for p in line], fill=col, width=wpx, joint="curve")
            img.alpha_composite(seg)

    stroke(WRINKLES)
    stroke(STEMS)

    out = img.resize((size, size), Image.LANCZOS)
    if bg is not None:
        base = Image.new("RGBA", (size, size), bg)
        base.alpha_composite(out)
        out = base
    return out


render(16).save("favicon-16x16.png")
render(32).save("favicon-32x32.png")
render(180, bg=(17, 11, 26, 255)).save("apple-touch-icon.png")
print("done")
