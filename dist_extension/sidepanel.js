// sidepanel.js - tikkytokky Pilot Mechanical Core (Manifest V3)

const XOR_KEY = "tikkytokky_secret_key";

// --- THE "TELL-ALL" LOGGER ---
function log(msg, isError = false) {
    const logger = document.getElementById('debug-logger');
    if (!logger) return;
    const color = isError ? '#ff4444' : '#00ff00';
    const timestamp = new Date().toLocaleTimeString();
    logger.innerHTML += `<div style="color: ${color}; margin-bottom: 4px;">[${timestamp}] ${msg}</div>`;
    logger.scrollTop = logger.scrollHeight;
    console.log(`[tikkytokky] ${msg}`);
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
    log("System Initializing... X-Ray Logs Active.");

    // 1. Mechanical Button Wiring - RESTORED FULLY
    const refreshBtn = document.getElementById('refresh-trends');
    if (refreshBtn) refreshBtn.onclick = refreshTrends;

    const shotgunBtn = document.getElementById('shotgun-hashtags');
    if (shotgunBtn) shotgunBtn.onclick = shotgunHashtags;

    const initBtn = document.getElementById('init-engine');
    if (initBtn) initBtn.onclick = initializeEngine;

    const transformBtn = document.getElementById('transform-video');
    if (transformBtn) {
        transformBtn.onclick = startTransformation;
        transformBtn.disabled = true;
    }

    // 2. Settings Gear & Key Vault - RESTORED FULLY
    const gearBtn = document.getElementById('settings-gear');
    if (gearBtn) gearBtn.onclick = toggleSettings;

    const saveBtn = document.getElementById('save-keys');
    if (saveBtn) saveBtn.onclick = saveKeys;

    const keyList = document.getElementById('key-list');
    if (keyList) keyList.addEventListener('click', handleKeyListActions);

    // 3. UI State Initialization
    initTabs();
    initWarmUpToggle();
    updateStatusBar();
    renderKeyList();
    renderVault();
    checkConnection();

    // 4. Persistence Listener
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local") {
            if (changes.apiKeys || changes.aiPersona) {
                updateStatusBar();
                if (changes.apiKeys) renderKeyList();
            }
            if (changes.videoVault) {
                renderVault();
            }
        }
    });
});

// --- CORE LOGIC ---

async function refreshTrends() {
    const list = document.getElementById("waves-list");
    if (!list) return;
    list.innerHTML = '<div class="loader">Scanning #MainCharacter Waves...</div>';

    try {
        log("📡 Calling Gemini 3 Flash v1beta...");
        chrome.runtime.sendMessage({ type: "GENERATE_WAVES" }, (response) => {
            try {
                if (!response || !response.success) {
                    log(`ERROR: ${response ? response.error : 'Empty response from background.'}`, true);
                    return;
                }

                // THE BULLETPROOF STRING CONVERSION
                const part = response.data.candidates?.[0]?.content?.parts?.[0] || {};
                const raw = part.text ? String(part.text) : JSON.stringify(part);

                log("🔍 Raw data captured. Performing Savage Extraction...");

                // THE SAVAGE PARSER: Greedy Slice to handle conversational chatter
                const start = raw.indexOf('[');
                const end = raw.lastIndexOf(']') + 1;

                if (start !== -1 && end > start) {
                    const cleanJson = raw.substring(start, end);
                    const trends = JSON.parse(cleanJson);
                    renderTrendCards(trends);
                    log("✅ Waves Synced.");
                } else {
                    log("📦 RAW DUMP: " + raw.substring(0, 100), true);
                    throw new Error("AI failed to provide a JSON array.");
                }

            } catch (err) {
                log("🚨 CRITICAL CRASH: " + err.stack, true);
                list.innerHTML = `<p class="error">Parser Crash. Check logs.</p>`;
            }
        });
    } catch (err) {
        log("🚨 CRITICAL CRASH: " + err.stack, true);
    }
}

// --- UPDATED AUTOMATE BUTTON LOGIC ---
function renderTrendCards(trends) {
    const list = document.getElementById("waves-list");
    if (!list) return;
    list.innerHTML = "";

    trends.forEach(t => {
        const card = document.createElement("div");
        card.className = "glass-card";
        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;">
                <strong>${t.trendName}</strong>
                <span>${t.viralScore}%</span>
            </div>
            <p style="font-size:11px;margin:8px 0;">${t.description}</p>
            <button class="action-btn btn-1 automate-wave-btn" data-trend="${t.trendName}">ONE-TAP AUTOMATE</button>
        `;
        list.appendChild(card);
    });

    // Re-attach listeners every time we render
    document.querySelectorAll('.automate-wave-btn').forEach(btn => {
        btn.onclick = async () => {
            const trend = btn.dataset.trend;
            btn.innerHTML = "SCRAPING...";
            btn.disabled = true;

            log(`[VAULT] Automating trend: ${trend}`);

            // Wait for background to finish before switching
            chrome.runtime.sendMessage({ type: "SCRAPE_TREND_ASSETS", trend: trend }, (res) => {
                if (res && res.success) {
                    switchTab("vault");
                } else {
                    log("🚨 Scrape failed.", true);
                    btn.innerHTML = "ONE-TAP AUTOMATE";
                    btn.disabled = false;
                }
            });
        };
    });
}

/**
 * VAULT UI: Renders grid of thumbnails from storage.
 */
async function renderVault() {
    const list = document.getElementById('vault-list');
    if (!list) return;

    const res = await chrome.storage.local.get("videoVault");
    const assets = res.videoVault || [];

    if (assets.length === 0) {
        list.innerHTML = '<p class="empty-msg">No assets in vault. Automate a wave to begin.</p>';
        return;
    }

    list.innerHTML = "";
    assets.forEach(asset => {
        const item = document.createElement("div");
        item.className = "vault-item";
        item.innerHTML = `
            <div class="vault-status">${asset.status}</div>
            <img src="${asset.thumbnail}" alt="Thumbnail">
            <div style="padding: 5px;">
                <div style="font-size: 10px; color: white;">@${asset.author}</div>
                <div style="font-size: 9px; color: #888;">${asset.duration}s</div>
            </div>
            <button class="purge-btn" data-id="${asset.id}">PURGE</button>
        `;
        list.appendChild(item);
    });

    // Add purge listeners
    document.querySelectorAll('.purge-btn').forEach(btn => {
        btn.onclick = async () => {
            const id = btn.dataset.id;
            const updated = assets.filter(a => a.id !== id);
            await chrome.storage.local.set({ videoVault: updated });
            log(`[VAULT] Item ${id} purged.`);
        };
    });
}

// --- UTILS ---

/**
 * RESTORE KEY VAULT LOGIC: APPEND ONLY
 */
async function saveKeys() {
    const keyInput = document.getElementById('key-input');
    if (!keyInput) return;
    const text = keyInput.value.trim();
    if (!text) return;

    const newKeysRaw = text.split(/\r?\n/).map(k => k.trim()).filter(k => k);
    if (newKeysRaw.length === 0) return;

    log(`[VAULT] Appending ${newKeysRaw.length} keys...`);

    const obfuscatedNewKeys = newKeysRaw.map(k => ({
        encryptedKey: obfuscate(k),
        isLimited: false,
        cooldownUntil: 0
    }));

    // CRITICAL: Fetch first, then push, then set using Spread Operator to avoid overwriting existing data.
    chrome.storage.local.get(['apiKeys'], async (res) => {
        const existingKeys = res.apiKeys || [];
        const updatedKeys = [...existingKeys, ...obfuscatedNewKeys];
        await chrome.storage.local.set({ apiKeys: updatedKeys });

        keyInput.value = "";
        log("[VAULT] Save Complete. Pool updated.");
    });
}

/**
 * Handles clicks for Edit/Delete buttons in the key list.
 */
async function handleKeyListActions(e) {
    const index = parseInt(e.target.dataset.index);
    if (isNaN(index)) return;

    const res = await chrome.storage.local.get(['apiKeys']);
    let keys = res.apiKeys || [];

    if (e.target.classList.contains('delete-btn')) {
        keys.splice(index, 1);
        await chrome.storage.local.set({ apiKeys: keys });
        log("Key Deleted.");
    } else if (e.target.classList.contains('edit-btn')) {
        const keyToEdit = keys[index];
        const input = document.getElementById('key-input');
        if (input) {
            input.value = deobfuscate(keyToEdit.encryptedKey);
            keys.splice(index, 1);
            await chrome.storage.local.set({ apiKeys: keys });
            log("[UI] Key moved to input for edit.");
        }
    }
}

function toggleSettings() {
    const menu = document.getElementById('settings-menu');
    if (menu) {
        const isHidden = (menu.style.display === 'none' || menu.classList.contains('hidden'));
        menu.style.display = isHidden ? 'block' : 'none';
        menu.classList.toggle('hidden', !isHidden);
        log(`[UI] Settings toggled.`);
    }
}

/**
 * RENDERS THE LIST OF KEYS WITH EDIT/DELETE BUTTONS.
 */
function renderKeyList() {
    const keyList = document.getElementById('key-list');
    if (!keyList) return;
    chrome.storage.local.get(['apiKeys'], (res) => {
        const keys = res.apiKeys || [];
        keyList.innerHTML = `<strong>${keys.length} Active Keys:</strong>`;
        keys.forEach((k, i) => {
            const raw = deobfuscate(k.encryptedKey);
            const masked = raw.substring(0, 4) + "****" + raw.substring(raw.length - 4);
            keyList.innerHTML += `
                <div class="key-item" style="display:flex; justify-content:space-between; align-items:center; margin-top:4px; font-size:10px;">
                    <span>${i + 1}: ${masked}</span>
                    <div>
                        <button class="edit-btn action-btn" data-index="${i}" style="padding:2px 4px; font-size:8px; width: auto; margin: 0 2px;">EDIT</button>
                        <button class="delete-btn action-btn" data-index="${i}" style="padding:2px 4px; font-size:8px; background:red; width: auto; margin: 0;">DEL</button>
                    </div>
                </div>`;
        });
    });
}

// --- THE IMMORTAL TAB SWITCHER ---
function switchTab(target) {
    const containers = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-btn");

    containers.forEach(c => {
        c.style.setProperty("display", "none", "important"); // Bypass CSS specificity conflicts
        c.classList.remove("active");
    });
    buttons.forEach(b => b.classList.remove("active"));

    const activeContent = document.getElementById(target);
    const activeBtn = document.querySelector(`[data-tab="${target}"]`);

    if (activeContent && activeBtn) {
        activeContent.style.setProperty("display", "block", "important");
        activeContent.classList.add("active");
        activeBtn.classList.add("active");

        // TRIGGER RENDERS ON SWITCH
        if (target === "vault") renderVault();
        if (target === "waves") updateStatusBar();

        log(`[SYSTEM] Navigation: ${target.toUpperCase()}`);
    }
}

function initTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
    });
}

function initWarmUpToggle() {
    const warmUpToggle = document.getElementById("warm-up-toggle");
    if (warmUpToggle) {
        warmUpToggle.onchange = () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_WARM_UP", enabled: warmUpToggle.checked });
            });
        };
    }
}

function updateStatusBar() {
    chrome.storage.local.get(["apiKeys"], (res) => {
        const el = document.getElementById("key-status");
        if (el) el.textContent = `Keys: ${res.apiKeys?.length || 0}`;
    });
}

function checkConnection() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.url?.includes("tiktok.com")) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "PING" }, (res) => {
                if (chrome.runtime.lastError || !res) log("⚠️ CLK ICON TO START", true);
                else log("✅ Bridge Active.");
            });
        }
    });
}

function initializeEngine() {
    log("[SYSTEM] Engine warming up...");
    const transformBtn = document.getElementById('transform-video');
    if (transformBtn) {
        transformBtn.disabled = false;
        log("[SYSTEM] Button 4 UNLOCKED.");
    }
}

function startTransformation() {
    log("Executing Transformation...");
    chrome.runtime.sendMessage({ type: "START_TRANSFORMATION" });
}
