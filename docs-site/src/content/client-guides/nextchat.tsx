import { MODEL_LINKS, type ClientGuide } from './shared'

export const nextchatGuide: ClientGuide = {
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
}
