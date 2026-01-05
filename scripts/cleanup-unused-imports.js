#!/usr/bin/env node

/**
 * 未使用导入清理脚本
 *
 * 此脚本会：
 * 1. 在 .ts 和 .tsx 文件中移除未使用的导入
 * 2. 对 .vue 文件进行基本检查（手动处理）
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ES Module 环境中获取 __dirname 的等效方法
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧹 开始清理未使用的导入...\n');

// 1. 清理 TypeScript 文件
console.log('📦 清理 TypeScript 文件...');
try {
  execSync('pnpm exec eslint "src/**/*.ts" "src/**/*.tsx" --fix', {
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  console.log('✅ TypeScript 文件清理完成\n');
} catch (error) {
  console.error('❌ TypeScript 文件清理失败:', error.message);
}

// 2. 清理 JavaScript 文件
console.log('📦 清理 JavaScript 文件...');
try {
  execSync('pnpm exec eslint "src/**/*.js" "src/**/*.mjs" "src/**/*.cjs" --fix', {
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  console.log('✅ JavaScript 文件清理完成\n');
} catch (error) {
  console.error('❌ JavaScript 文件清理失败:', error.message);
}

// 3. 检查 Vue 文件（仅报告问题）
console.log('📦 检查 Vue 文件...');
console.log('⚠️  Vue 文件需要手动处理，请查看下面的报告\n');
try {
  execSync('pnpm exec eslint "src/**/*.vue" --max-warnings=0', {
    stdio: 'inherit',
    cwd: join(__dirname, '..')
  });
  console.log('✅ Vue 文件检查完成\n');
} catch {
  console.log('\n💡 提示: 对于 Vue 文件中的未使用导入，请手动删除\n');
}

console.log('🎉 清理完成！');
console.log('\n提示: 运行 "pnpm lint" 可以修复大部分问题');
console.log('      运行 "pnpm lint:check" 可以查看所有问题');
