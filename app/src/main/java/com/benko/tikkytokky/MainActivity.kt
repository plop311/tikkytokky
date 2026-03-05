package com.benko.tikkytokky

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.benko.tikkytokky.data.local.AppDatabase
import com.benko.tikkytokky.data.local.SettingsManager
import com.benko.tikkytokky.data.remote.GeminiApi
import com.benko.tikkytokky.data.remote.GeminiKeyInterceptor
import com.benko.tikkytokky.data.remote.KeyManager
import com.benko.tikkytokky.data.repository.ProjectRepository
import com.benko.tikkytokky.data.repository.WaveRepository
import com.benko.tikkytokky.data.social.HashtagManager
import com.benko.tikkytokky.data.social.SocialInteractionManager
import com.benko.tikkytokky.data.video.VideoTransformationEngine
import com.benko.tikkytokky.ui.navigation.NavGraph
import com.benko.tikkytokky.ui.navigation.Screen
import com.benko.tikkytokky.ui.theme.TikkytokkyTheme
import com.benko.tikkytokky.ui.viewmodel.DashboardViewModel
import com.benko.tikkytokky.ui.viewmodel.InteractionViewModel
import com.benko.tikkytokky.ui.viewmodel.KeyManagementViewModel
import com.benko.tikkytokky.ui.viewmodel.SettingsViewModel
import com.benko.tikkytokky.ui.viewmodel.TransformationViewModel
import com.benko.tikkytokky.ui.viewmodel.VaultViewModel
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Manual Dependency Injection for Core Services
        val database = AppDatabase.getDatabase(this)
        val settingsManager = SettingsManager(this)
        val keyManager = KeyManager(database.apiKeyDao())
        val hashtagManager = HashtagManager(this)
        val videoEngine = VideoTransformationEngine(this, settingsManager)
        
        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(GeminiKeyInterceptor(keyManager))
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl("https://generativelanguage.googleapis.com/")
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
        
        val geminiApi = retrofit.create(GeminiApi::class.java)
        
        val waveRepository = WaveRepository(database.waveDao(), geminiApi)
        val projectRepository = ProjectRepository(database.projectDao(), geminiApi, settingsManager)
        val socialManager = SocialInteractionManager(geminiApi, settingsManager)
        
        // Initialize all 6 required ViewModels
        val dashboardViewModel = DashboardViewModel(waveRepository, projectRepository, hashtagManager)
        val vaultViewModel = VaultViewModel(projectRepository)
        val settingsViewModel = SettingsViewModel(settingsManager)
        val interactionViewModel = InteractionViewModel(socialManager)
        val keyManagementViewModel = KeyManagementViewModel(database.apiKeyDao())
        val transformationViewModel = TransformationViewModel(videoEngine, settingsManager)

        setContent {
            TikkytokkyTheme {
                TikkytokkyApp(
                    dashboardViewModel = dashboardViewModel,
                    vaultViewModel = vaultViewModel,
                    settingsViewModel = settingsViewModel,
                    interactionViewModel = interactionViewModel,
                    keyManagementViewModel = keyManagementViewModel,
                    transformationViewModel = transformationViewModel
                )
            }
        }
    }
}

@Composable
fun TikkytokkyApp(
    dashboardViewModel: DashboardViewModel,
    vaultViewModel: VaultViewModel,
    settingsViewModel: SettingsViewModel,
    interactionViewModel: InteractionViewModel,
    keyManagementViewModel: KeyManagementViewModel,
    transformationViewModel: TransformationViewModel
) {
    val navController = rememberNavController()
    
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar(
                containerColor = Color.Black.copy(alpha = 0.8f),
                contentColor = Color.White
            ) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                
                // All 5 core navigation tabs defined
                val items = listOf(
                    Triple(Screen.Dashboard, "Waves", Icons.Default.Dashboard),
                    Triple(Screen.Vault, "Vault", Icons.Default.VideoLibrary),
                    Triple(Screen.Social, "Social", Icons.Default.Psychology),
                    Triple(Screen.Transformation, "Transform", Icons.Default.AutoAwesome),
                    Triple(Screen.Settings, "Settings", Icons.Default.Settings)
                )
                
                items.forEach { (screen, label, icon) ->
                    val selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true
                    NavigationBarItem(
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label) },
                        selected = selected,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            unselectedIconColor = Color.Gray,
                            unselectedTextColor = Color.Gray,
                            indicatorColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            NavGraph(
                navController = navController,
                dashboardViewModel = dashboardViewModel,
                vaultViewModel = vaultViewModel,
                settingsViewModel = settingsViewModel,
                interactionViewModel = interactionViewModel,
                keyManagementViewModel = keyManagementViewModel,
                transformationViewModel = transformationViewModel
            )
        }
    }
}
