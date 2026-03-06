// background.js - tikkytokky Service Worker (Siligrave Protocol)
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

const PERSONA_VOICE = "Persona: randomgirlirl. Vibe: Aesthetic, #MainCharacter, romanticizing mundane life, unfiltered lore.";

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

        gemini.generateContent(prompt)
            .then(data => {
                console.log("[SW_GEMINI] Response acquired successfully.");
                sendResponse({ success: true, data });
            })
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
        console.log("[SW_GEMINI] Constructing Hook Prompt...");

        // THE STRICT KILL-SWITCH
        const prompt = `${PERSONA_VOICE}
        Generate ONE short, viral, relatable hook line.
        CRITICAL RULES:
        1. DO NOT say "My Viral Hook Thoughts" or anything similar.
        2. DO NOT output conversational text or explanations.
        3. OUTPUT EXACTLY ONE SENTENCE. NOTHING ELSE.
        Example: The sudden urge to romanticize a random Tuesday.`;

        gemini.generateContent(prompt).then(data => {
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const hook = raw.split('\n')[0].replace(/\*/g, '').replace(/"/g, '').trim();
            console.log(`[SW_GEMINI] Hook sanitized: "${hook}"`);
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