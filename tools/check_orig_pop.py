import subprocess

code = '''
const fs = require('fs');
const orig = fs.readFileSync('extensions/tm_clean_c042ac68-72b3-40aa-b233-212fe57588f5.js', 'utf8');
const pStart = orig.indexOf('runScript("popularCaptcha"');
const pEnd = orig.indexOf('runScript("awswaf"');
const popChunk = orig.substring(pStart, pEnd);

try {
  new Function('runScript', popChunk);
  console.log('ORIG popularCaptcha is VALID!');
} catch(e) {
  console.log('ORIG popularCaptcha error:', e.message);
}
'''
with open('scratch/test_orig_pop.js', 'w', encoding='utf-8') as f:
    f.write(code)

res = subprocess.run(['node', 'scratch/test_orig_pop.js'], capture_output=True, text=True)
print("Stdout:", res.stdout)
print("Stderr:", res.stderr)
