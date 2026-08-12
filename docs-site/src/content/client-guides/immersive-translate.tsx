import { Link } from 'react-router-dom'
import { MODEL_LINKS, type ClientGuide } from './shared'

export const immersiveTranslateGuide: ClientGuide = {
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
}
