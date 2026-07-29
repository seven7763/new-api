# DaoXE 关于/协议/隐私 —— 中英双语上线与回滚记录（2026-07-20，round 2）

本轮把三处内容升级为**中英双语单文件**（纯 CSS 语言切换，无 JS），免重启上线。

## 变更对象（库 `new2api` @ 容器 `postgres-main`，表 `options`）

| option 键 | 页面 | 接口 |
| --- | --- | --- |
| `About` | 关于 / About | `GET /api/about` |
| `legal.user_agreement` | 用户协议 / Terms | `GET /api/user-agreement` |
| `legal.privacy_policy` | 隐私政策 / Privacy | `GET /api/privacy-policy` |

## 双语切换方案（方案 A：纯 CSS，无脚本）

- 结构：`.dx-doc` 内含两个视觉隐藏的 `<input type="radio" name="dxlang-*">`（默认 `zh` 选中）、一个 `.dx-langbar`（两个 `<label for>` 作为「中文 / English」按钮）、以及并列的 `.dx-body.dx-zh` 与 `.dx-body.dx-en`。
- 切换：`.dx-body.dx-en { display:none }` 默认隐藏英文；`#dxl-*-en:checked ~ .dx-body.dx-en { display:block }` 与 `#dxl-*-en:checked ~ .dx-body.dx-zh { display:none }` 实现互斥显隐。全部为 CSS `:checked` 兄弟选择器，**不依赖 JS**。
- **消毒实测**：用前端同款 `dompurify@3.4.11` + `isolatedSanitizeOptions`（见 `web/default/src/components/html-content.tsx`）对三份最终稿做过 `DOMPurify.sanitize`，确认 `<style>`、2 个 radio（含 `checked`/`name`）、2 个 `label[for]`、`:checked ~ .dx-body` 规则、以及中英两段正文均保留，且默认 `zh` 选中。

## 新值 MD5（= 仓库 `docs/legal/daoxe-*.html`，与库内逐字节一致）

| 键 | 新值 MD5(UTF-8) |
| --- | --- |
| `About` | `cb1be42a77a54bc7b94bac08715f7b9d` |
| `legal.user_agreement` | `d2e7e79008de00b9f9e43cd9c7b1e037` |
| `legal.privacy_policy` | `075dcab38ab09b3068ad24b8557060c5` |

- 应用脚本：`apply-bilingual-20260720.sql`（事务式，3 条 UPDATE，base64 内联）。
- 容器未重启证据：应用前后 `docker inspect --format '{{.State.StartedAt}}' new2api-green` 均为 `2026-07-18T22:54:09.733926824Z`，`RestartCount=0`。

## 备份与回滚（均免重启，≤60s 生效）

本目录 `*.b64` / `*.html` 为**本轮改动前**（即 round-1 单语版）的精确值，MD5：

| 键 | round-1 值 MD5(UTF-8) |
| --- | --- |
| `About` | `2f4cc26dddcc0f3a8de8338bd82d20a2` |
| `legal.user_agreement` | `def37d256a2fd075519e278b753eb5a5` |
| `legal.privacy_policy` | `365a93c7007294771212551c4f332968` |

- 回滚到 **round-1 单语版**：

```bash
cat restore-to-round1-20260720.sql | ssh root@<server> \
  "docker exec -i postgres-main psql -U postgres -d new2api -v ON_ERROR_STOP=1 -f -"
```

- 回滚到**最初原版**（本 session 之前的线上值）：使用上一级目录
  `../server-backup-20260720/restore-20260720.sql`。

> 本目录不含任何服务器口令；执行时请自行提供 SSH 凭据。切勿 `docker restart/stop` 任何容器。
