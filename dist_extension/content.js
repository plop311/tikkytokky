// content.js - randomgirlirl Human Emulation (Siligrave Protocol)
let scrollLoop = null;

function logToUI(msg, isError = false) {
    console.log(`[HUMAN] ${msg}`);
    // Send log back to sidepanel if it's open
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
// FIXED TYPO: 'randomgirlirl_roulette'
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
});

// --- FYP NAVIGATION (Desktop Keyboard Emulation) ---
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

// --- RANDOM LIKING ENGINE ---
function attemptRandomLike() {
    const activeVideoContainer = document.querySelector('[data-e2e="recommend-list-item-container"][data-active="true"]') || document;
    const likeButton = activeVideoContainer.querySelector('[data-e2e="like-icon"]');

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

// --- ALGORITHM TRAINING (URL Jump) ---
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

    // Increased polling time to account for slower connections/React rendering
    while(attempts < 15) {
        // TikTok grid items usually contain a link with /video/ in the href
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
        // Pick from the top 12 videos to ensure they are actually visible on screen
        const maxIndex = Math.min(videos.length, 12);
        const randomIndex = Math.floor(Math.random() * maxIndex);

        logToUI(`Roulette landed on video index [${randomIndex}]. Engaging Theater Mode in 2s...`);

        await new Promise(r => setTimeout(r, 2000));

        // Find the actual element to click (sometimes the <a> isn't clickable, we need a child)
        const targetElement = videos[randomIndex];
        targetElement.click();

        logToUI("Theater Mode requested. Resuming Ghost Scroller in 4s...");
        setTimeout(() => {
            startHumanBrowsing();
            chrome.runtime.sendMessage({ type: "SYNC_UI_TOGGLE", enabled: true }).catch(() => {});
        }, 4000);
    } else {
        logToUI("FATAL: Could not find the video grid. Aborting roulette.", true);
    }
}

// --- TYPO-CORRECTION ENGINE ---
async function simulateHumanTyping(text) {
    const el = document.querySelector(".DraftEditor-root") || document.querySelector("[contenteditable='true']") || document.activeElement;
    if (!el || !el.isContentEditable) {
        logToUI("No input field found. Is the comment section visibly open?", true);
        return;
    }

    logToUI(`Preparing to type: "${text}"`);
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
    logToUI("Typing sequence complete.");
}