import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BasePills,
  Callout,
  CodeBlock,
  Page,
  PrerequisiteKey,
  Shot,
  Steps,
  useLiveBases,
} from '@/components/DocUI'
import { pickLang, useI18n } from '@/i18n'
import { clientGuides, type B, type L, type LStr } from './client-guides'

export { clientGuides }
export type { ClientGuide, GuideShot, B, L, LStr } from './client-guides'

/** Renders one client guide with live base URLs and multilingual copy. */
export function ClientGuidePage({ id }: { id: string }) {
  const g = clientGuides[id]
  const { t, lang } = useI18n()
  const { bases } = useLiveBases()
  const primary = bases[0]
  const b: B = { root: primary.url, v1: primary.openai }
  const l = (v: L) => pickLang(lang, v)
  const localized = (v: LStr) => pickLang(lang, v)

  return (
    <Page title={g.name} lead={localized(g.lead)}>
      <PrerequisiteKey />
      {g.builtIn ? (
        <Callout title={pickLang(lang, { zh: '官方内置', en: 'Built-in provider', ru: 'Встроенный провайдер', vi: 'Tích hợp sẵn' })}>
          {pickLang(lang, {
            zh: (
              <>
                DaoXE 已合并进该客户端官方版本，Base URL 内置且固定 —— 不需要（也不应该）手动填写地址，只需 API
                Key。
              </>
            ),
            en: (
              <>
                DaoXE ships in this client's official build with a pinned Base URL — there's nothing to fill in
                besides your API key.
              </>
            ),
            ru: (
              <>
                DaoXE входит в официальную сборку этого клиента с зафиксированным Base URL — заполнять нужно только
                ваш API-ключ.
              </>
            ),
            vi: (
              <>
                DaoXE đã có trong bản chính thức của client này với Base URL cố định — chỉ cần điền API key của
                bạn.
              </>
            ),
          })}
        </Callout>
      ) : (
        <BasePills openai={!g.rootBase} />
      )}

      <h2>{t('client.install')}</h2>
      <p>{l(g.install)}</p>

      <h2>{t('client.steps')}</h2>
      <Steps items={g.steps(b).map((s) => l(s))} />
      {g.code?.(b).map((c, i) => <CodeBlock key={i} lang={c.lang} code={c.code} />)}

      <h2>{t('client.models')}</h2>
      <p>{l(g.models)}</p>

      <h2>{t('client.pitfalls')}</h2>
      <ul>
        {g.pitfalls(b).map((p, i) => (
          <li key={i}>{l(p)}</li>
        ))}
      </ul>

      {g.shots?.length ? (
        <>
          <h2>{t('client.screenshot')}</h2>
          {g.shots.map((s) => (
            <Shot key={s.src} src={s.src} alt={s.alt} caption={localized(s.caption)} />
          ))}
        </>
      ) : null}

      <h2>{t('client.related')}</h2>
      <ul>
        <li>
          <Link to="/guide/multi-protocol">{t('toc.protocol')}</Link>
        </li>
        <li>
          <Link to="/guide/verify">{t('toc.verify')}</Link>
        </li>
        <li>
          <Link to="/guide/errors">{t('toc.errors')}</Link>
        </li>
      </ul>
    </Page>
  )
}

/** CC Switch — the fully-illustrated exemplar chapter (real screenshots). */
export function CcSwitchPage() {
  const { t, lang } = useI18n()
  const { bases } = useLiveBases()
  const primary = bases[0]

  return (
    <Page
      title={pickLang(lang, {
        zh: 'CC Switch 图形配置',
        en: 'CC Switch (GUI)',
        ru: 'CC Switch (графический)',
        vi: 'CC Switch (giao diện)',
      })}
      lead={pickLang(lang, {
        zh: '用 CC Switch 图形界面管理 Claude Code / Codex 的供应商配置，一键切换、不改文件。',
        en: 'Manage Claude Code / Codex provider configs with the CC Switch GUI — switch with one click, no file edits.',
        ru: 'Управляйте конфигами провайдеров Claude Code / Codex через графический CC Switch — переключение в один клик, без правки файлов.',
        vi: 'Quản lý cấu hình nhà cung cấp cho Claude Code / Codex bằng giao diện CC Switch — chuyển đổi một cú nhấp, không sửa file.',
      })}
    >
      <Callout title={pickLang(lang, { zh: '适合谁', en: 'Who this is for', ru: 'Кому подходит', vi: 'Dành cho ai' })}>
        {pickLang(lang, {
          zh: (
            <>
              不想手改 <code>settings.json</code> / <code>config.toml</code>，或需要在多个供应商之间来回切换的桌面用户。手动配置见{' '}
              <Link to="/guide/claude-code">Claude Code</Link> 与 <Link to="/guide/codex">Codex CLI</Link>。
            </>
          ),
          en: (
            <>
              Desktop users who'd rather not hand-edit <code>settings.json</code> / <code>config.toml</code>, or who
              switch between providers often. Manual setup: <Link to="/guide/claude-code">Claude Code</Link> and{' '}
              <Link to="/guide/codex">Codex CLI</Link>.
            </>
          ),
          ru: (
            <>
              Настольные пользователи, которым не хочется вручную править <code>settings.json</code> /{' '}
              <code>config.toml</code> или которые часто переключаются между провайдерами. Ручная настройка:{' '}
              <Link to="/guide/claude-code">Claude Code</Link> и <Link to="/guide/codex">Codex CLI</Link>.
            </>
          ),
          vi: (
            <>
              Người dùng desktop không muốn tự sửa <code>settings.json</code> / <code>config.toml</code>, hoặc hay
              chuyển đổi giữa nhiều nhà cung cấp. Cấu hình thủ công:{' '}
              <Link to="/guide/claude-code">Claude Code</Link> và <Link to="/guide/codex">Codex CLI</Link>.
            </>
          ),
        })}
      </Callout>

      <h2>{t('client.install')}</h2>
      <p>
        {pickLang(lang, {
          zh: (
            <>
              下载：
              <a
                href="https://github.com/farion1231/cc-switch/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
              >
                cc-switch Releases
              </a>
              。Windows 用 <code>.msi</code>；macOS 可 <code>brew install --cask cc-switch</code>；Linux 桌面用{' '}
              <code>.deb</code> / <code>.rpm</code> / AppImage。
            </>
          ),
          en: (
            <>
              Download from{' '}
              <a
                href="https://github.com/farion1231/cc-switch/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
              >
                cc-switch Releases
              </a>
              . Windows: <code>.msi</code>; macOS: <code>brew install --cask cc-switch</code>; Linux desktop:{' '}
              <code>.deb</code> / <code>.rpm</code> / AppImage.
            </>
          ),
          ru: (
            <>
              Скачать:{' '}
              <a
                href="https://github.com/farion1231/cc-switch/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
              >
                cc-switch Releases
              </a>
              . Windows: <code>.msi</code>; macOS: <code>brew install --cask cc-switch</code>; Linux desktop:{' '}
              <code>.deb</code> / <code>.rpm</code> / AppImage.
            </>
          ),
          vi: (
            <>
              Tải:{' '}
              <a
                href="https://github.com/farion1231/cc-switch/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
              >
                cc-switch Releases
              </a>
              . Windows: <code>.msi</code>; macOS: <code>brew install --cask cc-switch</code>; Linux desktop:{' '}
              <code>.deb</code> / <code>.rpm</code> / AppImage.
            </>
          ),
        })}
      </p>

      <h2>{t('client.steps')}</h2>
      <Steps
        items={pickLang(lang, {
          zh: [
            <>顶部切到目标应用（Claude / Codex 图标），点右上角「+」添加供应商。</>,
            <>
              填写表单：名称随意（如 <code>DaoXE</code>）；<strong>请求地址</strong>按协议填 —— Claude Code 填站点根{' '}
              <code>{primary.url}</code>（兼容 Claude API 的端点，<strong>不要以斜杠结尾</strong>）；Codex 填{' '}
              <code>{primary.openai}</code>；API Key 填 <code>sk-xxxx</code>。
            </>,
            <>高级选项与配置 JSON 一般保持默认，点「添加」保存。</>,
            <>在列表中点该条目的「启用」，状态变为「使用中」才算生效。</>,
            <>
              新开终端运行 <code>claude</code> 或 <code>codex</code> 验证；不通先{' '}
              <Link to="/guide/verify">curl</Link>。
            </>,
          ],
          en: [
            <>Switch to the target app (Claude / Codex icon) at the top, click the «+» button to add a provider.</>,
            <>
              Fill the form: any name (e.g. <code>DaoXE</code>); <strong>request URL</strong> depends on the
              protocol — Claude Code takes the site root <code>{primary.url}</code> (Claude-compatible endpoint,{' '}
              <strong>no trailing slash</strong>); Codex takes <code>{primary.openai}</code>; API Key ={' '}
              <code>sk-xxxx</code>.
            </>,
            <>Leave advanced options / config JSON at defaults and click «Add».</>,
            <>Click «Enable» on the new entry — it only takes effect once marked as in use.</>,
            <>
              Verify in a fresh terminal with <code>claude</code> or <code>codex</code>; if it fails,{' '}
              <Link to="/guide/verify">curl</Link> first.
            </>,
          ],
          ru: [
            <>Вверху переключитесь на нужное приложение (значок Claude / Codex), нажмите «+», чтобы добавить провайдера.</>,
            <>
              Заполните форму: любое имя (например, <code>DaoXE</code>); <strong>адрес запроса</strong> зависит от
              протокола — для Claude Code это корень сайта <code>{primary.url}</code> (эндпоинт, совместимый с
              Claude API, <strong>без слеша в конце</strong>); для Codex — <code>{primary.openai}</code>; API Key
              = <code>sk-xxxx</code>.
            </>,
            <>Расширенные опции / JSON-конфиг оставьте по умолчанию и нажмите «Add».</>,
            <>Нажмите «Enable» у новой записи — она действует только со статусом «в использовании».</>,
            <>
              Проверьте в новом терминале командой <code>claude</code> или <code>codex</code>; если не работает,
              сначала <Link to="/guide/verify">curl</Link>.
            </>,
          ],
          vi: [
            <>Ở trên cùng, chuyển sang ứng dụng mục tiêu (biểu tượng Claude / Codex), bấm «+» để thêm nhà cung cấp.</>,
            <>
              Điền form: tên tùy ý (ví dụ <code>DaoXE</code>); <strong>địa chỉ request</strong> tùy giao thức —
              Claude Code dùng gốc site <code>{primary.url}</code> (endpoint tương thích Claude API,{' '}
              <strong>không có dấu gạch chéo cuối</strong>); Codex dùng <code>{primary.openai}</code>; API Key ={' '}
              <code>sk-xxxx</code>.
            </>,
            <>Tùy chọn nâng cao / JSON cấu hình để mặc định rồi bấm «Add».</>,
            <>Bấm «Enable» ở mục mới — chỉ có hiệu lực khi trạng thái là đang dùng.</>,
            <>
              Kiểm tra trong terminal mới bằng <code>claude</code> hoặc <code>codex</code>; nếu lỗi thì{' '}
              <Link to="/guide/verify">curl</Link> trước.
            </>,
          ],
        })}
      />

      <Shot
        src="/images/guide/daoxe/11-cc-switch-main.webp"
        alt="CC Switch main window with add button"
        caption={pickLang(lang, {
          zh: 'CC Switch 主界面 · 右上角「+」添加供应商（实拍）',
          en: 'CC Switch main window · «+» adds a provider',
          ru: 'Главное окно CC Switch · «+» добавляет провайдера',
          vi: 'Cửa sổ chính CC Switch · «+» để thêm nhà cung cấp',
        })}
      />
      <Shot
        src="/images/guide/daoxe/12-cc-switch-add-daoxe.webp"
        alt="CC Switch add provider form filled with DaoXE"
        caption={pickLang(lang, {
          zh: '添加供应商表单 · 请求地址填兼容 Claude API 的站点根，不要以斜杠结尾（实拍）',
          en: 'Add-provider form · request URL is the Claude-compatible site root, no trailing slash',
          ru: 'Форма добавления провайдера · адрес запроса — совместимый с Claude API корень сайта, без слеша в конце',
          vi: 'Form thêm nhà cung cấp · địa chỉ request là gốc site tương thích Claude API, không có gạch chéo cuối',
        })}
      />
      <Shot
        src="/images/guide/daoxe/13-cc-switch-active.webp"
        alt="CC Switch provider enabled and in use"
        caption={pickLang(lang, {
          zh: '启用后状态变为「使用中」（实拍）',
          en: 'After enabling, the entry shows as in use',
          ru: 'После включения запись отображается как «в использовании»',
          vi: 'Sau khi bật, mục hiển thị là đang dùng',
        })}
      />

      <h2>{t('client.pitfalls')}</h2>
      <ul>
        {pickLang(lang, {
          zh: (
            <>
              <li>
                请求地址结尾不要带 <code>/</code>；Claude 与 Codex 的地址不同（根地址 vs <code>/v1</code>），别混填。
              </li>
              <li>添加后忘记点「启用」是最常见问题——状态必须是「使用中」。</li>
              <li>切换供应商后要新开终端，旧会话仍用旧配置。</li>
            </>
          ),
          en: (
            <>
              <li>
                No trailing <code>/</code> in the request URL; Claude and Codex use different bases (root vs{' '}
                <code>/v1</code>) — don't mix them up.
              </li>
              <li>Forgetting to click «Enable» after adding is the top issue — the entry must show as in use.</li>
              <li>Open a new terminal after switching; old sessions keep the old config.</li>
            </>
          ),
          ru: (
            <>
              <li>
                Никакого <code>/</code> в конце адреса запроса; у Claude и Codex адреса разные (корень против{' '}
                <code>/v1</code>) — не путайте их.
              </li>
              <li>Забыть нажать «Enable» после добавления — самая частая проблема; запись должна быть «в использовании».</li>
              <li>После переключения провайдера откройте новый терминал; старые сессии сохраняют старую конфигурацию.</li>
            </>
          ),
          vi: (
            <>
              <li>
                Không có <code>/</code> ở cuối địa chỉ request; Claude và Codex dùng base khác nhau (gốc so với{' '}
                <code>/v1</code>) — đừng nhầm.
              </li>
              <li>Quên bấm «Enable» sau khi thêm là lỗi hay gặp nhất — mục phải hiển thị là đang dùng.</li>
              <li>Sau khi chuyển nhà cung cấp, hãy mở terminal mới; phiên cũ vẫn giữ cấu hình cũ.</li>
            </>
          ),
        })}
      </ul>

      <h2>{t('client.related')}</h2>
      <ul>
        <li>
          <Link to="/guide/claude-code">Claude Code</Link>
        </li>
        <li>
          <Link to="/guide/codex">Codex CLI</Link>
        </li>
        <li>
          <Link to="/guide/verify">{t('toc.verify')}</Link>
        </li>
      </ul>
    </Page>
  )
}

/** Page renderers to merge into the main content registry. */
export const clientGuidePages: Record<string, () => ReactNode> = Object.fromEntries(
  Object.keys(clientGuides).map((id) => [id, () => <ClientGuidePage id={id} />])
)
clientGuidePages['cc-switch'] = () => <CcSwitchPage />
