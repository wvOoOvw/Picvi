# -*- coding: utf-8 -*-
"""拼图高清放大（Real-ESRGAN）"""
from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Iterable, Optional

from config import (
    QUALITY,
    REALESRGAN_EXE,
    UPSCALE_DIR,
    UPSCALE_MODEL,
    UPSCALE_SCALE,
)


class UpscaleError(RuntimeError):
    pass


class RealESRGANUpscaler:
    """对单张图片做 Real-ESRGAN 高清放大。

    优先使用用户提供的 ncnn-vulkan 可执行文件（需要自行下载），
    否则使用 pip 安装的 RealESRGAN Python 包（自动下载模型权重到 weights/）。
    """

    def __init__(
        self,
        scale: int = UPSCALE_SCALE,
        model: str = UPSCALE_MODEL,
        exe: Optional[Path] = REALESRGAN_EXE,
    ) -> None:
        self.scale = int(scale)
        self.model = model
        self.exe = Path(exe) if exe else None

        self._use_ncnn = bool(self.exe and self.exe.exists())
        self._py_model = None
        if not self._use_ncnn:
            self._init_python_backend()

    # ---------- backends ----------

    def _init_python_backend(self) -> None:
        try:
            from PIL import Image  # noqa: F401  (确认可用)
            from RealESRGAN import RealESRGAN  # type: ignore
        except Exception as e:  # pragma: no cover
            raise UpscaleError(
                "未找到可用的 Real-ESRGAN 后端。\n"
                "解决方式之一：\n"
                "  1) 下载 Real-ESRGAN 官方可执行文件，并在 config.py 设置 REALESRGAN_EXE；\n"
                "  2) 或安装 Python 依赖：pip install RealESRGAN torch torchvision，"
                "模型权重会自动下载到 ./weights。"
            ) from e

        import torch

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._py_model = RealESRGAN(device, scale=self.scale)
        self._py_model.load_weights(f"weights/{self.model}.pth", download=True)
        self._device = device

    # ---------- public ----------

    def upscale_file(self, in_path: Path, out_path: Path) -> None:
        in_path = Path(in_path)
        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        if self._use_ncnn:
            self._upscale_ncnn(in_path, out_path)
        else:
            self._upscale_python(in_path, out_path)

    def upscale_many(self, inputs: Iterable[Path]) -> None:
        for p in inputs:
            out = Path(UPSCALE_DIR) / p.name
            self.upscale_file(p, out)

    # ---------- impl ----------

    def _upscale_ncnn(self, in_path: Path, out_path: Path) -> None:
        if not self.exe:
            raise UpscaleError("REALESRGAN_EXE 未配置或文件不存在")

        cmd = [
            str(self.exe),
            "-i",
            str(in_path),
            "-o",
            str(out_path),
            "-s",
            str(self.scale),
            "-n",
            self.model,
        ]
        try:
            proc = subprocess.run(
                cmd,
                check=False,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding="utf-8",
            )
        except FileNotFoundError as e:
            raise UpscaleError(f"Real-ESRGAN 可执行文件不存在: {self.exe}") from e

        if proc.returncode != 0:
            raise UpscaleError(f"Real-ESRGAN 失败: {proc.stdout.strip()}")

    def _upscale_python(self, in_path: Path, out_path: Path) -> None:
        from PIL import Image

        assert self._py_model is not None, "Python backend 未正确初始化"

        with Image.open(in_path) as im:
            im = im.convert("RGB")
            sr = self._py_model.predict(im)
            sr.save(out_path, "JPEG", quality=QUALITY)


def upscale_images(inputs: Iterable[Path]) -> list[Path]:
    """对一组图片统一做高清放大，返回输出路径列表"""
    upscaler = RealESRGANUpscaler()
    outputs = []
    for p in inputs:
        p = Path(p)
        out = Path(UPSCALE_DIR) / p.name
        upscaler.upscale_file(p, out)
        outputs.append(out)
    return outputs
