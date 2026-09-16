# -*- coding: utf-8 -*-
"""图片读取与拼接"""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Missing dependency: Pillow. Run: pip install Pillow")
    raise

from config import GROUP, IMG_EXTS, QUALITY, TARGET_H, TARGET_W
from face_detect import detect_face_center


def _natural_key(p: Path):
    """按文件名末尾数字排序（兼容 "... 0.jpg" 这种命名）"""
    stem = p.stem
    digits = ""
    for ch in reversed(stem):
        if ch.isdigit():
            digits = ch + digits
        else:
            break
    return (int(digits) if digits else 0, stem)


def list_images(folder: Path):
    """按文件名自然顺序返回图片列表"""
    files = [f for f in folder.iterdir()
             if f.is_file() and f.suffix.lower() in IMG_EXTS]
    return sorted(files, key=_natural_key)


def _clamp(v, lo, hi):
    return max(lo, min(v, hi))


def merge_group(img_paths, out_path: Path):
    """把三张图按"包含头部"的位置垂直三等分拼接成 900x1600"""
    strip_h = TARGET_H // GROUP  # 533
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), (0, 0, 0))
    y = 0
    for i, p in enumerate(img_paths):
        with Image.open(p) as im:
            im = im.convert("RGB")
            sw, sh = im.size
            # 最后一条吸收余数，保证最终高度 = TARGET_H
            th = strip_h if i < GROUP - 1 else TARGET_H - strip_h * (GROUP - 1)
            # 计算裁剪框宽高：保持与目标条同比例
            scale = max(TARGET_W / sw, th / sh)
            cw = max(1, int(TARGET_W / scale))
            ch = max(1, int(th / scale))

            face_center = detect_face_center(p)
            cx, cy = face_center
            # 让脸所在位置大致落在条的 1/3 高度（偏上，给头部上方留白）
            left = _clamp(cx - cw // 2, 0, sw - cw)
            top = _clamp(cy - ch // 3, 0, sh - ch)

            crop = im.crop((left, top, left + cw, top + ch))
            crop = crop.resize((TARGET_W, th), Image.LANCZOS)
            canvas.paste(crop, (0, y))
            y += th
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "JPEG", quality=QUALITY)
