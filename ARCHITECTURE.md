# Game Architecture Documentation

## Overview

This document describes the architecture of the refactored PixiJS game, focusing on scalability, maintainability, and best practices.

## Architecture Improvements

### 1. **Separation of Concerns**

The game now follows a clear separation of responsibilities:

- **Game.js**: Main orchestrator that coordinates all systems
- **Managers**: Handle specific aspects (state, UI)
- **Services**: Provide reusable functionality (scoring, persistence)
- **Systems**: Game mechanics (collision, particles)
- **Entities**: Game objects (player, falling items)
- **UI**: User interface components

### 2. **State Management**

**Location**: `src/managers/GameStateManager.js`

**Features**:
- Centralized state management using enum pattern
- State transition notifications
- Listener pattern for state changes
- Clean state validation

**States**:
- `LOADING`: Initial loading phase
- `START_SCREEN`: Start/menu screen
- `PLAYING`: Active gameplay
- `PAUSED`: Game paused (for future use)
- `GAME_OVER`: Game over screen

**Usage Example**:
```javascript
// Check state
if (this.stateManager.isPlaying()) {
    // Update game logic
}

// Change state
this.stateManager.setState(GameState.GAME_OVER);

// Listen to state changes
this.stateManager.addListener('myListener', (newState, oldState) => {
    console.log(`State changed from ${oldState} to ${newState}`);
});
```

### 3. **Score Service**

**Location**: `src/services/ScoreService.js`

**Features**:
- LocalStorage-based persistence
- Leaderboard management (top 100)
- Score ranking
- Player statistics
- Easy to extend for backend integration

**Key Methods**:
- `saveScore(username, score)`: Save and rank a score
- `getLeaderboard(limit)`: Get top scores
- `getTopScores(count)`: Get top N scores
- `getPlayerBestScore(username)`: Get player's best
- `getStats()`: Get leaderboard statistics
- `isTopScore(score, topN)`: Check if score qualifies for top N

**Future Extensions**:
```javascript
// Easy to add backend sync
async saveScoreToBackend(scoreData) {
    const response = await fetch('/api/scores', {
        method: 'POST',
        body: JSON.stringify(scoreData)
    });
    return response.json();
}
```

### 4. **UI Manager**

**Location**: `src/managers/UIManager.js`

**Features**:
- Centralized UI screen management
- Proper cleanup and memory management
- Easy to extend with new screens

**Adding New Screens**:
```javascript
// 1. Create screen class in src/ui/
export class PauseScreen {
    constructor(onResume) {
        this.container = new PIXI.Container();
        this.onResume = onResume;
        this.create();
    }

    create() { /* ... */ }
    addToStage(stage) { /* ... */ }
    removeFromStage(stage) { /* ... */ }
    destroy() { /* ... */ }
}

// 2. Add method to UIManager
showPauseScreen(onResume) {
    this.hideCurrentScreen();
    this.currentScreen = new PauseScreen(onResume);
    this.currentScreen.addToStage(this.stage);
}

// 3. Use in Game.js
pause() {
    this.stateManager.setState(GameState.PAUSED);
    this.uiManager.showPauseScreen(() => this.resume());
}
```

### 5. **Improved Game Over Screen**

**Location**: `src/ui/GameOverScreen.js`

**Features**:
- Beautiful leaderboard display
- Player rank with visual feedback
- Achievement badges (top 10, #1 record)
- Efficient button rendering (no recreation on hover)
- Proper cleanup methods
- Responsive design
- Modular component methods

**Visual Features**:
- Top 3 scores highlighted in gold
- Current player highlighted in green
- Achievement badges for top performers
- Smooth hover effects
- Scrollable leaderboard (ready for extension)

### 6. **Memory Management**

**Improvements**:
- Proper event listener cleanup
- Resource destruction on game end
- Stage cleanup between restarts
- Reference nullification
- PIXI destroy with proper flags

**Cleanup Flow**:
```
restart() → cleanup() → resetGameState() → start()
                ↓
        - Remove ticker
        - Clear items
        - Clear stage
        - Destroy UI
        - Reset refs
```

## Project Structure

```
src/
├── managers/
│   ├── GameStateManager.js    # State management
│   └── UIManager.js            # UI screen management
├── services/
│   └── ScoreService.js         # Score persistence & leaderboard
├── systems/
│   ├── CollisionSystem.js     # Collision detection
│   └── ParticleSystem.js      # Particle effects
├── entities/
│   ├── Player.js               # Player entity
│   └── FallingItem.js          # Falling item entity
├── ui/
│   ├── ScoreDisplay.js         # In-game score display
│   └── GameOverScreen.js       # Game over UI
├── utils/
│   ├── AssetLoader.js          # Asset loading
│   └── i18n.js                 # Internationalization
├── config.js                   # Game configuration
├── Game.js                     # Main game orchestrator
└── main.js                     # Entry point
```

## Scalability Guidelines

### Adding New Features

#### 1. **New Game Modes**
```javascript
// Add to config.js
export const GAME_MODES = {
    CLASSIC: 'classic',
    TIMED: 'timed',
    SURVIVAL: 'survival'
};

// Extend GameStateManager or create GameModeManager
export class GameModeManager {
    constructor() {
        this.currentMode = GAME_MODES.CLASSIC;
    }
    // ...
}
```

#### 2. **Power-ups**
```javascript
// Create src/entities/PowerUp.js
export class PowerUp {
    constructor(type, texture) {
        this.type = type;
        this.texture = texture;
        // ...
    }
}

// Add to Game.js
spawnPowerUp() {
    const powerUp = new PowerUp(type, texture);
    this.powerUps.push(powerUp);
}
```

#### 3. **Multiplayer Support**
```javascript
// Create src/services/MultiplayerService.js
export class MultiplayerService {
    async connectToGame(gameId) { /* ... */ }
    sendPlayerAction(action) { /* ... */ }
    onOpponentAction(callback) { /* ... */ }
}
```

#### 4. **Analytics Integration**
```javascript
// Create src/services/AnalyticsService.js
export class AnalyticsService {
    trackGameStart(username) { /* ... */ }
    trackScore(score) { /* ... */ }
    trackGameOver(duration, score) { /* ... */ }
}

// Use in Game.js
this.analyticsService = new AnalyticsService();
```

### Best Practices

1. **Keep Game.js Lean**: Delegate to managers and services
2. **Use Dependency Injection**: Pass dependencies in constructors
3. **Document Public APIs**: Use JSDoc comments
4. **Handle Errors**: Try-catch in async methods
5. **Clean Up**: Always implement destroy/cleanup methods
6. **Event Listeners**: Store references for removal
7. **State Validation**: Check state before operations
8. **Null Checks**: Verify objects exist before use

### Testing Strategy

```javascript
// Example unit test structure (for future)
describe('ScoreService', () => {
    let scoreService;

    beforeEach(() => {
        scoreService = new ScoreService();
        localStorage.clear();
    });

    test('saves score correctly', () => {
        const result = scoreService.saveScore('Player1', 100);
        expect(result.rank).toBe(1);
    });

    test('ranks scores correctly', () => {
        scoreService.saveScore('Player1', 100);
        scoreService.saveScore('Player2', 200);
        const leaderboard = scoreService.getLeaderboard();
        expect(leaderboard[0].username).toBe('Player2');
    });
});
```

## Configuration

All game configuration is centralized in `src/config.js`:

- `GAME_CONFIG`: Core game settings
- `PLAYER_CONFIG`: Player-specific settings
- `ITEM_CONFIG`: Item spawn/behavior settings
- `DIFFICULTY_CONFIG`: Difficulty progression
- `PARTICLE_CONFIG`: Particle effect settings

## Internationalization

Translation files: `public/locales/{lang}.json`

Adding new language:
1. Create `public/locales/en.json`
2. Update `i18n.load('en')`
3. Add language selector UI

## Future Enhancements

### Recommended Additions

1. **Pause Menu**
   - Pause/resume functionality
   - Settings menu
   - Sound controls

2. **Sound System**
   ```javascript
   // src/systems/SoundSystem.js
   export class SoundSystem {
       playSound(soundId) { /* ... */ }
       playMusic(musicId) { /* ... */ }
       setVolume(volume) { /* ... */ }
   }
   ```

3. **Settings Persistence**
   ```javascript
   // src/services/SettingsService.js
   export class SettingsService {
       getSetting(key) { /* ... */ }
       setSetting(key, value) { /* ... */ }
   }
   ```

4. **Backend Integration**
   ```javascript
   // src/services/BackendService.js
   export class BackendService {
       async syncLeaderboard() { /* ... */ }
       async submitScore(score) { /* ... */ }
   }
   ```

5. **Tutorial System**
   - First-time player guide
   - Interactive tutorial
   - Hint system

6. **Achievements**
   ```javascript
   // src/services/AchievementService.js
   export class AchievementService {
       checkAchievements(gameStats) { /* ... */ }
       unlockAchievement(id) { /* ... */ }
   }
   ```

## Performance Considerations

- **Object Pooling**: Reuse falling items instead of creating new ones
- **Sprite Batching**: PixiJS handles this automatically
- **Texture Atlases**: Combine textures for better performance
- **Limit Particles**: Cap particle count for low-end devices
- **Debounce Resize**: Already implemented with setTimeout

## Telegram Web App Integration

**Status**: ✅ **FULLY IMPLEMENTED**

The game is now fully integrated with Telegram Web App API!

**Location**: `src/services/TelegramService.js`

**Features Implemented**:
- ✅ Telegram SDK initialization
- ✅ Viewport management (handles keyboard, safe areas)
- ✅ User info extraction (auto-fill username)
- ✅ Haptic feedback (vibration on events)
- ✅ Theme color integration
- ✅ Platform detection (Android/iOS/Web)
- ✅ Dialogs (confirm, alert)
- ✅ Closing confirmation
- ✅ Viewport change events

**Key Features**:

```javascript
// Automatic username from Telegram
const username = telegramService.getUserDisplayName();

// Haptic feedback
telegramService.hapticFeedback('light');  // On catching items
telegramService.hapticFeedback('error');  // On game over

// Viewport handling
const viewport = telegramService.getViewportDimensions();
// Returns: { width, height, stableHeight, isExpanded }

// Platform detection
if (telegramService.isMobile()) {
    // Optimize for mobile
}
```

**Viewport Management**:
The game automatically:
- Uses Telegram's `viewportStableHeight` for consistent sizing
- Accounts for safe area insets (notches)
- Handles keyboard show/hide
- Adjusts for orientation changes
- Respects device-specific constraints

**See `TELEGRAM_SETUP.md` for complete setup and deployment guide!**

## Conclusion

This architecture provides a solid foundation for:
- Easy feature additions
- Maintainable code
- Memory-efficient operation
- Scalable design
- Testing capability
- Team collaboration

Follow the patterns established here when adding new features to maintain consistency and code quality.
