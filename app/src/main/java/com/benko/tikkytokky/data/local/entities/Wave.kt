package com.benko.tikkytokky.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "waves")
data class Wave(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val trendName: String,
    val viralScore: Int,
    val description: String,
    val timestamp: Long = System.currentTimeMillis()
)
