package com.benko.tikkytokky.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.benko.tikkytokky.ui.components.GlassBox
import com.benko.tikkytokky.ui.components.StealthOverlay
import com.benko.tikkytokky.ui.theme.Primary2026
import com.benko.tikkytokky.ui.theme.Secondary2026
import com.benko.tikkytokky.ui.theme.Tertiary2026
import com.benko.tikkytokky.ui.viewmodel.TransformationViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransformationScreen(
    viewModel: TransformationViewModel,
    onNavigateToKeyManagement: () -> Unit
) {
    val deNoiseIntensity by viewModel.deNoiseIntensity.collectAsState()
    val hueSatShiftIntensity by viewModel.hueSatShiftIntensity.collectAsState()
    val randomTransformEnabled by viewModel.randomTransformEnabled.collectAsState()
    val horizontalFlipEnabled by viewModel.horizontalFlipEnabled.collectAsState()
    val randomizeFingerprint by viewModel.randomizeFingerprint.collectAsState()
    val isProcessing by viewModel.isProcessing.collectAsState()
    val processLog by viewModel.processLog.collectAsState()
    
    val isDark = isSystemInDarkTheme()
    val scrollState = rememberScrollState()

    val bgGradient = if (isDark) {
        Brush.verticalGradient(
            colors = listOf(Color(0xFF050505), Tertiary2026.copy(alpha = 0.05f), Color.Black)
        )
    } else {
        Brush.verticalGradient(
            colors = listOf(Color.White, Primary2026.copy(alpha = 0.05f))
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
                .verticalScroll(scrollState)
        ) {
            Spacer(modifier = Modifier.height(24.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Transformation",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = Primary2026
                        )
                    )
                    Text(
                        text = "On-Device Video Transformation Engine",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                    )
                }
                
                IconButton(
                    onClick = onNavigateToKeyManagement,
                    modifier = Modifier.background(Primary2026.copy(alpha = 0.1f), MaterialTheme.shapes.medium)
                ) {
                    Icon(Icons.Default.Key, contentDescription = "Manage Keys", tint = Primary2026)
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Stealth Log Overlay
            StealthOverlay {
                if (processLog.isNotEmpty()) {
                    Text(
                        text = "⚙️ $processLog",
                        style = MaterialTheme.typography.labelSmall,
                        color = Primary2026.copy(alpha = 0.7f),
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }
            }

            // Engine Controls
            SettingsSection(title = "Engine Parameters", icon = Icons.Default.HighQuality) {
                Text(
                    text = "De-Noise Intensity: ${(deNoiseIntensity * 100).toInt()}%",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Slider(
                    value = deNoiseIntensity,
                    onValueChange = { viewModel.updateDeNoise(it) },
                    colors = SliderDefaults.colors(thumbColor = Primary2026, activeTrackColor = Primary2026)
                )
                
                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = "Color Shift Intensity: ${(hueSatShiftIntensity * 100).toInt()}%",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
                Slider(
                    value = hueSatShiftIntensity,
                    onValueChange = { viewModel.updateHueSatShift(it) },
                    valueRange = 0.01f..0.1f,
                    colors = SliderDefaults.colors(thumbColor = Secondary2026, activeTrackColor = Secondary2026)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Randomize Parameters", style = MaterialTheme.typography.bodyMedium)
                    Switch(
                        checked = randomTransformEnabled,
                        onCheckedChange = { viewModel.toggleRandomTransform(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = Secondary2026)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Horizontal Flip", style = MaterialTheme.typography.bodyMedium)
                    Switch(
                        checked = horizontalFlipEnabled,
                        onCheckedChange = { viewModel.toggleHorizontalFlip(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = Primary2026)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Bitstream Fingerprint Randomizer
            SettingsSection(title = "Fingerprint Stealth", icon = Icons.Default.Fingerprint) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Bitstream Randomizer", style = MaterialTheme.typography.bodyMedium)
                        Text(
                            "Alters zoom, rotation, and metadata to bypass filters.",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                    Switch(
                        checked = randomizeFingerprint,
                        onCheckedChange = { viewModel.toggleRandomizeFingerprint(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = Tertiary2026)
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { /* Simulated File Action */ },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isProcessing,
                colors = ButtonDefaults.buttonColors(containerColor = Primary2026, contentColor = Color.Black),
                shape = MaterialTheme.shapes.large
            ) {
                if (isProcessing) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color.Black, strokeWidth = 2.dp)
                } else {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Execute Local Transformation", fontWeight = FontWeight.Bold)
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
