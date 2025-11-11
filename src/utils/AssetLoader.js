import * as PIXI from 'pixi.js';

export class AssetLoader {
    constructor() {
        this.textures = {};
    }

    async loadAll() {
        try {
            console.log('Loading assets...');
            this.textures.basket = await PIXI.Assets.load('/basket.svg');
            console.log('✓ Basket loaded');
            this.textures.weedLeaf = await PIXI.Assets.load('/weed-leaf.svg');
            console.log('✓ Weed leaf loaded');
            this.textures.weedLeafBrown = await PIXI.Assets.load('/weed-leaf-brown.svg');
            console.log('✓ Brown leaf loaded');
            this.textures.snow = await PIXI.Assets.load('/assets/snow.svg');
            console.log('✓ Snow loaded');
            this.textures.bucket = await PIXI.Assets.load('/assets/bucket.svg');
            console.log('✓ Bucket loaded');
            console.log('All assets loaded successfully!');
            return this.textures;
        } catch (error) {
            console.error('Error loading assets:', error);
            throw error;
        }
    }

    getTexture(name) {
        return this.textures[name];
    }
}
