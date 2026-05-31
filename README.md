<p align="center">
  <h1 align="center">🧮 Math Sprint — 人教版初中数学学习平台</h1>
  <p align="center">
    <strong>Math Sprint</strong> 是一个面向初中阶段（7–9 年级）的交互式数学学习平台，<br/>
    严格对标人教版（PEP）课程大纲，覆盖 6 册 29 个章节。
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.1-38BDF8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/KaTeX-0.16-008080?logo=latex" alt="KaTeX" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

---

## 📸 项目截屏

### 🏠 首页 — 年级选择

<img src="screenshots/homepage.png" alt="首页" width="100%" />

### 📚 章节目录

<img src="screenshots/catalog.png" alt="章节目录" width="100%" />

### 📖 章节详情

<img src="screenshots/chapter-detail.png" alt="章节详情" width="100%" />

### 📝 知识点课程

<img src="screenshots/lesson.png" alt="课程页面" width="100%" />

### ✏️ 单元测验

<img src="screenshots/quiz.png" alt="测验页面" width="100%" />

### 📊 测验结果与解析

<img src="screenshots/quiz-result.png" alt="测验结果" width="100%" />

---

## ✨ 功能特性

<table>
  <tr>
    <td width="50%">
      <h3>📚 完整课程体系</h3>
      <ul>
        <li>覆盖 7–9 年级上下 6 册</li>
        <li>29 个章节，每个章节包含多个知识点课程与典型例题</li>
        <li>严格对齐人教版教材内容</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📝 知识点课程</h3>
      <ul>
        <li>丰富的富文本内容块（文字、公式、表格、推导步骤）</li>
        <li>核心公式与法则高亮</li>
        <li>关联例题一键跳转</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>✏️ 6 种题型测验</h3>
      <ul>
        <li>单选题、多选题、填空题、数值题、表达式题、分步解答题</li>
        <li>三级难度：基础 / 进阶 / 挑战</li>
        <li>即时判分 + 逐题解析反馈</li>
      </ul>
    </td>
    <td>
      <h3>🔢 数学公式渲染</h3>
      <ul>
        <li>基于 KaTeX 的服务端公式渲染 API</li>
        <li>自动生成 PNG + SVG 公式图片</li>
        <li>支持课程与测验中的数学图形（数轴、坐标平面、函数图像等）</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <h3>🎬 课程视频</h3>
      <ul>
        <li>章节配套教学视频</li>
        <li>视频卡片展示、占位与就绪状态</li>
      </ul>
    </td>
    <td>
      <h3>🛠 后台管理</h3>
      <ul>
        <li>章节 / 课程 / 例题 / 测验题目编辑器</li>
        <li>内容导入 API</li>
        <li>身份验证与登录系统</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🗺️ 路由结构

```
/                                    → 首页
/g7/shang                            → 七年级上册
/g7/shang/catalog                    → 章节目录
/g7/shang/catalog/unit-1             → 章节详情
/g7/shang/catalog/unit-1/lessons/... → 知识点课程
/g7/shang/catalog/unit-1/examples/...→ 典型例题
/g7/shang/catalog/unit-1/quiz        → 单元测验
/g7/shang/catalog/unit-1/quiz/result → 测验结果
```

统一使用 `g{7|8|9}/{shang|xia}` 模式，支持所有年级和册别。

---

## 🧱 技术架构

| 层级 | 技术 |
| --- | --- |
| 框架 | Next.js 15 (App Router) + React 19 |
| 语言 | TypeScript 5.8 |
| 样式 | Tailwind CSS 4.1 |
| 数学渲染 | KaTeX + 服务端公式渲染 API |
| 数学图形 | 自研 SVG 图形渲染引擎（数轴、坐标平面、函数图像、几何图形等） |
| 内容存储 | 静态 TypeScript 模块（可替换为 CMS） |
| 测试 | Vitest |
| 构建 | Next.js 原生构建 + 自定义 dist 目录 |

### 项目目录

```
math-ai/
├── src/
│   ├── app/            # 路由、页面、API 路由
│   ├── components/     # 可复用 UI 组件
│   │   ├── ui/         # 基础 UI（button, card, badge 等）
│   │   ├── content/    # 内容渲染组件（公式、视频卡片等）
│   │   ├── quiz/       # 测验组件
│   │   └── layout/     # 布局组件
│   ├── features/       # 领域模块（lesson, example, quiz）
│   ├── content/        # 课程内容数据（29 个章节）
│   ├── lib/            # 工具库（认证、路由、存储、公式渲染）
│   ├── types/          # TypeScript 类型定义
│   └── styles/         # 全局样式
├── public/             # 静态资源（公式图片、视频等）
├── screenshots/        # 项目截屏
├── docs/               # 产品文档与架构说明
├── chapter-videos/     # 章节视频工程文件
└── scripts/            # 工具脚本
```

---

## 🚀 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/caicaivic0322/math-ai.git
cd math-ai

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问
# http://localhost:3000
```

或使用启动脚本：

```bash
bash start.sh
```

### 其他命令

```bash
npm run build       # 生产构建
npm run test        # 运行测试
npm run typecheck   # TypeScript 类型检查
npm run lint        # 代码检查
```

---

## 📋 已接入课程

| 年级 | 册别 | 章节数 |
| --- | --- | --- |
| 七年级上 | 上册 | 4 |
| 七年级下 | 下册 | 6 |
| 八年级上 | 上册 | 5 |
| 八年级下 | 下册 | 5 |
| 九年级上 | 上册 | 5 |
| 九年级下 | 下册 | 4 |
| **合计** | | **29** |

---

## 📄 License

MIT
