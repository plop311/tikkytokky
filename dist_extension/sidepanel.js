// sidepanel.js - tikkytokky Mechanical Core (Siligrave Protocol)
const XOR_KEY = "tikkytokky_secret_key";
let autoScrollEnabled = true;

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
    log("System Booting... randomgirlirl persona loaded.");

    const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };

    bind('refresh-trends', refreshTrends);
    bind('shotgun-hashtags', shotgunHashtags);
    bind('init-engine', initializeEngine);
    bind('transform-video', () => log("WASM Transformation Sequence Standby."));
    bind('save-keys', saveKeys);

    bind('settings-gear', () => {
        const m = document.getElementById('settings-menu');
        if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
        log("[UI] Settings Toggled.");
    });

    // WARM-UP TOGGLE (The Scroller Kill-Switch)
    const warmUpToggle = document.getElementById("warm-up-toggle");
    if (warmUpToggle) {
        warmUpToggle.onchange = () => {
            const state = warmUpToggle.checked;
            log(`[HUMAN] Warm-up Emulation: ${state ? 'ENABLED' : 'DISABLED'}`);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_WARM_UP", enabled: state });
                }
            });
        };
    }

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // LOAD SAVED DATA
    renderKeyList();
    renderVault();
    updateStatusBar();
});

// --- CORE FUNCTIONS ---

function switchTab(target) {
    document.querySelectorAll(".tab-content").forEach(c => c.style.display = "none");
    const active = document.getElementById(target);
    if (active) {
        active.style.display = "block";
        if (target === 'vault') renderVault();
        log(`Navigating to: ${target.toUpperCase()}`);
    }
}

async function refreshTrends() {
    log("Requesting #MainCharacter Waves...");
    chrome.runtime.sendMessage({ type: "GENERATE_WAVES" }, (res) => {
        if (!res || !res.success) return log(`CRASH: ${res?.error || 'Empty Response'}`, true);

        try {
            const raw = res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const start = raw.indexOf('[');
            const end = raw.lastIndexOf(']') + 1;
            const trends = JSON.parse(raw.substring(start, end));
            renderTrendCards(trends);
            log(`Success: Found ${trends.length} viral leads.`);
        } catch (e) {
            log(`Parser Error: Check raw AI output.`, true);
        }
    });
}

function renderTrendCards(trends) {
    const list = document.getElementById("waves-list");
    if (!list) return;
    list.innerHTML = "";
    trends.forEach(t => {
        const card = document.createElement("div");
        card.className = "glass-card";
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <strong>${t.trendName}</strong>
                <span style="color:#00f0ff;">${t.viralScore}%</span>
            </div>
            <p style="font-size:10px; margin:5px 0;">${t.description}</p>
            <button class="action-btn auto-btn" data-trend="${t.trendName}">AUTOMATE</button>
        `;
        list.appendChild(card);
    });

    document.querySelectorAll('.auto-btn').forEach(btn => {
        btn.onclick = () => {
            log(`Staging: ${btn.dataset.trend}`);
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
        d.innerHTML = `<img src="${a.thumbnail}" style="width:100%"><div style="font-size:9px;">${a.trend}</div>`;
        list.appendChild(d);
    });
}

// --- KEY MANAGEMENT (RESTORED) ---

async function saveKeys() {
    const input = document.getElementById('key-input');
    if (!input) return;
    const rawText = input.value.trim();
    if (!rawText) return;

    const keys = rawText.split(/\n/).map(k => k.trim()).filter(k => k);
    chrome.storage.local.get(["apiKeys"], async (res) => {
        const existing = res.apiKeys || [];
        const obfuscated = keys.map(k => ({
            encryptedKey: obfuscate(k),
            isLimited: false,
            cooldownUntil: 0
        }));
        await chrome.storage.local.set({ apiKeys: [...existing, ...obfuscated] });
        input.value = "";
        log(`[SYSTEM] Added ${keys.length} keys to pool.`);
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
    log("Polling Gemini for Hook...");
    chrome.runtime.sendMessage({ type: "GENERATE_SALUTE_HOOK" }, (res) => {
        if (res.success) {
            navigator.clipboard.writeText(res.hook);
            log(`HOOK COPIED: "${res.hook}"`);
        } else log("Hook generation failed.", true);
    });
}

function initializeEngine() {
    log("Engine Warming Up: Injecting Human Heuristics...");
    const transformBtn = document.getElementById('transform-video');
    if (transformBtn) {
        transformBtn.disabled = false;
        transformBtn.style.opacity = "1";
        log("✅ Button 4 UNLOCKED.");
    }
}