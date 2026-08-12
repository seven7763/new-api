import { MODEL_LINKS, type ClientGuide } from './shared'

export const openWebuiGuide: ClientGuide = {
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
}
