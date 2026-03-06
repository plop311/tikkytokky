// background.js - tikkytokky Service Worker (Siligrave Protocol)
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

// THE SINGLE SOURCE OF TRUTH: THE PERSONA
const PERSONA_VOICE = "Persona: randomgirlirl. Vibe: Aesthetic, #MainCharacter, romanticizing mundane life, unfiltered lore.";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`[NETWORK] Incoming Request: ${message.type}`);

    if (message.type === "GENERATE_WAVES") {
        const prompt = `${PERSONA_VOICE}
        Find 3-5 high-velocity TikTok trends that fit this specific persona.
        Return ONLY a raw JSON array of objects: { "trendName": string, "viralScore": number, "description": string }.
        NO intro text, NO markdown.`;

        console.log("[GEMINI] Dispatching Wave Request...");
        gemini.generateContent(prompt)
            .then(rawData => {
                console.log("[GEMINI] Payload Received successfully.");
                sendResponse({ success: true, data: rawData });
            })
            .catch(err => {
                console.error("[GEMINI] Crash detected:", err.message);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }

    if (message.type === "SCRAPE_TREND_ASSETS") {
        console.log(`[VAULT] Staging assets for: ${message.trend}`);

        const newAssets = [
            { id: `vid_${Date.now()}_1`, trend: message.trend, thumbnail: `https://placehold.co/300x450/050505/00F0FF?text=randomgirlirl+A`, author: "ghost_src", status: "QUEUED" },
            { id: `vid_${Date.now()}_2`, trend: message.trend, thumbnail: `https://placehold.co/300x450/050505/FF00FF?text=randomgirlirl+B`, author: "ghost_src", status: "QUEUED" }
        ];

        chrome.storage.local.get(["videoVault"], (res) => {
            const vault = res.videoVault || [];
            chrome.storage.local.set({ videoVault: [...vault, ...newAssets] }, () => {
                console.log("[STORAGE] Vault updated. Entry count:", vault.length + 2);
                sendResponse({ success: true });
            });
        });
        return true;
    }

    if (message.type === "GENERATE_SALUTE_HOOK") {
        const prompt = `${PERSONA_VOICE} Generate ONE short, viral, relatable line for a video. NO intro. NO quotes.`;

        gemini.generateContent(prompt)
            .then(data => {
                const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                const hook = raw.split('\n')[0].replace(/\*/g, '').replace(/"/g, '').trim();
                console.log("[GEMINI] Hook Generated:", hook);
                sendResponse({ success: true, hook });
            })
            .catch(err => {
                console.error("[GEMINI] Hook failure:", err.message);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }
});