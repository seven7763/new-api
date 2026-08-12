# 请你手动截图（登录后）

目录：`docs-site/public/images/guide/daoxe/`

## 已有（无需再截）
- 01-home.png — 首页
- 02-pricing.png — 模型广场
- 03-login.png — 登录
- 03b-signup.png — 注册

## 还差这 5 张（登录账号后截）

| # | 文件名（必须一致） | 去哪 | 要点 |
|---|-------------------|------|------|
| 1 | **04-console.png** | `/dashboard` 概览 | 整页，浅色主题 |
| 2 | **05-wallet.png** | 钱包 | 充值/订阅区域 |
| 3 | **06-onboarding.png** | 概览「开始使用」步骤区 | 没有引导就截步骤卡片 |
| 4 | **07-create-key.png** | API 密钥 → 点「创建」 | 表单打开状态，**打码 sk** |
| 5 | **08-logs.png** | 用量日志 | 有几条记录更好 |

### 建议
- 窗口约 1440×900
- 打码余额、邮箱、完整密钥

### 存成 WebP（本目录已全量转换）
截好的 PNG 先转 WebP 再放进来，文件名保持表格里的名字、后缀改 `.webp`：

```bash
cwebp -q 82 -m 6 04-console.png -o 04-console.webp
```

文档里对应 Shot 已写好路径；缺文件会显示「加载失败」占位块（不会报错）。

## 还缺的客户端截图

`src/content/client-guides/` 里以下 7 张仍指向不存在的文件，页面上会显示占位块。
补图时放到 `public/images/guide/clients/` 并把引用改成 `.webp`：

`cherry-studio-provider` · `chatbox-provider` · `lobe-chat-provider` ·
`nextchat-endpoint` · `open-webui-connection` · `immersive-translate` ·
`gemini-cli-auth`
