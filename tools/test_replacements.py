import subprocess

with open('extensions/tm_clean_c042ac68-72b3-40aa-b233-212fe57588f5.js', 'r', encoding='utf-8') as f:
    orig = f.read()

pStart = orig.find('runScript("popularCaptcha"')
pEnd = orig.find('runScript("awswaf"')
pop = orig[pStart:pEnd]

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
        err = res.stderr or ""
        print(f"{name} ERROR:\n{err}")

# Test 0: orig
test_chunk("Test 0 (orig)", pop)

# Test 1: replace postMessage
c1 = pop.replace('window.top.postMessage({type:"captchaInvisible"},"*")', '/* disabled */')
test_chunk("Test 1 (postMessage)", c1)

# Test 2: replace listener
c2 = c1.replace(
    'window.addEventListener("message",v=>{v.data&&v.data.type==="captchaInvisible"&&(window.captchaInvisible=!0,window.pop=!1)})',
    'window.addEventListener("message",v=>{v.source===window&&v.data&&v.data.type==="captchaInvisible"&&(window.captchaInvisible=!0,window.pop=!1)})'
)
test_chunk("Test 2 (listener)", c2)

# Test 3: replace window.pop
c3 = c2.replace(
    '{if(window.pop)return;window.pop=!0,',
    '{if(window.pop){await l.sleep(1000);continue;}window.pop=!0,'
)
test_chunk("Test 3 (window.pop)", c3)
