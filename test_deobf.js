const fs = require('fs');
const content = fs.readFileSync('app2/js/app.147dfad4.js', 'utf8');

// Find the first 100kb which contains the array and shifter
const head = content.substring(0, 100000);

// Evaluate array and shifter in a sandbox
const vm = require('vm');
const ctx = {};
vm.createContext(ctx);

// Find the array declaration
const arrMatch = head.match(/var (_0x[a-f0-9]+)\s*=\s*\[[\s\S]*?\];/);
const shifterMatch = head.match(/\(function\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\)\{[\s\S]*?\}\(_0x[a-f0-9]+,\s*0x[a-f0-9]+\)\);/);
const fnMatch = head.match(/function (_0x[a-f0-9]+)\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\)\{[\s\S]*?return\s+_0x[a-f0-9]+;[\s\S]*?\}/);

if (arrMatch && shifterMatch && fnMatch) {
    vm.runInContext(arrMatch[0], ctx);
    vm.runInContext(shifterMatch[0], ctx);
    vm.runInContext(fnMatch[0], ctx);

    const fnName = fnMatch[1];
    const lookup = ctx[fnName];

    // Find the hex code that returns 'Press play to start working'
    for (let i = 0; i < 2000; i++) {
        try {
            const val = lookup(i);
            if (val === 'Press play to start working') {
                console.log(`Found 'Press play to start working' at index: 0x${i.toString(16)} (${i})`);
            }
        } catch(e) {}
    }
}
