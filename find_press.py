with open('app2/js/app.147dfad4.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

import re
for m in re.finditer(r'Press[^\'"]*', c):
    print(m.group(0)[:60])
