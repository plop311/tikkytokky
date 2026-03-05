package com.benko.tikkytokky.data.social

import android.os.SystemClock
import android.util.Log
import android.view.InputDevice
import android.view.MotionEvent
import com.benko.tikkytokky.data.local.SettingsManager
import com.benko.tikkytokky.data.remote.Content
import com.benko.tikkytokky.data.remote.GeminiApi
import com.benko.tikkytokky.data.remote.GeminiRequest
import com.benko.tikkytokky.data.remote.Part
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlin.random.Random
import java.util.Random as JRandom

class SocialInteractionManager(
    private val geminiApi: GeminiApi,
    private val settingsManager: SettingsManager
) {

    private var lastActionTimestamp: Long = 0
    private var lastJitterTime: Long = 0
    private val ACTION_COOLDOWN_MS = 90_000L // 90 seconds anti-ban throttle
    private val jRandom = JRandom()

    /**
     * Analyzes a list of comments and generates a contextual, mood-specific reply.
     * Refactored to adopt the Gen Z nostalgia growth hacker persona.
     */
    suspend fun analyzeThreadAndReply(comments: List<String>): String {
        val mood = settingsManager.mood.first()
        val persona = settingsManager.aiPersona.first()
        val isActivePersona = settingsManager.activePersonaMode.first()

        if (!isActivePersona) return ""

        val threadContext = comments.joinToString("\n") { "- $it" }
        val prompt = """
            Persona: $persona (Gen Z nostalgia growth hacker)
            Current Mood: $mood
            Focus: 2005-2015 "Glitch-Tech" (Limewire, MySpace, early YouTube, etc.)
            
            Analyze the following video comment thread and generate a human-like, contextual reply.
            The reply should reference previous comments if appropriate and maintain the specified mood.
            Use casual, nostalgic language optimized for growth. Reference specific cultural milestones if they fit.
            Avoid generic "bot-speak".
            
            Thread:
            $threadContext
            
            Reply:
        """.trimIndent()

        return try {
            val response = geminiApi.generateContent(
                request = GeminiRequest(
                    contents = listOf(Content(parts = listOf(Part(text = prompt))))
                )
            )
            response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: ""
        } catch (e: Exception) {
            "tbh that era was just different 💀 (Error: AI logic failed)"
        }
    }

    /**
     * Detects if a user is within the app's targeted niche and follows if appropriate.
     */
    suspend fun smartFollow(userBio: String, userRecentContent: String): Boolean {
        val niche = settingsManager.targetNiche.first()
        val currentTime = System.currentTimeMillis()

        // Anti-ban throttling
        if (currentTime - lastActionTimestamp < ACTION_COOLDOWN_MS) {
            return false
        }

        val prompt = """
            Target Niche: $niche (Focus on 2005-2015 Nostalgia/Glitch-Tech)
            User Bio: $userBio
            User Recent Content Keywords: $userRecentContent
            
            Determine if this user belongs to the target niche. 
            Return only 'YES' or 'NO'.
        """.trimIndent()

        val isTarget = try {
            val response = geminiApi.generateContent(
                request = GeminiRequest(
                    contents = listOf(Content(parts = listOf(Part(text = prompt))))
                )
            )
            val result = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text?.trim()?.uppercase()
            result == "YES"
        } catch (e: Exception) {
            false
        }

        if (isTarget) {
            lastActionTimestamp = currentTime
            return true
        }
        return false
    }

    /**
     * Simulates natural typing with Advanced Keystroke Biometrics (The Ghost Typist).
     * Features: Gaussian flight time, dwell time simulation, fat-finger typos, and thinking pauses.
     */
    suspend fun humanoidType(
        text: String, 
        onCharTyped: (String) -> Unit,
        onKeystrokeAction: (String) -> Unit = {}
    ) {
        var currentText = ""
        var typosCorrected = 0
        var totalChars = 0

        for (char in text) {
            // Fat Finger Typo Logic (3% chance)
            if (Random.nextFloat() < 0.03f && char.isLetter()) {
                val typo = getAdjacentKey(char)
                simulateKeystroke(onKeystrokeAction)
                onCharTyped(currentText + typo)
                
                delay(getGaussianDelay(180, 250)) // Realization pause
                
                // Backspace simulation
                simulateKeystroke(onKeystrokeAction)
                onCharTyped(currentText)
                typosCorrected++
                
                delay(getGaussianDelay(120, 180)) // Recovery pause
            }

            simulateKeystroke(onKeystrokeAction)
            currentText += char
            onCharTyped(currentText)
            totalChars++

            // Gaussian Flight Time delay (80ms - 250ms)
            delay(getGaussianDelay(80, 250))

            // Thinking Pauses: 1.5s - 3s after sentences or every 50 characters
            if (char in ".!?" || totalChars % 50 == 0) {
                onKeystrokeAction("Thinking pause...")
                delay(Random.nextLong(1500, 3000))
            }
        }
        
        // Siligrave Protocol Logging
        Log.i("Siligrave", "[Humanizer] Typed $totalChars chars, corrected $typosCorrected typos.")
    }

    private suspend fun simulateKeystroke(onAction: (String) -> Unit) {
        // Dwell Time Simulation: 50ms - 100ms between down and up
        onAction("KEY_DOWN")
        delay(Random.nextLong(50, 100))
        onAction("KEY_UP")
    }

    private fun getGaussianDelay(min: Long, max: Long): Long {
        val mean = (min + max) / 2.0
        val stdDev = (max - min) / 6.0
        return (jRandom.nextGaussian() * stdDev + mean).toLong().coerceIn(min, max)
    }

    private fun getAdjacentKey(char: Char): Char {
        val adjacencyMap = mapOf(
            'q' to "wa", 'w' to "qeas", 'e' to "wrsd", 'r' to "etdf", 't' to "ryfg",
            'y' to "tugh", 'u' to "yihj", 'i' to "uojk", 'o' to "ipkl", 'p' to "ol",
            'a' to "qwsz", 's' to "awedxz", 'd' to "serfcx", 'f' to "drtgvc", 'g' to "ftyhbv",
            'h' to "gyujnb", 'j' to "huikmn", 'k' to "jiolm", 'l' to "kop",
            'z' to "asx", 'x' to "zsdc", 'c' to "xdfv", 'v' to "cfgb", 'b' to "vghn",
            'n' to "bhjm", 'm' to "njk"
        )
        val lower = char.lowercaseChar()
        val adj = adjacencyMap[lower] ?: return if (char.isUpperCase()) 'A' else 'a'
        val picked = adj.random()
        return if (char.isUpperCase()) picked.uppercaseChar() else picked
    }

    /**
     * Simulates a natural interaction sequence using Trusted Events.
     */
    suspend fun simulateNaturalInteraction(targetX: Float, targetY: Float, onAction: (String) -> Unit) {
        val now = System.currentTimeMillis()
        // Mouse Jitter (Touch Jitter): Every 30 seconds of active automation
        if (now - lastJitterTime > 30_000L) {
            onAction("Triggering stealth finger jitter...")
            delay(Random.nextLong(100, 300))
            lastJitterTime = now
        }

        onAction("Scrolling target into view...")
        delay(Random.nextLong(400, 800))

        onAction("Human reaction delay...")
        delay(Random.nextLong(200, 500))

        val jittered = calculateJitteredClick(targetX, targetY, radius = 5f)
        
        // Construct Trusted MotionEvents
        val down = createTrustedEvent(MotionEvent.ACTION_DOWN, jittered.first, jittered.second)
        onAction("Trusted Event: ACTION_DOWN at ${jittered.first}, ${jittered.second}")
        
        delay(Random.nextLong(60, 120)) // Dwell time
        
        val up = createTrustedEvent(MotionEvent.ACTION_UP, jittered.first + Random.nextFloat(), jittered.second + Random.nextFloat())
        onAction("Trusted Event: ACTION_UP")
        
        down.recycle()
        up.recycle()
        
        onAction("Natural interaction complete.")
    }

    private fun createTrustedEvent(action: Int, x: Float, y: Float): MotionEvent {
        val time = SystemClock.uptimeMillis()
        return MotionEvent.obtain(
            time,
            time,
            action,
            x,
            y,
            0
        ).apply {
            source = InputDevice.SOURCE_TOUCHSCREEN
        }
    }

    /**
     * Provides random offsets to simulate human-like engagement (mouse/tap jitter).
     */
    fun calculateJitteredClick(baseX: Float, baseY: Float, radius: Float = 10f): Pair<Float, Float> {
        val offsetX = Random.nextFloat() * radius * 2 - radius
        val offsetY = Random.nextFloat() * radius * 2 - radius
        return (baseX + offsetX) to (baseY + offsetY)
    }

    /**
     * Simulate navigates to "Profile Edit", types bio, and saves.
     */
    suspend fun setProfileIdentity(bio: String, onAction: (String) -> Unit, onCharTyped: (String) -> Unit) {
        onAction("Navigating to Profile Settings...")
        simulateNaturalInteraction(100f, 100f, onAction) // Mock profile button
        delay(Random.nextLong(1000, 2000))

        onAction("Clicking Bio field...")
        simulateNaturalInteraction(200f, 300f, onAction) // Mock bio field
        
        onAction("Typing bio naturally...")
        humanoidType(bio, onCharTyped, onAction)

        onAction("Saving profile...")
        simulateNaturalInteraction(500f, 50f, onAction) // Mock save button
        onAction("Identity update complete.")
    }

    /**
     * Simulate a "For You Page" scroll for warming up the account.
     */
    suspend fun runWarmUpMode(durationMinutes: Int, onAction: (String) -> Unit) {
        val endTime = System.currentTimeMillis() + durationMinutes * 60 * 1000
        onAction("Starting Warm-Up Mode for $durationMinutes minutes...")

        while (System.currentTimeMillis() < endTime) {
            val scrollDepth = Random.nextInt(300, 1200)
            onAction("Scrolling FYP (Depth: $scrollDepth)...")
            
            // Simulating scroll motion
            simulateNaturalInteraction(500f, 1500f, onAction) 
            delay(Random.nextLong(2000, 8000)) // Pause to "view" content

            if (Random.nextFloat() < 0.2f) {
                onAction("Human-like pause: Reading long comment...")
                delay(Random.nextLong(5000, 15000))
            }
        }
        onAction("Warm-up complete. Account is trust-enriched.")
    }
}
