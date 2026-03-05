package com.benko.tikkytokky.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.benko.tikkytokky.data.local.entities.ApiKey
import com.benko.tikkytokky.ui.components.GlassBox
import com.benko.tikkytokky.ui.theme.Primary2026
import com.benko.tikkytokky.ui.theme.Secondary2026
import com.benko.tikkytokky.ui.viewmodel.KeyManagementViewModel
import com.benko.tikkytokky.util.SecurityUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KeyManagementScreen(viewModel: KeyManagementViewModel, onBack: () -> Unit) {
    val apiKeys by viewModel.apiKeys.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }
    var keysInput by remember { mutableStateOf("") }
    val isDark = isSystemInDarkTheme()

    val bgGradient = if (isDark) {
        Brush.verticalGradient(
            colors = listOf(Color(0xFF0A0A0A), Color.Black)
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
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Primary2026)
                }
                Text(
                    text = "Key Rotation Pool",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = Primary2026
                )
            }

            Text(
                text = "Manage your Gemini API keys for resilient automation. Add multiple keys by separating them with new lines.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            )

            Spacer(modifier = Modifier.height(24.dp))

            if (apiKeys.isEmpty()) {
                EmptyKeyState(modifier = Modifier.weight(1f))
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(apiKeys) { key ->
                        KeyCard(key, onDelete = { viewModel.removeKey(key) })
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = { showAddDialog = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(bottom = 16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Primary2026, contentColor = Color.Black),
                shape = MaterialTheme.shapes.large
            ) {
                Icon(Icons.Default.Add, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Add Keys to Pool", fontWeight = FontWeight.Bold)
            }
        }

        if (showAddDialog) {
            AlertDialog(
                onDismissRequest = { showAddDialog = false },
                title = { Text("Add Gemini Keys") },
                text = {
                    OutlinedTextField(
                        value = keysInput,
                        onValueChange = { keysInput = it },
                        label = { Text("Paste keys (one per line)") },
                        modifier = Modifier.fillMaxWidth().height(200.dp),
                        placeholder = { Text("AIza...\nAIza...") }
                    )
                },
                confirmButton = {
                    TextButton(onClick = {
                        viewModel.addKeys(keysInput)
                        keysInput = ""
                        showAddDialog = false
                    }) {
                        Text("Add to Pool", color = Primary2026)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAddDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}

@Composable
fun KeyCard(apiKey: ApiKey, onDelete: () -> Unit) {
    val deobfuscated = SecurityUtils.deobfuscate(apiKey.encryptedKey)
    val displayKey = SecurityUtils.formatKeyForLog(deobfuscated)
    val isLimited = apiKey.isLimited && System.currentTimeMillis() < apiKey.cooldownUntil

    GlassBox(modifier = Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                Icons.Default.Key,
                contentDescription = null,
                tint = if (isLimited) Secondary2026 else Primary2026,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = displayKey,
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Medium),
                    color = MaterialTheme.colorScheme.onSurface
                )
                if (isLimited) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = Secondary2026, modifier = Modifier.size(12.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Rate Limited (Cooling down...)",
                            style = MaterialTheme.typography.labelSmall,
                            color = Secondary2026
                        )
                    }
                } else {
                    Text(
                        text = "Status: Active",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Green.copy(alpha = 0.7f)
                    )
                }
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error.copy(alpha = 0.6f))
            }
        }
    }
}

@Composable
fun EmptyKeyState(modifier: Modifier = Modifier) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Default.Key, contentDescription = null, modifier = Modifier.size(64.dp), tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.1f))
            Spacer(modifier = Modifier.height(16.dp))
            Text("No API keys in pool", color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.3f))
        }
    }
}
