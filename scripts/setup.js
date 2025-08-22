const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始设置内容收藏平台...\n');

// 检查 .env 文件
if (!fs.existsSync('.env')) {
  console.log('📝 创建 .env 文件...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ .env 文件已创建，请配置数据库连接信息\n');
} else {
  console.log('✅ .env 文件已存在\n');
}

// 创建上传目录
const uploadDir = path.join('public', 'uploads', 'videos');
if (!fs.existsSync(uploadDir)) {
  console.log('📁 创建上传目录...');
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ 上传目录已创建\n');
}

try {
  // 生成 Prisma 客户端
  console.log('🔧 生成 Prisma 客户端...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma 客户端生成完成\n');

  console.log('🎉 设置完成！');
  console.log('\n下一步：');
  console.log('1. 配置 .env 文件中的数据库连接');
  console.log('2. 运行 "npx prisma db push" 创建数据库表');
  console.log('3. 运行 "npm run dev" 启动开发服务器');
  
} catch (error) {
  console.error('❌ 设置过程中出现错误：', error.message);
  process.exit(1);
}