import { Transform } from '../ecs/components/Transform.js';
import { Physics } from '../ecs/components/Physics.js';
import { Sprite } from '../ecs/components/Sprite.js';
import { Collider } from '../ecs/components/Collider.js';
import { Item } from '../ecs/components/Item.js';
import { PowerUp } from '../ecs/components/PowerUp.js';
import { Lifetime } from '../ecs/components/Lifetime.js';

/**
 * Falling Item Prefab Factory
 *
 * Creates falling item entities with all necessary components.
 *
 * Usage:
 *   const entity = FallingItemPrefab.create(world, {
 *       texture: basketTexture,
 *       itemConfig: config,
 *       x: 100,
 *       y: 0,
 *       speed: 2
 *   });
 */
export class FallingItemPrefab {
    /**
     * Create a falling item entity
     * @param {World} world - ECS world
     * @param {Object} options - Configuration
     * @returns {Entity}
     */
    static create(world, options = {}) {
        const {
            id = null,
            texture,
            itemConfig,
            x = 0,
            y = -50,
            speed = 2,
            rotation = 0,
            scale = 1,
            colliderWidth = 32,
            colliderHeight = 32
        } = options;

        // Create entity
        const entity = world.createEntity(id);

        // Add Transform
        entity.addComponent(new Transform(x, y, rotation, scale));

        // Add Physics (falling)
        const physics = new Physics(0, speed, 0, 0);
        entity.addComponent(physics);

        // Add Sprite
        const sprite = new Sprite(texture);
        entity.addComponent(sprite);

        // Add Collider
        const collider = new Collider(colliderWidth, colliderHeight);
        entity.addComponent(collider);

        // Add Item or PowerUp component
        if (itemConfig.effectType) {
            // It's a power-up
            const powerUp = new PowerUp(itemConfig);
            powerUp.effectType = itemConfig.effectType;
            powerUp.effectValue = itemConfig.effectValue;
            powerUp.duration = itemConfig.duration;
            entity.addComponent(powerUp);
            entity.addTag('powerup');
        } else {
            // It's a regular item
            const item = new Item(itemConfig);
            item.scoreValue = itemConfig.scoreValue || 0;
            item.gameOver = itemConfig.gameOver || false;
            entity.addComponent(item);

            if (item.isGameOver()) {
                entity.addTag('danger');
            } else if (item.isScoreable()) {
                entity.addTag('scoreable');
            }
        }

        // Add general tag
        entity.addTag('item');

        return entity;
    }

    /**
     * Create a player entity
     * @param {World} world - ECS world
     * @param {Object} options - Configuration
     * @returns {Entity}
     */
    static createPlayer(world, options = {}) {
        const {
            id = 'player',
            texture,
            x = 400,
            y = 500,
            scale = 1,
            colliderWidth = 64,
            colliderHeight = 64
        } = options;

        const entity = world.createEntity(id);

        // Transform
        entity.addComponent(new Transform(x, y, 0, scale));

        // Sprite
        entity.addComponent(new Sprite(texture));

        // Collider
        entity.addComponent(new Collider(colliderWidth, colliderHeight));

        // Tag
        entity.addTag('player');

        return entity;
    }

    /**
     * Create a particle entity
     * @param {World} world - ECS world
     * @param {Object} options - Configuration
     * @returns {Entity}
     */
    static createParticle(world, options = {}) {
        const {
            id = null,
            x = 0,
            y = 0,
            velocityX = 0,
            velocityY = 0,
            color = 0xFFFFFF,
            lifetime = 1000,
            scale = 1
        } = options;

        const entity = world.createEntity(id);

        // Transform
        entity.addComponent(new Transform(x, y, 0, scale));

        // Physics
        entity.addComponent(new Physics(velocityX, velocityY, 0.5, 0.02));

        // Sprite (simple colored square)
        const sprite = new Sprite(null);
        sprite.tint = color;
        entity.addComponent(sprite);

        // Lifetime (auto-destroy)
        entity.addComponent(new Lifetime(lifetime));

        // Tag
        entity.addTag('particle');

        return entity;
    }
}
