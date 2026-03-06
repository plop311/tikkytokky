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
        const prompt = "Return ONLY a raw JSON array of 3-5 objects with trendName, viralScore, and description. DO NOT include introductory text, conversational filler, or markdown formatting outside the JSON block. Example format: [{\"trendName\": \"Example\", \"viralScore\": 90, \"description\": \"Text\"}]";

        gemini.generateContent(prompt)
            .then(rawData => {
                sendResponse({ success: true, data: rawData });
            })
            .catch(err => {
                sendResponse({ success: false, error: err.message });
            });
        return true;
    }

    if (message.type === "SCRAPE_TREND_ASSETS") {
        const newAssets = [
            { id: `vid_${Date.now()}_1`, trend: message.trend, thumbnail: "https://placehold.co/100x150/050505/00F0FF?text=Asset+1", duration: 15, author: "ghost_bot", status: "QUEUED" },
            { id: `vid_${Date.now()}_2`, trend: message.trend, thumbnail: "https://placehold.co/100x150/050505/FF00FF?text=Asset+2", duration: 30, author: "aesthetic_vibe", status: "QUEUED" }
        ];

        chrome.storage.local.get(["videoVault"], (res) => {
            const currentVault = res.videoVault || [];
            const updatedVault = [...currentVault, ...newAssets]; // APPENDING HERE

            chrome.storage.local.set({ videoVault: updatedVault }, () => {
                console.log(`[VAULT] Appended assets for ${message.trend}. Total: ${updatedVault.length}`);
                sendResponse({ success: true });
            });
        });
        return true; // Keep channel open
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
