package com.benko.tikkytokky.data.local.dao

import androidx.room.*
import com.benko.tikkytokky.data.local.entities.ApiKey
import kotlinx.coroutines.flow.Flow

@Dao
interface ApiKeyDao {
    @Query("SELECT * FROM api_keys")
    fun getAllKeysFlow(): Flow<List<ApiKey>>

    @Query("SELECT * FROM api_keys")
    suspend fun getAllKeys(): List<ApiKey>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertKey(apiKey: ApiKey)

    @Update
    suspend fun updateKey(apiKey: ApiKey)

    @Delete
    suspend fun deleteKey(apiKey: ApiKey)

    @Query("UPDATE api_keys SET isLimited = :isLimited, cooldownUntil = :cooldownUntil WHERE id = :id")
    suspend fun updateCooldown(id: Long, isLimited: Boolean, cooldownUntil: Long)
}
