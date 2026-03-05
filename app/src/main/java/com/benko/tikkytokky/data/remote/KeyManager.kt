package com.benko.tikkytokky.data.remote

import android.util.Log
import com.benko.tikkytokky.data.local.dao.ApiKeyDao
import com.benko.tikkytokky.data.local.entities.ApiKey
import com.benko.tikkytokky.util.SecurityUtils
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class KeyManager(private val apiKeyDao: ApiKeyDao) {
    private val mutex = Mutex()
    private var currentIndex = 0

    suspend fun getNextKey(): String? = mutex.withLock {
        val keys = apiKeyDao.getAllKeys().filter {
            !it.isLimited || System.currentTimeMillis() > it.cooldownUntil
        }

        if (keys.isEmpty()) {
            Log.e("KeyManager", "No available API keys in the pool.")
            return null
        }

        if (currentIndex >= keys.size) {
            currentIndex = 0
        }

        val selectedKey = keys[currentIndex]
        currentIndex = (currentIndex + 1) % keys.size

        val deobfuscated = SecurityUtils.deobfuscate(selectedKey.encryptedKey)
        Log.d("KeyManager", "Rotating to key: ${SecurityUtils.formatKeyForLog(deobfuscated)}")
        
        return deobfuscated
    }

    suspend fun markKeyAsLimited(key: String) {
        mutex.withLock {
            val obfuscated = SecurityUtils.obfuscate(key)
            val allKeys = apiKeyDao.getAllKeys()
            val targetKey = allKeys.find { it.encryptedKey == obfuscated }
            
            targetKey?.let {
                val cooldownTime = System.currentTimeMillis() + 60_000 // 60 seconds cooldown
                apiKeyDao.updateCooldown(it.id, true, cooldownTime)
                Log.w("KeyManager", "Key marked as limited: ${SecurityUtils.formatKeyForLog(key)}. Cooldown until $cooldownTime")
            }
        }
    }
}
