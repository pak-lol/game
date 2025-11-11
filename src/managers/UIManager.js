import { GameOverScreen } from '../ui/GameOverScreen.js';
import { ItemsInfoScreen } from '../ui/ItemsInfoScreen.js';
import { MenuLeaderboardScreen } from '../ui/MenuLeaderboardScreen.js';
import { OptionsScreen } from '../ui/OptionsScreen.js';

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

    /**
     * Show game over screen
     * @param {string} username - Player username
     * @param {number} score - Player score
     * @param {Object} scoreData - Score data with rank info
     * @param {Array} leaderboard - Leaderboard entries
     * @param {Function} onRestart - Restart callback
     */
    showGameOverScreen(username, score, scoreData, leaderboard, onRestart) {
        this.hideCurrentScreen();

        this.currentScreen = new GameOverScreen(
            username,
            score,
            scoreData,
            leaderboard,
            onRestart
        );

        if (this.stage) {
            this.currentScreen.addToStage(this.stage);
        }
    }

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
     * Show items info screen
     * @param {Function} onBack - Back callback
     */
    showItemsInfoScreen(onBack) {
        this.hideCurrentScreen();

        this.currentScreen = new ItemsInfoScreen(onBack);

        if (this.stage) {
            this.currentScreen.addToStage(this.stage);
        }
    }

    /**
     * Show menu leaderboard screen
     * @param {Function} onBack - Back callback
     */
    showMenuLeaderboardScreen(onBack) {
        this.hideCurrentScreen();

        if (!this.scoreService) {
            console.error('Score service not set in UIManager');
            return;
        }

        this.currentScreen = new MenuLeaderboardScreen(this.scoreService, onBack);

        if (this.stage) {
            this.currentScreen.addToStage(this.stage);
        }
    }

    /**
     * Show options screen
     * @param {Function} onBack - Back callback
     */
    showOptionsScreen(onBack) {
        this.hideCurrentScreen();

        this.currentScreen = new OptionsScreen(onBack);

        if (this.stage) {
            this.currentScreen.addToStage(this.stage);
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
