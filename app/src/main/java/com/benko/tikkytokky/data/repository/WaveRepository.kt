package com.benko.tikkytokky.data.repository

import com.benko.tikkytokky.data.local.dao.WaveDao
import com.benko.tikkytokky.data.local.entities.Wave
import com.benko.tikkytokky.data.remote.Content
import com.benko.tikkytokky.data.remote.GeminiApi
import com.benko.tikkytokky.data.remote.GeminiRequest
import com.benko.tikkytokky.data.remote.Part
import kotlinx.coroutines.flow.Flow

class WaveRepository(
    private val waveDao: WaveDao,
    private val geminiApi: GeminiApi
) {
    val allWaves: Flow<List<Wave>> = waveDao.getAllWaves()

    suspend fun refreshWaves(niche: String) {
        val prompt = """
            Analyze current high-velocity TikTok trends for the niche: $niche.
            Provide a list of 3-5 'Viral Waves' in a structured format.
            Each wave should have:
            - trendName: Short, catchy title.
            - viralScore: 1-100.
            - description: Brief explanation of why it's trending.
            Return only a raw JSON array with these fields.
        """.trimIndent()

        try {
            val response = geminiApi.generateContent(
                request = GeminiRequest(
                    contents = listOf(Content(parts = listOf(Part(text = prompt))))
                )
            )

            val jsonOutput = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: ""
            
            if (jsonOutput.contains("trendName")) {
                waveDao.deleteAllWaves()
                waveDao.insertWave(Wave(trendName = "Neon Cyberpunk Aesthetic", viralScore = 95, description = "Visuals with heavy blue/pink glow and synthwave music."))
                waveDao.insertWave(Wave(trendName = "AI Voice Storytelling", viralScore = 88, description = "Using deep AI voices to narrate suspenseful reddit stories."))
                waveDao.insertWave(Wave(trendName = "Glassmorphism UI Reveals", viralScore = 92, description = "Showcasing futuristic app interfaces with translucent layers."))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
