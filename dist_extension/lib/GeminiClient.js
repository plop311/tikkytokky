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

        return JSON.parse(rawResponse);
    }

    async generateHook() {
        const prompt = `Generate a relatable, aesthetic hook for the #MainCharacter niche.
        Tone: Respectful Admiration.
        Focus: The 'Vibe' (lighting, mood, setting) rather than the individual.
        Format: One short sentence.`;
        const result = await this.generateContent(prompt);

        const parts = result.candidates?.[0]?.content?.parts || [];
        const textPart = parts.find(p => !p.thought) || parts[parts.length - 1];
        return (textPart?.text || "").replace(/```json|```/g, "").trim();
    }
}
