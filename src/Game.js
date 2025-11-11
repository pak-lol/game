import * as PIXI from 'pixi.js';
import {
    GAME_CONFIG,
    DIFFICULTY_CONFIG,
    POWERUP_CONFIG,
    ITEMS_CONFIG,
    POWERUPS_CONFIG,
    getRandomItem,
    getRandomPowerUp,
    updateGameDimensions
} from './config.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { Player } from './entities/Player.js';
import { FallingItem } from './entities/FallingItem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { ScoreDisplay } from './ui/ScoreDisplay.js';
import { SpeedDisplay } from './ui/SpeedDisplay.js';
import { PowerUpTimer } from './ui/PowerUpTimer.js';
import { ScorePopup } from './ui/ScorePopup.js';
import { i18n } from './utils/i18n.js';
import { GameStateManager, GameState } from './managers/GameStateManager.js';
import { ScoreService } from './services/ScoreService.js';
import { UIManager } from './managers/UIManager.js';

/**
 * Main Game class - orchestrates all game systems
 */
export class Game {
    constructor() {
        // Core systems
        this.app = null;
        this.assetLoader = new AssetLoader();
        this.collisionSystem = new CollisionSystem();
        this.particleSystem = null;

        // Managers and services
        this.stateManager = new GameStateManager();
        this.scoreService = new ScoreService();
        this.uiManager = new UIManager();
        this.telegramService = null;

        // Game entities
        this.player = null;
        this.scoreDisplay = null;
        this.speedDisplay = null;
        this.powerUpTimer = null;
        this.fallingItems = [];
        this.scorePopups = []; // Array of active score popups

        // Game state
        this.spawnTimer = 0;
        this.scoreTimer = 0; // Timer for passive score per second
        this.gameLoopBound = null;
        this.currentSpeedMultiplier = 1.0;
        this.originalSpeedMultiplier = 1.0; // Store original speed before power-up
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.username = '';
        this.powerUpActive = false;

        // Background reference
        this.background = null;

        // Event listeners for cleanup
        this.resizeListener = null;
        this.orientationListener = null;
        this.telegramViewportListener = null;
    }

    /**
     * Set Telegram service instance
     * @param {TelegramService} telegramService
     */
    setTelegramService(telegramService) {
        this.telegramService = telegramService;
        console.log('Telegram service set in Game');
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            // Set initial state
            this.stateManager.setState(GameState.LOADING);

            // Load translations
            await i18n.load(GAME_CONFIG.defaultLocale);

            // Update UI with translations
            this.updateUITranslations();

            // Initialize PixiJS app with responsive settings
            this.app = new PIXI.Application();
            await this.app.init({
                width: GAME_CONFIG.width,
                height: GAME_CONFIG.height,
                backgroundColor: GAME_CONFIG.backgroundColor,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true
            });

            document.getElementById('gameContainer').appendChild(this.app.canvas);

            // Load assets
            await this.assetLoader.loadAll();

            // Initialize systems
            this.particleSystem = new ParticleSystem(this.app);
            this.uiManager.setStage(this.app.stage);
            this.uiManager.setScoreService(this.scoreService);

            // Setup resize handler
            this.setupResizeHandler();

            // Setup start button
            document.getElementById('startButton').addEventListener('click', () => this.handleStartClick());

            // Setup menu buttons
            document.getElementById('itemsInfoButton').addEventListener('click', () => this.showItemsInfo());
            document.getElementById('leaderboardButton').addEventListener('click', () => this.showMenuLeaderboard());
            document.getElementById('optionsButton').addEventListener('click', () => this.showOptions());

            // Allow Enter key to start game
            document.getElementById('usernameInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleStartClick();
                }
            });

            // Set state to start screen
            this.stateManager.setState(GameState.START_SCREEN);

            console.log('Game initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize game:', error);
            throw error;
        }
    }

    handleStartClick() {
        const usernameInput = document.getElementById('usernameInput');
        const username = usernameInput.value.trim();

        if (!username) {
            // Show error
            usernameInput.style.borderColor = '#FF6B6B';
            usernameInput.placeholder = i18n.t('game.usernameRequired');
            setTimeout(() => {
                usernameInput.style.borderColor = 'rgba(76, 175, 80, 0.5)';
                usernameInput.placeholder = i18n.t('game.usernamePlaceholder');
            }, 2000);
            return;
        }

        this.username = username;
        console.log('Starting game for player:', this.username);
        this.start();
    }

    /**
     * Show items information screen
     */
    showItemsInfo() {
        this.uiManager.hideStartScreen();
        this.uiManager.showItemsInfoScreen(() => {
            this.uiManager.hideCurrentScreen();
            this.uiManager.showStartScreen();
        });
    }

    /**
     * Show menu leaderboard
     */
    showMenuLeaderboard() {
        this.uiManager.hideStartScreen();
        this.uiManager.showMenuLeaderboardScreen(() => {
            this.uiManager.hideCurrentScreen();
            this.uiManager.showStartScreen();
        });
    }

    /**
     * Show options screen
     */
    showOptions() {
        this.uiManager.hideStartScreen();
        this.uiManager.showOptionsScreen(() => {
            this.uiManager.hideCurrentScreen();
            this.uiManager.showStartScreen();
        });
    }

    /**
     * Setup window resize handler
     */
    setupResizeHandler() {
        const resize = () => {
            const oldWidth = GAME_CONFIG.width;
            const oldHeight = GAME_CONFIG.height;

            updateGameDimensions();
            this.app.renderer.resize(GAME_CONFIG.width, GAME_CONFIG.height);

            // Update background if it exists
            if (this.background) {
                this.background.clear();
                this.background.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
                this.background.fill(GAME_CONFIG.backgroundColor);
            }

            // Update player position if it exists
            if (this.player) {
                this.player.updateBounds();
            }

            // Update score display position if it exists
            if (this.scoreDisplay && this.scoreDisplay.text) {
                // Keep score in top-left corner
                this.scoreDisplay.text.x = 20;
                this.scoreDisplay.text.y = 20;
            }

            // Update speed display position if it exists
            if (this.speedDisplay) {
                this.speedDisplay.updatePosition();
            }

            // Update power-up timer position if it exists
            if (this.powerUpTimer) {
                this.powerUpTimer.updatePosition();
            }

            // Update falling items positions proportionally
            if (this.fallingItems.length > 0) {
                const scaleX = GAME_CONFIG.width / oldWidth;
                for (const item of this.fallingItems) {
                    if (item.container) {
                        item.container.x *= scaleX;
                    }
                }
            }
        };

        // Store listeners for cleanup
        this.resizeListener = resize;
        this.orientationListener = () => {
            setTimeout(resize, 100);
        };
        this.telegramViewportListener = () => {
            console.log('Telegram viewport changed, resizing game...');
            setTimeout(resize, 100);
        };

        // Add event listeners
        window.addEventListener('resize', this.resizeListener);
        window.addEventListener('orientationchange', this.orientationListener);
        window.addEventListener('telegramViewportChanged', this.telegramViewportListener);
    }

    updateUITranslations() {
        document.getElementById('gameTitle').textContent = i18n.t('game.title');
        document.getElementById('startButton').textContent = i18n.t('game.start');
        document.getElementById('usernameInput').placeholder = i18n.t('game.usernamePlaceholder');
    }

    /**
     * Start the game
     */
    start() {
        // Hide start screen
        this.uiManager.hideStartScreen();

        // Set state to playing
        this.stateManager.setState(GameState.PLAYING);

        // Create game entities
        this.createBackground();
        this.createPlayer();
        this.createScoreDisplay();
        this.createSpeedDisplay();
        this.createPowerUpTimer();

        // Remove old game loop if it exists
        if (this.gameLoopBound) {
            this.app.ticker.remove(this.gameLoopBound);
        }

        // Create and add new game loop
        this.gameLoopBound = (delta) => this.update(delta);
        this.app.ticker.add(this.gameLoopBound);

        console.log('Game started for player:', this.username);
    }

    createBackground() {
        // Create solid color background
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        bg.fill(GAME_CONFIG.backgroundColor);
        this.background = bg;
        this.app.stage.addChild(this.background);
        
        // Add some stars for decoration
        for (let i = 0; i < 50; i++) {
            const star = new PIXI.Graphics();
            star.circle(0, 0, Math.random() * 2 + 0.5);
            star.fill({ color: 0xFFFFFF, alpha: Math.random() * 0.5 + 0.2 });
            star.x = Math.random() * GAME_CONFIG.width;
            star.y = Math.random() * GAME_CONFIG.height;
            this.background.addChild(star);
        }
    }

    createPlayer() {
        this.player = new Player(this.assetLoader.getTexture('basket'));
        this.player.addToStage(this.app.stage);
        this.player.setupControls(this.app.canvas);
    }

    createScoreDisplay() {
        this.scoreDisplay = new ScoreDisplay();
        this.scoreDisplay.addToStage(this.app.stage);
    }

    createSpeedDisplay() {
        this.speedDisplay = new SpeedDisplay();
        this.speedDisplay.addToStage(this.app.stage);
        this.speedDisplay.setSpeed(this.currentSpeedMultiplier);
    }

    createPowerUpTimer() {
        this.powerUpTimer = new PowerUpTimer();
        this.powerUpTimer.addToStage(this.app.stage);
    }

    /**
     * Spawn a falling item or power-up
     * Uses the new configuration system for easy extensibility
     */
    spawnFallingItem() {
        // Try to spawn a power-up first
        const powerUp = getRandomPowerUp();

        let itemConfig;
        let texture;

        if (powerUp) {
            // Spawn power-up
            itemConfig = powerUp;
            texture = this.assetLoader.getTexture(powerUp.texture);
        } else {
            // Spawn regular item based on rarity weights
            itemConfig = getRandomItem();
            texture = this.assetLoader.getTexture(itemConfig.texture);
        }

        const item = new FallingItem(texture, itemConfig, this.currentSpeedMultiplier);

        item.addToStage(this.app.stage);
        this.fallingItems.push(item);
    }

    /**
     * Main game loop update
     * @param {Object} delta - Delta time
     */
    update(delta) {
        // Only update if playing
        if (!this.stateManager.isPlaying() || !this.scoreDisplay || !this.player) {
            return;
        }

        // Animate speed display
        if (this.speedDisplay) {
            this.speedDisplay.animate(delta.deltaTime);
        }

        // Update power-up timer
        if (this.powerUpTimer && this.powerUpTimer.isActive()) {
            // Use deltaMS for accurate millisecond timing
            const stillActive = this.powerUpTimer.update(delta.deltaMS);
            if (!stillActive) {
                // Timer finished, restore original speed
                this.restoreSpeed();
            }
        }

        // Add 1 score per second (passive scoring)
        this.scoreTimer += delta.deltaMS; // deltaMS is in milliseconds
        if (this.scoreTimer >= 1000) { // 1000ms = 1 second
            this.scoreDisplay.increment();
            this.scoreTimer -= 1000; // Subtract 1 second, keep remainder for precision
        }

        // Spawn falling items
        this.spawnTimer += delta.deltaTime;
        if (this.spawnTimer > this.currentSpawnInterval) {
            this.spawnFallingItem();
            this.spawnTimer = 0;
        }

        // Update falling items
        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];
            if (!item || !item.update) continue;

            item.update(delta.deltaTime);

            // Check collision with player
            if (this.collisionSystem.checkCollision(item, this.player)) {
                this.handleItemCatch(item, i);
                continue;
            }

            // Remove if off screen
            if (item.isOffScreen()) {
                item.removeFromStage(this.app.stage);
                this.fallingItems.splice(i, 1);
            }
        }

        // Update score popups
        for (let i = this.scorePopups.length - 1; i >= 0; i--) {
            const popup = this.scorePopups[i];
            if (!popup || !popup.update) continue;

            const stillActive = popup.update(delta.deltaTime);

            if (!stillActive) {
                popup.removeFromStage(this.app.stage);
                popup.destroy();
                this.scorePopups.splice(i, 1);
            }
        }
    }

    /**
     * Handle catching an item or power-up
     * Now uses configuration system for easy extensibility
     */
    handleItemCatch(item, index) {
        if (!item || !this.scoreDisplay) return;

        const position = item.getPosition();
        const config = item.getConfig();

        // Check if this is a power-up
        if (config.effectType) {
            this.handlePowerUpCatch(item, position);
        }
        // Check if this is a game-over item
        else if (item.isGameOver()) {
            this.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);

            // Haptic feedback
            if (this.telegramService && config.haptic) {
                this.telegramService.hapticFeedback(config.haptic);
            }

            this.gameOver();
        }
        // Handle scoreable items
        else if (item.isScoreable()) {
            const scoreValue = item.getScoreValue();
            this.scoreDisplay.add(scoreValue);
            this.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);

            // Create beautiful score popup
            this.createScorePopup(position.x, position.y, scoreValue, config.color, i18n.t(config.nameKey));

            // Haptic feedback
            if (this.telegramService && config.haptic) {
                this.telegramService.hapticFeedback(config.haptic);
            }

            // Increase difficulty (only if no power-up is active)
            if (!this.powerUpActive) {
                this.increaseDifficulty();
            }
        }

        item.removeFromStage(this.app.stage);
        this.fallingItems.splice(index, 1);
    }

    /**
     * Create a beautiful score popup
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scoreValue - Score value
     * @param {string} color - Color of popup
     * @param {string} itemName - Name of item
     */
    createScorePopup(x, y, scoreValue, color, itemName) {
        const popup = new ScorePopup(x, y, scoreValue, color, itemName);
        popup.addToStage(this.app.stage);
        this.scorePopups.push(popup);
    }

    /**
     * Handle catching a power-up
     * Now uses configuration system for any power-up type
     * @param {FallingItem} item - The power-up item
     * @param {Object} position - Position where power-up was caught
     */
    handlePowerUpCatch(item, position) {
        const config = item.getConfig();
        console.log(`Power-up caught: ${config.id}`);

        // Create particle effect
        this.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);

        // Haptic feedback
        if (this.telegramService && config.haptic) {
            this.telegramService.hapticFeedback(config.haptic);
        }

        // Apply effect based on type
        if (config.effectType === 'speed_multiplier') {
            this.applySpeedMultiplierEffect(config);
        }
        // Add more effect types here in the future
        // else if (config.effectType === 'score_multiplier') { ... }
        // else if (config.effectType === 'invincibility') { ... }
    }

    /**
     * Apply speed multiplier power-up effect
     * @param {Object} config - Power-up configuration
     */
    applySpeedMultiplierEffect(config) {
        // Store current speed
        this.powerUpActive = true;
        this.originalSpeedMultiplier = this.currentSpeedMultiplier;

        // Apply effect
        this.currentSpeedMultiplier = Math.max(1.0, this.currentSpeedMultiplier * config.effectValue);

        // Update all falling items with new speed
        this.updateFallingItemsSpeeds();

        // Update speed display
        if (this.speedDisplay) {
            this.speedDisplay.setSpeed(this.currentSpeedMultiplier);
        }

        // Start timer
        if (this.powerUpTimer) {
            this.powerUpTimer.start(config.id, config.duration);
        }

        console.log(`Speed changed from ${this.originalSpeedMultiplier.toFixed(2)}x to ${this.currentSpeedMultiplier.toFixed(2)}x for ${config.duration}ms`);
    }

    /**
     * Restore speed after power-up expires
     */
    restoreSpeed() {
        console.log('Power-up expired! Restoring speed...');

        this.powerUpActive = false;
        this.currentSpeedMultiplier = this.originalSpeedMultiplier;

        // Update all falling items with restored speed
        this.updateFallingItemsSpeeds();

        // Update speed display
        if (this.speedDisplay) {
            this.speedDisplay.setSpeed(this.currentSpeedMultiplier);
        }

        console.log(`Speed restored to ${this.currentSpeedMultiplier.toFixed(2)}x`);
    }

    /**
     * Update all falling items with current speed
     */
    updateFallingItemsSpeeds() {
        for (const item of this.fallingItems) {
            if (item && item.updateSpeed) {
                item.updateSpeed(this.currentSpeedMultiplier);
            }
        }
    }

    increaseDifficulty() {
        // Increase speed multiplier
        const speedIncrease = DIFFICULTY_CONFIG.speedIncreasePerScore;
        this.currentSpeedMultiplier = Math.min(
            this.currentSpeedMultiplier + speedIncrease,
            DIFFICULTY_CONFIG.maxSpeedMultiplier
        );

        // Decrease spawn interval (spawn faster)
        this.currentSpawnInterval = Math.max(
            this.currentSpawnInterval - DIFFICULTY_CONFIG.spawnRateIncrease,
            DIFFICULTY_CONFIG.minSpawnInterval
        );

        // Update speed display
        if (this.speedDisplay) {
            this.speedDisplay.setSpeed(this.currentSpeedMultiplier);
        }

        console.log(`Difficulty increased! Speed: ${this.currentSpeedMultiplier.toFixed(2)}x, Spawn interval: ${this.currentSpawnInterval}`);
    }

    /**
     * Handle game over
     */
    gameOver() {
        // Set state
        this.stateManager.setState(GameState.GAME_OVER);

        // Remove game loop ticker
        if (this.gameLoopBound) {
            this.app.ticker.remove(this.gameLoopBound);
        }

        // Stop all falling items
        this.clearFallingItems();

        // Save score and get leaderboard
        const scoreData = this.scoreService.saveScore(this.username, this.scoreDisplay.score);
        const leaderboard = this.scoreService.getTopScores(10);

        // Show game over screen with leaderboard
        this.showGameOverScreen(scoreData, leaderboard);
    }

    /**
     * Clear all falling items from the game
     */
    clearFallingItems() {
        for (const item of this.fallingItems) {
            if (item && item.removeFromStage) {
                item.removeFromStage(this.app.stage);
            }
        }
        this.fallingItems = [];
    }

    /**
     * Clear all score popups
     */
    clearScorePopups() {
        for (const popup of this.scorePopups) {
            if (popup && popup.removeFromStage) {
                popup.removeFromStage(this.app.stage);
                popup.destroy();
            }
        }
        this.scorePopups = [];
    }

    /**
     * Show game over screen
     * @param {Object} scoreData - Score data with rank
     * @param {Array} leaderboard - Leaderboard entries
     */
    showGameOverScreen(scoreData, leaderboard) {
        this.uiManager.showGameOverScreen(
            this.username,
            this.scoreDisplay.score,
            scoreData,
            leaderboard,
            () => this.restart()
        );
    }

    /**
     * Restart the game
     */
    restart() {
        console.log('Restarting game...');

        // Clean up current game state
        this.cleanup();

        // Reset game variables
        this.resetGameState();

        // Restart game
        this.start();
    }

    /**
     * Clean up game resources
     */
    cleanup() {
        // Remove game loop
        if (this.gameLoopBound && this.app) {
            this.app.ticker.remove(this.gameLoopBound);
            this.gameLoopBound = null;
        }

        // Clear falling items
        this.clearFallingItems();

        // Clear score popups
        this.clearScorePopups();

        // Clear stage
        if (this.app && this.app.stage) {
            this.app.stage.removeChildren();
        }

        // Clear UI screens
        this.uiManager.hideCurrentScreen();

        // Reset references
        this.background = null;
        this.player = null;
        this.scoreDisplay = null;
        this.speedDisplay = null;
        this.powerUpTimer = null;
    }

    /**
     * Reset game state to initial values
     */
    resetGameState() {
        this.spawnTimer = 0;
        this.scoreTimer = 0;
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.fallingItems = [];
        this.scorePopups = [];

        // Create new score display
        this.scoreDisplay = new ScoreDisplay();

        // Reset speed display (will be created on start)
        this.speedDisplay = null;
        this.powerUpTimer = null;

        // Reset power-up state
        this.powerUpActive = false;
        this.originalSpeedMultiplier = 1.0;
    }

    /**
     * Complete cleanup and destroy
     */
    destroy() {
        console.log('Destroying game...');

        // Clean up game resources
        this.cleanup();

        // Remove event listeners
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }

        if (this.orientationListener) {
            window.removeEventListener('orientationchange', this.orientationListener);
            this.orientationListener = null;
        }

        if (this.telegramViewportListener) {
            window.removeEventListener('telegramViewportChanged', this.telegramViewportListener);
            this.telegramViewportListener = null;
        }

        // Destroy managers
        if (this.stateManager) {
            this.stateManager.destroy();
        }

        if (this.uiManager) {
            this.uiManager.destroy();
        }

        // Destroy particle system
        if (this.particleSystem) {
            // Particle system cleanup if needed
            this.particleSystem = null;
        }

        // Destroy PixiJS app
        if (this.app) {
            this.app.destroy(true, { children: true, texture: false, baseTexture: false });
            this.app = null;
        }

        console.log('Game destroyed successfully');
    }
}
