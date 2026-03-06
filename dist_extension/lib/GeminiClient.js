// lib/GeminiClient.js - Logic for Gemini API interactions

export class GeminiClient {
    constructor(xorKey = "tikkytokky_secret_key") {
        this.xorKey = xorKey;
        this.currentIndex = 0;
    }

    deobfuscate(input) {
        const decoded = atob(input);
        let result = "";
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ this.xorKey.charCodeAt(i % this.xorKey.length));
        }
        return result;
    }

    obfuscate(input) {
        let xorResult = "";
        for (let i = 0; i < input.length; i++) {
            xorResult += String.fromCharCode(input.charCodeAt(i) ^ this.xorKey.charCodeAt(i % this.xorKey.length));
        }
        return btoa(xorResult);
    }

    async getNextKey() {
        const { apiKeys = [] } = await chrome.storage.local.get("apiKeys");
        const now = Date.now();
        const availableKeys = apiKeys.filter(k => !k.isLimited || now > k.cooldownUntil);

        if (availableKeys.length === 0) return null;
        if (this.currentIndex >= availableKeys.length) this.currentIndex = 0;

        const selectedKey = availableKeys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % availableKeys.length;

        const rawKey = this.deobfuscate(selectedKey.encryptedKey);
        console.log(`[VE] Using key: ${rawKey.substring(0, 4)}****`);
        return rawKey;
    }

    async markKeyAsLimited(key) {
        const { apiKeys = [] } = await chrome.storage.local.get("apiKeys");
        const encrypted = this.obfuscate(key);
        const updatedKeys = apiKeys.map(k => {
            if (k.encryptedKey === encrypted) {
                return { ...k, isLimited: true, cooldownUntil: Date.now() + 60000 };
            }
            return k;
        });
        await chrome.storage.local.set({ apiKeys: updatedKeys });
    }

    /**
     * THE REPLACEMENT LOGIC (GeminiClient.js):
     * Returns the RAW response object. No parsing here.
     */
    async generateContent(prompt) {
        const apiKey = await this.getNextKey();
        if (!apiKey) throw new Error("No API keys available. Please add them in Settings.");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    thinking_level: "LOW"
                }
            })
        });

        if (response.status === 429) {
            await this.markKeyAsLimited(apiKey);
            return this.generateContent(prompt);
        }

        const rawResponse = await response.text();
        if (!rawResponse || rawResponse.trim() === "") {
            throw new Error("Received empty response from Gemini API.");
        }

        // Return the RAW object
        return JSON.parse(rawResponse);
    }

    async generateTrends() {
        const prompt = `Analyze high-velocity TikTok trends for the #MainCharacter niche.
        Return raw JSON array of 3-5 objects with trendName, viralScore (1-100), and description.
        Ensure hooks are relatable and aesthetic.`;
        return this.generateContent(prompt);
    }
}
