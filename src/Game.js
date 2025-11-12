import * as PIXI from 'pixi.js';
import {
    GAME_CONFIG,
    DIFFICULTY_CONFIG,
    updateGameDimensions
} from './config.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { configManager } from './managers/ConfigManager.js';
import { Player } from './entities/Player.js';
import { FallingItem } from './entities/FallingItem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { ScoreDisplay } from './ui/overlays/ScoreDisplay.js';
import { SpeedDisplay } from './ui/overlays/SpeedDisplay.js';
import { PowerUpTimer } from './ui/overlays/PowerUpTimer.js';
import { ScorePopup } from './ui/overlays/ScorePopup.js';
import { i18n } from './utils/i18n.js';
import { GameStateManager, GameState } from './managers/GameStateManager.js';
import { ScoreService } from './services/ScoreService.js';
import { UIManager } from './managers/UIManager.js';
import { AudioManager } from './services/AudioManager.js';
import { OptionsModal } from './ui/modals/OptionsModal.js';
import { ContestInfoModal } from './ui/modals/ContestInfoModal.js';
import { LeaderboardModal } from './ui/modals/LeaderboardModal.js';
import { GameOverModal } from './ui/modals/GameOverModal.js';

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
        this.audioManager = new AudioManager();
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
        this.currentScoreMultiplier = 1.0; // Score multiplier for power-ups
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.username = '';
        this.powerUpActive = false;
        this.scoreMultiplierActive = false;
        this.chimkeBlockActive = false; // Track if chimke blocking is active

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

            // Load configuration from JSON files
            await configManager.load();

            // Load assets dynamically from configuration
            await this.assetLoader.loadAll(configManager);

            // Load background music
            await this.audioManager.loadBackgroundMusic('/assets/background_music.mp3');

            // Initialize systems
            this.particleSystem = new ParticleSystem(this.app);
            this.uiManager.setStage(this.app.stage);
            this.uiManager.setScoreService(this.scoreService);

            // Setup resize handler
            this.setupResizeHandler();

            // Setup start button
            document.getElementById('startButton').addEventListener('click', () => this.handleStartClick());

            // Setup menu buttons
            document.getElementById('leaderboardButton').addEventListener('click', () => this.showLeaderboard());
            document.getElementById('contestInfoButton').addEventListener('click', () => this.showContestInfo());
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
     * Show leaderboard modal
     */
    showLeaderboard() {
        const leaderboardModal = new LeaderboardModal();
        leaderboardModal.show(() => {
            // Modal closed callback
        });
    }

    /**
     * Show contest info modal
     */
    showContestInfo() {
        const contestInfoModal = new ContestInfoModal();
        contestInfoModal.show(() => {
            // Modal closed callback
        });
    }

    /**
     * Show options modal
     */
    showOptions() {
        const optionsModal = new OptionsModal(this.audioManager);
        optionsModal.show(() => {
            // Modal closed callback
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
                this.scoreDisplay.text.x = 10;
                this.scoreDisplay.text.y = 10;
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
        // Update button text content (keeping icons)
        const startBtn = document.getElementById('startButton');
        if (startBtn) {
            const icon = startBtn.querySelector('span:first-child');
            const text = startBtn.querySelector('span:last-child');
            if (text) text.textContent = i18n.t('game.start');
        }
        
        const usernameInput = document.getElementById('usernameInput');
        if (usernameInput) {
            usernameInput.placeholder = i18n.t('game.usernamePlaceholder');
        }
    }

    /**
     * Start the game
     */
    start() {
        // Hide start screen
        this.uiManager.hideStartScreen();

        // Set state to playing
        this.stateManager.setState(GameState.PLAYING);

        // Play background music if enabled
        this.audioManager.playBackgroundMusic();

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
        const powerUp = configManager.getRandomPowerup();

        let itemConfig;
        let texture;

        if (powerUp) {
            // Spawn power-up
            itemConfig = powerUp;
            texture = this.assetLoader.getTexture(powerUp.texture);
        } else {
            // Spawn regular item based on rarity weights
            itemConfig = configManager.getRandomItem();

            // If chimke block is active and we rolled a game-over item (chimke),
            // keep re-rolling until we get a non-game-over item
            let attempts = 0;
            while (this.chimkeBlockActive && itemConfig.gameOver && attempts < 10) {
                itemConfig = configManager.getRandomItem();
                attempts++;
            }

            // If we still got a game-over item after 10 attempts (unlikely),
            // just don't spawn anything this cycle
            if (this.chimkeBlockActive && itemConfig.gameOver) {
                console.log('Chimke block active - skipping chimke spawn');
                return;
            }

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
                // Timer finished, restore effects based on what's active
                if (this.powerUpActive) {
                    this.restoreSpeed();
                }
                if (this.scoreMultiplierActive) {
                    this.restoreScoreMultiplier();
                }
                if (this.chimkeBlockActive) {
                    this.restoreChimkeSpawning();
                }
            }
        }

        // Add 1 score per second (passive scoring)
        this.scoreTimer += delta.deltaMS; // deltaMS is in milliseconds
        if (this.scoreTimer >= 1000) { // 1000ms = 1 second
            const passiveScore = Math.floor(1 * this.currentScoreMultiplier);
            this.scoreDisplay.add(passiveScore);
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
            const multipliedScore = Math.floor(scoreValue * this.currentScoreMultiplier);
            this.scoreDisplay.add(multipliedScore);
            this.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);

            // Create beautiful score popup with multiplied score
            this.createScorePopup(position.x, position.y, multipliedScore, config.color, i18n.t(config.nameKey));

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
        else if (config.effectType === 'score_multiplier') {
            this.applyScoreMultiplierEffect(config);
        }
        else if (config.effectType === 'clear_chimke') {
            this.applyChimkeBlockEffect(config);
        }
        // Add more effect types here in the future
        // else if (config.effectType === 'invincibility') { ... }
    }

    /**
     * Apply speed multiplier power-up effect
     * @param {Object} config - Power-up configuration
     */
    applySpeedMultiplierEffect(config) {
        // If power-up already active, just restart the timer (don't change speeds)
        if (this.powerUpActive) {
            console.log(`Power-up already active! Restarting timer for ${config.duration}ms`);

            // Restart timer UI
            if (this.powerUpTimer) {
                this.powerUpTimer.start(config.id, config.duration);
            }

            return; // Don't change speeds or save state again
        }

        // First time activating power-up - store original speed before slowing down
        this.powerUpActive = true;
        this.originalSpeedMultiplier = this.currentSpeedMultiplier;

        // Apply slow-down effect
        this.currentSpeedMultiplier = Math.max(1.0, this.currentSpeedMultiplier * config.effectValue);

        // Update all falling items with new slowed speed
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
        console.log(`Power-up expired! Restoring speed from ${this.currentSpeedMultiplier.toFixed(2)}x to ${this.originalSpeedMultiplier.toFixed(2)}x`);

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
     * Apply score multiplier power-up effect
     * @param {Object} config - Power-up configuration
     */
    applyScoreMultiplierEffect(config) {
        // If score multiplier already active, just restart the timer
        if (this.scoreMultiplierActive) {
            console.log(`Score multiplier already active! Restarting timer for ${config.duration}ms`);

            // Restart timer UI
            if (this.powerUpTimer) {
                this.powerUpTimer.start(config.id, config.duration);
            }

            return; // Don't change multiplier, just restart timer
        }

        // First time activating score multiplier
        this.scoreMultiplierActive = true;
        this.currentScoreMultiplier = config.effectValue;

        // Start timer
        if (this.powerUpTimer) {
            this.powerUpTimer.start(config.id, config.duration);
        }

        console.log(`Score multiplier active! All scores x${this.currentScoreMultiplier.toFixed(1)} for ${config.duration}ms`);
    }

    /**
     * Restore score multiplier after power-up expires
     */
    restoreScoreMultiplier() {
        console.log(`Score multiplier expired! Restoring to 1.0x`);

        this.scoreMultiplierActive = false;
        this.currentScoreMultiplier = 1.0;

        console.log(`Score multiplier restored to ${this.currentScoreMultiplier.toFixed(1)}x`);
    }

    /**
     * Apply chimke block power-up effect (tablet)
     * @param {Object} config - Power-up configuration
     */
    applyChimkeBlockEffect(config) {
        // If chimke block already active, just restart the timer
        if (this.chimkeBlockActive) {
            console.log(`Chimke block already active! Restarting timer for ${config.duration}ms`);

            // Restart timer UI
            if (this.powerUpTimer) {
                this.powerUpTimer.start(config.id, config.duration);
            }

            return; // Don't clear chimke again, just restart timer
        }

        // First time activating chimke block
        this.chimkeBlockActive = true;

        // Clear all existing chimke items from the screen
        this.clearAllChimke();

        // Start timer
        if (this.powerUpTimer) {
            this.powerUpTimer.start(config.id, config.duration);
        }

        console.log(`Chimke block active! No chimke will spawn for ${config.duration}ms`);
    }

    /**
     * Clear all chimke items from the screen
     */
    clearAllChimke() {
        let clearedCount = 0;

        // Remove all chimke items from falling items array
        for (let i = this.fallingItems.length - 1; i >= 0; i--) {
            const item = this.fallingItems[i];
            if (item && item.isGameOver()) { // chimke items are game-over items
                // Create particle effect when removing
                const position = item.getPosition();
                const config = item.getConfig();
                this.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);

                // Remove from stage and array
                item.removeFromStage(this.app.stage);
                this.fallingItems.splice(i, 1);
                clearedCount++;
            }
        }

        console.log(`Cleared ${clearedCount} chimke items from the screen!`);
    }

    /**
     * Restore chimke spawning after power-up expires
     */
    restoreChimkeSpawning() {
        console.log(`Chimke block expired! Chimke can spawn again`);

        this.chimkeBlockActive = false;
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

        // Get Telegram data if available
        const telegramData = this.telegramService ? {
            userId: this.telegramService.getUser()?.id,
            username: this.telegramService.getUser()?.username
        } : {};

        // Save score and get leaderboard (async)
        this.scoreService.saveScore(this.username, this.scoreDisplay.score, telegramData)
            .then(scoreData => {
                return this.scoreService.getTopScores(10).then(leaderboard => {
                    // Show game over screen with leaderboard
                    this.showGameOverScreen(scoreData, leaderboard);
                });
            })
            .catch(error => {
                console.error('Error saving score:', error);
                // Show game over screen anyway with empty leaderboard
                this.showGameOverScreen({ 
                    username: this.username, 
                    score: this.scoreDisplay.score, 
                    rank: 0 
                }, []);
            });
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
        const gameOverModal = new GameOverModal(
            this.username,
            this.scoreDisplay.score,
            scoreData,
            leaderboard,
            () => this.restart()
        );
        gameOverModal.show();
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
        this.currentScoreMultiplier = 1.0;
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
        this.scoreMultiplierActive = false;
        this.chimkeBlockActive = false;
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

        if (this.audioManager) {
            this.audioManager.destroy();
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
