# -*- coding: utf-8 -*-
"""配置项"""
from pathlib import Path

# ====== 路径 ======
BASE_DIR = Path(r"E:\Code\Picvi\_autocut")   # 基准目录
# 优先用 BASE_DIR 本身的图片；没有时回退到 BASE_DIR\cache
SRC_DIR = BASE_DIR
IMG_EXTS_FOR_CHECK = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
if not any(f.suffix.lower() in IMG_EXTS_FOR_CHECK for f in SRC_DIR.iterdir() if f.is_file()):
    fallback = BASE_DIR / "cache"
    if fallback.exists():
        SRC_DIR = fallback
OUT_DIR = BASE_DIR / "build"                    # 输出目录（固定输出到 BASE_DIR\build）

# ====== 图片 ======
TARGET_W, TARGET_H = 900, 1600                  # 输出尺寸
GROUP = 3                                       # 每组张数
QUALITY = 100                                    # JPEG 质量
IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}

# ====== 高清放大（Real-ESRGAN） ======
# 是否在拼图生成后统一做一次 AI 超分放大
UPSCALE_ENABLE = True
# 放大倍数，与 model_name 对应（x4plus 通常为 4）
UPSCALE_SCALE = 4
# 模型名称（Real-ESRGAN 自带：RealESRGAN_x4plus / RealESRNet_x4plus / RealESRGAN_x4plus_anime_6B 等）
UPSCALE_MODEL = "RealESRGAN_x4plus"
# 输出放大后的子目录（基于 OUT_DIR）
UPSCALE_DIR = OUT_DIR / f"upscaled_x{UPSCALE_SCALE}"
# realesrgan-ncnn-vulkan 可执行文件路径（置为 None 时使用 Python 库 RealESRGAN）
# 建议从 https://github.com/xinntao/Real-ESRGAN/releases 下载 Windows 版
REALESRGAN_EXE = None  # 例如: Path(r"E:\Tools\Real-ESRGAN\realesrgan-ncnn-vulkan.exe")
