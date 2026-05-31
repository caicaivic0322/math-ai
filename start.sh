#!/bin/bash
# 人教版初中数学学习平台 - 本地启动脚本
# 使用方式: 在终端中运行 bash start.sh

cd "$(dirname "$0")"

echo "🚀 正在启动 Math Sprint 学习平台..."
echo ""

# 使用预构建的生产版本
NEXT_DIST_DIR=.next-build npx next start --port 3000

echo ""
echo "✅ 服务器已关闭"
