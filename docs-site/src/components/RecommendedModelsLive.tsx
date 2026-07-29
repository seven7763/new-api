import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { apiUrl } from '@/config'
import { pickLang, useI18n } from '@/i18n'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Callout, Page } from '@/components/DocUI'
import { Link } from 'react-router-dom'

type PricingModel = {
  model_name: string
  description?: string
  tags?: string
  vendor_id?: number
  model_ratio?: number
  completion_ratio?: number
  enable_groups?: string[]
  supported_endpoint_types?: string[]
  quota_type?: number
  model_price?: number
}

type PricingResponse = {
  success?: boolean
  data?: PricingModel[]
  usable_group?: Record<string, string>
  group_ratio?: Record<string, number>
  supported_endpoint?: Record<string, { path?: string; method?: string }>
  vendors?: { id: number; name: string }[]
  pricing_version?: string
}

const FAMILY_RULES: { family: string; test: (id: string) => boolean; limit: number }[] = [
  {
    family: 'GPT / Codex',
    test: (id) => /^(gpt-|o[1-9]|chatgpt)/i.test(id) || /codex/i.test(id),
    limit: 8,
  },
  {
    family: 'Claude',
    test: (id) => id.startsWith('claude'),
    limit: 8,
  },
  {
    family: 'Gemini',
    test: (id) => id.toLowerCase().includes('gemini'),
    limit: 6,
  },
  {
    family: 'DeepSeek',
    test: (id) => id.toLowerCase().includes('deepseek'),
    limit: 4,
  },
  {
    family: 'Grok',
    test: (id) => id.toLowerCase().includes('grok'),
    limit: 4,
  },
  {
    family: 'Embedding',
    test: (id) => /embed/i.test(id),
    limit: 6,
  },
]

function scoreModel(m: PricingModel) {
  const id = m.model_name || ''
  let s = 0
  if (/latest|preview|5\.|sonnet-4|opus-4|gemini-2\.5|gemini-3|deepseek-v|grok-4|gpt-5/i.test(id)) s += 5
  if (id.endsWith('-c')) s -= 4
  if ((m.enable_groups || []).includes('default')) s += 1
  if ((m.tags || '').includes('对话') || (m.tags || '').includes('嵌入')) s += 1
  // prefer broader groups
  s += Math.min((m.enable_groups || []).length, 4) * 0.2
  return s
}

function pickFamily(models: PricingModel[], test: (id: string) => boolean, limit: number) {
  return models
    .filter((m) => test(m.model_name || ''))
    .sort((a, b) => scoreModel(b) - scoreModel(a) || (a.model_name || '').localeCompare(b.model_name || ''))
    .slice(0, limit)
}

export function RecommendedModelsLive() {
  const { t, lang } = useI18n()
  const tx = pickLang(lang, {
    zh: {
      title: '推荐模型表',
      lead: '根据站点公开定价接口实时同步。只展示当前接口返回的模型与分组——没有的不会出现在表里。',
      dataSource: '数据源',
      totalModels: (n: number) => `全量 ${n} 个模型`,
      fullBrowsePrefix: '。完整浏览也可打开 ',
      marketplace: '模型广场',
      period: '。',
      searchPlaceholder: '搜索模型 / 分组 / 标签',
      allPicks: '全部推荐',
      loadFailHint: '可点击刷新重试，或直接查看',
      curatedHeading: '推荐入口（接口实时抽样）',
      curatedPrefix: '按系列从全量列表中挑选常用入口（排除明显渠道后缀等），不是完整目录。当前筛选结果 ',
      curatedSuffix: ' 条。',
      colFamily: '系列',
      colModelId: '模型 ID',
      colGroups: '分组',
      colProtocols: '协议',
      colActions: '操作',
      noMatches: '没有匹配结果，试试清空搜索或换系列。',
      endpointsHeading: '站点支持的协议端点（接口返回）',
      colType: '类型',
      colMethodPath: '方法 / 路径',
      noEndpoint: '接口未返回 supported_endpoint',
      groupsHeading: '分组说明（接口 usable_group）',
      colGroup: '分组',
      colRatio: '倍率',
      colNotes: '说明',
      howToUse: '使用方式',
      howToUseText:
        '1）在表中复制模型 ID → 2）创建密钥时选择能覆盖该模型的分组 → 3）客户端 / API 填入 ID。概念说明见 ',
      modelsAndGroups: '模型与分组',
    },
    en: {
      title: 'Recommended models',
      lead: "Synced live from the site's public pricing API. Only models and groups returned by the API appear here.",
      dataSource: 'Data source',
      totalModels: (n: number) => `${n} models total`,
      fullBrowsePrefix: '. Full catalog: ',
      marketplace: 'Model Marketplace',
      period: '.',
      searchPlaceholder: 'Search models / groups / tags',
      allPicks: 'All picks',
      loadFailHint: 'Retry with refresh, or open the ',
      curatedHeading: 'Curated picks (live sample)',
      curatedPrefix:
        'Common entries picked per family from the full list — not a complete catalog. Current filter: ',
      curatedSuffix: ' rows.',
      colFamily: 'Family',
      colModelId: 'Model ID',
      colGroups: 'Groups',
      colProtocols: 'Protocols',
      colActions: 'Actions',
      noMatches: 'No matches — clear the search or switch family.',
      endpointsHeading: 'Supported protocol endpoints (from API)',
      colType: 'Type',
      colMethodPath: 'Method / path',
      noEndpoint: 'API returned no supported_endpoint',
      groupsHeading: 'Groups (from usable_group)',
      colGroup: 'Group',
      colRatio: 'Ratio',
      colNotes: 'Notes',
      howToUse: 'How to use',
      howToUseText:
        '1) Copy a model ID from the table → 2) create a key in a group that covers it → 3) paste the ID into your client / API call. Concepts: ',
      modelsAndGroups: 'Models & groups',
    },
    ru: {
      title: 'Каталог моделей',
      lead: 'Синхронизируется в реальном времени из публичного API цен сайта. Показаны только модели и группы, которые возвращает API — чего нет, того нет в таблице.',
      dataSource: 'Источник данных',
      totalModels: (n: number) => `всего ${n} моделей`,
      fullBrowsePrefix: '. Полный каталог: ',
      marketplace: 'Витрина моделей',
      period: '.',
      searchPlaceholder: 'Поиск моделей / групп / тегов',
      allPicks: 'Все подборки',
      loadFailHint: 'Обновите для повтора или откройте ',
      curatedHeading: 'Подборка (live-выборка из API)',
      curatedPrefix:
        'Частые модели, выбранные по семействам из полного списка (без явных суффиксов каналов) — это не полный каталог. Текущий фильтр: ',
      curatedSuffix: ' строк.',
      colFamily: 'Семейство',
      colModelId: 'ID модели',
      colGroups: 'Группы',
      colProtocols: 'Протоколы',
      colActions: 'Действия',
      noMatches: 'Ничего не найдено — очистите поиск или смените семейство.',
      endpointsHeading: 'Поддерживаемые эндпоинты протоколов (из API)',
      colType: 'Тип',
      colMethodPath: 'Метод / путь',
      noEndpoint: 'API не вернул supported_endpoint',
      groupsHeading: 'Группы (из usable_group)',
      colGroup: 'Группа',
      colRatio: 'Коэффициент',
      colNotes: 'Примечания',
      howToUse: 'Как использовать',
      howToUseText:
        '1) Скопируйте ID модели из таблицы → 2) создайте ключ в группе, покрывающей её → 3) вставьте ID в клиент / вызов API. Понятия: ',
      modelsAndGroups: 'Модели и группы',
    },
    vi: {
      title: 'Bảng mô hình',
      lead: 'Đồng bộ thời gian thực từ API giá công khai của trang. Chỉ hiển thị mô hình và nhóm mà API trả về — cái gì không có sẽ không xuất hiện trong bảng.',
      dataSource: 'Nguồn dữ liệu',
      totalModels: (n: number) => `tổng ${n} mô hình`,
      fullBrowsePrefix: '. Danh mục đầy đủ: ',
      marketplace: 'Sàn mô hình',
      period: '.',
      searchPlaceholder: 'Tìm mô hình / nhóm / thẻ',
      allPicks: 'Tất cả đề xuất',
      loadFailHint: 'Nhấn làm mới để thử lại, hoặc mở ',
      curatedHeading: 'Đề xuất (mẫu thời gian thực từ API)',
      curatedPrefix:
        'Các mục thường dùng chọn theo họ từ danh sách đầy đủ (bỏ các hậu tố kênh rõ ràng) — không phải danh mục đầy đủ. Bộ lọc hiện tại: ',
      curatedSuffix: ' dòng.',
      colFamily: 'Họ',
      colModelId: 'ID mô hình',
      colGroups: 'Nhóm',
      colProtocols: 'Giao thức',
      colActions: 'Hành động',
      noMatches: 'Không có kết quả — xóa tìm kiếm hoặc đổi họ.',
      endpointsHeading: 'Endpoint giao thức được hỗ trợ (từ API)',
      colType: 'Loại',
      colMethodPath: 'Phương thức / đường dẫn',
      noEndpoint: 'API không trả về supported_endpoint',
      groupsHeading: 'Nhóm (từ usable_group)',
      colGroup: 'Nhóm',
      colRatio: 'Hệ số',
      colNotes: 'Ghi chú',
      howToUse: 'Cách dùng',
      howToUseText:
        '1) Sao chép ID mô hình từ bảng → 2) tạo key trong nhóm bao phủ nó → 3) dán ID vào client / lệnh gọi API. Khái niệm: ',
      modelsAndGroups: 'Mô hình & nhóm',
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<PricingResponse | null>(null)
  const [q, setQ] = useState('')
  const [family, setFamily] = useState<string>('ALL')
  const [copied, setCopied] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    fetch(apiUrl('/api/pricing'), { headers: { Accept: 'application/json' } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json: PricingResponse) => {
        if (!json || json.success === false || !Array.isArray(json.data)) {
          throw new Error('bad pricing response')
        }
        setData(json)
      })
      .catch((e: Error) => setError(e.message || 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const vendors = useMemo(() => {
    const map = new Map<number, string>()
    ;(data?.vendors || []).forEach((v) => map.set(v.id, v.name))
    return map
  }, [data])

  const recommended = useMemo(() => {
    const models = data?.data || []
    const rows: { family: string; model: PricingModel }[] = []
    for (const rule of FAMILY_RULES) {
      for (const m of pickFamily(models, rule.test, rule.limit)) {
        rows.push({ family: rule.family, model: m })
      }
    }
    return rows
  }, [data])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return recommended.filter(({ family: f, model: m }) => {
      if (family !== 'ALL' && f !== family) return false
      if (!qq) return true
      const hay = `${m.model_name} ${m.tags || ''} ${(m.enable_groups || []).join(' ')} ${
        vendors.get(m.vendor_id || -1) || ''
      }`.toLowerCase()
      return hay.includes(qq)
    })
  }, [recommended, q, family, vendors])

  const groups = data?.usable_group || {}
  const groupRatio = data?.group_ratio || {}
  const endpoints = data?.supported_endpoint || {}
  const total = data?.data?.length || 0

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(id)
      setTimeout(() => setCopied(''), 1200)
    } catch {
      /* ignore */
    }
  }

  return (
    <Page title={tx.title} lead={tx.lead}>
      <Callout title={tx.dataSource}>
        <code>GET {apiUrl('/api/pricing')}</code>
        {data?.pricing_version ? (
          <>
            {' '}
            · version <code className="break-all">{data.pricing_version.slice(0, 12)}…</code>
          </>
        ) : null}
        {total ? <> · {tx.totalModels(total)}</> : null}
        {tx.fullBrowsePrefix}
        <a href="https://daoxe.com/pricing" target="_blank" rel="noopener noreferrer">
          {tx.marketplace}
        </a>
        {tx.period}
      </Callout>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="border-border bg-card focus-within:ring-ring/40 flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tx.searchPlaceholder}
            className="placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          className="border-border bg-card focus-visible:ring-ring/40 rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2"
        >
          <option value="ALL">{tx.allPicks}</option>
          {FAMILY_RULES.map((f) => (
            <option key={f.family}>{f.family}</option>
          ))}
        </select>
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          {t('common.refresh')}
        </Button>
      </div>

      {loading && (
        <div className="text-muted-foreground flex items-center gap-2 py-10 text-sm">
          <Loader2 className="size-4 animate-spin" /> {t('live.sync')}
        </div>
      )}

      {!loading && error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive mb-4 flex items-start gap-2 rounded-xl border px-3 py-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            {t('live.loadFail')}: {error}.{' '}
            {tx.loadFailHint}
            <a href="https://daoxe.com/pricing" target="_blank" rel="noopener noreferrer">
              {tx.marketplace}
            </a>
            {tx.period}
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <h2>{tx.curatedHeading}</h2>
          <p className="text-muted-foreground text-sm">
            {tx.curatedPrefix}
            <strong className="text-foreground">{filtered.length}</strong>
            {tx.curatedSuffix}
          </p>
          <div className="table-wrap">
            <table className="w-full min-w-[720px] border-collapse text-[0.86rem]">
              <thead>
                <tr className="bg-muted/80 text-muted-foreground text-left text-xs">
                  <th className="px-3 py-2.5 font-semibold">{tx.colFamily}</th>
                  <th className="px-3 py-2.5 font-semibold">{tx.colModelId}</th>
                  <th className="px-3 py-2.5 font-semibold">{tx.colGroups}</th>
                  <th className="px-3 py-2.5 font-semibold">{tx.colProtocols}</th>
                  <th className="px-3 py-2.5 font-semibold">{tx.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ family: f, model: m }) => (
                  <tr key={`${f}-${m.model_name}`} className="border-border border-t">
                    <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">{f}</td>
                    <td className="px-3 py-2.5">
                      <code className="text-[0.8rem] break-all">{m.model_name}</code>
                      {m.tags ? (
                        <div className="mt-1">
                          <Badge variant="secondary">{m.tags}</Badge>
                        </div>
                      ) : null}
                    </td>
                    <td className="text-muted-foreground px-3 py-2.5">
                      {(m.enable_groups || []).slice(0, 4).join(', ') || '—'}
                      {(m.enable_groups || []).length > 4 ? '…' : ''}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {(m.supported_endpoint_types || []).map((e) => (
                          <Badge key={e} variant="outline" className="font-mono text-[10px]">
                            {e}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={() => copyId(m.model_name)}
                      >
                        {copied === m.model_name ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                        {copied === m.model_name ? t('common.copied') : `${t('common.copy')} ID`}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={5} className="text-muted-foreground px-3 py-8 text-center">
                      {tx.noMatches}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h2>{tx.endpointsHeading}</h2>
          <table>
            <thead>
              <tr>
                <th>{tx.colType}</th>
                <th>{tx.colMethodPath}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(endpoints).map(([k, v]) => (
                <tr key={k}>
                  <td>
                    <code>{k}</code>
                  </td>
                  <td>
                    <code>
                      {v?.method || '—'} {v?.path || ''}
                    </code>
                  </td>
                </tr>
              ))}
              {!Object.keys(endpoints).length && (
                <tr>
                  <td colSpan={2}>{tx.noEndpoint}</td>
                </tr>
              )}
            </tbody>
          </table>

          <h2>{tx.groupsHeading}</h2>
          <table>
            <thead>
              <tr>
                <th>{tx.colGroup}</th>
                <th>{tx.colRatio}</th>
                <th>{tx.colNotes}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groups).map(([g, note]) => (
                <tr key={g}>
                  <td>
                    <code>{g}</code>
                  </td>
                  <td>{groupRatio[g] ?? '—'}</td>
                  <td className="text-muted-foreground">{note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Callout title={tx.howToUse}>
            {tx.howToUseText}
            <Link to="/guide/models">{tx.modelsAndGroups}</Link>
            {tx.period}
          </Callout>
        </>
      )}
    </Page>
  )
}
