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
import { RecommendedModelsLive } from '@/components/RecommendedModelsLive'
import { clientGuidePages } from './clientGuides'
import {
  LiveAppsBlock,
  LiveAuthOptionsBlock,
  LiveContactBlock,
  LiveEndpointsBlock,
  LiveFaqPage,
  LiveNoticesPage,
  LiveRoutesBlock,
} from '@/components/LivePages'

export const content: Record<string, () => ReactNode> = {
  ...clientGuidePages,
  welcome: () => (
    <>
      <Hero
        eyebrow="DaoXE Docs"
        title="DaoXE 文档"
        lead="先拿密钥与模型 ID，再按客户端协议接入。本站只写 DaoXE 已支持的用法。"
        actions={
          <>
            <Button asChild>
              <Link to="/start/quickstart" className="no-underline">
                <Rocket className="size-4" /> 快速开始
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/guide/recommended-models" className="no-underline">
                <Boxes className="size-4" /> 推荐模型表
              </Link>
            </Button>
          </>
        }
      />
      <PrerequisiteKey />
      <h2>线路</h2>
      <BasePills />
      <h2>协议怎么填</h2>
      <p>
        OpenAI 兼容客户端在所选线路后拼 <code>/v1</code>；Claude（Anthropic）用站点根、路径{' '}
        <code>/v1/messages</code>。完整协议对照与填法见{' '}
        <Link to="/guide/multi-protocol">双协议接入清单</Link>，线路与 Base URL 见{' '}
        <Link to="/guide/base-url">线路说明</Link>。
      </p>
      <h2>学习路径</h2>
      <CardGrid>
        <Card to="/start/quickstart" icon={<Rocket />} title="1. 快速开始" desc="最小请求跑通" />
        <Card
          to="/guide/recommended-models"
          icon={<Boxes />}
          title="2. 选模型"
          desc="定价接口实时表"
        />
        <Card
          to="/guide/multi-protocol"
          icon={<Waypoints />}
          title="3. 选协议"
          desc="OpenAI vs Claude"
        />
        <Card to="/guide/deepchat" icon={<BookOpenText />} title="4a. DeepChat" desc="官方内置服务商" />
        <Card
          to="/guide/claude-code"
          icon={<TerminalSquare />}
          title="4b. Claude Code"
          desc="Messages"
        />
        <Card to="/guide/sdk" icon={<Braces />} title="4c. SDK" desc="Python / Node" />
      </CardGrid>
      <p className="text-muted-foreground text-sm">
        可运行脚本与 Postman：
        <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
          seven7763/DaoXE-AI
        </a>
      </p>
    </>
  ),

  quickstart: () => (
    <Page title="快速开始" lead="只做一件事：证明 Key + 模型 ID + 线路可用。">
      <Steps
        items={[
          <>注册登录并充值（主站）。</>,
          <>
            <Link to="/guide/keys">创建密钥</Link>并选分组。
          </>,
          <>
            复制模型 ID：
            <Link to="/guide/recommended-models">推荐模型表</Link> 或下方 <code>/v1/models</code>。
          </>,
          <>发送最小请求；成功后再去配客户端。</>,
        ]}
      />
      <h2>列模型</h2>
      <CurlModelsExample />
      <h2>最小 Chat</h2>
      <CurlChatExample />
      <h2>最小 Messages（若用 Claude）</h2>
      <CurlMessagesExample />
      <p>
        线路切换与 Base 形态见 <Link to="/guide/base-url">线路</Link> /{' '}
        <Link to="/guide/multi-protocol">双协议</Link>。失败查{' '}
        <Link to="/guide/errors">报错</Link>。
      </p>
    </Page>
  ),

  compliance: () => (
    <Page title="账号与合规" lead="法律全文以主站为准。">
      <Callout title="服务区域" warn>
        本服务<strong>不向中国大陆地区</strong>提供访问与使用支持。以主站公告与用户协议为准。
      </Callout>
      <ul>
        <li>
          注册 / 登录仅在主站完成（
          <a href={absSite('/sign-in')} target="_blank" rel="noopener noreferrer">
            登录
          </a>
          ）。
        </li>
        <li>API 密钥请妥善保管，勿提交到公开仓库。</li>
        <li>密钥分组决定可用模型与计费。</li>
        <li>禁止违法用途。</li>
      </ul>
      <CardGrid>
        <Card href={absSite('/user-agreement')} title="用户协议 ↗" desc="主站全文" />
        <Card href={absSite('/privacy-policy')} title="隐私政策 ↗" desc="主站全文" />
        <Card to="/legal/abuse" title="滥用举报" desc="安全与违规反馈" />
      </CardGrid>
    </Page>
  ),

  console: () => (
    <Page title="控制台导览" lead="登录后的常用入口（以站内实际菜单为准）。">
      <Shot
        src="/images/guide/daoxe/04-console.webp"
        alt="控制台概览"
        caption="控制台概览（请用登录后实拍替换）"
      />
      <Shot
        src="/images/guide/daoxe/06-onboarding.webp"
        alt="新手引导 / 开始使用步骤"
        caption="概览页引导或「开始使用」步骤区（请登录后实拍）"
      />
      <table>
        <thead>
          <tr>
            <th>入口</th>
            <th>用途</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>概览</td>
            <td>用量摘要、快捷入口</td>
          </tr>
          <tr>
            <td>钱包</td>
            <td>
              充值 / 订阅 / 兑换（
              <Link to="/guide/topup">说明</Link>）
            </td>
          </tr>
          <tr>
            <td>API 密钥</td>
            <td>
              创建与管理密钥（
              <Link to="/guide/keys">说明</Link>）
            </td>
          </tr>
          <tr>
            <td>模型广场 / 定价</td>
            <td>
              模型与分组（
              <Link to="/guide/recommended-models">推荐表</Link>）
            </td>
          </tr>
          <tr>
            <td>用量日志</td>
            <td>
              请求与扣费（
              <Link to="/billing/logs">说明</Link>）
            </td>
          </tr>
        </tbody>
      </table>
      <h2>一键应用（实时）</h2>
      <LiveAppsBlock />
    </Page>
  ),

  register: () => (
    <Page title="注册登录" lead="账号只在主站完成；下列登录能力来自 status 实时开关。">
      <LiveAuthOptionsBlock />
      <Steps
        items={[
          <>
            打开{' '}
            <a href={absSite('/')} target="_blank" rel="noopener noreferrer">
              https://daoxe.com
            </a>
          </>,
          <>点击「登录」/「注册」。</>,
          <>按上表已开启的方式完成认证（密码 / GitHub / Telegram / Passkey 等）。</>,
          <>
            进入控制台后继续 <Link to="/guide/topup">充值</Link> 与 <Link to="/guide/keys">创建密钥</Link>。
          </>,
        ]}
      />
      <Shot src="/images/guide/daoxe/01-home.webp" alt="首页" caption="DaoXE 首页（实拍）" />
      <Shot src="/images/guide/daoxe/03-login.webp" alt="登录页" caption="登录页（实拍）" />
      <Shot src="/images/guide/daoxe/03b-signup.webp" alt="注册页" caption="注册页（实拍）" />
      <Shot src="/images/guide/daoxe/02-pricing.webp" alt="模型广场" caption="模型广场（公开页实拍）" />
      <CardGrid>
        <Card href={absSite('/sign-in')} title="登录 ↗" desc="daoxe.com/sign-in" />
        <Card href={absSite('/sign-up')} title="注册 ↗" desc="daoxe.com/sign-up" />
        <Card href={absSite('/dashboard')} title="控制台 ↗" desc="登录后" />
      </CardGrid>
    </Page>
  ),

  topup: () => (
    <Page title="充值与套餐" lead="在控制台「钱包」完成加款、订阅或兑换。">
      <Steps
        items={[
          <>打开左侧「钱包」。</>,
          <>按页面提供的方式充值或开通套餐（支付方式以页面为准）。</>,
          <>如有兑换码，在兑换入口使用。</>,
          <>到账后刷新余额；部分支付渠道可能有延迟。</>,
        ]}
      />
      <Shot
        src="/images/guide/daoxe/05-wallet.webp"
        alt="钱包"
        caption="钱包页：充值 / 订阅 / 兑换（请登录后实拍）"
      />
      <p>
        计费概念：
        <Link to="/billing/rules">计费规则</Link>
        。不到账：
        <Link to="/billing/topup-issues">充值对账</Link>
        。
      </p>
    </Page>
  ),

  keys: () => (
    <Page title="创建 API 密钥" lead="所有客户端的前置步骤。">
      <Callout title="安全" warn>
        创建后立刻复制保存。泄露请删除并重建，同步更新客户端。截图请打码 sk。
      </Callout>
      <Steps
        items={[
          <>控制台 →「API 密钥」→ 创建。</>,
          <>
            填写名称；<strong>分组</strong>决定可用模型（见{' '}
            <Link to="/guide/recommended-models">推荐模型表</Link> / 模型广场）。
          </>,
          <>保存并复制 <code>sk-...</code>。</>,
        ]}
      />
      <Shot
        src="/images/guide/daoxe/07-create-key.webp"
        alt="创建密钥"
        caption="创建 API 密钥表单（请登录后实拍，打码密钥）"
      />
      <p>
        鉴权头：
        <Link to="/api/auth">鉴权与请求头</Link>
        。管理：
        <Link to="/features/keys">密钥管理</Link>。
      </p>
    </Page>
  ),

  'base-url': () => (
    <Page title="线路与 Base URL" lead="主机与协议以公开接口为准；下列线路来自 status.api_info（实时）。">
      <LiveRoutesBlock />
      <Shot
        src="/images/guide/daoxe/10-api-routes.webp"
        alt="控制台 API 信息卡片：已配置路由和延迟检测"
        caption="控制台「API 信息」卡片 · 已配置线路与延迟检测，与上方实时列表同源（实拍）"
      />
      <h2>协议形态（怎么填 Base）</h2>
      <p>
        OpenAI 兼容客户端在所选线路后拼 <code>/v1</code>；Anthropic（Claude）用站点根、路径{' '}
        <code>/v1/messages</code>。完整协议对照见{' '}
        <Link to="/guide/multi-protocol">双协议接入清单</Link>。
      </p>
      <Callout title="主机可替换">
        上面任一线路主机都可替换：换成 api_info 返回的任意 url 即可；OpenAI 兼容一般再拼 <code>/v1</code>，Anthropic 用站点根。
      </Callout>
      <Related
        items={[
          { to: '/guide/multi-protocol', label: '双协议接入清单' },
          { to: '/api/routing', label: '流式与超时' },
        ]}
      />
    </Page>
  ),

  models: () => (
    <Page title="模型与分组" lead="三个核心概念的关系：密钥属于分组，分组决定可用模型与倍率，模型 ID 决定调用哪一个。">
      <ul>
        <li>
          <strong>分组</strong>：创建密钥时选择，决定该密钥能调用哪些模型、按什么倍率计费。区分两种权限报错：令牌无权访问该模型 →{' '}
          <code>403</code>（检查令牌的模型白名单 / 权限）；所选分组下该模型无可用渠道 →{' '}
          <code>503 / no available channel</code>（换用包含该模型的分组，或确认该模型在当前分组有可用渠道）
        </li>
        <li>
          <strong>模型 ID</strong>：客户端 / API 中必须与站内 ID 完全一致（区分大小写与后缀），从{' '}
          <Link to="/guide/recommended-models">推荐模型表</Link>或 <code>/v1/models</code> 原样复制
        </li>
        <li>
          <strong>协议端点</strong>：同一模型可能同时支持多种协议（Chat / Responses / Messages），见下方实时表
        </li>
      </ul>
      <LiveEndpointsBlock />
      <p>
        推荐抽样与搜索：
        <Link to="/guide/recommended-models">推荐模型表</Link>
        。建 Key：
        <Link to="/guide/keys">创建密钥</Link>。
      </p>
    </Page>
  ),
  'recommended-models': () => (
    <RecommendedModelsLive />
  ),

  clients: () => (
    <Page title="客户端接入总览" lead="按客户端类型选专章；协议细节只维护在双协议页。">
      <Callout title="官方内置">
        <Link to="/guide/deepchat">DeepChat</Link> 已内置 DaoXE 服务商——搜索启用 + 填 Key 即可，无需填 Base
        URL，最推荐新手使用。
      </Callout>
      <p>
        每个专章只讲该客户端的填法；Base URL 形态与协议对照统一见{' '}
        <Link to="/guide/multi-protocol">双协议接入清单</Link>，线路选择见{' '}
        <Link to="/guide/base-url">线路与 Base URL</Link>。
      </p>
      <h2>CLI / 编程工具</h2>
      <table>
        <thead>
          <tr>
            <th>客户端</th>
            <th>协议 / Base</th>
            <th>文档</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Claude Code</td>
            <td>Anthropic · 站点根</td>
            <td>
              <Link to="/guide/claude-code">专章</Link> · <Link to="/guide/cc-switch">CC Switch 图形配置</Link>
            </td>
          </tr>
          <tr>
            <td>Codex CLI</td>
            <td>
              OpenAI · <code>/v1</code>（responses）
            </td>
            <td>
              <Link to="/guide/codex">专章</Link>
            </td>
          </tr>
          <tr>
            <td>Gemini CLI</td>
            <td>Gemini · 站点根</td>
            <td>
              <Link to="/guide/gemini-cli">专章</Link>
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
            <td>OpenAI 或 Anthropic</td>
            <td>
              <Link to="/guide/opencode">OpenCode</Link> · <Link to="/guide/openclaw">OpenClaw</Link>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>图形客户端</h2>
      <table>
        <thead>
          <tr>
            <th>客户端</th>
            <th>形态</th>
            <th>文档</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DeepChat</td>
            <td>桌面 · 官方内置 DaoXE</td>
            <td>
              <Link to="/guide/deepchat">专章</Link>
            </td>
          </tr>
          <tr>
            <td>Cherry Studio</td>
            <td>桌面</td>
            <td>
              <Link to="/guide/cherry-studio">专章</Link>
            </td>
          </tr>
          <tr>
            <td>ChatBox</td>
            <td>桌面 + 移动</td>
            <td>
              <Link to="/guide/chatbox">专章</Link>
            </td>
          </tr>
          <tr>
            <td>Lobe Chat</td>
            <td>Web（可自部署）</td>
            <td>
              <Link to="/guide/lobe-chat">专章</Link>
            </td>
          </tr>
          <tr>
            <td>NextChat</td>
            <td>Web + 桌面</td>
            <td>
              <Link to="/guide/nextchat">专章</Link>
            </td>
          </tr>
          <tr>
            <td>Open WebUI</td>
            <td>自部署 Web</td>
            <td>
              <Link to="/guide/open-webui">专章</Link>
            </td>
          </tr>
          <tr>
            <td>沉浸式翻译</td>
            <td>浏览器扩展</td>
            <td>
              <Link to="/guide/immersive-translate">专章</Link>
            </td>
          </tr>
          <tr>
            <td>其它（Continue / Aider…）</td>
            <td>通用 OpenAI Compatible</td>
            <td>
              <Link to="/guide/apps">图形客户端与其他</Link>
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  ),
  'cline': () => (
    <Page title="Cline" lead="VS Code：OpenAI Compatible → DaoXE。">
      <PrerequisiteKey />
      <Steps
        items={[
          <>Cline 设置 → API Provider = OpenAI Compatible。</>,
          <>
            Base URL = <code>https://api.daoxe.com/v1</code>（见{' '}
            <Link to="/guide/multi-protocol">双协议</Link>）。
          </>,
          <>填入 sk；Model ID 从推荐模型表或 /v1/models 复制。</>,
        ]}
      />
      <Callout title="没有 DaoXE 下拉项">请使用 OpenAI Compatible 自定义 Base，不要找一等公民 DaoXE 选项。</Callout>
      <p>
        验证：
        <Link to="/guide/verify">curl</Link> 先通再开 Cline。
      </p>
    </Page>
  ),

  'claude-code': () => (
    <Page title="Claude Code" lead="Anthropic Messages。Base 用站点根。">
      <PrerequisiteKey />
      <p>
        协议与填法见 <Link to="/guide/multi-protocol">双协议清单</Link>。先跑通 Messages：
      </p>
      <CurlMessagesExample />
      <h2>环境变量 / settings</h2>
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
        目录：<code>~/.claude</code>。验证：<code>claude</code>。curl 通但 CLI 失败：检查是否误加{' '}
        <code>/v1</code>、环境变量覆盖。原文：
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/CLAUDE_CODE.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          CLAUDE_CODE.md
        </a>
        。偏好图形界面？见 <Link to="/guide/cc-switch">CC Switch</Link>。
      </p>
    </Page>
  ),

  codex: () => (
    <Page title="Codex CLI" lead="OpenAI /v1 + responses。">
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
      <Callout title="/v1 必填" warn>
        详见 <Link to="/guide/multi-protocol">双协议</Link> ·{' '}
        <Link to="/api/openai-responses">Responses</Link>
      </Callout>
    </Page>
  ),

  apps: () => (
    <Page title="图形客户端与其他" lead="通用 OpenAI Compatible 填法；站内一键应用列表来自 status.chats。">
      <PrerequisiteKey />
      <h2>站内已配置的应用入口（实时）</h2>
      <LiveAppsBlock />
      <h2>通用填法</h2>
      <p>
        见 <Link to="/guide/multi-protocol">双协议清单</Link>。Continue 示例：
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
        更多客户端字段：
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
    <Page title="OpenClaw" lead="按 OpenAI 或 Anthropic 兼容配置 provider。">
      <PrerequisiteKey />
      <p>
        二选一（形态见 <Link to="/guide/multi-protocol">双协议</Link>）：
      </p>
      <ul>
        <li>
          OpenAI：baseUrl <code>https://api.daoxe.com/v1</code>
        </li>
        <li>
          Anthropic：baseUrl <code>https://api.daoxe.com</code>，api = anthropic-messages
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
        "models": [{ "id": "你的模型ID", "name": "显示名" }]
      }
    }
  }
}`}
      />
      <p>安装脚本以 OpenClaw 官方仓库为准。</p>
    </Page>
  ),
  opencode: () => (
    <Page title="OpenCode" lead="provider 配置指向 DaoXE。">
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
        "你的模型ID": { "name": "显示名" }
      }
    }
  }
}`}
      />
      <p>
        安装与包名以 OpenCode 官方为准。验证前先 <Link to="/guide/verify">curl</Link>。
      </p>
    </Page>
  ),
  cursor: () => (
    <Page title="Cursor" lead="自定义 OpenAI Base（选项名随版本变化）。">
      <PrerequisiteKey />
      <Steps
        items={[
          <>Settings → Models / OpenAI 兼容相关项。</>,
          <>
            Override Base URL = <code>https://api.daoxe.com/v1</code>
          </>,
          <>填 sk；模型名与广场 ID 完全一致。</>,
        ]}
      />
      <Related items={[{ to: '/guide/multi-protocol', label: '双协议' }, { to: '/guide/verify', label: 'curl' }]} />
    </Page>
  ),
  sdk: () => (
    <Page title="官方 SDK 示例" lead="只放 SDK 代码；curl 样例见验证页，响应 JSON 见 API 页。">
      <ModelIdNote />
      <CodeBlock
        lang="python"
        code={`from openai import OpenAI
client = OpenAI(api_key="sk-xxxx", base_url="https://api.daoxe.com/v1")
print(client.chat.completions.create(
    model="你的模型ID",
    messages=[{"role":"user","content":"ping"}],
    max_tokens=64,
).choices[0].message.content)`}
      />
      <CodeBlock
        lang="js"
        code={`import OpenAI from "openai";
const client = new OpenAI({ apiKey: "sk-xxxx", baseURL: "https://api.daoxe.com/v1" });
const r = await client.chat.completions.create({
  model: "你的模型ID",
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
    model="你的Claude模型ID",
    max_tokens=64,
    messages=[{"role":"user","content":"ping"}],
)
print(msg.content[0].text)`}
      />
      <p>
        可运行仓库：
        <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
          DaoXE-AI
        </a>
        。响应/错误样例：
        <Link to="/api/openai-chat">Chat</Link> · <Link to="/api/claude">Messages</Link>。
      </p>
    </Page>
  ),
  'multi-protocol': () => (
    <Page title="双协议接入清单" lead="全站协议对照的唯一权威页；各客户端专章只链接这里。">
      <p>
        可用线路与主机列表统一维护在 <Link to="/guide/base-url">线路与 Base URL</Link>；下表主机跟随实时
        api_info。
      </p>
      <h2>协议对照</h2>
      <ProtocolCheatSheet />
      <h2>配置前 smoke-test</h2>
      <p>
        配置任何客户端之前，先用 curl 跑通最小 Chat / Messages 请求，确认密钥与线路可用：
        <Link to="/guide/verify">curl 验证</Link>。
      </p>
      <h2>客户端对照</h2>
      <ul>
        <li>
          <Link to="/guide/cline">Cline</Link> / <Link to="/guide/cursor">Cursor</Link> → OpenAI Compatible（Base 带{' '}
          <code>/v1</code>）
        </li>
        <li>
          <Link to="/guide/claude-code">Claude Code</Link> → 站点根 + Messages
        </li>
        <li>
          <Link to="/guide/codex">Codex</Link> → <code>/v1</code> + responses
        </li>
      </ul>
      <h2>填反时的症状</h2>
      <ul>
        <li>
          Claude Base 多写 <code>/v1</code> → <code>/v1/v1/messages</code>
        </li>
        <li>OpenAI 客户端漏 <code>/v1</code> → 404</li>
        <li>
          令牌无权访问该模型 → <code>403</code>；所选分组下该模型无可用渠道 →{' '}
          <code>503 / no available channel</code>
        </li>
      </ul>
    </Page>
  ),

  verify: () => (
    <Page title="curl 验证" lead="排错入口：这里集中放探测命令，其它页请链过来。">
      <ModelIdNote />
      <h2>1. 模型</h2>
      <CurlModelsExample />
      <h2>2. Chat</h2>
      <CurlChatExample />
      <h2>3. Messages</h2>
      <CurlMessagesExample />
      <h2>4. 换 jp 对比</h2>
      <CodeBlock
        code={`curl https://jp.daoxe.com/v1/models \\
  -H "Authorization: Bearer sk-xxxx"`}
      />
      <Callout title="技巧">
        加 <code>-N</code> 减少缓冲；加 <code>-i</code> 看状态行。仓库脚本：
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/curl-chat.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          curl-chat.sh
        </a>
        。
      </Callout>
      <Related items={[{ to: '/guide/errors', label: '报错表' }, { to: '/api/errors', label: '错误码样例' }]} />
    </Page>
  ),

  errors: () => (
    <Page title="常见报错" lead="用户向排查步骤；具体 JSON 样例见 API 错误码页。">
      <table>
        <thead>
          <tr>
            <th>状态</th>
            <th>处理</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>401</td>
            <td>重拷 sk、检查 Bearer、重建 Key</td>
          </tr>
          <tr>
            <td>403</td>
            <td>余额不足则充值；令牌无权访问该模型则检查令牌的模型白名单 / 权限</td>
          </tr>
          <tr>
            <td>404</td>
            <td>
              Base 是否缺/多 <code>/v1</code>（
              <Link to="/guide/multi-protocol">双协议</Link>）
            </td>
          </tr>
          <tr>
            <td>429</td>
            <td>
              降并发（
              <Link to="/api/rate-limit">限流</Link>）
            </td>
          </tr>
          <tr>
            <td>503</td>
            <td>
              分组下该模型无可用渠道：换用包含该模型的分组，或确认该模型在当前分组有可用渠道（
              <Link to="/guide/models">模型与分组</Link>）
            </td>
          </tr>
          <tr>
            <td>5xx / 超时</td>
            <td>换 jp、降 max_tokens、重试</td>
          </tr>
        </tbody>
      </table>
      <Steps
        items={[
          <>
            <Link to="/guide/verify">curl 验证</Link>
          </>,
          <>同一 Key 最小 chat/messages</>,
          <>检查协议 Base</>,
          <>
            仍失败：
            <Link to="/support/contact">客服</Link> +{' '}
            <Link to="/api/errors">错误 JSON</Link>
          </>,
        ]}
      />
    </Page>
  ),

  auth: () => (
    <Page title="鉴权与请求头" lead="Header 写错是 401 主因。端点列表来自定价接口。">
      <h2>请求头</h2>
      <h3>OpenAI 兼容</h3>
      <OpenAIAuthHeaders />
      <h3>Anthropic 兼容</h3>
      <AnthropicAuthHeaders />
      <h2>站点声明的端点（实时）</h2>
      <LiveEndpointsBlock />
      <Callout title="安全">按用途拆分 Key；泄露立即删除重建。不要提交到 Git。</Callout>
      <Related
        items={[
          { to: '/guide/keys', label: '创建密钥' },
          { to: '/guide/verify', label: 'curl 验证' },
        ]}
      />
    </Page>
  ),

  routing: () => (
    <Page title="线路 · 流式 · 超时" lead="主机选择与超时策略；Base 形态见双协议页。">
      <BasePills />
      <ul>
        <li>流式默认常见；并发过多易 429</li>
        <li>超时：改 jp、降 max_tokens、拆任务、重试 2–5s</li>
        <li>网页打不开时 API 线路仍可能可用</li>
      </ul>
      <Related
        items={[
          { to: '/guide/base-url', label: '线路' },
          { to: '/guide/multi-protocol', label: '双协议' },
          { to: '/api/rate-limit', label: '限流' },
        ]}
      />
    </Page>
  ),

  'openai-chat': () => (
    <Page title="OpenAI · Chat Completions" lead="POST /v1/chat/completions">
      <p>
        鉴权：
        <Link to="/api/auth">鉴权页</Link>
        。Base：
        <Link to="/guide/multi-protocol">双协议清单</Link>
        。探测命令：
        <Link to="/guide/verify">curl 验证</Link>。
      </p>
      <OpenAIAuthHeaders />
      <CurlChatExample />
      <h2>成功响应（示例结构）</h2>
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
      <h2>流式片段（示例）</h2>
      <CodeBlock
        lang="text"
        code={`data: {"choices":[{"delta":{"content":"你"}}]}
data: [DONE]`}
      />
      <h2>错误示例</h2>
      <CodeBlock
        lang="json"
        code={`{"error":{"message":"Invalid token","code":401}}
{"error":{"message":"Insufficient quota"}}
{"error":{"message":"Rate limit exceeded"}}`}
      />
      <p>
        更多错误：
        <Link to="/api/errors">错误码</Link>
        。模型：
        <Link to="/guide/recommended-models">推荐模型表</Link>。
      </p>
    </Page>
  ),

  'openai-responses': () => (
    <Page title="OpenAI · Responses" lead="POST /v1/responses（定价接口声明 openai-response 端点）。">
      <p>
        Base 使用 <code>.../v1</code>。客户端步骤见 <Link to="/guide/codex">Codex</Link>。
      </p>
      <OpenAIAuthHeaders />
      <CodeBlock lang="text" code={`POST https://api.daoxe.com/v1/responses`} />
      <CodeBlock
        lang="json"
        code={`// 路径或 Base 错误时可能返回
{"error":{"message":"Invalid URL (POST /responses)","type":"invalid_request_error"}}`}
      />
      <p>
        哪些模型支持该端点，以推荐模型表中的协议标记 / 定价接口{' '}
        <code>supported_endpoint_types</code> 为准。
      </p>
    </Page>
  ),
  'openai-embeddings': () => (
    <Page title="OpenAI · Embeddings" lead="POST /v1/embeddings（定价接口含 embeddings 端点）。">
      <p>
        鉴权：
        <Link to="/api/auth">鉴权页</Link>
        。可用向量模型以
        <Link to="/guide/recommended-models">推荐模型表</Link>
        / 广场为准（常见分组名含 Embedding）。
      </p>
      <OpenAIAuthHeaders />
      <CodeBlock
        code={`curl https://api.daoxe.com/v1/embeddings \\
  -H "Authorization: Bearer sk-xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "从推荐模型表或 /v1/models 复制",
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
        鉴权：
        <Link to="/api/auth">鉴权页</Link>
        。Claude Code：
        <Link to="/guide/claude-code">专章</Link>
        。Base 用站点根，见
        <Link to="/guide/multi-protocol">双协议</Link>。
      </p>
      <AnthropicAuthHeaders />
      <CurlMessagesExample />
      <Callout title="max_tokens" warn>
        Messages 请求通常必须带 <code>max_tokens</code>。
      </Callout>
      <h2>成功响应（示例结构）</h2>
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
      <h2>错误示例</h2>
      <CodeBlock
        lang="json"
        code={`{"type":"error","error":{"type":"invalid_request_error","message":"max_tokens: required"}}
{"error":{"message":"Invalid token","code":401}}`}
      />
    </Page>
  ),
  gemini: () => (
    <Page title="Gemini 兼容" lead="定价接口声明 gemini 端点；也可用 OpenAI Chat 填 Gemini 模型 ID（取决于分组）。">
      <ModelIdNote />
      <p>
        终端里用 Gemini：<Link to="/guide/gemini-cli">Gemini CLI 专章</Link>。
      </p>
      <h2>原生路径（接口声明）</h2>
      <CodeBlock
        lang="text"
        code={`POST /v1beta/models/{model}:generateContent?key=sk-xxxx`}
      />
      <CodeBlock
        code={`curl "https://api.daoxe.com/v1beta/models/你的Gemini模型ID:generateContent?key=sk-xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"contents":[{"parts":[{"text":"ping"}]}],"generationConfig":{"maxOutputTokens":64}}'`}
      />
      <h2>或用 Chat 兼容</h2>
      <CurlChatExample model="你的Gemini模型ID" />
      <h2>响应 / 错误（结构示例）</h2>
      <CodeBlock
        lang="json"
        code={`{"candidates":[{"content":{"parts":[{"text":"..."}],"role":"model"},"finishReason":"STOP"}]}
{"error":{"message":"model not found or not available for this token group"}}`}
      />
      <Related
        items={[
          { to: '/guide/recommended-models', label: '推荐模型表' },
          { to: '/api/openai-chat', label: 'Chat Completions' },
        ]}
      />
    </Page>
  ),

  'api-models': () => (
    <Page title="模型列表" lead="GET /v1/models">
      <CurlModelsExample />
      <CodeBlock
        lang="json"
        code={`{"object":"list","data":[{"id":"…","object":"model"}]}`}
      />
      <p>
        全量价目与分组说明用 <Link to="/guide/recommended-models">推荐模型表</Link>
        （定价接口），不要与本页混成两份完整目录。
      </p>
    </Page>
  ),

  'api-errors': () => (
    <Page title="错误码" lead="API 错误 JSON 样例集中页；用户向步骤见「常见报错」。">
      <CodeBlock
        lang="json"
        code={`{"error":{"message":"Invalid token","code":401}}
{"error":{"message":"Insufficient quota"}}
{"error":{"message":"model not found or not available for this token group"}}
{"error":{"message":"Rate limit exceeded"}}
{"type":"error","error":{"type":"invalid_request_error","message":"max_tokens: required"}}`}
      />
      <Related items={[{ to: '/guide/errors', label: '常见报错（排查步骤）' }, { to: '/support/faq', label: 'FAQ' }]} />
    </Page>
  ),

  'rate-limit': () => (
    <Page
      title="限流与重试"
      lead="返回 429（Rate limit exceeded）说明触发了速率或并发限制，按以下方式降载并重试。"
    >
      <h2>处理建议</h2>
      <ul>
        <li>降低并发请求数与重试频率，避免密集轰炸同一模型</li>
        <li>指数退避（如 1s → 2s → 4s）并加随机抖动，避免同时重试</li>
        <li>减少同时进行的流式长连接</li>
      </ul>
      <h2>退避重试示例</h2>
      <CodeBlock
        lang="python"
        code={`import random, time

for attempt in range(5):
    resp = call_api()          # 你的请求函数
    if resp.status_code != 429:
        break
    delay = 2 ** attempt + random.random()   # 1s → 2s → 4s… + 抖动
    time.sleep(delay)`}
      />
      <Related items={[{ to: '/guide/errors', label: '常见报错' }, { to: '/api/errors', label: '错误样例' }]} />
    </Page>
  ),

  'billing-rules': () => (
    <Page title="计费规则" lead="计费三要素：模型单价 × 分组倍率 × 用量。分组倍率来自定价接口，具体扣费以用量日志为准。">
      <h2>计费方式</h2>
      <ul>
        <li>
          <strong>按量计费</strong>：按输入 / 输出 token 分别计价，输出通常更贵（见模型广场的补全倍率字段）。
        </li>
        <li>
          <strong>按次计费</strong>：部分模型按调用次数固定价，与 token 数无关。
        </li>
        <li>
          <strong>分组倍率</strong>：同一模型在不同分组下的最终价格 = 基础价 × <code>group_ratio</code>（见下表）。
        </li>
        <li>
          <strong>预扣与结算</strong>：流式等请求会先预扣一笔额度，结束后按实际用量多退少补——日志里余额短暂跳变属正常。
        </li>
      </ul>
      <h2>实时倍率与端点</h2>
      <LiveEndpointsBlock />
      <p>
        实时模型价目：<Link to="/guide/recommended-models">推荐模型表</Link>。对账疑问：
        <Link to="/billing/logs">余额与日志</Link>。
      </p>
    </Page>
  ),

  'billing-logs': () => (
    <Page title="余额与日志" lead="对账与异常扣费第一现场。">
      <Shot
        src="/images/guide/daoxe/08-logs.webp"
        alt="用量日志"
        caption="用量日志列表（实拍）"
      />
      <ul>
        <li>核对：时间、模型、分组、消耗、扣费、请求 ID</li>
        <li>流式预扣后数字跳变通常正常</li>
        <li>客户端成功但无日志：可能打到了错误 Base URL</li>
      </ul>
      <h2>数据看板</h2>
      <p>
        控制台「概览」页汇总近 24 小时消耗、总消耗、成功率、平均延迟与流量最高的模型——排查扣费或稳定性问题时先看这里，再进日志逐条核对。
      </p>
      <Shot
        src="/images/guide/daoxe/09-dashboard.webp"
        alt="控制台数据看板"
        caption="控制台概览 · 消耗曲线与用量统计（实拍）"
      />
      <Related
        items={[
          { to: '/billing/rules', label: '计费规则' },
          { to: '/support/contact', label: '客服' },
        ]}
      />
    </Page>
  ),

  'billing-pricing': () => (
    <Page
      title="价格与分组"
      lead="最终价格 = 模型基础价 × 分组倍率。价格与分组均为实时数据，以接口与模型广场为准。"
    >
      <Shot
        src="/images/guide/daoxe/02-pricing.webp"
        alt="模型广场"
        caption="模型广场公开页实拍"
      />
      <h2>怎么读价格</h2>
      <ul>
        <li>模型广场按模型列出基础价与支持的协议端点；输入与输出 token 通常分开计价</li>
        <li>
          创建密钥时选择的<strong>分组</strong>会乘上下表的 <code>group_ratio</code>{' '}
          倍率——同一模型在不同分组价格不同
        </li>
        <li>价格调整以站内公告与接口返回为准，文档不缓存价目数字</li>
      </ul>
      <LiveEndpointsBlock />
      <p>
        可搜索的实时模型表：
        <Link to="/guide/recommended-models">推荐模型表</Link>
        。计费口径：<Link to="/billing/rules">计费规则</Link>。
      </p>
    </Page>
  ),

  'topup-issues': () => (
    <Page title="充值对账" lead="支付渠道显示成功、但站内余额没有变化时，按以下顺序处理。">
      <Steps
        items={[
          <>支付渠道确认成功，保存订单号/截图</>,
          <>确认登录账号与下单一致</>,
          <>等待 15–30 分钟</>,
          <>
            仍无到账：不要连下多单，联系 <Link to="/support/contact">客服</Link>
          </>,
        ]}
      />
      <h2>常见原因</h2>
      <ul>
        <li>支付渠道回调延迟（加密货币、跨境或第三方支付高峰期尤为常见）</li>
        <li>下单与登录用了不同账号（换过邮箱或 OAuth 提供方）</li>
        <li>金额或套餐与页面不符，或兑换码未在「钱包」入口提交</li>
      </ul>
      <Related
        items={[
          { to: '/guide/topup', label: '充值与套餐' },
          { to: '/billing/logs', label: '余额与日志' },
          { to: '/support/contact', label: '联系客服' },
        ]}
      />
    </Page>
  ),

  wallet: () => (
    <Page title="钱包与订单" lead="钱包页集中了余额、充值、订阅与订单记录，是所有资金操作的入口。">
      <Shot
        src="/images/guide/daoxe/05-wallet.webp"
        alt="钱包"
        caption="钱包页（与充值专章同一实拍）"
      />
      <h2>页面能做什么</h2>
      <ul>
        <li>查看当前余额与套餐状态；充值 / 订阅 / 兑换码入口都在此页</li>
        <li>订单记录可核对每笔充值的金额、时间与到账状态</li>
        <li>余额消耗明细在「用量日志」，两边对照即可完成对账</li>
      </ul>
      <p>
        操作步骤：<Link to="/guide/topup">充值与套餐</Link>。支付成功未到账：
        <Link to="/billing/topup-issues">充值对账</Link>。扣费口径：
        <Link to="/billing/rules">计费规则</Link>。
      </p>
    </Page>
  ),

  'feat-keys': () => (
    <Page title="密钥管理" lead="密钥的日常管理：拆分、轮换与泄露处置。创建步骤见「创建 API 密钥」。">
      <h2>拆分建议</h2>
      <ul>
        <li>
          <strong>一用途一 Key</strong>：本地开发、CI、线上服务各用独立密钥，泄露时影响面最小
        </li>
        <li>
          <strong>一分组一 Key</strong>：分组决定可用模型与倍率，混用会导致"模型不可用/扣费不符预期"
        </li>
        <li>可为密钥设置额度或过期时间（以控制台实际选项为准），给临时用途加保险</li>
      </ul>
      <h2>泄露处置</h2>
      <Steps
        items={[
          <>立刻在控制台删除该密钥（吊销即时生效）。</>,
          <>新建密钥并更新到所有使用它的客户端 / 环境变量。</>,
          <>
            到<Link to="/billing/logs">用量日志</Link>核对泄露期间是否有异常调用。
          </>,
        ]}
      />
      <Callout title="不要提交到 Git" warn>
        <code>sk-</code> 开头的密钥一旦进入公开仓库会被扫描机器人秒级利用。用环境变量或密钥管理服务保存。
      </Callout>
      <Related
        items={[
          { to: '/guide/keys', label: '创建 API 密钥' },
          { to: '/api/auth', label: '鉴权与请求头' },
        ]}
      />
    </Page>
  ),

  'feat-pricing': () => (
    <Page
      title="模型广场 / 定价"
      lead="模型广场是全量价目与分组信息的权威入口；文档内的推荐模型表是它的实时抽样视图。"
    >
      <Shot
        src="/images/guide/daoxe/02-pricing.webp"
        alt="模型广场"
        caption="模型广场（公开页实拍）"
      />
      <p>
        打开{' '}
        <a href={absSite('/pricing')} target="_blank" rel="noopener noreferrer">
          定价页
        </a>
        。文档内实时表：
        <Link to="/guide/recommended-models">推荐模型表</Link>
        。概念：
        <Link to="/guide/models">模型与分组</Link>。
      </p>
    </Page>
  ),

  invite: () => (
    <Page title="邀请返佣" lead="若控制台提供邀请入口，以页面说明为准。">
      <Callout title="以站内为准">
        是否开启、比例、结算周期均以控制台实际功能为准。文档不编造未展示的规则。
      </Callout>
      <p>
        入口一般在登录后的控制台菜单中。相关客服：
        <Link to="/support/contact">联系客服</Link>。
      </p>
    </Page>
  ),

  notice: () => (
    <LiveNoticesPage />
  ),

  faq: () => (
    <LiveFaqPage />
  ),

  contact: () => (
    <Page title="联系客服" lead="联系方式优先从主站 status / 页脚接口读取。">
      <LiveContactBlock />
      <h2>反馈请尽量带上</h2>
      <ul>
        <li>账号邮箱（可打码）</li>
        <li>时间与时区</li>
        <li>Base URL / 线路</li>
        <li>模型 ID 与密钥分组</li>
        <li>HTTP 状态与报错原文（去掉 sk）</li>
      </ul>
      <Callout title="请勿发送" warn>
        完整 API 密钥、密码、验证码。
      </Callout>
    </Page>
  ),

  network: () => (
    <Page title="网络与访问" lead="官网打不开不代表 API 不可用——网页与 API 走不同入口，请分开排查。">
      <h2>排查步骤</h2>
      <Steps
        items={[
          <>
            先测 API：<Link to="/guide/verify">curl 验证</Link>依次换{' '}
            <Link to="/guide/base-url">线路</Link>主机（api → 官网 → jp），任意一条能通即可继续用。
          </>,
          <>
            再测网页：换浏览器 / 无痕窗口 / 网络环境重试；若仅网页慢，API 调用不受影响。
          </>,
          <>
            检查本地代理与 DNS：代理规则可能只放行部分域名，请把所有线路主机都加入放行列表。
          </>,
          <>
            都不通时联系<Link to="/support/contact">客服</Link>，附上时间、所在地区网络类型与报错截图。
          </>,
        ]}
      />
      <h2>常见现象对照</h2>
      <table>
        <thead>
          <tr>
            <th>现象</th>
            <th>判断</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>网页打不开，curl 能通</td>
            <td>网页入口受网络环境影响，API 正常，可继续调用</td>
          </tr>
          <tr>
            <td>某条线路超时，其他线路正常</td>
            <td>切换 Base URL 主机即可（客户端里改一处配置）</td>
          </tr>
          <tr>
            <td>所有线路均无法连接</td>
            <td>先检查本地网络/代理，再联系客服确认服务状态</td>
          </tr>
        </tbody>
      </table>
      <p>
        服务区域限制见 <Link to="/start/compliance">账号与合规</Link>。
      </p>
    </Page>
  ),

  terms: () => (
    <Page title="用户协议" lead="全文只在主站维护。">
      <CardGrid>
        <Card href={absSite('/user-agreement')} title="完整协议 ↗" desc="daoxe.com/user-agreement" />
        <Card href={absSite('/privacy-policy')} title="隐私政策 ↗" desc="主站" />
        <Card href={absSite('/sign-up')} title="注册 ↗" desc="同意后创建账号" />
      </CardGrid>
      <h2>摘要（非法律替代）</h2>
      <ul>
        <li>使用前应同意主站协议与隐私政策</li>
        <li>密钥与调用由账号持有人负责</li>
        <li>禁止违法用途</li>
        <li>服务区域限制以协议与公告为准</li>
      </ul>
    </Page>
  ),

  privacy: () => (
    <Page title="隐私政策" lead="法律全文在主站；以下仅说明文档站行为。">
      <CardGrid>
        <Card href={absSite('/privacy-policy')} title="完整隐私政策 ↗" desc="主站" />
        <Card href={absSite('/user-agreement')} title="用户协议 ↗" desc="主站" />
      </CardGrid>
      <ul>
        <li>
          主题偏好：cookie / localStorage <code>vite-ui-theme</code>
        </li>
        <li>侧栏折叠与滚动位置：localStorage / sessionStorage</li>
        <li>
          可请求主站 <code>/api/status</code>、<code>/api/notice</code>、<code>/api/pricing</code>
        </li>
        <li>同源部署后可读主站登录态 localStorage 以显示头像</li>
      </ul>
      <Callout title="不会">在文档站收集密码或 API 密钥。</Callout>
    </Page>
  ),

  abuse: () => (
    <Page title="滥用举报" lead="违规内容、滥用 API、欺诈、漏洞。">
      <Callout title="主题" warn>
        邮件请用 <strong>[Abuse Report]</strong>
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
        <li>类型与描述</li>
        <li>时间</li>
        <li>URL / 模型 / 请求 ID</li>
        <li>联系方式</li>
      </ol>
    </Page>
  ),

  changelog: () => (
    <Page title="更新日志" lead="文档站自身变更。">
      <h2>2026-07</h2>
      <ul>
        <li>
          新增客户端 / CLI 接入专章：DeepChat（官方内置）、CC Switch 图形配置、Gemini CLI、Cherry
          Studio、ChatBox、Lobe Chat、NextChat、Open WebUI、沉浸式翻译；全部中英双语，Base URL 跟随实时线路
        </li>
        <li>控制台实拍截图补齐：概览 / 钱包 / 建密钥 / 日志 / 数据看板 / API 线路 / CC Switch / DeepChat</li>
        <li>搜索升级为全文检索：正文、错误码、环境变量均可搜索，支持多词与大小写混合查询</li>
        <li>代码块接入 Shiki 语法高亮（One Dark Pro）；正文字体换用 Inter / JetBrains Mono</li>
        <li>线路、协议表与 curl 示例主机改为从 <code>status.api_info</code> 实时读取，接口不可用时回退内置线路</li>
        <li>视觉更新：首页 Hero、图标卡片、步骤连接线、多栏页脚、暗色模式与动效打磨</li>
        <li>文档改为 SPA：三栏布局、侧栏常驻、图片灯箱放大</li>
        <li>UI：Tailwind + Radix + Lucide；链接对比度加强</li>
        <li>推荐模型表对接 <code>GET /api/pricing</code> 实时同步</li>
        <li>内容按 DaoXE 线路 / FAQ / 公开端点校正；去掉重复叙述</li>
        <li>
          对齐官方示例仓库{' '}
          <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
            DaoXE-AI
          </a>
        </li>
      </ul>
    </Page>
  ),

  glossary: () => (
    <Page title="术语表" lead="文档用词。">
      <table>
        <thead>
          <tr>
            <th>术语</th>
            <th>含义</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base URL</td>
            <td>客户端填写的 API 根地址</td>
          </tr>
          <tr>
            <td>OpenAI 兼容</td>
            <td>
              如 <code>/v1/chat/completions</code>、<code>/v1/responses</code>、
              <code>/v1/embeddings</code>
            </td>
          </tr>
          <tr>
            <td>Anthropic 兼容</td>
            <td>
              <code>/v1/messages</code>
            </td>
          </tr>
          <tr>
            <td>Gemini 兼容路径</td>
            <td>
              <code>/v1beta/models/&#123;model&#125;:generateContent</code>
            </td>
          </tr>
          <tr>
            <td>分组</td>
            <td>密钥可用的模型集合与计费系数</td>
          </tr>
          <tr>
            <td>倍率</td>
            <td>分组计费系数（见定价接口 group_ratio）</td>
          </tr>
          <tr>
            <td>预扣</td>
            <td>请求过程中可能先冻结额度，结束后按实际结算</td>
          </tr>
          <tr>
            <td>GIA / 直连</td>
            <td>
              <code>api.daoxe.com</code> / <code>jp.daoxe.com</code>
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  ),

  install: () => (
    <Page title="环境安装附录" lead="CLI 安装随上游变化；装好后回到接入专章填 DaoXE 地址。">
      <h2>Node.js</h2>
      <p>
        建议安装 LTS：
        <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
          nodejs.org
        </a>
      </p>
      <CodeBlock code={`node -v && npm -v`} />
      <h2>Codex / Claude Code / Gemini CLI</h2>
      <p>请按各工具官方文档安装。装好后：</p>
      <ul>
        <li>
          Codex → <Link to="/guide/codex">Codex 专章</Link>
        </li>
        <li>
          Claude Code → <Link to="/guide/claude-code">Claude Code 专章</Link>
        </li>
        <li>
          Gemini CLI → <Link to="/guide/gemini-cli">Gemini CLI 专章</Link>
        </li>
      </ul>
      <Callout title="包名会变" warn>
        全局安装命令以官方仓库 README 为准，本文不固定某一版本的 npm 包名，避免过时。
      </Callout>
    </Page>
  ),
}
