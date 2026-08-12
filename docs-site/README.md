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
# tsc -b → gen-search-index → gen-seo → vite build → prerender
# 产物 dist/ 可挂 nginx
bun run preview   # 本地 preview 同样走 Vite 中间件代理，并按 <route>/index.html 命中预渲染页
```

构建后可跑 `bun run verify:prerender` 校验 dist/：每页每语言都有静态文件、head 自洽、
hreflang 双向互指、sitemap 与磁盘一致。

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
| `scripts/prerender.ts` | 构建后把每页 × 每语言渲染成静态 HTML |
| `deploy/daoxe-docs.conf` | nginx：语言前缀、301、静态文件优先、缓存头（改后要 `nginx -t`） |
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

## 多语言 URL

| 语言 | URL | 说明 |
|------|-----|------|
| zh（默认） | `/docs/guide/keys` | 保持历史地址不变，已收录的 59 条 URL 不进重定向 |
| en / ru / vi | `/docs/en/guide/keys` 等 | 之前根本没有独立地址，现在各自可被索引 |

- **URL 是语言的唯一来源。** `splitLangPath()` 从路径解析语言，`main.tsx` 用
  `basename=/docs/<lang>` 建 Router，于是所有 `<Link to="/guide/keys">` 自动带上前缀，
  正文里几百条链接一行没改。
- `localStorage` 里的语言偏好**不再决定渲染什么**（那会和预渲染的 HTML 打架），只用来在
  `LangSuggest` 里提示"本页也有中文版本"。优先级：URL > localStorage > `navigator.languages`。
  纯静态部署没有服务端，语言协商只能在客户端做，所以做成**链接而不是重定向**——自动跳转
  会挡住爬虫抓取其他语言版本，正好抵消多语言 URL 的收益。
- 语言切换器是真 `<a href>`（不是 setState），爬虫能跟着爬，落地页直接是对方语言的预渲染 HTML。
- `/docs/zh/...` 是重复拼写：nginx 301 到无前缀形式，客户端也会 `location.replace` 兜一层。

## 预渲染

- `scripts/prerender.ts` 在 `vite build` 之后跑，把 59 页 × 4 语言渲染成 236 个
  `<route>/index.html`（zh 无前缀，其余在 `en/` `ru/` `vi/` 下）。JS 仍然是共享 chunk，
  每页只多一份 HTML（约 40 kB，gzip 后 6–8 kB）。
- 渲染复用 `gen-search-index.ts` 已经验证过的那套：内容注册表能在 Bun 里 import 并渲染。
  区别是这里渲染整个 `<App/>`（外壳 + 侧栏 + 正文）并用可 hydrate 的 `renderToString`。
- **hydration 一致性**靠三件事：
  1. 首屏渲染不读浏览器状态。`ShellProvider` 的 status/user、侧栏折叠状态都改成挂载后再读
     `localStorage`；页脚年份加 `suppressHydrationWarning`；语言来自 URL。
  2. `main.tsx` 等 `loadRegistries()` resolve 后再 mount，首次渲染就有正文，不会拿 loading
     态去 hydrate 一堆真内容。
  3. `<div id="root" data-ssr="<lang>:<route>">` 标了这份 HTML 属于哪个路由；对不上
     （SPA fallback、服务器配错、CDN 发错文件）就走 `createRoot` 重新渲染，不硬 hydrate。
- **SSR 边界**：靠接口取数的页面（`/features/notice`、`/support/faq`、`/features/pricing`、
  `/features/invite`、`/guide/recommended-models` 的实时表格）预渲染出来是占位态，客户端挂载
  后再补数据——服务端和客户端首帧都是同一个占位态，所以不会 mismatch。代码块同理：静态 HTML
  里是纯 `<pre>`，Shiki 高亮是挂载后异步替换的（对爬虫反而更友好）。
- 未命中任何预渲染文件的 URL 落到 `dist/app.html`：空 `#root` + `noindex` 的壳。

## SEO

- `scripts/gen-seo.ts` 在 `dev` / `build` 时按 `src/config.ts` 的 nav 生成 `public/sitemap.xml`
  （236 条 = 59 页 × 4 语言，每条带 `xhtml:link` hreflang 标注）和 `public/robots.txt`，新增页面不会漏。
- `src/lib/seo.ts` 的 `buildSeoHead()` 是纯函数：预渲染时序列化进静态 HTML，路由切换时由
  `applyDocumentSeo()` 写进 DOM。两边同一份来源，不会漂。内容包括 title / description /
  canonical / hreflang / OG / Twitter / JSON-LD（`Organization` + `WebSite`(SearchAction) +
  `BreadcrumbList` + `TechArticle`）。
- canonical 指向**当前语言自己的 URL**；hreflang 每个变体都声明全部 4 种语言 + `x-default`
  （指向 zh）。双向互指由 `verify:prerender` 校验——单向声明会被搜索引擎整组丢弃。
- **爬虫只认站点根目录的 robots.txt。** 本站挂在 `/docs/` 下，所以还需要在 `https://daoxe.com/robots.txt` 里加一行
  `Sitemap: https://daoxe.com/docs/sitemap.xml`——那个文件属于主站，不在本目录内。
