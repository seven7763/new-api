import { Link } from 'react-router-dom'
import type { ClientGuide } from './shared'

export const geminiCliGuide: ClientGuide = {
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
}
