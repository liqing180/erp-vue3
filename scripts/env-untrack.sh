#!/bin/bash
git update-index --skip-worktree .env.development
echo "已关闭 .env.development 的变更跟踪" 