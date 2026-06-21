(function () {
  'use strict';

  var LANG_KEY     = 'rc2_lang';
  var VERIFIED_KEY = 'rc2_verified';

  /* ── Translations ───────────────────────────────────── */
  var T = {
    en: {
      gateTitle:    'Account Verification',
      gateSubtitle: 'Only accounts older than 80 days can access.',
      placeholder:  'Your Roblox username',
      btnVerify:    'Verify Account',
      checking:     'Checking…',
      denied:       'Your account is less than 80 days old and cannot access.',
      notFound:     'User not found. Check the username and try again.',
      error:        'Error contacting Roblox. Try again.',
      approved:     'Access granted!',
      days:         'days old',
    },
    es: {
      gateTitle:    'Verificación de Cuenta',
      gateSubtitle: 'Solo cuentas con más de 80 días pueden acceder.',
      placeholder:  'Tu nombre de usuario de Roblox',
      btnVerify:    'Verificar Cuenta',
      checking:     'Verificando…',
      denied:       'Tu cuenta tiene menos de 80 días y no puede acceder.',
      notFound:     'Usuario no encontrado. Verifica el nombre e intenta de nuevo.',
      error:        'Error al contactar Roblox. Inténtalo de nuevo.',
      approved:     '¡Acceso concedido!',
      days:         'días de antigüedad',
    },
    pt: {
      gateTitle:    'Verificação de Conta',
      gateSubtitle: 'Somente contas com mais de 80 dias podem acessar.',
      placeholder:  'Seu nome de usuário do Roblox',
      btnVerify:    'Verificar Conta',
      checking:     'Verificando…',
      denied:       'Sua conta tem menos de 80 dias e não pode acessar.',
      notFound:     'Usuário não encontrado. Verifique o nome e tente novamente.',
      error:        'Erro ao contatar o Roblox. Tente novamente.',
      approved:     'Acesso liberado!',
      days:         'dias de conta',
    },
    ru: {
      gateTitle:    'Проверка аккаунта',
      gateSubtitle: 'Только аккаунты старше 80 дней могут войти.',
      placeholder:  'Ваш никнейм на Roblox',
      btnVerify:    'Проверить аккаунт',
      checking:     'Проверяем…',
      denied:       'Ваш аккаунт младше 80 дней и не может войти.',
      notFound:     'Пользователь не найден. Проверьте имя и попробуйте снова.',
      error:        'Ошибка связи с Roblox. Попробуйте ещё раз.',
      approved:     'Доступ разрешён!',
      days:         'дней',
    },
  };

  function getLang() {
    return localStorage.getItem(LANG_KEY) || 'en';
  }
  function t(key) {
    var lang = getLang();
    return (T[lang] || T.en)[key] || T.en[key] || key;
  }

  /* ── Sound ─────────────────────────────────────────── */
  var audio = null;
  function playClick() {
    try {
      if (!audio) { audio = new Audio('/click-sound.mp3'); audio.volume = 0.5; }
      audio.currentTime = 0;
      audio.play().catch(function () {});
    } catch (e) {}
  }

  /* ── Token enforcement ─────────────────────────────── */
  var tokenGeneratedInSession = false;

  var WARN_MSGS = {
    en: 'Generate a token first to access the game.',
    es: 'Genera un token primero para acceder al juego.',
    pt: 'Gere um token primeiro para acessar o jogo.',
    ru: 'Сначала создайте токен, чтобы войти в игру.',
  };

  function showWarning() {
    var lang = getLang();
    var msg = WARN_MSGS[lang] || WARN_MSGS.en;
    var existing = document.getElementById('rc-token-warning');
    if (existing) return;
    var warn = document.createElement('div');
    warn.id = 'rc-token-warning';
    warn.style.cssText = [
      'position:fixed','bottom:24px','left:50%','transform:translateX(-50%)',
      'background:#1c2028','border:1px solid #ef4444','color:#fca5a5',
      'font-size:13px','font-weight:600','padding:10px 20px',
      'border-radius:12px','z-index:999999','white-space:nowrap',
      'box-shadow:0 4px 20px rgba(0,0,0,.6)','font-family:Outfit,Inter,sans-serif',
    ].join(';');
    warn.textContent = msg;
    document.body.appendChild(warn);
    setTimeout(function () { warn.remove(); }, 2800);
  }

  /* ── Language overlay logic ─────────────────────────── */
  function dismissLangOverlay(lang) {
    localStorage.setItem(LANG_KEY, lang);
    var overlay = document.getElementById('rc-lang-overlay');
    if (overlay) {
      overlay.style.animation = 'rc-fadeout .2s ease forwards';
      setTimeout(function () { overlay.classList.add('rc-hidden'); }, 210);
    }
  }

  /* ══════════════════════════════════════════════════════
     VERIFICATION GATE
  ══════════════════════════════════════════════════════ */

  function isVerified() {
    return sessionStorage.getItem(VERIFIED_KEY) === '1';
  }

  function buildGate() {
    var gate = document.createElement('div');
    gate.id = 'rc-verify-gate';
    gate.style.cssText = [
      'position:fixed','inset:0','z-index:9999999',
      'display:flex','align-items:center','justify-content:center',
      'background:linear-gradient(180deg,#040913 0%,#060c1e 100%)',
      'font-family:Outfit,Inter,sans-serif',
    ].join(';');

    gate.innerHTML =
      '<div style="width:100%;max-width:400px;padding:0 24px;text-align:center;">' +

        /* Logo glow blob */
        '<div style="width:64px;height:64px;border-radius:20px;margin:0 auto 24px;' +
        'background:linear-gradient(135deg,#1d4ed8,#3b82f6);' +
        'box-shadow:0 0 48px rgba(59,130,246,0.55),0 0 0 1px rgba(59,130,246,0.3);' +
        'display:flex;align-items:center;justify-content:center;">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
          '</svg>' +
        '</div>' +

        /* Title */
        '<h2 id="rc-gate-title" style="margin:0 0 8px;font-size:1.5rem;font-weight:800;' +
        'letter-spacing:-0.03em;color:#fff;">' + t('gateTitle') + '</h2>' +
        '<p id="rc-gate-sub" style="margin:0 0 28px;font-size:.875rem;color:rgba(148,163,184,.8);line-height:1.5;">' +
          t('gateSubtitle') +
        '</p>' +

        /* Input */
        '<input id="rc-gate-input" type="text" spellcheck="false" autocomplete="off"' +
        ' placeholder="' + t('placeholder') + '"' +
        ' style="width:100%;box-sizing:border-box;padding:12px 16px;border-radius:12px;' +
        'background:rgba(37,99,235,0.08);border:1px solid rgba(59,130,246,0.25);' +
        'color:#fff;font-size:.95rem;font-family:Outfit,Inter,sans-serif;outline:none;' +
        'margin-bottom:12px;transition:border-color .2s;" />' +

        /* Button */
        '<button id="rc-gate-btn" style="width:100%;padding:13px;border:none;border-radius:12px;' +
        'background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;' +
        'font-size:.95rem;font-weight:700;font-family:Outfit,Inter,sans-serif;cursor:pointer;' +
        'box-shadow:0 4px 20px rgba(37,99,235,.4);transition:all .2s;">' +
          t('btnVerify') +
        '</button>' +

        /* Status message */
        '<p id="rc-gate-msg" style="margin:14px 0 0;font-size:.82rem;min-height:20px;' +
        'color:rgba(148,163,184,.7);"></p>' +

      '</div>';

    return gate;
  }

  function setMsg(text, color) {
    var el = document.getElementById('rc-gate-msg');
    if (el) { el.textContent = text; el.style.color = color || 'rgba(148,163,184,.7)'; }
  }

  function setLoading(loading) {
    var btn   = document.getElementById('rc-gate-btn');
    var input = document.getElementById('rc-gate-input');
    if (!btn || !input) return;
    btn.disabled   = loading;
    input.disabled = loading;
    btn.textContent = loading ? t('checking') : t('btnVerify');
    btn.style.opacity = loading ? '0.7' : '1';
  }

  function dismissGate() {
    sessionStorage.setItem(VERIFIED_KEY, '1');
    var gate = document.getElementById('rc-verify-gate');
    if (gate) {
      gate.style.transition = 'opacity .35s ease';
      gate.style.opacity = '0';
      setTimeout(function () { gate.remove(); }, 360);
    }
  }

  function doVerify() {
    var input = document.getElementById('rc-gate-input');
    if (!input) return;
    var username = (input.value || '').trim();
    if (!username) {
      setMsg(t('placeholder') + '…', '#f87171');
      return;
    }

    setLoading(true);
    setMsg('');

    fetch('/api/verify?username=' + encodeURIComponent(username))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setLoading(false);
        if (data.allowed) {
          setMsg('✅ ' + t('approved') + ' (' + data.ageInDays + ' ' + t('days') + ')', '#4ade80');
          setTimeout(dismissGate, 900);
        } else if (data.error === 'User not found') {
          setMsg('❌ ' + t('notFound'), '#f87171');
        } else if (data.ageInDays !== undefined) {
          setMsg('❌ ' + t('denied') + ' (' + data.ageInDays + ' ' + t('days') + ')', '#f87171');
        } else {
          setMsg('❌ ' + t('error'), '#f87171');
        }
      })
      .catch(function () {
        setLoading(false);
        setMsg('❌ ' + t('error'), '#f87171');
      });
  }

  function initGate() {
    if (isVerified()) return;

    var gate = buildGate();
    document.body.appendChild(gate);

    var btn   = document.getElementById('rc-gate-btn');
    var input = document.getElementById('rc-gate-input');

    if (btn)   btn.addEventListener('click',   function () { playClick(); doVerify(); });
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') doVerify(); });

    /* Focus input glow */
    if (input) {
      input.addEventListener('focus',  function () { this.style.borderColor = 'rgba(59,130,246,.6)'; });
      input.addEventListener('blur',   function () { this.style.borderColor = 'rgba(59,130,246,.25)'; });
    }
  }

  /* ── MutationObserver: sound + token enforcement ───── */
  var observer = new MutationObserver(function () {
    document.querySelectorAll('button:not([data-rc-s]), a:not([data-rc-s])').forEach(function (el) {
      el.setAttribute('data-rc-s', '1');
      el.addEventListener('click', playClick);
    });

    document.querySelectorAll('[data-testid="button-access-game"]:not([data-rc-e])').forEach(function (el) {
      el.setAttribute('data-rc-e', '1');
      el.addEventListener('click', function (e) {
        if (!tokenGeneratedInSession) {
          e.preventDefault();
          e.stopImmediatePropagation();
          showWarning();
        }
      }, true);
    });

    document.querySelectorAll('[data-testid="button-generate-token"]:not([data-rc-t])').forEach(function (el) {
      el.setAttribute('data-rc-t', '1');
      el.addEventListener('click', function () { tokenGeneratedInSession = true; });
    });
  });

  document.addEventListener('click', function (e) {
    var tgt = e.target;
    if (!tgt) return;
    if (
      (tgt.tagName === 'BUTTON' && tgt.dataset && tgt.dataset.testid === 'button-close-modal') ||
      tgt.id === 'rc-lang-overlay'
    ) { tokenGeneratedInSession = false; }
  }, true);

  document.querySelectorAll('#rc-lang-overlay .rc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      playClick();
      dismissLangOverlay(btn.dataset.lang);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  /* ── Boot verification gate ─────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGate);
  } else {
    initGate();
  }

})();
