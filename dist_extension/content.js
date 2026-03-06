// content.js - randomgirlirl Human Emulation (Siligrave Protocol)
let scrollLoop = null;

console.log("[HUMAN] randomgirlirl Content Bridge Active.");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // 1. Connection Check
    if (msg.type === "PING") {
        sendResponse({ success: true, status: "ALIVE" });
    }

    // 2. The Account Warming Toggle
    if (msg.type === "TOGGLE_WARM_UP") {
        if (msg.enabled) {
            startHumanBrowsing();
        } else {
            stopHumanBrowsing();
        }
        sendResponse({ success: true });
    }

    // 3. The Typo-Correction Engine
    if (msg.type === "TYPE_HUMAN_TEXT") {
        simulateHumanTyping(msg.text);
        sendResponse({ success: true });
    }
});

// --- HUMAN EMULATION LOGIC ---

function startHumanBrowsing() {
    if (scrollLoop) return;
    console.log("[HUMAN] Starting Account Warming sequence...");

    const browse = () => {
        const roll = Math.random();
        let nextActionDelay = 3000;

        // 70% Chance: Press Down Arrow (Next Video)
        if (roll < 0.7) {
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, bubbles: true });
            document.body.dispatchEvent(event);
            console.log("[HUMAN] Tapped 'ArrowDown' -> Next Video");
            nextActionDelay = Math.floor(Math.random() * 4000) + 2000;
        }
        // 25% Chance: The "Linger" (Watching the video)
        else if (roll < 0.95) {
            console.log("[HUMAN] Video caught interest. Lingering...");
            nextActionDelay = Math.floor(Math.random() * 12000) + 6000; // Wait 6-18 seconds
        }
        // 5% Chance: The "Re-Watch" (Press Up Arrow)
        else {
            const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, bubbles: true });
            document.body.dispatchEvent(event);
            console.log("[HUMAN] Tapped 'ArrowUp' -> Re-watching previous");
            nextActionDelay = Math.floor(Math.random() * 3000) + 2000;
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

// THE TYPO-CORRECTION ENGINE (React-Safe)
async function simulateHumanTyping(text) {
    // Target TikTok's specific contenteditable div structure
    const el = document.querySelector(".DraftEditor-root") || document.querySelector("[contenteditable='true']") || document.activeElement;

    if (!el || !el.isContentEditable) {
        console.error("[HUMAN] No input field found. Is the comment section visibly open?");
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

            document.execCommand("insertText", false, wrongChar);
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 200) + 100));

            // Notice the mistake, pause, and backspace
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 400) + 200));
            document.execCommand("delete");
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 200) + 100));
        }

        // Type correct character
        document.execCommand("insertText", false, char);

        // Variable typing speed
        const delay = Math.random() * 150 + 50;
        await new Promise(r => setTimeout(r, delay));
    }

    console.log("[HUMAN] Typing sequence complete.");
}