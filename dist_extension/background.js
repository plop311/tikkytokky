// background.js - tikkytokky Service Worker (Siligrave Protocol)
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

const PERSONA_VOICE = "Persona: randomgirlirl. Vibe: Aesthetic, #MainCharacter, romanticizing mundane life, unfiltered lore. ALWAYS output ONLY the requested data format.";

console.log("[SW_INIT] Tikkytokky Background Worker online.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`[SW_MSG_RECEIVED] Type: ${message.type}`);

    if (message.type === "GENERATE_WAVES") {
        console.log("[SW_GEMINI] Constructing Wave Prompt...");
        const prompt = `${PERSONA_VOICE}
        Find 3-5 high-velocity TikTok trends that fit this specific persona.
        Return ONLY a raw JSON array of objects.
        Example format:
        [{"trendName": "Silent Walking POV", "viralScore": 95, "description": "Romanticizing the mundane by walking with no music."}]
        No intro, no markdown, no explanation.`;

        console.log("[SW_GEMINI] Dispatching request to Gemini 3 Flash Preview...");
        gemini.generateContent(prompt)
            .then(data => {
                console.log("[SW_GEMINI] Response acquired successfully.");
                sendResponse({ success: true, data });
            })
            .catch(err => {
                console.error("[SW_GEMINI_ERROR] Request failed:", err.message);
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }

    if (message.type === "SCRAPE_TREND_ASSETS") {
        console.log(`[SW_STORAGE] Staging target assets for trend: ${message.trend}`);
        const newAssets = [{ id: `v_${Date.now()}`, trend: message.trend, thumbnail: `https://placehold.co/300x450/050505/00F0FF?text=randomgirlirl`, author: "ghost", status: "QUEUED" }];

        chrome.storage.local.get(["videoVault"], (res) => {
            const vault = res.videoVault || [];
            chrome.storage.local.set({ videoVault: [...vault, ...newAssets] }, () => {
                console.log(`[SW_STORAGE] Vault updated. Total assets: ${vault.length + 1}`);
                sendResponse({ success: true });
            });
        });
        return true;
    }

    if (message.type === "GENERATE_SALUTE_HOOK") {
        console.log("[SW_GEMINI] Constructing Hook Prompt...");
        const prompt = `${PERSONA_VOICE} Generate ONE short, viral, relatable hook line. OUTPUT ONLY THE TEXT. No thinking, no intro.`;

        gemini.generateContent(prompt).then(data => {
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const hook = raw.split('\n')[0].replace(/\*/g, '').replace(/"/g, '').trim();
            console.log(`[SW_GEMINI] Hook sanitized: "${hook}"`);
            sendResponse({ success: true, hook });
        }).catch(err => {
            console.error("[SW_GEMINI_ERROR] Hook generation failed:", err.message);
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }

    if (message.type === "EXECUTE_TYPO_TYPING") {
        console.log("[SW_HUMAN] Broadcasting TYPE command to active tab.");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "TYPE_HUMAN_TEXT", text: message.text });
                console.log(`[SW_HUMAN] Signal sent to tab: ${tabs[0].id}`);
            } else {
                 console.warn("[SW_HUMAN_WARN] No active tab found to receive typing command.");
            }
        });
        sendResponse({ success: true });
    }
});