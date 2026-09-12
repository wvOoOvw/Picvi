const fs = require('fs');
const path = require('path');

// 配置
const SOURCE_DIR = 'E:/Picvi/Cosplay';
const TARGET_DIR = 'E:/Picvi/Cosplay-Video';

// 视频文件扩展名
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm', '.m4v', '.3gp', '.mpg', '.mpeg'];

/**
 * 检查是否为视频文件
 * @param {string} ext - 文件扩展名
 * @returns {boolean}
 */
function isVideoFile(ext) {
  return VIDEO_EXTENSIONS.includes(ext.toLowerCase());
}

/**
 * 递归遍历目录并移动视频文件
 * @param {string} sourcePath - 源路径
 * @param {string} relativePath - 相对路径
 * @returns {Object} - 统计信息
 */
function moveVideos(sourcePath, relativePath = '') {
  const stats = {
    movedFiles: 0,
    skippedFiles: 0,
    errorCount: 0
  };

  try {
    const items = fs.readdirSync(sourcePath);

    for (const item of items) {
      const itemPath = path.join(sourcePath, item);
      const itemStats = fs.statSync(itemPath);

      if (itemStats.isDirectory()) {
        // 递归处理子目录
        const subRelativePath = relativePath ? path.join(relativePath, item) : item;
        const subStats = moveVideos(itemPath, subRelativePath);
        stats.movedFiles += subStats.movedFiles;
        stats.skippedFiles += subStats.skippedFiles;
        stats.errorCount += subStats.errorCount;
      }
      if (itemStats.isFile()) {
        const ext = path.extname(item);

        if (isVideoFile(ext)) {
          // 移动视频文件
          try {
            const targetRelativePath = relativePath;
            const targetFilePath = path.join(TARGET_DIR, targetRelativePath, item);

            // 创建目标目录（如果不存在）
            const targetDir = path.dirname(targetFilePath);
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }

            // 移动文件
            fs.renameSync(itemPath, targetFilePath);
            console.log(`已移动: ${path.join(relativePath || '', item)}`);
            stats.movedFiles++;
          } catch (error) {
            console.error(`移动文件失败 ${item}:`, error.message);
            stats.errorCount++;
          }
        } else {
          stats.skippedFiles++;
        }
      }
    }

    // 清理空目录（可选）
    try {
      const remainingItems = fs.readdirSync(sourcePath);
      if (remainingItems.length === 0 && relativePath !== '') {
        fs.rmdirSync(sourcePath);
        console.log(`已删除空目录: ${relativePath}`);
      }
    } catch (error) {
      // 忽略删除空目录的错误
    }

  } catch (error) {
    console.error(`处理目录失败 ${sourcePath}:`, error.message);
    stats.errorCount++;
  }

  return stats;
}

/**
 * 主函数
 */
function main() {
  console.log('开始移动视频文件...');
  console.log(`源目录: ${SOURCE_DIR}`);
  console.log(`目标目录: ${TARGET_DIR}`);
  console.log('---');

  // 检查源目录是否存在
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`源目录不存在: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // 创建目标目录（如果不存在）
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log(`创建目标目录: ${TARGET_DIR}`);
  }

  // 开始移动视频文件
  const startTime = Date.now();
  const stats = moveVideos(SOURCE_DIR);
  const endTime = Date.now();

  // 输出统计信息
  console.log('---');
  console.log('处理完成！');
  console.log(`移动文件数: ${stats.movedFiles}`);
  console.log(`跳过文件数: ${stats.skippedFiles}`);
  console.log(`错误数: ${stats.errorCount}`);
  console.log(`耗时: ${endTime - startTime}ms`);
}

// 执行主函数
main();
