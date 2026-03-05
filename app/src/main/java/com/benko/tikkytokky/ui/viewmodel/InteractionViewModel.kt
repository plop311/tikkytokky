package com.benko.tikkytokky.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.benko.tikkytokky.data.social.SocialInteractionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class InteractionViewModel(private val socialManager: SocialInteractionManager) : ViewModel() {

    private val _replyOutput = MutableStateFlow("")
    val replyOutput: StateFlow<String> = _replyOutput.asStateFlow()

    private val _isTyping = MutableStateFlow(false)
    val isTyping: StateFlow<Boolean> = _isTyping.asStateFlow()

    private val _followStatus = MutableStateFlow("")
    val followStatus: StateFlow<String> = _followStatus.asStateFlow()

    private val _automationLog = MutableStateFlow("")
    val automationLog: StateFlow<String> = _automationLog.asStateFlow()

    private val _isWarmingUp = MutableStateFlow(false)
    val isWarmingUp: StateFlow<Boolean> = _isWarmingUp.asStateFlow()

    private val _warmUpProgress = MutableStateFlow("")
    val warmUpProgress: StateFlow<String> = _warmUpProgress.asStateFlow()

    private val _isUpdatingIdentity = MutableStateFlow(false)
    val isUpdatingIdentity: StateFlow<Boolean> = _isUpdatingIdentity.asStateFlow()

    val humanLikeBios = listOf(
        "Tech enthusiast & creative soul",
        "Exploring the digital frontier one wave at a time",
        "Viral strategist | AI explorer",
        "Building the future of high-velocity automation",
        "Android dev by day, digital ghost by night"
    )

    private val _selectedBio = MutableStateFlow(humanLikeBios[0])
    val selectedBio: StateFlow<String> = _selectedBio.asStateFlow()

    fun selectBio(bio: String) {
        _selectedBio.value = bio
    }

    fun generateAndSimulateReply(comments: List<String>) {
        viewModelScope.launch {
            _isTyping.value = true
            val rawReply = socialManager.analyzeThreadAndReply(comments)
            
            socialManager.simulateNaturalInteraction(500f, 1200f) { action ->
                _automationLog.value = action
            }

            socialManager.humanoidType(
                text = rawReply,
                onCharTyped = { typed ->
                    _replyOutput.value = typed
                },
                onKeystrokeAction = { action ->
                    _automationLog.value = action
                }
            )
            _isTyping.value = false
            _automationLog.value = "Reply sent naturally."
        }
    }

    fun checkAndFollow(userBio: String, userContent: String) {
        viewModelScope.launch {
            _followStatus.value = "Analyzing User..."
            
            socialManager.simulateNaturalInteraction(300f, 800f) { action ->
                _automationLog.value = action
            }

            val result = socialManager.smartFollow(userBio, userContent)
            
            if (result) {
                _followStatus.value = "Niche Match. Triggering natural follow..."
                socialManager.simulateNaturalInteraction(900f, 400f) { action ->
                    _automationLog.value = action
                }
                _followStatus.value = "Followed! (Stealth Action)"
            } else {
                _followStatus.value = "Skipped (No Match or Cooldown)"
            }
        }
    }

    fun updateProfileIdentity() {
        viewModelScope.launch {
            _isUpdatingIdentity.value = true
            socialManager.setProfileIdentity(
                bio = _selectedBio.value,
                onAction = { _automationLog.value = it },
                onCharTyped = { /* No-op for now */ }
            )
            _isUpdatingIdentity.value = false
            _automationLog.value = "Identity Layer synchronized."
        }
    }

    fun startWarmUpMode(minutes: Int) {
        viewModelScope.launch {
            _isWarmingUp.value = true
            socialManager.runWarmUpMode(minutes) { progress ->
                _warmUpProgress.value = progress
                _automationLog.value = progress
            }
            _isWarmingUp.value = false
            _warmUpProgress.value = "Account warmed up."
        }
    }
}
