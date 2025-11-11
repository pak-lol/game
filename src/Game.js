import * as PIXI from 'pixi.js';
import { GAME_CONFIG, DIFFICULTY_CONFIG, updateGameDimensions } from './config.js';
import { AssetLoader } from './utils/AssetLoader.js';
import { Player } from './entities/Player.js';
import { FallingItem } from './entities/FallingItem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { ScoreDisplay } from './ui/ScoreDisplay.js';
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
        this.fallingItems = [];

        // Game state
        this.spawnTimer = 0;
        this.gameLoopBound = null;
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.username = '';

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

            // Setup resize handler
            this.setupResizeHandler();

            // Setup start button
            document.getElementById('startButton').addEventListener('click', () => this.handleStartClick());

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

    spawnFallingItem() {
        // Randomly choose between the two types
        const types = Object.values(GAME_CONFIG.itemTypes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Use different texture based on type
        const texture =
            randomType === GAME_CONFIG.itemTypes.CHIMKE
                ? this.assetLoader.getTexture('weedLeafBrown')
                : this.assetLoader.getTexture('weedLeaf');
        
        // Get translated label
        const label =
            randomType === GAME_CONFIG.itemTypes.CHIMKE
                ? i18n.t('items.chimke')
                : i18n.t('items.vorinioDumai');
        
        const item = new FallingItem(texture, randomType, label, this.currentSpeedMultiplier);
        
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
    }

    handleItemCatch(item, index) {
        if (!item || !this.scoreDisplay) return;

        const position = item.getPosition();

        // Only increment score for "vorinio dumai"
        if (item.isScoreable()) {
            this.scoreDisplay.increment();
            this.particleSystem.createCatchEffect(position.x, position.y, '#4CAF50');

            // Haptic feedback for success
            if (this.telegramService) {
                this.telegramService.hapticFeedback('light');
            }

            // Increase difficulty
            this.increaseDifficulty();
        } else {
            // Game over for catching "chimke"
            this.particleSystem.createCatchEffect(position.x, position.y, '#FF6B6B');

            // Haptic feedback for error
            if (this.telegramService) {
                this.telegramService.hapticFeedback('error');
            }

            this.gameOver();
        }

        item.removeFromStage(this.app.stage);
        this.fallingItems.splice(index, 1);
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
    }

    /**
     * Reset game state to initial values
     */
    resetGameState() {
        this.spawnTimer = 0;
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.fallingItems = [];

        // Create new score display
        this.scoreDisplay = new ScoreDisplay();
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
