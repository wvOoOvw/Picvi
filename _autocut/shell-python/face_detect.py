# -*- coding: utf-8 -*-
"""人脸检测相关"""
from pathlib import Path

try:
    import cv2
    import numpy as np
except ImportError:
    print("Missing dependency: opencv-python. Run: pip install opencv-python")
    raise

_face_cascade = None
_face_center_cache: dict = {}


def _get_cascade():
    global _face_cascade
    if _face_cascade is None:
        _face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
    return _face_cascade


def detect_face_center(p: Path):
    """返回 (cx, cy) 人脸中心，未检测到返回 None。结果按文件缓存。"""
    if p in _face_center_cache:
        return _face_center_cache[p]

    cascade = _get_cascade()
    try:
        data = np.fromfile(str(p), dtype=np.uint8)  # 兼容中文路径
        img = cv2.imdecode(data, cv2.IMREAD_COLOR)
        if img is None:
            _face_center_cache[p] = None
            return None
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        faces = cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30)
        )
        if len(faces) == 0:
            _face_center_cache[p] = None
            return None
        # 取最上方的人脸作为主脸（通常是头部位置）
        x, y, w, h = min(faces, key=lambda f: f[1])
        center = (int(x + w / 2), int(y + h / 2))
        _face_center_cache[p] = center
        return center
    except Exception:
        _face_center_cache[p] = None
        return None


def filter_images_with_face(img_paths):
    """按是否检测到人脸过滤；未检测到则忽略该图片并打印提示。"""
    kept = []
    for p in img_paths:
        if detect_face_center(p) is not None:
            kept.append(p)
        else:
            print(f"  Skipped (no face detected): {p.name}")
    return kept
