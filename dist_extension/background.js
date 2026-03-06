// background.js - tikkytokky Service Worker (Siligrave Protocol)
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // 1. WAVE GENERATION
    if (message.type === "GENERATE_WAVES") {
        const prompt = `Return ONLY a raw JSON array of 3-5 objects with trendName, viralScore, and description.
        Focus on #MainCharacter and #Aesthetic. No intro text.`;

        gemini.generateContent(prompt)
            .then(rawData => sendResponse({ success: true, data: rawData }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    // 2. VAULT ASSET STAGING
    if (message.type === "SCRAPE_TREND_ASSETS") {
        const newAssets = [
            { id: `v_${Date.now()}_1`, trend: message.trend, thumbnail: `https://placehold.co/300x450/050505/00F0FF?text=${encodeURIComponent(message.trend)}+1`, author: "ghost_bot", status: "QUEUED" },
            { id: `vid_${Date.now()}_2`, trend: message.trend, thumbnail: `https://placehold.co/300x450/050505/FF00FF?text=${encodeURIComponent(message.trend)}+2`, author: "aesthetic_vibe", status: "QUEUED" }
        ];

        chrome.storage.local.get(["videoVault"], (res) => {
            const vault = res.videoVault || [];
            chrome.storage.local.set({ videoVault: [...vault, ...newAssets] }, () => {
                sendResponse({ success: true });
            });
        });
        return true;
    }

    // 3. VIRAL HOOK GENERATOR (The "Drunk AI" Fix)
    if (message.type === "GENERATE_SALUTE_HOOK") {
        const prompt = "OUTPUT ONLY ONE VIRAL HOOK. NO intro, NO explanation, NO quotes. Niche: #MainCharacter. Example: POV: You stopped acting like a side character.";

        gemini.generateContent(prompt)
            .then(data => {
                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

                // SAVAGE CLEANUP: Grab the first line, strip stars, and trim
                const cleanHook = rawText.split('\n')[0].replace(/\*/g, '').replace(/"/g, '').trim();

                sendResponse({ success: true, hook: cleanHook });
            })
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    // 4. TRANSFORMATION BRIDGE
    if (message.type === "START_TRANSFORMATION") {
        console.log("[ENGINE] Bitstream Randomization sequence initiated.");
        sendResponse({ success: true });
    }
});