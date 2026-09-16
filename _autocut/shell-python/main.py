# -*- coding: utf-8 -*-
"""
将源目录中的图片按每 3 张一组拼接成 900x1600 的竖图
每组三张取"包含人物头部"的部分，垂直三等分拼接
头部定位：使用 OpenCV Haar 人脸检测；检测不到人脸的图片会被忽略不参与拼接
结果输出到源目录下的 build 文件夹
不足 3 张的尾组直接跳过
拼图完成后可选再做一次 Real-ESRGAN 高清放大（见 config.py）
"""
import random
import sys
from pathlib import Path

from config import GROUP, OUT_DIR, SRC_DIR, UPSCALE_DIR, UPSCALE_ENABLE
from face_detect import filter_images_with_face
from image_ops import list_images, merge_group


def main():
    if not SRC_DIR.exists():
        print(f"Source dir not found: {SRC_DIR}")
        sys.exit(1)

    images = list_images(SRC_DIR)
    images = filter_images_with_face(images)

    random.shuffle(images)

    total = len(images)

    if total < GROUP:
        print(f"Not enough images ({total} < {GROUP}). Nothing to merge.")
        return

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    group_count = total // GROUP
    made = 0
    merged_outputs: list[Path] = []

    for g in range(group_count):
        trio = images[g * GROUP: (g + 1) * GROUP]
        out_name = f"{g + 1:03d}.jpg"
        out_path = OUT_DIR / out_name
        merge_group(trio, out_path)
        merged_outputs.append(out_path)
        made += 1
        print(f"[{made}/{group_count}] {out_name} <- {[p.name for p in trio]}")

    skipped = total - group_count * GROUP

    print(f"\nDone: {made} merged images saved to {OUT_DIR}")

    if skipped:
        print(f"Skipped last {skipped} image(s) (less than {GROUP})")

    # 拼图完成后统一做一次 AI 高清放大
    if UPSCALE_ENABLE and merged_outputs:
        from upscale import RealESRGANUpscaler

        try:
            upscaler = RealESRGANUpscaler()
            UPSCALE_DIR.mkdir(parents=True, exist_ok=True)
            total_to_upscale = len(merged_outputs)
            print(f"\nStart upscaling {total_to_upscale} image(s) -> {UPSCALE_DIR}")
            for i, p in enumerate(merged_outputs, 1):
                out_up = UPSCALE_DIR / p.name
                upscaler.upscale_file(p, out_up)
                print(f"[{i}/{total_to_upscale}] upscaled {p.name}")
        except Exception as e:  # noqa: BLE001
            print(f"\nUpscale skipped due to error: {e}")


if __name__ == "__main__":
    main()
