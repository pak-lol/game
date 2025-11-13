import * as PIXI from 'pixi.js';
import { GAME_CONFIG, PLAYER_CONFIG } from '../config.js';

export class Player {
    constructor(texture) {
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 0.5);
        
        // Scale based on screen size
        const scale = Math.min(PLAYER_CONFIG.scale, GAME_CONFIG.width / 1000);
        this.sprite.scale.set(scale);

        // Store bound methods for cleanup
        this.boundHandleMove = null;
        this.boundHandleTouch = null;
        this.boundHandleTouchEnd = null;
        this.canvas = null;

        this.updateBounds();
    }

    updateBounds() {
        this.sprite.x = GAME_CONFIG.width / 2;
        this.sprite.y = GAME_CONFIG.height - PLAYER_CONFIG.yOffset;
    }

    setupControls(canvas) {
        this.canvas = canvas;
        
        // Create bound methods for cleanup
        this.boundHandleMove = (e) => this.handleMove(e, canvas);
        this.boundHandleTouch = (e) => this.handleTouch(e, canvas);
        this.boundHandleTouchEnd = (e) => e.preventDefault();

        // Mouse controls
        canvas.addEventListener('mousemove', this.boundHandleMove);
        
        // Touch controls with better mobile support
        canvas.addEventListener('touchstart', this.boundHandleTouch, { passive: false });
        canvas.addEventListener('touchmove', this.boundHandleTouch, { passive: false });
        canvas.addEventListener('touchend', this.boundHandleTouchEnd, { passive: false });
    }

    handleMove(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        // Calculate position relative to canvas logical size, not display size
        const scaleX = GAME_CONFIG.width / rect.width;
        const mouseX = (e.clientX - rect.left) * scaleX;
        this.updatePosition(mouseX);
    }

    handleTouch(e, canvas) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            // Calculate position relative to canvas logical size, not display size
            const scaleX = GAME_CONFIG.width / rect.width;
            const touchX = (e.touches[0].clientX - rect.left) * scaleX;
            this.updatePosition(touchX);
        }
    }

    updatePosition(x) {
        const minX = PLAYER_CONFIG.minX;
        const maxX = GAME_CONFIG.width - PLAYER_CONFIG.maxXOffset;
        this.sprite.x = Math.max(minX, Math.min(maxX, x));
    }

    getBounds() {
        return this.sprite.getBounds();
    }

    addToStage(stage) {
        stage.addChild(this.sprite);
    }

    /**
     * Clean up event listeners to prevent memory leaks
     */
    destroy() {
        if (this.canvas && this.boundHandleMove) {
            this.canvas.removeEventListener('mousemove', this.boundHandleMove);
            this.canvas.removeEventListener('touchstart', this.boundHandleTouch);
            this.canvas.removeEventListener('touchmove', this.boundHandleTouch);
            this.canvas.removeEventListener('touchend', this.boundHandleTouchEnd);
        }

        // Clean up references
        this.boundHandleMove = null;
        this.boundHandleTouch = null;
        this.boundHandleTouchEnd = null;
        this.canvas = null;

        // Destroy sprite
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}
