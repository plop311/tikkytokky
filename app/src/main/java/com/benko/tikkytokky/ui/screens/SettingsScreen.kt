package com.benko.tikkytokky.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Mood
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.benko.tikkytokky.ui.components.GlassBox
import com.benko.tikkytokky.ui.theme.Primary2026
import com.benko.tikkytokky.ui.theme.Secondary2026
import com.benko.tikkytokky.ui.theme.Tertiary2026
import com.benko.tikkytokky.ui.viewmodel.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel,
    onNavigateToKeyManagement: () -> Unit
) {
    val aiPersona by viewModel.aiPersona.collectAsState()
    val targetNiche by viewModel.targetNiche.collectAsState()
    val aiTone by viewModel.aiTone.collectAsState()
    val scriptLength by viewModel.scriptLength.collectAsState()
    val mood by viewModel.mood.collectAsState()
    val activePersonaMode by viewModel.activePersonaMode.collectAsState()
    val isDark = isSystemInDarkTheme()

    val bgGradient = if (isDark) {
        Brush.verticalGradient(
            colors = listOf(Color(0xFF0F0F0F), Tertiary2026.copy(alpha = 0.05f), Color.Black)
        )
    } else {
        Brush.verticalGradient(
            colors = listOf(Color.White, Secondary2026.copy(alpha = 0.05f))
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgGradient)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(horizontal = 20.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = "Social Persona",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.ExtraBold,
                    color = Primary2026
                )
            )
            Text(
                text = "Configure your AI's social intelligence",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // API Key Management Button
            GlassBox(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Key, contentDescription = null, tint = Primary2026)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "API Key Rotation",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Button(
                        onClick = onNavigateToKeyManagement,
                        colors = ButtonDefaults.buttonColors(containerColor = Primary2026.copy(alpha = 0.1f), contentColor = Primary2026)
                    ) {
                        Text("Manage Pool")
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Active Persona Mode Toggle
            GlassBox(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Active Persona Mode",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "Enable AI-driven social interaction",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                    Switch(
                        checked = activePersonaMode,
                        onCheckedChange = { viewModel.updateActivePersonaMode(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Primary2026,
                            checkedTrackColor = Primary2026.copy(alpha = 0.5f)
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            SettingsSection(title = "Social Mood", icon = Icons.Default.Mood) {
                val moods = listOf("Funny", "Sarcastic", "Professional")
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    moods.forEach { m ->
                        FilterChip(
                            selected = mood == m,
                            onClick = { viewModel.updateMood(m) },
                            label = { Text(m) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Secondary2026.copy(alpha = 0.2f),
                                selectedLabelColor = Secondary2026
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            SettingsSection(title = "AI Persona", icon = Icons.Default.AutoAwesome) {
                PersonaOption(
                    title = "Trend Analyst",
                    selected = aiPersona == "Trend Analyst",
                    onClick = { viewModel.updateAiPersona("Trend Analyst") }
                )
                PersonaOption(
                    title = "Creative Director",
                    selected = aiPersona == "Creative Director",
                    onClick = { viewModel.updateAiPersona("Creative Director") }
                )
                PersonaOption(
                    title = "Viral Strategist",
                    selected = aiPersona == "Viral Strategist",
                    onClick = { viewModel.updateAiPersona("Viral Strategist") }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            SettingsSection(title = "Automation Parameters", icon = Icons.Default.Tune) {
                OutlinedTextField(
                    value = targetNiche,
                    onValueChange = { viewModel.updateTargetNiche(it) },
                    label = { Text("Target Niche") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Primary2026,
                        unfocusedBorderColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f),
                        focusedLabelColor = Primary2026
                    )
                )
                
                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "AI Tone",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ToneChip("Energetic", aiTone == "Energetic") { viewModel.updateAiTone("Energetic") }
                    ToneChip("Professional", aiTone == "Professional") { viewModel.updateAiTone("Professional") }
                    ToneChip("Humorous", aiTone == "Humorous") { viewModel.updateAiTone("Humorous") }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Script Length",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Slider(
                    value = if (scriptLength == "15s") 0f else if (scriptLength == "30s") 0.5f else 1f,
                    onValueChange = {
                        val length = if (it < 0.25f) "15s" else if (it < 0.75f) "30s" else "60s"
                        viewModel.updateScriptLength(length)
                    },
                    colors = SliderDefaults.colors(
                        thumbColor = Primary2026,
                        activeTrackColor = Primary2026
                    )
                )
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("15s", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    Text("30s", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                    Text("60s", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                }
            }

            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
private fun SettingsSection(title: String, icon: androidx.compose.ui.graphics.vector.ImageVector, content: @Composable ColumnScope.() -> Unit) {
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = Secondary2026, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
        GlassBox(modifier = Modifier.fillMaxWidth()) {
            Column(content = content)
        }
    }
}

@Composable
private fun PersonaOption(title: String, selected: Boolean, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        color = if (selected) Primary2026.copy(alpha = 0.1f) else Color.Transparent,
        shape = MaterialTheme.shapes.medium,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(selected = selected, onClick = onClick, colors = RadioButtonDefaults.colors(selectedColor = Primary2026))
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = title, color = if (selected) Primary2026 else MaterialTheme.colorScheme.onSurface)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ToneChip(text: String, selected: Boolean, onClick: () -> Unit) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(text) },
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = Secondary2026.copy(alpha = 0.2f),
            selectedLabelColor = Secondary2026
        )
    )
}
