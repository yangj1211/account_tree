# 合并科目结构树查看器

一个基于 React + TypeScript + Vite 的树形结构查看器，用于展示合并科目结构树数据，支持展开/收起和搜索功能。

## 功能特性

- 🌳 树形结构展示
- 🔍 搜索功能（支持代码和名称搜索）
- 📂 展开/收起节点
- 🎨 现代化的 UI 设计
- 📱 响应式布局

## 安装依赖

```bash
npm install
```

## 运行开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

## 构建生产版本

```bash
npm run build
```

## 预览生产版本

```bash
npm run preview
```

## 部署到线上

### 方法一：使用 Vercel（推荐，最简单）

1. **安装 Vercel CLI**（如果还没有安装）：
```bash
npm i -g vercel
```

2. **登录 Vercel**：
```bash
vercel login
```

3. **部署项目**：
```bash
vercel
```

4. **或者通过网页部署**：
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账号登录
   - 点击 "New Project"
   - 导入你的项目仓库
   - Vercel 会自动检测到 Vite 项目并配置好
   - 点击 "Deploy" 即可

部署完成后，你会得到一个类似 `https://your-project.vercel.app` 的链接，可以直接分享给别人！

### 方法二：使用 Netlify

1. **安装 Netlify CLI**：
```bash
npm i -g netlify-cli
```

2. **登录 Netlify**：
```bash
netlify login
```

3. **部署项目**：
```bash
netlify deploy --prod
```

4. **或者通过网页部署**：
   - 访问 [netlify.com](https://netlify.com)
   - 使用 GitHub/GitLab/Bitbucket 账号登录
   - 点击 "Add new site" -> "Import an existing project"
   - 选择你的项目仓库
   - 构建命令：`pnpm build`
   - 发布目录：`dist`
   - 点击 "Deploy site"

### 方法三：使用 GitHub Pages

1. **安装 gh-pages**：
```bash
pnpm add -D gh-pages
```

2. **在 package.json 中添加部署脚本**：
```json
"scripts": {
  "deploy": "pnpm build && gh-pages -d dist"
}
```

3. **修改 vite.config.ts**，添加 base 配置：
```typescript
export default defineConfig({
  base: '/your-repo-name/', // 替换为你的仓库名
  plugins: [react()],
})
```

4. **部署**：
```bash
pnpm deploy
```

### 方法四：构建静态文件并手动部署

1. **构建项目**：
```bash
pnpm build
```

2. **dist 目录**就是构建好的静态文件，可以：
   - 上传到任何静态文件托管服务
   - 放到你的服务器上
   - 使用 nginx/apache 等 Web 服务器托管

## 使用说明

1. 启动开发服务器后，页面会自动加载 `account_tree.json` 文件（合并科目结构树数据）
2. 默认展开前两级节点
3. 点击节点可以展开/收起子节点
4. 使用顶部搜索框可以搜索代码或名称
5. 搜索结果会自动过滤并高亮匹配的节点

## 项目结构

```
.
├── account_tree.json      # 合并科目结构树数据文件
├── index.html            # HTML 入口文件
├── package.json          # 项目依赖配置
├── vite.config.ts        # Vite 配置文件
├── tsconfig.json         # TypeScript 配置
└── src/
    ├── main.tsx          # React 入口文件
    ├── App.tsx           # 主应用组件
    ├── App.css           # 主应用样式
    ├── types.ts          # TypeScript 类型定义
    └── components/
        ├── TreeNode.tsx  # 树节点组件
        └── TreeNode.css  # 树节点样式
```

