package com.benko.tikkytokky.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.benko.tikkytokky.data.local.entities.Wave
import kotlinx.coroutines.flow.Flow

@Dao
interface WaveDao {
    @Query("SELECT * FROM waves ORDER BY timestamp DESC")
    fun getAllWaves(): Flow<List<Wave>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWave(wave: Wave)

    @Query("DELETE FROM waves")
    suspend fun deleteAllWaves()
}
