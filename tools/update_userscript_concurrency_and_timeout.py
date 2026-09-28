import re

src_file = r"extensions\captchasonic-all-in-one-fixed.user.js"
with open(src_file, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Fix cross-frame message broadcast that killed other frames:
old_post = 'window.top.postMessage({type:"captchaInvisible"},"*")'
new_post = '/* window.top.postMessage disabled to allow multiple panels/parts */'
if old_post in text:
    text = text.replace(old_post, new_post)
    print("Replaced cross-frame postMessage successfully.")
else:
    print("Warning: old_post not found exactly.")

# 2. Fix the message listener so it only listens to messages from own window:
old_listener = 'window.addEventListener("message",v=>{v.data&&v.data.type==="captchaInvisible"&&(window.captchaInvisible=!0,window.pop=!1)})'
new_listener = 'window.addEventListener("message",v=>{v.source===window&&v.data&&v.data.type==="captchaInvisible"&&(window.captchaInvisible=!0,window.pop=!1)})'
if old_listener in text:
    text = text.replace(old_listener, new_listener)
    print("Scoped captchaInvisible listener to own window.")
else:
    print("Warning: old_listener not found exactly.")

# 3. Fix the early exit 'if(window.pop)return;' that terminated the solver loop in other frames:
old_exit = '{if(window.pop)return;window.pop=!0,'
new_exit = '{if(window.pop){await l.sleep(1000);continue;}window.pop=!0,'
if old_exit in text:
    text = text.replace(old_exit, new_exit)
    print("Prevented loop termination on window.pop.")
else:
    print("Warning: old_exit not found exactly.")

# 4. Fix chromePolyfill.storage.local to avoid wiping other frames' keys across the browser:
# In chromePolyfill, we can keep an in-memory map for non-settings keys so they are frame-isolated
old_storage_set = """        set: function (items, callback) {
          return new Promise((resolve) => {
            if (items && typeof items === "object") {
              for (const k in items) {
                if (k === "settings") {
                  saveStoredSettings(items[k]);
                } else if (typeof GM_setValue !== "undefined") {
                  GM_setValue(k, items[k]);
                }
              }
            }
            if (typeof callback === "function") callback();
            resolve();
          });
        },"""

new_storage_set = """        set: function (items, callback) {
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
        },"""

if old_storage_set in text:
    text = text.replace(old_storage_set, new_storage_set)
    print("Updated storage.set to isolate frame solving state.")
else:
    print("Warning: old_storage_set not found exactly.")

# Update storage.get to check frameStorage first:
old_storage_get_first = 'const settings = getStoredSettings();\n            let result = {};'
new_storage_get_first = """const settings = getStoredSettings();
            if (!globalThis.__frameStorage) globalThis.__frameStorage = {};
            let result = {};"""
if old_storage_get_first in text:
    text = text.replace(old_storage_get_first, new_storage_get_first)
    print("Updated storage.get init.")

# In storage.get string key check:
old_storage_get_str = 'else result[keys] = typeof GM_getValue !== "undefined" ? GM_getValue(keys, undefined) : undefined;'
new_storage_get_str = 'else result[keys] = (keys in globalThis.__frameStorage) ? globalThis.__frameStorage[keys] : (typeof GM_getValue !== "undefined" ? GM_getValue(keys, undefined) : undefined);'
if old_storage_get_str in text:
    text = text.replace(old_storage_get_str, new_storage_get_str)
    print("Updated storage.get string lookup.")

# In storage.remove:
old_storage_remove = """        remove: function (keys, callback) {
          return new Promise((resolve) => {
            const list = Array.isArray(keys) ? keys : [keys];
            if (typeof GM_deleteValue !== "undefined") {
              for (const k of list) {
                GM_deleteValue(k);
              }
            }
            if (typeof callback === "function") callback();
            resolve();
          });
        },"""

new_storage_remove = """        remove: function (keys, callback) {
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
        },"""

if old_storage_remove in text:
    text = text.replace(old_storage_remove, new_storage_remove)
    print("Updated storage.remove to prevent cross-frame key wipes.")

# 5. Append Timeout Auto-Restart Monitor right before the end of the Userscript:
timeout_monitor_code = """
  // ==========================================
  // 9. PANEL PART TIMEOUT AUTO-RESTART MONITOR
  // ==========================================
  // Strictly auto-clicks the start icon of the specific panel part that timed out after 10s
  (function initTimeoutAutoStarter() {
    if (typeof window === "undefined") return;

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

# Append before closing })();
end_idx = text.rfind('})();')
if end_idx != -1:
    text = text[:end_idx] + timeout_monitor_code + "\n})();"
    print("Appended Timeout Auto-Restart monitor successfully.")
else:
    print("Warning: could not find closing })();")

# Write out the updated script
out_file = r"extensions\captchasonic-all-in-one-fixed.user.js"
with open(out_file, "w", encoding="utf-8") as f:
    f.write(text)

# Also copy to desktop
desktop_file = r"C:\Users\frazm\OneDrive\Desktop\captchasonic-fixed.user.js"
with open(desktop_file, "w", encoding="utf-8") as f:
    f.write(text)

print(f"Successfully saved updated userscript ({len(text)} chars) to {out_file} and {desktop_file}")
