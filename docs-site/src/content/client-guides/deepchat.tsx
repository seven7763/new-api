import { Link } from 'react-router-dom'
import { MODEL_LINKS, type ClientGuide } from './shared'

export const deepchatGuide: ClientGuide = {
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
      src: '/images/guide/daoxe/14-deepchat-provider.webp',
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
}
