const fs = require('fs');

const code = fs.readFileSync('extensions/captchasonic-all-in-one-fixed.user.js', 'utf8');
const pStart = code.indexOf('runScript("popularCaptcha"');
const pEnd = code.indexOf('runScript("awswaf"');
const popChunk = code.substring(pStart, pEnd);
console.log('--- 6200 to 6450 ---');
console.log(popChunk.substring(6200, 6450));
