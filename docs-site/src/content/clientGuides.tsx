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

/** Multilingual node: zh is the primary copy; en/ru/vi extend it (missing ru/vi fall back to en). */
type L = { zh: ReactNode; en: ReactNode; ru?: ReactNode; vi?: ReactNode }
/** Multilingual plain string, same fallback semantics as L. */
type LStr = { zh: string; en: string; ru?: string; vi?: string }
/** Live base URLs resolved from /api/status (falls back to siteConfig). */
type B = { root: string; v1: string }

type GuideShot = { src: string; alt: string; caption: LStr }

type ClientGuide = {
  name: string
  website: { label: string; href: string }
  lead: LStr
  install: L
  steps: (b: B) => L[]
  code?: (b: B) => { lang: string; code: string }[]
  models: L
  pitfalls: (b: B) => L[]
  shots?: GuideShot[]
  /** true → this client wants the site root (no /v1) as Base */
  rootBase?: boolean
  /** true → DaoXE is an official built-in provider in this client (no Base URL to fill) */
  builtIn?: boolean
}

const MODEL_LINKS: L = {
  zh: (
    <>
      模型 ID 必须与站内完全一致（区分大小写），从 <Link to="/guide/recommended-models">推荐模型表</Link> 或{' '}
      <code>GET /v1/models</code> 原样复制。分组不含该模型时会报 <code>403 / model not available</code>，见{' '}
      <Link to="/guide/models">模型与分组</Link>。
    </>
  ),
  en: (
    <>
      Model IDs must match the site exactly (case-sensitive). Copy them from the{' '}
      <Link to="/guide/recommended-models">recommended models table</Link> or <code>GET /v1/models</code>. If the
      key's group doesn't include the model you'll get <code>403 / model not available</code> — see{' '}
      <Link to="/guide/models">Models &amp; groups</Link>.
    </>
  ),
  ru: (
    <>
      ID модели должен точно совпадать с сайтом (с учётом регистра). Копируйте его из{' '}
      <Link to="/guide/recommended-models">каталога моделей</Link> или через <code>GET /v1/models</code>. Если
      группа ключа не включает модель, вернётся <code>403 / model not available</code> — см.{' '}
      <Link to="/guide/models">Модели и группы</Link>.
    </>
  ),
  vi: (
    <>
      ID mô hình phải khớp chính xác với trang (phân biệt hoa thường). Sao chép từ{' '}
      <Link to="/guide/recommended-models">bảng mô hình</Link> hoặc <code>GET /v1/models</code>. Nếu nhóm của key
      không có mô hình, bạn sẽ nhận <code>403 / model not available</code> — xem{' '}
      <Link to="/guide/models">Mô hình &amp; nhóm</Link>.
    </>
  ),
}

export const clientGuides: Record<string, ClientGuide> = {
  deepchat: {
    name: 'DeepChat',
    website: { label: 'deepchat.thinkinai.xyz', href: 'https://deepchat.thinkinai.xyz' },
    lead: {
      zh: 'DaoXE 已合并进 DeepChat 官方：内置服务商，搜索启用 + 填 Key 即可，无需手动配置 Base URL。',
      en: 'DaoXE ships inside DeepChat as a built-in provider: search, toggle on, paste a key — no Base URL to configure.',
      ru: 'DaoXE встроен в официальный DeepChat: провайдер уже есть — найдите, включите и вставьте ключ, Base URL настраивать не нужно.',
      vi: 'DaoXE đã tích hợp sẵn trong DeepChat: nhà cung cấp có sẵn — tìm, bật và dán key, không cần cấu hình Base URL.',
    },
    install: {
      zh: (
        <>
          官网下载桌面客户端：
          <a href="https://deepchat.thinkinai.xyz" target="_blank" rel="noopener noreferrer">
            deepchat.dev
          </a>
          （Windows / macOS / Linux）。DaoXE 为官方内置服务商，无需任何自定义配置。
        </>
      ),
      en: (
        <>
          Download the desktop client from{' '}
          <a href="https://deepchat.thinkinai.xyz" target="_blank" rel="noopener noreferrer">
            deepchat.dev
          </a>{' '}
          (Windows / macOS / Linux). DaoXE is an official built-in provider — no custom setup needed.
        </>
      ),
      ru: (
        <>
          Скачайте настольный клиент с{' '}
          <a href="https://deepchat.thinkinai.xyz" target="_blank" rel="noopener noreferrer">
            deepchat.dev
          </a>{' '}
          (Windows / macOS / Linux). DaoXE — официальный встроенный провайдер, ручная настройка не нужна.
        </>
      ),
      vi: (
        <>
          Tải ứng dụng desktop tại{' '}
          <a href="https://deepchat.thinkinai.xyz" target="_blank" rel="noopener noreferrer">
            deepchat.dev
          </a>{' '}
          (Windows / macOS / Linux). DaoXE là nhà cung cấp tích hợp chính thức — không cần cấu hình thủ công.
        </>
      ),
    },
    steps: () => [
      {
        zh: (
          <>
            设置 → <strong>服务商设置</strong>（Provider Center），搜索 <code>daoxe</code>，打开{' '}
            <strong>DaoXE</strong> 开关启用。
          </>
        ),
        en: (
          <>
            Settings → <strong>Provider Center</strong>, search <code>daoxe</code> and toggle{' '}
            <strong>DaoXE</strong> on.
          </>
        ),
        ru: (
          <>
            Настройки → <strong>Provider Center</strong>, найдите <code>daoxe</code> и включите переключатель{' '}
            <strong>DaoXE</strong>.
          </>
        ),
        vi: (
          <>
            Cài đặt → <strong>Provider Center</strong>, tìm <code>daoxe</code> và bật công tắc{' '}
            <strong>DaoXE</strong>.
          </>
        ),
      },
      {
        zh: (
          <>
            Connect 页签：API URL 已固定为推荐 Base（无需也不应修改），只填 <strong>API Key</strong>（
            <code>sk-xxxx</code>）。
          </>
        ),
        en: (
          <>
            On the Connect tab the API URL is pinned to the recommended Base (don't change it) — just paste your{' '}
            <strong>API Key</strong> (<code>sk-xxxx</code>).
          </>
        ),
        ru: (
          <>
            На вкладке Connect API URL зафиксирован на рекомендуемом Base (менять не нужно) — просто вставьте свой{' '}
            <strong>API Key</strong> (<code>sk-xxxx</code>).
          </>
        ),
        vi: (
          <>
            Ở tab Connect, API URL đã cố định ở Base khuyến nghị (không cần đổi) — chỉ dán{' '}
            <strong>API Key</strong> (<code>sk-xxxx</code>).
          </>
        ),
      },
      {
        zh: <>点「验证密钥」确认连通，再点「刷新模型」拉取站内模型列表。</>,
        en: (
          <>
            Click <em>Verify key</em> to confirm connectivity, then <em>Refresh models</em> to pull the site's
            model list.
          </>
        ),
        ru: (
          <>
            Нажмите <em>Проверить ключ</em> для проверки соединения, затем <em>Обновить модели</em>, чтобы
            получить список моделей сайта.
          </>
        ),
        vi: (
          <>
            Bấm <em>Verify key</em> để kiểm tra kết nối, rồi bấm <em>Refresh models</em> để lấy danh sách mô hình
            của trang.
          </>
        ),
      },
      {
        zh: <>切到 Models 页签，勾选需要启用的模型，即可在会话中使用。</>,
        en: <>Switch to the Models tab, enable the models you want, and start chatting.</>,
        ru: <>Перейдите на вкладку Models, отметьте нужные модели — и можно общаться.</>,
        vi: <>Chuyển sang tab Models, tích chọn các mô hình cần dùng, rồi bắt đầu trò chuyện.</>,
      },
    ],
    models: MODEL_LINKS,
    pitfalls: () => [
      {
        zh: <>「0 个模型已启用」是初始状态：填 Key 并刷新模型后，记得在 Models 页勾选模型。</>,
        en: (
          <>
            «0 models enabled» is the initial state: after pasting the key and refreshing, remember to tick models
            on the Models tab.
          </>
        ),
        ru: (
          <>
            «0 моделей включено» — начальное состояние: после ввода ключа и обновления не забудьте отметить модели
            на вкладке Models.
          </>
        ),
        vi: (
          <>
            «0 mô hình được bật» là trạng thái ban đầu: sau khi dán key và refresh, nhớ tích chọn mô hình ở tab
            Models.
          </>
        ),
      },
      {
        zh: (
          <>
            验证失败先检查 Key 是否有效、分组是否含目标模型（<Link to="/guide/keys">创建密钥</Link>）；无需检查
            Base URL——它是内置固定的。
          </>
        ),
        en: (
          <>
            If verification fails, check the key and its group (<Link to="/guide/keys">create a key</Link>) — the
            Base URL is built-in and can't be the problem.
          </>
        ),
        ru: (
          <>
            Если проверка не проходит, проверьте ключ и его группу (<Link to="/guide/keys">создать ключ</Link>) —
            Base URL встроен и не может быть причиной.
          </>
        ),
        vi: (
          <>
            Nếu xác minh thất bại, hãy kiểm tra key và nhóm của nó (<Link to="/guide/keys">tạo key</Link>) — Base
            URL đã tích hợp sẵn nên không thể là nguyên nhân.
          </>
        ),
      },
    ],
    shots: [
      {
        src: '/images/guide/daoxe/14-deepchat-provider.png',
        alt: 'DeepChat Provider Center with built-in DaoXE provider enabled',
        caption: {
          zh: 'DeepChat · Provider Center 搜索 daoxe 即见内置服务商，API URL 已固定（实拍）',
          en: 'DeepChat · Provider Center: search “daoxe” to find the built-in provider; API URL is pinned',
          ru: 'DeepChat · Provider Center: найдите «daoxe», чтобы увидеть встроенного провайдера; API URL зафиксирован',
          vi: 'DeepChat · Provider Center: tìm «daoxe» để thấy nhà cung cấp tích hợp; API URL đã cố định',
        },
      },
    ],
    builtIn: true,
  },

  'cherry-studio': {
    name: 'Cherry Studio',
    website: { label: 'cherry-ai.com', href: 'https://www.cherry-ai.com' },
    lead: {
      zh: '开源桌面客户端（Win / macOS / Linux），添加 OpenAI 类型服务商即可接入。',
      en: 'Open-source desktop client (Win / macOS / Linux). Add an OpenAI-type provider to connect.',
      ru: 'Открытый настольный клиент (Win / macOS / Linux). Добавьте провайдера типа OpenAI для подключения.',
      vi: 'Ứng dụng desktop mã nguồn mở (Win / macOS / Linux). Thêm nhà cung cấp kiểu OpenAI để kết nối.',
    },
    install: {
      zh: (
        <>
          官网下载安装包：
          <a href="https://www.cherry-ai.com" target="_blank" rel="noopener noreferrer">
            cherry-ai.com
          </a>
          ，或 GitHub Releases（CherryHQ/cherry-studio）。三平台均支持。
        </>
      ),
      en: (
        <>
          Download from{' '}
          <a href="https://www.cherry-ai.com" target="_blank" rel="noopener noreferrer">
            cherry-ai.com
          </a>{' '}
          or GitHub Releases (CherryHQ/cherry-studio). All three desktop platforms are supported.
        </>
      ),
      ru: (
        <>
          Скачайте с{' '}
          <a href="https://www.cherry-ai.com" target="_blank" rel="noopener noreferrer">
            cherry-ai.com
          </a>{' '}
          или из GitHub Releases (CherryHQ/cherry-studio). Поддерживаются все три платформы.
        </>
      ),
      vi: (
        <>
          Tải từ{' '}
          <a href="https://www.cherry-ai.com" target="_blank" rel="noopener noreferrer">
            cherry-ai.com
          </a>{' '}
          hoặc GitHub Releases (CherryHQ/cherry-studio). Hỗ trợ cả ba nền tảng desktop.
        </>
      ),
    },
    steps: (b) => [
      {
        zh: <>打开 设置 → 模型服务，点击底部「添加」，服务商类型选 <strong>OpenAI</strong>。</>,
        en: (
          <>
            Open Settings → Model Services, click <em>Add</em> at the bottom and pick provider type{' '}
            <strong>OpenAI</strong>.
          </>
        ),
        ru: (
          <>
            Откройте Настройки → Модельные сервисы, нажмите <em>Добавить</em> внизу и выберите тип провайдера{' '}
            <strong>OpenAI</strong>.
          </>
        ),
        vi: (
          <>
            Mở Cài đặt → Model Services, bấm <em>Add</em> ở dưới cùng và chọn loại nhà cung cấp{' '}
            <strong>OpenAI</strong>.
          </>
        ),
      },
      {
        zh: (
          <>
            API 地址填 <code>{b.root}</code>。Cherry Studio 会自动补 <code>/v1</code>；地址以 <code>/</code>{' '}
            结尾则不再追加，以 <code>#</code> 结尾则按原样使用。
          </>
        ),
        en: (
          <>
            Set API address to <code>{b.root}</code>. Cherry Studio appends <code>/v1</code> automatically; a
            trailing <code>/</code> disables the append, a trailing <code>#</code> forces the URL as-is.
          </>
        ),
        ru: (
          <>
            В поле API-адреса укажите <code>{b.root}</code>. Cherry Studio сам добавит <code>/v1</code>; символ{' '}
            <code>/</code> в конце отключает добавление, а <code>#</code> — использует URL как есть.
          </>
        ),
        vi: (
          <>
            Đặt địa chỉ API là <code>{b.root}</code>. Cherry Studio tự thêm <code>/v1</code>; dấu <code>/</code> ở
            cuối sẽ tắt việc tự thêm, dấu <code>#</code> ở cuối giữ URL nguyên trạng.
          </>
        ),
      },
      {
        zh: <>API 密钥填你的 <code>sk-xxxx</code>。</>,
        en: (
          <>
            Paste your <code>sk-xxxx</code> key into the API key field.
          </>
        ),
        ru: (
          <>
            Вставьте ваш ключ <code>sk-xxxx</code> в поле API-ключа.
          </>
        ),
        vi: (
          <>
            Dán key <code>sk-xxxx</code> của bạn vào ô API key.
          </>
        ),
      },
      {
        zh: <>在该服务商的「模型」区点「添加」，手动输入站内模型 ID（下拉不会自动列出）。</>,
        en: (
          <>
            In the provider's <em>Models</em> section click <em>Add</em> and type the model ID manually (the
            dropdown won't list it automatically).
          </>
        ),
        ru: (
          <>
            В разделе <em>Модели</em> этого провайдера нажмите <em>Добавить</em> и введите ID модели вручную
            (в списке он не появится автоматически).
          </>
        ),
        vi: (
          <>
            Trong mục <em>Models</em> của nhà cung cấp, bấm <em>Add</em> và nhập ID mô hình thủ công (danh sách
            thả xuống không tự liệt kê).
          </>
        ),
      },
      {
        zh: <>点「检查」做连通性测试，通过后即可在会话中选择该模型。</>,
        en: (
          <>
            Hit <em>Check</em> to run a connectivity test, then pick the model in a chat.
          </>
        ),
        ru: (
          <>
            Нажмите <em>Проверить</em> для теста соединения, затем выберите модель в чате.
          </>
        ),
        vi: (
          <>
            Bấm <em>Check</em> để kiểm tra kết nối, sau đó chọn mô hình trong cuộc trò chuyện.
          </>
        ),
      },
    ],
    models: MODEL_LINKS,
    pitfalls: (b) => [
      {
        zh: (
          <>
            地址结尾规则最容易踩：填 <code>{b.v1}</code> 再被自动补一次会变成 <code>/v1/v1</code> → 404。推荐直接填{' '}
            <code>{b.root}</code>。
          </>
        ),
        en: (
          <>
            The trailing-slash rule is the top gotcha: entering <code>{b.v1}</code> and letting the app append
            again yields <code>/v1/v1</code> → 404. Just use <code>{b.root}</code>.
          </>
        ),
        ru: (
          <>
            Правило про хвост адреса — главная ловушка: если указать <code>{b.v1}</code> и дать приложению добавить
            путь ещё раз, получится <code>/v1/v1</code> → 404. Указывайте просто <code>{b.root}</code>.
          </>
        ),
        vi: (
          <>
            Quy tắc dấu cuối là lỗi hay gặp nhất: nhập <code>{b.v1}</code> rồi để app tự thêm lần nữa sẽ thành{' '}
            <code>/v1/v1</code> → 404. Cứ dùng <code>{b.root}</code>.
          </>
        ),
      },
      {
        zh: <>翻译 / 划词等高频功能建议换低价快速模型，避免消耗过快或触发 429 限流。</>,
        en: (
          <>
            For translation / quick actions, switch to a cheap fast model to avoid burning quota or hitting 429
            rate limits.
          </>
        ),
        ru: (
          <>
            Для перевода и быстрых действий выбирайте дешёвую быструю модель, чтобы не тратить квоту зря и не
            ловить лимит 429.
          </>
        ),
        vi: (
          <>
            Với dịch thuật / thao tác nhanh, hãy chọn mô hình rẻ và nhanh để tránh tốn quota hoặc dính giới hạn
            429.
          </>
        ),
      },
    ],
    shots: [
      {
        src: '/images/guide/clients/cherry-studio-provider.png',
        alt: 'Cherry Studio provider settings',
        caption: {
          zh: 'Cherry Studio · 模型服务配置',
          en: 'Cherry Studio · provider settings',
          ru: 'Cherry Studio · настройки провайдера',
          vi: 'Cherry Studio · cấu hình nhà cung cấp',
        },
      },
    ],
    rootBase: true,
  },

  chatbox: {
    name: 'ChatBox',
    website: { label: 'chatboxai.app', href: 'https://chatboxai.app' },
    lead: {
      zh: '跨平台聊天客户端（桌面 + 移动 + 网页），用「自定义提供方（OpenAI API 兼容）」接入。',
      en: 'Cross-platform chat client (desktop + mobile + web). Connect via a custom OpenAI-compatible provider.',
      ru: 'Кроссплатформенный чат-клиент (десктоп + мобильный + веб). Подключение через кастомного OpenAI-совместимого провайдера.',
      vi: 'Client chat đa nền tảng (desktop + di động + web). Kết nối qua nhà cung cấp tùy chỉnh tương thích OpenAI.',
    },
    install: {
      zh: (
        <>
          官网下载：
          <a href="https://chatboxai.app" target="_blank" rel="noopener noreferrer">
            chatboxai.app
          </a>
          （Windows / macOS / Linux / iOS / Android，另有网页版）。
        </>
      ),
      en: (
        <>
          Download from{' '}
          <a href="https://chatboxai.app" target="_blank" rel="noopener noreferrer">
            chatboxai.app
          </a>{' '}
          (Windows / macOS / Linux / iOS / Android, plus a web version).
        </>
      ),
      ru: (
        <>
          Скачайте с{' '}
          <a href="https://chatboxai.app" target="_blank" rel="noopener noreferrer">
            chatboxai.app
          </a>{' '}
          (Windows / macOS / Linux / iOS / Android, есть и веб-версия).
        </>
      ),
      vi: (
        <>
          Tải từ{' '}
          <a href="https://chatboxai.app" target="_blank" rel="noopener noreferrer">
            chatboxai.app
          </a>{' '}
          (Windows / macOS / Linux / iOS / Android, có cả bản web).
        </>
      ),
    },
    steps: (b) => [
      {
        zh: <>设置 → 模型提供方 → 「添加自定义提供方」，模式选 <strong>OpenAI API 兼容</strong>。</>,
        en: (
          <>
            Settings → Model Provider → <em>Add Custom Provider</em>, choose mode{' '}
            <strong>OpenAI API Compatible</strong>.
          </>
        ),
        ru: (
          <>
            Настройки → Провайдер модели → <em>Добавить своего провайдера</em>, режим{' '}
            <strong>OpenAI API Compatible</strong>.
          </>
        ),
        vi: (
          <>
            Cài đặt → Model Provider → <em>Add Custom Provider</em>, chọn chế độ{' '}
            <strong>OpenAI API Compatible</strong>.
          </>
        ),
      },
      {
        zh: (
          <>
            API 域名（API Host）填 <code>{b.root}</code>，API 路径保持默认 <code>/v1/chat/completions</code>
            （旧版本若只有一个「API Host」输入框，则填 <code>{b.v1}</code>）。
          </>
        ),
        en: (
          <>
            API Host = <code>{b.root}</code>, keep the default API path <code>/v1/chat/completions</code> (older
            builds with a single host field: use <code>{b.v1}</code>).
          </>
        ),
        ru: (
          <>
            API Host = <code>{b.root}</code>, оставьте путь по умолчанию <code>/v1/chat/completions</code> (в
            старых сборках с единственным полем host укажите <code>{b.v1}</code>).
          </>
        ),
        vi: (
          <>
            API Host = <code>{b.root}</code>, giữ đường dẫn mặc định <code>/v1/chat/completions</code> (bản cũ chỉ
            có một ô host thì điền <code>{b.v1}</code>).
          </>
        ),
      },
      {
        zh: <>API 密钥填 <code>sk-xxxx</code>；「模型」处手动输入站内模型 ID 并保存。</>,
        en: (
          <>
            Paste your <code>sk-xxxx</code> key, type the model ID under <em>Model</em> and save.
          </>
        ),
        ru: (
          <>
            Вставьте ключ <code>sk-xxxx</code>, введите ID модели в поле <em>Model</em> и сохраните.
          </>
        ),
        vi: (
          <>
            Dán key <code>sk-xxxx</code>, nhập ID mô hình ở mục <em>Model</em> rồi lưu.
          </>
        ),
      },
      {
        zh: <>回到会话界面，右下角切到刚添加的提供方，发一句话验证。</>,
        en: <>Back in a chat, switch the provider selector to the new entry and send a test message.</>,
        ru: <>Вернитесь в чат, переключите провайдера на новую запись и отправьте тестовое сообщение.</>,
        vi: <>Quay lại cuộc trò chuyện, chuyển bộ chọn nhà cung cấp sang mục mới và gửi thử một tin nhắn.</>,
      },
    ],
    models: MODEL_LINKS,
    pitfalls: () => [
      {
        zh: (
          <>
            域名和路径不要重复带 <code>/v1</code>（拼成 <code>/v1/v1/chat/completions</code> 会 404）。
          </>
        ),
        en: (
          <>
            Don't put <code>/v1</code> in both host and path — <code>/v1/v1/chat/completions</code> is a 404.
          </>
        ),
        ru: (
          <>
            Не указывайте <code>/v1</code> и в host, и в пути — <code>/v1/v1/chat/completions</code> даёт 404.
          </>
        ),
        vi: (
          <>
            Đừng để <code>/v1</code> ở cả host lẫn đường dẫn — <code>/v1/v1/chat/completions</code> sẽ 404.
          </>
        ),
      },
      {
        zh: <>模型下拉为空是正常的：自定义提供方需要手动输入模型 ID。</>,
        en: <>An empty model dropdown is expected: custom providers require typing the model ID by hand.</>,
        ru: <>Пустой список моделей — это нормально: для кастомного провайдера ID модели вводится вручную.</>,
        vi: <>Danh sách mô hình trống là bình thường: nhà cung cấp tùy chỉnh yêu cầu nhập ID mô hình thủ công.</>,
      },
    ],
    shots: [
      {
        src: '/images/guide/clients/chatbox-provider.png',
        alt: 'ChatBox custom provider settings',
        caption: {
          zh: 'ChatBox · 自定义提供方配置',
          en: 'ChatBox · custom provider settings',
          ru: 'ChatBox · настройки своего провайдера',
          vi: 'ChatBox · cấu hình nhà cung cấp tùy chỉnh',
        },
      },
    ],
    rootBase: true,
  },

  'lobe-chat': {
    name: 'Lobe Chat',
    website: { label: 'lobehub.com', href: 'https://lobehub.com' },
    lead: {
      zh: '开源 Web 聊天框架（可自部署）。在 OpenAI 服务商里改「API 代理地址」即可接入。',
      en: 'Open-source web chat framework (self-hostable). Point the OpenAI provider\'s proxy URL at the site.',
      ru: 'Открытый веб-фреймворк для чата (можно развернуть самому). Укажите «прокси-URL» провайдера OpenAI на сайт.',
      vi: 'Framework chat web mã nguồn mở (tự triển khai được). Trỏ «proxy URL» của nhà cung cấp OpenAI về trang.',
    },
    install: {
      zh: (
        <>
          在线版{' '}
          <a href="https://lobehub.com" target="_blank" rel="noopener noreferrer">
            lobehub.com
          </a>
          ，或自部署（Docker / Vercel，仓库 lobehub/lobe-chat）。
        </>
      ),
      en: (
        <>
          Hosted at{' '}
          <a href="https://lobehub.com" target="_blank" rel="noopener noreferrer">
            lobehub.com
          </a>
          , or self-host via Docker / Vercel (repo lobehub/lobe-chat).
        </>
      ),
      ru: (
        <>
          Онлайн-версия{' '}
          <a href="https://lobehub.com" target="_blank" rel="noopener noreferrer">
            lobehub.com
          </a>
          , либо разверните сами через Docker / Vercel (репозиторий lobehub/lobe-chat).
        </>
      ),
      vi: (
        <>
          Bản online{' '}
          <a href="https://lobehub.com" target="_blank" rel="noopener noreferrer">
            lobehub.com
          </a>
          , hoặc tự triển khai qua Docker / Vercel (repo lobehub/lobe-chat).
        </>
      ),
    },
    steps: (b) => [
      {
        zh: <>设置 → AI 服务商 → <strong>OpenAI</strong>。</>,
        en: (
          <>
            Settings → AI Provider → <strong>OpenAI</strong>.
          </>
        ),
        ru: (
          <>
            Настройки → Провайдер ИИ → <strong>OpenAI</strong>.
          </>
        ),
        vi: (
          <>
            Cài đặt → AI Provider → <strong>OpenAI</strong>.
          </>
        ),
      },
      {
        zh: (
          <>
            API Key 填 <code>sk-xxxx</code>；API 代理地址填 <code>{b.v1}</code>（必须带 <code>/v1</code>）。
          </>
        ),
        en: (
          <>
            API Key = <code>sk-xxxx</code>; API proxy URL = <code>{b.v1}</code> (the <code>/v1</code> suffix is
            required).
          </>
        ),
        ru: (
          <>
            API Key = <code>sk-xxxx</code>; прокси-URL API = <code>{b.v1}</code> (суффикс <code>/v1</code>{' '}
            обязателен).
          </>
        ),
        vi: (
          <>
            API Key = <code>sk-xxxx</code>; proxy URL của API = <code>{b.v1}</code> (bắt buộc có hậu tố{' '}
            <code>/v1</code>).
          </>
        ),
      },
      {
        zh: <>打开「使用客户端请求模式」，让请求直接从浏览器发出，绕过 Lobe 服务端。</>,
        en: (
          <>
            Enable <em>client-side request mode</em> so calls go straight from the browser instead of Lobe's
            server.
          </>
        ),
        ru: (
          <>
            Включите <em>режим клиентских запросов</em>, чтобы вызовы шли прямо из браузера, минуя сервер Lobe.
          </>
        ),
        vi: (
          <>
            Bật <em>chế độ gửi request từ client</em> để các lệnh gọi đi thẳng từ trình duyệt, bỏ qua server của
            Lobe.
          </>
        ),
      },
      {
        zh: <>模型列表点「获取模型列表」自动拉取，或手动添加站内模型 ID；最后点「连通性检查」。</>,
        en: <>Fetch the model list automatically or add model IDs manually, then run the connectivity check.</>,
        ru: <>Загрузите список моделей автоматически или добавьте ID вручную, затем запустите проверку соединения.</>,
        vi: <>Lấy danh sách mô hình tự động hoặc thêm ID thủ công, rồi chạy kiểm tra kết nối.</>,
      },
    ],
    models: MODEL_LINKS,
    pitfalls: () => [
      {
        zh: (
          <>
            代理地址漏掉 <code>/v1</code> 是最常见错误，症状是 404 / <code>Connection failed</code>。
          </>
        ),
        en: (
          <>
            Forgetting <code>/v1</code> in the proxy URL is the most common mistake — symptoms are 404 /{' '}
            <code>Connection failed</code>.
          </>
        ),
        ru: (
          <>
            Забыть <code>/v1</code> в прокси-URL — самая частая ошибка, симптомы: 404 /{' '}
            <code>Connection failed</code>.
          </>
        ),
        vi: (
          <>
            Quên <code>/v1</code> trong proxy URL là lỗi phổ biến nhất — biểu hiện là 404 /{' '}
            <code>Connection failed</code>.
          </>
        ),
      },
      {
        zh: <>官方在线版走服务端转发时可能无法访问自定义地址；打开客户端请求模式即可解决。</>,
        en: (
          <>
            The hosted version may fail to reach custom endpoints through its server relay; client-side request
            mode fixes this.
          </>
        ),
        ru: (
          <>
            Официальная онлайн-версия может не достучаться до кастомных адресов через свой сервер-ретранслятор;
            режим клиентских запросов это решает.
          </>
        ),
        vi: (
          <>
            Bản online chính thức có thể không truy cập được endpoint tùy chỉnh khi chuyển tiếp qua server; bật
            chế độ gửi request từ client sẽ khắc phục.
          </>
        ),
      },
    ],
    shots: [
      {
        src: '/images/guide/clients/lobe-chat-provider.png',
        alt: 'Lobe Chat OpenAI provider settings',
        caption: {
          zh: 'Lobe Chat · OpenAI 服务商配置',
          en: 'Lobe Chat · OpenAI provider settings',
          ru: 'Lobe Chat · настройки провайдера OpenAI',
          vi: 'Lobe Chat · cấu hình nhà cung cấp OpenAI',
        },
      },
    ],
  },

  nextchat: {
    name: 'NextChat',
    website: { label: 'nextchat.club', href: 'https://nextchat.club' },
    lead: {
      zh: '轻量 Web / 桌面客户端（原 ChatGPT-Next-Web）。自定义接口 + 自定义模型名接入。',
      en: 'Lightweight web / desktop client (formerly ChatGPT-Next-Web). Connect via custom endpoint + custom model names.',
      ru: 'Лёгкий веб / настольный клиент (ранее ChatGPT-Next-Web). Подключение через свой эндпоинт + свои имена моделей.',
      vi: 'Client web / desktop nhẹ (trước là ChatGPT-Next-Web). Kết nối qua endpoint tùy chỉnh + tên mô hình tùy chỉnh.',
    },
    install: {
      zh: (
        <>
          官网{' '}
          <a href="https://nextchat.club" target="_blank" rel="noopener noreferrer">
            nextchat.club
          </a>
          ，桌面端见 GitHub Releases（ChatGPTNextWeb/NextChat），也可一键自部署。
        </>
      ),
      en: (
        <>
          Site:{' '}
          <a href="https://nextchat.club" target="_blank" rel="noopener noreferrer">
            nextchat.club
          </a>
          . Desktop builds are on GitHub Releases (ChatGPTNextWeb/NextChat); self-deploy is one click.
        </>
      ),
      ru: (
        <>
          Сайт:{' '}
          <a href="https://nextchat.club" target="_blank" rel="noopener noreferrer">
            nextchat.club
          </a>
          . Настольные сборки в GitHub Releases (ChatGPTNextWeb/NextChat); самостоятельное развёртывание в один
          клик.
        </>
      ),
      vi: (
        <>
          Trang:{' '}
          <a href="https://nextchat.club" target="_blank" rel="noopener noreferrer">
            nextchat.club
          </a>
          . Bản desktop có ở GitHub Releases (ChatGPTNextWeb/NextChat); tự triển khai chỉ một cú nhấp.
        </>
      ),
    },
    steps: (b) => [
      {
        zh: <>设置 → 勾选「自定义接口」。</>,
        en: (
          <>
            Settings → enable <em>Custom Endpoint</em>.
          </>
        ),
        ru: (
          <>
            Настройки → включите <em>Свой эндпоинт</em>.
          </>
        ),
        vi: (
          <>
            Cài đặt → bật <em>Custom Endpoint</em>.
          </>
        ),
      },
      {
        zh: (
          <>
            接口地址填 <code>{b.root}</code>（<strong>不要</strong>带 <code>/v1</code>，NextChat 自己拼路径）；API
            Key 填 <code>sk-xxxx</code>。
          </>
        ),
        en: (
          <>
            Endpoint = <code>{b.root}</code> (<strong>no</strong> <code>/v1</code> — NextChat appends the path
            itself); API Key = <code>sk-xxxx</code>.
          </>
        ),
        ru: (
          <>
            Эндпоинт = <code>{b.root}</code> (<strong>без</strong> <code>/v1</code> — NextChat сам добавит путь);
            API Key = <code>sk-xxxx</code>.
          </>
        ),
        vi: (
          <>
            Endpoint = <code>{b.root}</code> (<strong>không</strong> <code>/v1</code> — NextChat tự thêm đường
            dẫn); API Key = <code>sk-xxxx</code>.
          </>
        ),
      },
      {
        zh: (
          <>
            「自定义模型名」填站内模型 ID（多个用英文逗号分隔，前缀 <code>+</code> 表示追加，如{' '}
            <code>+模型ID</code>），然后在模型下拉里选择它。
          </>
        ),
        en: (
          <>
            Put site model IDs into <em>Custom Models</em> (comma separated; prefix <code>+</code> appends, e.g.{' '}
            <code>+model-id</code>), then pick them in the model dropdown.
          </>
        ),
        ru: (
          <>
            Впишите ID моделей сайта в <em>Custom Models</em> (через запятую; префикс <code>+</code> добавляет,
            например <code>+model-id</code>), затем выберите их в списке моделей.
          </>
        ),
        vi: (
          <>
            Nhập ID mô hình của trang vào <em>Custom Models</em> (ngăn cách bằng dấu phẩy; tiền tố <code>+</code>{' '}
            để thêm, ví dụ <code>+model-id</code>), rồi chọn trong danh sách mô hình.
          </>
        ),
      },
    ],
    models: MODEL_LINKS,
    pitfalls: (b) => [
      {
        zh: (
          <>
            接口地址带了 <code>/v1</code> 会拼成 <code>/v1/v1/...</code> → 404。只填 <code>{b.root}</code>。
          </>
        ),
        en: (
          <>
            Adding <code>/v1</code> to the endpoint produces <code>/v1/v1/...</code> → 404. Use plain{' '}
            <code>{b.root}</code>.
          </>
        ),
        ru: (
          <>
            Добавление <code>/v1</code> к эндпоинту даёт <code>/v1/v1/...</code> → 404. Указывайте просто{' '}
            <code>{b.root}</code>.
          </>
        ),
        vi: (
          <>
            Thêm <code>/v1</code> vào endpoint sẽ thành <code>/v1/v1/...</code> → 404. Chỉ dùng{' '}
            <code>{b.root}</code>.
          </>
        ),
      },
      {
        zh: <>模型下拉默认只有 OpenAI 官方模型名；站内模型必须先加进「自定义模型名」。</>,
        en: (
          <>
            The dropdown only lists official OpenAI names by default; site models must be added via Custom Models
            first.
          </>
        ),
        ru: (
          <>
            По умолчанию список содержит только официальные имена OpenAI; модели сайта нужно сначала добавить в
            Custom Models.
          </>
        ),
        vi: (
          <>
            Mặc định danh sách chỉ có tên OpenAI chính thức; mô hình của trang phải thêm vào Custom Models trước.
          </>
        ),
      },
    ],
    shots: [
      {
        src: '/images/guide/clients/nextchat-endpoint.png',
        alt: 'NextChat custom endpoint settings',
        caption: {
          zh: 'NextChat · 自定义接口配置',
          en: 'NextChat · custom endpoint settings',
          ru: 'NextChat · настройки своего эндпоинта',
          vi: 'NextChat · cấu hình endpoint tùy chỉnh',
        },
      },
    ],
    rootBase: true,
  },

  'open-webui': {
    name: 'Open WebUI',
    website: { label: 'openwebui.com', href: 'https://openwebui.com' },
    lead: {
      zh: '自部署 Web 界面（Docker）。在「外部连接」里加一条 OpenAI API 连接即可全员使用。',
      en: 'Self-hosted web UI (Docker). Add one OpenAI API connection under External Connections for all users.',
      ru: 'Самостоятельно размещаемый веб-интерфейс (Docker). Добавьте одно OpenAI API-подключение в «Внешних подключениях» для всех пользователей.',
      vi: 'Giao diện web tự triển khai (Docker). Thêm một kết nối OpenAI API trong External Connections để mọi người dùng.',
    },
    install: {
      zh: (
        <>
          官网{' '}
          <a href="https://openwebui.com" target="_blank" rel="noopener noreferrer">
            openwebui.com
          </a>
          ；常用 Docker 一行部署（仓库 open-webui/open-webui）。
        </>
      ),
      en: (
        <>
          Site:{' '}
          <a href="https://openwebui.com" target="_blank" rel="noopener noreferrer">
            openwebui.com
          </a>
          . Typically deployed with one Docker command (repo open-webui/open-webui).
        </>
      ),
      ru: (
        <>
          Сайт:{' '}
          <a href="https://openwebui.com" target="_blank" rel="noopener noreferrer">
            openwebui.com
          </a>
          . Обычно разворачивается одной командой Docker (репозиторий open-webui/open-webui).
        </>
      ),
      vi: (
        <>
          Trang:{' '}
          <a href="https://openwebui.com" target="_blank" rel="noopener noreferrer">
            openwebui.com
          </a>
          . Thường triển khai bằng một lệnh Docker (repo open-webui/open-webui).
        </>
      ),
    },
    steps: (b) => [
      {
        zh: <>管理员面板 → 设置 → <strong>外部连接</strong>（Connections）。</>,
        en: (
          <>
            Admin Panel → Settings → <strong>Connections</strong>.
          </>
        ),
        ru: (
          <>
            Панель администратора → Настройки → <strong>Connections</strong>.
          </>
        ),
        vi: (
          <>
            Admin Panel → Settings → <strong>Connections</strong>.
          </>
        ),
      },
      {
        zh: (
          <>
            在 OpenAI API 一栏点「+」：URL 填 <code>{b.v1}</code>，Key 填 <code>sk-xxxx</code>，保存。
          </>
        ),
        en: (
          <>
            Under OpenAI API click «+»: URL = <code>{b.v1}</code>, Key = <code>sk-xxxx</code>, save.
          </>
        ),
        ru: (
          <>
            В разделе OpenAI API нажмите «+»: URL = <code>{b.v1}</code>, Key = <code>sk-xxxx</code>, сохраните.
          </>
        ),
        vi: (
          <>
            Trong mục OpenAI API bấm «+»: URL = <code>{b.v1}</code>, Key = <code>sk-xxxx</code>, lưu lại.
          </>
        ),
      },
      {
        zh: (
          <>
            保存后 Open WebUI 自动调用 <code>/v1/models</code> 拉取模型，模型选择器里即可看到全部站内模型。
          </>
        ),
        en: (
          <>
            Open WebUI then calls <code>/v1/models</code> automatically and every site model appears in the model
            selector.
          </>
        ),
        ru: (
          <>
            После сохранения Open WebUI сам вызовет <code>/v1/models</code>, и все модели сайта появятся в
            селекторе моделей.
          </>
        ),
        vi: (
          <>
            Sau khi lưu, Open WebUI tự gọi <code>/v1/models</code> và mọi mô hình của trang sẽ hiện trong bộ chọn
            mô hình.
          </>
        ),
      },
      {
        zh: <>可在 管理员面板 → 模型 里隐藏不用的模型，避免选择器过长。</>,
        en: <>Optionally hide unused models under Admin Panel → Models to keep the selector short.</>,
        ru: <>При желании скройте лишние модели в Панель администратора → Модели, чтобы селектор не был длинным.</>,
        vi: <>Có thể ẩn các mô hình không dùng trong Admin Panel → Models để bộ chọn gọn hơn.</>,
      },
    ],
    models: MODEL_LINKS,
    pitfalls: () => [
      {
        zh: (
          <>
            URL 必须带 <code>/v1</code>；漏掉后模型列表拉取直接失败。
          </>
        ),
        en: (
          <>
            The URL must include <code>/v1</code>; without it the model list fetch fails outright.
          </>
        ),
        ru: (
          <>
            URL обязан содержать <code>/v1</code>; без него загрузка списка моделей сразу падает.
          </>
        ),
        vi: (
          <>
            URL bắt buộc có <code>/v1</code>; thiếu nó việc lấy danh sách mô hình sẽ thất bại ngay.
          </>
        ),
      },
      {
        zh: <>Docker 部署时容器内无法访问宿主机的「localhost」代理；直接填公网站点地址即可。</>,
        en: (
          <>
            Inside Docker the container can't reach a proxy on the host's «localhost»; use the public site URL
            directly.
          </>
        ),
        ru: (
          <>
            В Docker контейнер не достучится до прокси на «localhost» хоста; указывайте публичный адрес сайта
            напрямую.
          </>
        ),
        vi: (
          <>
            Khi chạy Docker, container không truy cập được proxy trên «localhost» của máy chủ; hãy dùng địa chỉ
            trang công khai trực tiếp.
          </>
        ),
      },
    ],
    shots: [
      {
        src: '/images/guide/clients/open-webui-connection.png',
        alt: 'Open WebUI external connection settings',
        caption: {
          zh: 'Open WebUI · 外部连接配置',
          en: 'Open WebUI · external connection settings',
          ru: 'Open WebUI · настройки внешнего подключения',
          vi: 'Open WebUI · cấu hình kết nối ngoài',
        },
      },
    ],
  },

  'immersive-translate': {
    name: 'Immersive Translate',
    website: { label: 'immersivetranslate.com', href: 'https://immersivetranslate.com' },
    lead: {
      zh: '浏览器翻译扩展。在 OpenAI 翻译服务里填自定义接口地址即可用站内模型翻译网页。',
      en: 'Browser translation extension. Point its OpenAI service at a custom endpoint to translate pages with site models.',
      ru: 'Расширение-переводчик для браузера. Укажите свой эндпоинт в его сервисе OpenAI, чтобы переводить страницы моделями сайта.',
      vi: 'Tiện ích dịch cho trình duyệt. Trỏ dịch vụ OpenAI của nó tới endpoint tùy chỉnh để dịch trang bằng mô hình của trang.',
    },
    install: {
      zh: (
        <>
          各浏览器商店搜索「沉浸式翻译」，或从官网安装：
          <a href="https://immersivetranslate.com" target="_blank" rel="noopener noreferrer">
            immersivetranslate.com
          </a>
          。
        </>
      ),
      en: (
        <>
          Install from your browser's extension store or from{' '}
          <a href="https://immersivetranslate.com" target="_blank" rel="noopener noreferrer">
            immersivetranslate.com
          </a>
          .
        </>
      ),
      ru: (
        <>
          Установите из магазина расширений вашего браузера или с{' '}
          <a href="https://immersivetranslate.com" target="_blank" rel="noopener noreferrer">
            immersivetranslate.com
          </a>
          .
        </>
      ),
      vi: (
        <>
          Cài từ cửa hàng tiện ích của trình duyệt hoặc từ{' '}
          <a href="https://immersivetranslate.com" target="_blank" rel="noopener noreferrer">
            immersivetranslate.com
          </a>
          .
        </>
      ),
    },
    steps: (b) => [
      {
        zh: <>扩展设置 → 翻译服务 → <strong>OpenAI</strong>，APIKEY 填 <code>sk-xxxx</code>。</>,
        en: (
          <>
            Extension settings → Translation Services → <strong>OpenAI</strong>, APIKEY = <code>sk-xxxx</code>.
          </>
        ),
        ru: (
          <>
            Настройки расширения → Сервисы перевода → <strong>OpenAI</strong>, APIKEY = <code>sk-xxxx</code>.
          </>
        ),
        vi: (
          <>
            Cài đặt tiện ích → Translation Services → <strong>OpenAI</strong>, APIKEY = <code>sk-xxxx</code>.
          </>
        ),
      },
      {
        zh: (
          <>
            展开「更多自定义选项」，自定义 API 接口地址填 <code>{b.v1}/chat/completions</code>（完整路径）。
          </>
        ),
        en: (
          <>
            Expand advanced options and set the custom API endpoint to <code>{b.v1}/chat/completions</code> (full
            path).
          </>
        ),
        ru: (
          <>
            Разверните дополнительные опции и укажите свой эндпоинт API как <code>{b.v1}/chat/completions</code>{' '}
            (полный путь).
          </>
        ),
        vi: (
          <>
            Mở rộng tùy chọn nâng cao và đặt endpoint API tùy chỉnh là <code>{b.v1}/chat/completions</code> (đường
            dẫn đầy đủ).
          </>
        ),
      },
      {
        zh: <>模型选「自定义」，填站内低价快速模型的 ID（翻译量大，性价比优先）。</>,
        en: (
          <>
            Choose <em>custom</em> model and enter a cheap fast site model ID (translation volume is high, so
            optimize for cost).
          </>
        ),
        ru: (
          <>
            Выберите <em>кастомную</em> модель и укажите ID дешёвой быстрой модели сайта (перевод объёмный, поэтому
            важна цена).
          </>
        ),
        vi: (
          <>
            Chọn mô hình <em>custom</em> và nhập ID mô hình rẻ, nhanh của trang (khối lượng dịch lớn nên ưu tiên
            chi phí).
          </>
        ),
      },
      {
        zh: <>把「每秒最大请求数」调低（如 5～10），避免整页翻译并发触发 429。</>,
        en: (
          <>
            Lower <em>max requests per second</em> (e.g. 5–10) so full-page translation doesn't trip 429 rate
            limits.
          </>
        ),
        ru: (
          <>
            Уменьшите <em>макс. запросов в секунду</em> (например, 5–10), чтобы перевод всей страницы не ловил
            лимит 429.
          </>
        ),
        vi: (
          <>
            Giảm <em>số request tối đa mỗi giây</em> (ví dụ 5–10) để việc dịch cả trang không dính giới hạn 429.
          </>
        ),
      },
    ],
    models: MODEL_LINKS,
    pitfalls: () => [
      {
        zh: (
          <>
            接口地址要填到 <code>/chat/completions</code> 完整路径，只填到 <code>/v1</code> 部分版本会报错。
          </>
        ),
        en: (
          <>
            The endpoint needs the full <code>/chat/completions</code> path; stopping at <code>/v1</code> errors
            on some versions.
          </>
        ),
        ru: (
          <>
            Эндпоинту нужен полный путь <code>/chat/completions</code>; если остановиться на <code>/v1</code>,
            некоторые версии выдают ошибку.
          </>
        ),
        vi: (
          <>
            Endpoint cần đường dẫn đầy đủ <code>/chat/completions</code>; dừng ở <code>/v1</code> sẽ lỗi trên vài
            phiên bản.
          </>
        ),
      },
      {
        zh: (
          <>
            频繁 429：先降并发/请求频率，再看 <Link to="/api/rate-limit">限流与重试</Link>。
          </>
        ),
        en: (
          <>
            Frequent 429s: lower concurrency first, then see <Link to="/api/rate-limit">rate limits</Link>.
          </>
        ),
        ru: (
          <>
            Частые 429: сначала снизьте параллелизм, затем см. <Link to="/api/rate-limit">лимиты</Link>.
          </>
        ),
        vi: (
          <>
            Hay bị 429: giảm số request đồng thời trước, rồi xem <Link to="/api/rate-limit">giới hạn tốc độ</Link>.
          </>
        ),
      },
    ],
    shots: [
      {
        src: '/images/guide/clients/immersive-translate.png',
        alt: 'Immersive Translate OpenAI service settings',
        caption: {
          zh: '沉浸式翻译 · OpenAI 服务配置',
          en: 'Immersive Translate · OpenAI service settings',
          ru: 'Immersive Translate · настройки сервиса OpenAI',
          vi: 'Immersive Translate · cấu hình dịch vụ OpenAI',
        },
      },
    ],
  },

  'gemini-cli': {
    name: 'Gemini CLI',
    website: { label: 'github.com/google-gemini/gemini-cli', href: 'https://github.com/google-gemini/gemini-cli' },
    lead: {
      zh: 'Google 官方终端 Agent。改两个环境变量即可走站内 Gemini 兼容端点。',
      en: "Google's official terminal agent. Two environment variables route it through the site's Gemini-compatible endpoint.",
      ru: 'Официальный терминальный агент Google. Две переменные окружения направляют его через Gemini-совместимый эндпоинт сайта.',
      vi: 'Agent terminal chính thức của Google. Hai biến môi trường sẽ định tuyến nó qua endpoint tương thích Gemini của trang.',
    },
    install: {
      zh: (
        <>
          需要 Node.js 20+：<code>npm install -g @google/gemini-cli</code>，安装后运行 <code>gemini</code>。
        </>
      ),
      en: (
        <>
          Requires Node.js 20+: <code>npm install -g @google/gemini-cli</code>, then run <code>gemini</code>.
        </>
      ),
      ru: (
        <>
          Требуется Node.js 20+: <code>npm install -g @google/gemini-cli</code>, затем запустите{' '}
          <code>gemini</code>.
        </>
      ),
      vi: (
        <>
          Cần Node.js 20+: <code>npm install -g @google/gemini-cli</code>, sau đó chạy <code>gemini</code>.
        </>
      ),
    },
    steps: (b) => [
      {
        zh: (
          <>
            创建密钥时选<strong>包含 Gemini 系模型的分组</strong>（见 <Link to="/guide/keys">创建密钥</Link>）。
          </>
        ),
        en: (
          <>
            Create a key in a group that <strong>includes Gemini models</strong> (see{' '}
            <Link to="/guide/keys">Create a key</Link>).
          </>
        ),
        ru: (
          <>
            Создайте ключ в группе, которая <strong>включает модели Gemini</strong> (см.{' '}
            <Link to="/guide/keys">Создать ключ</Link>).
          </>
        ),
        vi: (
          <>
            Tạo key trong nhóm <strong>có chứa mô hình Gemini</strong> (xem <Link to="/guide/keys">Tạo key</Link>).
          </>
        ),
      },
      {
        zh: (
          <>
            设置环境变量：<code>GEMINI_API_KEY</code> 填 <code>sk-xxxx</code>，<code>GOOGLE_GEMINI_BASE_URL</code>{' '}
            填 <code>{b.root}</code>（站点根，不带 <code>/v1</code> 或 <code>/v1beta</code>）。
          </>
        ),
        en: (
          <>
            Export <code>GEMINI_API_KEY=sk-xxxx</code> and <code>GOOGLE_GEMINI_BASE_URL={b.root}</code> (site
            root, no <code>/v1</code> or <code>/v1beta</code>).
          </>
        ),
        ru: (
          <>
            Задайте <code>GEMINI_API_KEY=sk-xxxx</code> и <code>GOOGLE_GEMINI_BASE_URL={b.root}</code> (корень
            сайта, без <code>/v1</code> или <code>/v1beta</code>).
          </>
        ),
        vi: (
          <>
            Đặt <code>GEMINI_API_KEY=sk-xxxx</code> và <code>GOOGLE_GEMINI_BASE_URL={b.root}</code> (gốc site,
            không có <code>/v1</code> hay <code>/v1beta</code>).
          </>
        ),
      },
      {
        zh: (
          <>
            新开终端运行 <code>gemini</code>，认证方式选「使用 Gemini API 密钥」；用 <code>-m 模型ID</code>{' '}
            指定站内 Gemini 模型。
          </>
        ),
        en: (
          <>
            Open a new terminal, run <code>gemini</code>, pick «Use Gemini API key» as the auth method; select a
            site Gemini model with <code>-m &lt;model-id&gt;</code>.
          </>
        ),
        ru: (
          <>
            Откройте новый терминал, запустите <code>gemini</code>, выберите способ входа «Use Gemini API key»;
            укажите модель Gemini сайта через <code>-m &lt;model-id&gt;</code>.
          </>
        ),
        vi: (
          <>
            Mở terminal mới, chạy <code>gemini</code>, chọn cách xác thực «Use Gemini API key»; chỉ định mô hình
            Gemini của trang bằng <code>-m &lt;model-id&gt;</code>.
          </>
        ),
      },
    ],
    code: (b) => [
      {
        lang: 'bash',
        code: `# ~/.zshrc / ~/.bashrc
export GEMINI_API_KEY="sk-xxxx"
export GOOGLE_GEMINI_BASE_URL="${b.root}"

gemini -m 你的Gemini模型ID`,
      },
      {
        lang: 'bash',
        code: `# 先用 curl 验证 Gemini 兼容端点 / smoke-test the Gemini endpoint first
curl "${b.root}/v1beta/models/你的Gemini模型ID:generateContent?key=sk-xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"contents":[{"parts":[{"text":"ping"}]}]}'`,
      },
    ],
    models: {
      zh: (
        <>
          只有 Gemini 系模型走 <code>/v1beta</code> 端点；模型 ID 从{' '}
          <Link to="/guide/recommended-models">推荐模型表</Link> 复制（如 <code>gemini-*</code> 系列）。
        </>
      ),
      en: (
        <>
          Only Gemini-family models are served on <code>/v1beta</code>; copy IDs (the <code>gemini-*</code>{' '}
          series) from the <Link to="/guide/recommended-models">recommended models table</Link>.
        </>
      ),
      ru: (
        <>
          На <code>/v1beta</code> обслуживаются только модели семейства Gemini; копируйте ID (серия{' '}
          <code>gemini-*</code>) из <Link to="/guide/recommended-models">каталога моделей</Link>.
        </>
      ),
      vi: (
        <>
          Chỉ các mô hình họ Gemini dùng endpoint <code>/v1beta</code>; sao chép ID (dòng <code>gemini-*</code>)
          từ <Link to="/guide/recommended-models">bảng mô hình</Link>.
        </>
      ),
    },
    pitfalls: (b) => [
      {
        zh: (
          <>
            Base 填站点根 <code>{b.root}</code>：CLI 自己拼 <code>/v1beta/...</code>，多写 <code>/v1</code> 会
            404。
          </>
        ),
        en: (
          <>
            Base must be the site root <code>{b.root}</code>: the CLI appends <code>/v1beta/...</code> itself, so
            an extra <code>/v1</code> gives 404.
          </>
        ),
        ru: (
          <>
            Base — это корень сайта <code>{b.root}</code>: CLI сам добавит <code>/v1beta/...</code>, поэтому лишний{' '}
            <code>/v1</code> даст 404.
          </>
        ),
        vi: (
          <>
            Base phải là gốc site <code>{b.root}</code>: CLI tự thêm <code>/v1beta/...</code>, nên thừa{' '}
            <code>/v1</code> sẽ bị 404.
          </>
        ),
      },
      {
        zh: <>环境变量只对新终端生效；改完后要重开终端再运行 <code>gemini</code>。</>,
        en: (
          <>
            Environment variables only apply to new shells — reopen the terminal before running{' '}
            <code>gemini</code>.
          </>
        ),
        ru: (
          <>
            Переменные окружения действуют только в новых сессиях — переоткройте терминал перед запуском{' '}
            <code>gemini</code>.
          </>
        ),
        vi: (
          <>
            Biến môi trường chỉ áp dụng cho shell mới — mở lại terminal trước khi chạy <code>gemini</code>.
          </>
        ),
      },
      {
        zh: (
          <>
            也可以在支持 OpenAI 协议的工具里用 Gemini 模型（Base 用 <code>{b.v1}</code>），见{' '}
            <Link to="/guide/multi-protocol">双协议清单</Link>。
          </>
        ),
        en: (
          <>
            Gemini models also work through OpenAI-protocol tools (Base <code>{b.v1}</code>) — see the{' '}
            <Link to="/guide/multi-protocol">protocol checklist</Link>.
          </>
        ),
        ru: (
          <>
            Модели Gemini также работают в инструментах с протоколом OpenAI (Base <code>{b.v1}</code>) — см.{' '}
            <Link to="/guide/multi-protocol">список протоколов</Link>.
          </>
        ),
        vi: (
          <>
            Mô hình Gemini cũng dùng được trong công cụ giao thức OpenAI (Base <code>{b.v1}</code>) — xem{' '}
            <Link to="/guide/multi-protocol">danh sách giao thức</Link>.
          </>
        ),
      },
    ],
    shots: [
      {
        src: '/images/guide/clients/gemini-cli-auth.png',
        alt: 'Gemini CLI auth method selection',
        caption: {
          zh: 'Gemini CLI · 认证方式选择',
          en: 'Gemini CLI · auth method selection',
          ru: 'Gemini CLI · выбор способа аутентификации',
          vi: 'Gemini CLI · chọn cách xác thực',
        },
      },
    ],
    rootBase: true,
  },
}

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
        src="/images/guide/daoxe/11-cc-switch-main.png"
        alt="CC Switch main window with add button"
        caption={pickLang(lang, {
          zh: 'CC Switch 主界面 · 右上角「+」添加供应商（实拍）',
          en: 'CC Switch main window · «+» adds a provider',
          ru: 'Главное окно CC Switch · «+» добавляет провайдера',
          vi: 'Cửa sổ chính CC Switch · «+» để thêm nhà cung cấp',
        })}
      />
      <Shot
        src="/images/guide/daoxe/12-cc-switch-add-daoxe.png"
        alt="CC Switch add provider form filled with DaoXE"
        caption={pickLang(lang, {
          zh: '添加供应商表单 · 请求地址填兼容 Claude API 的站点根，不要以斜杠结尾（实拍）',
          en: 'Add-provider form · request URL is the Claude-compatible site root, no trailing slash',
          ru: 'Форма добавления провайдера · адрес запроса — совместимый с Claude API корень сайта, без слеша в конце',
          vi: 'Form thêm nhà cung cấp · địa chỉ request là gốc site tương thích Claude API, không có gạch chéo cuối',
        })}
      />
      <Shot
        src="/images/guide/daoxe/13-cc-switch-active.png"
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
