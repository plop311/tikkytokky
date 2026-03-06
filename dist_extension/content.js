// content.js - tikkytokky Content Bridge (Siligrave Protocol)
let scrollInterval = null;

console.log("[VE] Content Bridge Active. Waiting for instructions...");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 1. THE PING
    if (message.type === "PING") {
        sendResponse({ success: true, status: "READY" });
    }

    // 2. THE SCROLL KILL-SWITCH
    if (message.type === "TOGGLE_WARM_UP") {
        if (message.enabled) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
        sendResponse({ success: true });
    }

    // 3. UI OVERLAY INJECTION (For Future Hooks)
    if (message.type === "INJECT_HOOK") {
        injectVisualHook(message.text);
    }
});

function startAutoScroll() {
    if (scrollInterval) return;
    console.log("[VE] Auto-scroll: ENGAGED");
    scrollInterval = setInterval(() => {
        const scrollAmount = Math.floor(Math.random() * 300) + 200;
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }, 5000);
}

function stopAutoScroll() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
        console.log("[VE] Auto-scroll: KILLED");
    }
}

function injectVisualHook(text) {
    const el = document.createElement('div');
    el.style.cssText = "position:fixed; top:20%; left:50%; transform:translateX(-50%); background:white; color:black; padding:10px; font-weight:bold; z-index:9999; border-radius:8px;";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}