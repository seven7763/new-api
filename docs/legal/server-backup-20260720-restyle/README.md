# DaoXE 三页样式重构（对齐 new-api 原生令牌）+ 回滚记录（2026-07-20，round 3）

本轮：**保留中英双语**，仅重构样式层，使配色/圆角/间距/字体/亮暗色**跟随 new-api(DaoXE) 站点真实设计令牌**。免重启上线。

## 令牌来源与引用方式

- 令牌定义：`web/default/src/styles/theme.css`（`:root` 亮色 / `.dark` 暗色）。
- 渲染：`web/default/src/components/html-content.tsx` 用 **Shadow DOM + DOMPurify(isolatedSanitizeOptions)**，并把 `document.head` 的样式克隆进 shadow root；CSS 自定义属性（可继承）从宿主 `:root` **穿透 shadow 边界**被内容继承，暗色再由 `syncDarkClass` 给 wrapper 加 `.dark` 双重覆盖。
- 因此三页内联 `<style>` **直接引用站点变量**：`var(--primary)`、`var(--primary-foreground)`、`var(--background)`、`var(--foreground)`、`var(--card)`、`var(--card-foreground)`、`var(--border)`、`var(--muted)`、`var(--muted-foreground)`、`var(--destructive)`、`var(--success)`、`var(--warning)`、`var(--ring)`、圆角 `var(--radius)`（及 `calc(var(--radius)*n)`）、字体 `var(--font-body)`。**颜色与圆角、亮/暗色自动与站点一致**，不再自造调色板（`var(--dx-*)` 已全部移除）。

### 关键令牌值（摘自 theme.css）

| 令牌 | 亮色 | 暗色 |
| --- | --- | --- |
| `--radius` | `1rem` | 同 |
| `--primary` | `oklch(0.692 0.141 243.716)` 蓝 | `oklch(0.54 0.142 248.516)` |
| `--background` | `oklch(1 0 0)` | `oklch(0.235 0 0)` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.965 0 0)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.285 0 0)` |
| `--border` | `oklch(0.93 0 0)` | `oklch(1 0 0 / 10%)` |
| `--muted-foreground` | `oklch(0.49 0 0)` | `oklch(0.78 0 0)` |
| 字体 | `--font-body`=`Public Sans` | 同 |

## 新值 MD5（= 仓库 `docs/legal/daoxe-*.html`，与库内逐字节一致）

| 键 | 新值 MD5(UTF-8) |
| --- | --- |
| `About` | `51d06bdcbbd7d74e573f361ebebb3489` |
| `legal.user_agreement` | `40ea1e3b211411c11bced2dc40cfa9c1` |
| `legal.privacy_policy` | `742d6dfd7a3b95818679786550868ac2` |

- 应用脚本：`apply-restyle-20260720.sql`（事务式）。容器未重启：`StartedAt` 恒为 `2026-07-18T22:54:09.733926824Z`，`RestartCount=0`。

## 备份与回滚（免重启，≤60s 生效）

本目录 `*.b64`/`*.html` = **本轮改动前**（round-2：旧自造调色板的双语版）精确值，MD5：

| 键 | round-2 值 MD5 |
| --- | --- |
| `About` | `cb1be42a77a54bc7b94bac08715f7b9d` |
| `legal.user_agreement` | `d2e7e79008de00b9f9e43cd9c7b1e037` |
| `legal.privacy_policy` | `075dcab38ab09b3068ad24b8557060c5` |

回滚到 round-2（旧样式双语）：

```bash
cat restore-to-round2-20260720.sql | ssh root@<server> \
  "docker exec -i postgres-main psql -U postgres -d new2api -v ON_ERROR_STOP=1 -f -"
```

更早版本回滚：`../server-backup-20260720-bilingual/restore-to-round1-20260720.sql`（中文单语）、`../server-backup-20260720/restore-20260720.sql`（最初原版）。

> 本目录不含服务器口令；执行时自行提供 SSH 凭据。切勿重启任何容器。
