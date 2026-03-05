package com.benko.tikkytokky.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.benko.tikkytokky.data.local.entities.Wave
import com.benko.tikkytokky.ui.components.GlassBox
import com.benko.tikkytokky.ui.theme.Primary2026
import com.benko.tikkytokky.ui.theme.Secondary2026
import com.benko.tikkytokky.ui.theme.Tertiary2026
import com.benko.tikkytokky.ui.viewmodel.DashboardUiState
import com.benko.tikkytokky.ui.viewmodel.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToKeyManagement: () -> Unit
) {
    val waves by viewModel.waves.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    val shotgunFeedback by viewModel.shotgunFeedback.collectAsState()
    val isDark = isSystemInDarkTheme()

    val bgGradient = if (isDark) {
        Brush.radialGradient(
            colors = listOf(Tertiary2026.copy(alpha = 0.15f), Color.Black),
            radius = 2000f
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
        ) {
            Spacer(modifier = Modifier.height(24.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Wave Analysis",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = (-1).sp,
                            color = Primary2026
                        )
                    )
                    Text(
                        text = "Real-time AI Trend Detection",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                    )
                }
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Button(
                        onClick = onNavigateToKeyManagement,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Primary2026.copy(alpha = 0.15f),
                            contentColor = Primary2026
                        ),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                        shape = MaterialTheme.shapes.medium,
                        modifier = Modifier.height(36.dp)
                    ) {
                        Text("Keys", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    IconButton(
                        onClick = { viewModel.refreshTrends() },
                        modifier = Modifier
                            .size(36.dp)
                            .background(Primary2026.copy(alpha = 0.1f), MaterialTheme.shapes.medium)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Primary2026)
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Niche Hashtag Shotgun Engine
            GlassBox(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Hashtag Shotgun",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = if (shotgunFeedback.isEmpty()) "One-click copy niche clusters" else shotgunFeedback,
                            style = MaterialTheme.typography.bodySmall,
                            color = if (shotgunFeedback.isEmpty()) MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f) else Primary2026
                        )
                    }
                    Button(
                        onClick = { viewModel.shotgunHashtags() },
                        colors = ButtonDefaults.buttonColors(containerColor = Secondary2026, contentColor = Color.White),
                        shape = MaterialTheme.shapes.medium
                    ) {
                        Icon(Icons.Default.FlashOn, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Shotgun")
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            AnimatedVisibility(
                visible = uiState is DashboardUiState.Loading,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                LinearProgressIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    color = Primary2026,
                    trackColor = Primary2026.copy(alpha = 0.1f)
                )
            }

            if (waves.isEmpty() && uiState !is DashboardUiState.Loading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No waves detected. Tap refresh.", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.3f))
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(bottom = 100.dp)
                ) {
                    items(waves) { wave ->
                        WaveCard(wave, onAutomate = { viewModel.automateTrend(wave) })
                    }
                }
            }
        }
    }
}

@Composable
fun WaveCard(wave: Wave, onAutomate: () -> Unit) {
    GlassBox(modifier = Modifier.fillMaxWidth()) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = wave.trendName,
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    ),
                    modifier = Modifier.weight(1f)
                )
                
                Surface(
                    color = Secondary2026.copy(alpha = 0.2f),
                    shape = MaterialTheme.shapes.small
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.TrendingUp,
                            contentDescription = null,
                            tint = Secondary2026,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${wave.viralScore}%",
                            style = MaterialTheme.typography.labelLarge,
                            color = Secondary2026
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = wave.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onAutomate,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Primary2026,
                    contentColor = Color.Black
                ),
                shape = MaterialTheme.shapes.medium
            ) {
                Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("One-Tap Automate", fontWeight = FontWeight.Bold)
            }
        }
    }
}
