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
        return this.deobfuscate(selectedKey.encryptedKey);
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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (response.status === 429) {
            await this.markKeyAsLimited(apiKey);
            return this.generateContent(prompt);
        }

        // FIX: Use text() and check if empty before parsing
        const rawResponse = await response.text();
        if (!rawResponse || rawResponse.trim() === "") {
            throw new Error("Received empty response from Gemini API.");
        }

        const data = JSON.parse(rawResponse);

        // Gemini G3 Flash Alignment: Extract the last part (final JSON string)
        const parts = data.candidates?.[0]?.content?.parts || [];
        if (parts.length === 0) {
            throw new Error("Gemini response contains no content parts.");
        }

        const lastPart = parts[parts.length - 1];
        const text = lastPart?.text || "";

        // Clean markdown if present
        return text.replace(/```json|```/g, "").trim();
    }

    async generateHook() {
        const prompt = `Generate a relatable, aesthetic hook for the #MainCharacter niche.
        Tone: Respectful Admiration.
        Focus: The 'Vibe' (lighting, mood, setting) rather than the individual.
        Format: One short sentence.`;
        return this.generateContent(prompt);
    }
}
