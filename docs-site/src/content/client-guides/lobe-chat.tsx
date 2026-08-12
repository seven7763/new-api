import { MODEL_LINKS, type ClientGuide } from './shared'

export const lobeChatGuide: ClientGuide = {
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
}
