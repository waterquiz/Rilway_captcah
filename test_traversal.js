// Test traversal logic simulation
const panelWindow = { name: 'panel' };

const webview1 = {
    name: 'frame_1',
    contentWindow: { name: 'win_wv1', parent: panelWindow }
};

const webview2 = {
    name: 'frame_2',
    contentWindow: { name: 'win_wv2', parent: panelWindow }
};

const innerFrameWV1 = {
    name: 'inner_wv1',
    parent: webview1.contentWindow
};

const allWebviews = [webview1, webview2];

function findTarget(event) {
    let target = null;
    const iframeId = event.data && event.data.iframeId;
    
    // 1. By ID
    if (iframeId) {
        target = allWebviews.find(el => el.name === iframeId);
    }
    
    // 2. By event.source traversal
    if (!target && event.source && event.source !== panelWindow) {
        let curr = event.source;
        while (curr && curr.parent && curr.parent !== panelWindow && curr.parent !== curr) {
            curr = curr.parent;
        }
        target = allWebviews.find(el => el.contentWindow === curr);
    }
    
    return target;
}

// Test 1: Message from innerFrameWV1 with no iframeId (like hcaptcha string message)
const res1 = findTarget({ source: innerFrameWV1, data: 'client_solution:abc123xyz' });
console.log('Test 1 (inner frame of WV1 without ID):', res1 === webview1 ? 'PASSED (matched webview1)' : 'FAILED');

// Test 2: Message from webview2 with ID
const res2 = findTarget({ source: webview2.contentWindow, data: { type: 'ctor-console-event', iframeId: 'frame_2', msg: 'token:456' } });
console.log('Test 2 (webview2 with ID):', res2 === webview2 ? 'PASSED (matched webview2)' : 'FAILED');

// Test 3: Message from webview1 with ID
const res3 = findTarget({ source: webview1.contentWindow, data: { type: 'ctor-console-event', iframeId: 'frame_1', msg: 'token:123' } });
console.log('Test 3 (webview1 with ID):', res3 === webview1 ? 'PASSED (matched webview1)' : 'FAILED');
