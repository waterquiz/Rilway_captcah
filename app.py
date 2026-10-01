import os
import gzip
import zlib
import urllib.request
import urllib.parse
import urllib.error
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

CAPTCHA_FRAMES = {}
PROXY_CACHE = {}

# ---------------------------------------------------------------------------
# Multi-Proxy Configuration & Mode Detection System:
# - Mode 1: Single Global Proxy (HTTP_PROXY or 1 proxy). Shared by all panels/parts.
# - Mode 2: 4-Slot Dedicated Proxies (PROXY_1 to PROXY_4).
# - Mode 3: Dynamic Rotating Proxy Pool (>4 proxies, e.g. 12 proxies).
#           Staggered round-robin (Step +4) across 4 slots with automatic looping.
# ---------------------------------------------------------------------------
OPENER_CACHE = {}
SLOT_CAPTCHA_COUNTERS = {1: 0, 2: 0, 3: 0, 4: 0}

def format_safe_proxy(p):
    """Format proxy URL without exposing credentials."""
    if not p:
        return "Direct (No Proxy)"
    try:
        parsed = urllib.parse.urlparse(p)
        host_port = parsed.netloc.split('@')[-1] if '@' in parsed.netloc else parsed.netloc
        if not host_port:
            host_port = p.split('@')[-1]
        return f"{parsed.scheme or 'http'}://{host_port}"
    except Exception:
        return p.split('@')[-1]

# Discover indexed proxies: PROXY_1 to PROXY_100
INDEXED_PROXIES = {}
for i in range(1, 101):
    val = (
        os.environ.get(f'PROXY_{i}') or
        os.environ.get(f'HTTP_PROXY_{i}') or
        os.environ.get(f'HTTPS_PROXY_{i}') or
        os.environ.get(f'proxy_{i}')
    )
    if val and val.strip():
        INDEXED_PROXIES[i] = val.strip()

GLOBAL_PROXY = (
    os.environ.get('HTTPS_PROXY') or
    os.environ.get('HTTP_PROXY') or
    os.environ.get('https_proxy') or
    os.environ.get('http_proxy')
)
if GLOBAL_PROXY:
    GLOBAL_PROXY = GLOBAL_PROXY.strip()

# Determine Mode
# Determine Mode
if len(INDEXED_PROXIES) >= 2:
    # Any multi-proxy pool (2 to 100 proxies) rotates dynamically on every captcha
    PROXY_MODE = 3
    sorted_keys = sorted(INDEXED_PROXIES.keys())
    PROXY_POOL = [INDEXED_PROXIES[k] for k in sorted_keys]
elif len(INDEXED_PROXIES) == 1 or GLOBAL_PROXY:
    # Single Global Proxy
    PROXY_MODE = 1
    PROXY_POOL = []
    if not GLOBAL_PROXY and 1 in INDEXED_PROXIES:
        GLOBAL_PROXY = INDEXED_PROXIES[1]
else:
    # Direct Connection (no proxies configured)
    PROXY_MODE = 0
    PROXY_POOL = []

def get_proxy_by_number(proxy_num):
    """Retrieve actual proxy URL for a given proxy_num (1-indexed)."""
    try:
        p_num = int(proxy_num)
    except (ValueError, TypeError):
        p_num = 1

    if PROXY_MODE == 3:
        if not PROXY_POOL:
            return GLOBAL_PROXY
        idx = (p_num - 1) % len(PROXY_POOL)
        return PROXY_POOL[idx]
    elif PROXY_MODE == 1:
        return GLOBAL_PROXY
    return None

def get_proxy_for_slot(slot):
    """Fallback helper to get proxy for a slot."""
    try:
        s = int(slot or 1)
    except (ValueError, TypeError):
        s = 1
    return get_proxy_by_number(s)

def allocate_proxy_for_slot(slot, panel_id=None, part_id=None):
    """
    Allocate a proxy for a new captcha request on a given slot.
    Rotates dynamically so every captcha receives a different proxy.
    Returns (proxy_num, safe_proxy_string).
    """
    try:
        slot = int(slot or 1)
    except (ValueError, TypeError):
        slot = 1
    if slot < 1:
        slot = 1

    if panel_id is None:
        panel_id = ((slot - 1) // 2) + 1
    if part_id is None:
        part_id = ((slot - 1) % 2) + 1

    if slot not in SLOT_CAPTCHA_COUNTERS:
        SLOT_CAPTCHA_COUNTERS[slot] = 0
    SLOT_CAPTCHA_COUNTERS[slot] += 1
    captcha_idx = SLOT_CAPTCHA_COUNTERS[slot]

    if PROXY_MODE == 3:
        pool_len = len(PROXY_POOL)
        round_num = captcha_idx - 1
        active_slots = 10 if (slot > 4 or pool_len >= 20) else 4
        
        # Calculate step to prevent overlaps while ensuring rotation
        if pool_len <= active_slots:
            step = 1
        else:
            step = active_slots
            if step % pool_len == 0:
                step = 1

        pool_idx = ((slot - 1) + (round_num * step)) % pool_len
        proxy_num = pool_idx + 1
        proxy_url = PROXY_POOL[pool_idx]
        safe_p = format_safe_proxy(proxy_url)
        is_loop = (round_num > 0) and ((round_num * step) % pool_len == 0)
        loop_tag = " [Pool Looped]" if is_loop else ""
        print(f"  [Panel {panel_id} Part {part_id} | Slot {slot}] Captcha #{captcha_idx} -> Using Proxy #{proxy_num}/{pool_len}{loop_tag}: {safe_p}")
        return proxy_num, safe_p

    elif PROXY_MODE == 1:
        proxy_num = 1
        safe_p = format_safe_proxy(GLOBAL_PROXY)
        print(f"  [Panel {panel_id} Part {part_id} | Slot {slot}] Captcha #{captcha_idx} -> Using Global Proxy: {safe_p}")
        return 1, safe_p

    else:
        print(f"  [Panel {panel_id} Part {part_id} | Slot {slot}] Captcha #{captcha_idx} -> Direct Connection (No Proxy)")
        return 1, "Direct"

def get_opener_for_proxy_url(proxy_url):
    """Return urllib OpenerDirector configured for proxy_url (cached)."""
    if not proxy_url:
        return urllib.request.build_opener()
    if proxy_url in OPENER_CACHE:
        return OPENER_CACHE[proxy_url]
    
    proxy_handler = urllib.request.ProxyHandler({
        'http': proxy_url,
        'https': proxy_url
    })
    opener = urllib.request.build_opener(proxy_handler)
    OPENER_CACHE[proxy_url] = opener
    return opener

def get_opener_for_proxy_num(proxy_num):
    proxy_url = get_proxy_by_number(proxy_num)
    return get_opener_for_proxy_url(proxy_url)

def get_opener_for_slot(slot):
    return get_opener_for_proxy_num(slot)

# ---------------------------------------------------------------------------
# Startup Banner Logs for Railway
# ---------------------------------------------------------------------------
print("=" * 72)
if PROXY_MODE == 3:
    pool_len = len(PROXY_POOL)
    active_slots = 10 if pool_len >= 20 else min(4, max(2, pool_len))
    step = 1 if pool_len <= active_slots else (1 if active_slots % pool_len == 0 else active_slots)
    num_panels = (active_slots + 1) // 2
    print(f"=== CAPTCHATYPERS PROXY SYSTEM: DYNAMIC ROTATING POOL ({pool_len} PROXIES) ===")
    print("=" * 72)
    print(f"Detected {pool_len} Proxies. Dynamic Staggered Rotation (Step +{step}) across {num_panels} Panels ({active_slots} Slots):")
    for s in range(1, active_slots + 1):
        p_num = ((s - 1) // 2) + 1
        part_num = ((s - 1) % 2) + 1
        seq = [((s - 1) + (r * step)) % pool_len + 1 for r in range(min(4, max(2, pool_len // max(1, step) + 1)))]
        seq_str = ", ".join(f"Proxy #{x}" for x in seq)
        print(f"  - [Slot {s:02d}] Panel {p_num}, Part {part_num} -> {seq_str}... (Loops back to Proxy #{seq[0]})")
    print("Configured Proxies:")
    for idx, p in enumerate(PROXY_POOL, start=1):
        print(f"  Proxy #{idx:02d}: {format_safe_proxy(p)}")
elif PROXY_MODE == 1:
    print("=== CAPTCHATYPERS PROXY SYSTEM: MODE 1 (SINGLE GLOBAL PROXY) ===")
    print("=" * 72)
    safe_gp = format_safe_proxy(GLOBAL_PROXY)
    print(f"Single Proxy Detected: {safe_gp}")
    print("All Panels and Parts will share this proxy:")
    print(f"  - [Slot 1] Panel 1, Part 1 -> {safe_gp}")
    print(f"  - [Slot 2] Panel 1, Part 2 -> {safe_gp}")
    print(f"  - [Slot 3] Panel 2, Part 1 -> {safe_gp}")
    print(f"  - [Slot 4] Panel 2, Part 2 -> {safe_gp}")
    print("All Panels and Parts will share this proxy:")
    print(f"  - [Slot 1] Panel 1, Part 1 -> {safe_gp}")
    print(f"  - [Slot 2] Panel 1, Part 2 -> {safe_gp}")
    print(f"  - [Slot 3] Panel 2, Part 1 -> {safe_gp}")
    print(f"  - [Slot 4] Panel 2, Part 2 -> {safe_gp}")
else:
    print("=== CAPTCHATYPERS PROXY SYSTEM: DIRECT CONNECTION (NO PROXIES) ===")
    print("=" * 72)
    print("No proxy variables detected. Requests will connect directly via server IP.")
print("=" * 72)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP2_DIR = os.path.join(BASE_DIR, 'app2')
TEMPLATE_DIR = os.path.join(BASE_DIR, 'template')

@app.route('/', methods=['GET'])
@app.route('/index.html', methods=['GET'])
def index():
    if request.headers.get('Accept') == 'application/json' and request.args.get('gui') != '1':
        return jsonify({
            "status": "online",
            "service": "CaptchaTyper Proxy Server",
            "endpoints": [
                "/health",
                "/proxy_captcha",
                "/store_captcha_frame",
                "/render_captcha_frame"
            ]
        })
    return send_from_directory(APP2_DIR, 'index.html')

@app.route('/panel.html', methods=['GET'])
@app.route('/app2/panel.html', methods=['GET'])
def panel():
    return send_from_directory(APP2_DIR, 'panel.html')

@app.route('/css/<path:filename>', methods=['GET'])
def serve_css(filename):
    return send_from_directory(os.path.join(APP2_DIR, 'css'), filename)

@app.route('/js/<path:filename>', methods=['GET'])
def serve_js(filename):
    return send_from_directory(os.path.join(APP2_DIR, 'js'), filename)

@app.route('/fonts/<path:filename>', methods=['GET'])
def serve_fonts(filename):
    p1 = os.path.join(APP2_DIR, 'fonts')
    if os.path.exists(os.path.join(p1, filename)):
        return send_from_directory(p1, filename)
    return send_from_directory(os.path.join(APP2_DIR, 'css', 'fonts'), filename)

@app.route('/img/<path:filename>', methods=['GET'])
def serve_img(filename):
    return send_from_directory(os.path.join(APP2_DIR, 'img'), filename)

# ---- Extension asset routes (shim + solver + wasm + models) ----
@app.route('/ext/js/<path:filename>', methods=['GET'])
def serve_ext_js(filename):
    """Serve extension JS files (shim + recaptcha solver)."""
    return send_from_directory(os.path.join(APP2_DIR, 'js'), filename)

@app.route('/ext_dist/<path:filename>', methods=['GET'])
def serve_ext_dist(filename):
    """Serve ONNX Runtime WASM files for the extension solver."""
    r = send_from_directory(os.path.join(APP2_DIR, 'ext_dist'), filename)
    r.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    r.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    r.headers['Access-Control-Allow-Origin'] = '*'
    return r

@app.route('/ext_models/<path:filename>', methods=['GET'])
def serve_ext_models(filename):
    """Serve ONNX model files for the extension solver."""
    r = send_from_directory(os.path.join(APP2_DIR, 'ext_models'), filename)
    r.headers['Access-Control-Allow-Origin'] = '*'
    return r

@app.route('/template/<path:filename>', methods=['GET'])
def serve_template(filename):
    return send_from_directory(TEMPLATE_DIR, filename)

@app.route('/logo.png', methods=['GET'])
@app.route('/favicon.ico', methods=['GET'])
def serve_logo():
    return send_from_directory(APP2_DIR, 'logo.png')

import base64
import re

def get_co_for_domain(domain):
    domain = domain.replace('https://', '').replace('http://', '').strip('/')
    if ':' not in domain:
        origin_str = f"https://{domain}:443"
    else:
        origin_str = f"https://{domain}"
    return base64.b64encode(origin_str.encode('utf-8')).decode('utf-8').rstrip('=').replace('+', '-').replace('/', '_')

def decompress_response(content, resp_headers):
    """Decompress gzip/deflate/br compressed response bodies from Google."""
    encoding = resp_headers.get('Content-Encoding', '').lower()
    if not encoding or encoding == 'identity':
        return content
    try:
        if encoding == 'gzip':
            return gzip.decompress(content)
        elif encoding == 'deflate':
            # deflate can be raw deflate or zlib-wrapped
            try:
                return zlib.decompress(content)
            except zlib.error:
                return zlib.decompress(content, -zlib.MAX_WBITS)
        elif encoding == 'br':
            try:
                import brotli
                return brotli.decompress(content)
            except (ImportError, Exception):
                return content
    except Exception as e:
        print(f"[decompress] Warning: could not decompress {encoding}: {e}")
    return content


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/version', methods=['GET'])
def version():
    return jsonify({"version": "v1.2-universal-regex"}), 200

@app.route('/store_captcha_frame', methods=['POST'])
def store_captcha_frame():
    data = request.get_json() or {}
    frame_id = data.get('id')
    html = data.get('html', '')
    domain = data.get('domain', 'worker.captchatypers.com')
    slot = int(data.get('slot', 1))
    panel_id = int(data.get('panelId', ((slot - 1) // 2) + 1))
    part_id = int(data.get('partId', ((slot - 1) % 2) + 1))
    domain_clean = domain.replace('https://', '').replace('http://', '').strip('/')
    if frame_id:
        if len(CAPTCHA_FRAMES) > 500:
            keys_to_delete = list(CAPTCHA_FRAMES.keys())[:-250]
            for k in keys_to_delete:
                CAPTCHA_FRAMES.pop(k, None)
        proxy_num, safe_p = allocate_proxy_for_slot(slot, panel_id, part_id)
        CAPTCHA_FRAMES[frame_id] = {
            'html': html,
            'domain': domain_clean,
            'slot': slot,
            'panelId': panel_id,
            'partId': part_id,
            'proxy_num': proxy_num,
            'proxy_safe': safe_p
        }
        return jsonify({
            'success': True,
            'slot': slot,
            'proxy_num': proxy_num,
            'proxy_safe': safe_p
        })
    return jsonify({'error': 'Missing frame id'}), 400

def execute_request_with_fallback(target_url, headers, data=None, method=None, proxy_num=1):
    """
    Attempts to fetch target_url using the assigned proxy_num.
    If the proxy fails (e.g. 402 Payment Required, expired, timeout, connection reset),
    it logs a clear alert and automatically falls back to direct connection.
    Returns (content, status_code, content_type, resp_headers).
    """
    req_kwargs = {'data': data, 'headers': headers}
    if method:
        req_kwargs['method'] = method
    req = urllib.request.Request(target_url, **req_kwargs)
    opener = get_opener_for_proxy_num(proxy_num)
    try:
        with opener.open(req, timeout=12) as resp:
            content = resp.read()
            return content, resp.status, resp.headers.get('Content-Type', 'text/html'), resp.headers
    except urllib.error.HTTPError as e:
        if e.code in (402, 407, 502, 503, 504):
            print(f"[Proxy #{proxy_num}] Proxy error {e.code} ({e.reason}) -> Falling back to Direct Connection...")
        else:
            return e.read(), e.code, e.headers.get('Content-Type', 'text/html'), e.headers
    except Exception as e:
        err_msg = str(e)
        if '402' in err_msg:
            print(f"[Proxy #{proxy_num}] [WARNING] Proxy returned 402 Payment Required (Bandwidth/Subscription Expired on proxy provider). Falling back to Direct Connection...")
        else:
            print(f"[Proxy #{proxy_num}] Proxy error ({e}) -> Falling back to Direct Connection...")

    # Direct Fallback (bypass proxy envs)
    try:
        direct_req = urllib.request.Request(target_url, **req_kwargs)
        direct_opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with direct_opener.open(direct_req, timeout=15) as resp:
            content = resp.read()
            return content, resp.status, resp.headers.get('Content-Type', 'text/html'), resp.headers
    except urllib.error.HTTPError as e:
        return e.read(), e.code, e.headers.get('Content-Type', 'text/html'), e.headers
    except Exception as e:
        raise e

@app.route('/recaptcha_proxy/<int:proxy_num>/<domain>/<path:endpoint>', methods=['GET', 'POST', 'OPTIONS'])
@app.route('/recaptcha_proxy/<domain>/<path:endpoint>', methods=['GET', 'POST', 'OPTIONS'])
def recaptcha_proxy(domain, endpoint, proxy_num=1):
    if request.method == 'OPTIONS':
        resp = Response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = '*'
        return resp

    try:
        proxy_num = int(proxy_num or 1)
    except (ValueError, TypeError):
        proxy_num = 1

    ref_domain = f"https://{domain}/"
    co_val = get_co_for_domain(domain)
    
    qs = request.query_string.decode('utf-8', errors='ignore')
    if 'co=' in qs:
        qs = re.sub(r'co=[^&]+', f'co={co_val}', qs)

    if endpoint.startswith('releases/'):
        target_url = f"https://www.gstatic.com/recaptcha/{endpoint}"
    else:
        target_url = f"https://www.google.com/recaptcha/{endpoint}"
    if qs:
        target_url += f"?{qs}"

    req_headers = {
        'User-Agent': request.headers.get('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'),
        'Referer': ref_domain,
        'Accept-Language': request.headers.get('Accept-Language', 'en-US,en;q=0.9'),
    }
    client_accept = request.headers.get('Accept')
    if client_accept:
        req_headers['Accept'] = client_accept
    else:
        req_headers['Accept'] = '*/*'

    if request.method == 'POST' or request.headers.get('Origin'):
        req_headers['Origin'] = f"https://{domain}"

    cache_key = f"{target_url}_{domain}_p{proxy_num}"
    if request.method == 'GET' and cache_key in PROXY_CACHE:
        cached_content, cached_type = PROXY_CACHE[cache_key]
        r = Response(cached_content, status=200, content_type=cached_type)
        r.headers['Access-Control-Allow-Origin'] = '*'
        r.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        r.headers['Access-Control-Allow-Headers'] = '*'
        r.headers.pop('X-Frame-Options', None)
        r.headers.pop('Content-Security-Policy', None)
        return r

    body = None
    if request.method == 'POST':
        body = request.get_data()
        if b'co=' in body:
            try:
                body_str = body.decode('utf-8', errors='ignore')
                body_str = re.sub(r'co=[^&]+', f'co={co_val}', body_str)
                body = body_str.encode('utf-8')
            except Exception:
                pass
        ct = request.headers.get('Content-Type')
        if ct:
            req_headers['Content-Type'] = ct

    try:
        content, status_code, content_type, resp_headers = execute_request_with_fallback(
            target_url, req_headers, data=body, method=request.method, proxy_num=proxy_num
        )
        content = decompress_response(content, resp_headers)
        
        if 'javascript' in content_type or 'html' in content_type or 'json' in content_type:
            content_text = content.decode('utf-8', errors='ignore')
            content_text = re.sub(r'po\.integrity\s*=\s*[\'"][^\'"]*[\'"];?', '', content_text)
            content_text = content_text.replace('https://www.google.com/recaptcha/', f'/recaptcha_proxy/{proxy_num}/{domain}/')
            content_text = content_text.replace('https://www.gstatic.com/recaptcha/', f'/gstatic_proxy/{proxy_num}/{domain}/')

            if 'javascript' in content_type:
                content_text = content_text.replace('k===void 0?5E3:k', 'k===void 0?60E3:k')
                content_text = content_text.replace('A=A===void 0?15E3:A', 'A=A===void 0?60E3:A')
                content_text = content_text.replace('N===void 0?15E3:N', 'N===void 0?60E3:N')

                content_text = re.sub(
                    r'([a-zA-Z0-9_$]+)=new MessageChannel,([a-zA-Z0-9_$]+)\.postMessage\(([a-zA-Z0-9_$]+),([\s\S]{1,80}?),\[\1\.port2\]\)',
                    r'\1=new MessageChannel,\2.postMessage(\3,"*",[\1.port2])',
                    content_text
                )
                content_text = re.sub(r'(\.postMessage\([^,]+,).*?(,\[\w+\.port2\]\))', r'\1"*"\2', content_text)
                content_text = re.sub(r'([a-zA-Z0-9_$]+)\.v\(x\.origin\)', 'true', content_text)
                content_text = re.sub(r'K\[35\]\(D\[2\],S,W\.origin\)==K\[35\]\(40,S,v\)', 'true', content_text)
                content_text = re.sub(r'!k\|\|W\.source==k\[D\[0\]\]', 'true', content_text)
                content_text = content_text.replace('N&&k&&C&&u.ports.length>B', 'N&&C&&u.ports.length>B')
                content_text = content_text.replace('Z.R(N.origin)', 'true')

            if 'html' in content_type:
                pm_shim = '<script>(function(){try{var o=Window.prototype.postMessage;Window.prototype.postMessage=function(m,t,tr){if(typeof t==="object"&&t!==null){t.targetOrigin="*";return o.call(this,m,t);}return o.call(this,m,"*",tr);};}catch(e){}})();</script>'
                dos_audio_switch = '''<script>
(function() {
  var _notified = false;
  function notifyDos() {
    if (_notified) return;
    _notified = true;
    console.log('[DosAutoSkip] Try-again-later / doscaptcha detected, sending auto-skip message...');
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "ctor-captcha-dos", error: "try_again_later" }, "*");
      }
      if (window.top && window.top !== window && window.top !== window.parent) {
        window.top.postMessage({ type: "ctor-captcha-dos", error: "try_again_later" }, "*");
      }
    } catch(e) {}
  }
  function checkDos() {
    var header = document.querySelector('.rc-doscaptcha-header, .rc-doscaptcha-body, .rc-doscaptcha');
    if (header) {
      notifyDos();
      return;
    }
    var h3 = document.querySelectorAll('h3, .rc-doscaptcha-header-text, .rc-doscaptcha-body-text, p');
    for (var i = 0; i < h3.length; i++) {
      var txt = (h3[i].innerText || h3[i].textContent || '').toLowerCase();
      if (txt.indexOf('try again later') !== -1 ||
          txt.indexOf('automated queries') !== -1 ||
          (txt.indexOf('try again') !== -1 && txt.indexOf('network') !== -1)) {
        notifyDos();
        return;
      }
    }
  }
      // If audio challenge is already active, protect image switch button against accidental clicks
      if (document.querySelector('#audio-response, audio#audio-source, .rc-audiochallenge-play-button')) {
        var imgBtn = document.querySelector('#recaptcha-image-button, button.rc-button-image');
        if (imgBtn && !imgBtn._ct_protected) {
          imgBtn._ct_protected = true;
          imgBtn.style.opacity = '0.35';
          imgBtn.style.cursor = 'not-allowed';
          imgBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log('[AutoAudio] Blocked accidental click on image switch button.');
            return false;
          }, true);
        }
        return;
      }

      // If image challenge is shown, look for audio switch button and click it
      var audioBtn = document.querySelector('#recaptcha-audio-button, button.rc-button-audio, button[title*="audio" i], button[aria-label*="audio" i]');
      if (audioBtn && (audioBtn.offsetWidth > 0 || audioBtn.offsetHeight > 0 || audioBtn.offsetParent !== null)) {
        console.log('[AutoAudio] Image/view mode detected. Auto-switching to audio challenge...');
        try {
          audioBtn.focus();
          audioBtn.click();
          audioBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch(e) {}
      }
    }

    setInterval(function() {
      checkDos();
      autoSwitchToAudio();
    }, 500);

    try {
      var obs = new MutationObserver(function() {
        checkDos();
        autoSwitchToAudio();
      });
      obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch(e) {}
  })();
</script>'''
                inject_scripts = pm_shim + dos_audio_switch
                if '<head>' in content_text:
                    content_text = content_text.replace('<head>', '<head>' + inject_scripts, 1)
                elif '<html>' in content_text:
                    content_text = content_text.replace('<html>', '<html><head>' + inject_scripts + '</head>', 1)
                else:
                    content_text = inject_scripts + content_text

            content = content_text.encode('utf-8')
        
        if request.method == 'GET' and ('javascript' in content_type or 'css' in content_type):
            PROXY_CACHE[cache_key] = (content, content_type)

        r = Response(content, status=status_code, content_type=content_type)
        r.headers['Access-Control-Allow-Origin'] = '*'
        r.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        r.headers['Access-Control-Allow-Headers'] = '*'
        r.headers.pop('X-Frame-Options', None)
        r.headers.pop('Content-Security-Policy', None)
        return r
    except Exception as e:
        print(f"[Proxy #{proxy_num}] Final error for {target_url}: {e}")
        return (f"Proxy error: {e}", 502)

@app.route('/recaptcha/<path:endpoint>', methods=['GET', 'POST', 'OPTIONS'])
def direct_recaptcha_fallback(endpoint):
    """Catch any relative /recaptcha/... calls and proxy them."""
    if request.method == 'OPTIONS':
        resp = Response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = '*'
        return resp
    domain = 'worker.captchatypers.com'
    proxy_num = request.args.get('proxy_num') or request.args.get('slot', 1)
    return recaptcha_proxy(domain, endpoint, proxy_num=proxy_num)

@app.route('/audio_proxy/<int:proxy_num>/<path:audio_url>', methods=['GET'])
@app.route('/audio_proxy/<path:audio_url>', methods=['GET'])
def audio_proxy(audio_url, proxy_num=1):
    """Proxy reCAPTCHA audio challenge MP3 files through our server using assigned proxy."""
    try:
        try:
            proxy_num = int(proxy_num or 1)
        except (ValueError, TypeError):
            proxy_num = 1
        full_url = urllib.parse.unquote(audio_url)
        if not full_url.startswith('http'):
            full_url = 'https://' + full_url
        req_headers = {
            'User-Agent': request.headers.get('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'),
            'Accept': 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,video/*;q=0.6,*/*;q=0.5',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
        }
        content, status_code, ct, _ = execute_request_with_fallback(full_url, req_headers, proxy_num=proxy_num)
        r = Response(content, status=status_code, content_type=ct or 'audio/mpeg')
        r.headers['Access-Control-Allow-Origin'] = '*'
        r.headers['Cache-Control'] = 'public, max-age=300'
        return r
    except Exception as e:
        print(f"[Proxy #{proxy_num}] Audio proxy error: {e}")
        return (f"Audio proxy error: {e}", 500)

@app.route('/gstatic_proxy/<int:proxy_num>/<domain>/<path:endpoint>', methods=['GET', 'OPTIONS'])
@app.route('/gstatic_proxy/<domain>/<path:endpoint>', methods=['GET', 'OPTIONS'])
def gstatic_proxy(domain, endpoint, proxy_num=1):
    if request.method == 'OPTIONS':
        resp = Response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = '*'
        return resp

    try:
        proxy_num = int(proxy_num or 1)
    except (ValueError, TypeError):
        proxy_num = 1

    ref_domain = f"https://{domain}/"
    qs = request.query_string.decode('utf-8', errors='ignore')
    target_url = f"https://www.gstatic.com/recaptcha/{endpoint}"
    if qs:
        target_url += f"?{qs}"

    req_headers = {
        'User-Agent': request.headers.get('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'),
        'Referer': ref_domain,
        'Accept': request.headers.get('Accept', '*/*'),
        'Accept-Language': request.headers.get('Accept-Language', 'en-US,en;q=0.9'),
    }

    cache_key = f"{target_url}_{domain}_p{proxy_num}"
    if request.method == 'GET' and cache_key in PROXY_CACHE:
        cached_content, cached_type = PROXY_CACHE[cache_key]
        r = Response(cached_content, status=200, content_type=cached_type)
        r.headers['Access-Control-Allow-Origin'] = '*'
        r.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        r.headers['Access-Control-Allow-Headers'] = '*'
        r.headers.pop('X-Frame-Options', None)
        r.headers.pop('Content-Security-Policy', None)
        return r

    try:
        content, status_code, content_type, resp_headers = execute_request_with_fallback(
            target_url, req_headers, proxy_num=proxy_num
        )
        content = decompress_response(content, resp_headers)

        if 'javascript' in content_type or 'html' in content_type or 'css' in content_type:
            content_text = content.decode('utf-8', errors='ignore')
            content_text = re.sub(r'po\.integrity\s*=\s*[\'"][^\'"]*[\'"];?', '', content_text)
            content_text = content_text.replace('https://www.google.com/recaptcha/', f'/recaptcha_proxy/{proxy_num}/{domain}/')
            content_text = content_text.replace('https://www.gstatic.com/recaptcha/', f'/gstatic_proxy/{proxy_num}/{domain}/')
            if 'javascript' in content_type:
                content_text = content_text.replace('k===void 0?5E3:k', 'k===void 0?60E3:k')
                content_text = content_text.replace('A=A===void 0?15E3:A', 'A=A===void 0?60E3:A')
                content_text = content_text.replace('N===void 0?15E3:N', 'N===void 0?60E3:N')

                content_text = re.sub(
                    r'([a-zA-Z0-9_$]+)=new MessageChannel,([a-zA-Z0-9_$]+)\.postMessage\(([a-zA-Z0-9_$]+),([\s\S]{1,80}?),\[\1\.port2\]\)',
                    r'\1=new MessageChannel,\2.postMessage(\3,"*",[\1.port2])',
                    content_text
                )
                content_text = re.sub(r'(\.postMessage\([^,]+,).*?(,\[\w+\.port2\]\))', r'\1"*"\2', content_text)
                content_text = re.sub(r'([a-zA-Z0-9_$]+)\.v\(x\.origin\)', 'true', content_text)
                content_text = re.sub(r'K\[35\]\(D\[2\],S,W\.origin\)==K\[35\]\(40,S,v\)', 'true', content_text)
                content_text = re.sub(r'!k\|\|W\.source==k\[D\[0\]\]', 'true', content_text)
                content_text = content_text.replace('N&&k&&C&&u.ports.length>B', 'N&&C&&u.ports.length>B')
                content_text = content_text.replace('Z.R(N.origin)', 'true')

                content_text = re.sub(
                    r'(https://www\.google\.com/recaptcha/(?:api2|enterprise)/payload)',
                    rf'/audio_proxy/{proxy_num}/\1',
                    content_text
                )

            content = content_text.encode('utf-8')
        
        if request.method == 'GET' and ('javascript' in content_type or 'css' in content_type):
            PROXY_CACHE[cache_key] = (content, content_type)

        r = Response(content, status=status_code, content_type=content_type)
        r.headers['Access-Control-Allow-Origin'] = '*'
        r.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        r.headers['Access-Control-Allow-Headers'] = '*'
        r.headers.pop('X-Frame-Options', None)
        r.headers.pop('Content-Security-Policy', None)
        return r
    except Exception as e:
        print(f"[Proxy #{proxy_num}] Gstatic proxy error for {target_url}: {e}")
        return (f"Proxy error: {e}", 502)

@app.route('/gstatic/<path:endpoint>', methods=['GET', 'OPTIONS'])
def direct_gstatic_fallback(endpoint):
    """Catch any relative /gstatic/... calls and proxy them."""
    domain = 'worker.captchatypers.com'
    proxy_num = request.args.get('proxy_num') or request.args.get('slot', 1)
    return gstatic_proxy(domain, endpoint, proxy_num=proxy_num)

@app.route('/render_captcha_frame', methods=['GET'])
def render_captcha_frame():
    frame_id = request.args.get('id')
    frame_data = CAPTCHA_FRAMES.get(frame_id) if frame_id else None

    if not frame_data:
        raw_html = request.args.get('html', '')
        ref_domain = request.args.get('domain', 'worker.captchatypers.com')
        slot = request.args.get('slot', 1)
        panel_id = request.args.get('panel', 1)
        part_id = request.args.get('part', 1)
        proxy_num, safe_p = allocate_proxy_for_slot(slot, panel_id, part_id)
    else:
        raw_html = frame_data['html']
        ref_domain = frame_data['domain']
        slot = frame_data.get('slot', 1)
        panel_id = frame_data.get('panelId', 1)
        part_id = frame_data.get('partId', 1)
        proxy_num = frame_data.get('proxy_num') or request.args.get('proxy_num') or slot
        safe_p = frame_data.get('proxy_safe', '')

    try:
        proxy_num = int(proxy_num)
    except (ValueError, TypeError):
        proxy_num = 1

    if not raw_html:
        return ("No HTML provided", 400)

    domain_clean = ref_domain.replace('https://', '').replace('http://', '').strip('/')

    # -----------------------------------------------------------------------
    # PROXY MODE: Route reCAPTCHA through assigned proxy
    # -----------------------------------------------------------------------
    raw_html = raw_html.replace('https://{Domain}/recaptcha/', f'/recaptcha_proxy/{proxy_num}/{domain_clean}/')
    raw_html = raw_html.replace('https://www.google.com/recaptcha/', f'/recaptcha_proxy/{proxy_num}/{domain_clean}/')
    raw_html = raw_html.replace('https://www.gstatic.com/recaptcha/', f'/gstatic_proxy/{proxy_num}/{domain_clean}/')
    raw_html = raw_html.replace('https://{Domain}/1/', 'https://js.hcaptcha.com/1/')
    raw_html = raw_html.replace('https://{Domain}/turnstile/', 'https://challenges.cloudflare.com/turnstile/')
    raw_html = raw_html.replace('{Domain}', 'www.google.com')

    safe_frame_id = (frame_id or '').replace('"', '\\"')

    console_forwarder = f"""<script>
    window.name = "{safe_frame_id}";
    window._CTOR_FRAME_ID = "{safe_frame_id}";
    (function() {{
        window.addEventListener("message", function(e) {{
            if (e && e.data && (e.data.type === "ctor-captcha-dos" || e.data.error === "try_again_later")) {{
                if (window.parent && window.parent !== window) {{
                    window.parent.postMessage({{ type: "ctor-captcha-dos", iframeId: "{safe_frame_id}", error: "try_again_later" }}, "*");
                }}
            }}
        }});
        var _log = console.log;
        console.log = function() {{
            _log.apply(console, arguments);
            try {{
                var str = Array.from(arguments).join(" ");
                if (typeof str === 'string' && (str.indexOf('token:') !== -1 || str.indexOf('client_solution:') !== -1 || str.indexOf('frame loaded') !== -1 || str.indexOf('detect-active') !== -1 || str.indexOf('frame-onload') !== -1 || str.indexOf('captcha-load-error') !== -1 || str.indexOf('ctor-captcha-dos') !== -1 || str.indexOf('try_again_later') !== -1)) {{
                    if (str.indexOf('ctor-console-event') === -1 && window.parent && window.parent !== window) {{
                        window.parent.postMessage({{ type: "ctor-console-event", iframeId: "{safe_frame_id}", msg: str }}, "*");
                    }}
                }}
            }} catch(e){{}}
        }};
        setTimeout(function() {{
            console.log("frame-onload");
            console.log("frame loaded !");
            console.log("detect-active");
        }}, 150);
    }})();
    </script>"""

    # Inject chrome shim + solver for server-proxy mode
    ext_shim_tag = '<script src="/ext/js/ext_chrome_shim.js"></script>'
    ext_solver_tag = '<script src="/ext/js/ext_recaptcha.js"></script>'
    ext_inject = ext_shim_tag + ext_solver_tag

    all_inject = console_forwarder + ext_inject

    if '<head>' in raw_html:
        raw_html = raw_html.replace('<head>', '<head>' + all_inject, 1)
    elif '<html>' in raw_html:
        raw_html = raw_html.replace('<html>', '<html><head>' + all_inject + '</head>', 1)
    else:
        raw_html = all_inject + raw_html

    resp = Response(raw_html, status=200, content_type='text/html; charset=utf-8')
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers.pop('X-Frame-Options', None)
    resp.headers.pop('Content-Security-Policy', None)
    return resp



@app.route('/proxy_captcha', methods=['GET', 'POST', 'OPTIONS'])
def proxy_captcha():
    if request.method == 'OPTIONS':
        resp = Response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = '*'
        return resp

    target_url = request.args.get('target_url')
    ref_domain = request.args.get('domain', 'https://worker.captchatypers.com/')
    
    if not target_url:
        return ("Missing target_url parameter", 400)
    if not ref_domain.startswith('http'):
        ref_domain = 'https://' + ref_domain
    domain_clean = ref_domain.replace('https://', '').replace('http://', '').strip('/')
    co_val = get_co_for_domain(domain_clean)
    if 'co=' in target_url:
        target_url = re.sub(r'co=[^&]+', f'co={co_val}', target_url)

    req_headers = {
        'User-Agent': request.headers.get('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
        'Referer': ref_domain,
        'Origin': f"https://{domain_clean}"
    }
    try:
        if request.method == 'POST':
            body = request.get_data()
            ct = request.headers.get('Content-Type')
            if ct:
                req_headers['Content-Type'] = ct
            req = urllib.request.Request(target_url, data=body, headers=req_headers, method='POST')
        else:
            req = urllib.request.Request(target_url, headers=req_headers)

        with urllib.request.urlopen(req) as resp:
            content = resp.read()
            status_code = resp.status
            content_type = resp.headers.get('Content-Type', 'text/html')
            
            if 'javascript' in content_type or 'html' in content_type or 'json' in content_type:
                content_text = content.decode('utf-8', errors='ignore')
                content_text = re.sub(r'po\.integrity\s*=\s*[\'"][^\'"]*[\'"];?', '', content_text)
                content_text = content_text.replace('https://www.google.com/recaptcha/', f'/recaptcha_proxy/{domain_clean}/')
                content_text = content_text.replace('https://www.gstatic.com/recaptcha/', f'/gstatic_proxy/{domain_clean}/')
                content = content_text.encode('utf-8')
            r = Response(content, status=status_code, content_type=content_type)
            r.headers['Access-Control-Allow-Origin'] = '*'
            r.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            r.headers['Access-Control-Allow-Headers'] = '*'
            r.headers.pop('X-Frame-Options', None)
            r.headers.pop('Content-Security-Policy', None)
            return r
    except Exception as e:
        return (f"Proxy error: {e}", 500)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1')
    app.run(host='0.0.0.0', port=port, debug=debug)
