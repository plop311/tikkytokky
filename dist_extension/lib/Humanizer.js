/**
 * Humanizer.js - Advanced Keystroke Biometrics and Natural Interactions
 * Ported from Android SocialInteractionManager.kt
 * Optimized for 2026 Anti-Detection (No-Backspace Protocol)
 */

export class Humanizer {
    constructor() {
        this.lastJitterTime = 0;
    }

    /**
     * Simulates natural typing with Advanced Keystroke Biometrics.
     * Logic: Gaussian flight time + biological flow state (accelerating on familiar patterns).
     */
    async humanoidType(text, element) {
        if (!element) return;

        let totalChars = 0;

        // Ensure element is focused before starting
        element.focus();

        for (let char of text) {
            /**
             * 🛠️ ANTI-BAN UPGRADE:
             * Skip intentional typos and backspacing to bypass rhythmic detection.
             * Focus strictly on randomizing flight-time between characters.
             */

            await this.simulateKeystroke(element, char);
            totalChars++;

            // Dynamic Delay: Humans type faster in the middle of words and slower at the start.
            let minDelay = 60;
            let maxDelay = 180;

            // Pause slightly longer on spaces (re-orienting fingers)
            if (char === " ") {
                minDelay = 150;
                maxDelay = 350;
            }

            // Gaussian Flight Time delay
            await this.delay(this.getGaussianDelay(minDelay, maxDelay));

            // Thinking Pauses: Mimicking "Brainrot" attention spans.
            // Occasionally pause after punctuation or long strings.
            if (/[.!?]/.test(char) || (totalChars > 5 && Math.random() < 0.05)) {
                const pauseTime = this.getRandomInt(800, 2200);
                console.log(`[Humanizer] Biological pause: ${pauseTime}ms`);
                await this.delay(pauseTime);
            }

            // Periodic Mouse Jitter (Passive interaction simulation)
            if (Date.now() - this.lastJitterTime > 25000) {
                this.simulateMouseJitter();
                this.lastJitterTime = Date.now();
            }
        }

        console.log(`[Humanizer] Sequence complete. Total Chars: ${totalChars}`);
    }

    async simulateKeystroke(element, char) {
        // Dwell Time: How long the "finger" stays on the key
        const dwellTime = this.getRandomInt(40, 95);

        const options = {
            key: char,
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true
        };

        element.dispatchEvent(new KeyboardEvent('keydown', options));

        // Biological hold-time
        await this.delay(dwellTime);

        /**
         * 2026 INJECTION METHOD:
         * We update the value directly but trigger the 'input' event
         * so the React/Vue listeners on TikTok see the change.
         */
        if (element.contentEditable === 'true') {
            // For contenteditable elements (TikTok comments)
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(char));
                range.collapse(false);
            } else {
                element.textContent += char;
            }
        } else {
            // For standard inputs
            element.value += char;
        }

        element.dispatchEvent(new KeyboardEvent('keyup', options));
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    async naturalClick(element) {
        if (!element) return;

        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await this.delay(this.getRandomInt(500, 1000)); // Wait for scroll alignment

        const rect = element.getBoundingClientRect();

        // Randomize coordinates within the element's hitbox
        const x = rect.left + rect.width / 2 + (Math.random() * (rect.width * 0.4) - (rect.width * 0.2));
        const y = rect.top + rect.height / 2 + (Math.random() * (rect.height * 0.4) - (rect.height * 0.2));

        console.log(`[Humanizer] Targeted click: (${Math.floor(x)}, ${Math.floor(y)})`);

        const clickOptions = { bubbles: true, clientX: x, clientY: y, view: window };

        element.dispatchEvent(new MouseEvent('mousedown', clickOptions));
        await this.delay(this.getRandomInt(70, 150));
        element.dispatchEvent(new MouseEvent('mouseup', clickOptions));
        element.click();
    }

    simulateMouseJitter() {
        const x = Math.random() * 10 - 5;
        const y = Math.random() * 10 - 5;
        window.dispatchEvent(new MouseEvent('mousemove', {
            clientX: window.innerWidth / 2 + x,
            clientY: window.innerHeight / 2 + y,
            bubbles: true
        }));
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}