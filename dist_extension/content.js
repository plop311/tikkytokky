// content.js - randomgirlirl Human Emulation (Siligrave Protocol)
let scrollLoop = null;

function logToUI(msg, isError = false) {
    console.log(`[HUMAN] ${msg}`);
    chrome.runtime.sendMessage({ type: "UI_LOG", message: msg, isError: isError }).catch(() => {});
}

logToUI("randomgirlirl Content Bridge Active.");

// --- THE HUMAN OVERRIDE (KILL-SWITCH) ---
window.addEventListener('mousemove', (e) => {
    if (e.isTrusted && scrollLoop) {
        logToUI("Physical mouse movement detected! Aborting Ghost Scroller.", true);
        stopHumanBrowsing();
        chrome.runtime.sendMessage({ type: "SYNC_UI_TOGGLE", enabled: false }).catch(() => {});
    }
});

// --- GRID ROULETTE (Boot Sequence) ---
if (sessionStorage.getItem('randomgirlirl_roulette') === 'spin') {
    sessionStorage.removeItem('randomgirlirl_roulette');
    logToUI("New aesthetic niche loaded. Initiating Grid Roulette...");
    executeRouletteSpin();
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "PING") sendResponse({ success: true, status: "ALIVE" });

    if (msg.type === "TOGGLE_WARM_UP") {
        msg.enabled ? startHumanBrowsing() : stopHumanBrowsing();
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

    // CONTEXTUAL AWARENESS
    if (msg.type === "GET_ACTIVE_VIDEO_CONTEXT") {
        const activeContainer = document.querySelector('[data-e2e="recommend-list-item-container"][data-active="true"]') || document;
        const descElement = activeContainer.querySelector('[data-e2e="video-desc"]');
        const contextText = descElement ? descElement.textContent.trim() : "aesthetic randomgirlirl vibes";
        sendResponse({ success: true, context: contextText });
    }
});

// --- FYP NAVIGATION ---
function startHumanBrowsing() {
    if (scrollLoop) return;
    logToUI("Starting FYP Navigation sequence...");

    const browse = () => {
        const roll = Math.random();
        let nextActionDelay = 3000;

        if (roll < 0.7) {
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40, bubbles: true });
            document.body.dispatchEvent(event);
            logToUI("ArrowDown -> Next Video");
            nextActionDelay = Math.floor(Math.random() * 4000) + 2000;
        } else if (roll < 0.95) {
            logToUI("Lingering on video...");
            if (Math.random() < 0.20) {
                setTimeout(attemptRandomLike, Math.floor(Math.random() * 4000) + 2000);
            }
            nextActionDelay = Math.floor(Math.random() * 12000) + 6000;
        } else {
            const event = new KeyboardEvent('keydown', { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, bubbles: true });
            document.body.dispatchEvent(event);
            logToUI("ArrowUp -> Re-watching");
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
        logToUI("FYP Navigation halted.");
    }
}

// --- RANDOM LIKING ENGINE (UPGRADED) ---
function attemptRandomLike() {
    // Look for the FYP active container first
    let activeContainer = document.querySelector('[data-e2e="recommend-list-item-container"][data-active="true"]');

    // If not on FYP (Theater Mode), just search the whole document for the like icon
    let likeButton = activeContainer ? activeContainer.querySelector('[data-e2e="like-icon"]') : document.querySelector('[data-e2e="like-icon"]');

    if (likeButton) {
        const isAlreadyLiked = likeButton.closest('div').classList.contains('liked') ||
                               likeButton.closest('button').getAttribute('aria-pressed') === 'true';

        if (!isAlreadyLiked) {
            logToUI("Aesthetic match. Tapping the Like button.");
            likeButton.click();
        } else {
            logToUI("Video already liked. Skipping.");
        }
    } else {
        logToUI("Could not locate Like button on current view.", true);
    }
}

// --- ALGORITHM TRAINING ---
function trainAlgorithm() {
    const nicheUrls = [
        "https://www.tiktok.com/tag/romanticizingmylife",
        "https://www.tiktok.com/tag/maincharacterenergy",
        "https://www.tiktok.com/tag/silentwalk",
        "https://www.tiktok.com/tag/dayinmylife",
        "https://www.tiktok.com/tag/aesthetic"
    ];

    const targetUrl = nicheUrls[Math.floor(Math.random() * nicheUrls.length)];
    logToUI(`JUMPING TO NICHE URL: ${targetUrl}`);

    sessionStorage.setItem('randomgirlirl_roulette', 'spin');
    window.location.href = targetUrl;
}

// --- GRID ROULETTE LOGIC ---
async function executeRouletteSpin() {
    logToUI("Polling DOM for video grid...");
    let attempts = 0;
    let videos = [];

    while(attempts < 15) {
        videos = Array.from(document.querySelectorAll('a[href*="/video/"]'));
        if (videos.length > 5) {
            logToUI(`Grid locked. Found ${videos.length} potential targets.`);
            break;
        }
        logToUI(`Waiting for React to render grid... (Attempt ${attempts + 1}/15)`);
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
    }

    if (videos.length > 0) {
        const maxIndex = Math.min(videos.length, 12);
        const randomIndex = Math.floor(Math.random() * maxIndex);

        logToUI(`Roulette landed on video index [${randomIndex}]. Engaging Theater Mode in 2s...`);
        await new Promise(r => setTimeout(r, 2000));

        videos[randomIndex].click();

        logToUI("Theater Mode requested. Resuming Ghost Scroller in 4s...");
        setTimeout(() => {
            startHumanBrowsing();
            chrome.runtime.sendMessage({ type: "SYNC_UI_TOGGLE", enabled: true }).catch(() => {});
        }, 4000);
    } else {
        logToUI("FATAL: Could not find the video grid. Aborting roulette.", true);
    }
}

// --- TYPO-CORRECTION ENGINE (REACT-SAFE UPGRADE) ---
async function simulateHumanTyping(text) {
    if (!text || text === "undefined") {
        logToUI("Aborting type: AI generated empty or undefined text.", true);
        return;
    }

    // Safely hunt down the exact React Draft.js editable text node
    let el = document.querySelector('.public-DraftEditor-content') ||
             document.querySelector('.DraftEditor-root [contenteditable="true"]') ||
             document.querySelector('[data-e2e="comment-input"] [contenteditable="true"]') ||
             document.querySelector("[contenteditable='true']");

    if (!el) {
        logToUI("No input field found. Is the comment section visibly open?", true);
        return;
    }

    logToUI(`Preparing to type: "${text}"`);

    // Wake up the React component
    el.focus();
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.click();
    await new Promise(r => setTimeout(r, 400));

    // Type the text cleanly at human speed.
    // CRITICAL FIX: Removed backspace simulation to prevent React invariant violation crashes.
    for (let i = 0; i < text.length; i++) {
        document.execCommand("insertText", false, text[i]);
        await new Promise(r => setTimeout(r, Math.random() * 120 + 30));
    }

    logToUI("Typing sequence complete.");
}