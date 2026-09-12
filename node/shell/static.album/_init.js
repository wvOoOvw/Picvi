const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

function deleteFolders() {
  const folders = ['build', 'src'];
  
  folders.forEach(folder => {
    const folderPath = path.join(projectRoot, folder);
    
    if (fs.existsSync(folderPath)) {
      console.log(`正在删除文件夹: ${folderPath}`);
      
      // 递归删除文件夹及其内容
      fs.rmSync(folderPath, { recursive: true, force: true });
      console.log(`已删除: ${folderPath}`);
    } else {
      console.log(`文件夹不存在: ${folderPath}`);
    }
  });
}

function createSrcFolder() {
  const srcPath = path.join(projectRoot, 'src');
  
  if (!fs.existsSync(srcPath)) {
    fs.mkdirSync(srcPath, { recursive: true });
    console.log(`已创建: ${srcPath}`);
  } else {
    console.log(`文件夹已存在: ${srcPath}`);
  }
}

// 执行清理和初始化
console.log('开始清理和初始化项目...');
deleteFolders();
createSrcFolder();
console.log('完成！');
