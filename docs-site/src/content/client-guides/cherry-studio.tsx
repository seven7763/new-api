import { MODEL_LINKS, type ClientGuide } from './shared'

export const cherryStudioGuide: ClientGuide = {
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
}
