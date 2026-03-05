package com.benko.tikkytokky.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.benko.tikkytokky.data.local.dao.ApiKeyDao
import com.benko.tikkytokky.data.local.entities.ApiKey
import com.benko.tikkytokky.util.SecurityUtils
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class KeyManagementViewModel(private val apiKeyDao: ApiKeyDao) : ViewModel() {
    val apiKeys: StateFlow<List<ApiKey>> = apiKeyDao.getAllKeysFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addKeys(keysInput: String) {
        if (keysInput.isBlank()) return
        viewModelScope.launch {
            val keys = keysInput.split("\n")
                .map { it.trim() }
                .filter { it.isNotBlank() }
            
            keys.forEach { key ->
                val obfuscated = SecurityUtils.obfuscate(key)
                apiKeyDao.insertKey(ApiKey(encryptedKey = obfuscated))
            }
        }
    }

    fun removeKey(apiKey: ApiKey) {
        viewModelScope.launch {
            apiKeyDao.deleteKey(apiKey)
        }
    }
}
