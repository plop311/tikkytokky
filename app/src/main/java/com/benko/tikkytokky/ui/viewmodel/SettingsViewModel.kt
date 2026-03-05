package com.benko.tikkytokky.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.benko.tikkytokky.data.local.SettingsManager
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SettingsViewModel(private val settingsManager: SettingsManager) : ViewModel() {
    val aiPersona: StateFlow<String> = settingsManager.aiPersona
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "Trend Analyst")
    
    val targetNiche: StateFlow<String> = settingsManager.targetNiche
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "General")
    
    val aiTone: StateFlow<String> = settingsManager.aiTone
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "Energetic")
    
    val scriptLength: StateFlow<String> = settingsManager.scriptLength
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "60s")

    val mood: StateFlow<String> = settingsManager.mood
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "Professional")

    val activePersonaMode: StateFlow<Boolean> = settingsManager.activePersonaMode
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    fun updateAiPersona(persona: String) {
        viewModelScope.launch { settingsManager.saveAiPersona(persona) }
    }

    fun updateTargetNiche(niche: String) {
        viewModelScope.launch { settingsManager.saveTargetNiche(niche) }
    }

    fun updateAiTone(tone: String) {
        viewModelScope.launch { settingsManager.saveAiTone(tone) }
    }

    fun updateScriptLength(length: String) {
        viewModelScope.launch { settingsManager.saveScriptLength(length) }
    }

    fun updateMood(mood: String) {
        viewModelScope.launch { settingsManager.saveMood(mood) }
    }

    fun updateActivePersonaMode(enabled: Boolean) {
        viewModelScope.launch { settingsManager.saveActivePersonaMode(enabled) }
    }
}
