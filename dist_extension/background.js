// background.js - tikkytokky Service Worker (Siligrave Protocol)
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

// REINFORCED PERSONA
const PERSONA_VOICE = "Persona: randomgirlirl. Vibe: Aesthetic, #MainCharacter, romanticizing mundane life, unfiltered lore. ALWAYS output ONLY the requested data format.";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GENERATE_WAVES") {
        const prompt = `${PERSONA_VOICE}
        Find 3-5 high-velocity TikTok trends that fit this specific persona.
        Return ONLY a raw JSON array of objects: [{ "trendName": string, "viralScore": number, "description": string }].
        No intro, no markdown, no explanation.`;

        gemini.generateContent(prompt)
            .then(data => sendResponse({ success: true, data }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message.type === "SCRAPE_TREND_ASSETS") {
        const newAssets = [{ id: `v_${Date.now()}`, trend: message.trend, thumbnail: `https://placehold.co/300x450/050505/00F0FF?text=randomgirlirl`, author: "ghost", status: "QUEUED" }];
        chrome.storage.local.get(["videoVault"], (res) => {
            const vault = res.videoVault || [];
            chrome.storage.local.set({ videoVault: [...vault, ...newAssets] }, () => sendResponse({ success: true }));
        });
        return true;
    }

    if (message.type === "GENERATE_SALUTE_HOOK") {
        const prompt = `${PERSONA_VOICE} Generate ONE short, viral, relatable hook line. OUTPUT ONLY THE TEXT. No thinking, no intro.`;
        gemini.generateContent(prompt).then(data => {
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            // Strip brainstorming and take only the first line
            const hook = raw.split('\n')[0].replace(/\*/g, '').replace(/"/g, '').trim();
            sendResponse({ success: true, hook });
        }).catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message.type === "EXECUTE_TYPO_TYPING") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, { type: "TYPE_HUMAN_TEXT", text: message.text });
        });
        sendResponse({ success: true });
    }
});