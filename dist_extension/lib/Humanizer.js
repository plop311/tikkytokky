/**
 * Humanizer.js - Advanced Keystroke Biometrics and Natural Interactions
 * Ported from Android SocialInteractionManager.kt
 */

export class Humanizer {
    constructor() {
        this.lastJitterTime = 0;
    }

    /**
     * Simulates natural typing with Advanced Keystroke Biometrics.
     * Features: Gaussian flight time, dwell time simulation, fat-finger typos, and thinking pauses.
     */
    async humanoidType(text, element) {
        if (!element) return;

        let currentText = "";
        let typosCorrected = 0;
        let totalChars = 0;

        for (let char of text) {
            // Fat Finger Typo Logic (3% chance)
            if (Math.random() < 0.03 && /[a-zA-Z]/.test(char)) {
                const typo = this.getAdjacentKey(char);
                await this.simulateKeystroke(element, typo);

                await this.delay(this.getGaussianDelay(180, 250)); // Realization pause

                // Backspace simulation
                await this.simulateKeystroke(element, 'Backspace');
                typosCorrected++;

                await this.delay(this.getGaussianDelay(120, 180)); // Recovery pause
            }

            await this.simulateKeystroke(element, char);
            currentText += char;
            totalChars++;

            // Gaussian Flight Time delay (80ms - 250ms)
            await this.delay(this.getGaussianDelay(80, 250));

            // Thinking Pauses: 1.5s - 3s after sentences or every 50 characters
            if (/[.!?]/.test(char) || totalChars % 50 === 0) {
                console.log("[Humanizer] Thinking pause...");
                await this.delay(this.getRandomInt(1500, 3000));
            }

            // Periodic Mouse Jitter
            if (Date.now() - this.lastJitterTime > 30000) {
                this.simulateMouseJitter();
                this.lastJitterTime = Date.now();
            }
        }

        console.log(`[Humanizer] Typed ${totalChars} chars, corrected ${typosCorrected} typos.`);
    }

    async simulateKeystroke(element, char) {
        const dwellTime = this.getRandomInt(50, 100);

        element.dispatchEvent(new KeyboardEvent('keydown', { key: char }));
        await this.delay(dwellTime);

        if (char === 'Backspace') {
            if (element.value) element.value = element.value.slice(0, -1);
        } else if (char.length === 1) {
            element.value += char;
        }

        element.dispatchEvent(new KeyboardEvent('keyup', { key: char }));
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async naturalClick(element) {
        if (!element) return;

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.delay(this.getRandomInt(400, 800)); // Wait for scroll

        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + (Math.random() * 10 - 5);
        const y = rect.top + rect.height / 2 + (Math.random() * 10 - 5);

        console.log(`[Humanizer] Natural click at (${x}, ${y})`);

        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
        await this.delay(this.getRandomInt(60, 120));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
        element.click();
    }

    simulateMouseJitter() {
        const x = Math.random() * 5 - 2.5;
        const y = Math.random() * 5 - 2.5;
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: window.innerWidth / 2 + x, clientY: window.innerHeight / 2 + y }));
    }

    getGaussianDelay(min, max) {
        const mean = (min + max) / 2;
        const stdDev = (max - min) / 6;
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num * stdDev + mean;
        return Math.max(min, Math.min(max, num));
    }

    getAdjacentKey(char) {
        const adjacencyMap = {
            'q': "wa", 'w': "qeas", 'e': "wrsd", 'r': "etdf", 't': "ryfg",
            'y': "tugh", 'u': "yihj", 'i': "uojk", 'o': "ipkl", 'p': "ol",
            'a': "qwsz", 's': "awedxz", 'd': "serfcx", 'f': "drtgvc", 'g': "ftyhbv",
            'h': "gyujnb", 'j': "huikmn", 'k': "jiolm", 'l': "kop",
            'z': "asx", 'x': "zsdc", 'c': "xdfv", 'v': "cfgb", 'b': "vghn",
            'n': "bhjm", 'm': "njk"
        };
        const lower = char.toLowerCase();
        const adj = adjacencyMap[lower] || "asdf";
        const picked = adj[Math.floor(Math.random() * adj.length)];
        return char === char.toUpperCase() ? picked.toUpperCase() : picked;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
