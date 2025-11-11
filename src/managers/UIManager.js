// GameOverScreen removed - now using GameOverModal

/**
 * Manages UI screens and transitions
 */
export class UIManager {
    constructor() {
        this.currentScreen = null;
        this.stage = null;
        this.scoreService = null;
    }

    /**
     * Set score service reference
     * @param {ScoreService} scoreService
     */
    setScoreService(scoreService) {
        this.scoreService = scoreService;
    }

    /**
     * Set the stage reference
     * @param {PIXI.Container} stage - PixiJS stage
     */
    setStage(stage) {
        this.stage = stage;
    }

    // showGameOverScreen removed - now using GameOverModal directly in Game.js

    /**
     * Hide current screen
     */
    hideCurrentScreen() {
        if (this.currentScreen && this.stage) {
            this.currentScreen.removeFromStage(this.stage);

            // Clean up if destroy method exists
            if (typeof this.currentScreen.destroy === 'function') {
                this.currentScreen.destroy();
            }

            this.currentScreen = null;
        }
    }

    /**
     * Show start screen (HTML)
     */
    showStartScreen() {
        this.hideCurrentScreen();

        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide start screen (HTML)
     */
    hideStartScreen() {
        const startScreen = document.getElementById('startScreen');
        if (startScreen) {
            startScreen.classList.add('hidden');
        }
    }



    /**
     * Clean up all screens
     */
    destroy() {
        this.hideCurrentScreen();
        this.stage = null;
        this.scoreService = null;
    }
}
