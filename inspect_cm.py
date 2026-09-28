with open('app2/js/app.147dfad4.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

import re
matches = [m.start() for m in re.finditer(r"'consoleMessage'\s*\([^)]*\)", c)]
print(f"Found {len(matches)} consoleMessage handlers")
for i, pos in enumerate(matches):
    print(f"=== Handler {i+1} at pos {pos} ===")
    print(c[pos:pos+400])
