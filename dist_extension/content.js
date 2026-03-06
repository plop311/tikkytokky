// content.js - randomgirlirl Human Emulation (Siligrave Protocol)
let scrollLoop = null;

console.log("[HUMAN] randomgirlirl Content Bridge Active.");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "PING") {
        sendResponse({ success: true, status: "ALIVE" });
    }

    if (msg.type === "TOGGLE_WARM_UP") {
        if (msg.enabled) {
            startHumanBrowsing();
        } else {
            stopHumanBrowsing();
        }
        sendResponse({ success: true });
    }

    if (msg.type === "TYPE_HUMAN_TEXT") {
        simulateHumanTyping(msg.text);
        sendResponse({ success: true });
    }

    if (msg.type === "TRAIN_FYP_ALGORITHM") {
        trainAlgorithm();
        sendResponse({ success: true });
    }
});

// --- FYP NAVIGATION (Desktop Keyboard Emulation) ---
function startHumanBrowsing() {
    if (scrollLoop) return;
    console.log("[HUMAN] Starting FYP Navigation sequence...");

    const browse = () => {
        const roll = Math.random();
        let nextActionDelay = 3000;

        if (roll < 0.7) {
            // Next Video
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, bubbles: true });
            document.body.dispatchEvent(event);
            console.log("[HUMAN] ArrowDown -> Next Video");
            nextActionDelay = Math.floor(Math.random() * 4000) + 2000;
        } else if (roll < 0.95) {
            // Linger & Potentially Like
            console.log("[HUMAN] Lingering on video...");

            // 20% chance she likes a video she lingers on
            if (Math.random() < 0.20) {
                setTimeout(attemptRandomLike, Math.floor(Math.random() * 4000) + 2000);
            }

            nextActionDelay = Math.floor(Math.random() * 12000) + 6000;
        } else {
            // Re-watch
            const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, bubbles: true });
            document.body.dispatchEvent(event);
            console.log("[HUMAN] ArrowUp -> Re-watching");
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
        console.log("[HUMAN] FYP Navigation halted.");
    }
}

// --- RANDOM LIKING ENGINE ---
function attemptRandomLike() {
    // Finds the active video container on desktop TikTok
    const activeVideoContainer = document.querySelector('[data-e2e="recommend-list-item-container"][data-active="true"]') || document;

    // Finds the heart icon within that active container
    const likeButton = activeVideoContainer.querySelector('[data-e2e="like-icon"]');

    if (likeButton) {
        // Check if it's already liked (TikTok changes the SVG fill color or class)
        const isAlreadyLiked = likeButton.closest('div').classList.contains('liked') ||
                               likeButton.closest('button').getAttribute('aria-pressed') === 'true';

        if (!isAlreadyLiked) {
            console.log("[HUMAN] Aesthetic match. Tapping the Like button.");
            likeButton.click();
        } else {
            console.log("[HUMAN] Video already liked. Skipping.");
        }
    } else {
        console.log("[HUMAN] Could not locate Like button on current view.");
    }
}

// --- ALGORITHM TRAINING (Auto-Search) ---
async function trainAlgorithm() {
    const nicheQueries = [
        "romanticizing my life",
        "main character energy",
        "silent walking aesthetic",
        "day in my life aesthetic",
        "POV you are the main character"
    ];

    const targetQuery = nicheQueries[Math.floor(Math.random() * nicheQueries.length)];
    console.log(`[HUMAN] Training FYP. Selected query: "${targetQuery}"`);

    const searchInput = document.querySelector('input[type="search"]');
    if (!searchInput) {
        console.error("[HUMAN] Could not find the search bar. Are you on the main TikTok layout?");
        return;
    }

    searchInput.focus();
    searchInput.click();
    await new Promise(r => setTimeout(r, 600));

    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);

    for (let i = 0; i < targetQuery.length; i++) {
        document.execCommand("insertText", false, targetQuery[i]);
        await new Promise(r => setTimeout(r, Math.random() * 100 + 50));
    }

    await new Promise(r => setTimeout(r, 800));

    console.log("[HUMAN] Submitting search...");
    const enterForm = searchInput.closest('form');
    if (enterForm) {
        enterForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    } else {
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true });
        searchInput.dispatchEvent(enterEvent);
    }
}

// --- TYPO-CORRECTION ENGINE ---
async function simulateHumanTyping(text) {
    const el = document.querySelector(".DraftEditor-root") || document.querySelector("[contenteditable='true']") || document.activeElement;
    if (!el || !el.isContentEditable) {
        console.error("[HUMAN] No input field found. Is the comment section visibly open?");
        return;
    }

    console.log(`[HUMAN] Preparing to type: "${text}"`);
    el.focus();

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (Math.random() < 0.08) {
            const keys = "asdfghjklqwertyuiop";
            const wrongChar = keys[Math.floor(Math.random() * keys.length)];
            document.execCommand("insertText", false, wrongChar);
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 200) + 100));
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 400) + 200));
            document.execCommand("delete");
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 200) + 100));
        }
        document.execCommand("insertText", false, char);
        await new Promise(r => setTimeout(r, Math.random() * 150 + 50));
    }
    console.log("[HUMAN] Typing sequence complete.");
}