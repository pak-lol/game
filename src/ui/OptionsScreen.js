import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config.js';
import { i18n } from '../utils/i18n.js';

/**
 * Options/Settings Screen
 * Currently has sound toggle (for future implementation)
 */
export class OptionsScreen {
    constructor(onBack) {
        this.container = new PIXI.Container();
        this.onBack = onBack;

        // Load settings from localStorage
        this.settings = this.loadSettings();

        this.create();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('game_settings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }

        // Default settings
        return {
            soundEnabled: true,
            musicEnabled: true
        };
    }

    saveSettings() {
        try {
            localStorage.setItem('game_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    create() {
        const screenWidth = GAME_CONFIG.width;
        const screenHeight = GAME_CONFIG.height;

        // Background overlay
        const overlay = new PIXI.Graphics();
        overlay.rect(0, 0, screenWidth, screenHeight);
        overlay.fill({ color: 0x000000, alpha: 0.95 });
        this.container.addChild(overlay);

        // Title
        const title = new PIXI.Text({
            text: '⚙️ ' + i18n.t('menu.options'),
            style: {
                fontFamily: 'Arial',
                fontSize: 42,
                fill: '#BA68C8',
                fontWeight: 'bold',
                stroke: { color: '#6A1B9A', width: 4 },
                dropShadow: {
                    color: '#000000',
                    blur: 6,
                    angle: Math.PI / 4,
                    distance: 4
                }
            }
        });
        title.anchor.set(0.5, 0);
        title.x = screenWidth / 2;
        title.y = 30;
        this.container.addChild(title);

        // Settings
        let yPos = 140;

        // Sound toggle
        this.soundToggle = this.createToggle(
            '🔊 ' + i18n.t('options.sound'),
            this.settings.soundEnabled,
            screenWidth / 2,
            yPos,
            (enabled) => {
                this.settings.soundEnabled = enabled;
                this.saveSettings();
            }
        );
        this.container.addChild(this.soundToggle);
        yPos += 100;

        // Music toggle
        this.musicToggle = this.createToggle(
            '🎵 ' + i18n.t('options.music'),
            this.settings.musicEnabled,
            screenWidth / 2,
            yPos,
            (enabled) => {
                this.settings.musicEnabled = enabled;
                this.saveSettings();
            }
        );
        this.container.addChild(this.musicToggle);

        // Coming soon note
        const note = new PIXI.Text({
            text: i18n.t('options.comingSoon'),
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: '#888888',
                fontStyle: 'italic'
            }
        });
        note.anchor.set(0.5, 0);
        note.x = screenWidth / 2;
        note.y = yPos + 80;
        this.container.addChild(note);

        // Back button
        this.createBackButton(screenWidth, screenHeight);
    }

    createToggle(label, initialState, x, y, onChange) {
        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        // Background
        const bg = new PIXI.Graphics();
        bg.roundRect(-180, -35, 360, 70, 10);
        bg.fill({ color: 0x1a1a1a, alpha: 0.8 });
        bg.roundRect(-180, -35, 360, 70, 10);
        bg.stroke({ color: 0xBA68C8, width: 2, alpha: 0.5 });
        container.addChild(bg);

        // Label
        const labelText = new PIXI.Text({
            text: label,
            style: {
                fontFamily: 'Arial',
                fontSize: 22,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }
        });
        labelText.anchor.set(0, 0.5);
        labelText.x = -160;
        labelText.y = 0;
        container.addChild(labelText);

        // Toggle button
        const toggleBg = new PIXI.Graphics();
        const toggleX = 100;
        const toggleWidth = 60;
        const toggleHeight = 30;

        const updateToggle = (enabled) => {
            toggleBg.clear();

            // Background
            toggleBg.roundRect(toggleX, -15, toggleWidth, toggleHeight, 15);
            toggleBg.fill({ color: enabled ? 0x4CAF50 : 0x666666, alpha: 0.8 });

            // Circle
            const circleX = enabled ? toggleX + toggleWidth - 18 : toggleX + 12;
            toggleBg.circle(circleX, 0, 12);
            toggleBg.fill({ color: 0xFFFFFF });
        };

        updateToggle(initialState);
        container.addChild(toggleBg);

        // Status text
        const statusText = new PIXI.Text({
            text: initialState ? i18n.t('options.on') : i18n.t('options.off'),
            style: {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: initialState ? '#4CAF50' : '#888888',
                fontWeight: 'bold'
            }
        });
        statusText.anchor.set(0, 0.5);
        statusText.x = toggleX + toggleWidth + 10;
        statusText.y = 0;
        container.addChild(statusText);

        // Make interactive
        let enabled = initialState;
        const hitArea = new PIXI.Graphics();
        hitArea.rect(-180, -35, 360, 70);
        hitArea.fill({ color: 0xFFFFFF, alpha: 0.01 });
        container.addChild(hitArea);

        container.interactive = true;
        container.cursor = 'pointer';
        container.on('pointerdown', () => {
            enabled = !enabled;
            updateToggle(enabled);
            statusText.text = enabled ? i18n.t('options.on') : i18n.t('options.off');
            statusText.style.fill = enabled ? '#4CAF50' : '#888888';
            if (onChange) onChange(enabled);
        });

        return container;
    }

    createBackButton(screenWidth, screenHeight) {
        const button = new PIXI.Graphics();
        button.roundRect(0, 0, 200, 60, 10);
        button.fill({ color: 0x9C27B0, alpha: 0.9 });
        button.x = screenWidth / 2 - 100;
        button.y = screenHeight - 80;

        const buttonText = new PIXI.Text({
            text: i18n.t('menu.back'),
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = 100;
        buttonText.y = 30;
        button.addChild(buttonText);

        button.interactive = true;
        button.cursor = 'pointer';
        button.on('pointerdown', () => {
            if (this.onBack) this.onBack();
        });

        this.container.addChild(button);
    }

    getSettings() {
        return this.settings;
    }

    addToStage(stage) {
        stage.addChild(this.container);
    }

    removeFromStage(stage) {
        stage.removeChild(this.container);
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
