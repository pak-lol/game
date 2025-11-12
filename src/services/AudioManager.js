/**
 * AudioManager - Handles background music and sound effects
 * Automatically scans /public/music/ folder for MP3 files and randomly plays them
 */
export class AudioManager {
    constructor() {
        this.backgroundMusic = null;
        this.settings = this.loadSettings();
        this.musicTracks = [];
        this.currentTrackIndex = -1;
        this.isInitialized = false;
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
     * Scan music folder and load all available tracks
     * Uses Vite's import.meta.glob to automatically discover MP3 files
     */
    async loadBackgroundMusic() {
        try {
            // Use Vite's glob import to scan for all MP3 files in /public/music/
            const musicFiles = import.meta.glob('/public/music/*.mp3', { eager: false, as: 'url' });

            // Convert the glob result to an array of paths
            this.musicTracks = Object.keys(musicFiles).map(path => {
                // Remove '/public' prefix since files in public are served from root
                return path.replace('/public', '');
            });

            if (this.musicTracks.length === 0) {
                console.warn('No music tracks found in /public/music/. Add .mp3 files to enable background music.');
                return;
            }

            console.log(`✓ Found ${this.musicTracks.length} music track(s):`, this.musicTracks);

            // Initialize the first random track
            this.initializeRandomTrack();
            this.isInitialized = true;

        } catch (error) {
            console.error('Error loading background music:', error);
        }
    }

    /**
     * Initialize a random track from the available music
     */
    initializeRandomTrack() {
        if (this.musicTracks.length === 0) {
            console.warn('No music tracks available');
            return;
        }

        // Pick a random track
        const randomIndex = Math.floor(Math.random() * this.musicTracks.length);
        this.currentTrackIndex = randomIndex;

        const trackPath = this.musicTracks[randomIndex];
        console.log(`Loading track: ${trackPath}`);

        // Create new Audio element
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic = null;
        }

        this.backgroundMusic = new Audio(trackPath);
        this.backgroundMusic.volume = 0.5; // Set volume to 50%

        // When track ends, play next random track
        this.backgroundMusic.addEventListener('ended', () => {
            console.log('Track ended, loading next random track...');
            this.playNextRandomTrack();
        });
    }

    /**
     * Play next random track (different from current)
     */
    playNextRandomTrack() {
        if (this.musicTracks.length === 0) return;

        // If only one track, replay it
        if (this.musicTracks.length === 1) {
            this.backgroundMusic.currentTime = 0;
            this.playBackgroundMusic();
            return;
        }

        // Pick a different random track
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.musicTracks.length);
        } while (newIndex === this.currentTrackIndex && this.musicTracks.length > 1);

        this.currentTrackIndex = newIndex;
        const trackPath = this.musicTracks[newIndex];
        console.log(`Playing next track: ${trackPath}`);

        // Create new Audio element for the next track
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }

        this.backgroundMusic = new Audio(trackPath);
        this.backgroundMusic.volume = 0.5;

        // Set up ended listener for continuous playback
        this.backgroundMusic.addEventListener('ended', () => {
            console.log('Track ended, loading next random track...');
            this.playNextRandomTrack();
        });

        // Auto-play if music is enabled
        this.playBackgroundMusic();
    }

    /**
     * Play background music if enabled in settings
     */
    playBackgroundMusic() {
        // Reload settings in case they changed
        this.settings = this.loadSettings();

        if (!this.isInitialized) {
            console.warn('Music system not initialized. No tracks available.');
            return;
        }

        if (this.backgroundMusic && this.settings.musicEnabled) {
            this.backgroundMusic.play()
                .then(() => {
                    console.log('Background music started:', this.musicTracks[this.currentTrackIndex]);
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
