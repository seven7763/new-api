# DaoXE 对比度/CSS 修复 + AUP 补全 + 页脚联系方式（2026-07-20，round 4）

保留中英双语 + 纯 CSS 语言切换（默认中文），仅在此基础上：修配色/对比度、补 AUP 专章、更新页脚联系方式。免重启上线。

## 变更键（options 表）

| 键 | 变更 |
| --- | --- |
| `About` | 样式层：链接对比度、banner 正文去红、标签前景色、按钮不下划线 |
| `legal.user_agreement` | 样式层同上 + **AUP 内容补全**（恐怖主义/自残/CSAM 上报/欺诈·恶意软件/分级警告，中英双语） |
| `legal.privacy_policy` | 样式层同上（含表格标签对比度） |
| `Footer` | 站点令牌化 + 统一 `support@daoxe.com` + 亮暗自适应（原为硬编码 13px、且用 Gmail） |

## 配色/CSS 修复（用站点令牌，亮暗自适应）

- **链接可读性**（修复截图中联系卡片邮箱/Telegram 值、红框内链接过暗）：`.dx-doc a` 改为 `color-mix(in oklch, var(--primary) 55%, var(--foreground))` + 下划线；hover 提升到 72% 混色。暗色下不再是低对比暗蓝。
- **服务范围红框**：`.dx-banner strong` 由红色改为 `var(--foreground)`（正文常规前景色，仅标题/左色条着红），链接用主色×前景混色，去除“整段大面积红 + 链接混色”。
- **标签**（隐私页 必须/风控/—）：文字统一 `var(--foreground)`，语义靠底色/描边（primary/warning/muted），修复琥珀/蓝色小字在浅底上的低对比。
- **按钮**：`.dx-doc .dx-btn*` 提升优先级并 `text-decoration:none`，避免全局链接下划线波及按钮。
- 正文/次要文本/表格/卡片键值：正文与重要信息用 `var(--foreground)`，仅标签类次要信息用 `var(--muted-foreground)`。

## AUP 专章补全（legal.user_agreement §5，中英双语）

- §5.1 新增/强化：**暴力/血腥/恐怖主义**（并入极端主义宣扬招募）、**自残/自杀**（独立项）、**儿童不安全内容 CSAM**（绝对禁止＋依法留证＋立即封禁＋向主管机关/执法报告）、**深度伪造/冒充他人**（原已具备）、**其他违法用途**（欺诈/钓鱼/恶意软件/非法数据/侵犯隐私）。
- §5.3 处置：新增**分级“警告/限流/拦截拒服”**为首档，保留封禁、清零/扣减额度、保留证据、依法上报、不予退款、CSAM 即时封禁上报。
- §5.4 举报渠道、§5.5 审核机制：原已完整（邮箱/Telegram、随附材料、流程时限；上游安全过滤＋平台滥用监测＋举报人工复核＋配合执法），如实体现“API 中转、依赖上游安全＋事后监测/举报”。

## 页脚（Footer）说明与限制

- 已更新 `Footer` 选项，联系方式（客服 `support@daoxe.com`、内容举报【Abuse Report】、Telegram `@daoxe_ai`）+ 协议/关于链接，令牌化、亮暗可读。
- **限制**：`web/default` 中读取 `footer_html` 的 `<Footer>` 组件**仅渲染于首页/落地页**（`features/home/index.tsx`）；控制台、关于、协议页不含该页脚。要“任何页面底部都可见联系方式”，需改前端布局（重建镜像＝重启），与免重启冲突——**未执行，待用户决定**。当前联系方式已在 关于页、用户协议、隐私政策 正文内均可见。

## 新值 MD5（= 仓库 `docs/legal/*`，与库逐字节一致）

| 键 | 新 MD5 |
| --- | --- |
| `About` | `8f5a361e9f10e90172f0155008869109` |
| `legal.user_agreement` | `3f57752d8002ee12fbe53f813caa81af` |
| `legal.privacy_policy` | `46c5ec7f110c9e7d5b6d35763b407b0c` |
| `Footer` | `176edc60387efc408fe415ecaa764cf9` |

## 备份与回滚（免重启，≤60s 生效）

本目录 `*.b64`/`*.html` = 改动前值（round-3 restyle + 原始 Footer），MD5：About `51d06bdc…`、ua `40ea1e3b…`、pp `742d6dfd…`、Footer `11e8e4c9…`。

```bash
cat restore-precontrast-20260720.sql | ssh root@<server> \
  "docker exec -i postgres-main psql -U postgres -d new2api -v ON_ERROR_STOP=1 -f -"
```

更早版本回滚脚本见同级其它 `server-backup-20260720*` 目录。

## 遗留（非本任务范围）

- `/api/status` 的 **FAQ 面板**（`data.faq[13].answer`，对应后台“常见问题/FAQ”配置项）仍写着旧 Gmail `cabesalberto36216@gmail.com`。它不属于本次三页/页脚，未改动；如需全站统一为 `support@daoxe.com`，可另行更新该 FAQ 选项（同样可免重启）。

> 容器未重启：`StartedAt` 恒为 `2026-07-18T22:54:09.733926824Z`，`RestartCount=0`。本目录不含服务器口令。
