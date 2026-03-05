// background.js - Service Worker for tikkytokky extension
import { GeminiClient } from './lib/GeminiClient.js';

const gemini = new GeminiClient();

// Force side panel to open on action click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

// Force Injection Logic: Ensure content script is always running on TikTok tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('tiktok.com')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => console.log('Script already injected or error:', err));
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
