/**
 * AudioManager - Handles background music and sound effects
 */
export class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.settings = this.loadSettings();
    }

    /**
     * Load audio settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('game_settings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load audio settings:', error);
        }
        return { soundEnabled: true, musicEnabled: true };
    }

    /**
     * Initialize background music
     * @param {string} audioPath - Path to the audio file
     */
    async loadBackgroundMusic(audioPath) {
        try {
            this.backgroundMusic = new Audio(audioPath);
            this.backgroundMusic.loop = true; // Loop the music
            this.backgroundMusic.volume = 0.5; // Set volume to 50%
            console.log('✓ Background music loaded');
        } catch (error) {
            console.error('Error loading background music:', error);
        }
    }

    /**
     * Play background music if enabled in settings
     */
    playBackgroundMusic() {
        // Reload settings in case they changed
        this.settings = this.loadSettings();

        if (this.backgroundMusic && this.settings.musicEnabled) {
            this.backgroundMusic.play()
                .then(() => {
                    console.log('Background music started');
                })
                .catch((error) => {
                    console.warn('Could not play background music:', error);
                    // Browser might block autoplay, user interaction might be needed
                });
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0; // Reset to beginning
        }
    }

    /**
     * Pause background music
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    /**
     * Resume background music if enabled
     */
    resumeBackgroundMusic() {
        // Reload settings in case they changed
        this.settings = this.loadSettings();

        if (this.backgroundMusic && this.settings.musicEnabled) {
            this.backgroundMusic.play()
                .catch((error) => {
                    console.warn('Could not resume background music:', error);
                });
        }
    }

    /**
     * Toggle background music on/off
     */
    toggleBackgroundMusic(enabled) {
        if (enabled) {
            this.playBackgroundMusic();
        } else {
            this.pauseBackgroundMusic();
        }
    }

    /**
     * Set background music volume
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
        }
    }

    /**
     * Check if music is currently playing
     */
    isPlaying() {
        return this.backgroundMusic && !this.backgroundMusic.paused;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopBackgroundMusic();
        if (this.backgroundMusic) {
            this.backgroundMusic = null;
        }
    }
}
