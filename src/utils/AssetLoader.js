import * as PIXI from 'pixi.js';

export class AssetLoader {
    constructor() {
        this.textures = {};
    }

    /**
     * Load all assets dynamically from ConfigManager
     * @param {ConfigManager} configManager - Configuration manager instance
     */
    async loadAll(configManager) {
        try {
            console.log('[AssetLoader] Loading assets...');

            // Always load player basket
            this.textures.basket = await PIXI.Assets.load('/basket.svg');
            console.log('  ✓ Basket loaded');

            // Get all asset paths from config
            const assetPaths = configManager.getAllAssetPaths();

            // Load all assets in parallel
            const loadPromises = assetPaths.map(async ({ key, path }) => {
                try {
                    this.textures[key] = await PIXI.Assets.load(path);
                    console.log(`  ✓ ${key} loaded (${path})`);
                } catch (error) {
                    console.error(`  ✗ Failed to load ${key} from ${path}:`, error);
                    throw error;
                }
            });

            await Promise.all(loadPromises);

            console.log(`[AssetLoader] All assets loaded successfully! (${Object.keys(this.textures).length} total)`);
            return this.textures;
        } catch (error) {
            console.error('[AssetLoader] Error loading assets:', error);
            throw error;
        }
    }

    getTexture(name) {
        if (!this.textures[name]) {
            console.warn(`[AssetLoader] Texture not found: ${name}`);
        }
        return this.textures[name];
    }

    /**
     * Check if a texture exists
     */
    hasTexture(name) {
        return !!this.textures[name];
    }

    /**
     * Get all loaded texture names
     */
    getLoadedTextures() {
        return Object.keys(this.textures);
    }
}
