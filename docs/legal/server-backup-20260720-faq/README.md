# FAQ 面板旧 Gmail 替换（2026-07-20，round 5）

只做一件事：把后台 FAQ 里残留的旧邮箱 `cabesalberto36216@gmail.com` 改为 `support@daoxe.com`。免重启。

## 定位
- 承载 FAQ 的 option 键：**`console_setting.faq`**（`setting/console_setting/config.go` 中 `FAQ string json:"faq"`，值为 JSON 数组字符串；`/api/status` 经 `GetFAQ()` 暴露为 `faq`）。
- 全库扫描：`SELECT ... WHERE value LIKE '%cabesalberto36216%'` → **仅** `console_setting.faq` 命中，且只出现 **1 次**（在 `faq[13].answer` 客服联系条目）。无其它 option 残留。

## 变更
- 仅将该 1 处邮箱字符串替换为 `support@daoxe.com`；**其它字段与 JSON 结构完全不变**（数组仍 14 项，`json.loads` 校验通过）。
- 应用：`apply-faq-20260720.sql`（单条事务 UPDATE，base64 经 stdin 灌入）。

| | MD5(UTF-8) | 说明 |
| --- | --- | --- |
| 改前 | `5a37f02a1c02d7a5929a2f8caf7a8690` | `console_setting.faq.json` / `.b64` |
| 改后 | `6b612ac3355380cb34eb3b90116c9b9b` | `console_setting.faq.new.json` |

## 回滚（免重启，≤60s 生效）
```bash
cat restore-faq-20260720.sql | ssh root@<server> \
  "docker exec -i postgres-main psql -U postgres -d new2api -v ON_ERROR_STOP=1 -f -"
```

## 验证结果
- 服务端 `console_setting.faq` md5 = `6b612ac3…`（与本地一致）；`value LIKE '%support@daoxe.com%'`=t、`LIKE '%cabesalberto36216%'`=f；全库含旧 Gmail 的 option 数 = 0。
- `/api/status` 的 `faq` 共 14 项，`faq[13].answer` 已显示 `support@daoxe.com`，无旧 Gmail，JSON 合法（免重启生效）。
- 容器未重启：`StartedAt` 恒为 `2026-07-18T22:54:09.733926824Z`，`RestartCount=0`。

> 本目录不含服务器口令。未改任何前端文件、未做全站页脚、未重启任何容器/nginx。
