package com.benko.tikkytokky.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.benko.tikkytokky.data.local.entities.Wave
import com.benko.tikkytokky.data.repository.ProjectRepository
import com.benko.tikkytokky.data.repository.WaveRepository
import com.benko.tikkytokky.data.social.HashtagManager
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class DashboardViewModel(
    private val waveRepository: WaveRepository,
    private val projectRepository: ProjectRepository,
    private val hashtagManager: HashtagManager
) : ViewModel() {
    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Success)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val _shotgunFeedback = MutableStateFlow("")
    val shotgunFeedback: StateFlow<String> = _shotgunFeedback.asStateFlow()

    val waves: StateFlow<List<Wave>> = waveRepository.allWaves
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        refreshTrends()
    }

    fun refreshTrends() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            waveRepository.refreshWaves("TikTok Shorts 2026")
            _uiState.value = DashboardUiState.Success
        }
    }

    fun automateTrend(wave: Wave) {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            projectRepository.automateProject(wave.trendName)
            _uiState.value = DashboardUiState.Success
        }
    }

    fun shotgunHashtags() {
        val hashtags = hashtagManager.shotgunHashtags()
        _shotgunFeedback.value = "Shotgun: $hashtags copied!"
        viewModelScope.launch {
            kotlinx.coroutines.delay(3000)
            _shotgunFeedback.value = ""
        }
    }
}

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    object Success : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}
