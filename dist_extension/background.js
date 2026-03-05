// background.js - Service Worker for tikkytokky extension
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();

// Force side panel to open on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

// Log when a TikTok tab is detected
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === 'complete' && tab.url?.includes('tiktok.com')) {
      console.log('TikTok detected, bridge active.');
    }
 });

// Manual Override: Force inject content script when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    if (tab.url?.includes("tiktok.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        }).then(() => {
            console.log("[VE] Manual override: Content script injected.");
        }).catch(err => console.error("[VE] Manual injection failed:", err));
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GENERATE_WAVES") {
        const niche = message.niche || "Main Character";
        const prompt = `Analyze high-velocity TikTok trends for the #MainCharacter niche.
        Return raw JSON array of 3-5 objects with trendName, viralScore (1-100), and description.
        Ensure hooks are relatable and aesthetic.`;

        gemini.generateContent(prompt)
            .then(text => {
                const cleanedText = text.replace(/```json|```/g, "").trim();
                sendResponse({ success: true, data: JSON.parse(cleanedText) });
            })
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }

    if (message.type === "SHOTGUN_HASHTAGS") {
        const hashtags = "#maincharacter #pov #aesthetic #2026vibes #cinematic #lifestyle #lore #canonevent #unfiltered #corecore";
        sendResponse({ hashtags });
    }

    if (message.type === "GENERATE_SALUTE_HOOK") {
        gemini.generateHook()
            .then(hook => sendResponse({ success: true, hook }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
});
