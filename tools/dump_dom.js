const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:5000/panel.html?panelId=1', { waitUntil: 'networkidle2', timeout: 15000 });
    
    // Wait 2 seconds for Vue to mount
    await new Promise(r => setTimeout(r, 2000));

    const structure = await page.evaluate(() => {
      function dump(el, depth = 0) {
        if (!el || depth > 8) return '';
        let tag = el.tagName.toLowerCase();
        let cls = el.className ? ` class="${el.className}"` : '';
        let id = el.id ? ` id="${el.id}"` : '';
        let text = el.children.length === 0 ? ` [${(el.innerText || '').trim().substring(0, 30)}]` : '';
        let res = '  '.repeat(depth) + `<${tag}${id}${cls}>${text}\n`;
        for (let c of el.children) {
          res += dump(c, depth + 1);
        }
        return res;
      }
      return dump(document.getElementById('app'));
    });
    console.log(structure);
    await browser.close();
  } catch(e) {
    console.error('Error:', e.message);
  }
})();
