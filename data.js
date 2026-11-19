// Табло продажів Lumpurini: завантаження живих даних із бази.
// Сторінка питає пароль, передає його в базу, і база віддає цифри лише за правильним паролем.
// У цьому файлі немає ні цифр, ні пароля. Ключ нижче — відкритий (publishable), сам по собі доступу до даних не дає.
(function () {
  if (window.__tabloLoader) return;
  window.__tabloLoader = true;
  var API = 'https://uenhibrpjssbbewbwdoy.supabase.co/rest/v1/rpc/tablo_data';
  var KEY = 'sb_publishable_9I_7JlSOJ67bfE-HgQh5yg_3px6bAft';
  var STORE = 'lumpurini_tablo_password';

  function saved() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function save(v) { try { v ? localStorage.setItem(STORE, v) : localStorage.removeItem(STORE); } catch (e) {} }

  var box;
  function overlay(message) {
    if (!box) {
      box = document.createElement('div');
      box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#f5f6fa;display:flex;align-items:center;justify-content:center;font-family:Onest,system-ui,sans-serif;color:#1f2233';
      box.innerHTML =
        '<form id="tablo-login" style="background:#fff;border:1px solid #e4e6ef;border-radius:14px;padding:28px 28px 24px;width:320px;max-width:90vw;box-sizing:border-box">' +
        '<div style="font-size:20px;font-weight:700">Lumpurini</div>' +
        '<div style="font-size:14px;color:#6b7086;margin:2px 0 18px">Табло продажів</div>' +
        '<input type="text" name="username" autocomplete="username" value="tablo" style="display:none">' +
        '<label for="tablo-pw" style="font-size:13px;color:#4a4e60">Пароль</label>' +
        '<input id="tablo-pw" type="password" name="password" autocomplete="current-password" style="display:block;width:100%;box-sizing:border-box;margin:6px 0 12px;padding:10px 12px;border:1px solid #cfd3e1;border-radius:8px;font-size:15px">' +
        '<div id="tablo-msg" style="min-height:18px;font-size:13px;color:#b3261e;margin-bottom:10px"></div>' +
        '<button id="tablo-go" type="submit" style="width:100%;padding:10px 12px;border:0;border-radius:8px;background:#3f46c8;color:#fff;font-size:15px;font-weight:600;cursor:pointer">Увійти</button>' +
        '</form>';
      (document.body || document.documentElement).appendChild(box);
      box.querySelector('#tablo-login').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var v = box.querySelector('#tablo-pw').value;
        if (v) load(v);
      });
    }
    box.style.display = 'flex';
    box.querySelector('#tablo-msg').textContent = message || '';
    var go = box.querySelector('#tablo-go');
    go.disabled = false; go.textContent = 'Увійти';
    var pw = box.querySelector('#tablo-pw');
    setTimeout(function () { pw.focus(); }, 50);
  }
  function busy() {
    if (!box) return;
    var go = box.querySelector('#tablo-go');
    go.disabled = true; go.textContent = 'Завантаження…';
    box.querySelector('#tablo-msg').textContent = '';
  }
  function hide() { if (box) box.style.display = 'none'; }

  function load(password) {
    busy();
    fetch(API, {
      method: 'POST',
      headers: { 'apikey': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_password: password })
    }).then(function (res) {
      return res.json().then(function (body) { return { ok: res.ok, body: body }; });
    }).then(function (r) {
      if (r.ok && r.body && r.body.meta) {
        save(password);
        window.LUMPURINI_DATA = r.body;
        hide();
      } else if (r.body && r.body.code === '28P01') {
        save(null);
        overlay('Невірний пароль.');
      } else {
        overlay('Не вдалося отримати дані. Спробуйте ще раз за хвилину.');
      }
    }).catch(function () {
      overlay('Немає зв’язку з базою. Перевірте інтернет і спробуйте ще раз.');
    });
  }

  function start() {
    var p = saved();
    if (p) { overlay(''); load(p); } else { overlay(''); }
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
