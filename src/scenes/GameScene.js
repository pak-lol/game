import * as PIXI from 'pixi.js';
import { Scene } from '../core/Scene.js';
import { GameEvents } from '../core/GameEvents.js';
import { GameState } from '../managers/GameStateManager.js';
import { GAME_CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { configManager } from '../managers/ConfigManager.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreDisplay } from '../ui/overlays/ScoreDisplay.js';
import { SpeedDisplay } from '../ui/overlays/SpeedDisplay.js';
import { PowerUpTimer } from '../ui/overlays/PowerUpTimer.js';
import { ScorePopup } from '../ui/overlays/ScorePopup.js';
import { i18n } from '../utils/i18n.js';

/**
 * GameScene - Main gameplay scene
 *
 * Manages:
 * - Game entities (player, items)
 * - Game loop and updates
 * - Collision detection
 * - Score and difficulty
 * - Power-ups
 *
 * This scene will eventually contain most logic from Game.js
 */
export class GameScene extends Scene {
    constructor() {
        super('game');

        // Game entities
        this.player = null;
        this.scoreDisplay = null;
        this.speedDisplay = null;
        this.powerUpTimer = null;
        this.background = null;

        // Game state
        this.username = '';
        this.spawnTimer = 0;
        this.scoreTimer = 0;

        // Systems
        this.collisionSystem = new CollisionSystem();

        // Managers (will be injected from services)
        this.entityManager = null;
        this.powerUpManager = null;
        this.difficultyManager = null;
        this.particleSystem = null;
        this.assetLoader = null;
        this.itemPool = null;
        this.stateManager = null;
        this.audioManager = null;
        this.telegramService = null;

        // Delegated properties (for easy access)
        this.currentSpeedMultiplier = 1.0;
        this.currentSpawnInterval = GAME_CONFIG.spawnInterval;
        this.currentScoreMultiplier = 1.0;
    }

    /**
     * Initialize scene with services
     */
    init(app, services) {
        super.init(app, services);

        // Extract services
        this.entityManager = services.entityManager;
        this.powerUpManager = services.powerUpManager;
        this.difficultyManager = services.difficultyManager;
        this.particleSystem = services.particleSystem;
        this.assetLoader = services.assetLoader;
        this.itemPool = services.itemPool;
        this.stateManager = services.stateManager;
        this.audioManager = services.audioManager;
        this.telegramService = services.telegramService;
        this.scoreService = services.scoreService;
        this.uiManager = services.uiManager;

        console.log('[GameScene] Initialized with services');
    }

    /**
     * Enter the game scene (start playing)
     */
    enter(data = {}) {
        super.enter(data);

        // Get username from data or use default
        this.username = data.username || 'Player';

        // Set game state
        this.stateManager.setState(GameState.PLAYING);

        // Play music
        this.audioManager.playBackgroundMusic();

        // Setup game
        this.createBackground();
        this.createPlayer();
        this.createUI();

        // Reset timers
        this.spawnTimer = 0;
        this.scoreTimer = 0;

        // Sync difficulty
        this.currentSpeedMultiplier = this.difficultyManager.getSpeedMultiplier();
        this.currentSpawnInterval = this.difficultyManager.getSpawnInterval();
        this.currentScoreMultiplier = 1.0;

        console.log('[GameScene] Game started for:', this.username);
    }

    /**
     * Exit the game scene
     */
    exit() {
        // Clean up entities
        this.cleanup();

        return super.exit();
    }

    /**
     * Main game update loop
     */
    update(delta) {
        if (!this.stateManager.isPlaying()) return;

        // Update spawn timer
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.currentSpawnInterval) {
            this.spawnFallingItem();
            this.spawnTimer = 0;
        }

        // Update entities (handles collision detection internally)
        this.updateEntities(delta);

        // Update power-up timer
        if (this.powerUpTimer && this.powerUpTimer.isActive()) {
            const stillActive = this.powerUpTimer.update(delta.deltaMS || delta * 16.67);
            if (!stillActive) {
                // Power-up expired
                console.log('[GameScene] Power-up timer expired');
            }
        }

        // Update power-up effects
        if (this.powerUpManager) {
            this.powerUpManager.update(Date.now());
        }
    }

    /**
     * Create background
     */
    createBackground() {
        const bg = new PIXI.Graphics();
        bg.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        bg.fill(GAME_CONFIG.backgroundColor);
        this.background = bg;
        this.app.stage.addChildAt(bg, 0); // Add at bottom
    }

    /**
     * Create player
     */
    createPlayer() {
        const texture = this.assetLoader.getTexture('basket');
        this.player = new Player(texture);
        this.player.addToStage(this.app.stage);
        this.player.setupControls(this.app.canvas);
    }

    /**
     * Create UI elements
     */
    createUI() {
        // Score display
        this.scoreDisplay = new ScoreDisplay();
        this.scoreDisplay.addToStage(this.app.stage);

        // Speed display
        this.speedDisplay = new SpeedDisplay();
        this.speedDisplay.addToStage(this.app.stage);
        this.speedDisplay.setSpeed(this.currentSpeedMultiplier);

        // Power-up timer
        this.powerUpTimer = new PowerUpTimer();
        this.powerUpTimer.addToStage(this.app.stage);
    }

    /**
     * Spawn a falling item or power-up
     */
    spawnFallingItem() {
        // Try to spawn power-up first
        const powerUp = configManager.getRandomPowerup();

        let itemConfig;
        let texture;

        if (powerUp) {
            itemConfig = powerUp;
            texture = this.assetLoader.getTexture(itemConfig.texture);
        } else {
            // Spawn regular item
            itemConfig = configManager.getRandomItem();

            // Handle chimke blocking
            let attempts = 0;
            while (this.powerUpManager && this.powerUpManager.isEffectActive('clear_chimke') && itemConfig.gameOver && attempts < 10) {
                itemConfig = configManager.getRandomItem();
                attempts++;
            }

            if (this.powerUpManager && this.powerUpManager.isEffectActive('clear_chimke') && itemConfig.gameOver) {
                console.log('[GameScene] Chimke block active - skipping spawn');
                return;
            }

            texture = this.assetLoader.getTexture(itemConfig.texture);
        }

        if (!texture) {
            console.error('[GameScene] Texture not found:', itemConfig.texture);
            return;
        }

        // Spawn through EntityManager
        this.entityManager.spawnItem(itemConfig, texture, this.currentSpeedMultiplier);
    }

    /**
     * Update all entities
     */
    updateEntities(delta) {
        // Update items and check collisions
        this.entityManager.updateItems(delta, (item, index) => {
            if (this.collisionSystem.checkCollision(item, this.player)) {
                this.handleItemCatch(item);
                return true; // Remove item
            }
            return false;
        });

        // Update popups
        this.entityManager.updatePopups(delta);
    }

    /**
     * Handle item catch
     */
    handleItemCatch(item) {
        const config = item.getConfig();
        const position = item.getPosition();

        // Check if it's a power-up
        if (config.effectType) {
            this.handlePowerUpCatch(item, position);
            return;
        }

        // Handle game-over items
        if (item.isGameOver()) {
            // Check invincibility
            if (this.powerUpManager && this.powerUpManager.isEffectActive('invincibility')) {
                this.particleSystem.createCatchEffect(position.x, position.y, '#FFD700');
                if (this.telegramService) {
                    this.telegramService.hapticFeedback('light');
                }
            } else {
                this.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);
                if (this.telegramService && config.haptic) {
                    this.telegramService.hapticFeedback(config.haptic);
                }
                this.gameOver();
            }
        }
        // Handle scoreable items
        else if (item.isScoreable()) {
            const scoreValue = item.getScoreValue();
            const multipliedScore = Math.floor(scoreValue * this.currentScoreMultiplier);

            this.scoreDisplay.add(multipliedScore);
            this.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);

            // Create score popup
            const popup = new ScorePopup(position.x, position.y, multipliedScore, config.color, i18n.t(config.nameKey));
            popup.addToStage(this.app.stage);
            this.entityManager.addPopup(popup);

            // Haptic feedback
            if (this.telegramService && config.haptic) {
                this.telegramService.hapticFeedback(config.haptic);
            }

            // Emit event
            this.emit(GameEvents.ITEM_CAUGHT, {
                item, config, position,
                score: multipliedScore,
                baseScore: scoreValue,
                multiplier: this.currentScoreMultiplier
            });

            // Increase difficulty
            this.increaseDifficulty();
        }
    }

    /**
     * Handle power-up catch
     */
    handlePowerUpCatch(item, position) {
        const config = item.getConfig();

        this.particleSystem.createCatchEffect(position.x, position.y, config.particleColor);

        if (this.telegramService && config.haptic) {
            this.telegramService.hapticFeedback(config.haptic);
        }

        // Emit event
        this.emit(GameEvents.POWERUP_ACTIVATED, {
            config, position,
            duration: config.duration,
            effectType: config.effectType
        });

        // Apply effect
        this.powerUpManager.applyEffect(config);
    }

    /**
     * Increase difficulty
     */
    increaseDifficulty() {
        this.difficultyManager.increaseOnScore();

        // Sync values
        this.currentSpeedMultiplier = this.difficultyManager.getSpeedMultiplier();
        this.currentSpawnInterval = this.difficultyManager.getSpawnInterval();

        // Update item speeds
        this.entityManager.updateAllSpeeds(this.currentSpeedMultiplier);

        // Update speed display
        if (this.speedDisplay) {
            this.speedDisplay.setSpeed(this.currentSpeedMultiplier);
        }
    }

    /**
     * Game over
     */
    gameOver() {
        console.log('[GameScene] Game Over');

        // Set state
        this.stateManager.setState(GameState.GAME_OVER);

        // Emit event
        this.emit(GameEvents.GAME_OVER, {
            score: this.scoreDisplay.score,
            username: this.username,
            timestamp: Date.now()
        });

        // Clear effects
        if (this.powerUpManager) {
            this.powerUpManager.clearAll();
        }

        if (this.powerUpTimer) {
            this.powerUpTimer.stop();
        }

        // Clear entities
        this.entityManager.clearAllItems();

        // Show game over modal (handled by UIManager or Game.js)
        // For now, we'll emit an event and let Game.js handle it
    }

    /**
     * Clean up scene
     */
    cleanup() {
        // Clear entities
        if (this.entityManager) {
            this.entityManager.clearAllItems();
            this.entityManager.clearAllPopups();
        }

        // Remove UI
        if (this.scoreDisplay) {
            this.scoreDisplay.removeFromStage(this.app.stage);
            this.scoreDisplay = null;
        }

        if (this.speedDisplay) {
            this.speedDisplay.removeFromStage(this.app.stage);
            this.speedDisplay = null;
        }

        if (this.powerUpTimer) {
            this.powerUpTimer.removeFromStage(this.app.stage);
            this.powerUpTimer = null;
        }

        // Remove background
        if (this.background && this.background.parent) {
            this.background.parent.removeChild(this.background);
            this.background = null;
        }

        // Remove player
        if (this.player) {
            this.player.removeFromStage(this.app.stage);
            this.player = null;
        }

        console.log('[GameScene] Cleaned up');
    }

    /**
     * Handle resize
     */
    resize(width, height) {
        // Update background
        if (this.background) {
            this.background.clear();
            this.background.rect(0, 0, width, height);
            this.background.fill(GAME_CONFIG.backgroundColor);
        }

        // Update player bounds
        if (this.player) {
            this.player.updateBounds();
        }

        // Update UI positions
        if (this.speedDisplay) {
            this.speedDisplay.updatePosition();
        }

        if (this.powerUpTimer) {
            this.powerUpTimer.updatePosition();
        }
    }

    /**
     * Destroy scene
     */
    destroy() {
        this.cleanup();
        super.destroy();
    }
}
