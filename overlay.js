(function () {
  'use strict';

  var LANG_KEY     = 'rc2_lang';
  var VERIFIED_KEY = 'rc2_verified';

  /* ── Translations ───────────────────────────────────── */
  var T = {
    en: {
      /* Entry gate */
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
      /* Modal verify */
      modalTitle:   'Verify your username',
      modalPlaceholder: 'Roblox username',
      modalVerify:  'Verify',
      modalChecking:'Checking…',
      modalApproved:'Verified! You can now access the game.',
      modalDenied:  'Account too new (less than 80 days).',
      modalNotFound:'User not found.',
      modalError:   'Error contacting Roblox.',
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
      modalTitle:   'Verifica tu nombre de usuario',
      modalPlaceholder: 'Nombre de usuario de Roblox',
      modalVerify:  'Verificar',
      modalChecking:'Verificando…',
      modalApproved:'¡Verificado! Ya puedes acceder al juego.',
      modalDenied:  'Cuenta muy nueva (menos de 80 días).',
      modalNotFound:'Usuario no encontrado.',
      modalError:   'Error al contactar Roblox.',
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
      modalTitle:   'Verifique seu nome de usuário',
      modalPlaceholder: 'Nome de usuário do Roblox',
      modalVerify:  'Verificar',
      modalChecking:'Verificando…',
      modalApproved:'Verificado! Você já pode acessar o jogo.',
      modalDenied:  'Conta muito nova (menos de 80 dias).',
      modalNotFound:'Usuário não encontrado.',
      modalError:   'Erro ao contatar o Roblox.',
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
      modalTitle:   'Проверьте ваш никнейм',
      modalPlaceholder: 'Никнейм на Roblox',
      modalVerify:  'Проверить',
      modalChecking:'Проверяем…',
      modalApproved:'Проверено! Вы можете войти в игру.',
      modalDenied:  'Аккаунт слишком новый (менее 80 дней).',
      modalNotFound:'Пользователь не найден.',
      modalError:   'Ошибка связи с Roblox.',
    },
  };

  function getLang() { return localStorage.getItem(LANG_KEY) || 'en'; }
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
    en: 'Verify your username first to access the game.',
    es: 'Verifica tu usuario primero para acceder al juego.',
    pt: 'Verifique seu usuário primeiro para acessar o jogo.',
    ru: 'Сначала проверьте никнейм, чтобы войти в игру.',
  };

  function showWarning() {
    var lang = getLang();
    var msg  = WARN_MSGS[lang] || WARN_MSGS.en;
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

  /* ── Language overlay ───────────────────────────────── */
  function dismissLangOverlay(lang) {
    localStorage.setItem(LANG_KEY, lang);
    var overlay = document.getElementById('rc-lang-overlay');
    if (overlay) {
      overlay.style.animation = 'rc-fadeout .2s ease forwards';
      setTimeout(function () { overlay.classList.add('rc-hidden'); }, 210);
    }
  }

  /* ══════════════════════════════════════════════════════
     ENTRY VERIFICATION GATE
  ══════════════════════════════════════════════════════ */
  function isVerified() { return sessionStorage.getItem(VERIFIED_KEY) === '1'; }

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
        '<div style="width:64px;height:64px;border-radius:20px;margin:0 auto 24px;' +
        'background:linear-gradient(135deg,#1d4ed8,#3b82f6);' +
        'box-shadow:0 0 48px rgba(59,130,246,0.55),0 0 0 1px rgba(59,130,246,0.3);' +
        'display:flex;align-items:center;justify-content:center;">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
          '</svg>' +
        '</div>' +
        '<h2 id="rc-gate-title" style="margin:0 0 8px;font-size:1.5rem;font-weight:800;letter-spacing:-0.03em;color:#fff;">' + t('gateTitle') + '</h2>' +
        '<p id="rc-gate-sub" style="margin:0 0 28px;font-size:.875rem;color:rgba(148,163,184,.8);line-height:1.5;">' + t('gateSubtitle') + '</p>' +
        '<input id="rc-gate-input" type="text" spellcheck="false" autocomplete="off" placeholder="' + t('placeholder') + '"' +
        ' style="width:100%;box-sizing:border-box;padding:12px 16px;border-radius:12px;' +
        'background:rgba(37,99,235,0.08);border:1px solid rgba(59,130,246,0.25);' +
        'color:#fff;font-size:.95rem;font-family:Outfit,Inter,sans-serif;outline:none;margin-bottom:12px;transition:border-color .2s;" />' +
        '<button id="rc-gate-btn" style="width:100%;padding:13px;border:none;border-radius:12px;' +
        'background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;' +
        'font-size:.95rem;font-weight:700;font-family:Outfit,Inter,sans-serif;cursor:pointer;' +
        'box-shadow:0 4px 20px rgba(37,99,235,.4);transition:all .2s;">' + t('btnVerify') + '</button>' +
        '<p id="rc-gate-msg" style="margin:14px 0 0;font-size:.82rem;min-height:20px;color:rgba(148,163,184,.7);"></p>' +
      '</div>';

    return gate;
  }

  function gateMsg(text, color) {
    var el = document.getElementById('rc-gate-msg');
    if (el) { el.textContent = text; el.style.color = color || 'rgba(148,163,184,.7)'; }
  }

  function gateLoading(on) {
    var btn = document.getElementById('rc-gate-btn');
    var inp = document.getElementById('rc-gate-input');
    if (!btn || !inp) return;
    btn.disabled = inp.disabled = on;
    btn.textContent = on ? t('checking') : t('btnVerify');
    btn.style.opacity = on ? '0.7' : '1';
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

  function doGateVerify() {
    var inp = document.getElementById('rc-gate-input');
    if (!inp) return;
    var username = (inp.value || '').trim();
    if (!username) { gateMsg(t('placeholder') + '…', '#f87171'); return; }
    gateLoading(true); gateMsg('');
    fetch('/api/verify?username=' + encodeURIComponent(username))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        gateLoading(false);
        if (data.allowed) {
          gateMsg('✅ ' + t('approved') + ' (' + data.ageInDays + ' ' + t('days') + ')', '#4ade80');
          setTimeout(dismissGate, 900);
        } else if (data.error === 'User not found') {
          gateMsg('❌ ' + t('notFound'), '#f87171');
        } else if (data.ageInDays !== undefined) {
          gateMsg('❌ ' + t('denied') + ' (' + data.ageInDays + ' ' + t('days') + ')', '#f87171');
        } else {
          gateMsg('❌ ' + t('error'), '#f87171');
        }
      })
      .catch(function () { gateLoading(false); gateMsg('❌ ' + t('error'), '#f87171'); });
  }

  function initGate() {
    if (isVerified()) return;
    var gate = buildGate();
    document.body.appendChild(gate);
    var btn = document.getElementById('rc-gate-btn');
    var inp = document.getElementById('rc-gate-input');
    if (btn) btn.addEventListener('click', function () { playClick(); doGateVerify(); });
    if (inp) {
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doGateVerify(); });
      inp.addEventListener('focus', function () { this.style.borderColor = 'rgba(59,130,246,.6)'; });
      inp.addEventListener('blur',  function () { this.style.borderColor = 'rgba(59,130,246,.25)'; });
    }
  }

  /* ══════════════════════════════════════════════════════
     IN-MODAL USERNAME VERIFICATION
     Replaces the "Generate Token" UI with a username input
  ══════════════════════════════════════════════════════ */

  var modalInjected = false;

  function injectModalVerify(tokenBtn) {
    if (document.getElementById('rc-modal-verify-wrap')) return;
    modalInjected = true;
    tokenBtn.style.display = 'none';

    var wrap = document.createElement('div');
    wrap.id = 'rc-modal-verify-wrap';
    wrap.style.cssText = 'margin-top:0;display:flex;flex-direction:column;gap:8px;';

    wrap.innerHTML =
      '<p style="margin:0 0 4px;font-size:.8rem;font-weight:600;color:rgba(148,163,184,.8);' +
      'font-family:Outfit,Inter,sans-serif;letter-spacing:.02em;">' + t('modalTitle') + '</p>' +
      '<div style="display:flex;gap:8px;">' +
        '<input id="rc-modal-input" type="text" spellcheck="false" autocomplete="off"' +
        ' placeholder="' + t('modalPlaceholder') + '"' +
        ' style="flex:1;padding:10px 14px;border-radius:10px;' +
        'background:rgba(37,99,235,0.08);border:1px solid rgba(59,130,246,0.22);' +
        'color:#fff;font-size:.875rem;font-family:Outfit,Inter,sans-serif;' +
        'outline:none;transition:border-color .2s;box-sizing:border-box;" />' +
        '<button id="rc-modal-verify-btn"' +
        ' style="padding:10px 18px;border:none;border-radius:10px;white-space:nowrap;' +
        'background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;' +
        'font-size:.85rem;font-weight:700;font-family:Outfit,Inter,sans-serif;' +
        'cursor:pointer;box-shadow:0 2px 12px rgba(37,99,235,.4);transition:all .2s;">' +
          t('modalVerify') +
        '</button>' +
      '</div>' +
      '<p id="rc-modal-msg" style="margin:2px 0 0;font-size:.78rem;min-height:18px;' +
      'color:rgba(148,163,184,.6);font-family:Outfit,Inter,sans-serif;"></p>';

    tokenBtn.parentNode.insertBefore(wrap, tokenBtn.nextSibling);

    var inp = document.getElementById('rc-modal-input');
    var btn = document.getElementById('rc-modal-verify-btn');

    function modalVerifyLoading(on) {
      if (!btn || !inp) return;
      btn.disabled = inp.disabled = on;
      btn.textContent = on ? t('modalChecking') : t('modalVerify');
      btn.style.opacity = on ? '0.7' : '1';
    }

    function modalVerifyMsg(text, color) {
      var el = document.getElementById('rc-modal-msg');
      if (el) { el.textContent = text; el.style.color = color || 'rgba(148,163,184,.6)'; }
    }

    function doModalVerify() {
      var username = (inp.value || '').trim();
      if (!username) return;
      modalVerifyLoading(true); modalVerifyMsg('');
      fetch('/api/verify?username=' + encodeURIComponent(username))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          modalVerifyLoading(false);
          if (data.allowed) {
            tokenGeneratedInSession = true;
            var loc = (data.city && data.country) ? data.city + ', ' + data.country : (data.country || '');
            var info =
              '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin-top:8px;text-align:left;">' +
                '<div style="font-size:.72rem;color:rgba(148,163,184,.6);">👤 ' + t('modalApproved') + '</div>' +
                '<div style="font-size:.72rem;color:#4ade80;">✅ ' + (data.username || '') + '</div>' +
                '<div style="font-size:.72rem;color:rgba(148,163,184,.6);">🆔 User ID</div>' +
                '<div style="font-size:.72rem;color:#93c5fd;">' + (data.userId || '') + '</div>' +
                '<div style="font-size:.72rem;color:rgba(148,163,184,.6);">📅 ' + t('days') + '</div>' +
                '<div style="font-size:.72rem;color:#93c5fd;">' + (data.created || '') + ' (' + (data.ageInDays || 0) + ' ' + t('days') + ')</div>' +
                (loc ? '<div style="font-size:.72rem;color:rgba(148,163,184,.6);">🌍 País</div><div style="font-size:.72rem;color:#93c5fd;">' + loc + '</div>' : '') +
              '</div>';
            var el = document.getElementById('rc-modal-msg');
            if (el) { el.innerHTML = info; el.style.color = ''; }
          } else if (data.error === 'User not found') {
            modalVerifyMsg('❌ ' + t('modalNotFound'), '#f87171');
          } else if (data.ageInDays !== undefined) {
            modalVerifyMsg('❌ ' + t('modalDenied') + ' (' + data.ageInDays + ' ' + t('days') + ')', '#f87171');
          } else {
            modalVerifyMsg('❌ ' + t('modalError'), '#f87171');
          }
        })
        .catch(function () {
          modalVerifyLoading(false);
          modalVerifyMsg('❌ ' + t('modalError'), '#f87171');
        });
    }

    if (btn) btn.addEventListener('click', function () { playClick(); doModalVerify(); });
    if (inp) {
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doModalVerify(); });
      inp.addEventListener('focus', function () { this.style.borderColor = 'rgba(59,130,246,.6)'; });
      inp.addEventListener('blur',  function () { this.style.borderColor = 'rgba(59,130,246,.22)'; });
    }
  }

  /* ══════════════════════════════════════════════════════
     CARD VERIFICATION POPUP
     Intercepts game card clicks and requires account verify
  ══════════════════════════════════════════════════════ */

  var pendingCard = null;

  function removeCardVerifyPopup() {
    var p = document.getElementById('rc-card-popup');
    if (p) {
      p.style.opacity = '0';
      setTimeout(function () { p.remove(); }, 220);
    }
  }

  function showCardVerify(onSuccess) {
    if (document.getElementById('rc-card-popup')) return;

    var popup = document.createElement('div');
    popup.id = 'rc-card-popup';
    popup.style.cssText = [
      'position:fixed','inset:0','z-index:9999998',
      'display:flex','align-items:center','justify-content:center',
      'background:rgba(4,9,19,.82)','backdrop-filter:blur(6px)',
      'transition:opacity .22s ease','opacity:0',
      'font-family:Outfit,Inter,sans-serif',
    ].join(';');

    popup.innerHTML =
      '<div style="width:100%;max-width:380px;margin:0 16px;' +
      'background:linear-gradient(160deg,#0d1627,#111827);' +
      'border:1px solid rgba(59,130,246,0.22);border-radius:20px;' +
      'box-shadow:0 24px 60px rgba(0,0,0,.7),0 0 0 1px rgba(59,130,246,.1);' +
      'padding:28px 24px 24px;position:relative;">' +

        /* close */
        '<button id="rc-card-close" style="position:absolute;top:14px;right:16px;' +
        'background:none;border:none;color:rgba(148,163,184,.5);font-size:1.25rem;' +
        'cursor:pointer;line-height:1;padding:4px;">✕</button>' +

        /* icon */
        '<div style="width:48px;height:48px;border-radius:14px;margin-bottom:18px;' +
        'background:linear-gradient(135deg,#1d4ed8,#3b82f6);' +
        'box-shadow:0 0 32px rgba(59,130,246,.4);' +
        'display:flex;align-items:center;justify-content:center;">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="3" y="11" width="18" height="11" rx="2"/>' +
            '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
          '</svg>' +
        '</div>' +

        '<h3 style="margin:0 0 6px;font-size:1.15rem;font-weight:800;color:#fff;letter-spacing:-.02em;">' + t('gateTitle') + '</h3>' +
        '<p style="margin:0 0 20px;font-size:.82rem;color:rgba(148,163,184,.7);line-height:1.5;">' + t('gateSubtitle') + '</p>' +

        '<input id="rc-card-input" type="text" spellcheck="false" autocomplete="off"' +
        ' placeholder="' + t('placeholder') + '"' +
        ' style="width:100%;box-sizing:border-box;padding:11px 14px;border-radius:11px;' +
        'background:rgba(37,99,235,0.07);border:1px solid rgba(59,130,246,0.22);' +
        'color:#fff;font-size:.9rem;font-family:Outfit,Inter,sans-serif;' +
        'outline:none;margin-bottom:10px;transition:border-color .2s;" />' +

        '<button id="rc-card-btn" style="width:100%;padding:12px;border:none;border-radius:11px;' +
        'background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#fff;' +
        'font-size:.9rem;font-weight:700;font-family:Outfit,Inter,sans-serif;cursor:pointer;' +
        'box-shadow:0 4px 18px rgba(37,99,235,.4);transition:all .2s;">' + t('btnVerify') + '</button>' +

        '<p id="rc-card-msg" style="margin:12px 0 0;font-size:.78rem;min-height:18px;' +
        'color:rgba(148,163,184,.65);font-family:Outfit,Inter,sans-serif;"></p>' +
      '</div>';

    document.body.appendChild(popup);
    requestAnimationFrame(function () { popup.style.opacity = '1'; });

    var inp = document.getElementById('rc-card-input');
    var btn = document.getElementById('rc-card-btn');
    var cls = document.getElementById('rc-card-close');

    if (inp) inp.focus();
    if (cls) cls.addEventListener('click', removeCardVerifyPopup);
    popup.addEventListener('click', function (e) {
      if (e.target === popup) removeCardVerifyPopup();
    });

    function cardMsg(text, color) {
      var el = document.getElementById('rc-card-msg');
      if (el) { el.textContent = text; el.style.color = color || 'rgba(148,163,184,.65)'; }
    }

    function cardLoading(on) {
      if (!btn || !inp) return;
      btn.disabled = inp.disabled = on;
      btn.textContent = on ? t('checking') : t('btnVerify');
      btn.style.opacity = on ? '0.65' : '1';
    }

    function doCardVerify() {
      var username = (inp ? inp.value || '' : '').trim();
      if (!username) return;
      cardLoading(true); cardMsg('');
      fetch('/api/verify?username=' + encodeURIComponent(username))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          cardLoading(false);
          if (data.allowed) {
            tokenGeneratedInSession = true;
            var loc = data.city && data.country ? data.city + ', ' + data.country : (data.country || '');
            var info =
              '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 10px;margin-top:4px;text-align:left;">' +
                '<span style="color:rgba(148,163,184,.6);font-size:.72rem;">👤</span>' +
                '<span style="color:#4ade80;font-size:.72rem;">✅ ' + (data.username || '') + '</span>' +
                '<span style="color:rgba(148,163,184,.6);font-size:.72rem;">🆔 ID</span>' +
                '<span style="color:#93c5fd;font-size:.72rem;">' + (data.userId || '') + '</span>' +
                '<span style="color:rgba(148,163,184,.6);font-size:.72rem;">📅</span>' +
                '<span style="color:#93c5fd;font-size:.72rem;">' + (data.created || '') + ' · ' + data.ageInDays + ' ' + t('days') + '</span>' +
                (loc ? '<span style="color:rgba(148,163,184,.6);font-size:.72rem;">🌍</span><span style="color:#93c5fd;font-size:.72rem;">' + loc + '</span>' : '') +
              '</div>';
            var msgEl = document.getElementById('rc-card-msg');
            if (msgEl) { msgEl.innerHTML = info; msgEl.style.color = ''; }
            setTimeout(function () {
              removeCardVerifyPopup();
              if (typeof onSuccess === 'function') onSuccess();
            }, 1400);
          } else if (data.error === 'User not found') {
            cardMsg('❌ ' + t('notFound'), '#f87171');
          } else if (data.ageInDays !== undefined) {
            cardMsg('❌ ' + t('denied') + ' (' + data.ageInDays + ' ' + t('days') + ')', '#f87171');
          } else {
            cardMsg('❌ ' + t('error'), '#f87171');
          }
        })
        .catch(function () { cardLoading(false); cardMsg('❌ ' + t('error'), '#f87171'); });
    }

    if (btn) btn.addEventListener('click', function () { playClick(); doCardVerify(); });
    if (inp) {
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') doCardVerify(); });
      inp.addEventListener('focus',   function () { this.style.borderColor = 'rgba(59,130,246,.55)'; });
      inp.addEventListener('blur',    function () { this.style.borderColor = 'rgba(59,130,246,.22)'; });
    }
  }

  /* ── MutationObserver ───────────────────────────────── */
  var observer = new MutationObserver(function () {
    /* Sound */
    document.querySelectorAll('button:not([data-rc-s]), a:not([data-rc-s])').forEach(function (el) {
      el.setAttribute('data-rc-s', '1');
      el.addEventListener('click', playClick);
    });

    /* Game card click intercept — fires BEFORE modal opens */
    document.querySelectorAll('[class*="bg-card"][class*="rounded-xl"]:not([data-rc-card])').forEach(function (card) {
      card.setAttribute('data-rc-card', '1');
      card.addEventListener('click', function (e) {
        if (tokenGeneratedInSession) return;
        if (card === pendingCard) { pendingCard = null; return; }
        e.preventDefault();
        e.stopImmediatePropagation();
        showCardVerify(function () {
          pendingCard = card;
          card.click();
        });
      }, true);
    });

    /* Token gate — final guard on Access Game button */
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

    /* Intercept Generate Token button → inject username verify */
    document.querySelectorAll('[data-testid="button-generate-token"]:not([data-rc-t])').forEach(function (el) {
      el.setAttribute('data-rc-t', '1');
      injectModalVerify(el);
    });
  });

  /* Reset modal state on modal close */
  document.addEventListener('click', function (e) {
    var tgt = e.target;
    if (!tgt) return;
    if (
      (tgt.tagName === 'BUTTON' && tgt.dataset && tgt.dataset.testid === 'button-close-modal') ||
      tgt.id === 'rc-lang-overlay'
    ) {
      tokenGeneratedInSession = false;
      modalInjected = false;
    }
  }, true);

  /* Language buttons */
  document.querySelectorAll('#rc-lang-overlay .rc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      playClick();
      dismissLangOverlay(btn.dataset.lang);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  /* Boot entry gate */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGate);
  } else {
    initGate();
  }

})();
