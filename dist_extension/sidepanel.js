// sidepanel.js - tikkytokky Mechanical Core (Siligrave Protocol)
const XOR_KEY = "tikkytokky_secret_key";
let autoScrollEnabled = true;

// --- HYPER-VERBOSE LOGGER ---
function log(msg, isError = false) {
    const logger = document.getElementById('debug-logger');
    if (!logger) return;
    const color = isError ? '#ff4444' : '#00ff00';
    const entry = document.createElement('div');
    entry.style.cssText = `color: ${color}; margin-bottom: 2px; font-family: monospace; font-size: 10px;`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${isError ? '❌' : '📡'} ${msg}`;
    logger.appendChild(entry);
    if (autoScrollEnabled) logger.scrollTop = logger.scrollHeight;
}

// --- CONTENT SCRIPT BRIDGE ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "UI_LOG") {
        log(msg.message, msg.isError);
    }
    if (msg.type === "SYNC_UI_TOGGLE") {
        const toggle = document.getElementById("warm-up-toggle");
        if (toggle) toggle.checked = msg.enabled;
    }
});

// --- UTILITIES ---
function obfuscate(input) {
    let xorResult = "";
    for (let i = 0; i < input.length; i++) {
        xorResult += String.fromCharCode(input.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return btoa(xorResult);
}

function deobfuscate(input) {
    try {
        const decoded = atob(input);
        let result = "";
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
        }
        return result;
    } catch (e) { return "DEOBF_ERROR"; }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    log("[SYSTEM] Boot Sequence Initiated. randomgirlirl persona active.");

    const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (el) {
            el.onclick = fn;
            log(`[UI] Binding verified for ID: ${id}`);
        } else {
            log(`[UI_WARN] Missing Element ID: ${id}`, true);
        }
    };

    bind('refresh-trends', refreshTrends);
    bind('shotgun-hashtags', shotgunHashtags);
    bind('init-engine', initializeEngine);
    bind('transform-video', () => log("[ENGINE] WASM Transformation Sequence Standby."));
    bind('save-keys', saveKeys);
    bind('human-comment', executeHumanComment);
    bind('train-fyp', executeAlgorithmTraining);

    bind('settings-gear', () => {
        const m = document.getElementById('settings-menu');
        if (m) m.style.display = (m.style.display === 'none' || m.style.display === '') ? 'block' : 'none';
        log("[UI] Settings Menu Toggled.");
    });

    const warmUpToggle = document.getElementById("warm-up-toggle");
    if (warmUpToggle) {
        warmUpToggle.onchange = () => {
            const state = warmUpToggle.checked;
            log(`[HUMAN_BRIDGE] Emulation toggled: ${state ? 'ENABLED' : 'DISABLED'}`);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    log(`[HUMAN_BRIDGE] Dispatching toggle signal to tab ${tabs[0].id}`);
                    chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_WARM_UP", enabled: state });
                }
            });
        };
    }

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });

    renderKeyList();
    renderVault();
    updateStatusBar();
    log("[SYSTEM] Core Mechanical Sync Complete.");
});

// --- CORE FUNCTIONS ---
function switchTab(target) {
    document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");
    const active = document.getElementById(target);
    if (active) {
        active.style.display = "block";
        if (target === 'vault') renderVault();
        log(`[UI] Navigating tab: ${target.toUpperCase()}`);
    }
}

async function refreshTrends() {
    log("[API] Initiating handshake with Gemini 3 Flash Preview...");
    chrome.runtime.sendMessage({ type: "GENERATE_WAVES" }, (res) => {
        if (!res || !res.success) {
            log(`[API_CRASH] ${res?.error || 'Empty Response. Keys exhausted?'}`, true);
            return;
        }
        try {
            const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const match = raw.match(/\[[\s\S]*\]/);
            if (!match) return log("[PARSER_FATAL] No JSON array boundaries detected.", true);

            const trends = JSON.parse(match[0]);
            renderTrendCards(trends);
        } catch (e) { log(`[PARSER_CRASH] Syntax failure: ${e.message}`, true); }
    });
}

function renderTrendCards(trends) {
    const list = document.getElementById("waves-list");
    if (!list) return;
    list.innerHTML = "";
    trends.forEach(t => {
        const card = document.createElement("div");
        card.className = "glass-card";
        card.style.border = "1px solid #333; margin-bottom: 10px; padding: 10px; border-radius: 8px;";
        card.innerHTML = `<strong>${t.trendName} (${t.viralScore}%)</strong><p style="font-size:10px; opacity:0.8;">${t.description}</p><button class="action-btn auto-btn" data-trend="${t.trendName}" style="background:#00f0ff; color:black; font-size:10px; padding:5px; border-radius:4px; margin-top:5px; border:none; width:100%; cursor:pointer;">AUTOMATE CAPTURE</button>`;
        list.appendChild(card);
    });

    document.querySelectorAll('.auto-btn').forEach(btn => {
        btn.onclick = () => {
            log(`[VAULT] Automating capture sequence for: ${btn.dataset.trend}`);
            chrome.runtime.sendMessage({ type: "SCRAPE_TREND_ASSETS", trend: btn.dataset.trend }, () => switchTab('vault'));
        };
    });
}

async function renderVault() {
    const list = document.getElementById('vault-list');
    if (!list) return;
    const { videoVault } = await chrome.storage.local.get("videoVault");
    const assets = videoVault || [];
    list.innerHTML = assets.length ? "" : "Vault is empty.";
    assets.forEach(a => {
        const d = document.createElement('div');
        d.className = "vault-item";
        d.innerHTML = `<img src="${a.thumbnail}" style="width:100%"><div style="font-size:9px; padding:4px;">${a.trend}</div>`;
        list.appendChild(d);
    });
}

async function saveKeys() {
    const input = document.getElementById('key-input');
    if (!input) return;
    const rawText = input.value.trim();
    if (!rawText) return;

    const keys = rawText.split(/\n/).map(k => k.trim()).filter(k => k);
    chrome.storage.local.get(["apiKeys"], async (res) => {
        const existing = res.apiKeys || [];
        const obfuscated = keys.map(k => ({ encryptedKey: obfuscate(k), isLimited: false, cooldownUntil: 0 }));
        await chrome.storage.local.set({ apiKeys: [...existing, ...obfuscated] });
        input.value = "";
        log(`[STORAGE] Keys committed to secure local storage.`);
        renderKeyList();
        updateStatusBar();
    });
}

function renderKeyList() {
    const list = document.getElementById('key-list');
    if (!list) return;
    chrome.storage.local.get(["apiKeys"], (res) => {
        const keys = res.apiKeys || [];
        list.innerHTML = `<strong>Active Pool: ${keys.length}</strong>`;
        keys.forEach((k, i) => {
            const raw = deobfuscate(k.encryptedKey);
            const mask = raw.substring(0,4) + "****" + raw.substring(raw.length-4);
            list.innerHTML += `<div style="font-size:9px; color:#888; margin-top:2px;">${i+1}: ${mask}</div>`;
        });
    });
}

function updateStatusBar() {
    chrome.storage.local.get(["apiKeys"], (res) => {
        const el = document.getElementById("key-status");
        if (el) el.textContent = `Keys: ${res.apiKeys?.length || 0}`;
    });
}

function shotgunHashtags() {
    log("[API] Polling Gemini 3 Flash for viral hook generation...");
    chrome.runtime.sendMessage({ type: "GENERATE_SALUTE_HOOK", context: "general aesthetic vibes" }, (res) => {
        if (res.success) {
            navigator.clipboard.writeText(res.hook);
            log(`[CLIPBOARD] Hook successfully copied: "${res.hook}"`);
        } else {
            log(`[API_CRASH] Hook generation failed: ${res.error}`, true);
        }
    });
}

// --- UPGRADED COMMENT ENGINE ---
function executeHumanComment() {
    const btn = document.getElementById('human-comment');
    if (btn.disabled) return; // Prevent double-clicking

    // Lock UI and show state
    btn.disabled = true;
    btn.textContent = "5 - CRAFTING COMMENT...";

    log("[HUMAN_BRIDGE] Auto-pausing Ghost Scroller to lock target...");

    // Force the toggle to OFF
    const toggle = document.getElementById("warm-up-toggle");
    if (toggle && toggle.checked) {
        toggle.checked = false;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_WARM_UP", enabled: false });
        });
    }

    log("[HUMAN_BRIDGE] Scanning active video for context...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "GET_ACTIVE_VIDEO_CONTEXT" }, (contextRes) => {
                const videoContext = (contextRes && contextRes.success) ? contextRes.context : "random aesthetic vibes";
                log(`[HUMAN_BRIDGE] Context locked. Dispatching to Gemini...`);

                chrome.runtime.sendMessage({ type: "GENERATE_SALUTE_HOOK", context: videoContext }, (res) => {
                    if (res.success) {
                        log(`[HUMAN_BRIDGE] AI crafted contextual comment: "${res.hook}"`);

                        // Send text, wait for the typing to finish before unlocking the button
                        chrome.tabs.sendMessage(tabs[0].id, { type: "TYPE_HUMAN_TEXT", text: res.hook }, () => {
                            btn.disabled = false;
                            btn.textContent = "5 - HUMAN COMMENT";
                        });
                    } else {
                         log(`[HUMAN_BRIDGE_CRASH] Could not generate contextual comment.`, true);
                         btn.disabled = false;
                         btn.textContent = "5 - HUMAN COMMENT";
                    }
                });
            });
        } else {
            log(`[HUMAN_BRIDGE_CRASH] Cannot determine active tab.`, true);
            btn.disabled = false;
            btn.textContent = "5 - HUMAN COMMENT";
        }
    });
}

function executeAlgorithmTraining() {
    log("[HUMAN_BRIDGE] Initializing FYP Algorithm Training sequence...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "TRAIN_FYP_ALGORITHM" });
    });
}

function initializeEngine() {
    log("[ENGINE] Booting WASM Bitstream Randomizer...");
    const btn = document.getElementById('transform-video');
    if (btn) {
        btn.disabled = false;
        btn.style.opacity = "1";
        log("[ENGINE] ✅ Engine Warm. Transformation unlocked.");
    }
}