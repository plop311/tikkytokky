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

    // Wiring Buttons
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

    // Logger Pause Logic
    const logger = document.getElementById('debug-logger');
    if (logger) {
        logger.onmouseenter = () => { autoScrollEnabled = false; log("⏸ Log Scroll Paused"); };
        logger.onmouseleave = () => { autoScrollEnabled = true; log("▶ Log Scroll Resumed"); };
    }

    // Tab Navigation
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });

    // Warm-Up Toggle Wiring
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
    list.innerHTML = '<div class="loader">Scanning #MainCharacter Waves...</div>';
    log("📡 Requesting Waves...");

    chrome.runtime.sendMessage({ type: "GENERATE_WAVES" }, (response) => {
        if (!response?.success) return log("🚨 API Error", true);
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
    const res = await chrome.storage.local.get("videoVault");
    const assets = res.videoVault || [];
    list.innerHTML = assets.length ? "" : '<p>Vault is empty.</p>';
    assets.forEach(asset => {
        const item = document.createElement("div");
        item.className = "vault-item";
        item.innerHTML = `<img src="${asset.thumbnail}"><button class="purge-btn" data-id="${asset.id}">DEL</button><div>@${asset.author}</div>`;
        list.appendChild(item);
    });
    document.querySelectorAll('.purge-btn').forEach(btn => {
        btn.onclick = async () => {
            const updated = assets.filter(a => a.id !== btn.dataset.id);
            await chrome.storage.local.set({ videoVault: updated });
            log("[VAULT] Item Purged.");
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
    menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
}

// ... obfuscate/deobfuscate, saveKeys, renderKeyList, updateStatusBar, etc ...