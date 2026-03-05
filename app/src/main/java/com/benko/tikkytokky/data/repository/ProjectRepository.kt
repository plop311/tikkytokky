package com.benko.tikkytokky.data.repository

import com.benko.tikkytokky.data.local.SettingsManager
import com.benko.tikkytokky.data.local.dao.ProjectDao
import com.benko.tikkytokky.data.local.entities.Project
import com.benko.tikkytokky.data.remote.Content
import com.benko.tikkytokky.data.remote.GeminiApi
import com.benko.tikkytokky.data.remote.GeminiRequest
import com.benko.tikkytokky.data.remote.Part
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

class ProjectRepository(
    private val projectDao: ProjectDao,
    private val geminiApi: GeminiApi,
    private val settingsManager: SettingsManager
) {
    val allProjects: Flow<List<Project>> = projectDao.getAllProjects()

    suspend fun automateProject(trendName: String) {
        val persona = settingsManager.aiPersona.first()
        val niche = settingsManager.targetNiche.first()
        val tone = settingsManager.aiTone.first()
        val length = settingsManager.scriptLength.first()
        val mood = settingsManager.mood.first()
        val isPersonaEnabled = settingsManager.activePersonaMode.first()

        val basePersona = if (isPersonaEnabled) "Act as a $persona with a $mood mood." else "Act as a $persona."
        
        // Refactor for Gen Z nostalgia growth hacker persona
        val nichePrompt = """
            $basePersona
            Special Directive: Adopt a "Gen Z nostalgia growth hacker" persona. 
            Focus on 2005-2015 "Glitch-Tech" content (e.g., Limewire, MySpace, Blackberry Messenger, early YouTube).
            Generate hooks and caption text optimized for nostalgia-focused growth. 
            Use casual language and reference specific cultural milestones of that era.

            Generate a high-velocity TikTok Shorts script for the trend: "$trendName".
            Target Niche: $niche
            Tone: $tone
            Estimated Length: $length
            
            Provide:
            1. A catchy video title.
            2. A viral hook (first 3 seconds).
            3. The main script body with visual cues.
            4. Suggested hashtags.
        """.trimIndent()

        try {
            val response = geminiApi.generateContent(
                request = GeminiRequest(
                    contents = listOf(Content(parts = listOf(Part(text = nichePrompt))))
                )
            )

            val generatedText = response.candidates.firstOrNull()?.content?.parts?.firstOrNull()?.text ?: "Failed to generate script."
            
            val project = Project(
                title = "Shorts: $trendName",
                script = generatedText,
                videoUrl = null,
                status = "Generated"
            )
            projectDao.insertProject(project)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun deleteProject(project: Project) {
        projectDao.deleteProject(project)
    }
}
