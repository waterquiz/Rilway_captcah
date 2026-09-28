import re, subprocess

# Start from the pristine original extracted script
with open(r"extensions\tm_clean_c042ac68-72b3-40aa-b233-212fe57588f5.js", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update header with excludes
header_end = text.find("// @connect      api.captchasonic.com")
if header_end != -1:
    excludes = """// @exclude      http://localhost:5000/
// @exclude      http://localhost:5000/index.html
// @exclude      http://127.0.0.1:5000/
// @exclude      http://127.0.0.1:5000/index.html
"""
    text = text[:header_end] + excludes + text[header_end:]
    print("1. Added @exclude rules to header.")

# 2. Empty NOTIFY_CSS
s_idx = text.find("const NOTIFY_CSS =")
c_idx = text.find("const CONFIG = {")
if s_idx != -1 and c_idx != -1:
    text = text[:s_idx] + 'const NOTIFY_CSS = "";\n\n  ' + text[c_idx:]
    print("2. Nullified NOTIFY_CSS.")

# 3. Comment out GM_addStyle(NOTIFY_CSS)
inject_pat = re.compile(
    r'//\s*Inject notify styling[\s\S]*?\(document\.head\s*\|\|\s*document\.documentElement\)\.appendChild\(style\);\s*\}',
    re.MULTILINE
)
text, count = inject_pat.subn(
    '// Inject notify styling (disabled to protect host page layout and inputs)\n  // GM_addStyle(NOTIFY_CSS);',
    text
)
print("3. Disabled GM_addStyle:", count)

# 4. Safe chrome runtime overrides
old_runtime_block = """      globalThis.chrome.runtime.id = globalThis.chrome.runtime.id || chromePolyfill.runtime.id;
      globalThis.chrome.runtime.sendMessage = chromePolyfill.runtime.sendMessage;
      globalThis.chrome.runtime.getURL = chromePolyfill.runtime.getURL;
      globalThis.chrome.runtime.getManifest = chromePolyfill.runtime.getManifest;"""

new_runtime_block = """      globalThis.chrome.runtime.id = globalThis.chrome.runtime.id || chromePolyfill.runtime.id;
      if (!globalThis.chrome.runtime.sendMessage) globalThis.chrome.runtime.sendMessage = chromePolyfill.runtime.sendMessage;
      if (!globalThis.chrome.runtime.getURL) globalThis.chrome.runtime.getURL = chromePolyfill.runtime.getURL;
      if (!globalThis.chrome.runtime.getManifest) globalThis.chrome.runtime.getManifest = chromePolyfill.runtime.getManifest;"""

if old_runtime_block in text:
    text = text.replace(old_runtime_block, new_runtime_block)
    print("4. Safe chrome.runtime methods installed.")

# 5. Isolate frame storage in chromePolyfill.storage
st_start = text.find('storage: {\n      local: {\n        get: function')
st_end = text.find('tabs:', st_start)

if st_start != -1 and st_end != -1:
    new_storage_full = """storage: {
      local: {
        get: function (keys, callback) {
          return new Promise((resolve) => {
            const settings = getStoredSettings();
            if (!globalThis.__frameStorage) globalThis.__frameStorage = {};
            let result = {};
            if (keys === null || keys === undefined) {
              result = Object.assign({ settings: settings, slideConfig: SLIDE_CONFIG, defaultConfig: DEFAULT_CONFIG }, globalThis.__frameStorage);
            } else if (typeof keys === "string") {
              if (keys === "settings") result.settings = settings;
              else if (keys === "customEndpoint") result.customEndpoint = typeof GM_getValue !== "undefined" ? GM_getValue("customEndpoint", "") : "";
              else if (keys === "eventLog") result.eventLog = typeof GM_getValue !== "undefined" ? GM_getValue("eventLog", []) : [];
              else if (keys === "stats") result.stats = typeof GM_getValue !== "undefined" ? GM_getValue("stats", { totalSolves: 0, successCount: 0, totalTime: 0 }) : {};
              else if (keys in globalThis.__frameStorage) result[keys] = globalThis.__frameStorage[keys];
              else result[keys] = typeof GM_getValue !== "undefined" ? GM_getValue(keys, undefined) : undefined;
            } else if (Array.isArray(keys)) {
              for (const k of keys) {
                if (k === "settings") result.settings = settings;
                else if (k === "metaid" || k === "device_instance_id") result[k] = getDeviceId();
                else if (k in globalThis.__frameStorage) result[k] = globalThis.__frameStorage[k];
                else result[k] = typeof GM_getValue !== "undefined" ? GM_getValue(k, undefined) : undefined;
              }
            } else if (typeof keys === "object") {
              for (const k in keys) {
                if (k in globalThis.__frameStorage) result[k] = globalThis.__frameStorage[k];
                else result[k] = typeof GM_getValue !== "undefined" ? GM_getValue(k, keys[k]) : keys[k];
              }
            }
            if (typeof callback === "function") callback(result);
            resolve(result);
          });
        },
        set: function (items, callback) {
          return new Promise((resolve) => {
            if (!globalThis.__frameStorage) globalThis.__frameStorage = {};
            if (items && typeof items === "object") {
              for (const k in items) {
                if (k === "settings") {
                  saveStoredSettings(items[k]);
                } else {
                  globalThis.__frameStorage[k] = items[k];
                  if (typeof GM_setValue !== "undefined" && !k.endsWith("_hasRun") && !k.endsWith("_feedback") && !k.endsWith("_solved")) {
                    GM_setValue(k, items[k]);
                  }
                }
              }
            }
            if (typeof callback === "function") callback();
            resolve();
          });
        },
        remove: function (keys, callback) {
          return new Promise((resolve) => {
            if (!globalThis.__frameStorage) globalThis.__frameStorage = {};
            const list = Array.isArray(keys) ? keys : [keys];
            for (const k of list) {
              delete globalThis.__frameStorage[k];
              if (typeof GM_deleteValue !== "undefined" && !k.endsWith("_hasRun") && !k.endsWith("_feedback") && !k.endsWith("_solved")) {
                GM_deleteValue(k);
              }
            }
            if (typeof callback === "function") callback();
            resolve();
          });
        },
        clear: function (callback) {
          return new Promise((resolve) => {
            if (!globalThis.__frameStorage) globalThis.__frameStorage = {};
            if (typeof callback === "function") callback();
            resolve();
          });
        }
      },
      onChanged: {
        addListener: (fn) => storageListeners.add(fn),
        removeListener: (fn) => storageListeners.delete(fn)
      }
    },
    """
    text = text[:st_start] + new_storage_full + text[st_end:]
    print("5. Storage frame-isolation applied.")
else:
    print("Warning: storage block boundaries not found.")

# 6. hCaptcha concurrency fixes:
# (a) replace postMessage with void 0
old_pm = 'window.top.postMessage({type:"captchaInvisible"},"*")'
if old_pm in text:
    text = text.replace(old_pm, 'void 0')
    print("6a. Replaced postMessage with void 0.")
else:
    print("Warning: old_pm not found.")

# (b) scope message listener
old_ml = 'window.addEventListener("message",v=>{v.data&&v.data.type==="captchaInvisible"&&(window.captchaInvisible=!0,window.pop=!1)})'
new_ml = 'window.addEventListener("message",v=>{v.source===window&&v.data&&v.data.type==="captchaInvisible"&&(window.captchaInvisible=!0,window.pop=!1)})'
if old_ml in text:
    text = text.replace(old_ml, new_ml)
    print("6b. Scoped message listener.")
else:
    print("Warning: old_ml not found.")

# (c) prevent early loop exit on window.pop
old_wp = 'if(window.pop)return;'
new_wp = 'if(window.pop){await l.sleep(1000);continue;}'
if old_wp in text:
    text = text.replace(old_wp, new_wp)
    print("6c. Replaced window.pop early exit.")
else:
    print("Warning: old_wp not found.")

# 7. Add Timeout Auto-Restart monitor for panels
timeout_monitor_code = """
  // ==========================================
  // 9. PANEL PART TIMEOUT AUTO-RESTART MONITOR
  // ==========================================
  // Strictly auto-clicks the start icon of the specific panel part that timed out after 10s
  (function initTimeoutAutoStarter() {
    if (typeof window === "undefined" || !document) return;

    var activeTimers = new Map();

    function findPartScope(timeoutEl) {
      if (!timeoutEl) return null;
      var curr = timeoutEl;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        var playIcons = curr.querySelectorAll('.mdi-play-circle');
        if (playIcons.length === 1) {
          return { container: curr, playIcon: playIcons[0] };
        }
        curr = curr.parentElement;
      }
      return null;
    }

    function isElementTimedOut(container) {
      if (!container) return false;
      var hasClock = container.querySelector('.mdi-clock-alert-outline');
      if (hasClock) return true;
      var headings = Array.from(container.querySelectorAll('h2'));
      return headings.some(function(h) {
        return (h.innerText || h.textContent || '').trim().toLowerCase() === 'timed out';
      });
    }

    function checkPanelTimeouts() {
      try {
        var timeoutIcons = Array.from(document.querySelectorAll('.mdi-clock-alert-outline'));
        var headings = Array.from(document.querySelectorAll('h2')).filter(function(h) {
          return (h.innerText || h.textContent || '').trim().toLowerCase() === 'timed out';
        });
        var allTimeouts = timeoutIcons.concat(headings);
        if (allTimeouts.length === 0) return;

        var handledContainers = new Set();

        allTimeouts.forEach(function(el) {
          var scope = findPartScope(el);
          if (!scope || handledContainers.has(scope.container)) return;
          handledContainers.add(scope.container);

          var partContainer = scope.container;
          var playIcon = scope.playIcon;

          if (activeTimers.has(partContainer)) return;

          var playBtn = playIcon.closest('button') || playIcon.parentElement;
          if (!playBtn) return;

          console.log('[Userscript Auto-Restart] ⏳ Detected Timed out in part slot! Waiting 10s before auto-clicking start icon...');

          var alertBox = el.closest('.text-center') || el.parentElement;
          var label = null;
          if (alertBox) {
            label = alertBox.querySelector('.ct-timeout-autostart-label');
            if (!label) {
              label = document.createElement('div');
              label.className = 'ct-timeout-autostart-label';
              label.style.cssText = 'color:#00e676; font-size:15px; font-weight:bold; margin-top:10px; text-align:center; animation:pulse 1s infinite;';
              alertBox.appendChild(label);
            }
          }

          var secondsLeft = 10;
          if (label) label.textContent = 'Auto-starting in ' + secondsLeft + 's...';

          var intervalId = setInterval(function() {
            secondsLeft--;
            if (label) label.textContent = 'Auto-starting in ' + secondsLeft + 's...';

            if (!isElementTimedOut(partContainer)) {
              console.log('[Userscript Auto-Restart] Part no longer timed out. Cancelling timer.');
              clearInterval(intervalId);
              activeTimers.delete(partContainer);
              if (label && label.parentElement) label.remove();
              return;
            }

            if (secondsLeft <= 0) {
              clearInterval(intervalId);
              activeTimers.delete(partContainer);
              if (label && label.parentElement) label.remove();

              console.log('[Userscript Auto-Restart] 🚀 10s reached! Auto-clicking START icon for this specific part...');
              try {
                playBtn.click();
                playBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
              } catch(err) {
                console.error('[Userscript Auto-Restart] Error clicking start button:', err);
              }
            }
          }, 1000);

          activeTimers.set(partContainer, intervalId);
        });
      } catch(e) {}
    }

    setInterval(checkPanelTimeouts, 1000);
  })();
"""

# Append timeout_monitor_code right before the last })();
last_close = text.rfind('})();')
if last_close != -1:
    text = text[:last_close] + timeout_monitor_code + "\n})();\n"
    print("7. Appended Timeout Auto-Restart monitor.")

out_file = r"extensions\captchasonic-all-in-one-fixed.user.js"
with open(out_file, "w", encoding="utf-8") as f:
    f.write(text)

desktop_file = r"C:\Users\frazm\OneDrive\Desktop\captchasonic-fixed.user.js"
with open(desktop_file, "w", encoding="utf-8") as f:
    f.write(text)

print(f"8. Successfully wrote {len(text)} characters to {out_file} and {desktop_file}")
