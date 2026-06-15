from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static" / "images" / "social_preview.png"
WIDTH = 1200
HEIGHT = 630


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/Avenir Next.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size, index=2 if bold else 0)
        except OSError:
            continue
    return ImageFont.load_default()


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def blend(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(lerp(a, b, t) for a, b in zip(c1, c2))


def draw_gradient_background(draw: ImageDraw.ImageDraw) -> None:
    left = (251, 251, 248)
    right = (232, 247, 244)
    for x in range(WIDTH):
        color = blend(left, right, x / WIDTH)
        draw.line([(x, 0), (x, HEIGHT)], fill=color)
    draw.ellipse((-130, -150, 460, 360), fill=(254, 235, 188))
    draw.ellipse((650, -120, 1360, 650), fill=(207, 236, 231))


def lorenz_step(state: tuple[float, float, float], dt: float) -> tuple[float, float, float]:
    sigma = 10.0
    rho = 28.0
    beta = 8.0 / 3.0

    def f(s: tuple[float, float, float]) -> tuple[float, float, float]:
        x, y, z = s
        return sigma * (y - x), x * (rho - z) - y, x * y - beta * z

    def add(s: tuple[float, float, float], k: tuple[float, float, float], scale: float) -> tuple[float, float, float]:
        return s[0] + k[0] * scale, s[1] + k[1] * scale, s[2] + k[2] * scale

    k1 = f(state)
    k2 = f(add(state, k1, dt * 0.5))
    k3 = f(add(state, k2, dt * 0.5))
    k4 = f(add(state, k3, dt))
    return (
        state[0] + (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
        state[1] + (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
        state[2] + (dt / 6) * (k1[2] + 2 * k2[2] + 2 * k3[2] + k4[2]),
    )


def project(point: tuple[float, float, float], box: tuple[int, int, int, int]) -> tuple[float, float]:
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    x, y, z = point
    px = (x - y) * 0.74
    py = (x + y) * 0.2 - z * 0.62
    scale = min(width, height) / 58
    return left + width * 0.5 + px * scale, top + height * 0.66 + py * scale


def wrap_pixels(draw: ImageDraw.ImageDraw, text: str, text_font: ImageFont.ImageFont, max_width: int) -> list[str]:
    lines: list[str] = []
    current: list[str] = []
    for word in text.split():
        candidate = " ".join([*current, word])
        bbox = draw.textbbox((0, 0), candidate, font=text_font)
        if bbox[2] - bbox[0] <= max_width or not current:
            current.append(word)
        else:
            lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def draw_lorenz(image: Image.Image, draw: ImageDraw.ImageDraw) -> None:
    panel = (730, 62, 1138, 565)
    panel_width = panel[2] - panel[0]
    panel_height = panel[3] - panel[1]
    panel_image = Image.new("RGBA", (panel_width, panel_height), (17, 17, 19, 255))
    panel_draw = ImageDraw.Draw(panel_image)

    for offset in range(-500, 900, 38):
        panel_draw.line([(offset, panel_height), (offset + 340, 0)], fill=(28, 39, 39), width=1)
    for y in range(35, panel_height, 38):
        panel_draw.line([(0, y), (panel_width, y + 34)], fill=(28, 39, 39), width=1)

    points: list[tuple[float, float, float]] = []
    state = (-8.5, -7.5, 27.0)
    for i in range(5400):
        state = lorenz_step(state, 0.006)
        if i > 420 and i % 2 == 0:
            points.append(state)

    projected = [project(point, (0, 0, panel_width, panel_height)) for point in points]
    for a, b in zip(projected, projected[1:]):
        panel_draw.line([a, b], fill=(65, 78, 76), width=1)

    tail = projected[-1350:]
    for idx, (a, b) in enumerate(zip(tail, tail[1:])):
        t = idx / max(1, len(tail) - 1)
        color = blend((15, 118, 110), (245, 158, 11), t)
        panel_draw.line([a, b], fill=color, width=2 + int(t * 2))

    head = tail[-1]
    for radius, alpha_color in [(28, (225, 29, 72)), (16, (245, 158, 11)), (6, (255, 247, 214))]:
        panel_draw.ellipse(
            (head[0] - radius, head[1] - radius, head[0] + radius, head[1] + radius),
            fill=alpha_color,
        )

    panel_draw.text((28, panel_height - 58), "Lorenz latent dynamics", fill=(246, 244, 237), font=font(27, bold=True))
    panel_draw.arc((panel_width - 90, 26, panel_width - 34, 82), start=20, end=340, fill=(245, 158, 11), width=4)
    panel_draw.pieslice((panel_width - 51, 28, panel_width - 27, 52), start=0, end=360, fill=(225, 29, 72))

    mask = Image.new("L", (panel_width, panel_height), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, panel_width, panel_height), radius=24, fill=255)
    image.paste(panel_image, panel[:2], mask)
    draw.rounded_rectangle(panel, radius=24, outline=(40, 64, 59), width=2)


def draw_text(draw: ImageDraw.ImageDraw) -> None:
    draw.rounded_rectangle((64, 60, 270, 106), radius=23, fill=(15, 118, 110))
    draw.text((86, 70), "ProbNum 2026", fill=(255, 255, 255), font=font(25, bold=True))

    draw.text((64, 138), "CASSM", fill=(24, 24, 27), font=font(88, bold=True))

    title = "Computation-Aware Kalman Filtering with Model Selection for Neural Dynamics"
    y = 242
    title_font = font(40, bold=True)
    for line in wrap_pixels(draw, title, title_font, 620):
        draw.text((64, y), line, fill=(24, 24, 27), font=title_font)
        y += 46

    draw.text((64, y + 16), "JR Huml / Jonathan Wenger / John P. Cunningham", fill=(65, 65, 70), font=font(23, bold=True))
    draw.text((64, y + 56), "arXiv:2606.01468  |  github.com/jonathanhuml/cassm", fill=(15, 118, 110), font=font(23, bold=True))


def main() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), (251, 251, 248))
    draw = ImageDraw.Draw(image)
    draw_gradient_background(draw)
    draw_text(draw)
    draw_lorenz(image, draw)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUT)


if __name__ == "__main__":
    main()
