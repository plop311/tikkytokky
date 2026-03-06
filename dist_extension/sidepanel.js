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

    // NEW: Binding the Algorithm Training Button
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
    log("[API] Requesting #MainCharacter Waves...");

    chrome.runtime.sendMessage({ type: "GENERATE_WAVES" }, (res) => {
        if (!res || !res.success) {
            log(`[API_CRASH] ${res?.error || 'Empty Response. Keys exhausted?'}`, true);
            return;
        }

        log("[API] Payload received. Engaging Savage Parser...");

        try {
            const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            log(`[PARSER] Raw output length: ${raw.length} chars.`);

            // THE SAVAGE REGEX PARSER (Hunts down the array)
            const match = raw.match(/\[[\s\S]*\]/);

            if (!match) {
                log("[PARSER_FATAL] No JSON array boundaries detected in payload.", true);
                console.log("RAW G3 OUTPUT:", raw);
                return;
            }

            log("[PARSER] Array boundaries locked. Executing JSON parse...");
            const trends = JSON.parse(match[0]);

            log(`[PARSER_SUCCESS] Extracted ${trends.length} valid trend objects.`);
            renderTrendCards(trends);
        } catch (e) {
            log(`[PARSER_CRASH] Syntax failure: ${e.message}`, true);
            console.error("PARSER ERROR DATA:", res.data);
        }
    });
}

function renderTrendCards(trends) {
    log("[UI] Rendering Viral Wave cards...");
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
            const targetTrend = btn.dataset.trend;
            log(`[VAULT] Automating capture sequence for: ${targetTrend}`);
            chrome.runtime.sendMessage({ type: "SCRAPE_TREND_ASSETS", trend: targetTrend }, () => {
                log(`[VAULT] Capture complete. Switching active tab.`);
                switchTab('vault');
            });
        };
    });
}

async function renderVault() {
    log("[STORAGE] Polling local videoVault...");
    const list = document.getElementById('vault-list');
    if (!list) return;
    const { videoVault } = await chrome.storage.local.get("videoVault");
    const assets = videoVault || [];
    log(`[STORAGE] Vault contains ${assets.length} assets.`);

    list.innerHTML = assets.length ? "" : "Vault is empty.";
    assets.forEach(a => {
        const d = document.createElement('div');
        d.className = "vault-item";
        d.innerHTML = `<img src="${a.thumbnail}" style="width:100%"><div style="font-size:9px; padding:4px;">${a.trend}</div>`;
        list.appendChild(d);
    });
}

async function saveKeys() {
    log("[SYSTEM] Key save sequence initiated.");
    const input = document.getElementById('key-input');
    if (!input) return;
    const rawText = input.value.trim();
    if (!rawText) {
        log("[SYSTEM] Aborting save: Input field empty.", true);
        return;
    }

    const keys = rawText.split(/\n/).map(k => k.trim()).filter(k => k);
    log(`[SYSTEM] Encrypting ${keys.length} detected keys...`);

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
    chrome.runtime.sendMessage({ type: "GENERATE_SALUTE_HOOK" }, (res) => {
        if (res.success) {
            navigator.clipboard.writeText(res.hook);
            log(`[CLIPBOARD] Hook successfully copied: "${res.hook}"`);
        } else {
            log(`[API_CRASH] Hook generation failed: ${res.error}`, true);
        }
    });
}

function executeHumanComment() {
    log("[HUMAN_BRIDGE] Crafting Human Comment sequence...");
    chrome.runtime.sendMessage({ type: "GENERATE_SALUTE_HOOK" }, (res) => {
        if (res.success) {
            log(`[HUMAN_BRIDGE] Dispatching payload to content script: "${res.hook}"`);
            chrome.runtime.sendMessage({ type: "EXECUTE_TYPO_TYPING", text: res.hook });
        } else {
             log(`[HUMAN_BRIDGE_CRASH] Could not generate comment text.`, true);
        }
    });
}

// NEW: Tells the content script to execute the search
function executeAlgorithmTraining() {
    log("[HUMAN_BRIDGE] Initializing FYP Algorithm Training sequence...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "TRAIN_FYP_ALGORITHM" });
        }
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