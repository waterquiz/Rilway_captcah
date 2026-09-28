const fs = require('fs');

const code = fs.readFileSync('extensions/captchasonic-all-in-one-fixed.user.js', 'utf8');

// Parse using acorn or babylon or test each runScript block!
const runScriptBlocks = code.split('runScript(');
console.log('Total runScript blocks:', runScriptBlocks.length);

for (let i = 1; i < runScriptBlocks.length; i++) {
  const block = 'runScript(' + runScriptBlocks[i].substring(0, runScriptBlocks[i].lastIndexOf('});') + 3);
  try {
    new Function('runScript', block);
  } catch(e) {
    const name = runScriptBlocks[i].substring(0, 30);
    console.log(`Error in block ${i} (${name}): ${e.message}`);
    // Let's print the stack
    console.log(e.stack);
  }
}
