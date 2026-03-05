package com.benko.tikkytokky.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.benko.tikkytokky.ui.screens.*
import com.benko.tikkytokky.ui.viewmodel.*

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Vault : Screen("vault")
    object Social : Screen("social")
    object Transformation : Screen("transformation")
    object Settings : Screen("settings")
    object KeyManagement : Screen("key_management")
}

@Composable
fun NavGraph(
    navController: NavHostController,
    dashboardViewModel: DashboardViewModel,
    vaultViewModel: VaultViewModel,
    settingsViewModel: SettingsViewModel,
    interactionViewModel: InteractionViewModel,
    keyManagementViewModel: KeyManagementViewModel,
    transformationViewModel: TransformationViewModel
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(
                viewModel = dashboardViewModel,
                onNavigateToKeyManagement = { navController.navigate(Screen.KeyManagement.route) }
            )
        }
        composable(Screen.Vault.route) {
            VaultScreen(
                viewModel = vaultViewModel,
                onNavigateToKeyManagement = { navController.navigate(Screen.KeyManagement.route) }
            )
        }
        composable(Screen.Social.route) {
            SocialDashboardScreen(
                viewModel = interactionViewModel,
                onNavigateToKeyManagement = { navController.navigate(Screen.KeyManagement.route) }
            )
        }
        composable(Screen.Transformation.route) {
            TransformationScreen(
                viewModel = transformationViewModel,
                onNavigateToKeyManagement = { navController.navigate(Screen.KeyManagement.route) }
            )
        }
        composable(Screen.Settings.route) {
            SettingsScreen(
                viewModel = settingsViewModel,
                onNavigateToKeyManagement = { navController.navigate(Screen.KeyManagement.route) }
            )
        }
        composable(Screen.KeyManagement.route) {
            KeyManagementScreen(viewModel = keyManagementViewModel, onBack = { navController.popBackStack() })
        }
    }
}
