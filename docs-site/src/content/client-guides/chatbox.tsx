import { MODEL_LINKS, type ClientGuide } from './shared'

export const chatboxGuide: ClientGuide = {
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
}
