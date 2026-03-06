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
        const videoContext = message.context || "general aesthetic vibes";
        console.log(`[SW_GEMINI] Constructing Hook Prompt using context: "${videoContext.substring(0, 50)}..."`);

        const prompt = `${PERSONA_VOICE}
        You are watching a TikTok video with this description/hashtags: "${videoContext}"
        Write ONE short, relatable comment reacting to it.
        Return ONLY a raw JSON object.
        Example format: {"hook": "This is literally me."}
        No intro, no markdown, no explanation.`;

        gemini.generateContent(prompt).then(data => {
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            const match = raw.match(/\{[\s\S]*\}/);
            if (match) {
                try {
                    const parsed = JSON.parse(match[0]);

                    // RESILIENT PARSER: Grab the first value, regardless of what Gemini named the key
                    const finalHook = parsed.hook || parsed.comment || parsed.text || Object.values(parsed)[0];

                    if (!finalHook) throw new Error("Parsed JSON was empty");

                    console.log(`[SW_GEMINI] Hook sanitized: "${finalHook}"`);
                    sendResponse({ success: true, hook: finalHook });
                } catch (e) {
                    console.error("[SW_GEMINI_ERROR] JSON parse failed on hook payload.");
                    sendResponse({ success: false, error: "Parser failed." });
                }
            } else {
                 console.error("[SW_GEMINI_ERROR] Could not isolate JSON boundaries in hook payload.");
                 sendResponse({ success: false, error: "Boundary detection failed." });
            }
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