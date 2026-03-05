package com.benko.tikkytokky.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "settings")

class SettingsManager(private val context: Context) {

    companion object {
        val AI_PERSONA = stringPreferencesKey("ai_persona")
        val TARGET_NICHE = stringPreferencesKey("target_niche")
        val AI_TONE = stringPreferencesKey("ai_tone")
        val SCRIPT_LENGTH = stringPreferencesKey("script_length")
        val MOOD = stringPreferencesKey("mood")
        val ACTIVE_PERSONA_MODE = booleanPreferencesKey("active_persona_mode")
        
        // Video Transformation Preferences
        val DE_NOISE_INTENSITY = floatPreferencesKey("de_noise_intensity")
        val HUE_SAT_SHIFT_INTENSITY = floatPreferencesKey("hue_sat_shift_intensity")
        val RANDOM_TRANSFORM_ENABLED = booleanPreferencesKey("random_transform_enabled")
        val HORIZONTAL_FLIP_ENABLED = booleanPreferencesKey("horizontal_flip_enabled")
        val RANDOMIZE_FINGERPRINT_ENABLED = booleanPreferencesKey("randomize_fingerprint_enabled")
    }

    val aiPersona: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[AI_PERSONA] ?: "Trend Analyst"
    }

    val targetNiche: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[TARGET_NICHE] ?: "General"
    }

    val aiTone: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[AI_TONE] ?: "Energetic"
    }

    val scriptLength: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[SCRIPT_LENGTH] ?: "60s"
    }

    val mood: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[MOOD] ?: "Professional"
    }

    val activePersonaMode: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[ACTIVE_PERSONA_MODE] ?: false
    }

    val deNoiseIntensity: Flow<Float> = context.dataStore.data.map { preferences ->
        preferences[DE_NOISE_INTENSITY] ?: 0.5f
    }

    val hueSatShiftIntensity: Flow<Float> = context.dataStore.data.map { preferences ->
        preferences[HUE_SAT_SHIFT_INTENSITY] ?: 0.04f
    }

    val randomTransformEnabled: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[RANDOM_TRANSFORM_ENABLED] ?: true
    }

    val horizontalFlipEnabled: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[HORIZONTAL_FLIP_ENABLED] ?: false
    }

    val randomizeFingerprintEnabled: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[RANDOMIZE_FINGERPRINT_ENABLED] ?: true
    }

    suspend fun saveAiPersona(persona: String) {
        context.dataStore.edit { preferences ->
            preferences[AI_PERSONA] = persona
        }
    }

    suspend fun saveTargetNiche(niche: String) {
        context.dataStore.edit { preferences ->
            preferences[TARGET_NICHE] = niche
        }
    }

    suspend fun saveAiTone(tone: String) {
        context.dataStore.edit { preferences ->
            preferences[AI_TONE] = tone
        }
    }

    suspend fun saveScriptLength(length: String) {
        context.dataStore.edit { preferences ->
            preferences[SCRIPT_LENGTH] = length
        }
    }

    suspend fun saveMood(mood: String) {
        context.dataStore.edit { preferences ->
            preferences[MOOD] = mood
        }
    }

    suspend fun saveActivePersonaMode(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[ACTIVE_PERSONA_MODE] = enabled
        }
    }

    suspend fun saveDeNoiseIntensity(intensity: Float) {
        context.dataStore.edit { preferences ->
            preferences[DE_NOISE_INTENSITY] = intensity
        }
    }

    suspend fun saveHueSatShiftIntensity(intensity: Float) {
        context.dataStore.edit { preferences ->
            preferences[HUE_SAT_SHIFT_INTENSITY] = intensity
        }
    }

    suspend fun saveRandomTransformEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[RANDOM_TRANSFORM_ENABLED] = enabled
        }
    }

    suspend fun saveHorizontalFlipEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[HORIZONTAL_FLIP_ENABLED] = enabled
        }
    }

    suspend fun saveRandomizeFingerprintEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[RANDOMIZE_FINGERPRINT_ENABLED] = enabled
        }
    }
}
