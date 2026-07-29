import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpenText,
  Boxes,
  Braces,
  Rocket,
  TerminalSquare,
  Waypoints,
} from 'lucide-react'
import {
  AnthropicAuthHeaders,
  BasePills,
  Callout,
  Card,
  CardGrid,
  CodeBlock,
  CurlChatExample,
  CurlMessagesExample,
  CurlModelsExample,
  Hero,
  ModelIdNote,
  OpenAIAuthHeaders,
  Page,
  PrerequisiteKey,
  ProtocolCheatSheet,
  Related,
  Shot,
  Steps,
} from '@/components/DocUI'
import { Button } from '@/components/ui/button'
import { absSite } from '@/config'
import {
  LiveAppsBlock,
  LiveAuthOptionsBlock,
  LiveContactBlock,
  LiveEndpointsBlock,
  LiveRoutesBlock,
} from '@/components/LivePages'

/**
 * Vietnamese article bodies. Pages missing here fall back to en, then the zh
 * registry (live-data pages and the bilingual client guides are language-aware).
 */
export const contentVi: Record<string, () => ReactNode> = {
  welcome: () => (
    <>
      <Hero
        eyebrow="DaoXE Docs"
        title="Tài liệu DaoXE"
        lead="Trước tiên hãy lấy key và ID mô hình, rồi kết nối theo giao thức của client. Tài liệu chỉ mô tả những gì DaoXE thực sự hỗ trợ."
        actions={
          <>
            <Button asChild>
              <Link to="/start/quickstart" className="no-underline">
                <Rocket className="size-4" /> Bắt đầu nhanh
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/guide/recommended-models" className="no-underline">
                <Boxes className="size-4" /> Bảng mô hình
              </Link>
            </Button>
          </>
        }
      />
      <PrerequisiteKey />
      <h2>Tuyến</h2>
      <BasePills />
      <h2>Chọn giao thức nào</h2>
      <p>
        Client tương thích OpenAI thêm <code>/v1</code> vào tuyến đã chọn; Claude (Anthropic) dùng gốc site với
        đường dẫn <code>/v1/messages</code>. Bảng đối chiếu giao thức đầy đủ:{' '}
        <Link to="/guide/multi-protocol">danh sách giao thức</Link>; tuyến và Base URL:{' '}
        <Link to="/guide/base-url">tuyến và Base URL</Link>.
      </p>
      <h2>Lộ trình học</h2>
      <CardGrid>
        <Card to="/start/quickstart" icon={<Rocket />} title="1. Bắt đầu nhanh" desc="Chạy được một yêu cầu tối thiểu" />
        <Card
          to="/guide/recommended-models"
          icon={<Boxes />}
          title="2. Chọn mô hình"
          desc="Bảng thời gian thực từ API giá"
        />
        <Card
          to="/guide/multi-protocol"
          icon={<Waypoints />}
          title="3. Chọn giao thức"
          desc="OpenAI hay Claude"
        />
        <Card to="/guide/deepchat" icon={<BookOpenText />} title="4a. DeepChat" desc="Nhà cung cấp tích hợp chính thức" />
        <Card
          to="/guide/claude-code"
          icon={<TerminalSquare />}
          title="4b. Claude Code"
          desc="Messages"
        />
        <Card to="/guide/sdk" icon={<Braces />} title="4c. SDK" desc="Python / Node" />
      </CardGrid>
      <p className="text-muted-foreground text-sm">
        Script chạy được &amp; Postman:{' '}
        <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
          seven7763/DaoXE-AI
        </a>
      </p>
    </>
  ),

  quickstart: () => (
    <Page title="Bắt đầu nhanh" lead="Một mục tiêu: chứng minh key + ID mô hình + tuyến đều hoạt động.">
      <Steps
        items={[
          <>Đăng ký và nạp tiền trên trang chính.</>,
          <>
            <Link to="/guide/keys">Tạo key</Link> và chọn đúng nhóm.
          </>,
          <>
            Sao chép ID mô hình từ <Link to="/guide/recommended-models">bảng mô hình</Link> hoặc qua{' '}
            <code>/v1/models</code> bên dưới.
          </>,
          <>Gửi một yêu cầu tối thiểu; chỉ cấu hình client sau khi thành công.</>,
        ]}
      />
      <h2>Liệt kê mô hình</h2>
      <CurlModelsExample />
      <h2>Chat tối thiểu</h2>
      <CurlChatExample />
      <h2>Messages tối thiểu (nếu dùng Claude)</h2>
      <CurlMessagesExample />
      <p>
        Chuyển tuyến và dạng Base URL: <Link to="/guide/base-url">tuyến</Link> /{' '}
        <Link to="/guide/multi-protocol">giao thức</Link>. Khi lỗi, xem{' '}
        <Link to="/guide/errors">lỗi thường gặp</Link>.
      </p>
    </Page>
  ),

  compliance: () => (
    <Page title="Tài khoản & tuân thủ" lead="Toàn văn pháp lý nằm trên trang chính.">
      <Callout title="Khu vực dịch vụ" warn>
        Dịch vụ này <strong>không khả dụng tại Trung Quốc đại lục</strong>. Ưu tiên theo thông báo và điều khoản
        của trang chính.
      </Callout>
      <ul>
        <li>
          Đăng ký / đăng nhập chỉ thực hiện trên trang chính (
          <a href={absSite('/sign-in')} target="_blank" rel="noopener noreferrer">
            đăng nhập
          </a>
          ).
        </li>
        <li>Giữ API key an toàn; đừng bao giờ đưa lên kho công khai.</li>
        <li>Nhóm của key quyết định mô hình khả dụng và cách tính phí.</li>
        <li>Cấm dùng cho mục đích trái pháp luật.</li>
      </ul>
      <CardGrid>
        <Card href={absSite('/user-agreement')} title="Điều khoản ↗" desc="Toàn văn trên trang chính" />
        <Card href={absSite('/privacy-policy')} title="Quyền riêng tư ↗" desc="Toàn văn trên trang chính" />
        <Card to="/legal/abuse" title="Báo cáo lạm dụng" desc="Phản hồi bảo mật & vi phạm" />
      </CardGrid>
    </Page>
  ),

  console: () => (
    <Page title="Tour bảng điều khiển" lead="Các mục thường dùng sau khi đăng nhập (ưu tiên menu console thực tế).">
      <Shot
        src="/images/guide/daoxe/04-console.png"
        alt="Tổng quan console"
        caption="Tổng quan console"
      />
      <Shot
        src="/images/guide/daoxe/06-onboarding.png"
        alt="Hướng dẫn cho người mới"
        caption="Onboarding trên trang tổng quan / các bước «Bắt đầu»"
      />
      <table>
        <thead>
          <tr>
            <th>Mục</th>
            <th>Công dụng</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tổng quan</td>
            <td>Tóm tắt sử dụng, lối tắt</td>
          </tr>
          <tr>
            <td>Ví</td>
            <td>
              Nạp tiền / gói / mã đổi thưởng (<Link to="/guide/topup">hướng dẫn</Link>)
            </td>
          </tr>
          <tr>
            <td>API Key</td>
            <td>
              Tạo và quản lý key (<Link to="/guide/keys">hướng dẫn</Link>)
            </td>
          </tr>
          <tr>
            <td>Sàn mô hình / Giá</td>
            <td>
              Mô hình và nhóm (<Link to="/guide/recommended-models">bảng đề xuất</Link>)
            </td>
          </tr>
          <tr>
            <td>Nhật ký sử dụng</td>
            <td>
              Yêu cầu và trừ phí (<Link to="/billing/logs">hướng dẫn</Link>)
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Ứng dụng một chạm (thời gian thực)</h2>
      <LiveAppsBlock />
    </Page>
  ),

  register: () => (
    <Page title="Đăng ký & đăng nhập" lead="Tài khoản nằm trên trang chính; các tùy chọn đăng nhập bên dưới đến từ cờ status thời gian thực.">
      <LiveAuthOptionsBlock />
      <Steps
        items={[
          <>
            Mở{' '}
            <a href={absSite('/')} target="_blank" rel="noopener noreferrer">
              https://daoxe.com
            </a>
          </>,
          <>Bấm «Đăng nhập» / «Đăng ký».</>,
          <>Xác thực bằng bất kỳ phương thức nào đã bật ở trên (mật khẩu / GitHub / Telegram / Passkey…).</>,
          <>
            Vào console rồi tiếp tục <Link to="/guide/topup">nạp tiền</Link> và{' '}
            <Link to="/guide/keys">tạo key</Link>.
          </>,
        ]}
      />
      <Shot src="/images/guide/daoxe/01-home.png" alt="Trang chủ" caption="Trang chủ DaoXE" />
      <Shot src="/images/guide/daoxe/03-login.png" alt="Trang đăng nhập" caption="Trang đăng nhập" />
      <Shot src="/images/guide/daoxe/03b-signup.png" alt="Trang đăng ký" caption="Trang đăng ký" />
      <Shot src="/images/guide/daoxe/02-pricing.png" alt="Sàn mô hình" caption="Sàn mô hình (trang công khai)" />
      <CardGrid>
        <Card href={absSite('/sign-in')} title="Đăng nhập ↗" desc="daoxe.com/sign-in" />
        <Card href={absSite('/sign-up')} title="Đăng ký ↗" desc="daoxe.com/sign-up" />
        <Card href={absSite('/dashboard')} title="Console ↗" desc="Sau khi đăng nhập" />
      </CardGrid>
    </Page>
  ),

  topup: () => (
    <Page title="Nạp tiền & gói" lead="Nạp tiền, đăng ký gói hoặc dùng mã đổi thưởng ở trang «Ví» trong console.">
      <Steps
        items={[
          <>Mở «Ví» ở menu bên trái.</>,
          <>Nạp tiền hoặc đăng ký gói bằng bất kỳ phương thức nào trang cung cấp.</>,
          <>Dùng mã đổi thưởng ở ô tương ứng nếu có.</>,
          <>Sau khi thanh toán, làm mới số dư; một số kênh cần chút thời gian để vào tiền.</>,
        ]}
      />
      <Shot
        src="/images/guide/daoxe/05-wallet.png"
        alt="Ví"
        caption="Trang ví: nạp tiền / gói / mã đổi thưởng"
      />
      <p>
        Khái niệm tính phí: <Link to="/billing/rules">quy tắc tính phí</Link>. Thanh toán chưa vào:{' '}
        <Link to="/billing/topup-issues">đối soát nạp tiền</Link>.
      </p>
    </Page>
  ),

  keys: () => (
    <Page title="Tạo API key" lead="Bước bắt buộc trước mọi client.">
      <Callout title="Bảo mật" warn>
        Sao chép key ngay sau khi tạo. Nếu bị lộ, hãy xóa và tạo lại, rồi cập nhật mọi client. Che <code>sk-</code>{' '}
        trong ảnh chụp.
      </Callout>
      <Steps
        items={[
          <>Console → «API Key» → Tạo.</>,
          <>
            Đặt tên; <strong>nhóm</strong> quyết định mô hình khả dụng (xem{' '}
            <Link to="/guide/recommended-models">bảng mô hình</Link> / sàn).
          </>,
          <>
            Lưu và sao chép giá trị <code>sk-...</code>.
          </>,
        ]}
      />
      <Shot
        src="/images/guide/daoxe/07-create-key.png"
        alt="Tạo key"
        caption="Form tạo API key (key đã được che)"
      />
      <p>
        Header xác thực: <Link to="/api/auth">xác thực &amp; header</Link>. Quản lý:{' '}
        <Link to="/features/keys">quản lý key</Link>.
      </p>
    </Page>
  ),

  'base-url': () => (
    <Page title="Tuyến & Base URL" lead="Host và giao thức theo API công khai; các tuyến bên dưới đến từ status.api_info theo thời gian thực.">
      <LiveRoutesBlock />
      <Shot
        src="/images/guide/daoxe/10-api-routes.png"
        alt="Thẻ API info trong console với các tuyến đã cấu hình và kiểm tra độ trễ"
        caption="Thẻ «API info» trong console — các tuyến đã cấu hình kèm kiểm tra độ trễ, cùng nguồn với danh sách thời gian thực ở trên"
      />
      <h2>Dạng giao thức (điền gì vào Base)</h2>
      <p>
        Client tương thích OpenAI thêm <code>/v1</code> vào tuyến đã chọn; Anthropic (Claude) dùng gốc site với
        đường dẫn <code>/v1/messages</code>. Bảng đối chiếu giao thức đầy đủ:{' '}
        <Link to="/guide/multi-protocol">danh sách giao thức</Link>.
      </p>
      <Callout title="Host có thể thay thế">
        Bất kỳ host tuyến nào ở trên đều dùng được — thay bằng url bất kỳ do api_info trả về. Client tương thích
        OpenAI thường thêm <code>/v1</code>; Anthropic dùng gốc site.
      </Callout>
      <Related
        items={[
          { to: '/guide/multi-protocol', label: 'Danh sách giao thức' },
          { to: '/api/routing', label: 'Luồng & timeout' },
        ]}
      />
    </Page>
  ),

  models: () => (
    <Page title="Mô hình & nhóm" lead="Ba khái niệm liên kết: key thuộc một nhóm, nhóm quyết định mô hình và hệ số, ID mô hình chọn mô hình cụ thể.">
      <ul>
        <li>
          <strong>Nhóm</strong>: chọn khi tạo key; quyết định key gọi được mô hình nào và với hệ số nào. Phân biệt
          hai lỗi quyền: token không được phép dùng mô hình → <code>403</code> (kiểm tra danh sách mô hình cho
          phép / quyền của token); nhóm đã chọn không có kênh khả dụng cho mô hình →{' '}
          <code>503 / no available channel</code> (đổi sang nhóm có chứa mô hình, hoặc xác nhận mô hình có kênh
          khả dụng trong nhóm hiện tại)
        </li>
        <li>
          <strong>ID mô hình</strong>: phải khớp chính xác với trang (phân biệt hoa thường và hậu tố). Sao chép từ{' '}
          <Link to="/guide/recommended-models">bảng mô hình</Link> hoặc qua <code>/v1/models</code>
        </li>
        <li>
          <strong>Endpoint giao thức</strong>: một mô hình có thể phục vụ nhiều giao thức (Chat / Responses /
          Messages) — xem bảng thời gian thực bên dưới
        </li>
      </ul>
      <LiveEndpointsBlock />
      <p>
        Mẫu chọn lọc &amp; tìm kiếm: <Link to="/guide/recommended-models">bảng mô hình</Link>. Tạo key:{' '}
        <Link to="/guide/keys">tạo key</Link>.
      </p>
    </Page>
  ),

  clients: () => (
    <Page title="Tổng quan tích hợp client" lead="Chọn chương theo loại client; chi tiết giao thức chỉ nằm ở trang giao thức.">
      <Callout title="Nhà cung cấp tích hợp sẵn">
        <Link to="/guide/deepchat">DeepChat</Link> đã tích hợp sẵn DaoXE — tìm, bật và dán key. Không cần điền Base
        URL. Cách dễ nhất cho người mới.
      </Callout>
      <p>
        Mỗi chương chỉ nói về các trường của client đó. Dạng Base URL và ánh xạ giao thức nằm trong{' '}
        <Link to="/guide/multi-protocol">danh sách giao thức</Link>; chọn tuyến ở{' '}
        <Link to="/guide/base-url">tuyến &amp; Base URL</Link>.
      </p>
      <h2>CLI / công cụ lập trình</h2>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Giao thức / Base</th>
            <th>Tài liệu</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Claude Code</td>
            <td>Anthropic · gốc site</td>
            <td>
              <Link to="/guide/claude-code">Chương</Link> · <Link to="/guide/cc-switch">CC Switch (GUI)</Link>
            </td>
          </tr>
          <tr>
            <td>Codex CLI</td>
            <td>
              OpenAI · <code>/v1</code> (responses)
            </td>
            <td>
              <Link to="/guide/codex">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>Gemini CLI</td>
            <td>Gemini · gốc site</td>
            <td>
              <Link to="/guide/gemini-cli">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>Cline / Cursor</td>
            <td>
              OpenAI · <code>/v1</code>
            </td>
            <td>
              <Link to="/guide/cline">Cline</Link> · <Link to="/guide/cursor">Cursor</Link>
            </td>
          </tr>
          <tr>
            <td>OpenCode / OpenClaw</td>
            <td>OpenAI hoặc Anthropic</td>
            <td>
              <Link to="/guide/opencode">OpenCode</Link> · <Link to="/guide/openclaw">OpenClaw</Link>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Client giao diện</h2>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Hình thức</th>
            <th>Tài liệu</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DeepChat</td>
            <td>Desktop · DaoXE tích hợp sẵn</td>
            <td>
              <Link to="/guide/deepchat">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>Cherry Studio</td>
            <td>Desktop</td>
            <td>
              <Link to="/guide/cherry-studio">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>ChatBox</td>
            <td>Desktop + di động</td>
            <td>
              <Link to="/guide/chatbox">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>Lobe Chat</td>
            <td>Web (tự host được)</td>
            <td>
              <Link to="/guide/lobe-chat">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>NextChat</td>
            <td>Web + desktop</td>
            <td>
              <Link to="/guide/nextchat">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>Open WebUI</td>
            <td>Web tự host</td>
            <td>
              <Link to="/guide/open-webui">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>Immersive Translate</td>
            <td>Tiện ích trình duyệt</td>
            <td>
              <Link to="/guide/immersive-translate">Chương</Link>
            </td>
          </tr>
          <tr>
            <td>Khác (Continue / Aider…)</td>
            <td>OpenAI Compatible chung</td>
            <td>
              <Link to="/guide/apps">Client giao diện &amp; khác</Link>
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  ),

  cline: () => (
    <Page title="Cline" lead="VS Code: OpenAI Compatible → DaoXE.">
      <PrerequisiteKey />
      <Steps
        items={[
          <>Cài đặt Cline → API Provider = OpenAI Compatible.</>,
          <>
            Base URL = <code>https://api.daoxe.com/v1</code> (xem{' '}
            <Link to="/guide/multi-protocol">danh sách giao thức</Link>).
          </>,
          <>Dán key sk; sao chép ID mô hình từ bảng mô hình hoặc /v1/models.</>,
        ]}
      />
      <Callout title="Không có mục DaoXE riêng">
        Dùng OpenAI Compatible với Base tùy chỉnh — đừng tìm tùy chọn DaoXE riêng.
      </Callout>
      <p>
        Kiểm tra bằng <Link to="/guide/verify">curl</Link> trước khi mở Cline.
      </p>
    </Page>
  ),

  'claude-code': () => (
    <Page title="Claude Code" lead="Anthropic Messages. Base là gốc site.">
      <PrerequisiteKey />
      <p>
        Chi tiết giao thức: <Link to="/guide/multi-protocol">danh sách giao thức</Link>. Trước tiên chạy được
        Messages:
      </p>
      <CurlMessagesExample />
      <h2>Biến môi trường / settings</h2>
      <CodeBlock
        lang="bash"
        code={`export ANTHROPIC_BASE_URL="https://api.daoxe.com"
export ANTHROPIC_API_KEY="sk-xxxx"`}
      />
      <CodeBlock
        lang="json"
        code={`{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.daoxe.com",
    "ANTHROPIC_API_KEY": "sk-xxxx"
  }
}`}
      />
      <p>
        Thư mục: <code>~/.claude</code>. Kiểm tra bằng <code>claude</code>. Nếu curl chạy nhưng CLI lỗi: kiểm tra
        <code>/v1</code> thừa hoặc biến môi trường ghi đè. Tài liệu gốc:{' '}
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/CLAUDE_CODE.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          CLAUDE_CODE.md
        </a>
        . Thích GUI? Xem <Link to="/guide/cc-switch">CC Switch</Link>.
      </p>
    </Page>
  ),

  codex: () => (
    <Page title="Codex CLI" lead="OpenAI /v1 + responses.">
      <PrerequisiteKey />
      <CodeBlock
        lang="bash"
        code={`export OPENAI_API_KEY="sk-xxxx"
export OPENAI_BASE_URL="https://api.daoxe.com/v1"
codex`}
      />
      <CodeBlock
        lang="toml"
        code={`model_provider = "daoxe"

[model_providers.daoxe]
name = "DaoXE"
base_url = "https://api.daoxe.com/v1"
wire_api = "responses"
requires_openai_auth = true`}
      />
      <CodeBlock lang="json" code={`{\n  "OPENAI_API_KEY": "sk-xxxx"\n}`} />
      <Callout title="/v1 bắt buộc" warn>
        Xem <Link to="/guide/multi-protocol">danh sách giao thức</Link> ·{' '}
        <Link to="/api/openai-responses">Responses</Link>
      </Callout>
    </Page>
  ),

  apps: () => (
    <Page title="Client giao diện & khác" lead="Trường OpenAI Compatible chung; danh sách ứng dụng một chạm trên trang đến từ status.chats.">
      <PrerequisiteKey />
      <h2>Ứng dụng đã cấu hình trên trang (thời gian thực)</h2>
      <LiveAppsBlock />
      <h2>Trường chung</h2>
      <p>
        Xem <Link to="/guide/multi-protocol">danh sách giao thức</Link>. Ví dụ Continue:
      </p>
      <CodeBlock
        lang="yaml"
        code={`models:
  - name: DaoXE
    provider: openai
    model: <MODEL_ID>
    apiBase: https://api.daoxe.com/v1
    apiKey: sk-xxxx`}
      />
      <CodeBlock
        lang="bash"
        code={`export OPENAI_API_KEY="sk-xxxx"
export OPENAI_API_BASE="https://api.daoxe.com/v1"
aider --model <MODEL_ID>`}
      />
      <p>
        Thêm ánh xạ trường của các client:{' '}
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/CLIENT_SETUP.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          CLIENT_SETUP.md
        </a>
      </p>
    </Page>
  ),

  openclaw: () => (
    <Page title="OpenClaw" lead="Cấu hình nhà cung cấp với tương thích OpenAI hoặc Anthropic.">
      <PrerequisiteKey />
      <p>
        Chọn một (dạng nằm trong <Link to="/guide/multi-protocol">danh sách giao thức</Link>):
      </p>
      <ul>
        <li>
          OpenAI: baseUrl <code>https://api.daoxe.com/v1</code>
        </li>
        <li>
          Anthropic: baseUrl <code>https://api.daoxe.com</code>, api = anthropic-messages
        </li>
      </ul>
      <CodeBlock
        lang="json"
        code={`{
  "models": {
    "providers": {
      "daoxe": {
        "baseUrl": "https://api.daoxe.com/v1",
        "apiKey": "sk-xxxx",
        "api": "openai-completions",
        "models": [{ "id": "your-model-id", "name": "Display name" }]
      }
    }
  }
}`}
      />
      <p>Dùng kho OpenClaw chính thức cho script cài đặt.</p>
    </Page>
  ),

  opencode: () => (
    <Page title="OpenCode" lead="Trỏ cấu hình nhà cung cấp về DaoXE.">
      <PrerequisiteKey />
      <CodeBlock
        lang="json"
        code={`{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "daoxe": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DaoXE",
      "options": {
        "baseURL": "https://api.daoxe.com/v1",
        "apiKey": "sk-xxxx"
      },
      "models": {
        "your-model-id": { "name": "Display name" }
      }
    }
  }
}`}
      />
      <p>
        Các bước cài đặt và tên gói theo OpenCode chính thức. <Link to="/guide/verify">curl</Link> trước khi kiểm
        tra trong ứng dụng.
      </p>
    </Page>
  ),

  cursor: () => (
    <Page title="Cursor" lead="Base OpenAI tùy chỉnh (tên tùy chọn thay đổi theo phiên bản).">
      <PrerequisiteKey />
      <Steps
        items={[
          <>Settings → Models / các tùy chọn tương thích OpenAI.</>,
          <>
            Ghi đè Base URL = <code>https://api.daoxe.com/v1</code>
          </>,
          <>Dán key sk; tên mô hình phải khớp chính xác ID trên sàn.</>,
        ]}
      />
      <Related items={[{ to: '/guide/multi-protocol', label: 'Danh sách giao thức' }, { to: '/guide/verify', label: 'Kiểm tra curl' }]} />
    </Page>
  ),

  sdk: () => (
    <Page title="Ví dụ SDK chính thức" lead="Chỉ mã SDK; ví dụ curl ở trang kiểm tra, JSON phản hồi ở các trang API.">
      <ModelIdNote />
      <CodeBlock
        lang="python"
        code={`from openai import OpenAI
client = OpenAI(api_key="sk-xxxx", base_url="https://api.daoxe.com/v1")
print(client.chat.completions.create(
    model="your-model-id",
    messages=[{"role":"user","content":"ping"}],
    max_tokens=64,
).choices[0].message.content)`}
      />
      <CodeBlock
        lang="js"
        code={`import OpenAI from "openai";
const client = new OpenAI({ apiKey: "sk-xxxx", baseURL: "https://api.daoxe.com/v1" });
const r = await client.chat.completions.create({
  model: "your-model-id",
  messages: [{ role: "user", content: "ping" }],
  max_tokens: 64,
});
console.log(r.choices[0].message.content);`}
      />
      <CodeBlock
        lang="python"
        code={`import anthropic
client = anthropic.Anthropic(api_key="sk-xxxx", base_url="https://api.daoxe.com")
msg = client.messages.create(
    model="your-claude-model-id",
    max_tokens=64,
    messages=[{"role":"user","content":"ping"}],
)
print(msg.content[0].text)`}
      />
      <p>
        Kho chạy được:{' '}
        <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
          DaoXE-AI
        </a>
        . Ví dụ phản hồi / lỗi: <Link to="/api/openai-chat">Chat</Link> ·{' '}
        <Link to="/api/claude">Messages</Link>.
      </p>
    </Page>
  ),

  'multi-protocol': () => (
    <Page title="Danh sách giao thức" lead="Bảng ánh xạ giao thức có thẩm quyền duy nhất; các chương client chỉ trỏ về đây.">
      <p>
        Các tuyến và host khả dụng được duy trì trong <Link to="/guide/base-url">tuyến &amp; Base URL</Link>; host
        trong bảng theo api_info thời gian thực.
      </p>
      <h2>Ánh xạ giao thức</h2>
      <ProtocolCheatSheet />
      <h2>Kiểm thử trước khi cấu hình</h2>
      <p>
        Trước khi cấu hình bất kỳ client nào, hãy chạy một yêu cầu Chat / Messages tối thiểu bằng curl để xác nhận
        key và tuyến hoạt động: <Link to="/guide/verify">kiểm tra curl</Link>.
      </p>
      <h2>Ánh xạ client</h2>
      <ul>
        <li>
          <Link to="/guide/cline">Cline</Link> / <Link to="/guide/cursor">Cursor</Link> → OpenAI Compatible (Base
          kèm <code>/v1</code>)
        </li>
        <li>
          <Link to="/guide/claude-code">Claude Code</Link> → gốc site + Messages
        </li>
        <li>
          <Link to="/guide/codex">Codex</Link> → <code>/v1</code> + responses
        </li>
      </ul>
      <h2>Triệu chứng khi điền nhầm</h2>
      <ul>
        <li>
          Thừa <code>/v1</code> trên Base của Claude → <code>/v1/v1/messages</code>
        </li>
        <li>
          Thiếu <code>/v1</code> ở client OpenAI → 404
        </li>
        <li>
          Token không được phép dùng mô hình → <code>403</code>; nhóm đã chọn không có kênh khả dụng cho mô hình →{' '}
          <code>503 / no available channel</code>
        </li>
      </ul>
    </Page>
  ),

  verify: () => (
    <Page title="Kiểm tra curl" lead="Điểm vào để gỡ lỗi: lệnh dò nằm ở đây; các trang khác trỏ về đây.">
      <ModelIdNote />
      <h2>1. Mô hình</h2>
      <CurlModelsExample />
      <h2>2. Chat</h2>
      <CurlChatExample />
      <h2>3. Messages</h2>
      <CurlMessagesExample />
      <h2>4. So sánh với tuyến jp</h2>
      <CodeBlock
        code={`curl https://jp.daoxe.com/v1/models \\
  -H "Authorization: Bearer sk-xxxx"`}
      />
      <Callout title="Mẹo">
        Thêm <code>-N</code> để giảm đệm; <code>-i</code> để thấy dòng trạng thái. Script trong kho:{' '}
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/curl-chat.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          curl-chat.sh
        </a>
        .
      </Callout>
      <Related items={[{ to: '/guide/errors', label: 'Bảng lỗi' }, { to: '/api/errors', label: 'Ví dụ JSON lỗi' }]} />
    </Page>
  ),

  errors: () => (
    <Page title="Lỗi thường gặp" lead="Hướng xử lý cho người dùng; ví dụ JSON thô ở trang mã lỗi API.">
      <table>
        <thead>
          <tr>
            <th>Trạng thái</th>
            <th>Cách xử lý</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>401</td>
            <td>Sao chép lại key sk, kiểm tra header Bearer, tạo lại key</td>
          </tr>
          <tr>
            <td>403</td>
            <td>Hết số dư → nạp tiền; token không được phép dùng mô hình → kiểm tra danh sách mô hình cho phép / quyền của token</td>
          </tr>
          <tr>
            <td>404</td>
            <td>
              Base thiếu hoặc lặp <code>/v1</code> (<Link to="/guide/multi-protocol">giao thức</Link>)
            </td>
          </tr>
          <tr>
            <td>429</td>
            <td>
              Giảm đồng thời (<Link to="/api/rate-limit">giới hạn tốc độ</Link>)
            </td>
          </tr>
          <tr>
            <td>503</td>
            <td>
              Nhóm không có kênh khả dụng cho mô hình: đổi sang nhóm có chứa mô hình, hoặc xác nhận mô hình có
              kênh khả dụng trong nhóm hiện tại (
              <Link to="/guide/models">Mô hình &amp; nhóm</Link>)
            </td>
          </tr>
          <tr>
            <td>5xx / timeout</td>
            <td>Chuyển sang jp, giảm max_tokens, thử lại</td>
          </tr>
        </tbody>
      </table>
      <Steps
        items={[
          <>
            <Link to="/guide/verify">Kiểm tra curl</Link>
          </>,
          <>Chat/messages tối thiểu với cùng key</>,
          <>Kiểm tra Base của giao thức</>,
          <>
            Vẫn lỗi: <Link to="/support/contact">liên hệ hỗ trợ</Link> kèm{' '}
            <Link to="/api/errors">JSON lỗi</Link>
          </>,
        ]}
      />
    </Page>
  ),

  auth: () => (
    <Page title="Xác thực & header" lead="Header sai là nguyên nhân hàng đầu gây 401. Danh sách endpoint đến từ API giá.">
      <h2>Header yêu cầu</h2>
      <h3>Tương thích OpenAI</h3>
      <OpenAIAuthHeaders />
      <h3>Tương thích Anthropic</h3>
      <AnthropicAuthHeaders />
      <h2>Endpoint do trang khai báo (thời gian thực)</h2>
      <LiveEndpointsBlock />
      <Callout title="Bảo mật">
        Tách key theo mục đích; khi lộ thì xóa và tạo lại. Đừng bao giờ commit vào Git.
      </Callout>
      <Related
        items={[
          { to: '/guide/keys', label: 'Tạo key' },
          { to: '/guide/verify', label: 'Kiểm tra curl' },
        ]}
      />
    </Page>
  ),

  routing: () => (
    <Page title="Tuyến · luồng · timeout" lead="Chọn host và chiến lược timeout; dạng Base ở trang giao thức.">
      <BasePills />
      <ul>
        <li>Luồng (streaming) là bình thường; quá nhiều yêu cầu đồng thời sẽ gây 429</li>
        <li>Timeout: chuyển sang jp, giảm max_tokens, chia nhỏ tác vụ, thử lại sau 2–5 giây</li>
        <li>Các tuyến API vẫn có thể hoạt động ngay cả khi trang web không truy cập được</li>
      </ul>
      <Related
        items={[
          { to: '/guide/base-url', label: 'Tuyến' },
          { to: '/guide/multi-protocol', label: 'Giao thức' },
          { to: '/api/rate-limit', label: 'Giới hạn tốc độ' },
        ]}
      />
    </Page>
  ),

  'openai-chat': () => (
    <Page title="OpenAI · Chat Completions" lead="POST /v1/chat/completions">
      <p>
        Xác thực: <Link to="/api/auth">trang xác thực</Link>. Base:{' '}
        <Link to="/guide/multi-protocol">danh sách giao thức</Link>. Lệnh dò:{' '}
        <Link to="/guide/verify">kiểm tra curl</Link>.
      </p>
      <OpenAIAuthHeaders />
      <CurlChatExample />
      <h2>Phản hồi thành công (cấu trúc)</h2>
      <CodeBlock
        lang="json"
        code={`{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "..." },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}`}
      />
      <h2>Mảnh luồng (ví dụ)</h2>
      <CodeBlock
        lang="text"
        code={`data: {"choices":[{"delta":{"content":"Hi"}}]}
data: [DONE]`}
      />
      <h2>Ví dụ lỗi</h2>
      <CodeBlock
        lang="json"
        code={`{"error":{"message":"Invalid token","code":401}}
{"error":{"message":"Insufficient quota"}}
{"error":{"message":"Rate limit exceeded"}}`}
      />
      <p>
        Thêm lỗi: <Link to="/api/errors">mã lỗi</Link>. Mô hình:{' '}
        <Link to="/guide/recommended-models">bảng mô hình</Link>.
      </p>
    </Page>
  ),

  'openai-responses': () => (
    <Page title="OpenAI · Responses" lead="POST /v1/responses (API giá khai báo endpoint openai-response).">
      <p>
        Base là <code>.../v1</code>. Bước cho client: <Link to="/guide/codex">Codex</Link>.
      </p>
      <OpenAIAuthHeaders />
      <CodeBlock lang="text" code={`POST https://api.daoxe.com/v1/responses`} />
      <CodeBlock
        lang="json"
        code={`// trả về khi đường dẫn hoặc Base sai
{"error":{"message":"Invalid URL (POST /responses)","type":"invalid_request_error"}}`}
      />
      <p>
        Những mô hình nào hỗ trợ endpoint này được xác định bởi thẻ giao thức trong bảng mô hình /{' '}
        <code>supported_endpoint_types</code> của API giá.
      </p>
    </Page>
  ),

  'openai-embeddings': () => (
    <Page title="OpenAI · Embeddings" lead="POST /v1/embeddings (do API giá khai báo).">
      <p>
        Xác thực: <Link to="/api/auth">trang xác thực</Link>. Các mô hình embedding khả dụng: xem{' '}
        <Link to="/guide/recommended-models">bảng mô hình</Link> / sàn (tên nhóm thường có «Embedding»).
      </p>
      <OpenAIAuthHeaders />
      <CodeBlock
        code={`curl https://api.daoxe.com/v1/embeddings \\
  -H "Authorization: Bearer sk-xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "copy from the models table or /v1/models",
    "input": "Hello"
  }'`}
      />
      <CodeBlock
        lang="json"
        code={`{
  "object": "list",
  "data": [
    { "object": "embedding", "index": 0, "embedding": [0.01, -0.02] }
  ],
  "model": "…",
  "usage": { "prompt_tokens": 1, "total_tokens": 1 }
}`}
      />
    </Page>
  ),

  claude: () => (
    <Page title="Anthropic · Messages" lead="POST /v1/messages">
      <p>
        Xác thực: <Link to="/api/auth">trang xác thực</Link>. Claude Code:{' '}
        <Link to="/guide/claude-code">chương</Link>. Base là gốc site — xem{' '}
        <Link to="/guide/multi-protocol">giao thức</Link>.
      </p>
      <AnthropicAuthHeaders />
      <CurlMessagesExample />
      <Callout title="max_tokens" warn>
        Yêu cầu Messages thường bắt buộc có <code>max_tokens</code>.
      </Callout>
      <h2>Phản hồi thành công (cấu trúc)</h2>
      <CodeBlock
        lang="json"
        code={`{
  "id": "msg_xxx",
  "type": "message",
  "role": "assistant",
  "content": [{ "type": "text", "text": "..." }],
  "stop_reason": "end_turn",
  "usage": { "input_tokens": 10, "output_tokens": 20 }
}`}
      />
      <h2>Ví dụ lỗi</h2>
      <CodeBlock
        lang="json"
        code={`{"type":"error","error":{"type":"invalid_request_error","message":"max_tokens: required"}}
{"error":{"message":"Invalid token","code":401}}`}
      />
    </Page>
  ),

  gemini: () => (
    <Page title="Tương thích Gemini" lead="API giá khai báo endpoint gemini; ID mô hình Gemini cũng chạy qua OpenAI Chat (nếu nhóm cho phép).">
      <ModelIdNote />
      <p>
        Dùng trong terminal: <Link to="/guide/gemini-cli">chương Gemini CLI</Link>.
      </p>
      <h2>Đường dẫn gốc (như khai báo)</h2>
      <CodeBlock
        lang="text"
        code={`POST /v1beta/models/{model}:generateContent?key=sk-xxxx`}
      />
      <CodeBlock
        code={`curl "https://api.daoxe.com/v1beta/models/your-gemini-model-id:generateContent?key=sk-xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"contents":[{"parts":[{"text":"ping"}]}],"generationConfig":{"maxOutputTokens":64}}'`}
      />
      <h2>Hoặc qua tương thích Chat</h2>
      <CurlChatExample model="your-gemini-model-id" />
      <h2>Phản hồi / lỗi (cấu trúc)</h2>
      <CodeBlock
        lang="json"
        code={`{"candidates":[{"content":{"parts":[{"text":"..."}],"role":"model"},"finishReason":"STOP"}]}
{"error":{"message":"model not found or not available for this token group"}}`}
      />
      <Related
        items={[
          { to: '/guide/recommended-models', label: 'Bảng mô hình' },
          { to: '/api/openai-chat', label: 'Chat Completions' },
        ]}
      />
    </Page>
  ),

  'api-models': () => (
    <Page title="Danh sách mô hình" lead="GET /v1/models">
      <CurlModelsExample />
      <CodeBlock
        lang="json"
        code={`{"object":"list","data":[{"id":"…","object":"model"}]}`}
      />
      <p>
        Bảng giá đầy đủ và ghi chú nhóm dùng <Link to="/guide/recommended-models">bảng mô hình</Link> (API giá) —
        đừng duy trì hai danh mục đầy đủ.
      </p>
    </Page>
  ),

  'api-errors': () => (
    <Page title="Mã lỗi" lead="Tập hợp ví dụ JSON lỗi API; các bước cho người dùng ở «Lỗi thường gặp».">
      <CodeBlock
        lang="json"
        code={`{"error":{"message":"Invalid token","code":401}}
{"error":{"message":"Insufficient quota"}}
{"error":{"message":"model not found or not available for this token group"}}
{"error":{"message":"Rate limit exceeded"}}
{"type":"error","error":{"type":"invalid_request_error","message":"max_tokens: required"}}`}
      />
      <Related items={[{ to: '/guide/errors', label: 'Lỗi thường gặp (xử lý)' }, { to: '/support/faq', label: 'FAQ' }]} />
    </Page>
  ),

  'rate-limit': () => (
    <Page
      title="Giới hạn tốc độ & thử lại"
      lead="Lỗi 429 (Rate limit exceeded) nghĩa là bạn chạm giới hạn tốc độ hoặc đồng thời — hãy giảm tải và thử lại như dưới."
    >
      <h2>Khuyến nghị</h2>
      <ul>
        <li>Giảm số yêu cầu đồng thời và tần suất thử lại; đừng dồn dập một mô hình</li>
        <li>Backoff theo cấp số nhân (1s → 2s → 4s) kèm jitter ngẫu nhiên để các lần thử không trùng nhau</li>
        <li>Giảm số kết nối luồng dài chạy đồng thời</li>
      </ul>
      <h2>Ví dụ thử lại có backoff</h2>
      <CodeBlock
        lang="python"
        code={`import random, time

for attempt in range(5):
    resp = call_api()          # your request function
    if resp.status_code != 429:
        break
    delay = 2 ** attempt + random.random()   # 1s -> 2s -> 4s... + jitter
    time.sleep(delay)`}
      />
      <Related items={[{ to: '/guide/errors', label: 'Lỗi thường gặp' }, { to: '/api/errors', label: 'Ví dụ lỗi' }]} />
    </Page>
  ),

  'billing-rules': () => (
    <Page title="Quy tắc tính phí" lead="Ba yếu tố tính phí: đơn giá mô hình × hệ số nhóm × mức dùng. Hệ số đến từ API giá; nhật ký sử dụng là căn cứ thực tế.">
      <h2>Hình thức tính phí</h2>
      <ul>
        <li>
          <strong>Theo mức dùng</strong>: token đầu vào / đầu ra tính riêng — đầu ra thường đắt hơn (xem hệ số
          completion trên sàn).
        </li>
        <li>
          <strong>Theo lần gọi</strong>: một số mô hình tính giá cố định mỗi lần gọi bất kể token.
        </li>
        <li>
          <strong>Hệ số nhóm</strong>: giá cuối = giá gốc × <code>group_ratio</code> (bảng dưới).
        </li>
        <li>
          <strong>Tạm giữ &amp; quyết toán</strong>: yêu cầu luồng tạm giữ hạn mức trước rồi quyết toán theo mức
          dùng thực tế — số dư nhảy nhẹ trong nhật ký là bình thường.
        </li>
      </ul>
      <h2>Hệ số &amp; endpoint thời gian thực</h2>
      <LiveEndpointsBlock />
      <p>
        Giá mô hình thời gian thực: <Link to="/guide/recommended-models">bảng mô hình</Link>. Đối soát:{' '}
        <Link to="/billing/logs">số dư &amp; nhật ký</Link>.
      </p>
    </Page>
  ),

  'billing-logs': () => (
    <Page title="Số dư & nhật ký" lead="Nơi đầu tiên để đối soát và tra khoản trừ bất thường.">
      <Shot
        src="/images/guide/daoxe/08-logs.png"
        alt="Nhật ký sử dụng"
        caption="Danh sách nhật ký sử dụng"
      />
      <ul>
        <li>Kiểm tra: thời gian, mô hình, nhóm, mức dùng, khoản trừ, ID yêu cầu</li>
        <li>Số nhảy sau khi tạm giữ luồng thường là bình thường</li>
        <li>Client báo thành công nhưng không có nhật ký: có thể bạn gọi nhầm Base URL</li>
      </ul>
      <h2>Bảng thống kê</h2>
      <p>
        Trang «Tổng quan» trong console tổng hợp chi tiêu 24h, tổng chi tiêu, tỷ lệ thành công, độ trễ trung bình
        và các mô hình dùng nhiều — hãy bắt đầu từ đây khi gặp vấn đề tính phí hoặc ổn định, rồi mới đi sâu vào
        nhật ký.
      </p>
      <Shot
        src="/images/guide/daoxe/09-dashboard.png"
        alt="Bảng thống kê console"
        caption="Tổng quan console · biểu đồ chi tiêu và thống kê sử dụng"
      />
      <Related
        items={[
          { to: '/billing/rules', label: 'Quy tắc tính phí' },
          { to: '/support/contact', label: 'Hỗ trợ' },
        ]}
      />
    </Page>
  ),

  'billing-pricing': () => (
    <Page
      title="Giá & nhóm"
      lead="Giá cuối = giá gốc mô hình × hệ số nhóm. Cả hai đều là dữ liệu thời gian thực — ưu tiên API và sàn mô hình."
    >
      <Shot
        src="/images/guide/daoxe/02-pricing.png"
        alt="Sàn mô hình"
        caption="Sàn mô hình (trang công khai)"
      />
      <h2>Cách đọc giá</h2>
      <ul>
        <li>Sàn liệt kê giá gốc và các endpoint giao thức được hỗ trợ theo từng mô hình; token đầu vào và đầu ra thường tính riêng</li>
        <li>
          <strong>Nhóm</strong> chọn khi tạo key sẽ nhân với <code>group_ratio</code> bên dưới — cùng một mô hình
          có giá khác nhau ở các nhóm khác nhau
        </li>
        <li>Thay đổi giá theo thông báo trên trang và phản hồi API; tài liệu không lưu con số nào</li>
      </ul>
      <LiveEndpointsBlock />
      <p>
        Bảng thời gian thực có tìm kiếm: <Link to="/guide/recommended-models">bảng mô hình</Link>. Ngữ nghĩa tính
        phí: <Link to="/billing/rules">quy tắc tính phí</Link>.
      </p>
    </Page>
  ),

  'topup-issues': () => (
    <Page title="Đối soát nạp tiền" lead="Thanh toán báo thành công nhưng số dư không đổi — xử lý theo thứ tự này.">
      <Steps
        items={[
          <>Xác nhận thành công ở kênh thanh toán; lưu số đơn / ảnh chụp</>,
          <>Xác nhận tài khoản đang đăng nhập trùng với tài khoản đã đặt đơn</>,
          <>Chờ 15–30 phút</>,
          <>
            Vẫn chưa vào: đừng đặt thêm đơn — <Link to="/support/contact">liên hệ hỗ trợ</Link>
          </>,
        ]}
      />
      <h2>Nguyên nhân thường gặp</h2>
      <ul>
        <li>Callback của kênh thanh toán bị trễ (hay gặp với tiền mã hóa, thanh toán xuyên biên giới hoặc giờ cao điểm của bên thứ ba)</li>
        <li>Đặt đơn và đăng nhập bằng tài khoản khác nhau (đã đổi email hoặc nhà cung cấp OAuth)</li>
        <li>Số tiền hoặc gói không khớp với trang, hoặc mã đổi thưởng chưa được gửi ở «Ví»</li>
      </ul>
      <Related
        items={[
          { to: '/guide/topup', label: 'Nạp tiền & gói' },
          { to: '/billing/logs', label: 'Số dư & nhật ký' },
          { to: '/support/contact', label: 'Liên hệ hỗ trợ' },
        ]}
      />
    </Page>
  ),

  wallet: () => (
    <Page title="Ví & đơn hàng" lead="Trang ví gom số dư, nạp tiền, gói và lịch sử đơn — trung tâm cho mọi thao tác tiền bạc.">
      <Shot
        src="/images/guide/daoxe/05-wallet.png"
        alt="Ví"
        caption="Trang ví (cùng ảnh với chương nạp tiền)"
      />
      <h2>Bạn làm được gì ở đây</h2>
      <ul>
        <li>Xem số dư và trạng thái gói; lối vào nạp tiền / gói / mã đổi thưởng đều ở đây</li>
        <li>Lịch sử đơn giúp kiểm tra số tiền, thời gian và trạng thái của mỗi lần nạp</li>
        <li>Chi tiết chi tiêu nằm ở «Nhật ký sử dụng» — đối chiếu cả hai để hoàn tất đối soát</li>
      </ul>
      <p>
        Các bước: <Link to="/guide/topup">nạp tiền &amp; gói</Link>. Đã trả nhưng chưa vào:{' '}
        <Link to="/billing/topup-issues">đối soát nạp tiền</Link>. Ngữ nghĩa tính phí:{' '}
        <Link to="/billing/rules">quy tắc tính phí</Link>.
      </p>
    </Page>
  ),

  'feat-keys': () => (
    <Page title="Quản lý key" lead="Vệ sinh key hằng ngày: tách, xoay vòng, xử lý lộ key. Các bước tạo ở «Tạo API key».">
      <h2>Lời khuyên tách key</h2>
      <ul>
        <li>
          <strong>Một mục đích, một key</strong>: key riêng cho phát triển cục bộ, CI và production giúp giảm
          thiểu phạm vi ảnh hưởng
        </li>
        <li>
          <strong>Một nhóm, một key</strong>: nhóm quyết định mô hình và hệ số; trộn lẫn gây «mô hình không khả
          dụng / trừ phí bất ngờ»
        </li>
        <li>Đặt hạn mức hoặc hạn dùng cho key (nếu console cho phép) như một lớp bảo hiểm cho việc dùng tạm</li>
      </ul>
      <h2>Xử lý lộ key</h2>
      <Steps
        items={[
          <>Xóa ngay key trong console (thu hồi có hiệu lực tức thì).</>,
          <>Tạo key mới và cập nhật mọi client / biến môi trường đang dùng nó.</>,
          <>
            Kiểm tra <Link to="/billing/logs">nhật ký sử dụng</Link> xem có lệnh gọi bất thường trong thời gian lộ.
          </>,
        ]}
      />
      <Callout title="Đừng bao giờ commit vào Git" warn>
        Key <code>sk-</code> bị lộ trong kho công khai sẽ bị bot quét khai thác trong vài giây. Dùng biến môi
        trường hoặc trình quản lý bí mật.
      </Callout>
      <Related
        items={[
          { to: '/guide/keys', label: 'Tạo API key' },
          { to: '/api/auth', label: 'Xác thực & header' },
        ]}
      />
    </Page>
  ),

  'feat-pricing': () => (
    <Page
      title="Sàn mô hình / giá"
      lead="Sàn là nguồn có thẩm quyền cho giá và nhóm đầy đủ; bảng mô hình trong tài liệu là mẫu thời gian thực của nó."
    >
      <Shot
        src="/images/guide/daoxe/02-pricing.png"
        alt="Sàn mô hình"
        caption="Sàn mô hình (trang công khai)"
      />
      <p>
        Mở{' '}
        <a href={absSite('/pricing')} target="_blank" rel="noopener noreferrer">
          trang giá
        </a>
        . Bảng thời gian thực trong tài liệu: <Link to="/guide/recommended-models">bảng mô hình</Link>. Khái niệm:{' '}
        <Link to="/guide/models">mô hình &amp; nhóm</Link>.
      </p>
    </Page>
  ),

  invite: () => (
    <Page title="Chương trình giới thiệu" lead="Nếu console có mục giới thiệu, ưu tiên theo mô tả trên trang đó.">
      <Callout title="Ưu tiên theo trang">
        Có bật hay không, tỷ lệ và chu kỳ quyết toán đều theo tính năng thực tế của console. Tài liệu không bịa ra
        quy tắc không được hiển thị.
      </Callout>
      <p>
        Lối vào thường nằm trong menu console sau khi đăng nhập. Thắc mắc:{' '}
        <Link to="/support/contact">liên hệ hỗ trợ</Link>.
      </p>
    </Page>
  ),

  contact: () => (
    <Page title="Liên hệ hỗ trợ" lead="Thông tin liên hệ ưu tiên đọc từ API status / chân trang của trang chính.">
      <LiveContactBlock />
      <h2>Vui lòng kèm theo</h2>
      <ul>
        <li>Email tài khoản (có thể che một phần)</li>
        <li>Thời gian và múi giờ</li>
        <li>Base URL / tuyến</li>
        <li>ID mô hình và nhóm của key</li>
        <li>Mã HTTP và lỗi thô (bỏ key sk)</li>
      </ul>
      <Callout title="Đừng bao giờ gửi" warn>
        API key đầy đủ, mật khẩu hoặc mã xác minh.
      </Callout>
    </Page>
  ),

  network: () => (
    <Page title="Mạng & truy cập" lead="Trang web không vào được không có nghĩa API sập — chúng dùng điểm vào khác nhau; hãy gỡ lỗi riêng.">
      <h2>Thứ tự gỡ lỗi</h2>
      <Steps
        items={[
          <>
            Thử API trước: <Link to="/guide/verify">kiểm tra curl</Link> lần lượt qua các host{' '}
            <Link to="/guide/base-url">tuyến</Link> (api → trang chính → jp). Bất kỳ host nào chạy được là tiếp
            tục dùng được.
          </>,
          <>
            Rồi thử trang web: trình duyệt khác / cửa sổ ẩn danh / mạng khác. Nếu chỉ trang chậm, lệnh gọi API
            không bị ảnh hưởng.
          </>,
          <>
            Kiểm tra proxy cục bộ và DNS: quy tắc proxy có thể chỉ cho phép vài tên miền — hãy cho phép mọi host
            tuyến.
          </>,
          <>
            Không gì chạy: <Link to="/support/contact">liên hệ hỗ trợ</Link> kèm thời gian, khu vực, loại mạng và
            ảnh chụp lỗi.
          </>,
        ]}
      />
      <h2>Bảng triệu chứng</h2>
      <table>
        <thead>
          <tr>
            <th>Triệu chứng</th>
            <th>Chẩn đoán</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Trang không vào được, curl chạy</td>
            <td>Điểm vào web bị ảnh hưởng bởi mạng của bạn; API vẫn tốt — cứ tiếp tục gọi</td>
          </tr>
          <tr>
            <td>Một tuyến timeout, các tuyến khác chạy</td>
            <td>Chỉ cần đổi host Base URL (một thay đổi cấu hình trong client)</td>
          </tr>
          <tr>
            <td>Không tuyến nào kết nối được</td>
            <td>Kiểm tra mạng / proxy cục bộ trước, rồi hỏi hỗ trợ về trạng thái dịch vụ</td>
          </tr>
        </tbody>
      </table>
      <p>
        Hạn chế khu vực dịch vụ: <Link to="/start/compliance">tài khoản &amp; tuân thủ</Link>.
      </p>
    </Page>
  ),

  terms: () => (
    <Page title="Điều khoản dịch vụ" lead="Toàn văn chỉ được duy trì trên trang chính.">
      <CardGrid>
        <Card href={absSite('/user-agreement')} title="Điều khoản đầy đủ ↗" desc="daoxe.com/user-agreement" />
        <Card href={absSite('/privacy-policy')} title="Quyền riêng tư ↗" desc="Trang chính" />
        <Card href={absSite('/sign-up')} title="Đăng ký ↗" desc="Tạo tài khoản sau khi đồng ý" />
      </CardGrid>
      <h2>Tóm tắt (không thay thế văn bản pháp lý)</h2>
      <ul>
        <li>Trước khi dùng, hãy đồng ý với điều khoản và chính sách quyền riêng tư của trang chính</li>
        <li>Chủ tài khoản chịu trách nhiệm về key và lệnh gọi</li>
        <li>Cấm dùng cho mục đích trái pháp luật</li>
        <li>Hạn chế khu vực dịch vụ theo điều khoản và thông báo</li>
      </ul>
    </Page>
  ),

  privacy: () => (
    <Page title="Chính sách quyền riêng tư" lead="Văn bản pháp lý nằm trên trang chính; dưới đây chỉ là những gì trang tài liệu này làm.">
      <CardGrid>
        <Card href={absSite('/privacy-policy')} title="Chính sách đầy đủ ↗" desc="Trang chính" />
        <Card href={absSite('/user-agreement')} title="Điều khoản ↗" desc="Trang chính" />
      </CardGrid>
      <ul>
        <li>
          Tùy chọn giao diện: cookie / localStorage <code>vite-ui-theme</code>
        </li>
        <li>Trạng thái thanh bên và vị trí cuộn: localStorage / sessionStorage</li>
        <li>
          Có thể gọi <code>/api/status</code>, <code>/api/notice</code>, <code>/api/pricing</code> của trang chính
        </li>
        <li>Khi triển khai cùng origin, có thể đọc localStorage phiên của trang chính để hiển thị ảnh đại diện</li>
      </ul>
      <Callout title="Không bao giờ">Thu thập mật khẩu hay API key trên trang tài liệu.</Callout>
    </Page>
  ),

  abuse: () => (
    <Page title="Báo cáo lạm dụng" lead="Nội dung vi phạm, lạm dụng API, gian lận, lỗ hổng.">
      <Callout title="Tiêu đề email" warn>
        Vui lòng dùng <strong>[Abuse Report]</strong> trong tiêu đề email
      </Callout>
      <ul>
        <li>
          <a href="mailto:cabesalberto36216@gmail.com?subject=%5BAbuse%20Report%5D">
            cabesalberto36216@gmail.com
          </a>
        </li>
        <li>
          <a href="https://t.me/daoxe_ai" target="_blank" rel="noopener noreferrer">
            Telegram @daoxe_ai
          </a>
        </li>
      </ul>
      <ol>
        <li>Loại và mô tả</li>
        <li>Thời gian</li>
        <li>URL / mô hình / ID yêu cầu</li>
        <li>Liên hệ của bạn</li>
      </ol>
    </Page>
  ),

  changelog: () => (
    <Page title="Nhật ký thay đổi" lead="Các thay đổi của trang tài liệu này.">
      <h2>2026-07</h2>
      <ul>
        <li>
          Chương client / CLI mới: DeepChat (nhà cung cấp tích hợp), CC Switch GUI, Gemini CLI, Cherry Studio,
          ChatBox, Lobe Chat, NextChat, Open WebUI, Immersive Translate — Base URL theo tuyến thời gian thực
        </li>
        <li>Toàn văn bài viết đa ngôn ngữ; bộ chuyển ngôn ngữ đổi toàn bộ nội dung</li>
        <li>Bổ sung ảnh chụp console thật: tổng quan / ví / tạo key / nhật ký / bảng thống kê / tuyến API / CC Switch / DeepChat</li>
        <li>Tìm kiếm nâng cấp lên toàn văn: nội dung, mã lỗi và biến môi trường đều tìm được, theo từng ngôn ngữ</li>
        <li>Tô sáng cú pháp Shiki (One Dark Pro); phông chữ Inter / JetBrains Mono</li>
        <li>
          Tuyến, bảng giao thức và ví dụ curl đọc host từ <code>status.api_info</code> theo thời gian thực, có
          phương án dự phòng tích hợp
        </li>
        <li>Làm mới giao diện: hero trang chủ, thẻ biểu tượng, đường nối các bước, chân trang nhiều cột, tinh chỉnh chế độ tối</li>
        <li>Tài liệu là SPA: bố cục ba cột, thanh bên cố định, lightbox ảnh</li>
        <li>
          Bảng mô hình đồng bộ từ <code>GET /api/pricing</code>
        </li>
        <li>
          Đồng bộ với kho ví dụ chính thức{' '}
          <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
            DaoXE-AI
          </a>
        </li>
      </ul>
    </Page>
  ),

  glossary: () => (
    <Page title="Thuật ngữ" lead="Các thuật ngữ dùng trong tài liệu này.">
      <table>
        <thead>
          <tr>
            <th>Thuật ngữ</th>
            <th>Ý nghĩa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base URL</td>
            <td>Địa chỉ gốc của API cấu hình trong client</td>
          </tr>
          <tr>
            <td>Tương thích OpenAI</td>
            <td>
              ví dụ <code>/v1/chat/completions</code>, <code>/v1/responses</code>, <code>/v1/embeddings</code>
            </td>
          </tr>
          <tr>
            <td>Tương thích Anthropic</td>
            <td>
              <code>/v1/messages</code>
            </td>
          </tr>
          <tr>
            <td>Đường dẫn tương thích Gemini</td>
            <td>
              <code>/v1beta/models/&#123;model&#125;:generateContent</code>
            </td>
          </tr>
          <tr>
            <td>Nhóm</td>
            <td>Tập mô hình mà key dùng được, kèm hệ số tính phí</td>
          </tr>
          <tr>
            <td>Hệ số</td>
            <td>Hệ số tính phí của nhóm (group_ratio trong API giá)</td>
          </tr>
          <tr>
            <td>Tạm giữ</td>
            <td>Hạn mức có thể bị giữ trong lúc yêu cầu và quyết toán theo thực tế sau đó</td>
          </tr>
          <tr>
            <td>GIA / trực tiếp</td>
            <td>
              <code>api.daoxe.com</code> / <code>jp.daoxe.com</code>
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  ),

  install: () => (
    <Page title="Phụ lục cài đặt môi trường" lead="Trình cài đặt CLI thay đổi theo upstream; cài xong hãy quay lại chương client và nhập địa chỉ DaoXE.">
      <h2>Node.js</h2>
      <p>
        Cài bản LTS:{' '}
        <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
          nodejs.org
        </a>
      </p>
      <CodeBlock code={`node -v && npm -v`} />
      <h2>Codex / Claude Code / Gemini CLI</h2>
      <p>Cài từng công cụ theo tài liệu chính thức của nó, rồi tiếp tục:</p>
      <ul>
        <li>
          Codex → <Link to="/guide/codex">chương Codex</Link>
        </li>
        <li>
          Claude Code → <Link to="/guide/claude-code">chương Claude Code</Link>
        </li>
        <li>
          Gemini CLI → <Link to="/guide/gemini-cli">chương Gemini CLI</Link>
        </li>
      </ul>
      <Callout title="Tên gói thay đổi" warn>
        Lấy lệnh cài toàn cục từ README của kho chính thức — tài liệu không cố định tên gói npm nào để tránh lỗi
        thời.
      </Callout>
    </Page>
  ),
}
