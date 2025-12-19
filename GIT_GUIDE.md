# Git 推送指南

## 📋 当前状态

项目已经初始化了 Git 仓库并创建了初始提交。

## 🚀 推送到远程仓库

### 方法一：推送到 GitHub（推荐）

1. **在 GitHub 上创建新仓库**：
   - 访问 [github.com](https://github.com)
   - 点击右上角的 "+" → "New repository"
   - 输入仓库名称（例如：`combine_tree`）
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

2. **添加远程仓库并推送**：
```bash
# 替换 YOUR_USERNAME 和 YOUR_REPO_NAME 为你的实际信息
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**或者使用 SSH**（如果你配置了 SSH key）：
```bash
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 方法二：推送到 GitLab

1. **在 GitLab 上创建新项目**：
   - 访问 [gitlab.com](https://gitlab.com)
   - 点击 "New project" → "Create blank project"
   - 输入项目名称
   - 点击 "Create project"

2. **添加远程仓库并推送**：
```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 方法三：推送到 Gitee（码云）

1. **在 Gitee 上创建新仓库**：
   - 访问 [gitee.com](https://gitee.com)
   - 点击 "+" → "新建仓库"
   - 输入仓库名称
   - 点击 "创建"

2. **添加远程仓库并推送**：
```bash
git remote add origin https://gitee.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 📝 常用 Git 命令

### 查看当前状态
```bash
git status
```

### 查看远程仓库
```bash
git remote -v
```

### 添加文件到暂存区
```bash
git add .
# 或添加特定文件
git add src/App.tsx
```

### 提交更改
```bash
git commit -m "描述你的更改"
```

### 推送到远程
```bash
git push
```

### 拉取远程更改
```bash
git pull
```

## 🔐 认证问题

如果推送时要求输入用户名和密码：

1. **使用 Personal Access Token**（推荐）：
   - GitHub: Settings → Developer settings → Personal access tokens → Generate new token
   - 生成 token 后，使用 token 作为密码

2. **配置 SSH Key**（更安全）：
   - 生成 SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
   - 将公钥添加到 GitHub/GitLab/Gitee 的 SSH keys 设置中

## 💡 提示

- 首次推送后，后续只需要 `git push` 即可
- 如果远程仓库已有内容，可能需要先 `git pull` 再推送
- 使用 `git log` 查看提交历史


