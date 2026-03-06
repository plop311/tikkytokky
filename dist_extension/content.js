// content.js - randomgirlirl Human Emulation (Siligrave Protocol)
let scrollLoop = null;

console.log("[HUMAN] Content Bridge Active.");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "PING") {
        sendResponse({ success: true });
    }

    if (msg.type === "TOGGLE_WARM_UP") {
        if (msg.enabled) {
            startHumanBrowsing();
        } else {
            stopHumanBrowsing();
        }
        sendResponse({ success: true });
    }
});

function startHumanBrowsing() {
    if (scrollLoop) return;
    console.log("[HUMAN] Starting Aesthetic Browsing...");

    const browse = () => {
        const roll = Math.random();
        let delay = 3000; // Base delay

        if (roll < 0.6) {
            // 60% Chance: Standard Scroll Down
            const pixels = Math.floor(Math.random() * 600) + 400;
            window.scrollBy({ top: pixels, behavior: 'smooth' });
            console.log(`[HUMAN] Scrolled ${pixels}px`);
            delay = Math.floor(Math.random() * 3000) + 2000;
        }
        else if (roll < 0.9) {
            // 30% Chance: Linger (Watching a video)
            console.log("[HUMAN] Watching video (Lingering)...");
            delay = Math.floor(Math.random() * 8000) + 5000; // Wait 5-13 seconds
        }
        else {
            // 10% Chance: Scroll back up (Checking previous video)
            window.scrollBy({ top: -300, behavior: 'smooth' });
            console.log("[HUMAN] Scrolled back up to re-watch.");
            delay = Math.floor(Math.random() * 2000) + 1000;
        }

        scrollLoop = setTimeout(browse, delay);
    };

    browse();
}

function stopHumanBrowsing() {
    if (scrollLoop) {
        clearTimeout(scrollLoop);
        scrollLoop = null;
        console.log("[HUMAN] Browsing sequence halted.");
    }
}