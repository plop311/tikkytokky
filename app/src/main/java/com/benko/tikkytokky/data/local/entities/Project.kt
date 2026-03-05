package com.benko.tikkytokky.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "projects")
data class Project(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val title: String,
    val script: String,
    val videoUrl: String?,
    val status: String, // e.g., "Draft", "Generating", "Completed"
    val createdAt: Long = System.currentTimeMillis()
)
