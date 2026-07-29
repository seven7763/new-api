/*
  文档页导航功能 — 1:1 移植自 aicli-homepage/v3（app.js 主题段 + v3.js 公告/站名/头像段）。
  与主站/SPA 同源共享:cookie "vite-ui-theme"、localStorage "user"/"status"/"v3-notice-seen"、/api/*。
  语言切换按站长决定不在文档页提供(教程正文单语)。
*/
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 主题(theme-provider.tsx + theme-switch.tsx 移植;默认 system)── */
  var THEME_KEY = 'vite-ui-theme';
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function readThemeCookie() {
    var m = document.cookie.match(/(?:^|;\s*)vite-ui-theme=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function storedTheme() {
    var t = null;
    try { t = readThemeCookie(); } catch (e) { /* cookie unavailable */ }
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
      document.cookie = THEME_KEY + '=' + encodeURIComponent(theme) + '; path=/; max-age=' + 60 * 60 * 24 * 365;
    } catch (e) { /* ignore */ }
    applyTheme(theme);
  }
  systemDark.addEventListener('change', function () {
    if (storedTheme() === 'system') applyTheme('system');
  });
  applyTheme(storedTheme());

  var themeToggle = document.getElementById('theme-toggle');
  var themeMenu = document.getElementById('theme-menu');
  function closeThemeMenu() {
    if (!themeMenu || themeMenu.hidden) return;
    themeMenu.hidden = true;
    themeToggle.setAttribute('aria-expanded', 'false');
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
      closeThemeMenu();
    });
    document.addEventListener('click', closeThemeMenu);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeThemeMenu();
    });
  }
  var themeToggleM = document.getElementById('theme-toggle-m');
  if (themeToggleM) {
    themeToggleM.addEventListener('click', function () {
      setTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
    });
  }

  /* ── 站内公告(GET /api/notice;已读 hash 与首页共用 "v3-notice-seen")── */
  (function () {
    var toggle = document.getElementById('notice-toggle');
    var dot = document.getElementById('notice-dot');
    var modal = document.getElementById('notice-modal');
    var body = document.getElementById('notice-body');
    if (!toggle || !modal || !body) return;

    var SEEN_KEY = 'v3-notice-seen';
    var noticeHtml = '';
    var noticeHash = '';

    function hashOf(s) { // djb2
      var h = 5381;
      for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
      return String(h);
    }
    function seenHash() {
      try { return localStorage.getItem(SEEN_KEY); } catch (e) { return null; }
    }
    function markSeen() {
      try { localStorage.setItem(SEEN_KEY, noticeHash); } catch (e) { /* ignore */ }
      dot.hidden = true;
    }

    fetch('/api/notice', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        var data = json && json.data;
        if (typeof data !== 'string' || !data.trim()) return;
        noticeHtml = data;
        noticeHash = hashOf(data);
        if (seenHash() !== noticeHash) dot.hidden = false;
      })
      .catch(function () { /* 本地预览无后端,静默 */ });

    function open() {
      body.innerHTML = noticeHtml || '<p class="notice-empty">暂无公告</p>';
      modal.hidden = false;
      requestAnimationFrame(function () { modal.classList.add('open'); });
      if (noticeHash) markSeen();
      document.addEventListener('keydown', onKey);
    }
    function close() {
      modal.classList.remove('open');
      document.removeEventListener('keydown', onKey);
      var done = function () { modal.hidden = true; };
      reduced ? done() : setTimeout(done, 220); // 与 CSS 过渡时长一致
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    toggle.addEventListener('click', function () { modal.hidden ? open() : close(); });
    document.getElementById('notice-close').addEventListener('click', close);
    document.getElementById('notice-backdrop').addEventListener('click', close);
  })();

  /* ── 站点配置同步(GET /api/status):导航站名遵循后台设置;
        首帧读 SPA 缓存 localStorage["status"],成功后回写(同 useStatus)── */
  (function () {
    var brandNames = document.querySelectorAll('.brand-name');
    var brandLogos = document.querySelectorAll('.brand-logo img');

    function apply(data) {
      if (!data || typeof data !== 'object') return;
      if (typeof data.system_name === 'string' && data.system_name.trim()) {
        var name = data.system_name.trim();
        brandNames.forEach(function (el) { el.textContent = name; });
        brandLogos.forEach(function (el) { el.alt = name; });
      }
    }

    try { apply(JSON.parse(localStorage.getItem('status'))); } catch (e) { /* ignore */ }

    fetch('/api/status', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (json) {
        var data = json && json.success !== false && json.data;
        if (!data || typeof data !== 'object') return;
        apply(data);
        try { localStorage.setItem('status', JSON.stringify(data)); } catch (e) { /* ignore */ }
      })
      .catch(function () { /* 静默 */ });
  })();

  /* ── 登录态头像与账户菜单(同源共享 localStorage["user"];
        配色复刻 lib/avatar.ts,菜单复刻 profile-dropdown.tsx)── */
  (function () {
    var signin = document.querySelector('.header-desktop .btn-signin');
    var signinM = document.querySelector('.header-mobile .btn-signin');
    if (!signin && !signinM) return;

    function readUser() {
      try {
        var u = JSON.parse(localStorage.getItem('user'));
        return u && typeof u === 'object' ? u : null;
      } catch (e) { return null; }
    }

    /* lib/avatar.ts 同款确定性配色:同一用户在文档页/首页/SPA 内颜色一致 */
    function discStyle(name) {
      var h = 0;
      for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
      return 'background-color:hsl(' + (h % 360) + ' ' + (54 + (h % 8)) + '% ' + (52 + ((h >> 4) % 8)) + '%)';
    }

    var SVG = function (inner) {
      return '<svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
    };
    var ICON = {
      user: SVG('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
      wallet: SVG('<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>'),
      settings: SVG('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
      logout: SVG('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>')
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
      '<a role="menuitem" data-avatar-item="profile" href="/profile">' + ICON.user + '个人资料</a>' +
      '<a role="menuitem" data-avatar-item="wallet" href="/wallet">' + ICON.wallet + '钱包</a>' +
      '<a role="menuitem" data-avatar-item="settings" href="/system-settings/site/system-info" hidden>' + ICON.settings + '系统设置</a>' +
      '<div class="avatar-sep" role="separator"></div>' +
      '<button type="button" role="menuitem" data-avatar-item="signout" class="avatar-signout">' + ICON.logout +
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
      /* 复刻 sign-out-dialog.tsx:GET /api/user/logout → 清 user/uid → 刷新 */
      fetch('/api/user/logout', { headers: { Accept: 'application/json' } })
        .catch(function () {})
        .finally(function () {
          try {
            localStorage.removeItem('user');
            localStorage.removeItem('uid');
          } catch (e) { /* ignore */ }
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
        armTimer: 0
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
          it.armTimer = setTimeout(function () { resetConfirm(it); }, 3000);
        } else {
          clearTimeout(it.armTimer);
          signOut();
        }
      });
      instances.push(it);
      return it;
    }

    if (signin) {
      buildAccount(function (root) { signin.insertAdjacentElement('afterend', root); });
    }
    if (signinM) {
      buildAccount(function (root) { signinM.insertAdjacentElement('afterend', root); });
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
      var logged = !!user; // 与 SPA isAuthenticated 判定一致
      if (signin) signin.hidden = logged;
      if (signinM) signinM.hidden = logged;
      instances.forEach(function (it) {
        it.root.hidden = !logged;
        if (!logged) { closeMenu(it); return; }
        var displayName = user.display_name || user.username || '';
        var avatarName = user.username || displayName; // profile-dropdown.tsx 取名顺序
        var letter = avatarName.trim().charAt(0).toUpperCase() || '?';
        var style = discStyle(avatarName);
        it.discs.forEach(function (d) {
          d.textContent = letter;
          d.setAttribute('style', style);
        });
        it.name.textContent = displayName;
        it.btn.setAttribute('aria-label', displayName);
        it.btn.title = displayName;
        var role = { 0: 1, 1: 1, 10: 1, 100: 1 }[user.role] ? user.role : 0; // 未知角色按访客
        it.roles.forEach(function (s) { s.hidden = String(role) !== s.getAttribute('data-role'); });
        it.group.hidden = !user.group;
        it.group.textContent = user.group ? '· ' + user.group : '';
        it.settings.hidden = user.role !== 100; // 仅超管
      });
    }

    window.addEventListener('pageshow', function (e) { if (e.persisted) render(); }); // bfcache 返回
    window.addEventListener('storage', function (e) { if (!e.key || e.key === 'user') render(); }); // 其他标签页登录/登出
    render();
  })();
})();
