// background.js - tikkytokky Service Worker (Siligrave Protocol)
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GENERATE_WAVES") {
        const prompt = `Return ONLY a raw JSON array of 3-5 objects with trendName, viralScore, and description.`;
        gemini.generateContent(prompt)
            .then(rawData => sendResponse({ success: true, data: rawData }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message.type === "SCRAPE_TREND_ASSETS") {
        const newAssets = [
            { id: `v_${Date.now()}_1`, trend: message.trend, thumbnail: "https://placehold.co/300x450/050505/00F0FF?text=Asset+1", author: "ghost_bot", status: "QUEUED" },
            { id: `vid_${Date.now()}_2`, trend: message.trend, thumbnail: "https://placehold.co/300x450/050505/FF00FF?text=Asset+2", author: "aesthetic_vibe", status: "QUEUED" }
        ];

        chrome.storage.local.get(["videoVault"], (res) => {
            const vault = res.videoVault || [];
            chrome.storage.local.set({ videoVault: [...vault, ...newAssets] }, () => {
                sendResponse({ success: true });
            });
        });
        return true;
    }

    if (message.type === "GENERATE_SALUTE_HOOK") {
        const prompt = "Generate a short, viral, relatable TikTok hook for #MainCharacter niche. Text only.";
        gemini.generateContent(prompt)
            .then(data => {
                const hook = data.candidates?.[0]?.content?.parts?.[0]?.text || "Pov: You're the plot armor.";
                sendResponse({ success: true, hook: hook.replace(/"/g, '') });
            })
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
});