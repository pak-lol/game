export const GAME_CONFIG = {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x0F2027,
    spawnInterval: 50,
    defaultLocale: 'lt',
    itemTypes: {
        CHIMKE: 'chimke',
        VORINIO_DUMAI: 'vorinio_dumai'
    }
};

// Update dimensions on resize
export function updateGameDimensions() {
    GAME_CONFIG.width = window.innerWidth;
    GAME_CONFIG.height = window.innerHeight;
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
    minSpeed: 2,
    maxSpeed: 3.5,
    minRotationSpeed: -0.08,
    maxRotationSpeed: 0.08,
    minSwingSpeed: 0.02,
    maxSwingSpeed: 0.07,
    minSwingAmount: 10,
    maxSwingAmount: 20,
    // Responsive font size
    getFontSize: () => Math.max(12, Math.min(16, GAME_CONFIG.width / 50))
};

export const PARTICLE_CONFIG = {
    count: 8,
    size: 3,
    speed: 3,
    life: 30,
    fadeSpeed: 0.03
};
