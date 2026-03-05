// content.js - DOM Interactions for TikTok automation

console.log("[tikkytokky] Content script active on TikTok");

let warmUpInterval = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "AUTOMATE_REPLY") {
        handleAutomatedReply(message.text);
    }
    if (message.type === "SETUP_PROFILE") {
        handleProfileSetup(message.bio);
    }
    if (message.type === "GET_VIDEO_CREDIT") {
        const credit = autoCredit("");
        sendResponse({ credit });
    }
    if (message.type === "TOGGLE_WARM_UP") {
        handleWarmUp(message.enabled);
    }
});

/**
 * Implements the 'Humanized Scroll' sequence for account warming.
 */
function handleWarmUp(enabled) {
    if (!enabled) {
        console.log("[tikkytokky] Stealth Warm-Up deactivated.");
        if (warmUpInterval) clearInterval(warmUpInterval);
        warmUpInterval = null;
        return;
    }

    console.log("[tikkytokky] Stealth Warm-Up activated: Ghost Scroller running...");

    const runGhostScroll = () => {
        const scrollAmount = Math.floor(Math.random() * 300) + 100; // Variable scroll distance
        window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
        });

        // Schedule next scroll with random pause (2-7 seconds)
        const nextPause = Math.floor(Math.random() * 5000) + 2000;
        warmUpInterval = setTimeout(runGhostScroll, nextPause);
    };

    runGhostScroll();
}

/**
 * Scrapes the TikTok handle from the video element and returns the credit string.
 */
function autoCredit(caption) {
    const videoAuthor = document.querySelector('[data-e2e="video-author-uniqueid"]') ||
                        document.querySelector('.author-uniqueid') ||
                        document.querySelector('h3[data-e2e="video-author-uniqueid"]');

    const handle = videoAuthor ? videoAuthor.textContent.trim().replace('@', '') : "creator";
    const credit = `cc: @${handle}`;

    return caption ? `${caption} ${credit}` : credit;
}

async function handleAutomatedReply(text) {
    const commentBox = document.querySelector('[data-e2e="comment-input"]') ||
                       document.querySelector('.comment-inner-container contenteditable');

    if (!commentBox) {
        console.error("Comment box not found");
        return;
    }

    const finalReply = autoCredit(text);
    const { Humanizer } = await import(chrome.runtime.getURL('lib/Humanizer.js'));
    const humanizer = new Humanizer();

    console.log("Starting stealth reply with credit...");
    await humanizer.naturalClick(commentBox);
    await humanizer.humanoidType(finalReply, commentBox);

    const postBtn = document.querySelector('[data-e2e="comment-post"]');
    if (postBtn) {
        // await humanizer.naturalClick(postBtn);
    }
}

async function handleProfileSetup(bio) {
    if (!window.location.href.includes('/setting')) {
        window.location.href = 'https://www.tiktok.com/setting';
        return;
    }

    const waitForBio = setInterval(async () => {
        const bioField = document.querySelector('textarea[name="bio"]');
        if (bioField) {
            clearInterval(waitForBio);
            const { Humanizer } = await import(chrome.runtime.getURL('lib/Humanizer.js'));
            const humanizer = new Humanizer();

            await humanizer.naturalClick(bioField);
            bioField.value = "";
            await humanizer.humanoidType(bio, bioField);

            const saveBtn = document.querySelector('button[type="submit"]');
            if (saveBtn) await humanizer.naturalClick(saveBtn);
        }
    }, 1000);
}
