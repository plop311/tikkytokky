package com.benko.tikkytokky.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.benko.tikkytokky.data.local.dao.ApiKeyDao
import com.benko.tikkytokky.data.local.dao.ProjectDao
import com.benko.tikkytokky.data.local.dao.WaveDao
import com.benko.tikkytokky.data.local.entities.ApiKey
import com.benko.tikkytokky.data.local.entities.Project
import com.benko.tikkytokky.data.local.entities.Wave

@Database(entities = [Wave::class, Project::class, ApiKey::class], version = 2, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun waveDao(): WaveDao
    abstract fun projectDao(): ProjectDao
    abstract fun apiKeyDao(): ApiKeyDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "tikkytokky_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
