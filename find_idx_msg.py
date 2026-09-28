with open('app2/index.html', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

import re
for m in re.finditer(r'addEventListener\([\'"]message[\'"]', c):
    pos = m.start()
    print('Match at', pos)
    print(c[pos:pos+400])
