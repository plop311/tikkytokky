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

document.addEventListener('DOMContentLoaded', () => {
    log("System Booting... randomgirlirl persona loaded.");

    // Binding buttons with explicit error checking
    const bind = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
        else console.warn(`[UI] Missing Element ID: ${id}`);
    };

    bind('refresh-trends', refreshTrends);
    bind('shotgun-hashtags', shotgunHashtags);
    bind('init-engine', () => log("Engine Warm-up Initialized..."));
    bind('transform-video', () => log("WASM Transformation Sequence Standby."));
    bind('settings-gear', () => {
        const m = document.getElementById('settings-menu');
        m.style.display = m.style.display === 'none' ? 'block' : 'none';
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });

    renderVault();
});

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

            if (start === -1) {
                log("DEBUG: " + raw.substring(0, 50), true);
                throw new Error("No JSON block in AI response.");
            }

            const trends = JSON.parse(raw.substring(start, end));
            renderTrendCards(trends);
            log(`Success: Found ${trends.length} viral leads.`);
        } catch (e) {
            log(`Parser Error: ${e.message}`, true);
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

function shotgunHashtags() {
    log("Polling Gemini for Hook...");
    chrome.runtime.sendMessage({ type: "GENERATE_SALUTE_HOOK" }, (res) => {
        if (res.success) {
            navigator.clipboard.writeText(res.hook);
            log(`HOOK COPIED: "${res.hook}"`);
        } else log("Hook generation failed.", true);
    });
}