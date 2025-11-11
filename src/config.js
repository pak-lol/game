/**
 * Get safe viewport dimensions
 * Handles Telegram viewport and device safe areas
 */
function getSafeViewportDimensions() {
    // Check if Telegram Web App is available
    const tg = window.Telegram?.WebApp;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Use Telegram's stable viewport height if available
    if (tg && tg.viewportStableHeight) {
        height = tg.viewportStableHeight;
        console.log('Using Telegram stable viewport height:', height);
    } else if (tg && tg.viewportHeight) {
        height = tg.viewportHeight;
        console.log('Using Telegram viewport height:', height);
    }

    // Account for safe area insets (notches, etc.)
    if (tg && tg.safeAreaInset) {
        const topInset = tg.safeAreaInset.top || 0;
        const bottomInset = tg.safeAreaInset.bottom || 0;
        height = height - topInset - bottomInset;
        console.log(`Adjusting for safe area insets - top: ${topInset}, bottom: ${bottomInset}`);
    }

    // Ensure minimum dimensions
    width = Math.max(320, width);
    height = Math.max(400, height);

    // Ensure reasonable aspect ratio (prevent extreme stretching)
    const aspectRatio = width / height;
    if (aspectRatio > 1) {
        // Landscape - limit width
        width = Math.min(width, height * 1.5);
    }

    return { width, height };
}

// Get initial dimensions
const initialDimensions = getSafeViewportDimensions();

export const GAME_CONFIG = {
    width: initialDimensions.width,
    height: initialDimensions.height,
    backgroundColor: 0x0F2027,
    spawnInterval: 50,
    defaultLocale: 'lt',
    itemTypes: {
        CHIMKE: 'chimke',
        VORINIO_DUMAI: 'vorinio_dumai'
    }
};

/**
 * Update dimensions on resize or Telegram viewport change
 */
export function updateGameDimensions() {
    const dimensions = getSafeViewportDimensions();
    const oldWidth = GAME_CONFIG.width;
    const oldHeight = GAME_CONFIG.height;

    GAME_CONFIG.width = dimensions.width;
    GAME_CONFIG.height = dimensions.height;

    console.log(`Game dimensions updated: ${oldWidth}x${oldHeight} -> ${GAME_CONFIG.width}x${GAME_CONFIG.height}`);
}

export const PLAYER_CONFIG = {
    scale: 0.8,
    yOffset: 80,
    minX: 40,
    maxXOffset: 40
};

export const ITEM_CONFIG = {
    minScale: 0.4,
    maxScale: 0.7,
    baseMinSpeed: 2,
    baseMaxSpeed: 3.5,
    minRotationSpeed: -0.08,
    maxRotationSpeed: 0.08,
    minSwingSpeed: 0.02,
    maxSwingSpeed: 0.07,
    minSwingAmount: 10,
    maxSwingAmount: 20,
    // Responsive font size
    getFontSize: () => Math.max(12, Math.min(16, GAME_CONFIG.width / 50))
};

export const DIFFICULTY_CONFIG = {
    speedIncreasePerScore: 0.1, // Speed increase per point scored
    maxSpeedMultiplier: 2.5, // Maximum speed multiplier (2.5x base speed)
    spawnRateIncrease: 2, // Decrease spawn interval by this amount per score
    minSpawnInterval: 25 // Minimum spawn interval
};

export const PARTICLE_CONFIG = {
    count: 8,
    size: 3,
    speed: 3,
    life: 30,
    fadeSpeed: 0.03
};
