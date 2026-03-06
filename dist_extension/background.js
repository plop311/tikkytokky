// background.js - tikkytokky Service Worker (Siligrave Protocol)
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

const PERSONA = "randomgirlirl. Vibe: Aesthetic, #MainCharacter, romanticizing mundane life.";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GENERATE_WAVES") {
        const prompt = `${PERSONA} Find 3-5 high-velocity TikTok trends. Return ONLY raw JSON array.`;
        gemini.generateContent(prompt)
            .then(data => sendResponse({ success: true, data }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message.type === "SCRAPE_TREND_ASSETS") {
        const newAssets = [{ id: `v_${Date.now()}`, trend: message.trend, thumbnail: `https://placehold.co/300x450/050505/00F0FF?text=Asset`, author: "ghost", status: "QUEUED" }];
        chrome.storage.local.get(["videoVault"], (res) => {
            const vault = res.videoVault || [];
            chrome.storage.local.set({ videoVault: [...vault, ...newAssets] }, () => sendResponse({ success: true }));
        });
        return true;
    }

    if (message.type === "GENERATE_SALUTE_HOOK") {
        const prompt = `${PERSONA} Generate ONE viral, relatable hook line. NO intro.`;
        gemini.generateContent(prompt).then(data => {
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            sendResponse({ success: true, hook: raw.split('\n')[0].replace(/\*/g, '').trim() });
        }).catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
});