import re

src_file = r"extensions\tm_clean_c042ac68-72b3-40aa-b233-212fe57588f5.js"
with open(src_file, "r", encoding="utf-8") as f:
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
    print("Added @exclude rules to header.")

# 2. Empty NOTIFY_CSS
s_idx = text.find("const NOTIFY_CSS =")
c_idx = text.find("const CONFIG = {")
if s_idx != -1 and c_idx != -1:
    print(f"Removing NOTIFY_CSS ({c_idx - s_idx} chars)...")
    text = text[:s_idx] + 'const NOTIFY_CSS = "";\n\n  ' + text[c_idx:]
else:
    print("WARNING: Could not find NOTIFY_CSS boundary!")

# 3. Comment out GM_addStyle(NOTIFY_CSS)
inject_pat = re.compile(
    r'//\s*Inject notify styling[\s\S]*?\(document\.head\s*\|\|\s*document\.documentElement\)\.appendChild\(style\);\s*\}',
    re.MULTILINE
)
text, count = inject_pat.subn(
    '// Inject notify styling (disabled to protect host page layout and inputs)\n  // GM_addStyle(NOTIFY_CSS);',
    text
)
print(f"Replaced GM_addStyle block: {count}")

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
    print("Made chrome.runtime methods safe.")
else:
    print("Warning: old runtime block not found exactly, searching relaxed...")

out_file = r"extensions\captchasonic-all-in-one-fixed.user.js"
with open(out_file, "w", encoding="utf-8") as f:
    f.write(text)

print(f"Written fixed userscript to {out_file}, length: {len(text)}")
