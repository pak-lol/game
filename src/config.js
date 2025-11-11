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
        VORINIO_DUMAI: 'vorinio_dumai',
        VORINIO_SNIEGAS: 'vorinio_sniegas',
        BUCKET: 'bucket'
    }
};

/**
 * WebSocket Configuration
 */
export const WS_CONFIG = {
    // Use secure WebSocket (wss://) for production
    url: window.location.hostname === 'localhost' 
        ? 'ws://localhost:8080'
        : 'wss://server.pax.lt:8080'
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
    maxSpeedMultiplier: 5, // Maximum speed multiplier (5x base speed)
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

/**
 * ITEMS CONFIGURATION
 * Easy to add new items - just add a new entry here!
 *
 * Properties:
 * - id: Unique identifier
 * - nameKey: Translation key for display name
 * - descriptionKey: Translation key for description (optional)
 * - texture: Texture name from AssetLoader
 * - scoreValue: Points awarded when caught (0 for bad items)
 * - gameOver: If true, catching this item ends the game
 * - rarity: Spawn weight (higher = more common)
 * - color: Text label color
 * - particleColor: Particle effect color when caught
 * - haptic: Haptic feedback type ('light', 'medium', 'heavy', 'error', 'success')
 */
export const ITEMS_CONFIG = {
    chimke: {
        id: 'chimke',
        nameKey: 'items.chimke',
        descriptionKey: 'items.chimkeDesc',
        texture: 'weedLeafBrown',
        scoreValue: 0,
        gameOver: true,
        rarity: 60,
        color: '#FF6B6B',
        particleColor: '#FF6B6B',
        haptic: 'error'
    },
    vorinio_dumai: {
        id: 'vorinio_dumai',
        nameKey: 'items.vorinioDumai',
        descriptionKey: 'items.vorinioDumaiDesc',
        texture: 'weedLeaf',
        scoreValue: 3,
        gameOver: false,
        rarity: 30,
        color: '#00FF00',
        particleColor: '#4CAF50',
        haptic: 'light'
    },
    vorinio_sniegas: {
        id: 'vorinio_sniegas',
        nameKey: 'items.vorinioSniegas',
        descriptionKey: 'items.vorinioSniegasDesc',
        texture: 'snow',
        scoreValue: 5,
        gameOver: false,
        rarity: 10,
        color: '#00FFFF',
        particleColor: '#87CEEB',
        haptic: 'medium'
    }
};

/**
 * POWER-UPS CONFIGURATION
 * Easy to add new power-ups - just add a new entry here!
 *
 * Properties:
 * - id: Unique identifier
 * - nameKey: Translation key for display name
 * - descriptionKey: Translation key for description
 * - texture: Texture name from AssetLoader
 * - icon: Emoji icon for display
 * - rarity: Spawn weight (independent of items)
 * - spawnChance: Probability to spawn (0.0 - 1.0)
 * - color: Text label color
 * - particleColor: Particle effect color
 * - haptic: Haptic feedback type
 * - duration: Effect duration in milliseconds
 * - effectType: Type of effect ('speed_multiplier', 'score_multiplier', etc.)
 * - effectValue: Value for the effect
 */
export const POWERUPS_CONFIG = {
    bucket: {
        id: 'bucket',
        nameKey: 'powerups.bucket',
        descriptionKey: 'powerups.bucketDescription',
        texture: 'bucket',
        icon: '🪣',
        rarity: 5,
        spawnChance: 0.05,
        color: '#FFD700',
        particleColor: '#FFD700',
        haptic: 'success',
        duration: 5000,
        effectType: 'speed_multiplier',
        effectValue: 0.5
    }
};

/**
 * Get total rarity weight for items
 */
export function getTotalItemRarity() {
    return Object.values(ITEMS_CONFIG).reduce((sum, item) => sum + item.rarity, 0);
}

/**
 * Get random item based on rarity weights
 */
export function getRandomItem() {
    const totalWeight = getTotalItemRarity();
    let random = Math.random() * totalWeight;

    for (const item of Object.values(ITEMS_CONFIG)) {
        random -= item.rarity;
        if (random <= 0) {
            return item;
        }
    }

    // Fallback to first item
    return Object.values(ITEMS_CONFIG)[0];
}

/**
 * Get random power-up based on spawn chance
 */
export function getRandomPowerUp() {
    const powerups = Object.values(POWERUPS_CONFIG);

    for (const powerup of powerups) {
        if (Math.random() < powerup.spawnChance) {
            return powerup;
        }
    }

    return null;
}

// Legacy config for backward compatibility
export const POWERUP_CONFIG = {
    bucket: {
        spawnChance: POWERUPS_CONFIG.bucket.spawnChance,
        duration: POWERUPS_CONFIG.bucket.duration,
        speedMultiplier: POWERUPS_CONFIG.bucket.effectValue
    }
};
