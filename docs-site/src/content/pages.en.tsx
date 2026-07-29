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
 * English article bodies. Pages missing here fall back to the zh registry
 * (live-data pages and the bilingual client guides are already language-aware).
 */
export const contentEn: Record<string, () => ReactNode> = {
  welcome: () => (
    <>
      <Hero
        eyebrow="DaoXE Docs"
        title="DaoXE Documentation"
        lead="Grab a key and a model ID first, then connect by client protocol. These docs only cover what DaoXE actually supports."
        actions={
          <>
            <Button asChild>
              <Link to="/start/quickstart" className="no-underline">
                <Rocket className="size-4" /> Quick start
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/guide/recommended-models" className="no-underline">
                <Boxes className="size-4" /> Recommended models
              </Link>
            </Button>
          </>
        }
      />
      <PrerequisiteKey />
      <h2>Routes</h2>
      <BasePills />
      <h2>Which protocol</h2>
      <p>
        OpenAI-compatible clients append <code>/v1</code> to the chosen route; Claude (Anthropic) uses the site
        root with <code>/v1/messages</code>. Full protocol mapping:{' '}
        <Link to="/guide/multi-protocol">protocol checklist</Link>; routes and Base URLs:{' '}
        <Link to="/guide/base-url">Routes &amp; Base URL</Link>.
      </p>
      <h2>Learning path</h2>
      <CardGrid>
        <Card to="/start/quickstart" icon={<Rocket />} title="1. Quick start" desc="Get a minimal request working" />
        <Card
          to="/guide/recommended-models"
          icon={<Boxes />}
          title="2. Pick a model"
          desc="Live table from the pricing API"
        />
        <Card
          to="/guide/multi-protocol"
          icon={<Waypoints />}
          title="3. Pick a protocol"
          desc="OpenAI vs Claude"
        />
        <Card to="/guide/deepchat" icon={<BookOpenText />} title="4a. DeepChat" desc="Official built-in provider" />
        <Card
          to="/guide/claude-code"
          icon={<TerminalSquare />}
          title="4b. Claude Code"
          desc="Messages"
        />
        <Card to="/guide/sdk" icon={<Braces />} title="4c. SDK" desc="Python / Node" />
      </CardGrid>
      <p className="text-muted-foreground text-sm">
        Runnable scripts &amp; Postman:{' '}
        <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
          seven7763/DaoXE-AI
        </a>
      </p>
    </>
  ),

  quickstart: () => (
    <Page title="Quick start" lead="One goal: prove that key + model ID + route all work.">
      <Steps
        items={[
          <>Sign up and top up on the main site.</>,
          <>
            <Link to="/guide/keys">Create a key</Link> and pick the right group.
          </>,
          <>
            Copy a model ID from the <Link to="/guide/recommended-models">recommended models table</Link> or{' '}
            <code>/v1/models</code> below.
          </>,
          <>Send a minimal request; configure clients only after it succeeds.</>,
        ]}
      />
      <h2>List models</h2>
      <CurlModelsExample />
      <h2>Minimal Chat</h2>
      <CurlChatExample />
      <h2>Minimal Messages (if using Claude)</h2>
      <CurlMessagesExample />
      <p>
        Route switching and Base URL shapes: <Link to="/guide/base-url">Routes</Link> /{' '}
        <Link to="/guide/multi-protocol">Protocols</Link>. On failure, check{' '}
        <Link to="/guide/errors">common errors</Link>.
      </p>
    </Page>
  ),

  compliance: () => (
    <Page title="Account & compliance" lead="Full legal texts live on the main site.">
      <Callout title="Service region" warn>
        This service is <strong>not available in mainland China</strong>. The main-site announcements and terms
        prevail.
      </Callout>
      <ul>
        <li>
          Sign-up / sign-in happen only on the main site (
          <a href={absSite('/sign-in')} target="_blank" rel="noopener noreferrer">
            sign in
          </a>
          ).
        </li>
        <li>Keep API keys safe; never commit them to public repositories.</li>
        <li>The key's group determines available models and billing.</li>
        <li>Illegal use is prohibited.</li>
      </ul>
      <CardGrid>
        <Card href={absSite('/user-agreement')} title="Terms ↗" desc="Full text on the main site" />
        <Card href={absSite('/privacy-policy')} title="Privacy ↗" desc="Full text on the main site" />
        <Card to="/legal/abuse" title="Abuse reports" desc="Security & violation feedback" />
      </CardGrid>
    </Page>
  ),

  console: () => (
    <Page title="Console tour" lead="Common entries after signing in (the live console menu prevails).">
      <Shot
        src="/images/guide/daoxe/04-console.png"
        alt="Console overview"
        caption="Console overview"
      />
      <Shot
        src="/images/guide/daoxe/06-onboarding.png"
        alt="Onboarding guide"
        caption="Overview page onboarding / “Get started” steps"
      />
      <table>
        <thead>
          <tr>
            <th>Entry</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Overview</td>
            <td>Usage summary, shortcuts</td>
          </tr>
          <tr>
            <td>Wallet</td>
            <td>
              Top-up / subscription / redeem (<Link to="/guide/topup">guide</Link>)
            </td>
          </tr>
          <tr>
            <td>API Keys</td>
            <td>
              Create and manage keys (<Link to="/guide/keys">guide</Link>)
            </td>
          </tr>
          <tr>
            <td>Model Marketplace / Pricing</td>
            <td>
              Models and groups (<Link to="/guide/recommended-models">recommended table</Link>)
            </td>
          </tr>
          <tr>
            <td>Usage Logs</td>
            <td>
              Requests and charges (<Link to="/billing/logs">guide</Link>)
            </td>
          </tr>
        </tbody>
      </table>
      <h2>One-click apps (live)</h2>
      <LiveAppsBlock />
    </Page>
  ),

  register: () => (
    <Page title="Sign up & sign in" lead="Accounts live on the main site; the auth options below come from live status flags.">
      <LiveAuthOptionsBlock />
      <Steps
        items={[
          <>
            Open{' '}
            <a href={absSite('/')} target="_blank" rel="noopener noreferrer">
              https://daoxe.com
            </a>
          </>,
          <>Click “Sign in” / “Sign up”.</>,
          <>Authenticate with any method enabled above (password / GitHub / Telegram / Passkey…).</>,
          <>
            Once in the console, continue with <Link to="/guide/topup">top-up</Link> and{' '}
            <Link to="/guide/keys">key creation</Link>.
          </>,
        ]}
      />
      <Shot src="/images/guide/daoxe/01-home.png" alt="Home page" caption="DaoXE home page" />
      <Shot src="/images/guide/daoxe/03-login.png" alt="Sign-in page" caption="Sign-in page" />
      <Shot src="/images/guide/daoxe/03b-signup.png" alt="Sign-up page" caption="Sign-up page" />
      <Shot src="/images/guide/daoxe/02-pricing.png" alt="Model marketplace" caption="Model Marketplace (public page)" />
      <CardGrid>
        <Card href={absSite('/sign-in')} title="Sign in ↗" desc="daoxe.com/sign-in" />
        <Card href={absSite('/sign-up')} title="Sign up ↗" desc="daoxe.com/sign-up" />
        <Card href={absSite('/dashboard')} title="Console ↗" desc="After signing in" />
      </CardGrid>
    </Page>
  ),

  topup: () => (
    <Page title="Top-up & plans" lead="Add funds, subscribe, or redeem codes on the console “Wallet” page.">
      <Steps
        items={[
          <>Open “Wallet” in the left menu.</>,
          <>Top up or subscribe with any method the page offers.</>,
          <>Redeem codes in the redeem box if you have one.</>,
          <>Refresh the balance after payment; some channels take a moment to land.</>,
        ]}
      />
      <Shot
        src="/images/guide/daoxe/05-wallet.png"
        alt="Wallet"
        caption="Wallet page: top-up / subscription / redeem"
      />
      <p>
        Billing concepts: <Link to="/billing/rules">billing rules</Link>. Payment not credited:{' '}
        <Link to="/billing/topup-issues">top-up reconciliation</Link>.
      </p>
    </Page>
  ),

  keys: () => (
    <Page title="Create an API key" lead="The prerequisite for every client.">
      <Callout title="Security" warn>
        Copy the key immediately after creation. If leaked, delete and recreate it, then update every client.
        Mask <code>sk-</code> in screenshots.
      </Callout>
      <Steps
        items={[
          <>Console → “API Keys” → Create.</>,
          <>
            Name it; the <strong>group</strong> decides available models (see the{' '}
            <Link to="/guide/recommended-models">recommended models table</Link> / marketplace).
          </>,
          <>
            Save and copy the <code>sk-...</code> value.
          </>,
        ]}
      />
      <Shot
        src="/images/guide/daoxe/07-create-key.png"
        alt="Create key"
        caption="Create API key form (key masked)"
      />
      <p>
        Auth headers: <Link to="/api/auth">Auth &amp; headers</Link>. Management:{' '}
        <Link to="/features/keys">key management</Link>.
      </p>
    </Page>
  ),

  'base-url': () => (
    <Page title="Routes & Base URL" lead="Hosts and protocols follow the public API; the routes below come live from status.api_info.">
      <LiveRoutesBlock />
      <Shot
        src="/images/guide/daoxe/10-api-routes.png"
        alt="Console API info card with configured routes and latency checks"
        caption="Console “API info” card — configured routes with latency checks, same source as the live list above"
      />
      <h2>Protocol shapes (what to put in Base)</h2>
      <p>
        OpenAI-compatible clients append <code>/v1</code> to the chosen route; Anthropic (Claude) uses the site
        root with <code>/v1/messages</code>. Full protocol mapping:{' '}
        <Link to="/guide/multi-protocol">protocol checklist</Link>.
      </p>
      <Callout title="Hosts are interchangeable">
        Any route host above works — swap it for any url returned by api_info. OpenAI-compatible clients usually
        append <code>/v1</code>; Anthropic uses the site root.
      </Callout>
      <Related
        items={[
          { to: '/guide/multi-protocol', label: 'Protocol checklist' },
          { to: '/api/routing', label: 'Streaming & timeouts' },
        ]}
      />
    </Page>
  ),

  models: () => (
    <Page title="Models & groups" lead="Three linked concepts: a key belongs to a group, the group decides models and ratios, the model ID picks the model.">
      <ul>
        <li>
          <strong>Group</strong>: chosen at key creation; decides which models the key can call and at what
          ratio. Tell two permission errors apart: the token has no access to the model →{' '}
          <code>403</code> (check the token's model allow-list / permissions); the chosen group has no available
          channel for the model → <code>503 / no available channel</code> (switch to a group that includes the
          model, or confirm it has an available channel in the current group)
        </li>
        <li>
          <strong>Model ID</strong>: must match the site exactly (case and suffix). Copy from the{' '}
          <Link to="/guide/recommended-models">recommended models table</Link> or <code>/v1/models</code>
        </li>
        <li>
          <strong>Protocol endpoint</strong>: one model may serve several protocols (Chat / Responses /
          Messages) — see the live table below
        </li>
      </ul>
      <LiveEndpointsBlock />
      <p>
        Curated sample &amp; search: <Link to="/guide/recommended-models">recommended models table</Link>. Create
        a key: <Link to="/guide/keys">create a key</Link>.
      </p>
    </Page>
  ),

  clients: () => (
    <Page title="Client integration overview" lead="Pick a client chapter by type; protocol details live only on the protocol page.">
      <Callout title="Built-in provider">
        <Link to="/guide/deepchat">DeepChat</Link> ships with DaoXE built in — search, toggle on, paste a key. No
        Base URL to fill. The easiest path for newcomers.
      </Callout>
      <p>
        Each chapter covers only that client's fields. Base URL shapes and protocol mapping live in the{' '}
        <Link to="/guide/multi-protocol">protocol checklist</Link>; route selection in{' '}
        <Link to="/guide/base-url">Routes &amp; Base URL</Link>.
      </p>
      <h2>CLI / coding tools</h2>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Protocol / Base</th>
            <th>Docs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Claude Code</td>
            <td>Anthropic · site root</td>
            <td>
              <Link to="/guide/claude-code">Chapter</Link> · <Link to="/guide/cc-switch">CC Switch GUI</Link>
            </td>
          </tr>
          <tr>
            <td>Codex CLI</td>
            <td>
              OpenAI · <code>/v1</code> (responses)
            </td>
            <td>
              <Link to="/guide/codex">Chapter</Link>
            </td>
          </tr>
          <tr>
            <td>Gemini CLI</td>
            <td>Gemini · site root</td>
            <td>
              <Link to="/guide/gemini-cli">Chapter</Link>
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
            <td>OpenAI or Anthropic</td>
            <td>
              <Link to="/guide/opencode">OpenCode</Link> · <Link to="/guide/openclaw">OpenClaw</Link>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>GUI clients</h2>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Form factor</th>
            <th>Docs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DeepChat</td>
            <td>Desktop · DaoXE built in</td>
            <td>
              <Link to="/guide/deepchat">Chapter</Link>
            </td>
          </tr>
          <tr>
            <td>Cherry Studio</td>
            <td>Desktop</td>
            <td>
              <Link to="/guide/cherry-studio">Chapter</Link>
            </td>
          </tr>
          <tr>
            <td>ChatBox</td>
            <td>Desktop + mobile</td>
            <td>
              <Link to="/guide/chatbox">Chapter</Link>
            </td>
          </tr>
          <tr>
            <td>Lobe Chat</td>
            <td>Web (self-hostable)</td>
            <td>
              <Link to="/guide/lobe-chat">Chapter</Link>
            </td>
          </tr>
          <tr>
            <td>NextChat</td>
            <td>Web + desktop</td>
            <td>
              <Link to="/guide/nextchat">Chapter</Link>
            </td>
          </tr>
          <tr>
            <td>Open WebUI</td>
            <td>Self-hosted web</td>
            <td>
              <Link to="/guide/open-webui">Chapter</Link>
            </td>
          </tr>
          <tr>
            <td>Immersive Translate</td>
            <td>Browser extension</td>
            <td>
              <Link to="/guide/immersive-translate">Chapter</Link>
            </td>
          </tr>
          <tr>
            <td>Others (Continue / Aider…)</td>
            <td>Generic OpenAI Compatible</td>
            <td>
              <Link to="/guide/apps">GUI clients &amp; more</Link>
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
          <>Cline settings → API Provider = OpenAI Compatible.</>,
          <>
            Base URL = <code>https://api.daoxe.com/v1</code> (see the{' '}
            <Link to="/guide/multi-protocol">protocol checklist</Link>).
          </>,
          <>Paste the sk key; copy the Model ID from the models table or /v1/models.</>,
        ]}
      />
      <Callout title="No DaoXE dropdown entry">
        Use OpenAI Compatible with a custom Base — don't look for a first-class DaoXE option.
      </Callout>
      <p>
        Verify with <Link to="/guide/verify">curl</Link> before opening Cline.
      </p>
    </Page>
  ),

  'claude-code': () => (
    <Page title="Claude Code" lead="Anthropic Messages. Base is the site root.">
      <PrerequisiteKey />
      <p>
        Protocol details: <Link to="/guide/multi-protocol">protocol checklist</Link>. Get Messages working
        first:
      </p>
      <CurlMessagesExample />
      <h2>Environment variables / settings</h2>
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
        Directory: <code>~/.claude</code>. Verify with <code>claude</code>. If curl works but the CLI fails:
        check for a stray <code>/v1</code> or overriding env vars. Original doc:{' '}
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/CLAUDE_CODE.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          CLAUDE_CODE.md
        </a>
        . Prefer a GUI? See <Link to="/guide/cc-switch">CC Switch</Link>.
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
      <Callout title="/v1 is required" warn>
        See the <Link to="/guide/multi-protocol">protocol checklist</Link> ·{' '}
        <Link to="/api/openai-responses">Responses</Link>
      </Callout>
    </Page>
  ),

  apps: () => (
    <Page title="GUI clients & more" lead="Generic OpenAI Compatible fields; the in-site one-click app list comes from status.chats.">
      <PrerequisiteKey />
      <h2>In-site app entries (live)</h2>
      <LiveAppsBlock />
      <h2>Generic fields</h2>
      <p>
        See the <Link to="/guide/multi-protocol">protocol checklist</Link>. Continue example:
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
        More client field mappings:{' '}
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
    <Page title="OpenClaw" lead="Configure a provider with either OpenAI or Anthropic compatibility.">
      <PrerequisiteKey />
      <p>
        Pick one (shapes in the <Link to="/guide/multi-protocol">protocol checklist</Link>):
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
      <p>Use the official OpenClaw repo for install scripts.</p>
    </Page>
  ),

  opencode: () => (
    <Page title="OpenCode" lead="Point the provider config at DaoXE.">
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
        Install steps and package names follow OpenCode upstream. <Link to="/guide/verify">curl</Link> first
        before verifying in-app.
      </p>
    </Page>
  ),

  cursor: () => (
    <Page title="Cursor" lead="Custom OpenAI Base (option names vary by version).">
      <PrerequisiteKey />
      <Steps
        items={[
          <>Settings → Models / OpenAI-compatible options.</>,
          <>
            Override Base URL = <code>https://api.daoxe.com/v1</code>
          </>,
          <>Paste the sk key; the model name must match the marketplace ID exactly.</>,
        ]}
      />
      <Related items={[{ to: '/guide/multi-protocol', label: 'Protocol checklist' }, { to: '/guide/verify', label: 'curl check' }]} />
    </Page>
  ),

  sdk: () => (
    <Page title="Official SDK examples" lead="SDK code only; curl samples live on the verify page, response JSON on the API pages.">
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
        Runnable repo:{' '}
        <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
          DaoXE-AI
        </a>
        . Response / error samples: <Link to="/api/openai-chat">Chat</Link> ·{' '}
        <Link to="/api/claude">Messages</Link>.
      </p>
    </Page>
  ),

  'multi-protocol': () => (
    <Page title="Protocol checklist" lead="The single authoritative protocol mapping; client chapters only link here.">
      <p>
        Available routes and hosts are maintained in <Link to="/guide/base-url">Routes &amp; Base URL</Link>;
        hosts in the table follow live api_info.
      </p>
      <h2>Protocol mapping</h2>
      <ProtocolCheatSheet />
      <h2>Smoke-test before configuring</h2>
      <p>
        Before configuring any client, run a minimal Chat / Messages request with curl to confirm the key and
        route work: <Link to="/guide/verify">curl verification</Link>.
      </p>
      <h2>Client mapping</h2>
      <ul>
        <li>
          <Link to="/guide/cline">Cline</Link> / <Link to="/guide/cursor">Cursor</Link> → OpenAI Compatible (Base
          with <code>/v1</code>)
        </li>
        <li>
          <Link to="/guide/claude-code">Claude Code</Link> → site root + Messages
        </li>
        <li>
          <Link to="/guide/codex">Codex</Link> → <code>/v1</code> + responses
        </li>
      </ul>
      <h2>Symptoms when swapped</h2>
      <ul>
        <li>
          Extra <code>/v1</code> on a Claude Base → <code>/v1/v1/messages</code>
        </li>
        <li>
          Missing <code>/v1</code> on an OpenAI client → 404
        </li>
        <li>
          Token has no access to the model → <code>403</code>; no available channel for the model in the chosen
          group → <code>503 / no available channel</code>
        </li>
      </ul>
    </Page>
  ),

  verify: () => (
    <Page title="curl verification" lead="The debugging entry point: probe commands live here; other pages link over.">
      <ModelIdNote />
      <h2>1. Models</h2>
      <CurlModelsExample />
      <h2>2. Chat</h2>
      <CurlChatExample />
      <h2>3. Messages</h2>
      <CurlMessagesExample />
      <h2>4. Compare with the jp route</h2>
      <CodeBlock
        code={`curl https://jp.daoxe.com/v1/models \\
  -H "Authorization: Bearer sk-xxxx"`}
      />
      <Callout title="Tips">
        Add <code>-N</code> to reduce buffering; <code>-i</code> to see the status line. Repo script:{' '}
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/curl-chat.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          curl-chat.sh
        </a>
        .
      </Callout>
      <Related items={[{ to: '/guide/errors', label: 'Error table' }, { to: '/api/errors', label: 'Error JSON samples' }]} />
    </Page>
  ),

  errors: () => (
    <Page title="Common errors" lead="User-facing triage; raw JSON samples live on the API error page.">
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Fix</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>401</td>
            <td>Re-copy the sk key, check the Bearer header, recreate the key</td>
          </tr>
          <tr>
            <td>403</td>
            <td>Out of balance → top up; token has no access to the model → check the token's model allow-list / permissions</td>
          </tr>
          <tr>
            <td>404</td>
            <td>
              Base missing or doubling <code>/v1</code> (<Link to="/guide/multi-protocol">protocols</Link>)
            </td>
          </tr>
          <tr>
            <td>429</td>
            <td>
              Lower concurrency (<Link to="/api/rate-limit">rate limits</Link>)
            </td>
          </tr>
          <tr>
            <td>503</td>
            <td>
              No available channel for the model in the group: switch to a group that includes the model, or
              confirm it has an available channel in the current group (
              <Link to="/guide/models">Models &amp; groups</Link>)
            </td>
          </tr>
          <tr>
            <td>5xx / timeout</td>
            <td>Switch to jp, lower max_tokens, retry</td>
          </tr>
        </tbody>
      </table>
      <Steps
        items={[
          <>
            <Link to="/guide/verify">curl verification</Link>
          </>,
          <>Minimal chat/messages with the same key</>,
          <>Check the protocol Base</>,
          <>
            Still failing: <Link to="/support/contact">contact support</Link> with the{' '}
            <Link to="/api/errors">error JSON</Link>
          </>,
        ]}
      />
    </Page>
  ),

  auth: () => (
    <Page title="Auth & headers" lead="Wrong headers are the top cause of 401s. Endpoint list comes from the pricing API.">
      <h2>Request headers</h2>
      <h3>OpenAI-compatible</h3>
      <OpenAIAuthHeaders />
      <h3>Anthropic-compatible</h3>
      <AnthropicAuthHeaders />
      <h2>Endpoints declared by the site (live)</h2>
      <LiveEndpointsBlock />
      <Callout title="Security">
        Split keys per purpose; delete and recreate on leak. Never commit to Git.
      </Callout>
      <Related
        items={[
          { to: '/guide/keys', label: 'Create a key' },
          { to: '/guide/verify', label: 'curl check' },
        ]}
      />
    </Page>
  ),

  routing: () => (
    <Page title="Routes · streaming · timeouts" lead="Host selection and timeout strategy; Base shapes live on the protocol page.">
      <BasePills />
      <ul>
        <li>Streaming is the norm; too many concurrent requests trip 429</li>
        <li>Timeouts: switch to jp, lower max_tokens, split the task, retry after 2–5s</li>
        <li>The API routes can stay up even when the web page is unreachable</li>
      </ul>
      <Related
        items={[
          { to: '/guide/base-url', label: 'Routes' },
          { to: '/guide/multi-protocol', label: 'Protocols' },
          { to: '/api/rate-limit', label: 'Rate limits' },
        ]}
      />
    </Page>
  ),

  'openai-chat': () => (
    <Page title="OpenAI · Chat Completions" lead="POST /v1/chat/completions">
      <p>
        Auth: <Link to="/api/auth">auth page</Link>. Base:{' '}
        <Link to="/guide/multi-protocol">protocol checklist</Link>. Probe commands:{' '}
        <Link to="/guide/verify">curl verification</Link>.
      </p>
      <OpenAIAuthHeaders />
      <CurlChatExample />
      <h2>Success response (structure)</h2>
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
      <h2>Stream fragments (sample)</h2>
      <CodeBlock
        lang="text"
        code={`data: {"choices":[{"delta":{"content":"Hi"}}]}
data: [DONE]`}
      />
      <h2>Error samples</h2>
      <CodeBlock
        lang="json"
        code={`{"error":{"message":"Invalid token","code":401}}
{"error":{"message":"Insufficient quota"}}
{"error":{"message":"Rate limit exceeded"}}`}
      />
      <p>
        More errors: <Link to="/api/errors">error codes</Link>. Models:{' '}
        <Link to="/guide/recommended-models">recommended models table</Link>.
      </p>
    </Page>
  ),

  'openai-responses': () => (
    <Page title="OpenAI · Responses" lead="POST /v1/responses (declared as the openai-response endpoint by the pricing API).">
      <p>
        Base is <code>.../v1</code>. Client steps: <Link to="/guide/codex">Codex</Link>.
      </p>
      <OpenAIAuthHeaders />
      <CodeBlock lang="text" code={`POST https://api.daoxe.com/v1/responses`} />
      <CodeBlock
        lang="json"
        code={`// returned when the path or Base is wrong
{"error":{"message":"Invalid URL (POST /responses)","type":"invalid_request_error"}}`}
      />
      <p>
        Which models support this endpoint is defined by the protocol tags in the recommended models table /
        the pricing API's <code>supported_endpoint_types</code>.
      </p>
    </Page>
  ),

  'openai-embeddings': () => (
    <Page title="OpenAI · Embeddings" lead="POST /v1/embeddings (declared by the pricing API).">
      <p>
        Auth: <Link to="/api/auth">auth page</Link>. Available embedding models: see the{' '}
        <Link to="/guide/recommended-models">recommended models table</Link> / marketplace (group names often
        include “Embedding”).
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
        Auth: <Link to="/api/auth">auth page</Link>. Claude Code:{' '}
        <Link to="/guide/claude-code">chapter</Link>. Base is the site root — see{' '}
        <Link to="/guide/multi-protocol">protocols</Link>.
      </p>
      <AnthropicAuthHeaders />
      <CurlMessagesExample />
      <Callout title="max_tokens" warn>
        Messages requests usually must include <code>max_tokens</code>.
      </Callout>
      <h2>Success response (structure)</h2>
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
      <h2>Error samples</h2>
      <CodeBlock
        lang="json"
        code={`{"type":"error","error":{"type":"invalid_request_error","message":"max_tokens: required"}}
{"error":{"message":"Invalid token","code":401}}`}
      />
    </Page>
  ),

  gemini: () => (
    <Page title="Gemini compatible" lead="The pricing API declares a gemini endpoint; Gemini model IDs also work over OpenAI Chat (group permitting).">
      <ModelIdNote />
      <p>
        Terminal usage: <Link to="/guide/gemini-cli">Gemini CLI chapter</Link>.
      </p>
      <h2>Native path (as declared)</h2>
      <CodeBlock
        lang="text"
        code={`POST /v1beta/models/{model}:generateContent?key=sk-xxxx`}
      />
      <CodeBlock
        code={`curl "https://api.daoxe.com/v1beta/models/your-gemini-model-id:generateContent?key=sk-xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"contents":[{"parts":[{"text":"ping"}]}],"generationConfig":{"maxOutputTokens":64}}'`}
      />
      <h2>Or via Chat compatibility</h2>
      <CurlChatExample model="your-gemini-model-id" />
      <h2>Response / errors (structure)</h2>
      <CodeBlock
        lang="json"
        code={`{"candidates":[{"content":{"parts":[{"text":"..."}],"role":"model"},"finishReason":"STOP"}]}
{"error":{"message":"model not found or not available for this token group"}}`}
      />
      <Related
        items={[
          { to: '/guide/recommended-models', label: 'Recommended models' },
          { to: '/api/openai-chat', label: 'Chat Completions' },
        ]}
      />
    </Page>
  ),

  'api-models': () => (
    <Page title="Model list" lead="GET /v1/models">
      <CurlModelsExample />
      <CodeBlock
        lang="json"
        code={`{"object":"list","data":[{"id":"…","object":"model"}]}`}
      />
      <p>
        For the full price list and group notes use the{' '}
        <Link to="/guide/recommended-models">recommended models table</Link> (pricing API) — don't maintain two
        complete catalogs.
      </p>
    </Page>
  ),

  'api-errors': () => (
    <Page title="Error codes" lead="Collected API error JSON samples; user-facing steps live in “Common errors”.">
      <CodeBlock
        lang="json"
        code={`{"error":{"message":"Invalid token","code":401}}
{"error":{"message":"Insufficient quota"}}
{"error":{"message":"model not found or not available for this token group"}}
{"error":{"message":"Rate limit exceeded"}}
{"type":"error","error":{"type":"invalid_request_error","message":"max_tokens: required"}}`}
      />
      <Related items={[{ to: '/guide/errors', label: 'Common errors (triage)' }, { to: '/support/faq', label: 'FAQ' }]} />
    </Page>
  ),

  'rate-limit': () => (
    <Page
      title="Rate limits & retries"
      lead="A 429 (Rate limit exceeded) means you hit a rate or concurrency limit — shed load and retry as below."
    >
      <h2>Recommendations</h2>
      <ul>
        <li>Lower concurrency and retry frequency; don't hammer one model</li>
        <li>Exponential backoff (1s → 2s → 4s) with random jitter so retries don't align</li>
        <li>Reduce simultaneous long-lived streaming connections</li>
      </ul>
      <h2>Backoff retry example</h2>
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
      <Related items={[{ to: '/guide/errors', label: 'Common errors' }, { to: '/api/errors', label: 'Error samples' }]} />
    </Page>
  ),

  'billing-rules': () => (
    <Page title="Billing rules" lead="Three billing factors: model unit price × group ratio × usage. Ratios come from the pricing API; usage logs are the ground truth.">
      <h2>Billing modes</h2>
      <ul>
        <li>
          <strong>Usage-based</strong>: input / output tokens priced separately — output is usually more
          expensive (see the completion ratio in the marketplace).
        </li>
        <li>
          <strong>Per-call</strong>: some models charge a fixed price per call regardless of tokens.
        </li>
        <li>
          <strong>Group ratio</strong>: final price = base price × <code>group_ratio</code> (table below).
        </li>
        <li>
          <strong>Pre-hold &amp; settle</strong>: streaming requests hold quota first and settle to actual usage
          afterwards — brief balance jumps in the logs are normal.
        </li>
      </ul>
      <h2>Live ratios & endpoints</h2>
      <LiveEndpointsBlock />
      <p>
        Live model prices: <Link to="/guide/recommended-models">recommended models table</Link>. Reconciliation:{' '}
        <Link to="/billing/logs">balance &amp; logs</Link>.
      </p>
    </Page>
  ),

  'billing-logs': () => (
    <Page title="Balance & logs" lead="The first place to look for reconciliation and unexpected charges.">
      <Shot
        src="/images/guide/daoxe/08-logs.png"
        alt="Usage logs"
        caption="Usage log list"
      />
      <ul>
        <li>Check: time, model, group, usage, charge, request ID</li>
        <li>Number jumps after streaming pre-hold are usually normal</li>
        <li>Client succeeded but no log: you probably hit the wrong Base URL</li>
      </ul>
      <h2>Dashboard</h2>
      <p>
        The console Overview aggregates 24h spend, total spend, success rate, average latency and top models —
        start here for billing or stability issues, then drill into the logs.
      </p>
      <Shot
        src="/images/guide/daoxe/09-dashboard.png"
        alt="Console dashboard"
        caption="Console overview · spend curves and usage stats"
      />
      <Related
        items={[
          { to: '/billing/rules', label: 'Billing rules' },
          { to: '/support/contact', label: 'Support' },
        ]}
      />
    </Page>
  ),

  'billing-pricing': () => (
    <Page
      title="Prices & groups"
      lead="Final price = model base price × group ratio. Both are live data — the API and Model Marketplace prevail."
    >
      <Shot
        src="/images/guide/daoxe/02-pricing.png"
        alt="Model marketplace"
        caption="Model Marketplace (public page)"
      />
      <h2>Reading the prices</h2>
      <ul>
        <li>The marketplace lists base price and supported protocol endpoints per model; input and output tokens are usually priced separately</li>
        <li>
          The <strong>group</strong> chosen at key creation multiplies the <code>group_ratio</code> below — the
          same model costs differently across groups
        </li>
        <li>Price changes follow in-site announcements and API responses; the docs cache no numbers</li>
      </ul>
      <LiveEndpointsBlock />
      <p>
        Searchable live table: <Link to="/guide/recommended-models">recommended models table</Link>. Billing
        semantics: <Link to="/billing/rules">billing rules</Link>.
      </p>
    </Page>
  ),

  'topup-issues': () => (
    <Page title="Top-up reconciliation" lead="Payment shows success but the balance didn't move — handle it in this order.">
      <Steps
        items={[
          <>Confirm success on the payment channel; save the order number / screenshot</>,
          <>Confirm the signed-in account matches the one that ordered</>,
          <>Wait 15–30 minutes</>,
          <>
            Still nothing: don't place more orders — <Link to="/support/contact">contact support</Link>
          </>,
        ]}
      />
      <h2>Common causes</h2>
      <ul>
        <li>Payment-channel callback delay (common with crypto, cross-border or third-party payment peaks)</li>
        <li>Ordered and signed in on different accounts (switched email or OAuth provider)</li>
        <li>Amount or plan doesn't match the page, or a redeem code wasn't submitted in “Wallet”</li>
      </ul>
      <Related
        items={[
          { to: '/guide/topup', label: 'Top-up & plans' },
          { to: '/billing/logs', label: 'Balance & logs' },
          { to: '/support/contact', label: 'Contact support' },
        ]}
      />
    </Page>
  ),

  wallet: () => (
    <Page title="Wallet & orders" lead="The wallet page gathers balance, top-ups, subscriptions and order history — the hub for money operations.">
      <Shot
        src="/images/guide/daoxe/05-wallet.png"
        alt="Wallet"
        caption="Wallet page (same screenshot as the top-up chapter)"
      />
      <h2>What you can do here</h2>
      <ul>
        <li>Check balance and plan status; top-up / subscription / redeem entries all live here</li>
        <li>Order history verifies each top-up's amount, time and status</li>
        <li>Spending detail lives in “Usage Logs” — reconcile by comparing both</li>
      </ul>
      <p>
        Steps: <Link to="/guide/topup">top-up &amp; plans</Link>. Paid but not credited:{' '}
        <Link to="/billing/topup-issues">top-up reconciliation</Link>. Billing semantics:{' '}
        <Link to="/billing/rules">billing rules</Link>.
      </p>
    </Page>
  ),

  'feat-keys': () => (
    <Page title="Key management" lead="Day-to-day key hygiene: splitting, rotation, leak handling. Creation steps live in “Create an API key”.">
      <h2>Splitting advice</h2>
      <ul>
        <li>
          <strong>One purpose, one key</strong>: separate keys for local dev, CI and production minimize blast
          radius
        </li>
        <li>
          <strong>One group, one key</strong>: groups decide models and ratios; mixing causes “model
          unavailable / unexpected charges”
        </li>
        <li>Set quotas or expiry on keys (as the console offers) as insurance for temporary uses</li>
      </ul>
      <h2>Leak handling</h2>
      <Steps
        items={[
          <>Delete the key in the console immediately (revocation is instant).</>,
          <>Create a new key and update every client / env var using it.</>,
          <>
            Check <Link to="/billing/logs">usage logs</Link> for abnormal calls during the leak window.
          </>,
        ]}
      />
      <Callout title="Never commit to Git" warn>
        A leaked <code>sk-</code> key in a public repo gets exploited by scanners within seconds. Use env vars
        or a secret manager.
      </Callout>
      <Related
        items={[
          { to: '/guide/keys', label: 'Create an API key' },
          { to: '/api/auth', label: 'Auth & headers' },
        ]}
      />
    </Page>
  ),

  'feat-pricing': () => (
    <Page
      title="Model Marketplace / pricing"
      lead="The marketplace is the authoritative source for full prices and groups; the docs' recommended table is a live sample of it."
    >
      <Shot
        src="/images/guide/daoxe/02-pricing.png"
        alt="Model marketplace"
        caption="Model Marketplace (public page)"
      />
      <p>
        Open the{' '}
        <a href={absSite('/pricing')} target="_blank" rel="noopener noreferrer">
          pricing page
        </a>
        . In-docs live table: <Link to="/guide/recommended-models">recommended models table</Link>. Concepts:{' '}
        <Link to="/guide/models">models &amp; groups</Link>.
      </p>
    </Page>
  ),

  invite: () => (
    <Page title="Referral program" lead="If the console offers a referral entry, its on-page description prevails.">
      <Callout title="The site prevails">
        Whether it's enabled, the rate and the settlement cycle all follow the actual console feature. These
        docs invent no rules that aren't shown there.
      </Callout>
      <p>
        The entry usually lives in the signed-in console menu. Questions:{' '}
        <Link to="/support/contact">contact support</Link>.
      </p>
    </Page>
  ),

  contact: () => (
    <Page title="Contact support" lead="Contact details are read from the main-site status / footer API when available.">
      <LiveContactBlock />
      <h2>Please include</h2>
      <ul>
        <li>Account email (may be partially masked)</li>
        <li>Time and timezone</li>
        <li>Base URL / route</li>
        <li>Model ID and key group</li>
        <li>HTTP status and raw error (strip the sk key)</li>
      </ul>
      <Callout title="Never send" warn>
        Full API keys, passwords, or verification codes.
      </Callout>
    </Page>
  ),

  network: () => (
    <Page title="Network & access" lead="The website being unreachable doesn't mean the API is down — they use different entry points; debug them separately.">
      <h2>Debug order</h2>
      <Steps
        items={[
          <>
            Test the API first: <Link to="/guide/verify">curl verification</Link> across the{' '}
            <Link to="/guide/base-url">route</Link> hosts in turn (api → main site → jp). If any works, carry
            on.
          </>,
          <>
            Then test the web page: another browser / private window / network. If only the page is slow, API
            calls are unaffected.
          </>,
          <>
            Check local proxy and DNS: proxy rules may only allow some domains — allow every route host.
          </>,
          <>
            Nothing works: <Link to="/support/contact">contact support</Link> with the time, region, network
            type and error screenshots.
          </>,
        ]}
      />
      <h2>Symptom table</h2>
      <table>
        <thead>
          <tr>
            <th>Symptom</th>
            <th>Diagnosis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Page unreachable, curl works</td>
            <td>The web entry is affected by your network; the API is fine — keep calling</td>
          </tr>
          <tr>
            <td>One route times out, others work</td>
            <td>Just swap the Base URL host (one config change in your client)</td>
          </tr>
          <tr>
            <td>No route connects at all</td>
            <td>Check local network / proxy first, then ask support about service status</td>
          </tr>
        </tbody>
      </table>
      <p>
        Service region restrictions: <Link to="/start/compliance">account &amp; compliance</Link>.
      </p>
    </Page>
  ),

  terms: () => (
    <Page title="Terms of service" lead="The full text is maintained only on the main site.">
      <CardGrid>
        <Card href={absSite('/user-agreement')} title="Full terms ↗" desc="daoxe.com/user-agreement" />
        <Card href={absSite('/privacy-policy')} title="Privacy ↗" desc="Main site" />
        <Card href={absSite('/sign-up')} title="Sign up ↗" desc="Create an account after agreeing" />
      </CardGrid>
      <h2>Summary (not a legal substitute)</h2>
      <ul>
        <li>Agree to the main-site terms and privacy policy before use</li>
        <li>The account holder is responsible for keys and calls</li>
        <li>Illegal use is prohibited</li>
        <li>Service region restrictions follow the terms and announcements</li>
      </ul>
    </Page>
  ),

  privacy: () => (
    <Page title="Privacy policy" lead="Legal text lives on the main site; below is only what this docs site does.">
      <CardGrid>
        <Card href={absSite('/privacy-policy')} title="Full privacy policy ↗" desc="Main site" />
        <Card href={absSite('/user-agreement')} title="Terms ↗" desc="Main site" />
      </CardGrid>
      <ul>
        <li>
          Theme preference: cookie / localStorage <code>vite-ui-theme</code>
        </li>
        <li>Sidebar state and scroll position: localStorage / sessionStorage</li>
        <li>
          May call the main site's <code>/api/status</code>, <code>/api/notice</code>, <code>/api/pricing</code>
        </li>
        <li>When deployed same-origin, it may read the main-site session localStorage to show your avatar</li>
      </ul>
      <Callout title="Never">Collects passwords or API keys on the docs site.</Callout>
    </Page>
  ),

  abuse: () => (
    <Page title="Abuse reports" lead="Violating content, API abuse, fraud, vulnerabilities.">
      <Callout title="Subject line" warn>
        Please use <strong>[Abuse Report]</strong> in the email subject
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
        <li>Type and description</li>
        <li>Time</li>
        <li>URL / model / request ID</li>
        <li>Your contact</li>
      </ol>
    </Page>
  ),

  changelog: () => (
    <Page title="Changelog" lead="Changes to this docs site.">
      <h2>2026-07</h2>
      <ul>
        <li>
          New client / CLI chapters: DeepChat (built-in provider), CC Switch GUI, Gemini CLI, Cherry Studio,
          ChatBox, Lobe Chat, NextChat, Open WebUI, Immersive Translate — all bilingual, Base URLs follow live
          routes
        </li>
        <li>Full English article bodies for every page; the language switcher now swaps the entire content</li>
        <li>Real console screenshots added: overview / wallet / key creation / logs / dashboard / API routes / CC Switch / DeepChat</li>
        <li>Search upgraded to full text: bodies, error codes and env vars are all searchable, per language</li>
        <li>Shiki syntax highlighting (One Dark Pro); Inter / JetBrains Mono typography</li>
        <li>
          Routes, protocol tables and curl examples now read hosts from <code>status.api_info</code> live, with
          built-in fallbacks
        </li>
        <li>Visual refresh: home hero, icon cards, step connectors, multi-column footer, dark mode polish</li>
        <li>The docs are a SPA: three-column layout, persistent sidebar, image lightbox</li>
        <li>
          Recommended models table syncs from <code>GET /api/pricing</code>
        </li>
        <li>
          Aligned with the official examples repo{' '}
          <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
            DaoXE-AI
          </a>
        </li>
      </ul>
    </Page>
  ),

  glossary: () => (
    <Page title="Glossary" lead="Terms used across these docs.">
      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base URL</td>
            <td>The API root address configured in a client</td>
          </tr>
          <tr>
            <td>OpenAI-compatible</td>
            <td>
              e.g. <code>/v1/chat/completions</code>, <code>/v1/responses</code>, <code>/v1/embeddings</code>
            </td>
          </tr>
          <tr>
            <td>Anthropic-compatible</td>
            <td>
              <code>/v1/messages</code>
            </td>
          </tr>
          <tr>
            <td>Gemini-compatible path</td>
            <td>
              <code>/v1beta/models/&#123;model&#125;:generateContent</code>
            </td>
          </tr>
          <tr>
            <td>Group</td>
            <td>The set of models a key can use, plus its billing coefficient</td>
          </tr>
          <tr>
            <td>Ratio</td>
            <td>Group billing coefficient (group_ratio in the pricing API)</td>
          </tr>
          <tr>
            <td>Pre-hold</td>
            <td>Quota may be frozen during a request and settled to actual usage afterwards</td>
          </tr>
          <tr>
            <td>GIA / direct</td>
            <td>
              <code>api.daoxe.com</code> / <code>jp.daoxe.com</code>
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  ),

  install: () => (
    <Page title="Environment setup appendix" lead="CLI installers change upstream; once installed, return to the client chapter and enter the DaoXE address.">
      <h2>Node.js</h2>
      <p>
        Install the LTS release:{' '}
        <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
          nodejs.org
        </a>
      </p>
      <CodeBlock code={`node -v && npm -v`} />
      <h2>Codex / Claude Code / Gemini CLI</h2>
      <p>Install each tool per its official docs, then continue:</p>
      <ul>
        <li>
          Codex → <Link to="/guide/codex">Codex chapter</Link>
        </li>
        <li>
          Claude Code → <Link to="/guide/claude-code">Claude Code chapter</Link>
        </li>
        <li>
          Gemini CLI → <Link to="/guide/gemini-cli">Gemini CLI chapter</Link>
        </li>
      </ul>
      <Callout title="Package names change" warn>
        Use each official repo's README for the global install command — these docs pin no npm package names,
        to avoid going stale.
      </Callout>
    </Page>
  ),
}
