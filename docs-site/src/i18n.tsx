import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { LANG_META } from '@/config'

/** UI languages for shell + nav */
export type Lang = 'zh' | 'en' | 'ru' | 'vi'

export const LANGS: { id: Lang; label: string; native: string }[] = [
  { id: 'zh', label: 'Chinese', native: '中文' },
  { id: 'en', label: 'English', native: 'English' },
  { id: 'ru', label: 'Russian', native: 'Русский' },
  { id: 'vi', label: 'Vietnamese', native: 'Tiếng Việt' },
]

type Dict = Record<string, string>

const zh: Dict = {
  'nav.docs': '文档',
  'nav.home': '主页',
  'nav.console': '控制台',
  'nav.pricing': '模型广场',
  'nav.rankings': '排行榜',
  'nav.about': '关于',
  'nav.signin': '登录',
  'nav.signout': '登出',
  'nav.signoutConfirm': '确认登出？',
  'nav.profile': '个人资料',
  'nav.wallet': '钱包',
  'nav.settings': '系统设置',
  'nav.theme': '主题',
  'nav.theme.light': '浅色',
  'nav.theme.dark': '深色',
  'nav.theme.system': '系统',
  'nav.notice': '系统公告',
  'nav.noticeEmpty': '暂无公告',
  'nav.menu': '打开文档目录',
  'nav.lang': '语言',
  'nav.search': '搜索文档',
  'nav.search.placeholder': '搜索页面、协议、模型…',
  'nav.search.empty': '无匹配结果',
  'nav.search.hint': '⌘K / Ctrl+K',
  'nav.search.recent': '最近浏览',
  'nav.search.popular': '热门入口',
  'sidebar.catalog': '文档目录',
  'toc.title': '本页目录',
  'toc.quick': '快捷入口',
  'toc.quickstart': '快速开始',
  'toc.models': '推荐模型表',
  'toc.protocol': '双协议清单',
  'toc.verify': 'curl 验证',
  'toc.errors': '常见报错',
  'pager.prev': '上一页',
  'pager.next': '下一页',
  'crumb.docs': '文档',
  'footer.terms': '用户协议',
  'footer.privacy': '隐私政策',
  'footer.signin': '登录',
  'footer.signup': '注册',
  'footer.support': '客服',
  'footer.region': '不向中国大陆提供服务 / Not available in mainland China',
  'footer.docs': 'Docs',
  'footer.tagline': 'AI API 网关文档',
  'common.copy': '复制',
  'common.copied': '已复制',
  'common.refresh': '刷新',
  'common.search': '搜索',
  'common.loading': '加载中…',
  'common.retry': '重试',
  'common.updatedAt': '更新于',
  'common.on': '开启',
  'common.off': '关闭',
  'notfound.title': '页面不存在',
  'notfound.body': '该地址没有对应的文档页面，可能是链接已失效或拼写有误。',
  'notfound.home': '返回文档首页',
  'error.content.title': '内容加载失败',
  'error.content.body': '文档正文没有加载完成，通常是网络中断，或站点刚刚发布了新版本。刷新页面即可恢复。',
  'nav.role.super': '超级管理员',
  'nav.role.admin': '管理员',
  'nav.role.user': '用户',
  'shot.zoom': '点击放大',
  'shot.hint': '点击图片可放大',
  'shot.broken': '截图待补充 · 以站内实际界面为准',
  'shot.zoomOut': '缩小',
  'shot.zoomInBtn': '放大',
  'shot.original': '打开原图',
  'shot.reset': '重置缩放',
  'shot.lightboxHint': 'Esc 关闭 · +/− 缩放 · 0 重置 · 双击切换',
  'live.sync': '正在同步接口数据…',
  'live.loadFail': '加载失败',
  'live.apps.empty': '控制台未返回应用列表（或为空），以站内「应用」入口为准。',
  'live.footerRaw': '页脚 HTML（接口原文）',
  'proto.hostLive': '主机来自 status.api_info 实时数据；换线路时替换主机即可。',
  'proto.hostFallback': '当前展示内置默认线路（实时接口暂不可用）；换线路时替换主机即可。',
  'live.notice.title': '公告与通知',
  'live.notice.lead': '数据来自主站公开接口，实时同步。',
  'live.notice.system': '系统通知',
  'live.notice.list': '公告列表',
  'live.notice.empty': '暂无公告内容',
  'live.notice.disabled': '公告功能未开启',
  'live.faq.title': 'FAQ',
  'live.faq.lead': '来自控制台配置的常见问题（/api/status）。',
  'live.faq.empty': '暂无 FAQ',
  'live.faq.disabled': 'FAQ 未开启',
  'live.faq.search': '搜索问题…',
  'client.install': '下载与安装',
  'client.steps': '配置步骤',
  'client.models': '模型选择',
  'client.pitfalls': '常见坑',
  'client.screenshot': '配置界面参考',
  'client.related': '相关',
  'assistant.open': '打开文档助手',
  'assistant.close': '关闭文档助手',
  'assistant.title': '文档助手',
  'assistant.subtitle': '基于 DaoXE 文档回答',
  'assistant.welcome':
    '你好！我是 DaoXE 文档助手，可帮你查 Base URL、密钥、模型接入与常见报错。试试下面快捷问题：',
  'assistant.page': '当前页面：{page}',
  'assistant.placeholder': '问文档相关问题…',
  'assistant.send': '发送',
  'assistant.stop': '停止生成',
  'assistant.clear': '清空对话',
  'assistant.thinking': '正在检索文档并回答…',
  'assistant.sources': '相关文档',
  'assistant.disclaimer': '回答依据站内文档检索，仅供参考；涉及计费/协议请以控制台与正式条款为准。',
  'assistant.error': '请求失败：{msg}',
  'assistant.empty': '（模型未返回内容，请换个问法或稍后重试）',
  'assistant.stopped': '（已停止）',
  'assistant.suggest.quickstart': '如何快速开始？',
  'assistant.suggest.baseurl': 'Base URL 怎么填？',
  'assistant.suggest.keys': '如何创建 API 密钥？',
  'assistant.suggest.errors': '401 / 模型不存在怎么排查？',
  'seo.siteDescription':
    '{brand} 文档 — OpenAI / Anthropic / Gemini 兼容的 AI API 网关。快速开始、客户端接入、API 参考、计费说明与常见问题。',
  'seo.pageDescription':
    '{title} — {brand} {group}。OpenAI / Anthropic / Gemini 兼容的 AI API 网关文档。',
  'lang.suggest.text': '本页也有中文版本。',
  'lang.suggest.action': '切换到中文',
  'lang.suggest.dismiss': '不用了',
}

const en: Dict = {
  'nav.docs': 'Docs',
  'nav.home': 'Home',
  'nav.console': 'Console',
  'nav.pricing': 'Models',
  'nav.rankings': 'Rankings',
  'nav.about': 'About',
  'nav.signin': 'Sign in',
  'nav.signout': 'Sign out',
  'nav.signoutConfirm': 'Confirm sign out?',
  'nav.profile': 'Profile',
  'nav.wallet': 'Wallet',
  'nav.settings': 'Settings',
  'nav.theme': 'Theme',
  'nav.theme.light': 'Light',
  'nav.theme.dark': 'Dark',
  'nav.theme.system': 'System',
  'nav.notice': 'Notices',
  'nav.noticeEmpty': 'No notices',
  'nav.menu': 'Open docs menu',
  'nav.lang': 'Language',
  'nav.search': 'Search docs',
  'nav.search.placeholder': 'Search pages, protocols, models…',
  'nav.search.empty': 'No matches',
  'nav.search.hint': '⌘K / Ctrl+K',
  'nav.search.recent': 'Recently viewed',
  'nav.search.popular': 'Popular pages',
  'sidebar.catalog': 'Docs',
  'toc.title': 'On this page',
  'toc.quick': 'Shortcuts',
  'toc.quickstart': 'Quick start',
  'toc.models': 'Model catalog',
  'toc.protocol': 'Protocols',
  'toc.verify': 'curl check',
  'toc.errors': 'Errors',
  'pager.prev': 'Previous',
  'pager.next': 'Next',
  'crumb.docs': 'Docs',
  'footer.terms': 'Terms',
  'footer.privacy': 'Privacy',
  'footer.signin': 'Sign in',
  'footer.signup': 'Sign up',
  'footer.support': 'Support',
  'footer.region': 'Not available in mainland China',
  'footer.docs': 'Docs',
  'footer.tagline': 'AI API gateway documentation',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.refresh': 'Refresh',
  'common.search': 'Search',
  'common.loading': 'Loading…',
  'common.retry': 'Retry',
  'common.updatedAt': 'Updated',
  'common.on': 'On',
  'common.off': 'Off',
  'notfound.title': 'Page not found',
  'notfound.body': 'No documentation page matches this address — the link may be outdated or misspelled.',
  'notfound.home': 'Back to docs home',
  'error.content.title': 'Content failed to load',
  'error.content.body': 'The page body did not finish loading, usually a dropped connection or a release that just replaced this build. Reloading the page fixes it.',
  'nav.role.super': 'Super admin',
  'nav.role.admin': 'Admin',
  'nav.role.user': 'User',
  'shot.zoom': 'Click to enlarge',
  'shot.hint': 'Click image to enlarge',
  'shot.broken': 'Screenshot pending — refer to the live console UI',
  'shot.zoomOut': 'Zoom out',
  'shot.zoomInBtn': 'Zoom in',
  'shot.original': 'Open original',
  'shot.reset': 'Reset zoom',
  'shot.lightboxHint': 'Esc close · +/− zoom · 0 reset · double-click toggle',
  'live.sync': 'Syncing live data…',
  'live.loadFail': 'Failed to load',
  'live.apps.empty': 'The console returned no app list; use the in-site “Apps” entry.',
  'live.footerRaw': 'Footer HTML (raw from API)',
  'proto.hostLive': 'Hosts come from live status.api_info; swap the host to switch routes.',
  'proto.hostFallback':
    'Showing built-in default routes (live API unavailable); swap the host to switch routes.',
  'live.notice.title': 'Notices',
  'live.notice.lead': 'Live data from the public API.',
  'live.notice.system': 'System notice',
  'live.notice.list': 'Announcements',
  'live.notice.empty': 'No notice content',
  'live.notice.disabled': 'Announcements are disabled',
  'live.faq.title': 'FAQ',
  'live.faq.lead': 'From console FAQ config (/api/status).',
  'live.faq.empty': 'No FAQ items',
  'live.faq.disabled': 'FAQ is disabled',
  'live.faq.search': 'Search questions…',
  'client.install': 'Download & install',
  'client.steps': 'Setup steps',
  'client.models': 'Choosing models',
  'client.pitfalls': 'Common pitfalls',
  'client.screenshot': 'UI reference',
  'client.related': 'Related',
  'assistant.open': 'Open docs assistant',
  'assistant.close': 'Close docs assistant',
  'assistant.title': 'Docs assistant',
  'assistant.subtitle': 'Answers grounded in DaoXE docs',
  'assistant.welcome':
    'Hi! I help with Base URL, API keys, model setup, and common errors. Try a suggestion:',
  'assistant.page': 'Current page: {page}',
  'assistant.placeholder': 'Ask about the docs…',
  'assistant.send': 'Send',
  'assistant.stop': 'Stop generating',
  'assistant.clear': 'Clear chat',
  'assistant.thinking': 'Searching docs…',
  'assistant.sources': 'Sources',
  'assistant.disclaimer':
    'Answers use on-site doc search and may be incomplete. Billing/legal details follow the console and formal terms.',
  'assistant.error': 'Request failed: {msg}',
  'assistant.empty': '(Empty model reply — rephrase or try again later)',
  'assistant.stopped': '(Stopped)',
  'assistant.suggest.quickstart': 'How do I get started?',
  'assistant.suggest.baseurl': 'What Base URL should I use?',
  'assistant.suggest.keys': 'How do I create an API key?',
  'assistant.suggest.errors': 'How do I debug 401 / model_not_found?',
  'seo.siteDescription':
    '{brand} docs — an OpenAI / Anthropic / Gemini compatible AI API gateway. Quick start, client setup, API reference, billing and FAQ.',
  'seo.pageDescription':
    '{title} — {brand} {group}. Docs for an OpenAI / Anthropic / Gemini compatible AI API gateway.',
  'lang.suggest.text': 'This page is also available in English.',
  'lang.suggest.action': 'Switch to English',
  'lang.suggest.dismiss': 'No thanks',
}

const ru: Dict = {
  'nav.docs': 'Документация',
  'nav.home': 'Главная',
  'nav.console': 'Консоль',
  'nav.pricing': 'Модели',
  'nav.rankings': 'Рейтинг',
  'nav.about': 'О нас',
  'nav.signin': 'Войти',
  'nav.signout': 'Выйти',
  'nav.signoutConfirm': 'Подтвердить выход?',
  'nav.profile': 'Профиль',
  'nav.wallet': 'Кошелёк',
  'nav.settings': 'Настройки',
  'nav.theme': 'Тема',
  'nav.theme.light': 'Светлая',
  'nav.theme.dark': 'Тёмная',
  'nav.theme.system': 'Системная',
  'nav.notice': 'Уведомления',
  'nav.noticeEmpty': 'Нет уведомлений',
  'nav.menu': 'Меню документации',
  'nav.lang': 'Язык',
  'nav.search': 'Поиск',
  'nav.search.placeholder': 'Страницы, протоколы, модели…',
  'nav.search.empty': 'Ничего не найдено',
  'nav.search.hint': '⌘K / Ctrl+K',
  'nav.search.recent': 'Недавние',
  'nav.search.popular': 'Популярные',
  'sidebar.catalog': 'Разделы',
  'toc.title': 'На этой странице',
  'toc.quick': 'Быстрые ссылки',
  'toc.quickstart': 'Быстрый старт',
  'toc.models': 'Каталог моделей',
  'toc.protocol': 'Протоколы',
  'toc.verify': 'Проверка curl',
  'toc.errors': 'Ошибки',
  'pager.prev': 'Назад',
  'pager.next': 'Далее',
  'crumb.docs': 'Документация',
  'footer.terms': 'Условия',
  'footer.privacy': 'Конфиденциальность',
  'footer.signin': 'Войти',
  'footer.signup': 'Регистрация',
  'footer.support': 'Поддержка',
  'footer.region': 'Недоступно в материковом Китае',
  'footer.docs': 'Docs',
  'footer.tagline': 'Документация шлюза AI API',
  'common.copy': 'Копировать',
  'common.copied': 'Скопировано',
  'common.refresh': 'Обновить',
  'common.search': 'Поиск',
  'common.loading': 'Загрузка…',
  'common.retry': 'Повторить',
  'common.updatedAt': 'Обновлено',
  'common.on': 'Вкл',
  'common.off': 'Выкл',
  'notfound.title': 'Страница не найдена',
  'notfound.body': 'По этому адресу нет страницы документации — ссылка устарела или содержит опечатку.',
  'notfound.home': 'На главную документации',
  'error.content.title': 'Не удалось загрузить содержимое',
  'error.content.body': 'Текст страницы не догрузился: обычно это обрыв соединения или только что выпущенное обновление сайта. Перезагрузите страницу.',
  'nav.role.super': 'Суперадмин',
  'nav.role.admin': 'Админ',
  'nav.role.user': 'Пользователь',
  'shot.zoom': 'Нажмите, чтобы увеличить',
  'shot.hint': 'Нажмите на изображение',
  'shot.broken': 'Скриншот появится позже — см. интерфейс консоли',
  'shot.zoomOut': 'Уменьшить',
  'shot.zoomInBtn': 'Увеличить',
  'shot.original': 'Открыть оригинал',
  'shot.reset': 'Сбросить масштаб',
  'shot.lightboxHint': 'Esc закрыть · +/− масштаб · 0 сброс · двойной клик',
  'live.sync': 'Синхронизация данных…',
  'live.loadFail': 'Ошибка загрузки',
  'live.apps.empty': 'Консоль не вернула список приложений; см. раздел «Приложения» на сайте.',
  'live.footerRaw': 'HTML подвала (как в API)',
  'proto.hostLive': 'Хосты из live status.api_info; для смены маршрута замените хост.',
  'proto.hostFallback':
    'Показаны встроенные маршруты (live API недоступен); для смены маршрута замените хост.',
  'live.notice.title': 'Уведомления',
  'live.notice.lead': 'Данные с публичного API в реальном времени.',
  'live.notice.system': 'Системное уведомление',
  'live.notice.list': 'Объявления',
  'live.notice.empty': 'Нет содержимого',
  'live.notice.disabled': 'Объявления отключены',
  'live.faq.title': 'FAQ',
  'live.faq.lead': 'Из конфигурации консоли (/api/status).',
  'live.faq.empty': 'Нет FAQ',
  'live.faq.disabled': 'FAQ отключён',
  'live.faq.search': 'Поиск вопросов…',
  'client.install': 'Загрузка и установка',
  'client.steps': 'Шаги настройки',
  'client.models': 'Выбор модели',
  'client.pitfalls': 'Частые ошибки',
  'client.screenshot': 'Интерфейс настройки',
  'client.related': 'См. также',
  'assistant.open': 'Открыть помощника',
  'assistant.close': 'Закрыть помощника',
  'assistant.title': 'Помощник по документации',
  'assistant.subtitle': 'Ответы на основе документации DaoXE',
  'assistant.welcome':
    'Привет! Помогу с Base URL, ключами API, моделями и типичными ошибками. Попробуйте:',
  'assistant.page': 'Текущая страница: {page}',
  'assistant.placeholder': 'Вопрос по документации…',
  'assistant.send': 'Отправить',
  'assistant.stop': 'Остановить',
  'assistant.clear': 'Очистить чат',
  'assistant.thinking': 'Ищу в документации…',
  'assistant.sources': 'Источники',
  'assistant.disclaimer':
    'Ответы основаны на поиске по сайту и могут быть неполными. Тарифы и условия — в консоли и официальных документах.',
  'assistant.error': 'Ошибка запроса: {msg}',
  'assistant.empty': '(Пустой ответ модели — переформулируйте или повторите позже)',
  'assistant.stopped': '(Остановлено)',
  'assistant.suggest.quickstart': 'Как быстро начать?',
  'assistant.suggest.baseurl': 'Какой Base URL указать?',
  'assistant.suggest.keys': 'Как создать API-ключ?',
  'assistant.suggest.errors': 'Как разбирать 401 / model_not_found?',
  'seo.siteDescription':
    'Документация {brand} — шлюз AI API, совместимый с OpenAI / Anthropic / Gemini. Быстрый старт, подключение клиентов, справочник API, тарифы и частые вопросы.',
  'seo.pageDescription':
    '{title} — {brand} {group}. Документация шлюза AI API, совместимого с OpenAI / Anthropic / Gemini.',
  'lang.suggest.text': 'Эта страница доступна на русском.',
  'lang.suggest.action': 'Открыть на русском',
  'lang.suggest.dismiss': 'Не нужно',
}

const vi: Dict = {
  'nav.docs': 'Tài liệu',
  'nav.home': 'Trang chủ',
  'nav.console': 'Bảng điều khiển',
  'nav.pricing': 'Mô hình',
  'nav.rankings': 'Xếp hạng',
  'nav.about': 'Giới thiệu',
  'nav.signin': 'Đăng nhập',
  'nav.signout': 'Đăng xuất',
  'nav.signoutConfirm': 'Xác nhận đăng xuất?',
  'nav.profile': 'Hồ sơ',
  'nav.wallet': 'Ví',
  'nav.settings': 'Cài đặt',
  'nav.theme': 'Giao diện',
  'nav.theme.light': 'Sáng',
  'nav.theme.dark': 'Tối',
  'nav.theme.system': 'Hệ thống',
  'nav.notice': 'Thông báo',
  'nav.noticeEmpty': 'Không có thông báo',
  'nav.menu': 'Mở mục lục',
  'nav.lang': 'Ngôn ngữ',
  'nav.search': 'Tìm kiếm',
  'nav.search.placeholder': 'Trang, giao thức, mô hình…',
  'nav.search.empty': 'Không có kết quả',
  'nav.search.hint': '⌘K / Ctrl+K',
  'nav.search.recent': 'Đã xem gần đây',
  'nav.search.popular': 'Trang phổ biến',
  'sidebar.catalog': 'Mục lục',
  'toc.title': 'Trên trang này',
  'toc.quick': 'Lối tắt',
  'toc.quickstart': 'Bắt đầu nhanh',
  'toc.models': 'Bảng mô hình',
  'toc.protocol': 'Hai giao thức',
  'toc.verify': 'Kiểm tra curl',
  'toc.errors': 'Lỗi thường gặp',
  'pager.prev': 'Trước',
  'pager.next': 'Sau',
  'crumb.docs': 'Tài liệu',
  'footer.terms': 'Điều khoản',
  'footer.privacy': 'Quyền riêng tư',
  'footer.signin': 'Đăng nhập',
  'footer.signup': 'Đăng ký',
  'footer.support': 'Hỗ trợ',
  'footer.region': 'Không cung cấp tại Trung Quốc đại lục',
  'footer.docs': 'Docs',
  'footer.tagline': 'Tài liệu cổng AI API',
  'common.copy': 'Sao chép',
  'common.copied': 'Đã sao chép',
  'common.refresh': 'Làm mới',
  'common.search': 'Tìm kiếm',
  'common.loading': 'Đang tải…',
  'common.retry': 'Thử lại',
  'common.updatedAt': 'Cập nhật',
  'common.on': 'Bật',
  'common.off': 'Tắt',
  'notfound.title': 'Không tìm thấy trang',
  'notfound.body': 'Không có trang tài liệu nào khớp với địa chỉ này — liên kết có thể đã cũ hoặc bị gõ sai.',
  'notfound.home': 'Về trang chủ tài liệu',
  'error.content.title': 'Không tải được nội dung',
  'error.content.body': 'Nội dung trang chưa tải xong, thường là do mất kết nối hoặc site vừa phát hành bản mới. Tải lại trang là được.',
  'nav.role.super': 'Quản trị cấp cao',
  'nav.role.admin': 'Quản trị viên',
  'nav.role.user': 'Người dùng',
  'shot.zoom': 'Bấm để phóng to',
  'shot.hint': 'Bấm ảnh để phóng to',
  'shot.broken': 'Ảnh chụp sẽ bổ sung sau — xem giao diện console thực tế',
  'shot.zoomOut': 'Thu nhỏ',
  'shot.zoomInBtn': 'Phóng to',
  'shot.original': 'Mở ảnh gốc',
  'shot.reset': 'Đặt lại thu phóng',
  'shot.lightboxHint': 'Esc đóng · +/− thu phóng · 0 đặt lại · nhấp đúp chuyển',
  'live.sync': 'Đang đồng bộ dữ liệu…',
  'live.loadFail': 'Tải thất bại',
  'live.apps.empty': 'Console không trả về danh sách ứng dụng; xem mục “Ứng dụng” trên trang.',
  'live.footerRaw': 'HTML chân trang (nguyên văn từ API)',
  'proto.hostLive': 'Host lấy từ status.api_info thời gian thực; đổi tuyến bằng cách thay host.',
  'proto.hostFallback':
    'Đang hiển thị tuyến mặc định tích hợp (API thời gian thực không khả dụng); đổi tuyến bằng cách thay host.',
  'live.notice.title': 'Thông báo',
  'live.notice.lead': 'Dữ liệu realtime từ API công khai.',
  'live.notice.system': 'Thông báo hệ thống',
  'live.notice.list': 'Danh sách thông báo',
  'live.notice.empty': 'Chưa có nội dung',
  'live.notice.disabled': 'Thông báo đang tắt',
  'live.faq.title': 'FAQ',
  'live.faq.lead': 'Từ cấu hình console (/api/status).',
  'live.faq.empty': 'Chưa có FAQ',
  'live.faq.disabled': 'FAQ đang tắt',
  'live.faq.search': 'Tìm câu hỏi…',
  'client.install': 'Tải và cài đặt',
  'client.steps': 'Các bước cấu hình',
  'client.models': 'Chọn mô hình',
  'client.pitfalls': 'Lỗi thường gặp',
  'client.screenshot': 'Giao diện tham khảo',
  'client.related': 'Liên quan',
  'assistant.open': 'Mở trợ lý tài liệu',
  'assistant.close': 'Đóng trợ lý tài liệu',
  'assistant.title': 'Trợ lý tài liệu',
  'assistant.subtitle': 'Trả lời dựa trên tài liệu DaoXE',
  'assistant.welcome':
    'Xin chào! Tôi hỗ trợ Base URL, API key, cấu hình model và lỗi thường gặp. Thử gợi ý:',
  'assistant.page': 'Trang hiện tại: {page}',
  'assistant.placeholder': 'Hỏi về tài liệu…',
  'assistant.send': 'Gửi',
  'assistant.stop': 'Dừng tạo',
  'assistant.clear': 'Xóa hội thoại',
  'assistant.thinking': 'Đang tìm trong tài liệu…',
  'assistant.sources': 'Nguồn',
  'assistant.disclaimer':
    'Câu trả lời dựa trên tìm kiếm tài liệu nội bộ, chỉ mang tính tham khảo; thanh toán/điều khoản lấy theo console và văn bản chính thức.',
  'assistant.error': 'Yêu cầu thất bại: {msg}',
  'assistant.empty': '(Model không trả nội dung — hãy diễn đạt lại hoặc thử sau)',
  'assistant.stopped': '(Đã dừng)',
  'assistant.suggest.quickstart': 'Bắt đầu nhanh thế nào?',
  'assistant.suggest.baseurl': 'Điền Base URL ra sao?',
  'assistant.suggest.keys': 'Tạo API key thế nào?',
  'assistant.suggest.errors': 'Gỡ lỗi 401 / model_not_found?',
  'seo.siteDescription':
    'Tài liệu {brand} — cổng AI API tương thích OpenAI / Anthropic / Gemini. Bắt đầu nhanh, kết nối client, tham chiếu API, cách tính phí và câu hỏi thường gặp.',
  'seo.pageDescription':
    '{title} — {brand} {group}. Tài liệu cổng AI API tương thích OpenAI / Anthropic / Gemini.',
  'lang.suggest.text': 'Trang này cũng có bản tiếng Việt.',
  'lang.suggest.action': 'Chuyển sang tiếng Việt',
  'lang.suggest.dismiss': 'Không cần',
}

const dicts: Record<Lang, Dict> = { zh, en, ru, vi }

/** exported for the i18n parity check script */
export const I18N_DICTS: Record<Lang, Record<string, string>> = dicts

/**
 * Pick a value for the active language. Used by components that carry inline
 * multilingual JSX/strings (live data pages, shared doc snippets) rather than
 * flat dictionary keys. Falls back to en, then zh, so a missing ru/vi entry
 * degrades to English instead of throwing.
 */
export function pickLang<T>(lang: Lang, m: { zh: T; en: T; ru?: T; vi?: T }): T {
  const v = m[lang]
  return (v === undefined ? m.en : v) as T
}

type I18nCtx = {
  lang: Lang
  t: (key: string) => string
}

const Ctx = createContext<I18nCtx | null>(null)
const LANG_KEY = 'dx_docs_lang'

function isLang(v: unknown): v is Lang {
  return v === 'zh' || v === 'en' || v === 'ru' || v === 'vi'
}

/** Look a key up in an explicit language — for copy aimed at speakers of *another* language. */
export function translate(lang: Lang, key: string) {
  return dicts[lang][key] ?? dicts.zh[key] ?? key
}

/**
 * The language the visitor would probably rather read, from their last explicit
 * choice and then from `Accept-Language` (as exposed by `navigator`). It never
 * decides what a page renders — the URL does that — so it cannot desync
 * hydration; it only powers the "also available in …" hint. Returns null
 * outside the browser or when nothing usable is stored.
 */
export function preferredLang(): Lang | null {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (isLang(stored)) return stored
  } catch {
    /* ignore */
  }
  try {
    const tags = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const raw of tags) {
      const tag = (raw || '').toLowerCase()
      if (tag.startsWith('zh')) return 'zh'
      if (tag.startsWith('ru')) return 'ru'
      if (tag.startsWith('vi')) return 'vi'
      if (tag.startsWith('en')) return 'en'
    }
  } catch {
    /* ignore */
  }
  return null
}

/** Persist an explicit language choice before navigating to that language's URL. */
export function rememberLang(lang: Lang) {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* ignore */
  }
}

export function htmlLang(l: Lang) {
  return LANG_META[l].html
}

/**
 * The active language is a property of the URL (see `splitLangPath`), which is
 * why it arrives as a prop instead of being read from storage during render:
 * a stored preference would make the first client render disagree with the
 * prerendered HTML. Switching languages is a navigation, not a state update.
 */
export function I18nProvider({ children, lang }: { children?: ReactNode; lang: Lang }) {
  useEffect(() => {
    document.documentElement.lang = htmlLang(lang)
  }, [lang])

  const t = useCallback((key: string) => translate(lang, key), [lang])

  const value = useMemo(() => ({ lang, t }), [lang, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n outside provider')
  return ctx
}
