// sidepanel.js - tikkytokky Mechanical Core (Siligrave Protocol)
const XOR_KEY = "tikkytokky_secret_key";
let autoScrollEnabled = true;

function log(msg, isError = false) {
    const logger = document.getElementById('debug-logger');
    if (!logger) return;
    const color = isError ? '#ff4444' : '#00ff00';
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.style.cssText = `color: ${color}; margin-bottom: 4px;`;
    entry.textContent = `[${timestamp}] ${msg}`;
    logger.appendChild(entry);
    if (autoScrollEnabled) logger.scrollTop = logger.scrollHeight;
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    log("System Initializing... Full Mechanical Sync.");

    // Function placeholders to prevent ReferenceErrors
    const bindings = {
        'refresh-trends': refreshTrends,
        'shotgun-hashtags': shotgunHashtags,
        'init-engine': initializeEngine,
        'transform-video': startTransformation,
        'settings-gear': toggleSettings,
        'save-keys': saveKeys
    };

    Object.entries(bindings).forEach(([id, func]) => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = func;
    });

    const logger = document.getElementById('debug-logger');
    if (logger) {
        logger.onmouseenter = () => { autoScrollEnabled = false; log("⏸ Log Scroll Paused"); };
        logger.onmouseleave = () => { autoScrollEnabled = true; log("▶ Log Scroll Resumed"); };
    }

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });

    const warmUpToggle = document.getElementById("warm-up-toggle");
    if (warmUpToggle) {
        warmUpToggle.onchange = () => {
            log(`[SYSTEM] TikTok Auto-Scroll: ${warmUpToggle.checked ? 'ON' : 'OFF'}`);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_WARM_UP", enabled: warmUpToggle.checked });
            });
        };
    }

    renderKeyList();
    renderVault();
    updateStatusBar();
});

// --- CORE FUNCTIONS ---

function initializeEngine() {
    log("[SYSTEM] Engine warming up...");
    const btn = document.getElementById('transform-video');
    if (btn) {
        btn.disabled = false;
        log("✅ Button 4 Ready.");
    }
}

function switchTab(target) {
    document.querySelectorAll(".tab-content").forEach(c => {
        c.style.setProperty("display", "none", "important");
        c.classList.remove("active");
    });
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

    const activeContent = document.getElementById(target);
    const activeBtn = document.querySelector(`[data-tab="${target}"]`);

    if (activeContent && activeBtn) {
        activeContent.style.setProperty("display", "block", "important");
        activeContent.classList.add("active");
        activeBtn.classList.add("active");
        if (target === 'vault') renderVault();
        log(`[UI] Nav: ${target.toUpperCase()}`);
    }
}

async function refreshTrends() {
    const list = document.getElementById("waves-list");
    if (!list) return;
    list.innerHTML = '<div class="loader">Scanning #MainCharacter Waves...</div>';
    log("📡 Requesting Waves...");

    chrome.runtime.sendMessage({ type: "GENERATE_WAVES" }, (response) => {
        if (!response?.success) return log("🚨 API Error: " + response.error, true);
        const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(response.data);
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']') + 1;
        if (start !== -1 && end > start) {
            const trends = JSON.parse(raw.substring(start, end));
            renderTrendCards(trends);
            log("✅ Waves Updated.");
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
            <strong>${t.trendName} (${t.viralScore}%)</strong>
            <p style="font-size:11px;">${t.description}</p>
            <button class="action-btn auto-btn" data-trend="${t.trendName}">ONE-TAP AUTOMATE</button>
        `;
        list.appendChild(card);
    });

    document.querySelectorAll('.auto-btn').forEach(btn => {
        btn.onclick = () => {
            log(`[VAULT] Capturing: ${btn.dataset.trend}`);
            chrome.runtime.sendMessage({ type: "SCRAPE_TREND_ASSETS", trend: btn.dataset.trend }, () => switchTab("vault"));
        };
    });
}

async function renderVault() {
    const list = document.getElementById('vault-list');
    if (!list) return;
    const res = await chrome.storage.local.get("videoVault");
    const assets = res.videoVault || [];
    list.innerHTML = assets.length ? "" : '<p class="empty-msg">No assets in vault. Automate a wave to begin.</p>';
    assets.forEach(asset => {
        const item = document.createElement("div");
        item.className = "vault-item";
        item.style.marginBottom = "10px";
        item.innerHTML = `
            <div style="position:relative; background: #111; border: 1px solid #333; padding: 5px; border-radius: 8px;">
                <img src="${asset.thumbnail}" style="width:100%; height: auto; border-radius:4px; display: block;">
                <div style="position:absolute; top:8px; left:8px; background:rgba(0,240,255,0.8); color:black; font-size:9px; font-weight:bold; padding:2px 5px; border-radius:2px;">${asset.status}</div>
                <button class="purge-btn" data-id="${asset.id}" style="position:absolute; bottom:8px; right:8px; background:#ff4444; border:none; color:white; font-size:10px; cursor:pointer; padding: 2px 6px; border-radius: 4px;">DEL</button>
                <div style="font-size:10px; color: #fff; margin-top:5px; font-weight: bold;">@${asset.author}</div>
            </div>
        `;
        list.appendChild(item);
    });

    document.querySelectorAll('.purge-btn').forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            const res = await chrome.storage.local.get("videoVault");
            const updated = (res.videoVault || []).filter(a => a.id !== id);
            await chrome.storage.local.set({ videoVault: updated });
            log(`[VAULT] Item Purged.`);
        };
    });
}

function shotgunHashtags() {
    log("🎯 Generating Relatable Hook...");
    chrome.runtime.sendMessage({ type: "GENERATE_SALUTE_HOOK" }, (res) => {
        if (res.success) {
            log(`📋 Hook Copied: "${res.hook}"`);
            navigator.clipboard.writeText(res.hook);
        }
    });
}

function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    if (menu) menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
}

function saveKeys() {
    const input = document.getElementById('key-input');
    if (!input) return;
    const rawText = input.value.trim();
    if (!rawText) return;

    const keys = rawText.split(/\n/).map(k => k.trim()).filter(k => k);
    chrome.storage.local.get(["apiKeys"], async (res) => {
        const existing = res.apiKeys || [];
        const obfuscated = keys.map(k => ({
            encryptedKey: btoa(k), // Simplified for now
            isLimited: false,
            cooldownUntil: 0
        }));
        await chrome.storage.local.set({ apiKeys: [...existing, ...obfuscated] });
        input.value = "";
        log(`[SYSTEM] Added ${keys.length} keys.`);
    });
}

function renderKeyList() {
    const list = document.getElementById('key-list');
    if (!list) return;
    chrome.storage.local.get(["apiKeys"], (res) => {
        const keys = res.apiKeys || [];
        list.innerHTML = `<strong>Pool: ${keys.length} Active</strong>`;
    });
}

function updateStatusBar() {
    chrome.storage.local.get(["apiKeys"], (res) => {
        const el = document.getElementById("key-status");
        if (el) el.textContent = `Keys: ${res.apiKeys?.length || 0}`;
    });
}

function startTransformation() {
    log("🚀 Starting WASM Transformation...");
    chrome.runtime.sendMessage({ type: "START_TRANSFORMATION" });
}