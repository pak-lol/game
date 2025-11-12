import { System } from '../System.js';
import * as PIXI from 'pixi.js';

/**
 * RenderSystem - Renders sprites
 *
 * Processes entities with: Transform + Sprite
 *
 * Features:
 * - Creates PIXI sprites from texture
 * - Updates sprite position/rotation/scale
 * - Handles visibility
 */
export class RenderSystem extends System {
    constructor(stage) {
        super(['Transform', 'Sprite'], 60); // Priority 60 (render last)
        this.stage = stage;
    }

    /**
     * Initialize system
     */
    init(world) {
        this.world = world;
    }

    /**
     * Process entities for rendering
     */
    process(entities, delta) {
        for (const entity of entities) {
            const transform = entity.getComponent('Transform');
            const spriteComp = entity.getComponent('Sprite');

            // Create PIXI sprite if not exists
            if (!spriteComp.sprite && spriteComp.texture) {
                spriteComp.sprite = new PIXI.Sprite(spriteComp.texture);
                spriteComp.sprite.anchor.set(spriteComp.anchor.x, spriteComp.anchor.y);
                this.stage.addChild(spriteComp.sprite);
            }

            // Update sprite from transform
            if (spriteComp.sprite) {
                spriteComp.sprite.x = transform.x;
                spriteComp.sprite.y = transform.y;
                spriteComp.sprite.rotation = transform.rotation;
                spriteComp.sprite.scale.set(transform.scale);
                spriteComp.sprite.tint = spriteComp.tint;
                spriteComp.sprite.alpha = spriteComp.alpha;
                spriteComp.sprite.visible = spriteComp.visible;
            }
        }
    }

    /**
     * Cleanup - remove all sprites
     */
    destroy() {
        const entities = this.world.getAllEntities();
        for (const entity of entities) {
            const spriteComp = entity.getComponent('Sprite');
            if (spriteComp && spriteComp.sprite) {
                if (spriteComp.sprite.parent) {
                    spriteComp.sprite.parent.removeChild(spriteComp.sprite);
                }
                spriteComp.sprite.destroy();
                spriteComp.sprite = null;
            }
        }
        super.destroy();
    }
}
