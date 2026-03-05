package com.benko.tikkytokky.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.filled.*
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
import com.benko.tikkytokky.ui.components.StealthOverlay
import com.benko.tikkytokky.ui.theme.Primary2026
import com.benko.tikkytokky.ui.theme.Secondary2026
import com.benko.tikkytokky.ui.theme.Tertiary2026
import com.benko.tikkytokky.ui.viewmodel.InteractionViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SocialDashboardScreen(
    viewModel: InteractionViewModel,
    onNavigateToKeyManagement: () -> Unit
) {
    val replyOutput by viewModel.replyOutput.collectAsState()
    val isTyping by viewModel.isTyping.collectAsState()
    val followStatus by viewModel.followStatus.collectAsState()
    val automationLog by viewModel.automationLog.collectAsState()
    
    val isWarmingUp by viewModel.isWarmingUp.collectAsState()
    val warmUpProgress by viewModel.warmUpProgress.collectAsState()
    val isUpdatingIdentity by viewModel.isUpdatingIdentity.collectAsState()
    val selectedBio by viewModel.selectedBio.collectAsState()
    
    var warmUpDuration by remember { mutableFloatStateOf(5f) }
    var showBioDropdown by remember { mutableStateOf(false) }
    var showNicheDropdown by remember { mutableStateOf(false) }
    
    val isDark = isSystemInDarkTheme()
    val scrollState = rememberScrollState()

    val niches = listOf("Nostalgic Glitch-Tech", "Gen Z Growth", "Retro Aesthetics", "Cyberpunk 2026")
    var currentNiche by remember { mutableStateOf(niches[0]) }

    val bgGradient = if (isDark) {
        Brush.radialGradient(
            colors = listOf(Secondary2026.copy(alpha = 0.1f), Color.Black),
            radius = 2000f
        )
    } else {
        Brush.verticalGradient(
            colors = listOf(Color.White, Tertiary2026.copy(alpha = 0.05f))
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
                        text = "Niche Growth",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = Secondary2026
                        )
                    )
                    Text(
                        text = "Persona & Identity Layer Control",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                    )
                }
                
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
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Stealth Log Overlay (Obfuscated UI)
            StealthOverlay {
                if (automationLog.isNotEmpty()) {
                    Text(
                        text = "⚡ $automationLog",
                        style = MaterialTheme.typography.labelSmall,
                        color = Primary2026.copy(alpha = 0.7f),
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                }
            }

            // Niche Selection UI
            Text(
                text = "Target Persona",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            GlassBox(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Psychology, contentDescription = null, tint = Tertiary2026)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Growth Niche",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Box {
                        OutlinedCard(
                            onClick = { showNicheDropdown = true },
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.outlinedCardColors(containerColor = Color.White.copy(alpha = 0.05f))
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = currentNiche,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.weight(1f)
                                )
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            }
                        }
                        
                        DropdownMenu(
                            expanded = showNicheDropdown,
                            onDismissRequest = { showNicheDropdown = false },
                            modifier = Modifier.fillMaxWidth(0.8f).background(MaterialTheme.colorScheme.surface)
                        ) {
                            niches.forEach { niche ->
                                DropdownMenuItem(
                                    text = { Text(niche, style = MaterialTheme.typography.bodySmall) },
                                    onClick = {
                                        currentNiche = niche
                                        showNicheDropdown = false
                                    }
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Identity Layer (Persona Setup)
            Text(
                text = "Identity Layer",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            GlassBox(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Fingerprint, contentDescription = null, tint = Primary2026)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Persona Bio Sync",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Box {
                        OutlinedCard(
                            onClick = { showBioDropdown = true },
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.outlinedCardColors(containerColor = Color.White.copy(alpha = 0.05f))
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = selectedBio,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.weight(1f)
                                )
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            }
                        }
                        
                        DropdownMenu(
                            expanded = showBioDropdown,
                            onDismissRequest = { showBioDropdown = false },
                            modifier = Modifier.fillMaxWidth(0.8f).background(MaterialTheme.colorScheme.surface)
                        ) {
                            viewModel.humanLikeBios.forEach { bio ->
                                DropdownMenuItem(
                                    text = { Text(bio, style = MaterialTheme.typography.bodySmall) },
                                    onClick = {
                                        viewModel.selectBio(bio)
                                        showBioDropdown = false
                                    }
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { viewModel.updateProfileIdentity() },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !isUpdatingIdentity,
                        colors = ButtonDefaults.buttonColors(containerColor = Primary2026, contentColor = Color.Black)
                    ) {
                        if (isUpdatingIdentity) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), color = Color.Black, strokeWidth = 2.dp)
                        } else {
                            Text("Sync Identity Layer")
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Account Warming (Warm-up Mode)
            Text(
                text = "Account Trust",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            GlassBox(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Whatshot, contentDescription = null, tint = Tertiary2026)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Stealth Warm-up Mode",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = if (isWarmingUp) "Warm-up in progress: $warmUpProgress" else "Prepare account with human FYP simulation.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text("Duration: ${warmUpDuration.toInt()} mins", style = MaterialTheme.typography.labelSmall)
                    Slider(
                        value = warmUpDuration,
                        onValueChange = { warmUpDuration = it },
                        valueRange = 1f..30f,
                        steps = 29,
                        colors = SliderDefaults.colors(thumbColor = Tertiary2026, activeTrackColor = Tertiary2026)
                    )
                    
                    Button(
                        onClick = { viewModel.startWarmUpMode(warmUpDuration.toInt()) },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !isWarmingUp,
                        colors = ButtonDefaults.buttonColors(containerColor = Tertiary2026)
                    ) {
                        Text("Start Account Warming")
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Interaction Components
            Text(
                text = "Intelligence Preview",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            
            // Smart Follow Control
            GlassBox(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.GroupAdd, contentDescription = null, tint = Primary2026)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Smart Follow Engine",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = followStatus.ifEmpty { "Idle - Waiting for niche detection" },
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { 
                            viewModel.checkAndFollow("Tech enthusiast and AI builder", "Kotlin, Android, AI Agentic Workflows") 
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Primary2026, contentColor = Color.Black)
                    ) {
                        Text("Simulate Stealth Follow")
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Smart Reply Preview
            GlassBox(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.AutoMirrored.Filled.Message, contentDescription = null, tint = Secondary2026)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "AI Reply Generator",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 100.dp)
                            .background(Color.Black.copy(alpha = 0.2f), MaterialTheme.shapes.medium)
                            .padding(12.dp)
                    ) {
                        if (replyOutput.isEmpty() && !isTyping) {
                            Text(
                                "Waiting for comment thread analysis...",
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
                                style = MaterialTheme.typography.bodyMedium
                            )
                        } else {
                            Text(
                                text = replyOutput,
                                color = MaterialTheme.colorScheme.onSurface,
                                style = MaterialTheme.typography.bodyMedium,
                                lineHeight = 22.sp
                            )
                        }
                    }

                    if (isTyping) {
                        LinearProgressIndicator(
                            modifier = Modifier.fillMaxWidth().height(2.dp).padding(top = 8.dp),
                            color = Secondary2026
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Button(
                        onClick = { 
                            val mockComments = listOf(
                                "This automation logic is insane!",
                                "How do you handle the API rate limits?",
                                "Can I use this for my travel blog niche?"
                            )
                            viewModel.generateAndSimulateReply(mockComments) 
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Secondary2026)
                    ) {
                        Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Stealth Analyze & Reply")
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}
