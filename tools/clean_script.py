import re

with open('extensions/user_pasted_script.js', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('// ==UserScript==')
if idx != -1:
    text = text[idx:]

# NOTIFY_CSS starts at "const NOTIFY_CSS =" and ends right before "const CONFIG = {"
s_idx = text.find('const NOTIFY_CSS =')
c_idx = text.find('const CONFIG = {')

print("s_idx:", s_idx, "c_idx:", c_idx)
notify_block = text[s_idx:c_idx]
print("Notify block length:", len(notify_block))
print("Last 100 chars of notify block:", repr(notify_block[-100:]))

# Replace the entire NOTIFY_CSS declaration with an empty string:
# const NOTIFY_CSS = "";
text = text[:s_idx] + 'const NOTIFY_CSS = "";\n\n  ' + text[c_idx:]

# Next, disable GM_addStyle(NOTIFY_CSS)
inject_pattern = re.compile(
    r'//\s*Inject notify styling\s*if\s*\(typeof GM_addStyle !== "undefined"\)\s*\{[\s\S]*?\(document\.head\s*\|\|\s*document\.documentElement\)\.appendChild\(style\);\s*\}',
    re.MULTILINE
)
text, count = inject_pattern.subn(
    '// Inject notify styling disabled to prevent corrupting host page layout / inputs\n  // GM_addStyle(NOTIFY_CSS);',
    text
)
print(f"Replaced inject block count: {count}")

# Make sure APIKEY is present
if 'sonic_jU643Kvpwrt30TJmkdDSMtpm' in text:
    print("API key sonic_jU643Kvpwrt30TJmkdDSMtpm is present.")
else:
    print("WARNING: API key not found!")

# Add @exclude for localhost:5000 main page just to be 100% sure the top level page never gets touched,
# while captchas inside iframes continue to work.
header_match = re.search(r'(//\s*@grant\s+[^\n]+\n)(?=\s*//\s*==/UserScript==)', text)
if header_match:
    print("Found header grant end")

# Let's write the result to extensions/captchasonic-all-in-one.user.js
with open('extensions/captchasonic-all-in-one.user.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved extensions/captchasonic-all-in-one.user.js successfully! Length:", len(text))
