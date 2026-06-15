from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "static" / "images" / "columbia-logo.png"
FAVICON_PNG = ROOT / "static" / "images" / "favicon.png"
FAVICON_ICO = ROOT / "static" / "images" / "favicon.ico"
APPLE_TOUCH = ROOT / "static" / "images" / "apple-touch-icon.png"


def square_icon(size: int, background: tuple[int, int, int, int]) -> Image.Image:
    source = Image.open(SOURCE).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), background)
    padding = max(8, int(size * 0.08))
    source.thumbnail((size - padding * 2, size - padding * 2), Image.Resampling.LANCZOS)
    x = (size - source.width) // 2
    y = (size - source.height) // 2
    canvas.alpha_composite(source, (x, y))
    return canvas


def main() -> None:
    FAVICON_PNG.parent.mkdir(parents=True, exist_ok=True)
    square_icon(512, (255, 255, 255, 0)).save(FAVICON_PNG)
    square_icon(180, (255, 255, 255, 255)).save(APPLE_TOUCH)
    square_icon(256, (255, 255, 255, 0)).save(
        FAVICON_ICO,
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )


if __name__ == "__main__":
    main()
