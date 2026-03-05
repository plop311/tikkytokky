package com.benko.tikkytokky.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "api_keys")
data class ApiKey(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val encryptedKey: String,
    val isLimited: Boolean = false,
    val lastUsedTimestamp: Long = 0,
    val cooldownUntil: Long = 0
)
