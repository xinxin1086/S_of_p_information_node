#!/bin/bash

# API 统一调度迁移脚本
# 用于批量替换项目中的 API 导入语句

echo "🔧 API 统一调度迁移脚本"
echo "================================"
echo ""

# 定义要替换的模式
declare -A replacements=(
  ["from '@/api/index.js'"]="from '@/api/unified'"
  ["from '@/api/index'"]="from '@/api/unified'"
  ["from '@/api'"]="from '@/api/unified'"
  ["from \"@/api/index.js\""]="from \"@/api/unified\""
  ["from \"@/api/index\""]="from \"@/api/unified\""
  ["from \"@/api\""]="from \"@/api/unified\""
)

# 查找需要迁移的文件
echo "📋 查找需要迁移的文件..."
echo ""

files=$(grep -r "from '@/api" src/views/ src/components/ 2>/dev/null | grep -v "unified" | cut -d: -f1 | sort -u)

if [ -z "$files" ]; then
  echo "✅ 没有找到需要迁移的文件"
  exit 0
fi

echo "找到以下文件："
echo "$files" | nl
echo ""

# 询问是否继续
read -p "是否继续迁移？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 取消迁移"
  exit 0
fi

echo ""
echo "🔄 开始迁移..."
echo ""

# 备份文件
backup_dir=".backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# 迁移每个文件
echo "$files" | while read file; do
  if [ -f "$file" ]; then
    echo "处理: $file"

    # 备份原文件
    cp "$file" "$backup_dir/$(echo $file | tr '/' '_')"

    # 执行替换
    for old in "${!replacements[@]}"; do
      new="${replacements[$old]}"
      sed -i "s|$old|$new|g" "$file"
    done

    echo "  ✅ 完成"
  fi
done

echo ""
echo "🎉 迁移完成！"
echo ""
echo "📦 备份文件位置: $backup_dir"
echo ""
echo "📝 下一步："
echo "1. 检查迁移后的文件是否正常"
echo "2. 运行项目测试: npm run dev"
echo "3. 启用 Mock 模式: setMockMode(true)"
echo "4. 如果有问题，可以从备份恢复: cp $backup_dir/* src/views/"
echo ""
