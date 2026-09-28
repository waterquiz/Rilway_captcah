with open('extensions/tm_clean_c042ac68-72b3-40aa-b233-212fe57588f5.js', 'r', encoding='utf-8') as f:
    orig = f.read()

pStart = orig.find('runScript("popularCaptcha"')
pEnd = orig.find('runScript("awswaf"')
pop = orig[pStart:pEnd]

import subprocess

def test_chunk(name, chunk):
    with open('scratch/temp_chunk.js', 'w', encoding='utf-8') as f:
        f.write('function runScript(n, fn) { fn(); }\n' + chunk)
    res = subprocess.run(
        ['node', '-c', 'scratch/temp_chunk.js'],
        capture_output=True,
        encoding='utf-8',
        errors='replace'
    )
    if res.returncode == 0:
        print(f"{name} is VALID")
    else:
        print(f"{name} ERROR")

c1 = pop.replace('window.top.postMessage({type:"captchaInvisible"},"*")', 'void 0')
c2 = c1.replace(
    'window.addEventListener("message",v=>{v.data&&v.data.type==="captchaInvisible"&&(window.captchaInvisible=!0,window.pop=!1)})',
    'window.addEventListener("message",v=>{v.source===window&&v.data&&v.data.type==="captchaInvisible"&&(window.captchaInvisible=!0,window.pop=!1)})'
)

# In pop: let's check what is around if(window.pop)return;
idx = c2.find('if(window.pop)return;')
print('Found if(window.pop)return; at:', idx)
print(repr(c2[idx-50:idx+80]))

c3 = c2.replace('if(window.pop)return;', 'if(window.pop){await l.sleep(1000);continue;}')
test_chunk("Test 3 (sleep & continue)", c3)
