# DaoXE Docs SPA

独立文档站（Vite + React + React Router）。**不改 new-api 源码**。

## 开发

```bash
cd docs-site
cp .env.example .env.local
# 填入 DOCS_ASSISTANT_KEY=sk-...   （服务端变量，不会打进前端包）
bun install
bun run dev
```

打开：http://127.0.0.1:5177/docs/

## 构建

```bash
bun run build
# 产物 dist/ 可挂 nginx
bun run preview   # 本地 preview 同样走 Vite 中间件代理
```

生产若只用静态文件托管，需另起 sidecar：

```bash
DOCS_ASSISTANT_KEY=sk-... bun run assistant:proxy   # :8788
# nginx 用 deploy/daoxe-docs.conf 反代 /docs-api/assistant/ → 127.0.0.1:8788
```

## 改什么

| 文件 | 用途 |
|------|------|
| `src/config.ts` | 品牌、主站 URL、侧栏导航 |
| `src/content/pages.tsx` | 各页正文（按 id） |
| `src/shell/*` | 顶栏 / 主题 / 公告 / 侧栏 |
| `src/components/DocsAssistant.tsx` | 右下角浮动文档助手（只打同源代理） |
| `src/lib/docs-assistant.ts` | 客户端检索 + 调 `/docs-api/assistant/*` |
| `server/chat-handler.ts` | 服务端持 key、拼 system prompt、转发上游 |
| `server/assistant-proxy.ts` | 生产 Bun sidecar |
| `src/vite-plugin-assistant-proxy.ts` | 开发/preview 同源代理 |
| `src/styles/docs.css` | 样式 |
| `.env.local` | `DOCS_ASSISTANT_KEY=…`（gitignore，**禁止** `VITE_` 前缀密钥） |

## 文档助手（密钥不进浏览器）

```
Browser  →  POST /docs-api/assistant/chat  →  Vite 中间件 / Bun sidecar
                                              （Authorization: Bearer <server key>）
                                              →  jp.daoxe.com/v1
```

- 密钥：`DOCS_ASSISTANT_KEY`（仅 process.env）
- 健康检查：`GET /docs-api/assistant/health` → `{ ok: true|false }`
- 无 key 或 health 为 false 时，浮动按钮不显示
- 简易限流：每 IP 约 30 次/分钟（sidecar）

## Telegram 文档助手

同一套文档检索 + LLM，长轮询监听指定群并自动回复。

```bash
# .env.local 填入：
# DOCS_TG_BOT_TOKEN=123456:ABC...
# DOCS_TG_CHAT_ID=-100xxxxxxxxxx
# DOCS_ASSISTANT_KEY=sk-...

bun run assistant:tg
```

| 变量 | 说明 |
|------|------|
| `DOCS_TG_BOT_TOKEN` | BotFather token（勿提交） |
| `DOCS_TG_CHAT_ID` | 监听的群 ID（如 `-100…`） |
| `DOCS_TG_REQUIRE_MENTION` | 默认 `1`：群内需 @机器人 / 回复机器人 / `/ask` |
| `DOCS_TG_DOCS_BASE` | 回复里附的文档链接前缀 |

机器人需先被拉进群，并在群内有发消息权限。生产可用 systemd / pm2 常驻 `bun run assistant:tg`。

## 侧栏 UX

- SPA 侧栏组件**常驻**，切换页面不重建 → 滚动位置自然保持
- 分组折叠状态 `localStorage`
- 正文区切换时滚到顶部，侧栏不动

## 与主站

登录 / 注册 / 协议全文 → 跳转 `daoxe.com`。本地不同源看不到登录头像；挂到同源 `/docs` 后共享 `localStorage.user`。

旧版多页 HTML 备份在 `_legacy_html/`。**请勿删除**：它不参与构建（Vite 只拷贝 `public/`，产物里没有它），
但 `deploy/daoxe-docs.conf` 里的 301 规则是照着它的目录结构写的 —— 老地址
`/docs/pages/<组>/<页>.html` 会跳到对应 SPA 路由。删掉它就没有依据再核对这批重定向了。

## SEO

- `scripts/gen-seo.ts` 在 `dev` / `build` 时按 `src/config.ts` 的 nav 生成 `public/sitemap.xml`（59 条）和 `public/robots.txt`，新增页面不会漏。
- `index.html` 里是给不执行 JS 的爬虫看的静态 meta / OG / Twitter / canonical 默认值；`src/lib/seo.ts` 在路由切换时刷新它们，并写入 JSON-LD（`Organization` + `WebSite`(SearchAction) + `BreadcrumbList` + `TechArticle`）。
- **爬虫只认站点根目录的 robots.txt。** 本站挂在 `/docs/` 下，所以还需要在 `https://daoxe.com/robots.txt` 里加一行
  `Sitemap: https://daoxe.com/docs/sitemap.xml`——那个文件属于主站，不在本目录内。
