package com.benko.tikkytokky.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.benko.tikkytokky.data.local.SettingsManager
import com.benko.tikkytokky.data.video.VideoTransformationEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class TransformationViewModel(
    private val videoEngine: VideoTransformationEngine,
    private val settingsManager: SettingsManager
) : ViewModel() {

    val deNoiseIntensity: StateFlow<Float> = settingsManager.deNoiseIntensity
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.5f)

    val hueSatShiftIntensity: StateFlow<Float> = settingsManager.hueSatShiftIntensity
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.04f)

    val randomTransformEnabled: StateFlow<Boolean> = settingsManager.randomTransformEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val horizontalFlipEnabled: StateFlow<Boolean> = settingsManager.horizontalFlipEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    val randomizeFingerprint: StateFlow<Boolean> = settingsManager.randomizeFingerprintEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    private val _isProcessing = MutableStateFlow(false)
    val isProcessing: StateFlow<Boolean> = _isProcessing.asStateFlow()

    private val _processLog = MutableStateFlow("")
    val processLog: StateFlow<String> = _processLog.asStateFlow()

    fun updateDeNoise(intensity: Float) {
        viewModelScope.launch { settingsManager.saveDeNoiseIntensity(intensity) }
    }

    fun updateHueSatShift(intensity: Float) {
        viewModelScope.launch { settingsManager.saveHueSatShiftIntensity(intensity) }
    }

    fun toggleRandomTransform(enabled: Boolean) {
        viewModelScope.launch { settingsManager.saveRandomTransformEnabled(enabled) }
    }

    fun toggleHorizontalFlip(enabled: Boolean) {
        viewModelScope.launch { settingsManager.saveHorizontalFlipEnabled(enabled) }
    }

    fun toggleRandomizeFingerprint(enabled: Boolean) {
        viewModelScope.launch { settingsManager.saveRandomizeFingerprintEnabled(enabled) }
    }

    fun startTestTransformation(inputPath: String, outputPath: String) {
        viewModelScope.launch {
            _isProcessing.value = true
            _processLog.value = "Initializing Transformation Engine..."
            val success = videoEngine.transformVideo(inputPath, outputPath)
            _processLog.value = if (success) "Transformation Complete: $outputPath" else "Transformation Failed."
            _isProcessing.value = false
        }
    }
}
