// sidepanel.js - Logic for tikkytokky extension UI

const XOR_KEY = "tikkytokky_secret_key";

function obfuscate(input) {
    let xorResult = "";
    for (let i = 0; i < input.length; i++) {
        xorResult += String.fromCharCode(input.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return btoa(xorResult);
}

/**
 * Appends a message to the debug logger.
 */
function log(msg) {
    const logger = document.getElementById('debug-logger');
    if (logger) {
        logger.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
        logger.scrollTop = logger.scrollHeight; // Auto-scroll to bottom
    }
    console.log(`[tikkytokky] ${msg}`);
}

document.addEventListener('DOMContentLoaded', () => {
    log("System Initializing & Wiring Buttons...");

    // Initial Health Check
    checkEngineHealth();

    // 1. Wire up buttons
    const refreshBtn = document.getElementById('refresh-trends');
    if (refreshBtn) refreshBtn.onclick = refreshTrends;

    const shotgunBtn = document.getElementById('shotgun-hashtags');
    if (shotgunBtn) shotgunBtn.onclick = shotgunHashtags;

    const initBtn = document.getElementById('init-engine');
    if (initBtn) initBtn.onclick = initializeEngine;

    const transformBtn = document.getElementById('transform-video');
    if (transformBtn) {
        transformBtn.onclick = startTransformation;
        transformBtn.disabled = true; // Start disabled
    }

    // 2. Settings Gear Toggle
    const gearBtn = document.getElementById('settings-gear');
    const settingsMenu = document.getElementById('settings-menu');
    if (gearBtn && settingsMenu) {
        gearBtn.onclick = () => {
            settingsMenu.classList.toggle('hidden');
            log("[UI] Settings menu toggled.");
        };
    }

    // 3. Key Saving Logic
    const saveKeysBtn = document.getElementById('save-keys');
    const keyInput = document.getElementById('key-input');
    if (saveKeysBtn && keyInput) {
        saveKeysBtn.onclick = saveKeys;
    }

    // 4. Initialize other UI components
    initTabs();
    initWarmUpToggle();
    updateStatusBar();
    refreshKeyList();

    // 5. Listen for storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local") {
            if (changes.apiKeys || changes.aiPersona) {
                updateStatusBar();
            }
            if (changes.apiKeys) {
                refreshKeyList();
            }
        }
    });
});

/**
 * Performs a PING handshake with the content script on the active TikTok tab.
 */
async function checkEngineHealth() {
    log("[SYSTEM] Checking Content Script Health...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.url || !activeTab.url.includes("tiktok.com")) {
            log("[SYSTEM] Not on TikTok. Handshake skipped.");
            return;
        }

        chrome.tabs.sendMessage(activeTab.id, { type: "PING" }, (response) => {
            if (chrome.runtime.lastError || !response || response.status !== "ALIVE") {
                log("[SYSTEM] Content Script not found. Injecting...");
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    files: ["content.js"]
                }, () => {
                    if (chrome.runtime.lastError) {
                        log("[SYSTEM] Injection failed: " + chrome.runtime.lastError.message);
                    } else {
                        log("[SYSTEM] Content Script injected successfully.");
                    }
                });
            } else {
                log("[SYSTEM] Handshake SUCCESS: Engine is ALIVE.");
            }
        });
    });
}

async function saveKeys() {
    const keyInput = document.getElementById('key-input');
    const text = keyInput.value.trim();
    if (!text) return;

    const newKeys = text.split("\n").map(k => k.trim()).filter(k => k);
    if (newKeys.length === 0) return;

    log(`[STORAGE] Adding ${newKeys.length} new keys.`);

    const obfuscatedNewKeys = newKeys.map(k => ({
        encryptedKey: obfuscate(k),
        isLimited: false,
        cooldownUntil: 0
    }));

    chrome.storage.local.get("apiKeys", async (res) => {
        const existingKeys = res.apiKeys || [];
        const updatedKeys = [...existingKeys, ...obfuscatedNewKeys];

        await chrome.storage.local.set({ apiKeys: updatedKeys });

        keyInput.value = "";
        log("[STORAGE] Keys saved successfully.");
    });
}

function refreshKeyList() {
    const keyList = document.getElementById('key-list');
    if (!keyList) return;

    chrome.storage.local.get("apiKeys", (res) => {
        const keys = res.apiKeys || [];
        keyList.innerHTML = "<strong>Active Keys:</strong><br>";
        if (keys.length === 0) {
            keyList.innerHTML += "No keys in pool.";
        } else {
            keys.forEach((k, index) => {
                const raw = deobfuscate(k.encryptedKey);
                const masked = raw.substring(0, 4) + "****" + raw.substring(raw.length - 4);
                keyList.innerHTML += `<div>${index + 1}: ${masked} ${k.isLimited ? '(Limited)' : ''}</div>`;
            });
        }
    });
}

function deobfuscate(input) {
    const decoded = atob(input);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
    }
    return result;
}

function initTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    function switchTab(target) {
        tabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        const targetBtn = document.querySelector(`[data-tab="${target}"]`);
        const targetContent = document.getElementById(target);

        if (targetBtn) targetBtn.classList.add("active");
        if (targetContent) targetContent.classList.add("active");
        log(`Switched to tab: ${target}`);
    }

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
}

function initWarmUpToggle() {
    const warmUpToggle = document.getElementById("warm-up-toggle");
    if (warmUpToggle) {
        warmUpToggle.addEventListener("change", () => {
            log(`Ghost Scroller ${warmUpToggle.checked ? 'ENABLED' : 'DISABLED'}`);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_WARM_UP", enabled: warmUpToggle.checked });
                }
            });
        });
    }
}

async function refreshTrends() {
    const list = document.getElementById("waves-list");
    list.innerHTML = '<div class="loader">Analyzing #MainCharacter Trends...</div>';
    log("[VE] Parsing Wave Data (Skipping Thoughts...)");

    chrome.runtime.sendMessage({ type: "GENERATE_WAVES", niche: "Main Character" }, (response) => {
        try {
            if (!response || !response.success) {
                log(`ERROR: ${response ? response.error : 'Empty response from background.'}`);
                list.innerHTML = `<p class="error">Error: ${response ? response.error : 'Empty response'}</p>`;
                return;
            }
            const parts = response.data.candidates?.[0]?.content?.parts || [];
            let jsonPart = null;
            parts.forEach(part => {
                if (part.thought) {
                    log(`Gemini Thought: ${part.text.substring(0, 70)}...`);
                } else if (!jsonPart) {
                    jsonPart = part;
                }
            });
            if (jsonPart) {
                const cleanedJson = jsonPart.text.replace(/```json|```/g, "").trim();
                log("Raw Response received. Length: " + cleanedJson.length);
                const waves = JSON.parse(cleanedJson);
                renderWaves(waves);
            } else {
                throw new Error("No valid JSON part found in Gemini response.");
            }
        } catch (err) {
            log(`CRITICAL ERROR during parse/render: ${err.message}`);
            list.innerHTML = `<p class="error">Critical Exception: ${err.message}</p>`;
        }
    });
}

function renderWaves(waves) {
    const list = document.getElementById("waves-list");
    list.innerHTML = "";
    log(`Rendering ${waves.length} viral waves.`);
    waves.forEach(wave => {
        const card = document.createElement("div");
        card.className = "glass-card";
        card.innerHTML = `
            <div class="card-header"><strong>${wave.trendName}</strong><span class="score">${wave.viralScore}%</span></div>
            <p class="desc">${wave.description}</p>
            <button class="automate-btn action-btn neon-blue" data-trend="${wave.trendName}">One-Tap Automate</button>
        `;
        list.appendChild(card);
    });
}

function shotgunHashtags() {
    log("Executing Hashtag Shotgun...");
    chrome.runtime.sendMessage({ type: "SHOTGUN_HASHTAGS" }, (response) => {
        if (response && response.hashtags) {
            navigator.clipboard.writeText(response.hashtags);
            const feedback = document.getElementById("shotgun-feedback");
            if (feedback) feedback.textContent = "Main Character cluster copied!";
            log("Hashtag cluster copied to clipboard.");
            setTimeout(() => { if (feedback) feedback.textContent = ""; }, 3000);
        }
    });
}

function initializeEngine() {
    log("[SYSTEM] Engine warming up...");
    chrome.runtime.sendMessage({ type: "INIT_TRANSFORM_ENGINE" });
    const transformBtn = document.getElementById('transform-video');
    if (transformBtn) {
        transformBtn.disabled = false;
        log("Transformation Engine ready. Button 4 enabled.");
    }
}

function startTransformation() {
    log("Requesting video transformation from WASM engine...");
    chrome.runtime.sendMessage({ type: "START_TRANSFORMATION" });
}

function updateStatusBar() {
    chrome.storage.local.get(["apiKeys", "aiPersona"], (res) => {
        const count = res.apiKeys ? res.apiKeys.length : 0;
        const keyStatus = document.getElementById("key-status");
        if (keyStatus) keyStatus.textContent = `Keys: ${count}`;
        const aiStatus = document.getElementById("ai-status");
        if (aiStatus && res.aiPersona) aiStatus.textContent = `AI: ${res.aiPersona}`;
    });
}
