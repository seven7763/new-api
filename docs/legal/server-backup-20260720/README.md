# DaoXE 法务/关于页面 变更与回滚记录 — 2026-07-20

## 变更对象（生产库 `new2api` @ 容器 `postgres-main`，表 `options`）

| option 键 | 页面 | 公开接口 | 前端渲染 |
| --- | --- | --- | --- |
| `About` | 关于 | `GET /api/about` | 检测为 HTML → 隔离 Shadow DOM 渲染 |
| `legal.user_agreement` | 用户协议 | `GET /api/user-agreement` | 同上 |
| `legal.privacy_policy` | 隐私政策 | `GET /api/privacy-policy` | 同上 |

后端 `main.go` 启动 `go model.SyncOptions(SYNC_FREQUENCY)`（本机未设该环境变量，默认 **60 秒**），
周期性从 `options` 表重载入内存 `OptionMap` / 分层配置。**直接改库即可在 ≤60s 内免重启生效**，无需管理员 token、与 Redis 无关。

## 备份（改动前原值，MD5 已与线上逐字节核对一致）

| 键 | 原值 MD5(UTF-8) | 文件 |
| --- | --- | --- |
| `About` | `0f47074c681cdece48286a203e020307` | `About.html` / `About.b64` |
| `legal.user_agreement` | `d48ee27baadabfe375bc3bc8e31f12a8` | `legal.user_agreement.html` / `.b64` |
| `legal.privacy_policy` | `129bc943b0e84d32cc3895a1632ea209` | `legal.privacy_policy.html` / `.b64` |
| `Footer`（未改动，仅备份） | `11e8e4c96a5ffcde74202317811a642b` | `Footer.html` / `.b64` |

## 已写入的新值 MD5（= 仓库 `docs/legal/daoxe-*.html`）

| 键 | 新值 MD5(UTF-8) |
| --- | --- |
| `About` | `2f4cc26dddcc0f3a8de8338bd82d20a2` |
| `legal.user_agreement` | `def37d256a2fd075519e278b753eb5a5` |
| `legal.privacy_policy` | `365a93c7007294771212551c4f332968` |

- 应用脚本：`apply-20260720.sql`（事务式，3 条 UPDATE，base64 内联，避免转义损坏）
- 应用方式：`cat apply-20260720.sql | ssh root@<server> "docker exec -i postgres-main psql -U postgres -d new2api -v ON_ERROR_STOP=1 -f -"`
- 容器未重启证据：应用前后 `docker inspect --format '{{.State.StartedAt}}' new2api-green` 均为 `2026-07-18T22:54:09.733926824Z`，`RestartCount=0`。

## 回滚（同样免重启，≤60s 生效）

`restore-20260720.sql` 会把三项还原为改动前的原值：

```bash
cat restore-20260720.sql | ssh root@<server> \
  "docker exec -i postgres-main psql -U postgres -d new2api -v ON_ERROR_STOP=1 -f -"
```

回滚后校验（应回到原值 MD5）：

```bash
ssh root@<server> "docker exec postgres-main psql -U postgres -d new2api -t -A -F '  ' \
  -c \"SELECT key, md5(convert_to(value,'UTF8')) FROM options \
      WHERE key IN ('About','legal.user_agreement','legal.privacy_policy') ORDER BY key\""
```

> 安全说明：本目录不保存任何服务器口令；请在执行时自行提供 SSH 凭据（如通过 `sshpass`/密钥）。
> 切勿 `docker restart/stop` 任何容器——本方案全程无需重启即可生效与回滚。
