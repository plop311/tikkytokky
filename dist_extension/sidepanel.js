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
        const entry = document.createElement('div');
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        logger.appendChild(entry);
        logger.scrollTop = logger.scrollHeight;
    }
    console.log(`[tikkytokky] ${msg}`);
}

document.addEventListener("DOMContentLoaded", () => {
    log("System Initializing...");
    initTabs();
    initSettings();
    initWaves();
    initSocial();
    initTransform();
    initGlobalUI();
    updateStatusBar();

    // Listen for storage changes to update UI immediately
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && (changes.apiKeys || changes.aiPersona)) {
            updateStatusBar();
        }
    });
});

function initGlobalUI() {
    const toggleBtn = document.getElementById("toggle-settings-ui");
    const settingsPanel = document.getElementById("key-settings-panel");

    if (toggleBtn && settingsPanel) {
        toggleBtn.addEventListener("click", () => {
            const isHidden = settingsPanel.style.display === "none";
            settingsPanel.style.display = isHidden ? "block" : "none";
        });
    }
}

// Tab Navigation
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

// Settings Logic
function initSettings() {
    const saveBtn = document.getElementById("save-keys");
    const keysInput = document.getElementById("api-keys-input");
    const personaSelect = document.getElementById("persona-select");
    const settingsPanel = document.getElementById("key-settings-panel");

    if (!saveBtn || !keysInput) {
        console.warn("[tikkytokky] Critical settings elements not found");
        return;
    }

    // Load existing settings
    chrome.storage.local.get(["apiKeys", "aiPersona"], (res) => {
        if (res.apiKeys && res.apiKeys.length > 0) {
            document.getElementById("key-status").textContent = `Keys: ${res.apiKeys.length}`;
            if (settingsPanel) settingsPanel.style.display = "none";
        } else {
            if (settingsPanel) settingsPanel.style.display = "block";
        }

        if (res.aiPersona && personaSelect) personaSelect.value = res.aiPersona;
    });

    saveBtn.addEventListener("click", async () => {
        const lines = keysInput.value.split("\n").map(k => k.trim()).filter(k => k);
        if (lines.length === 0) return;

        log(`Adding ${lines.length} new keys to the pool.`);
        const obfuscatedKeys = lines.map(k => ({
            encryptedKey: obfuscate(k),
            isLimited: false,
            cooldownUntil: 0
        }));

        const { apiKeys = [] } = await chrome.storage.local.get("apiKeys");
        await chrome.storage.local.set({ apiKeys: [...apiKeys, ...obfuscatedKeys] });

        keysInput.value = "";
        log("API Keys updated successfully.");

        if (settingsPanel) settingsPanel.style.display = "none";
    });

    if (personaSelect) {
        personaSelect.addEventListener("change", () => {
            log(`Updating AI Persona to: ${personaSelect.value}`);
            chrome.storage.local.set({ aiPersona: personaSelect.value });
        });
    }
}

// Waves Logic
function initWaves() {
    const refreshBtn = document.getElementById("refresh-waves");
    const list = document.getElementById("waves-list");
    const warmUpToggle = document.getElementById("warm-up-toggle");

    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            refreshTrends();
        });
    }

    if (warmUpToggle) {
        warmUpToggle.addEventListener("change", () => {
            log(`Ghost Scroller ${warmUpToggle.checked ? 'ENABLED' : 'DISABLED'}`);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: "TOGGLE_WARM_UP",
                        enabled: warmUpToggle.checked
                    });
                }
            });
        });
    }
}

async function refreshTrends() {
    const list = document.getElementById("waves-list");
    list.innerHTML = '<div class="loader">Analyzing #MainCharacter Trends...</div>';
    log("Requesting trend analysis from Gemini G3 Flash...");

    chrome.runtime.sendMessage({ type: "GENERATE_WAVES", niche: "Main Character" }, (response) => {
        try {
            if (!response) {
                log("ERROR: Received empty response from background.");
                list.innerHTML = `<p class="error">Error: Empty response</p>`;
                return;
            }

            if (response.success) {
                if (response.data) {
                    const rawString = JSON.stringify(response.data);
                    log("Raw Response received. Length: " + rawString.length);
                    renderWaves(response.data);
                } else {
                    log("ERROR: Received empty trend data.");
                    list.innerHTML = `<p class="error">Error: Received empty trend data.</p>`;
                }
            } else {
                log(`ERROR: ${response.error}`);
                list.innerHTML = `<p class="error">Error: ${response.error}</p>`;
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
            <div class="card-header">
                <strong>${wave.trendName}</strong>
                <span class="score">${wave.viralScore}%</span>
            </div>
            <p class="desc">${wave.description}</p>
            <button class="automate-btn action-btn neon-cyan" data-trend="${wave.trendName}">One-Tap Automate</button>
        `;
        list.appendChild(card);
    });
}

// Social Logic
function initSocial() {
    const shotgunBtn = document.getElementById("shotgun-btn");
    const feedback = document.getElementById("shotgun-feedback");

    if (shotgunBtn) {
        shotgunBtn.addEventListener("click", () => {
            log("Executing Hashtag Shotgun...");
            chrome.runtime.sendMessage({ type: "SHOTGUN_HASHTAGS" }, (response) => {
                if (response && response.hashtags) {
                    navigator.clipboard.writeText(response.hashtags);
                    feedback.textContent = "Main Character cluster copied!";
                    log("Hashtag cluster copied to clipboard.");
                    setTimeout(() => feedback.textContent = "", 3000);
                }
            });
        });
    }
}

// Transform Logic
function initTransform() {
    const transformBtn = document.getElementById("transform-btn");
    if (transformBtn) {
        transformBtn.addEventListener("click", () => {
            log("Initializing WASM Transformation Engine...");
            chrome.runtime.sendMessage({ type: "INIT_TRANSFORM_ENGINE" });
        });
    }
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
