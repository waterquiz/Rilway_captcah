with open('app2/js/app.147dfad4.js', 'r', encoding='utf-8', errors='ignore') as f:
    c = f.read()

import re

# Find the string array
m = re.search(r'var _0x[a-f0-9]+\s*=\s*\[(.*?)\];', c[:100000])
if m:
    raw_strings = m.group(1)
    # Split strings
    # Better: execute the array declaration or evaluate indices
    print("Found array definition")

# Let's search for references to index
# In webpack obfuscators, there's a function like _0x498d(0x123)
# Let's find the lookup function name
fn_match = re.search(r'function (_0x[a-f0-9]+)\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\)', c[:100000])
if fn_match:
    lookup_fn = fn_match.group(1)
    print("Lookup function:", lookup_fn)
