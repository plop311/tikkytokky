// content.js - randomgirlirl Human Emulation (Siligrave Protocol)
let scrollLoop = null;

console.log("[HUMAN] randomgirlirl Content Bridge Active.");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // 1. Connection Check
    if (msg.type === "PING") {
        sendResponse({ success: true, status: "ALIVE" });
    }

    // 2. The Scroller Kill-Switch
    if (msg.type === "TOGGLE_WARM_UP") {
        if (msg.enabled) {
            startHumanBrowsing();
        } else {
            stopHumanBrowsing();
        }
        sendResponse({ success: true });
    }

    // 3. The Typo-Correction Engine (For Comments/Descriptions)
    if (msg.type === "TYPE_HUMAN_TEXT") {
        simulateHumanTyping(msg.text, msg.targetSelector || "textarea");
        sendResponse({ success: true });
    }
});

// --- HUMAN EMULATION LOGIC ---

function startHumanBrowsing() {
    if (scrollLoop) return;
    console.log("[HUMAN] Starting Aesthetic Browsing sequence...");

    const browse = () => {
        const roll = Math.random();
        let nextActionDelay = 3000;

        // 60% Chance: Natural Scroll Down (mimics flicking a thumb)
        if (roll < 0.6) {
            const pixels = Math.floor(Math.random() * 500) + 300;
            window.scrollBy({ top: pixels, behavior: 'smooth' });
            console.log(`[HUMAN] Flicked feed: ${pixels}px`);
            nextActionDelay = Math.floor(Math.random() * 3000) + 1500;
        }
        // 30% Chance: The "Linger" (Watching the video, reading comments)
        else if (roll < 0.9) {
            console.log("[HUMAN] Video caught interest. Lingering...");
            nextActionDelay = Math.floor(Math.random() * 10000) + 5000; // Wait 5-15 seconds
        }
        // 10% Chance: The "Re-Watch" (Scrolling back up slightly)
        else {
            window.scrollBy({ top: -250, behavior: 'smooth' });
            console.log("[HUMAN] Scrolled back up to re-read/re-watch.");
            nextActionDelay = Math.floor(Math.random() * 2000) + 1000;
        }

        scrollLoop = setTimeout(browse, nextActionDelay);
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

// THE TYPO-CORRECTION ENGINE
async function simulateHumanTyping(text, selector) {
    const el = document.querySelector(selector) || document.activeElement;
    if (!el) {
        console.error("[HUMAN] No input field found to type in.");
        return;
    }

    console.log(`[HUMAN] Preparing to type: "${text}"`);
    el.focus();

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // 8% chance to hit the wrong key (typo)
        if (Math.random() < 0.08) {
            const keys = "asdfghjklqwertyuiop";
            const wrongChar = keys[Math.floor(Math.random() * keys.length)];

            // Type the wrong character
            el.value += wrongChar;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 200) + 100));

            // Notice the mistake (pause)
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 400) + 200));

            // Backspace
            el.value = el.value.slice(0, -1);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 200) + 100));
        }

        // Type the correct character
        el.value += char;
        el.dispatchEvent(new Event('input', { bubbles: true }));

        // Variable typing speed (Random Girl vibe)
        const delay = Math.random() * 150 + 50;
        await new Promise(r => setTimeout(r, delay));
    }

    console.log("[HUMAN] Typing sequence complete.");
}