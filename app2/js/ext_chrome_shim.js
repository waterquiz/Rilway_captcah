/**
 * Chrome Extension API Shim
 * Mocks chrome.runtime, chrome.storage.local, and chrome.tabs
 * so the reCAPTCHA v2 extension's recaptcha.js can run in a normal webpage
 * served by our Flask proxy at http://localhost:5000
 *
 * The extension needs:
 *   - chrome.runtime.getURL(path) -> URL to extension assets
 *   - chrome.storage.local.get(null) -> settings object
 *   - chrome.runtime.sendMessage({type: "KV_GET"/"KV_SET", label: {...}}, callback)
 *   - chrome.runtime?.id (truthy check to detect extension context)
 */
(function () {
  'use strict';

  // Only shim if not already inside a real extension context
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return; // Real extension context — don't override
  }

  // Base URL for our server-hosted extension assets
  var BASE_URL = window.location.origin; // e.g. http://localhost:5000

  // In-memory KV store (shared across iframes via localStorage)
  var KV_STORE = {};

  // Persist KV to localStorage so anchor & bframe iframes share state
  function kvGet(key, tabSpecific) {
    var storageKey = tabSpecific ? 'ext_kv_' + key : 'ext_kv_global_' + key;
    try {
      var val = localStorage.getItem(storageKey);
      if (val !== null) return JSON.parse(val);
    } catch (e) {}
    if (KV_STORE.hasOwnProperty(storageKey)) return KV_STORE[storageKey];
    // Fall back to hardcoded defaults for visibility keys
    if (DEFAULT_KV && DEFAULT_KV.hasOwnProperty(storageKey)) return DEFAULT_KV[storageKey];
    return undefined;
  }

  function kvSet(key, value, tabSpecific) {
    var storageKey = tabSpecific ? 'ext_kv_' + key : 'ext_kv_global_' + key;
    KV_STORE[storageKey] = value;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (e) {}
  }

  // Default settings matching the extension's defaults
  var DEFAULT_SETTINGS = {
    recaptcha_auto_open: true,
    recaptcha_auto_solve: true,
    recaptcha_click_delay_time: 100,
    recaptcha_solve_delay_time: 300
  };

  // Visibility keys are normally set by recaptcha-visibility.js running in the parent tab.
  // Since we're inside the proxied iframes themselves, we default both to true.
  var DEFAULT_KV = {
    'ext_kv_recaptcha_widget_visible': true,
    'ext_kv_recaptcha_image_visible': true
  };

  // Shim object
  var shimChrome = {
    runtime: {
      // Fake extension ID — just needs to be truthy for chrome.runtime?.id checks
      id: 'localextshim',

      // Map extension asset paths to our server routes
      getURL: function (path) {
        // path is like "dist/ort-wasm.wasm" or "models/car.ort"
        if (path.startsWith('dist/')) {
          return BASE_URL + '/ext_dist/' + path.replace('dist/', '');
        }
        if (path.startsWith('models/')) {
          return BASE_URL + '/ext_models/' + path.replace('models/', '');
        }
        return BASE_URL + '/ext/' + path;
      },

      // Message passing for KV_GET / KV_SET
      sendMessage: function (message, callback) {
        if (!message || !callback) return;
        var type = message.type;
        var label = message.label || {};

        setTimeout(function () {
          try {
            if (type === 'KV_GET') {
              var val = kvGet(label.key, label.tab_specific);
              callback({ status: 'success', value: val });
            } else if (type === 'KV_SET') {
              kvSet(label.key, label.value, label.tab_specific);
              callback({ status: 'success' });
            } else {
              callback({ status: 'unknown' });
            }
          } catch (e) {
            callback(null);
          }
        }, 0);
      },

      onMessage: {
        addListener: function () {}
      },

      onInstalled: {
        addListener: function () {}
      }
    },

    storage: {
      local: {
        get: function (keys, callback) {
          // Called as: chrome.storage.local.get(null) -> returns all settings
          var result = {};
          for (var k in DEFAULT_SETTINGS) {
            if (DEFAULT_SETTINGS.hasOwnProperty(k)) {
              var storedVal = kvGet(k, false);
              result[k] = storedVal !== undefined ? storedVal : DEFAULT_SETTINGS[k];
            }
          }
          if (typeof keys === 'string') {
            var singleResult = {};
            singleResult[keys] = result[keys];
            result = singleResult;
          } else if (Array.isArray(keys)) {
            var filteredResult = {};
            for (var i = 0; i < keys.length; i++) {
              filteredResult[keys[i]] = result[keys[i]];
            }
            result = filteredResult;
          }
          // Support both callback and Promise patterns
          if (typeof callback === 'function') {
            setTimeout(function () { callback(result); }, 0);
          }
          return Promise.resolve(result);
        },
        set: function (items, callback) {
          for (var k in items) {
            if (items.hasOwnProperty(k)) {
              kvSet(k, items[k], false);
            }
          }
          if (typeof callback === 'function') {
            setTimeout(callback, 0);
          }
          return Promise.resolve();
        }
      }
    },

    tabs: {
      create: function () {},
      query: function (opts, cb) { if (cb) cb([]); },
      sendMessage: function () {}
    },

    permissions: {
      contains: function (opts, callback) {
        if (callback) callback(true);
        return Promise.resolve(true);
      }
    }
  };

  // Install the shim
  if (typeof window.chrome === 'undefined' || !window.chrome) {
    window.chrome = shimChrome;
  } else {
    // Merge carefully — don't override real APIs
    if (!window.chrome.runtime) window.chrome.runtime = shimChrome.runtime;
    if (!window.chrome.storage) window.chrome.storage = shimChrome.storage;
    if (!window.chrome.tabs) window.chrome.tabs = shimChrome.tabs;
  }

  console.log('[ExtShim] Chrome extension API shim installed. Base URL:', BASE_URL);
})();
