/*!
  DaoXE Docs PublicHeader — 对齐 new-api default public-header.tsx
  共享: cookie vite-ui-theme · localStorage user/status · GET {apiBase}/api/status|notice
*/
(function () {
  'use strict';

  var CFG = window.DX_DOCS || {};
  var API = (CFG.apiBase || '').replace(/\/$/, '');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var THEME_KEY = 'vite-ui-theme';
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function apiUrl(path) {
    return API + path;
  }

  function rootPath() {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || '';
      if (src.indexOf('js/shell.js') !== -1) {
        return src.replace(/js\/shell\.js.*$/, '');
      }
    }
    var root = document.documentElement.getAttribute('data-root');
    return root != null ? root : '';
  }
  var ROOT = rootPath();
  function href(p) {
    if (!p) return ROOT;
    if (/^https?:/i.test(p)) return p;
    return ROOT + String(p).replace(/^\//, '');
  }
  function absSite(path) {
    var base = (CFG.siteUrl || CFG.homeUrl || 'https://daoxe.com').replace(/\/$/, '');
    if (!path) return base + '/';
    if (/^https?:/i.test(path)) return path;
    return base + (path.charAt(0) === '/' ? path : '/' + path);
  }

  /* ── Theme ── */
  function readThemeCookie() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)vite-ui-theme=([^;]*)/);
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) {
      return null;
    }
  }
  function storedTheme() {
    var t = readThemeCookie();
    return t === 'light' || t === 'dark' ? t : 'system';
  }
  function applyTheme(theme) {
    var dark = theme === 'dark' || (theme === 'system' && systemDark.matches);
    var root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
    var meta = document.querySelector("meta[name='theme-color']");
    if (meta) meta.setAttribute('content', dark ? '#020817' : '#fff');
    document.querySelectorAll('[data-theme-option]').forEach(function (btn) {
      if (btn.dataset.themeOption === theme) btn.setAttribute('data-active', '');
      else btn.removeAttribute('data-active');
    });
  }
  function setTheme(theme) {
    try {
      document.cookie =
        THEME_KEY + '=' + encodeURIComponent(theme) + '; path=/; max-age=' + 60 * 60 * 24 * 365;
    } catch (e) {}
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    applyTheme(theme);
  }
  systemDark.addEventListener('change', function () {
    if (storedTheme() === 'system') applyTheme('system');
  });
  applyTheme(storedTheme());

  /* ── HeaderNavModules (defaults match web/default nav-modules.ts) ── */
  function parseBool(raw, fallback) {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'number') {
      if (raw === 1) return true;
      if (raw === 0) return false;
      return fallback;
    }
    if (typeof raw === 'string') {
      var n = raw.trim().toLowerCase();
      if (n === 'true' || n === '1') return true;
      if (n === 'false' || n === '0') return false;
    }
    return fallback;
  }
  function parseAccess(raw, fallback) {
    if (raw == null) return { enabled: fallback.enabled, requireAuth: fallback.requireAuth };
    if (typeof raw === 'boolean' || typeof raw === 'number' || typeof raw === 'string') {
      return { enabled: parseBool(raw, fallback.enabled), requireAuth: fallback.requireAuth };
    }
    if (typeof raw === 'object') {
      return {
        enabled: parseBool(raw.enabled, fallback.enabled),
        requireAuth: parseBool(raw.requireAuth, fallback.requireAuth),
      };
    }
    return { enabled: fallback.enabled, requireAuth: fallback.requireAuth };
  }
  function parseHeaderNavModules(raw) {
    var result = {
      home: true,
      console: true,
      pricing: { enabled: true, requireAuth: false },
      rankings: { enabled: true, requireAuth: false },
      docs: true,
      about: true,
    };
    if (raw == null || raw === '') return result;
    var parsed = raw;
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        return result;
      }
    }
    if (!parsed || typeof parsed !== 'object') return result;
    if ('home' in parsed) result.home = parseBool(parsed.home, true);
    if ('console' in parsed) result.console = parseBool(parsed.console, true);
    if ('docs' in parsed) result.docs = parseBool(parsed.docs, true);
    if ('about' in parsed) result.about = parseBool(parsed.about, true);
    if ('pricing' in parsed) result.pricing = parseAccess(parsed.pricing, result.pricing);
    if ('rankings' in parsed) result.rankings = parseAccess(parsed.rankings, result.rankings);
    return result;
  }

  function buildTopLinks(status) {
    var modules = parseHeaderNavModules(status && status.HeaderNavModules);
    var docsLink = (status && status.docs_link) || '';
    var links = [];
    if (modules.home !== false) links.push({ title: '主页', href: absSite('/'), external: true });
    if (modules.console !== false)
      links.push({ title: '控制台', href: absSite('/dashboard'), external: true });
    if (modules.pricing && modules.pricing.enabled)
      links.push({ title: '模型广场', href: absSite('/pricing'), external: true });
    if (modules.rankings && modules.rankings.enabled)
      links.push({ title: '排行榜', href: absSite('/rankings'), external: true });
    if (modules.docs !== false) {
      // 文档站自身：当前激活
      links.push({
        title: '文档',
        href: href('index.html'),
        external: false,
        active: true,
      });
    }
    if (modules.about !== false)
      links.push({ title: '关于', href: absSite('/about'), external: true });
    return links;
  }

  function renderTopNavLinks(links) {
    var host = document.getElementById('header-nav-links');
    if (!host) return;
    host.innerHTML = links
      .map(function (l) {
        var cls = 'nav-link' + (l.active ? ' active' : '');
        if (l.external) {
          return (
            '<a class="' +
            cls +
            '" href="' +
            l.href +
            '" target="_blank" rel="noopener noreferrer">' +
            l.title +
            '</a>'
          );
        }
        return '<a class="' + cls + '" href="' + l.href + '">' + l.title + '</a>';
      })
      .join('');
  }

  /* ── Scroll shrink (public-header scrolled) ── */
  function bindScroll() {
    var header = document.getElementById('site-header');
    if (!header) return;
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Theme menu ── */
  function bindTheme() {
    var themeToggle = document.getElementById('theme-toggle');
    var themeMenu = document.getElementById('theme-menu');
    function closeTheme() {
      if (!themeMenu || themeMenu.hidden) return;
      themeMenu.hidden = true;
      if (themeToggle) themeToggle.setAttribute('aria-expanded', 'false');
    }
    if (themeToggle && themeMenu) {
      themeToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = themeMenu.hidden;
        themeMenu.hidden = !open;
        themeToggle.setAttribute('aria-expanded', String(open));
      });
      themeMenu.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-theme-option]');
        if (!btn) return;
        setTheme(btn.dataset.themeOption);
        closeTheme();
      });
    }
    var themeToggleM = document.getElementById('theme-toggle-m');
    if (themeToggleM) {
      themeToggleM.addEventListener('click', function () {
        var cur = storedTheme();
        // mobile: cycle light/dark (keep simple)
        setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
      });
    }
    document.addEventListener('click', function (e) {
      if (themeMenu && !themeMenu.hidden) {
        var sw = document.querySelector('.header-desktop .theme-switch');
        if (sw && !sw.contains(e.target)) closeTheme();
      }
    });
    applyTheme(storedTheme());
  }

  /* ── Notice ── */
  function bindNotice() {
    var toggle = document.getElementById('notice-toggle');
    var dot = document.getElementById('notice-dot');
    var modal = document.getElementById('notice-modal');
    var body = document.getElementById('notice-body');
    if (!toggle || !modal || !body) return;
    var SEEN_KEY = 'v3-notice-seen';
    var noticeHtml = '';
    var noticeHash = '';
    function hashOf(s) {
      var h = 5381;
      for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
      return String(h);
    }
    function seenHash() {
      try {
        return localStorage.getItem(SEEN_KEY);
      } catch (e) {
        return null;
      }
    }
    function markSeen() {
      try {
        localStorage.setItem(SEEN_KEY, noticeHash);
      } catch (e) {}
      if (dot) dot.hidden = true;
    }
    fetch(apiUrl('/api/notice'), { headers: { Accept: 'application/json' } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (json) {
        var data = json && json.data;
        if (typeof data !== 'string' || !data.trim()) return;
        noticeHtml = data;
        noticeHash = hashOf(data);
        if (dot && seenHash() !== noticeHash) dot.hidden = false;
      })
      .catch(function () {});

    function open() {
      body.innerHTML = noticeHtml || '<p class="notice-empty">暂无公告</p>';
      modal.hidden = false;
      requestAnimationFrame(function () {
        modal.classList.add('open');
      });
      if (noticeHash) markSeen();
      document.addEventListener('keydown', onKey);
    }
    function close() {
      modal.classList.remove('open');
      document.removeEventListener('keydown', onKey);
      var done = function () {
        modal.hidden = true;
      };
      reduced ? done() : setTimeout(done, 220);
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
    }
    toggle.addEventListener('click', function () {
      modal.hidden ? open() : close();
    });
    var closeBtn = document.getElementById('notice-close');
    var backdrop = document.getElementById('notice-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);
  }

  /* ── Status: brand + nav modules ── */
  function applyStatus(data) {
    if (!data || typeof data !== 'object') return;
    if (typeof data.system_name === 'string' && data.system_name.trim()) {
      var name = data.system_name.trim();
      document.querySelectorAll('.brand-name').forEach(function (el) {
        el.textContent = name;
      });
      document.querySelectorAll('.brand-logo img').forEach(function (el) {
        el.alt = name;
      });
      CFG.brand = name;
    }
    if (typeof data.logo === 'string' && data.logo.trim()) {
      document.querySelectorAll('.brand-logo img').forEach(function (el) {
        el.src = data.logo.trim();
      });
    }
    renderTopNavLinks(buildTopLinks(data));
  }

  function loadStatus() {
    try {
      applyStatus(JSON.parse(localStorage.getItem('status')));
    } catch (e) {}
    // fallback nav immediately
    renderTopNavLinks(buildTopLinks(null));
    fetch(apiUrl('/api/status'), { headers: { Accept: 'application/json' } })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (json) {
        var data = json && json.success !== false && json.data;
        if (!data || typeof data !== 'object') return;
        applyStatus(data);
        try {
          localStorage.setItem('status', JSON.stringify(data));
        } catch (e) {}
      })
      .catch(function () {});
  }

  /* ── Auth avatar ── */
  function bindAuth() {
    var signin = document.querySelector('.header-desktop .btn-signin');
    var signinM = document.querySelector('.header-mobile .btn-signin');
    if (!signin && !signinM) return;

    function readUser() {
      try {
        var u = JSON.parse(localStorage.getItem('user'));
        return u && typeof u === 'object' ? u : null;
      } catch (e) {
        return null;
      }
    }
    function discStyle(name) {
      var h = 0;
      for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
      return (
        'background-color:hsl(' +
        (h % 360) +
        ' ' +
        (54 + (h % 8)) +
        '% ' +
        (52 + ((h >> 4) % 8)) +
        '%)'
      );
    }
    var SVG = function (inner) {
      return (
        '<svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        inner +
        '</svg>'
      );
    };
    var ICON = {
      user: SVG(
        '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
      ),
      wallet: SVG(
        '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'
      ),
      settings: SVG(
        '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'
      ),
      logout: SVG(
        '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>'
      ),
    };
    var MENU_HTML =
      '<button class="icon-btn nav-avatar" type="button" aria-haspopup="menu" aria-expanded="false">' +
      '<span class="nav-avatar-disc" aria-hidden="true"></span>' +
      '</button>' +
      '<div class="theme-menu nav-avatar-menu" role="menu" hidden>' +
      '<div class="avatar-info">' +
      '<span class="nav-avatar-disc disc-lg" aria-hidden="true"></span>' +
      '<div class="avatar-meta">' +
      '<p class="avatar-name"></p>' +
      '<p class="avatar-role">' +
      '<span data-role="0" hidden>访客</span><span data-role="1" hidden>用户</span><span data-role="10" hidden>管理员</span><span data-role="100" hidden>超级管理员</span>' +
      '<span class="avatar-group" hidden></span>' +
      '</p></div></div>' +
      '<div class="avatar-sep" role="separator"></div>' +
      '<a role="menuitem" data-avatar-item="profile" href="' +
      absSite('/profile') +
      '">' +
      ICON.user +
      '个人资料</a>' +
      '<a role="menuitem" data-avatar-item="wallet" href="' +
      absSite('/wallet') +
      '">' +
      ICON.wallet +
      '钱包</a>' +
      '<a role="menuitem" data-avatar-item="settings" href="' +
      absSite('/system-settings/site/system-info') +
      '" hidden>' +
      ICON.settings +
      '系统设置</a>' +
      '<div class="avatar-sep" role="separator"></div>' +
      '<button type="button" role="menuitem" data-avatar-item="signout" class="avatar-signout">' +
      ICON.logout +
      '<span class="so-label">登出</span><span class="so-confirm" hidden>确认登出？</span>' +
      '</button></div>';

    var instances = [];
    function resetConfirm(it) {
      clearTimeout(it.armTimer);
      it.soLabel.hidden = false;
      it.soConfirm.hidden = true;
    }
    function closeMenu(it) {
      it.menu.hidden = true;
      it.btn.setAttribute('aria-expanded', 'false');
      resetConfirm(it);
    }
    function signOut() {
      fetch(apiUrl('/api/user/logout'), { headers: { Accept: 'application/json' }, credentials: 'include' })
        .catch(function () {})
        .finally(function () {
          try {
            localStorage.removeItem('user');
            localStorage.removeItem('uid');
          } catch (e) {}
          location.reload();
        });
    }
    function buildAccount(insert) {
      var root = document.createElement('div');
      root.className = 'nav-account';
      root.hidden = true;
      root.innerHTML = MENU_HTML;
      insert(root);
      var it = {
        root: root,
        btn: root.querySelector('.nav-avatar'),
        menu: root.querySelector('.nav-avatar-menu'),
        discs: root.querySelectorAll('.nav-avatar-disc'),
        name: root.querySelector('.avatar-name'),
        roles: root.querySelectorAll('.avatar-role [data-role]'),
        group: root.querySelector('.avatar-group'),
        settings: root.querySelector('[data-avatar-item="settings"]'),
        signout: root.querySelector('[data-avatar-item="signout"]'),
        soLabel: root.querySelector('.so-label'),
        soConfirm: root.querySelector('.so-confirm'),
        armTimer: 0,
      };
      it.btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (it.menu.hidden) {
          it.menu.hidden = false;
          it.btn.setAttribute('aria-expanded', 'true');
        } else closeMenu(it);
      });
      it.signout.addEventListener('click', function () {
        if (it.soConfirm.hidden) {
          it.soLabel.hidden = true;
          it.soConfirm.hidden = false;
          it.armTimer = setTimeout(function () {
            resetConfirm(it);
          }, 3000);
        } else {
          clearTimeout(it.armTimer);
          signOut();
        }
      });
      instances.push(it);
      return it;
    }
    if (signin) {
      buildAccount(function (root) {
        signin.insertAdjacentElement('afterend', root);
      });
    }
    if (signinM) {
      buildAccount(function (root) {
        signinM.insertAdjacentElement('afterend', root);
      });
    }
    document.addEventListener('click', function (e) {
      instances.forEach(function (it) {
        if (!it.menu.hidden && !it.root.contains(e.target)) closeMenu(it);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') instances.forEach(closeMenu);
    });
    function render() {
      var user = readUser();
      var logged = !!user;
      if (signin) signin.hidden = logged;
      if (signinM) signinM.hidden = logged;
      instances.forEach(function (it) {
        it.root.hidden = !logged;
        if (!logged) {
          closeMenu(it);
          return;
        }
        var displayName = user.display_name || user.username || '';
        var avatarName = user.username || displayName;
        var letter = avatarName.trim().charAt(0).toUpperCase() || '?';
        var style = discStyle(avatarName);
        it.discs.forEach(function (d) {
          d.textContent = letter;
          d.setAttribute('style', style);
        });
        it.name.textContent = displayName;
        it.btn.setAttribute('aria-label', displayName);
        it.btn.title = displayName;
        var role = { 0: 1, 1: 1, 10: 1, 100: 1 }[user.role] ? user.role : 0;
        it.roles.forEach(function (s) {
          s.hidden = String(role) !== s.getAttribute('data-role');
        });
        it.group.hidden = !user.group;
        it.group.textContent = user.group ? '· ' + user.group : '';
        it.settings.hidden = user.role !== 100;
      });
    }
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) render();
    });
    window.addEventListener('storage', function (e) {
      if (!e.key || e.key === 'user') render();
    });
    render();
  }

  /* ── Docs sidebar / pager (content shell) ── */
  function currentFile() {
    var page = document.body.getAttribute('data-page');
    if (page) return page;
    var path = location.pathname.replace(/\\/g, '/');
    var m = path.match(/\/docs-site\/(.*)$/);
    if (m) {
      var rel = m[1];
      if (!rel || rel.endsWith('/')) rel += 'index.html';
      return rel || 'index.html';
    }
    var last = path.split('/').pop() || 'index.html';
    return last.endsWith('.html') ? last : 'index.html';
  }
  function normalizePage(p) {
    p = (p || '').replace(/^\.\//, '').replace(/^\//, '');
    if (p === '' || p === './') return 'index.html';
    return p;
  }
  function flatNav() {
    var list = [];
    (CFG.nav || []).forEach(function (g) {
      g.items.forEach(function (it) {
        list.push({ group: g.title, href: it.href, title: it.title, id: it.id });
      });
    });
    return list;
  }
  var SIDEBAR_SCROLL_KEY = 'dx_docs_sidebar_scroll_v1';
  var SIDEBAR_OPEN_KEY = 'dx_docs_sidebar_open_v1';

  function loadSidebarOpenMap() {
    try {
      var raw = localStorage.getItem(SIDEBAR_OPEN_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return o && typeof o === 'object' ? o : null;
    } catch (e) {
      return null;
    }
  }
  function saveSidebarOpenMap(map) {
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(map));
    } catch (e) {}
  }
  function saveSidebarScroll(el) {
    if (!el) return;
    try {
      sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop || 0));
    } catch (e) {}
  }
  function restoreSidebarScroll(el) {
    if (!el) return;
    var y = 0;
    try {
      y = parseInt(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || '0', 10) || 0;
    } catch (e) {
      y = 0;
    }
    el.scrollTop = y;
  }
  function bindSidebarScrollPersist(el) {
    if (!el || el.__dxScrollBound) return;
    el.__dxScrollBound = true;
    var timer = null;
    el.addEventListener(
      'scroll',
      function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          saveSidebarScroll(el);
        }, 80);
      },
      { passive: true }
    );
  }
  function bindSidebarNavClicks(el) {
    if (!el || el.__dxNavClickBound) return;
    el.__dxNavClickBound = true;
    el.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || !el.contains(a)) return;
      // remember scroll before full-page navigation
      saveSidebarScroll(el);
    });
  }

  function renderSidebar() {
    var el = document.getElementById('sidebar');
    if (!el) return;
    var cur = normalizePage(currentFile());
    var openMap = loadSidebarOpenMap();
    var html = '';

    (CFG.nav || []).forEach(function (g, gi) {
      var hasActive = false;
      g.items.forEach(function (it) {
        if (normalizePage(it.href) === cur) hasActive = true;
      });
      // Default: only expand the group that contains the current page.
      // User toggles are remembered in localStorage.
      var isOpen;
      if (openMap && Object.prototype.hasOwnProperty.call(openMap, g.id)) {
        isOpen = !!openMap[g.id];
        // always keep active group visible even if user collapsed it earlier
        if (hasActive) isOpen = true;
      } else {
        isOpen = hasActive || gi === 0;
      }

      html +=
        '<div class="sidebar-group' +
        (isOpen ? ' is-open' : ' is-collapsed') +
        '" data-group="' +
        g.id +
        '">';
      html +=
        '<button type="button" class="sidebar-group-title" aria-expanded="' +
        (isOpen ? 'true' : 'false') +
        '" data-group-toggle="' +
        g.id +
        '">' +
        '<span class="sidebar-group-label">' +
        g.title +
        '</span>' +
        '<span class="sidebar-group-chevron" aria-hidden="true"></span>' +
        '</button>';
      html += '<div class="sidebar-group-items">';
      g.items.forEach(function (it) {
        var active = normalizePage(it.href) === cur;
        html +=
          '<a class="' +
          (active ? 'active' : '') +
          '" href="' +
          href(it.href) +
          '"' +
          (active ? ' aria-current="page"' : '') +
          ' data-nav-id="' +
          it.id +
          '">' +
          it.title +
          '</a>';
      });
      html += '</div></div>';
    });
    el.innerHTML = html;

    // group collapse/expand
    el.querySelectorAll('[data-group-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-group-toggle');
        var group = el.querySelector('.sidebar-group[data-group="' + id + '"]');
        if (!group) return;
        var willOpen = group.classList.contains('is-collapsed');
        group.classList.toggle('is-open', willOpen);
        group.classList.toggle('is-collapsed', !willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        var map = loadSidebarOpenMap() || {};
        map[id] = willOpen;
        // if this group has active page, force open in map too
        if (group.querySelector('a.active')) map[id] = true;
        saveSidebarOpenMap(map);
        saveSidebarScroll(el);
      });
    });

    bindSidebarScrollPersist(el);
    bindSidebarNavClicks(el);

    // restore scroll, then ensure active item is visible
    requestAnimationFrame(function () {
      restoreSidebarScroll(el);
      var active = el.querySelector('a.active');
      if (active) {
        var er = el.getBoundingClientRect();
        var ar = active.getBoundingClientRect();
        var pad = 48;
        if (ar.top < er.top + pad || ar.bottom > er.bottom - pad) {
          // only auto-adjust if off-screen; keep user's scroll when possible
          var saved = 0;
          try {
            saved = parseInt(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) || '0', 10) || 0;
          } catch (e) {}
          if (!saved) {
            active.scrollIntoView({ block: 'center', inline: 'nearest' });
            saveSidebarScroll(el);
          } else if (ar.top < er.top || ar.bottom > er.bottom) {
            // saved position lost the active item (e.g. groups re-expanded) — nudge
            active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            saveSidebarScroll(el);
          }
        }
      }
    });
  }
  function renderPager() {
    var host = document.getElementById('pager');
    if (!host) return;
    var list = flatNav();
    var cur = normalizePage(currentFile());
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (normalizePage(list[i].href) === cur) {
        idx = i;
        break;
      }
    }
    if (idx < 0) {
      host.innerHTML = '';
      return;
    }
    var prev = list[idx - 1];
    var next = list[idx + 1];
    var html = '<div class="pager">';
    if (prev) {
      html +=
        '<a href="' +
        href(prev.href) +
        '"><span>上一页 · ' +
        prev.group +
        '</span>' +
        prev.title +
        '</a>';
    } else html += '<span></span>';
    if (next) {
      html +=
        '<a class="next" href="' +
        href(next.href) +
        '"><span>下一页 · ' +
        next.group +
        '</span>' +
        next.title +
        '</a>';
    }
    html += '</div>';
    host.innerHTML = html;
  }
  function renderBreadcrumb() {
    var host = document.getElementById('breadcrumb');
    if (!host) return;
    var list = flatNav();
    var cur = normalizePage(currentFile());
    var item = null;
    for (var i = 0; i < list.length; i++) {
      if (normalizePage(list[i].href) === cur) {
        item = list[i];
        break;
      }
    }
    if (!item) {
      host.innerHTML = '<a href="' + href('index.html') + '">文档</a>';
      return;
    }
    host.innerHTML =
      '<a href="' +
      href('index.html') +
      '">文档</a><span class="sep">/</span><span>' +
      item.group +
      '</span><span class="sep">/</span><span>' +
      item.title +
      '</span>';
  }
  function renderFooter() {
    var el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML =
      '<div>' +
      '<a href="' +
      absSite('/user-agreement') +
      '" target="_blank" rel="noopener">用户协议</a>' +
      '<a href="' +
      absSite('/privacy-policy') +
      '" target="_blank" rel="noopener">隐私政策</a>' +
      '<a href="' +
      absSite('/sign-in') +
      '" target="_blank" rel="noopener">登录</a>' +
      '<a href="' +
      absSite('/sign-up') +
      '" target="_blank" rel="noopener">注册</a>' +
      '<a href="' +
      (CFG.support && CFG.support.telegram) +
      '" target="_blank" rel="noopener">客服 ' +
      (CFG.support && CFG.support.telegramLabel) +
      '</a>' +
      '<a href="mailto:' +
      (CFG.support && CFG.support.email) +
      '">邮箱</a>' +
      '</div>' +
      '<div class="warn">不向中国大陆提供服务 / Not available in mainland China</div>' +
      '<div style="margin-top:8px">© ' +
      new Date().getFullYear() +
      ' ' +
      (CFG.brand || 'DaoXE') +
      ' · Docs preview</div>';
  }
  function enhanceCodeBlocks() {
    document.querySelectorAll('.code-block').forEach(function (box) {
      if (box.querySelector('.copy-btn')) return;
      var bar = box.querySelector('.code-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'code-bar';
        bar.innerHTML = '<span class="lang">code</span>';
        box.insertBefore(bar, box.firstChild);
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = '复制';
      bar.appendChild(btn);
      btn.addEventListener('click', function () {
        var pre = box.querySelector('pre');
        var text = pre ? pre.textContent : '';
        navigator.clipboard.writeText(text).then(
          function () {
            btn.textContent = '已复制 ✓';
            btn.classList.add('copied');
            setTimeout(function () {
              btn.textContent = '复制';
              btn.classList.remove('copied');
            }, 1600);
          },
          function () {
            btn.textContent = '失败';
          }
        );
      });
    });
    document.querySelectorAll('.pill[data-copy]').forEach(function (pill) {
      pill.addEventListener('click', function () {
        var t = pill.getAttribute('data-copy') || pill.textContent;
        navigator.clipboard.writeText(t).then(function () {
          var old = pill.innerHTML;
          pill.innerHTML = '<span class="tag">已复制</span>';
          setTimeout(function () {
            pill.innerHTML = old;
          }, 1200);
        });
      });
    });
  }
  function renderBasePills() {
    document.querySelectorAll('[data-base-pills]').forEach(function (host) {
      var html = '<div class="pills">';
      (CFG.bases || []).forEach(function (b) {
        html +=
          '<button type="button" class="pill" data-copy="' +
          b.openai +
          '" title="点击复制"><span class="tag">' +
          b.name +
          '</span>' +
          b.openai +
          '</button>';
      });
      html += '</div>';
      host.innerHTML = html;
    });
  }
  function bindDocsMenu() {
    var btn = document.getElementById('docs-menu-toggle');
    var sidebar = document.getElementById('sidebar');
    var bd = document.getElementById('sidebar-backdrop');
    if (!btn || !sidebar) return;
    if (!bd) {
      bd = document.createElement('div');
      bd.id = 'sidebar-backdrop';
      bd.className = 'sidebar-backdrop';
      document.body.appendChild(bd);
    }
    function close() {
      sidebar.classList.remove('open');
      bd.classList.remove('show');
    }
    btn.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      bd.classList.toggle('show');
    });
    bd.addEventListener('click', close);
  }

  function mount() {
    // patch sign-in hrefs
    document.querySelectorAll('.btn-signin').forEach(function (a) {
      a.href = absSite('/sign-in');
    });
    document.querySelectorAll('.brand').forEach(function (a) {
      a.href = absSite('/');
    });
    if (CFG.logo) {
      document.querySelectorAll('.brand-logo img').forEach(function (img) {
        if (!img.getAttribute('src') || img.getAttribute('src').indexOf('logo') !== -1) {
          img.src = CFG.logo;
        }
      });
    }
    if (CFG.brand) {
      document.querySelectorAll('.brand-name').forEach(function (el) {
        el.textContent = CFG.brand;
      });
    }

    bindScroll();
    bindTheme();
    bindNotice();
    bindAuth();
    loadStatus();
    renderSidebar();
    renderBreadcrumb();
    renderPager();
    renderFooter();
    renderBasePills();
    enhanceCodeBlocks();
    bindDocsMenu();

    var h1 = document.querySelector('.article h1');
    if (h1) document.title = h1.textContent.trim() + ' · ' + (CFG.brand || 'DaoXE') + ' Docs';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
