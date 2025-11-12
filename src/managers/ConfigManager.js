/**
 * ConfigManager - Centralized configuration management
 * Loads items and powerups from JSON files
 */
export class ConfigManager {
    constructor() {
        this.items = null;
        this.powerups = null;
        this.loaded = false;
    }

    /**
     * Load all configuration from JSON files
     */
    async load() {
        try {
            console.log('[ConfigManager] Loading configuration...');

            // Load items and powerups in parallel
            const [itemsResponse, powerupsResponse] = await Promise.all([
                fetch('/data/items.json'),
                fetch('/data/powerups.json')
            ]);

            if (!itemsResponse.ok || !powerupsResponse.ok) {
                throw new Error('Failed to load configuration files');
            }

            this.items = await itemsResponse.json();
            this.powerups = await powerupsResponse.json();

            this.loaded = true;
            console.log('[ConfigManager] Configuration loaded successfully');
            console.log(`  - Items: ${Object.keys(this.items).length}`);
            console.log(`  - Powerups: ${Object.keys(this.powerups).length}`);

            return true;
        } catch (error) {
            console.error('[ConfigManager] Failed to load configuration:', error);
            throw error;
        }
    }

    /**
     * Get all items
     */
    getItems() {
        if (!this.loaded) {
            console.warn('[ConfigManager] Configuration not loaded yet!');
            return {};
        }
        return this.items;
    }

    /**
     * Get all powerups
     */
    getPowerups() {
        if (!this.loaded) {
            console.warn('[ConfigManager] Configuration not loaded yet!');
            return {};
        }
        return this.powerups;
    }

    /**
     * Get specific item by ID
     */
    getItem(id) {
        if (!this.loaded) {
            console.warn('[ConfigManager] Configuration not loaded yet!');
            return null;
        }
        return this.items[id] || null;
    }

    /**
     * Get specific powerup by ID
     */
    getPowerup(id) {
        if (!this.loaded) {
            console.warn('[ConfigManager] Configuration not loaded yet!');
            return null;
        }
        return this.powerups[id] || null;
    }

    /**
     * Get all asset paths that need to be loaded
     */
    getAllAssetPaths() {
        if (!this.loaded) {
            console.warn('[ConfigManager] Configuration not loaded yet!');
            return [];
        }

        const paths = [];

        // Collect item assets
        Object.values(this.items).forEach(item => {
            if (item.assetPath && !paths.includes(item.assetPath)) {
                paths.push({
                    key: item.texture,
                    path: item.assetPath
                });
            }
        });

        // Collect powerup assets
        Object.values(this.powerups).forEach(powerup => {
            if (powerup.assetPath && !paths.find(p => p.path === powerup.assetPath)) {
                paths.push({
                    key: powerup.texture,
                    path: powerup.assetPath
                });
            }
        });

        return paths;
    }

    /**
     * Get total rarity weight for items
     */
    getTotalItemRarity() {
        if (!this.loaded) return 0;
        return Object.values(this.items).reduce((sum, item) => sum + (item.rarity || 0), 0);
    }

    /**
     * Get random item based on rarity weights
     */
    getRandomItem() {
        if (!this.loaded) return null;

        const totalWeight = this.getTotalItemRarity();
        let random = Math.random() * totalWeight;

        for (const item of Object.values(this.items)) {
            random -= item.rarity;
            if (random <= 0) {
                return item;
            }
        }

        // Fallback to first item
        return Object.values(this.items)[0];
    }

    /**
     * Get random powerup based on spawn chance
     */
    getRandomPowerup() {
        if (!this.loaded) return null;

        const powerups = Object.values(this.powerups);

        for (const powerup of powerups) {
            if (Math.random() < powerup.spawnChance) {
                return powerup;
            }
        }

        return null; // No powerup spawned
    }

    /**
     * Check if configuration is loaded
     */
    isLoaded() {
        return this.loaded;
    }
}

// Export singleton instance
export const configManager = new ConfigManager();
