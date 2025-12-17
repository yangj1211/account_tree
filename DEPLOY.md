# 部署指南

## 🚀 快速部署（推荐使用 Vercel）

### 方式一：通过网页部署（最简单）

1. **访问 [vercel.com](https://vercel.com)**，使用 GitHub/GitLab/Bitbucket 账号登录

2. **将项目推送到 Git 仓库**（如果还没有）：
```bash
# 初始化 git 仓库
git init
git add .
git commit -m "Initial commit"

# 在 GitHub/GitLab 创建新仓库，然后推送
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

3. **在 Vercel 中导入项目**：
   - 点击 "New Project"
   - 选择你的 Git 仓库
   - Vercel 会自动检测配置
   - 点击 "Deploy"

4. **完成！** 你会得到一个类似 `https://your-project.vercel.app` 的链接

### 方式二：通过命令行部署

1. **安装 Vercel CLI**：
```bash
npm i -g vercel
# 或
pnpm add -g vercel
```

2. **登录 Vercel**：
```bash
vercel login
```

3. **部署**：
```bash
vercel
```

4. **生产环境部署**：
```bash
vercel --prod
```

## 📦 其他部署方式

### Netlify 部署

1. **安装 Netlify CLI**：
```bash
npm i -g netlify-cli
```

2. **登录并部署**：
```bash
netlify login
netlify deploy --prod
```

### 构建静态文件

如果你想自己托管：

1. **构建项目**：
```bash
pnpm build
```

2. **dist 目录**就是构建好的静态文件，可以：
   - 上传到任何静态文件托管服务
   - 放到你的服务器上
   - 使用 nginx/apache 等 Web 服务器托管

## 🔗 分享链接

部署完成后，你会得到一个公开的 URL，可以直接分享给任何人使用！

## 💡 提示

- Vercel 和 Netlify 都提供免费的 HTTPS 和自定义域名
- 每次推送到 Git 仓库，会自动重新部署
- 支持预览部署（在合并 PR 前可以预览）

