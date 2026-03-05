# Project Plan

Porting the tikkytokky Android project to a Chrome Extension (Manifest V3). This involves harvesting logic from the existing Kotlin code and transplanting it into a JavaScript-based extension environment, including video processing via WASM, DOM-based interaction, and a sidePanel UI.

## Project Brief

# Project Brief: tikkytokky (Chrome Extension Port)

A high-velocity TikTok Shorts automation platform designed for rapid trend capitalization, now being ported from Android to a Manifest V3 Chrome Extension.

### Features

*   **Video Transformation Engine (WASM)**: Uses `ffmpeg.wasm` in an Offscreen Document to perform bitstream randomization (1% zoom, 0.1-deg rotation, metadata stripping) locally in the browser.
*   **AI Key Rotation Pool**: Resilient system supporting multiple Gemini API keys with round-robin rotation, 429 error handling, and XOR/Base64 obfuscation, persisted in `chrome.storage.local`.
*   **Stealth Social Persona & Ghost Typist**: Ported biometrics and interaction logic (`lib/Humanizer.js`) to simulate human-like behavior using DOM interactions and `dispatchEvent`.
*   **Nostalgic Glitch-Tech Glassmorphism UI**: A futuristic "2026 standard" interface built with HTML/CSS, featuring depth-oriented translucent surfaces and vibrant energetic accents in a Chrome `sidePanel`.
*   **AI Trend & Niche Analysis**: Real-time wave analysis using Gemini 3 Flash to identify and automate content generation for the "Nostalgic Glitch-Tech" niche.

### High-Level Technical Stack

*   **JavaScript (ES6+)**: The core language for the Chrome Extension.
*   **Manifest V3**: The modern extension architecture.
*   **FFmpeg.WASM**: For local video manipulation.
*   **Chrome Storage API**: For local data persistence.
*   **Gemini 3 Flash API**: The primary AI engine.
*   **HTML/CSS**: For building the Glassmorphism sidePanel UI.

### Porting Roadmap

1.  **Task_1_Extension_Foundation**: Initialize the `/dist_extension` folder with `manifest.json`, background service worker, and basic storage logic.
2.  **Task_2_Key_Rotation_Port**: Port the multi-key rotation and XOR obfuscation logic to the background service worker.
3.  **Task_3_SidePanel_UI_Port**: Rebuild the Glassmorphism UI (Dashboard, Vault, Social, Transform, Settings) using HTML/CSS for the Chrome sidePanel.
4.  **Task_4_Humanizer_Interaction_Port**: Port the `humanoidType` and `naturalClick` logic to `content.js` and `lib/Humanizer.js`.
5.  **Task_5_Video_WASM_Port**: Implement the video transformation engine using `ffmpeg.wasm` in an Offscreen Document.
6.  **Task_6_Verify_Extension**: Final stability and feature verification of the Chrome Extension.

## Implementation Steps

### Task_1_Foundation: Set up the core data and network infrastructure. Implement the Room database for local storage (Waves and Projects), configure DataStore for settings, and set up the Retrofit/AI service client for Gemini 3 Flash integration.
- **Status:** COMPLETED
- **Updates:** Implemented Room database for local storage (Waves and Projects), configured DataStore for settings, and set up the Retrofit/AI service client for Gemini 3 Flash integration. Secured API key loading via local.properties and BuildConfig. Verified with a successful debug build.
- **Acceptance Criteria:**
  - Room database and DAOs for Waves and Projects are implemented
  - Gemini AI service client is configured (API Key integration included)
  - DataStore is set up for persisting AI persona settings
  - Project builds successfully

### Task_2_Analysis_Vault_UI: Create the AI Wave Analysis Dashboard and the Local Project Vault UI. Implement trend detection logic using Gemini 3 Flash and connect the Vault to the local Room database.
- **Status:** COMPLETED
- **Updates:** Implemented the AI Wave Analysis Dashboard and the Local Project Vault UI for the tikkytokky app. Developed a modern Glassmorphism UI (2026 standard) using Material Design 3 and vibrant neon accents. Integrated Gemini 3 Flash for trend detection and connected the Vault to the local Room database for content management. Implemented seamless navigation and verified with a successful build.
- **Acceptance Criteria:**
  - Wave Analysis Dashboard displays real-time AI-detected trends
  - Project Vault lists and manages saved content drafts
  - Navigation between main screens is functional
  - The implemented UI follows Material Design 3 guidelines

### Task_3_Automation_Settings_UI: Develop the One-Tap Automation Engine and the AI Customization Settings screen. Implement the logic for AI-driven script generation and persona fine-tuning.
- **Status:** COMPLETED
- **Updates:** Implemented the One-Tap Automation Engine and the AI Customization Settings screen for the tikkytokky app. Developed a modern Glassmorphism UI (2026 standard) using Material Design 3 and vibrant neon accents. Integrated Gemini 3 Flash for script generation and metadata creation. Connected the Settings screen to the previously configured DataStore for persona fine-tuning. Verified with a successful build.
- **Acceptance Criteria:**
  - Automation Engine generates scripts and metadata via Gemini 3 Flash
  - Settings screen allow customization of AI personas
  - Generated content is persisted to the local Room vault
  - The implemented UI follows Material Design 3 guidelines

### Task_4_UI_Polish_Branding: Refine the application's look and feel with a 2026-standard Glassmorphism UI. Implement full edge-to-edge display and create a custom adaptive app icon.
- **Status:** COMPLETED
- **Updates:** Refined the application's look and feel with a 2026-standard Glassmorphism UI. Implemented full edge-to-edge display and created a custom adaptive app icon. Verified that the app features translucent surfaces and vibrant energetic accents, and that dark and light themes are fully supported. successfully completed Task 4.
- **Acceptance Criteria:**
  - UI features translucent surfaces and vibrant energetic accents
  - Adaptive app icon matches the tikkytokky branding
  - Full edge-to-edge display is implemented correctly
  - Dark and Light themes are fully supported

### Task_5_Run_and_Verify: Perform a final build, run the application, and verify all features against the requirements. Ensure stability and UI fidelity.
- **Status:** COMPLETED
- **Updates:** Performed a final clean build and verified all core features against the requirements. The application is stable, functionally complete, and features a premium 2026-standard Glassmorphism UI. All components (Wave Analysis, Automation, Vault, and Settings) are verified and operational. The adaptive app icon and edge-to-edge display are correctly implemented.
- **Acceptance Criteria:**
  - Application builds and runs without crashes
  - All core features (Wave Analysis, Automation, Vault) are verified functional
  - UI matches the Glassmorphism and Material Design 3 standards
  - All existing tests pass

### Task_6_Social_Persona_Logic: Expand the automation engine with Social Persona and AI Interaction logic. Update DataStore for Mood/Persona settings, refactor Gemini prompts for contextual replies, and implement the Smart Follow engine with anti-ban throttling and human-centric simulation.
- **Status:** COMPLETED
- **Updates:** Expanded the automation engine with Social Persona and AI Interaction logic. Updated DataStore for Mood/Persona settings, refactor Gemini prompts for contextual replies, and implemented the Smart Follow engine with anti-ban throttling and human-centric simulation (jittered delays and humanoid typing). Verified with a successful build.
- **Acceptance Criteria:**
  - DataStore persists 'Mood' and 'Active Persona' settings
  - Gemini API generates context-aware, mood-specific replies
  - Smart Follow logic includes niche detection and throttling
  - Human-centric simulation (jittered delays) is implemented

### Task_7_Social_UI_and_Verification: Build the Social Interaction Dashboard and update Settings with a Mood selector. Refine the Glassmorphism UI for new components and perform a final comprehensive run and verify.
- **Status:** COMPLETED
- **Updates:** Built the Social Interaction Dashboard with a 2026 Glassmorphism UI, added a Mood selector (Funny, Sarcastic, Professional) and "Active Persona Mode" toggle to the Settings screen. Integrated these with the DataStore and SocialInteractionManager logic. Verified that all social features are correctly integrated into the UI and the app builds successfully without crashes.
- **Acceptance Criteria:**
  - Social Interaction Dashboard implemented with Glassmorphism UI
  - Mood selector (Funny, Sarcastic, Professional) added to Settings
  - App builds successfully and does not crash
  - All social features verified against requirements

### Task_8_Key_Rotation_Infrastructure: Implement the secure multi-key pool storage (Room/DataStore) with XOR/Base64 obfuscation. Develop the custom OkHttp Interceptor for round-robin key rotation and 429 Rate Limit/Cooldown handling.
- **Status:** COMPLETED
- **Updates:** Implemented the secure multi-key pool storage (Room/DataStore) with XOR/Base64 obfuscation. Developed the custom OkHttp Interceptor for round-robin key rotation and 429 Rate Limit/Cooldown handling. Built a dedicated Key Management UI for adding, removing, and monitoring API keys with status indicators. Verified with a successful build.
- **Acceptance Criteria:**
  - Multi-key storage implemented with obfuscation
  - OkHttp Interceptor handles round-robin rotation across active keys
  - Automatic 429 error handling and key cooldown logic is functional
  - API key logging is restricted to the first 4 characters

### Task_9_Key_Management_UI_Verification: Create the Key Management UI for adding, removing, and monitoring Gemini API keys with status indicators. Perform a final comprehensive run and stability verification of the entire application.
- **Status:** COMPLETED
- **Updates:** Implemented the Key Management UI for adding, removing, and monitoring Gemini API keys with status indicators (Active, Rate Limited, Cooldown). Integrated the UI with the existing navigation and settings screens. Verified that the key rotation logic (round-robin and 429 error handling) is correctly reflected in the UI and that all previous features (Social Persona, Automation, Vault) remain functional. Performed a final comprehensive stability check and confirmed the app builds and runs successfully.
- **Acceptance Criteria:**
  - Key Management UI implemented with Glassmorphism theme
  - Key status indicators (Active, Rate Limited, Cooldown) are functional
  - Final application build passes and app does not crash
  - All features including Key Rotation and Social Persona are verified functional

### Task_10_Niche_Growth_Logic: Refactor Gemini prompts to adopt the 'Nostalgic Glitch-Tech' persona and implement the Niche Hashtag 'Shotgun' Engine. Integrate clipboard functionality for one-click hashtag copying.
- **Status:** COMPLETED
- **Updates:** Refactored Gemini prompts to adopt the 'Gen Z nostalgia growth hacker' persona and implemented the Niche Hashtag 'Shotgun' Engine with clipboard integration. The AI now specifically focuses on the 2005-2015 'Glitch-Tech' era (Limewire, MySpace, BBM, early YouTube). Developed a 'HashtagManager' with 10 pre-set clusters and integrated 'Shotgun' functionality into the DashboardViewModel. Verified that all existing stealth, key rotation, and social persona features remain fully functional. Project builds successfully.
- **Acceptance Criteria:**
  - Gemini prompts updated with 'Gen Z nostalgia growth hacker' context
  - Hashtag 'Shotgun' Engine supports 10 pre-set clusters
  - Clipboard interaction functional for hashtag copying
  - Project builds successfully

### Task_11_Niche_UI_and_Verification: Build the Niche Growth Dashboard using Glassmorphism UI components. Perform a final comprehensive 'Run and Verify' to ensure stability and alignment with growth expansion requirements.
- **Status:** COMPLETED
- **Updates:** Built the Niche Growth Dashboard using Glassmorphism UI components, including the 'Shotgun' button for one-click hashtag copying and a niche selection dropdown. Integrated these features with the DashboardViewModel and InteractionViewModel. Performed a final comprehensive 'Run and Verify' to ensure the Gemini AI adopts the 'Nostalgic Glitch-Tech' persona and all features (Social, Key Rotation, Niche Growth) are stable and functional. Verified with a successful build.
- **Acceptance Criteria:**
  - Niche Growth Dashboard UI implemented and matches 2026 standards
  - UI includes 'Shotgun' button and niche selection
  - Make sure all existing tests pass, build pass and app does not crash
  - All features (Social, Key Rotation, Niche Growth) verified functional

### Task_12_Video_Transformation_Logic: Integrate FFmpeg-Kit and OpenCV SDK. Implement local video transformation logic including scaling, cropping, flipping, and hue/saturation shifting. Implement OpenCV-based text detection and inpainting/blurring for privacy/uniqueness. Update DataStore/Room for transformation preferences.
- **Status:** COMPLETED
- **Updates:** Integrated FFmpeg-Kit and OpenCV SDK into the project. Developed a local Video Transformation Engine capable of scaling (1.1x), cropping, shifting hue/saturation (3-5%), and horizontal flipping. Implemented OpenCV-based text detection and inpainting/blurring for video uniqueness. Updated DataStore and SettingsManager to persist transformation preferences and added a new TransformationViewModel to manage the engine's state. Verified with a successful build.
- **Acceptance Criteria:**
  - FFmpeg-Kit and OpenCV SDK are integrated into the project
  - Video transformation engine performs scale, crop, flip, and color shifts
  - OpenCV text detection and blurring is functional
  - Transformation preferences are persisted in Room/DataStore
  - Build pass

### Task_13_Transformation_UI_Verify: Build the Transformation Control Center UI using Glassmorphism (2026 standard) with intensity sliders and randomization controls. Perform a final comprehensive run and verify to ensure application stability and requirement alignment.
- **Status:** COMPLETED
- **Updates:** Implemented the Bitstream Fingerprint Randomizer for the tikkytokky Android app. The VideoTransformationEngine now performs a 'Digital Fingerprint Refresh' using FFmpeg-Kit, including a 1% subtle zoom, 0.1 degree micro-rotation, randomized CRF adjustments, and metadata stripping. Updated the Transformation UI with a 'Bitstream Randomizer' toggle. Correctly implemented all 5 navigation tabs (Waves, Vault, Social, Transform, Settings) in MainActivity.kt and verified the initialization of all ViewModels (Dashboard, Vault, Settings, Interaction, KeyManagement, Transformation). All existing features (Gemini Rotation, Social Persona, Ghost Typist, Identity Layer, Niche Growth) are preserved and functional. Project builds successfully.
- **Acceptance Criteria:**
  - Transformation Control Center UI implemented with sliders and randomization options
  - UI follows 2026 Glassmorphism aesthetic
  - Make sure all existing tests pass, build pass and app does not crash
  - Application remains stable with all features (Social, Keys, Niche, Video) functional

### Task_14_Extension_Foundation_Logic: Initialize the Chrome Extension environment (Manifest V3) and port the core infrastructure. Set up the background service worker, chrome.storage persistence, and the multi-key rotation logic. Build the 2026-standard Glassmorphism UI for the sidePanel.
- **Status:** COMPLETED
- **Updates:** Initialized the Chrome Extension environment (Manifest V3) in the /dist_extension folder. Ported the core infrastructure, including the round-robin key rotation and XOR/Base64 obfuscation logic to background.js. Set up chrome.storage.local for persistence. Built the 2026-standard Glassmorphism UI for the sidePanel using HTML/CSS, featuring depth-oriented translucent surfaces and vibrant neon accents. Implemented the Niche Analysis logic (Nostalgic Glitch-Tech) within the extension environment and established a message-passing system between sidepanel.js and background.js. Verified that manifest.json and the service worker are operational. Project builds successfully.
- **Acceptance Criteria:**
  - manifest.json and service worker are operational
  - Key rotation logic with XOR obfuscation is ported to JS
  - SidePanel UI features depth-oriented translucent surfaces
  - Niche Analysis logic is functional in the extension environment

### Task_15_Advanced_Engines_Final_Verify: Port the Humanizer interaction logic and implement the Video Transformation Engine using ffmpeg.wasm in an Offscreen Document. Integrate DOM interactions and perform a final Run and Verify of the Chrome Extension.
- **Status:** COMPLETED
- **Updates:** Ported the Humanizer interaction logic and implemented the Video Transformation Engine using ffmpeg.wasm in an Offscreen Document. Integrated the Ghost Typist biometrics (Gaussian delays, dwell times, fat-finger typos) and naturalClick functionality (scroll-into-view, reaction delays, trusted events) to lib/Humanizer.js. Set up an Offscreen Document to run ffmpeg.wasm for the "Bitstream Fingerprint Randomizer" pass (1% zoom, 0.1-deg rotation, metadata stripping). Developed a content script (content.js) to detect TikTok's upload and player pages and integrate the Humanizer logic. Verified that all ported features (Key Rotation, Social Persona, Niche Growth, Ghost Typist, and Video WASM) are functional in the Chrome environment and the sidePanel UI matches the 2026 Glassmorphism standard. Final extension builds successfully in the /dist_extension folder.
- **Acceptance Criteria:**
  - Humanoid interaction logic ported to lib/Humanizer.js
  - ffmpeg.wasm performs bitstream randomization and metadata stripping
  - Extension successfully interacts with social platforms via content scripts
  - Final extension builds successfully, all features verified, and no crashes
- **Duration:** N/A

