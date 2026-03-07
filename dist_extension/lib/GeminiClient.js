// lib/GeminiClient.js - Logic for Gemini API interactions (Siligrave Protocol)

export class GeminiClient {
    constructor(xorKey = "tikkytokky_secret_key") {
        this.xorKey = xorKey;
    }

    deobfuscate(input) {
        const decoded = atob(input);
        let result = "";
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ this.xorKey.charCodeAt(i % this.xorKey.length));
        }
        return result;
    }

    /**
     * UPDATED: Integrated generationConfig for JSON Enforcement.
     * Forces the 3.1-Flash-Lite model to return strictly parseable payloads.
     */
    async generateContent(prompt, overrideKeyEncrypted = null) {
        let apiKey;

        if (overrideKeyEncrypted) {
            apiKey = this.deobfuscate(overrideKeyEncrypted);
        } else {
            const { apiKeys = [] } = await chrome.storage.local.get("apiKeys");
            const now = Date.now();
            const available = apiKeys.filter(k => !k.isLimited || now > (k.cooldownUntil || 0));
            if (available.length === 0) throw new Error("Key Pool Exhausted.");
            apiKey = this.deobfuscate(available[0].encryptedKey);
        }

        // Using 3.1-Flash-Lite-Preview for maximum RPD (Requests Per Day)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    // ADDED: Strict JSON output enforcement to kill "Parser failure" bugs
                    generationConfig: {
                        response_mime_type: "application/json"
                    }
                })
            });

            // Catch 401 (Invalid) and 429 (Rate Limit) before parsing JSON
            if (response.status === 401) throw new Error("INVALID_KEY");
            if (response.status === 429) throw new Error("RATE_LIMIT_HIT");

            const jsonResponse = await response.json();

            if (jsonResponse.error) {
                const status = jsonResponse.error.status;
                const msg = jsonResponse.error.message.toLowerCase();

                // 2026 Quota/Demand Error Detection
                if (status === "RESOURCE_EXHAUSTED" || msg.includes("quota") || msg.includes("limit") || msg.includes("demand")) {
                    throw new Error("RATE_LIMIT_HIT");
                }

                if (msg.includes("api key") || msg.includes("invalid")) {
                    throw new Error("INVALID_KEY");
                }

                throw new Error(jsonResponse.error.message);
            }

            return jsonResponse;

        } catch (err) {
            console.error(`[VE_CLIENT] ${err.message}`);
            throw err; // Signal to background.js to rotate
        }
    }

    async generateHook(context) {
        // UPGRADED: Prompt tuned for Roblox Slop/Brainrot niche
        const prompt = `Watching high-velocity Roblox/Minecraft parkour slop: "${context}".
        Write ONE short, engaging brainrot comment (maximalist zoomer humor, unfiltered lore).
        Return ONLY raw JSON: {"hook": "..."}`;
        return this.generateContent(prompt);
    }
}