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
 * Russian article bodies. Pages missing here fall back to en, then the zh
 * registry (live-data pages and the bilingual client guides are language-aware).
 */
export const contentRu: Record<string, () => ReactNode> = {
  welcome: () => (
    <>
      <Hero
        eyebrow="DaoXE Docs"
        title="Документация DaoXE"
        lead="Сначала получите ключ и ID модели, затем подключайтесь по протоколу клиента. Документация описывает только то, что DaoXE действительно поддерживает."
        actions={
          <>
            <Button asChild>
              <Link to="/start/quickstart" className="no-underline">
                <Rocket className="size-4" /> Быстрый старт
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/guide/recommended-models" className="no-underline">
                <Boxes className="size-4" /> Каталог моделей
              </Link>
            </Button>
          </>
        }
      />
      <PrerequisiteKey />
      <h2>Маршруты</h2>
      <BasePills />
      <h2>Какой протокол</h2>
      <p>
        OpenAI-совместимые клиенты добавляют <code>/v1</code> к выбранному маршруту; Claude (Anthropic)
        использует корень сайта с путём <code>/v1/messages</code>. Полное соответствие протоколов:{' '}
        <Link to="/guide/multi-protocol">список протоколов</Link>; маршруты и Base URL:{' '}
        <Link to="/guide/base-url">маршруты и Base URL</Link>.
      </p>
      <h2>Путь обучения</h2>
      <CardGrid>
        <Card to="/start/quickstart" icon={<Rocket />} title="1. Быстрый старт" desc="Заставьте работать минимальный запрос" />
        <Card
          to="/guide/recommended-models"
          icon={<Boxes />}
          title="2. Выбор модели"
          desc="Живая таблица из API цен"
        />
        <Card
          to="/guide/multi-protocol"
          icon={<Waypoints />}
          title="3. Выбор протокола"
          desc="OpenAI или Claude"
        />
        <Card to="/guide/deepchat" icon={<BookOpenText />} title="4a. DeepChat" desc="Официальный встроенный провайдер" />
        <Card
          to="/guide/claude-code"
          icon={<TerminalSquare />}
          title="4b. Claude Code"
          desc="Messages"
        />
        <Card to="/guide/sdk" icon={<Braces />} title="4c. SDK" desc="Python / Node" />
      </CardGrid>
      <p className="text-muted-foreground text-sm">
        Готовые скрипты и Postman:{' '}
        <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
          seven7763/DaoXE-AI
        </a>
      </p>
    </>
  ),

  quickstart: () => (
    <Page title="Быстрый старт" lead="Одна цель: убедиться, что ключ + ID модели + маршрут работают.">
      <Steps
        items={[
          <>Зарегистрируйтесь и пополните баланс на основном сайте.</>,
          <>
            <Link to="/guide/keys">Создайте ключ</Link> и выберите нужную группу.
          </>,
          <>
            Скопируйте ID модели из <Link to="/guide/recommended-models">каталога моделей</Link> или через{' '}
            <code>/v1/models</code> ниже.
          </>,
          <>Отправьте минимальный запрос; настраивайте клиенты только после успеха.</>,
        ]}
      />
      <h2>Список моделей</h2>
      <CurlModelsExample />
      <h2>Минимальный Chat</h2>
      <CurlChatExample />
      <h2>Минимальный Messages (если используете Claude)</h2>
      <CurlMessagesExample />
      <p>
        Переключение маршрутов и формы Base URL: <Link to="/guide/base-url">маршруты</Link> /{' '}
        <Link to="/guide/multi-protocol">протоколы</Link>. При ошибке смотрите{' '}
        <Link to="/guide/errors">частые ошибки</Link>.
      </p>
    </Page>
  ),

  compliance: () => (
    <Page title="Аккаунт и правила" lead="Полные юридические тексты находятся на основном сайте.">
      <Callout title="Регион обслуживания" warn>
        Этот сервис <strong>недоступен в материковом Китае</strong>. Приоритет имеют объявления и условия
        основного сайта.
      </Callout>
      <ul>
        <li>
          Регистрация и вход выполняются только на основном сайте (
          <a href={absSite('/sign-in')} target="_blank" rel="noopener noreferrer">
            войти
          </a>
          ).
        </li>
        <li>Храните API-ключи в безопасности; не публикуйте их в открытых репозиториях.</li>
        <li>Группа ключа определяет доступные модели и биллинг.</li>
        <li>Незаконное использование запрещено.</li>
      </ul>
      <CardGrid>
        <Card href={absSite('/user-agreement')} title="Условия ↗" desc="Полный текст на основном сайте" />
        <Card href={absSite('/privacy-policy')} title="Конфиденциальность ↗" desc="Полный текст на основном сайте" />
        <Card to="/legal/abuse" title="Жалобы на злоупотребления" desc="Безопасность и нарушения" />
      </CardGrid>
    </Page>
  ),

  console: () => (
    <Page title="Обзор консоли" lead="Основные разделы после входа (приоритет — актуальное меню консоли).">
      <Shot
        src="/images/guide/daoxe/04-console.png"
        alt="Обзор консоли"
        caption="Обзор консоли"
      />
      <Shot
        src="/images/guide/daoxe/06-onboarding.png"
        alt="Гид для новичков"
        caption="Онбординг на странице обзора / шаги «Начать работу»"
      />
      <table>
        <thead>
          <tr>
            <th>Раздел</th>
            <th>Назначение</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Обзор</td>
            <td>Сводка использования, быстрые ссылки</td>
          </tr>
          <tr>
            <td>Кошелёк</td>
            <td>
              Пополнение / подписка / промокоды (<Link to="/guide/topup">инструкция</Link>)
            </td>
          </tr>
          <tr>
            <td>API-ключи</td>
            <td>
              Создание и управление ключами (<Link to="/guide/keys">инструкция</Link>)
            </td>
          </tr>
          <tr>
            <td>Витрина моделей / Цены</td>
            <td>
              Модели и группы (<Link to="/guide/recommended-models">каталог</Link>)
            </td>
          </tr>
          <tr>
            <td>Логи использования</td>
            <td>
              Запросы и списания (<Link to="/billing/logs">инструкция</Link>)
            </td>
          </tr>
        </tbody>
      </table>
      <h2>Приложения в один клик (live)</h2>
      <LiveAppsBlock />
    </Page>
  ),

  register: () => (
    <Page title="Регистрация и вход" lead="Аккаунты живут на основном сайте; способы входа ниже берутся из live-флагов status.">
      <LiveAuthOptionsBlock />
      <Steps
        items={[
          <>
            Откройте{' '}
            <a href={absSite('/')} target="_blank" rel="noopener noreferrer">
              https://daoxe.com
            </a>
          </>,
          <>Нажмите «Войти» / «Регистрация».</>,
          <>Пройдите аутентификацию любым включённым выше способом (пароль / GitHub / Telegram / Passkey…).</>,
          <>
            В консоли продолжите с <Link to="/guide/topup">пополнения</Link> и{' '}
            <Link to="/guide/keys">создания ключа</Link>.
          </>,
        ]}
      />
      <Shot src="/images/guide/daoxe/01-home.png" alt="Главная страница" caption="Главная страница DaoXE" />
      <Shot src="/images/guide/daoxe/03-login.png" alt="Страница входа" caption="Страница входа" />
      <Shot src="/images/guide/daoxe/03b-signup.png" alt="Страница регистрации" caption="Страница регистрации" />
      <Shot src="/images/guide/daoxe/02-pricing.png" alt="Витрина моделей" caption="Витрина моделей (публичная страница)" />
      <CardGrid>
        <Card href={absSite('/sign-in')} title="Войти ↗" desc="daoxe.com/sign-in" />
        <Card href={absSite('/sign-up')} title="Регистрация ↗" desc="daoxe.com/sign-up" />
        <Card href={absSite('/dashboard')} title="Консоль ↗" desc="После входа" />
      </CardGrid>
    </Page>
  ),

  topup: () => (
    <Page title="Пополнение и планы" lead="Пополняйте баланс, оформляйте подписку или используйте промокоды на странице «Кошелёк» в консоли.">
      <Steps
        items={[
          <>Откройте «Кошелёк» в левом меню.</>,
          <>Пополните баланс или оформите подписку любым предложенным способом.</>,
          <>Активируйте промокод в соответствующем поле, если он есть.</>,
          <>После оплаты обновите баланс; некоторые каналы зачисляют средства не сразу.</>,
        ]}
      />
      <Shot
        src="/images/guide/daoxe/05-wallet.png"
        alt="Кошелёк"
        caption="Страница кошелька: пополнение / подписка / промокоды"
      />
      <p>
        Понятия биллинга: <Link to="/billing/rules">правила оплаты</Link>. Платёж не зачислен:{' '}
        <Link to="/billing/topup-issues">сверка пополнений</Link>.
      </p>
    </Page>
  ),

  keys: () => (
    <Page title="Создание API-ключа" lead="Обязательный шаг для любого клиента.">
      <Callout title="Безопасность" warn>
        Скопируйте ключ сразу после создания. При утечке удалите его и создайте заново, затем обновите все
        клиенты. Замазывайте <code>sk-</code> на скриншотах.
      </Callout>
      <Steps
        items={[
          <>Консоль → «API-ключи» → Создать.</>,
          <>
            Задайте имя; <strong>группа</strong> определяет доступные модели (см.{' '}
            <Link to="/guide/recommended-models">каталог моделей</Link> / витрину).
          </>,
          <>
            Сохраните и скопируйте значение <code>sk-...</code>.
          </>,
        ]}
      />
      <Shot
        src="/images/guide/daoxe/07-create-key.png"
        alt="Создание ключа"
        caption="Форма создания API-ключа (ключ замазан)"
      />
      <p>
        Заголовки авторизации: <Link to="/api/auth">авторизация и заголовки</Link>. Управление:{' '}
        <Link to="/features/keys">управление ключами</Link>.
      </p>
    </Page>
  ),

  'base-url': () => (
    <Page title="Маршруты и Base URL" lead="Хосты и протоколы следуют публичному API; маршруты ниже приходят из status.api_info в реальном времени.">
      <LiveRoutesBlock />
      <Shot
        src="/images/guide/daoxe/10-api-routes.png"
        alt="Карточка API info в консоли с настроенными маршрутами и проверкой задержки"
        caption="Карточка «API info» в консоли — настроенные маршруты с проверкой задержки, тот же источник, что и live-список выше"
      />
      <h2>Формы протоколов (что писать в Base)</h2>
      <p>
        OpenAI-совместимые клиенты добавляют <code>/v1</code> к выбранному маршруту; Anthropic (Claude)
        использует корень сайта с путём <code>/v1/messages</code>. Полное соответствие протоколов:{' '}
        <Link to="/guide/multi-protocol">список протоколов</Link>.
      </p>
      <Callout title="Хосты взаимозаменяемы">
        Любой хост маршрута выше подойдёт — замените его на любой url, возвращённый api_info. OpenAI-совместимые
        клиенты обычно добавляют <code>/v1</code>; Anthropic использует корень сайта.
      </Callout>
      <Related
        items={[
          { to: '/guide/multi-protocol', label: 'Список протоколов' },
          { to: '/api/routing', label: 'Потоки и таймауты' },
        ]}
      />
    </Page>
  ),

  models: () => (
    <Page title="Модели и группы" lead="Три связанных понятия: ключ принадлежит группе, группа задаёт модели и коэффициенты, ID модели выбирает конкретную модель.">
      <ul>
        <li>
          <strong>Группа</strong>: выбирается при создании ключа; определяет, какие модели можно вызывать и по
          какому коэффициенту. Различайте две ошибки доступа: токен не имеет доступа к модели →{' '}
          <code>403</code> (проверьте список разрешённых моделей / права токена); в выбранной группе нет
          доступного канала для модели → <code>503 / no available channel</code> (выберите группу с этой моделью
          или убедитесь, что для неё есть доступный канал в текущей группе)
        </li>
        <li>
          <strong>ID модели</strong>: должен точно совпадать с сайтом (регистр и суффикс). Копируйте из{' '}
          <Link to="/guide/recommended-models">каталога моделей</Link> или через <code>/v1/models</code>
        </li>
        <li>
          <strong>Эндпоинт протокола</strong>: одна модель может обслуживать несколько протоколов (Chat /
          Responses / Messages) — см. live-таблицу ниже
        </li>
      </ul>
      <LiveEndpointsBlock />
      <p>
        Подборка и поиск: <Link to="/guide/recommended-models">каталог моделей</Link>. Создать ключ:{' '}
        <Link to="/guide/keys">создать ключ</Link>.
      </p>
    </Page>
  ),

  clients: () => (
    <Page title="Обзор подключения клиентов" lead="Выбирайте главу клиента по типу; детали протоколов живут только на странице протоколов.">
      <Callout title="Встроенный провайдер">
        <Link to="/guide/deepchat">DeepChat</Link> поставляется со встроенным DaoXE — найдите, включите, вставьте
        ключ. Base URL заполнять не нужно. Самый простой путь для новичков.
      </Callout>
      <p>
        Каждая глава описывает только поля своего клиента. Формы Base URL и соответствие протоколов — в{' '}
        <Link to="/guide/multi-protocol">списке протоколов</Link>; выбор маршрута — в{' '}
        <Link to="/guide/base-url">маршрутах и Base URL</Link>.
      </p>
      <h2>CLI / инструменты для кода</h2>
      <table>
        <thead>
          <tr>
            <th>Клиент</th>
            <th>Протокол / Base</th>
            <th>Документация</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Claude Code</td>
            <td>Anthropic · корень сайта</td>
            <td>
              <Link to="/guide/claude-code">Глава</Link> · <Link to="/guide/cc-switch">CC Switch (GUI)</Link>
            </td>
          </tr>
          <tr>
            <td>Codex CLI</td>
            <td>
              OpenAI · <code>/v1</code> (responses)
            </td>
            <td>
              <Link to="/guide/codex">Глава</Link>
            </td>
          </tr>
          <tr>
            <td>Gemini CLI</td>
            <td>Gemini · корень сайта</td>
            <td>
              <Link to="/guide/gemini-cli">Глава</Link>
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
            <td>OpenAI или Anthropic</td>
            <td>
              <Link to="/guide/opencode">OpenCode</Link> · <Link to="/guide/openclaw">OpenClaw</Link>
            </td>
          </tr>
        </tbody>
      </table>
      <h2>GUI-клиенты</h2>
      <table>
        <thead>
          <tr>
            <th>Клиент</th>
            <th>Формат</th>
            <th>Документация</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>DeepChat</td>
            <td>Десктоп · DaoXE встроен</td>
            <td>
              <Link to="/guide/deepchat">Глава</Link>
            </td>
          </tr>
          <tr>
            <td>Cherry Studio</td>
            <td>Десктоп</td>
            <td>
              <Link to="/guide/cherry-studio">Глава</Link>
            </td>
          </tr>
          <tr>
            <td>ChatBox</td>
            <td>Десктоп + мобильный</td>
            <td>
              <Link to="/guide/chatbox">Глава</Link>
            </td>
          </tr>
          <tr>
            <td>Lobe Chat</td>
            <td>Веб (можно самому хостить)</td>
            <td>
              <Link to="/guide/lobe-chat">Глава</Link>
            </td>
          </tr>
          <tr>
            <td>NextChat</td>
            <td>Веб + десктоп</td>
            <td>
              <Link to="/guide/nextchat">Глава</Link>
            </td>
          </tr>
          <tr>
            <td>Open WebUI</td>
            <td>Самостоятельный веб</td>
            <td>
              <Link to="/guide/open-webui">Глава</Link>
            </td>
          </tr>
          <tr>
            <td>Immersive Translate</td>
            <td>Расширение браузера</td>
            <td>
              <Link to="/guide/immersive-translate">Глава</Link>
            </td>
          </tr>
          <tr>
            <td>Другие (Continue / Aider…)</td>
            <td>Общий OpenAI Compatible</td>
            <td>
              <Link to="/guide/apps">GUI-клиенты и другое</Link>
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
          <>Настройки Cline → API Provider = OpenAI Compatible.</>,
          <>
            Base URL = <code>https://api.daoxe.com/v1</code> (см.{' '}
            <Link to="/guide/multi-protocol">список протоколов</Link>).
          </>,
          <>Вставьте ключ sk; скопируйте ID модели из каталога моделей или /v1/models.</>,
        ]}
      />
      <Callout title="Нет отдельного пункта DaoXE">
        Используйте OpenAI Compatible с собственным Base — не ищите отдельную опцию DaoXE.
      </Callout>
      <p>
        Проверьте через <Link to="/guide/verify">curl</Link>, прежде чем открывать Cline.
      </p>
    </Page>
  ),

  'claude-code': () => (
    <Page title="Claude Code" lead="Anthropic Messages. Base — корень сайта.">
      <PrerequisiteKey />
      <p>
        Детали протокола: <Link to="/guide/multi-protocol">список протоколов</Link>. Сначала заставьте работать
        Messages:
      </p>
      <CurlMessagesExample />
      <h2>Переменные окружения / settings</h2>
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
        Каталог: <code>~/.claude</code>. Проверка командой <code>claude</code>. Если curl работает, а CLI нет:
        проверьте лишний <code>/v1</code> или переопределяющие переменные окружения. Исходный документ:{' '}
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/CLAUDE_CODE.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          CLAUDE_CODE.md
        </a>
        . Предпочитаете GUI? См. <Link to="/guide/cc-switch">CC Switch</Link>.
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
      <Callout title="/v1 обязателен" warn>
        См. <Link to="/guide/multi-protocol">список протоколов</Link> ·{' '}
        <Link to="/api/openai-responses">Responses</Link>
      </Callout>
    </Page>
  ),

  apps: () => (
    <Page title="GUI-клиенты и другое" lead="Общие поля OpenAI Compatible; список приложений в один клик берётся из status.chats.">
      <PrerequisiteKey />
      <h2>Приложения на сайте (live)</h2>
      <LiveAppsBlock />
      <h2>Общие поля</h2>
      <p>
        См. <Link to="/guide/multi-protocol">список протоколов</Link>. Пример для Continue:
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
        Больше соответствий полей клиентов:{' '}
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
    <Page title="OpenClaw" lead="Настройте провайдера с совместимостью OpenAI или Anthropic.">
      <PrerequisiteKey />
      <p>
        Выберите один вариант (формы — в <Link to="/guide/multi-protocol">списке протоколов</Link>):
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
      <p>Для скриптов установки используйте официальный репозиторий OpenClaw.</p>
    </Page>
  ),

  opencode: () => (
    <Page title="OpenCode" lead="Направьте конфигурацию провайдера на DaoXE.">
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
        Шаги установки и имена пакетов — по документации OpenCode. Сначала <Link to="/guide/verify">curl</Link>,
        потом проверка в приложении.
      </p>
    </Page>
  ),

  cursor: () => (
    <Page title="Cursor" lead="Собственный Base OpenAI (названия опций зависят от версии).">
      <PrerequisiteKey />
      <Steps
        items={[
          <>Settings → Models / опции, совместимые с OpenAI.</>,
          <>
            Переопределите Base URL = <code>https://api.daoxe.com/v1</code>
          </>,
          <>Вставьте ключ sk; имя модели должно точно совпадать с ID на витрине.</>,
        ]}
      />
      <Related items={[{ to: '/guide/multi-protocol', label: 'Список протоколов' }, { to: '/guide/verify', label: 'Проверка curl' }]} />
    </Page>
  ),

  sdk: () => (
    <Page title="Примеры официальных SDK" lead="Только код SDK; примеры curl — на странице проверки, JSON ответов — на страницах API.">
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
        Готовый репозиторий:{' '}
        <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
          DaoXE-AI
        </a>
        . Примеры ответов / ошибок: <Link to="/api/openai-chat">Chat</Link> ·{' '}
        <Link to="/api/claude">Messages</Link>.
      </p>
    </Page>
  ),

  'multi-protocol': () => (
    <Page title="Список протоколов" lead="Единственное авторитетное соответствие протоколов; главы клиентов только ссылаются сюда.">
      <p>
        Доступные маршруты и хосты ведутся в <Link to="/guide/base-url">маршрутах и Base URL</Link>; хосты в
        таблице следуют live api_info.
      </p>
      <h2>Соответствие протоколов</h2>
      <ProtocolCheatSheet />
      <h2>Проверка перед настройкой</h2>
      <p>
        Перед настройкой любого клиента выполните минимальный запрос Chat / Messages через curl, чтобы
        убедиться в работоспособности ключа и маршрута: <Link to="/guide/verify">проверка curl</Link>.
      </p>
      <h2>Соответствие клиентов</h2>
      <ul>
        <li>
          <Link to="/guide/cline">Cline</Link> / <Link to="/guide/cursor">Cursor</Link> → OpenAI Compatible (Base
          с <code>/v1</code>)
        </li>
        <li>
          <Link to="/guide/claude-code">Claude Code</Link> → корень сайта + Messages
        </li>
        <li>
          <Link to="/guide/codex">Codex</Link> → <code>/v1</code> + responses
        </li>
      </ul>
      <h2>Симптомы при путанице</h2>
      <ul>
        <li>
          Лишний <code>/v1</code> в Base для Claude → <code>/v1/v1/messages</code>
        </li>
        <li>
          Пропущенный <code>/v1</code> у OpenAI-клиента → 404
        </li>
        <li>
          Токен не имеет доступа к модели → <code>403</code>; в выбранной группе нет доступного канала для модели
          → <code>503 / no available channel</code>
        </li>
      </ul>
    </Page>
  ),

  verify: () => (
    <Page title="Проверка curl" lead="Точка входа для отладки: команды-пробы здесь; другие страницы ссылаются сюда.">
      <ModelIdNote />
      <h2>1. Модели</h2>
      <CurlModelsExample />
      <h2>2. Chat</h2>
      <CurlChatExample />
      <h2>3. Messages</h2>
      <CurlMessagesExample />
      <h2>4. Сравнение с маршрутом jp</h2>
      <CodeBlock
        code={`curl https://jp.daoxe.com/v1/models \\
  -H "Authorization: Bearer sk-xxxx"`}
      />
      <Callout title="Советы">
        Добавьте <code>-N</code>, чтобы уменьшить буферизацию; <code>-i</code>, чтобы увидеть строку статуса.
        Скрипт из репозитория:{' '}
        <a
          href="https://github.com/seven7763/DaoXE-AI/blob/main/curl-chat.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          curl-chat.sh
        </a>
        .
      </Callout>
      <Related items={[{ to: '/guide/errors', label: 'Таблица ошибок' }, { to: '/api/errors', label: 'Примеры JSON ошибок' }]} />
    </Page>
  ),

  errors: () => (
    <Page title="Частые ошибки" lead="Разбор для пользователя; необработанные JSON-примеры — на странице ошибок API.">
      <table>
        <thead>
          <tr>
            <th>Статус</th>
            <th>Решение</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>401</td>
            <td>Скопируйте ключ sk заново, проверьте заголовок Bearer, пересоздайте ключ</td>
          </tr>
          <tr>
            <td>403</td>
            <td>Недостаточно средств → пополните; токен не имеет доступа к модели → проверьте список разрешённых моделей / права токена</td>
          </tr>
          <tr>
            <td>404</td>
            <td>
              Base отсутствует или дублирует <code>/v1</code> (<Link to="/guide/multi-protocol">протоколы</Link>)
            </td>
          </tr>
          <tr>
            <td>429</td>
            <td>
              Снизьте параллелизм (<Link to="/api/rate-limit">лимиты</Link>)
            </td>
          </tr>
          <tr>
            <td>503</td>
            <td>
              В группе нет доступного канала для модели: выберите группу с этой моделью или убедитесь, что для
              неё есть доступный канал в текущей группе (
              <Link to="/guide/models">Модели и группы</Link>)
            </td>
          </tr>
          <tr>
            <td>5xx / таймаут</td>
            <td>Переключитесь на jp, снизьте max_tokens, повторите</td>
          </tr>
        </tbody>
      </table>
      <Steps
        items={[
          <>
            <Link to="/guide/verify">Проверка curl</Link>
          </>,
          <>Минимальный chat/messages с тем же ключом</>,
          <>Проверьте Base протокола</>,
          <>
            Всё ещё ошибка: <Link to="/support/contact">свяжитесь с поддержкой</Link>, приложив{' '}
            <Link to="/api/errors">JSON ошибки</Link>
          </>,
        ]}
      />
    </Page>
  ),

  auth: () => (
    <Page title="Авторизация и заголовки" lead="Неверные заголовки — главная причина ошибок 401. Список эндпоинтов берётся из API цен.">
      <h2>Заголовки запроса</h2>
      <h3>OpenAI-совместимые</h3>
      <OpenAIAuthHeaders />
      <h3>Anthropic-совместимые</h3>
      <AnthropicAuthHeaders />
      <h2>Эндпоинты, объявленные сайтом (live)</h2>
      <LiveEndpointsBlock />
      <Callout title="Безопасность">
        Разделяйте ключи по назначению; при утечке удаляйте и создавайте заново. Никогда не коммитьте в Git.
      </Callout>
      <Related
        items={[
          { to: '/guide/keys', label: 'Создать ключ' },
          { to: '/guide/verify', label: 'Проверка curl' },
        ]}
      />
    </Page>
  ),

  routing: () => (
    <Page title="Маршруты · потоки · таймауты" lead="Выбор хоста и стратегия таймаутов; формы Base — на странице протоколов.">
      <BasePills />
      <ul>
        <li>Потоковая передача — норма; слишком много одновременных запросов вызывает 429</li>
        <li>Таймауты: переключитесь на jp, снизьте max_tokens, разбейте задачу, повторите через 2–5 с</li>
        <li>Маршруты API могут работать, даже когда сама веб-страница недоступна</li>
      </ul>
      <Related
        items={[
          { to: '/guide/base-url', label: 'Маршруты' },
          { to: '/guide/multi-protocol', label: 'Протоколы' },
          { to: '/api/rate-limit', label: 'Лимиты' },
        ]}
      />
    </Page>
  ),

  'openai-chat': () => (
    <Page title="OpenAI · Chat Completions" lead="POST /v1/chat/completions">
      <p>
        Авторизация: <Link to="/api/auth">страница авторизации</Link>. Base:{' '}
        <Link to="/guide/multi-protocol">список протоколов</Link>. Команды-пробы:{' '}
        <Link to="/guide/verify">проверка curl</Link>.
      </p>
      <OpenAIAuthHeaders />
      <CurlChatExample />
      <h2>Успешный ответ (структура)</h2>
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
      <h2>Фрагменты потока (пример)</h2>
      <CodeBlock
        lang="text"
        code={`data: {"choices":[{"delta":{"content":"Hi"}}]}
data: [DONE]`}
      />
      <h2>Примеры ошибок</h2>
      <CodeBlock
        lang="json"
        code={`{"error":{"message":"Invalid token","code":401}}
{"error":{"message":"Insufficient quota"}}
{"error":{"message":"Rate limit exceeded"}}`}
      />
      <p>
        Больше ошибок: <Link to="/api/errors">коды ошибок</Link>. Модели:{' '}
        <Link to="/guide/recommended-models">каталог моделей</Link>.
      </p>
    </Page>
  ),

  'openai-responses': () => (
    <Page title="OpenAI · Responses" lead="POST /v1/responses (объявлен как эндпоинт openai-response в API цен).">
      <p>
        Base — это <code>.../v1</code>. Шаги для клиента: <Link to="/guide/codex">Codex</Link>.
      </p>
      <OpenAIAuthHeaders />
      <CodeBlock lang="text" code={`POST https://api.daoxe.com/v1/responses`} />
      <CodeBlock
        lang="json"
        code={`// возвращается при неверном пути или Base
{"error":{"message":"Invalid URL (POST /responses)","type":"invalid_request_error"}}`}
      />
      <p>
        Какие модели поддерживают этот эндпоинт, определяют теги протоколов в каталоге моделей /{' '}
        <code>supported_endpoint_types</code> из API цен.
      </p>
    </Page>
  ),

  'openai-embeddings': () => (
    <Page title="OpenAI · Embeddings" lead="POST /v1/embeddings (объявлен в API цен).">
      <p>
        Авторизация: <Link to="/api/auth">страница авторизации</Link>. Доступные модели эмбеддингов: см.{' '}
        <Link to="/guide/recommended-models">каталог моделей</Link> / витрину (в названиях групп часто есть
        «Embedding»).
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
        Авторизация: <Link to="/api/auth">страница авторизации</Link>. Claude Code:{' '}
        <Link to="/guide/claude-code">глава</Link>. Base — корень сайта, см.{' '}
        <Link to="/guide/multi-protocol">протоколы</Link>.
      </p>
      <AnthropicAuthHeaders />
      <CurlMessagesExample />
      <Callout title="max_tokens" warn>
        Запросы Messages обычно должны содержать <code>max_tokens</code>.
      </Callout>
      <h2>Успешный ответ (структура)</h2>
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
      <h2>Примеры ошибок</h2>
      <CodeBlock
        lang="json"
        code={`{"type":"error","error":{"type":"invalid_request_error","message":"max_tokens: required"}}
{"error":{"message":"Invalid token","code":401}}`}
      />
    </Page>
  ),

  gemini: () => (
    <Page title="Gemini-совместимость" lead="API цен объявляет эндпоинт gemini; ID моделей Gemini также работают через OpenAI Chat (если группа позволяет).">
      <ModelIdNote />
      <p>
        Использование в терминале: <Link to="/guide/gemini-cli">глава Gemini CLI</Link>.
      </p>
      <h2>Нативный путь (как объявлено)</h2>
      <CodeBlock
        lang="text"
        code={`POST /v1beta/models/{model}:generateContent?key=sk-xxxx`}
      />
      <CodeBlock
        code={`curl "https://api.daoxe.com/v1beta/models/your-gemini-model-id:generateContent?key=sk-xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"contents":[{"parts":[{"text":"ping"}]}],"generationConfig":{"maxOutputTokens":64}}'`}
      />
      <h2>Или через совместимость Chat</h2>
      <CurlChatExample model="your-gemini-model-id" />
      <h2>Ответ / ошибки (структура)</h2>
      <CodeBlock
        lang="json"
        code={`{"candidates":[{"content":{"parts":[{"text":"..."}],"role":"model"},"finishReason":"STOP"}]}
{"error":{"message":"model not found or not available for this token group"}}`}
      />
      <Related
        items={[
          { to: '/guide/recommended-models', label: 'Каталог моделей' },
          { to: '/api/openai-chat', label: 'Chat Completions' },
        ]}
      />
    </Page>
  ),

  'api-models': () => (
    <Page title="Список моделей" lead="GET /v1/models">
      <CurlModelsExample />
      <CodeBlock
        lang="json"
        code={`{"object":"list","data":[{"id":"…","object":"model"}]}`}
      />
      <p>
        Полный прайс-лист и заметки о группах — в{' '}
        <Link to="/guide/recommended-models">каталоге моделей</Link> (API цен); не ведите два полных каталога.
      </p>
    </Page>
  ),

  'api-errors': () => (
    <Page title="Коды ошибок" lead="Собранные JSON-примеры ошибок API; пошаговые действия для пользователя — в «Частых ошибках».">
      <CodeBlock
        lang="json"
        code={`{"error":{"message":"Invalid token","code":401}}
{"error":{"message":"Insufficient quota"}}
{"error":{"message":"model not found or not available for this token group"}}
{"error":{"message":"Rate limit exceeded"}}
{"type":"error","error":{"type":"invalid_request_error","message":"max_tokens: required"}}`}
      />
      <Related items={[{ to: '/guide/errors', label: 'Частые ошибки (разбор)' }, { to: '/support/faq', label: 'FAQ' }]} />
    </Page>
  ),

  'rate-limit': () => (
    <Page
      title="Лимиты и повторы"
      lead="Ошибка 429 (Rate limit exceeded) означает достижение лимита скорости или параллелизма — снизьте нагрузку и повторяйте, как ниже."
    >
      <h2>Рекомендации</h2>
      <ul>
        <li>Снижайте параллелизм и частоту повторов; не долбите одну модель</li>
        <li>Экспоненциальная задержка (1с → 2с → 4с) со случайным джиттером, чтобы повторы не совпадали</li>
        <li>Сократите число одновременных длительных потоковых соединений</li>
      </ul>
      <h2>Пример повтора с задержкой</h2>
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
      <Related items={[{ to: '/guide/errors', label: 'Частые ошибки' }, { to: '/api/errors', label: 'Примеры ошибок' }]} />
    </Page>
  ),

  'billing-rules': () => (
    <Page title="Правила оплаты" lead="Три фактора оплаты: цена модели × коэффициент группы × потребление. Коэффициенты — из API цен; истина — логи использования.">
      <h2>Режимы оплаты</h2>
      <ul>
        <li>
          <strong>По потреблению</strong>: входные / выходные токены тарифицируются отдельно — вывод обычно
          дороже (см. коэффициент завершения на витрине).
        </li>
        <li>
          <strong>За вызов</strong>: некоторые модели берут фиксированную цену за вызов независимо от токенов.
        </li>
        <li>
          <strong>Коэффициент группы</strong>: итоговая цена = базовая цена × <code>group_ratio</code> (таблица
          ниже).
        </li>
        <li>
          <strong>Предзаморозка и расчёт</strong>: потоковые запросы сначала замораживают квоту, а затем
          рассчитывают по фактическому потреблению — кратковременные скачки баланса в логах — это нормально.
        </li>
      </ul>
      <h2>Коэффициенты и эндпоинты (live)</h2>
      <LiveEndpointsBlock />
      <p>
        Актуальные цены моделей: <Link to="/guide/recommended-models">каталог моделей</Link>. Сверка:{' '}
        <Link to="/billing/logs">баланс и логи</Link>.
      </p>
    </Page>
  ),

  'billing-logs': () => (
    <Page title="Баланс и логи" lead="Первое место для сверки и разбора неожиданных списаний.">
      <Shot
        src="/images/guide/daoxe/08-logs.png"
        alt="Логи использования"
        caption="Список логов использования"
      />
      <ul>
        <li>Проверяйте: время, модель, группу, потребление, списание, ID запроса</li>
        <li>Скачки чисел после предзаморозки потока обычно нормальны</li>
        <li>Клиент успешен, но лога нет: вероятно, вы попали в неверный Base URL</li>
      </ul>
      <h2>Панель</h2>
      <p>
        Раздел «Обзор» в консоли агрегирует расход за 24 ч, общий расход, успешность, среднюю задержку и топ
        моделей — начинайте отсюда при проблемах с оплатой или стабильностью, затем углубляйтесь в логи.
      </p>
      <Shot
        src="/images/guide/daoxe/09-dashboard.png"
        alt="Панель консоли"
        caption="Обзор консоли · кривые расхода и статистика использования"
      />
      <Related
        items={[
          { to: '/billing/rules', label: 'Правила оплаты' },
          { to: '/support/contact', label: 'Поддержка' },
        ]}
      />
    </Page>
  ),

  'billing-pricing': () => (
    <Page
      title="Цены и группы"
      lead="Итоговая цена = базовая цена модели × коэффициент группы. Оба значения — live-данные; приоритет у API и витрины моделей."
    >
      <Shot
        src="/images/guide/daoxe/02-pricing.png"
        alt="Витрина моделей"
        caption="Витрина моделей (публичная страница)"
      />
      <h2>Как читать цены</h2>
      <ul>
        <li>Витрина показывает базовую цену и поддерживаемые эндпоинты протоколов по каждой модели; входные и выходные токены обычно тарифицируются отдельно</li>
        <li>
          <strong>Группа</strong>, выбранная при создании ключа, умножается на <code>group_ratio</code> ниже —
          одна и та же модель стоит по-разному в разных группах
        </li>
        <li>Изменения цен следуют объявлениям на сайте и ответам API; документация не кэширует цифры</li>
      </ul>
      <LiveEndpointsBlock />
      <p>
        Живая таблица с поиском: <Link to="/guide/recommended-models">каталог моделей</Link>. Семантика оплаты:{' '}
        <Link to="/billing/rules">правила оплаты</Link>.
      </p>
    </Page>
  ),

  'topup-issues': () => (
    <Page title="Сверка пополнений" lead="Платёж успешен, а баланс не изменился — действуйте в таком порядке.">
      <Steps
        items={[
          <>Подтвердите успех в платёжном канале; сохраните номер заказа / скриншот</>,
          <>Убедитесь, что вошедший аккаунт совпадает с оформившим заказ</>,
          <>Подождите 15–30 минут</>,
          <>
            По-прежнему ничего: не оформляйте новые заказы — <Link to="/support/contact">свяжитесь с поддержкой</Link>
          </>,
        ]}
      />
      <h2>Частые причины</h2>
      <ul>
        <li>Задержка колбэка платёжного канала (частое при криптовалюте, трансграничных или пиковых сторонних платежах)</li>
        <li>Заказ и вход выполнены под разными аккаунтами (сменили email или OAuth-провайдера)</li>
        <li>Сумма или план не совпадают со страницей, либо промокод не отправлен в «Кошельке»</li>
      </ul>
      <Related
        items={[
          { to: '/guide/topup', label: 'Пополнение и планы' },
          { to: '/billing/logs', label: 'Баланс и логи' },
          { to: '/support/contact', label: 'Связаться с поддержкой' },
        ]}
      />
    </Page>
  ),

  wallet: () => (
    <Page title="Кошелёк и заказы" lead="Страница кошелька собирает баланс, пополнения, подписки и историю заказов — центр всех операций с деньгами.">
      <Shot
        src="/images/guide/daoxe/05-wallet.png"
        alt="Кошелёк"
        caption="Страница кошелька (тот же скриншот, что в главе о пополнении)"
      />
      <h2>Что можно сделать здесь</h2>
      <ul>
        <li>Проверить баланс и статус плана; входы для пополнения / подписки / промокодов — здесь</li>
        <li>История заказов подтверждает сумму, время и статус каждого пополнения</li>
        <li>Детализация расходов — в «Логах использования»; сверяйте, сопоставляя оба раздела</li>
      </ul>
      <p>
        Шаги: <Link to="/guide/topup">пополнение и планы</Link>. Оплачено, но не зачислено:{' '}
        <Link to="/billing/topup-issues">сверка пополнений</Link>. Семантика оплаты:{' '}
        <Link to="/billing/rules">правила оплаты</Link>.
      </p>
    </Page>
  ),

  'feat-keys': () => (
    <Page title="Управление ключами" lead="Повседневная гигиена ключей: разделение, ротация, реакция на утечку. Шаги создания — в «Создании API-ключа».">
      <h2>Советы по разделению</h2>
      <ul>
        <li>
          <strong>Одно назначение — один ключ</strong>: отдельные ключи для локальной разработки, CI и продакшена
          минимизируют радиус поражения
        </li>
        <li>
          <strong>Одна группа — один ключ</strong>: группы определяют модели и коэффициенты; смешение приводит к
          «модель недоступна / неожиданные списания»
        </li>
        <li>Задавайте квоты или срок действия ключей (если консоль это позволяет) как страховку для временных задач</li>
      </ul>
      <h2>Реакция на утечку</h2>
      <Steps
        items={[
          <>Немедленно удалите ключ в консоли (отзыв мгновенный).</>,
          <>Создайте новый ключ и обновите все клиенты / переменные окружения, использующие его.</>,
          <>
            Проверьте <Link to="/billing/logs">логи использования</Link> на аномальные вызовы во время утечки.
          </>,
        ]}
      />
      <Callout title="Никогда не коммитьте в Git" warn>
        Утёкший ключ <code>sk-</code> в открытом репозитории эксплуатируется сканерами за секунды. Используйте
        переменные окружения или менеджер секретов.
      </Callout>
      <Related
        items={[
          { to: '/guide/keys', label: 'Создать API-ключ' },
          { to: '/api/auth', label: 'Авторизация и заголовки' },
        ]}
      />
    </Page>
  ),

  'feat-pricing': () => (
    <Page
      title="Витрина моделей / цены"
      lead="Витрина — авторитетный источник полных цен и групп; каталог в документации — её live-выборка."
    >
      <Shot
        src="/images/guide/daoxe/02-pricing.png"
        alt="Витрина моделей"
        caption="Витрина моделей (публичная страница)"
      />
      <p>
        Откройте{' '}
        <a href={absSite('/pricing')} target="_blank" rel="noopener noreferrer">
          страницу цен
        </a>
        . Live-таблица в документации: <Link to="/guide/recommended-models">каталог моделей</Link>. Понятия:{' '}
        <Link to="/guide/models">модели и группы</Link>.
      </p>
    </Page>
  ),

  invite: () => (
    <Page title="Реферальная программа" lead="Если консоль предлагает реферальный раздел, приоритет — за его описанием на странице.">
      <Callout title="Приоритет у сайта">
        Включена ли она, ставка и цикл расчётов — всё следует реальной функции консоли. Документация не выдумывает
        правил, которых там нет.
      </Callout>
      <p>
        Раздел обычно находится в меню консоли после входа. Вопросы:{' '}
        <Link to="/support/contact">свяжитесь с поддержкой</Link>.
      </p>
    </Page>
  ),

  contact: () => (
    <Page title="Связаться с поддержкой" lead="Контакты по возможности читаются из API status / подвала основного сайта.">
      <LiveContactBlock />
      <h2>Пожалуйста, укажите</h2>
      <ul>
        <li>Email аккаунта (можно частично замазать)</li>
        <li>Время и часовой пояс</li>
        <li>Base URL / маршрут</li>
        <li>ID модели и группу ключа</li>
        <li>HTTP-статус и исходную ошибку (уберите ключ sk)</li>
      </ul>
      <Callout title="Никогда не отправляйте" warn>
        Полные API-ключи, пароли или коды подтверждения.
      </Callout>
    </Page>
  ),

  network: () => (
    <Page title="Сеть и доступ" lead="Недоступность сайта не означает, что API не работает — у них разные точки входа; отлаживайте раздельно.">
      <h2>Порядок отладки</h2>
      <Steps
        items={[
          <>
            Сначала проверьте API: <Link to="/guide/verify">проверка curl</Link> по хостам{' '}
            <Link to="/guide/base-url">маршрутов</Link> по очереди (api → основной сайт → jp). Если хоть один
            работает — продолжайте.
          </>,
          <>
            Затем проверьте сайт: другой браузер / приватное окно / сеть. Если тормозит только страница, вызовы
            API не затронуты.
          </>,
          <>
            Проверьте локальный прокси и DNS: правила прокси могут пропускать лишь часть доменов — разрешите все
            хосты маршрутов.
          </>,
          <>
            Ничего не работает: <Link to="/support/contact">свяжитесь с поддержкой</Link>, указав время, регион,
            тип сети и скриншоты ошибок.
          </>,
        ]}
      />
      <h2>Таблица симптомов</h2>
      <table>
        <thead>
          <tr>
            <th>Симптом</th>
            <th>Диагноз</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Страница недоступна, curl работает</td>
            <td>Веб-вход затронут вашей сетью; API в порядке — продолжайте вызовы</td>
          </tr>
          <tr>
            <td>Один маршрут таймаутит, другие работают</td>
            <td>Просто смените хост Base URL (одна правка в клиенте)</td>
          </tr>
          <tr>
            <td>Ни один маршрут не подключается</td>
            <td>Сначала проверьте локальную сеть / прокси, затем спросите поддержку о статусе сервиса</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ограничения региона обслуживания: <Link to="/start/compliance">аккаунт и правила</Link>.
      </p>
    </Page>
  ),

  terms: () => (
    <Page title="Условия обслуживания" lead="Полный текст поддерживается только на основном сайте.">
      <CardGrid>
        <Card href={absSite('/user-agreement')} title="Полные условия ↗" desc="daoxe.com/user-agreement" />
        <Card href={absSite('/privacy-policy')} title="Конфиденциальность ↗" desc="Основной сайт" />
        <Card href={absSite('/sign-up')} title="Регистрация ↗" desc="Создать аккаунт после согласия" />
      </CardGrid>
      <h2>Кратко (не заменяет юридический текст)</h2>
      <ul>
        <li>Перед использованием согласитесь с условиями и политикой конфиденциальности основного сайта</li>
        <li>За ключи и вызовы отвечает владелец аккаунта</li>
        <li>Незаконное использование запрещено</li>
        <li>Ограничения региона обслуживания следуют условиям и объявлениям</li>
      </ul>
    </Page>
  ),

  privacy: () => (
    <Page title="Политика конфиденциальности" lead="Юридический текст — на основном сайте; ниже только то, что делает эта документация.">
      <CardGrid>
        <Card href={absSite('/privacy-policy')} title="Полная политика ↗" desc="Основной сайт" />
        <Card href={absSite('/user-agreement')} title="Условия ↗" desc="Основной сайт" />
      </CardGrid>
      <ul>
        <li>
          Предпочтение темы: cookie / localStorage <code>vite-ui-theme</code>
        </li>
        <li>Состояние боковой панели и позиция прокрутки: localStorage / sessionStorage</li>
        <li>
          Может обращаться к <code>/api/status</code>, <code>/api/notice</code>, <code>/api/pricing</code>{' '}
          основного сайта
        </li>
        <li>При размещении на том же домене может читать localStorage сессии основного сайта для показа аватара</li>
      </ul>
      <Callout title="Никогда">Не собирает пароли или API-ключи на этой документации.</Callout>
    </Page>
  ),

  abuse: () => (
    <Page title="Жалобы на злоупотребления" lead="Нарушающий контент, злоупотребление API, мошенничество, уязвимости.">
      <Callout title="Тема письма" warn>
        Используйте <strong>[Abuse Report]</strong> в теме письма
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
        <li>Тип и описание</li>
        <li>Время</li>
        <li>URL / модель / ID запроса</li>
        <li>Ваш контакт</li>
      </ol>
    </Page>
  ),

  changelog: () => (
    <Page title="История изменений" lead="Изменения этой документации.">
      <h2>2026-07</h2>
      <ul>
        <li>
          Новые главы клиентов / CLI: DeepChat (встроенный провайдер), CC Switch GUI, Gemini CLI, Cherry Studio,
          ChatBox, Lobe Chat, NextChat, Open WebUI, Immersive Translate — Base URL следуют live-маршрутам
        </li>
        <li>Полные тексты статей на нескольких языках; переключатель языка меняет весь контент</li>
        <li>Добавлены реальные скриншоты консоли: обзор / кошелёк / создание ключа / логи / панель / маршруты API / CC Switch / DeepChat</li>
        <li>Поиск обновлён до полнотекстового: тексты, коды ошибок и переменные окружения — всё ищется, по каждому языку</li>
        <li>Подсветка синтаксиса Shiki (One Dark Pro); типографика Inter / JetBrains Mono</li>
        <li>
          Маршруты, таблицы протоколов и примеры curl читают хосты из <code>status.api_info</code> в реальном
          времени, с встроенными запасными вариантами
        </li>
        <li>Обновление визуала: главный экран, карточки с иконками, соединители шагов, многоколоночный подвал, доработка тёмной темы</li>
        <li>Документация — это SPA: три колонки, постоянная боковая панель, лайтбокс изображений</li>
        <li>
          Каталог моделей синхронизируется через <code>GET /api/pricing</code>
        </li>
        <li>
          Выровнено с официальным репозиторием примеров{' '}
          <a href="https://github.com/seven7763/DaoXE-AI" target="_blank" rel="noopener noreferrer">
            DaoXE-AI
          </a>
        </li>
      </ul>
    </Page>
  ),

  glossary: () => (
    <Page title="Глоссарий" lead="Термины, используемые в этой документации.">
      <table>
        <thead>
          <tr>
            <th>Термин</th>
            <th>Значение</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base URL</td>
            <td>Корневой адрес API, настраиваемый в клиенте</td>
          </tr>
          <tr>
            <td>OpenAI-совместимый</td>
            <td>
              например <code>/v1/chat/completions</code>, <code>/v1/responses</code>, <code>/v1/embeddings</code>
            </td>
          </tr>
          <tr>
            <td>Anthropic-совместимый</td>
            <td>
              <code>/v1/messages</code>
            </td>
          </tr>
          <tr>
            <td>Gemini-совместимый путь</td>
            <td>
              <code>/v1beta/models/&#123;model&#125;:generateContent</code>
            </td>
          </tr>
          <tr>
            <td>Группа</td>
            <td>Набор моделей, доступных ключу, плюс его коэффициент оплаты</td>
          </tr>
          <tr>
            <td>Коэффициент</td>
            <td>Коэффициент оплаты группы (group_ratio в API цен)</td>
          </tr>
          <tr>
            <td>Предзаморозка</td>
            <td>Квота может быть заморожена во время запроса и рассчитана по факту после</td>
          </tr>
          <tr>
            <td>GIA / прямой</td>
            <td>
              <code>api.daoxe.com</code> / <code>jp.daoxe.com</code>
            </td>
          </tr>
        </tbody>
      </table>
    </Page>
  ),

  install: () => (
    <Page title="Приложение по установке окружения" lead="Установщики CLI меняются в апстриме; после установки вернитесь в главу клиента и укажите адрес DaoXE.">
      <h2>Node.js</h2>
      <p>
        Установите LTS-версию:{' '}
        <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
          nodejs.org
        </a>
      </p>
      <CodeBlock code={`node -v && npm -v`} />
      <h2>Codex / Claude Code / Gemini CLI</h2>
      <p>Установите каждый инструмент по его официальной документации, затем продолжайте:</p>
      <ul>
        <li>
          Codex → <Link to="/guide/codex">глава Codex</Link>
        </li>
        <li>
          Claude Code → <Link to="/guide/claude-code">глава Claude Code</Link>
        </li>
        <li>
          Gemini CLI → <Link to="/guide/gemini-cli">глава Gemini CLI</Link>
        </li>
      </ul>
      <Callout title="Имена пакетов меняются" warn>
        Берите команду глобальной установки из README официального репозитория — документация не фиксирует имена
        npm-пакетов, чтобы не устареть.
      </Callout>
    </Page>
  ),
}
