# RaTeX 后端渲染集成说明

## 目标

- 前端继续使用 `KaTeX` 做老师编辑时的即时预览。
- 后端新增 `formula-render` 能力，负责生成稳定的 `SVG/PNG` 资源。
- 数据库存原始 LaTeX，渲染结果存文件系统或对象存储。
- 使用公式内容的 `sha256` 作为资源 key，避免重复渲染。

## 当前落地内容

- 新增服务模块：`src/lib/formula-render`
- 新增本地公式记录仓储：`src/lib/formula-records`
- 新增接口：`POST /api/formula-render`
- 新增保存接口：`GET/POST /api/formula-records`
- 新增批量生成接口：`POST /api/formula-records/generate-curriculum`
- 新增前端预览组件：`src/components/content/MathFormula.tsx`
- 新增教师验证页：`/formula-studio`
- 当前已支持：
  - 输入 LaTeX
  - 输出 SVG
  - 可选输出 PNG
  - 基于 hash 的文件缓存
  - 本地 JSON 持久化保存公式记录
- 当前未实现：
  - PDF 资源输出
  - 对象存储上传
  - 真正的数据库持久化写入

## 本地最小验证

已在当前机器完成以下验证：

1. 安装 Rust 工具链
2. clone `erweixin/RaTeX`
3. `cargo build --release`
4. 使用 `RATEX_UNICODE_FONT=/Library/Fonts/Arial Unicode.ttf` 渲染以下公式：
   - `\frac{1}{2} + \sqrt{x}`
   - `\text{若 } x > 3 \text{，则 } 2x+1 > 7`
   - `\begin{cases} x+y=3 \\ x-y=1 \end{cases}`
5. 成功生成：
   - `.cache/ratex-smoke/svg/0001.svg` ~ `0003.svg`
   - `.cache/ratex-smoke/png/0001.png` ~ `0003.png`

验证结果：

- 分式正常
- 根号正常
- 中文 `\text{}` 正常
- 方程组 `cases` 正常

## 环境变量

- `RATEX_ROOT`
  - RaTeX 仓库根目录
  - 默认值：`<projectRoot>/.cache/RaTeX`
- `RATEX_RENDER_BIN`
  - 可选，直接指定 PNG 渲染二进制路径
- `RATEX_SVG_BIN`
  - 可选，直接指定 SVG 渲染二进制路径
- `RATEX_UNICODE_FONT`
  - 建议显式指定中文字体
  - 生产建议：`/path/to/NotoSansSC-Regular.ttf`
- `FORMULA_ASSET_DIR`
  - 渲染资源输出目录
  - 默认值：`<projectRoot>/public/generated/formulas`
- `FORMULA_PUBLIC_BASE_PATH`
  - 对外访问前缀
  - 默认值：`/generated/formulas`

## 推荐生产配置

- 数据库存储：
  - `latex_source`
  - `formula_hash`
  - `svg_path`
  - `png_path`
  - `render_status`
  - `updated_at`
- 文件存储：
  - 文件名使用 `formula_hash.svg` / `formula_hash.png`
  - 单机先写本地目录
  - 多机部署再切到对象存储

当前最小闭环实现：

- 本地记录文件默认写入：`data/formula-records.json`
- 公式资源默认写入：`public/generated/formulas`
- 适合先验证老师编辑保存流程，再替换成数据库/对象存储

## 接口示例

```bash
curl -X POST http://localhost:3000/api/formula-render \
  -H 'Content-Type: application/json' \
  -d '{
    "latex": "\\frac{1}{2} + \\sqrt{x}",
    "formats": ["svg", "png"]
  }'
```

返回示例：

```json
{
  "latex": "\\frac{1}{2} + \\sqrt{x}",
  "hash": "sha256...",
  "storageKey": "sha256...",
  "assets": {
    "svg": {
      "format": "svg",
      "fileName": "sha256....svg",
      "absolutePath": "/abs/path/public/generated/formulas/sha256....svg",
      "publicPath": "/generated/formulas/sha256....svg",
      "mimeType": "image/svg+xml",
      "fromCache": false
    },
    "png": {
      "format": "png",
      "fileName": "sha256....png",
      "absolutePath": "/abs/path/public/generated/formulas/sha256....png",
      "publicPath": "/generated/formulas/sha256....png",
      "mimeType": "image/png",
      "fromCache": false
    }
  }
}
```

保存记录示例：

```bash
curl -X POST http://localhost:3000/api/formula-records \
  -H 'Content-Type: application/json' \
  -d '{
    "entityType": "question",
    "entityId": "question-001",
    "field": "stemFormula",
    "latex": "\\frac{1}{2} + \\sqrt{x}",
    "formats": ["svg", "png"],
    "note": "题干主公式"
  }'
```

读取记录示例：

```bash
curl "http://localhost:3000/api/formula-records?entityType=question&limit=10"
```

从现有课程内容自动批量生成公式资源：

```bash
curl -X POST http://localhost:3000/api/formula-records/generate-curriculum \
  -H 'Content-Type: application/json' \
  -d '{
    "includePng": true
  }'
```

当前自动生成范围：

- 扫描 `src/content` 中所有课程切片
- 提取 lesson `bodyBlocks` 里 `type: "formula"` 的每一条公式
- 自动生成稳定 `SVG`
- 可选同时生成 `PNG`
- 自动写入 `data/formula-records.json`

## 接入建议

- 题库、错题本、AI 解析：
  - 保存题目时把公式字符串发给后端
  - 先生成 SVG，按需补 PNG
- 试卷 PDF、讲义 PDF：
  - 先使用稳定 SVG/PNG
  - 后续再补 RaTeX PDF 输出，避免前期接口反复变动
- 题目卡片/海报：
  - 优先用 PNG
  - 若是浏览器拼版，可直接消费 SVG

## 内容规范建议

当前课程内容里有不少“数学表达式文本”还不是严格 LaTeX，例如：

- `x + y = 10 不是一元一次方程`
- `检验：2×4+3=11`

建议逐步拆成两类字段：

- `latex`
  - 给 `KaTeX/RaTeX` 渲染
- `plainText`
  - 给中文说明、检验语句、题干描述

这样可以避免把普通中文说明误交给公式引擎。
