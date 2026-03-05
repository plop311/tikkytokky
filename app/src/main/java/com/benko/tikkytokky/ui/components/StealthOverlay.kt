package com.benko.tikkytokky.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.invisibleToUser

/**
 * A stealth wrapper component that makes its children invisible to system-level 
 * accessibility inspectors and layout explorers.
 * Mapping the 'Shadow DOM' / 'content.js' isolation concept to Android Compose.
 */
@Composable
fun StealthOverlay(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .clearAndSetSemantics { 
                // Removes all semantic information, effectively making it 
                // a "black hole" for AccessibilityServices and UI Automator.
                invisibleToUser()
            }
    ) {
        content()
    }
}
