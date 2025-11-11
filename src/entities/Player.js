import * as PIXI from 'pixi.js';
import { GAME_CONFIG, PLAYER_CONFIG } from '../config.js';

export class Player {
    constructor(texture) {
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 0.5);
        
        // Scale based on screen size
        const scale = Math.min(PLAYER_CONFIG.scale, GAME_CONFIG.width / 1000);
        this.sprite.scale.set(scale);

        this.updateBounds();
    }

    updateBounds() {
        this.sprite.x = GAME_CONFIG.width / 2;
        this.sprite.y = GAME_CONFIG.height - PLAYER_CONFIG.yOffset;
    }

    setupControls(canvas) {
        // Mouse controls
        canvas.addEventListener('mousemove', (e) => this.handleMove(e, canvas));
        
        // Touch controls with better mobile support
        canvas.addEventListener('touchstart', (e) => this.handleTouch(e, canvas), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouch(e, canvas), { passive: false });
        canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
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
}
