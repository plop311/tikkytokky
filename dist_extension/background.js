// background.js - tikkytokky Service Worker (Siligrave Protocol)
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();

// Force side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

// Tab Update Listener
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === 'complete' && tab.url?.includes('tiktok.com')) {
        console.log('[SYSTEM] TikTok detected. Bridge active.');
    }
});

// Message Hub
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // 1. WAVE GENERATION (Gemini 3 Flash)
    if (message.type === "GENERATE_WAVES") {
        const prompt = `Return ONLY a raw JSON array of 3-5 objects with trendName, viralScore (1-100), and description.
        Focus on #MainCharacter and #Aesthetic niches for 2026.
        Example: [{"trendName": "Example", "viralScore": 95, "description": "Text"}]`;

        gemini.generateContent(prompt)
            .then(rawData => sendResponse({ success: true, data: rawData }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    // 2. THE VAULT SCRAPER (Append Logic)
    if (message.type === "SCRAPE_TREND_ASSETS") {
        console.log(`[VAULT] Scoping assets for trend: ${message.trend}`);

        // In a production environment, this would call a TikTok Research API or Scraper.
        // For now, we generate high-fidelity 'Target' metadata for the engine.
        const newAssets = [
            {
                id: `v_${Date.now()}_1`,
                trend: message.trend,
                thumbnail: `https://placehold.co/300x450/050505/00F0FF?text=${encodeURIComponent(message.trend)}+1`,
                author: "aesthetic_ghost",
                duration: 15,
                status: "QUEUED"
            },
            {
                id: `vid_${Date.now()}_2`,
                trend: message.trend,
                thumbnail: `https://placehold.co/300x450/050505/FF00FF?text=${encodeURIComponent(message.trend)}+2`,
                author: "pixel_vault",
                duration: 22,
                status: "QUEUED"
            }
        ];

        chrome.storage.local.get(["videoVault"], (res) => {
            const currentVault = res.videoVault || [];
            const updatedVault = [...currentVault, ...newAssets]; // STRICT APPEND

            chrome.storage.local.set({ videoVault: updatedVault }, () => {
                console.log(`[VAULT] 2 Assets added. Total in storage: ${updatedVault.length}`);
                sendResponse({ success: true, count: updatedVault.length });
            });
        });
        return true;
    }

    // 3. ENGINE INITIALIZATION
    if (message.type === "START_TRANSFORMATION") {
        console.log("[ENGINE] Bitstream Randomization sequence initiated.");
        // This will eventually bridge to the WASM/Hybrid Engine for frame-by-frame FX
        sendResponse({ success: true });
    }

    // 4. UTILS
    if (message.type === "SHOTGUN_HASHTAGS") {
        const hashtags = "#maincharacter #aesthetic #lore #pov #2026vibes #cinematic #lifestyle";
        sendResponse({ hashtags });
    }
});