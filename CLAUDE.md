# CLAUDE.md - AI Assistant Project Guide

> **For AI Assistants**: This document provides comprehensive context about the project to help you assist effectively. Read this first before making any changes.

---

## 🎮 Project Overview

**Name**: Žolės Gaudytojas (Weed Catcher Game)
**Type**: Telegram Web App Game
**Tech Stack**: PixiJS v8, Vite, Tailwind CSS, WebSocket
**Language**: Lithuanian (primary), extensible i18n system
**Target Platform**: Telegram mobile app (iOS & Android)

### Game Concept
A falling object catcher game where players:
- Catch good items (vorinio dumai, vorinio sniegas) for points
- Avoid bad items (chimke) which end the game
- Collect power-ups (bucket) for temporary effects
- Compete on real-time WebSocket-powered leaderboard
- Experience progressive difficulty (speed increases with score)

---

## 🏗️ Architecture

### Design Pattern: Component-Based Architecture

```
Game.js (Orchestrator)
    ↓
├── Managers/     - High-level coordination
│   ├── GameStateManager    - State machine (LOADING, PLAYING, GAME_OVER, etc.)
│   └── UIManager           - Screen/modal management
│
├── Services/     - Business logic & external communication
│   ├── TelegramService     - Telegram Web App API integration
│   ├── WebSocketService    - Real-time server communication
│   ├── ScoreService        - Score persistence (localStorage + server sync)
│   └── i18n                - Internationalization
│
├── Systems/      - Game mechanics
│   ├── CollisionSystem     - AABB collision detection
│   └── ParticleSystem      - Visual effects
│
├── Entities/     - Game objects
│   ├── Player              - Basket controlled by mouse/touch
│   └── FallingItem         - Items/power-ups with physics
│
└── UI/           - User interface components
    ├── overlays/           - In-game HUD elements
    └── modals/             - Full-screen modal dialogs
```

### Core Principles

1. **Separation of Concerns**: Each class has single responsibility
2. **Configuration-Driven**: Add items/power-ups via config, not code
3. **Service Injection**: Dependencies passed via constructors
4. **Event-Driven**: State changes trigger events, loose coupling
5. **Mobile-First**: Portrait orientation, touch-optimized, responsive

---

## 📁 Critical Files & Their Purposes

### Configuration (`src/config.js`)
**MOST IMPORTANT FILE FOR GAMEPLAY CHANGES**

```javascript
// Viewport Management
getSafeViewportDimensions() // Handles Telegram viewport, normalizes screen size

// Game Settings
GAME_CONFIG                  // Core game properties (width, height, spawn rate)
PLAYER_CONFIG               // Player properties (scale, movement bounds)
ITEM_CONFIG                 // Item physics (speed, rotation, swing)
DIFFICULTY_CONFIG           // Progression (speed increase, spawn rate)
PARTICLE_CONFIG             // Visual effects settings

// Content (Easy to extend!)
ITEMS_CONFIG                // All catchable items with properties
POWERUPS_CONFIG            // All power-ups with effects
WS_CONFIG                  // WebSocket server URL

// Helper Functions
getRandomItem()            // Weighted random item selection
getRandomPowerUp()         // Power-up spawn chance logic
updateGameDimensions()     // Recalculate on resize/orientation
```

### Main Game Loop (`src/Game.js`)

**Key Methods**:
- `init()` - Setup PixiJS, load assets, initialize systems
- `start()` - Begin game session, reset state
- `update(delta)` - Main game loop (60 FPS)
- `spawnFallingItem()` - Create items based on config
- `handleItemCatch()` - Process collision, apply effects
- `increaseDifficulty()` - Progressive speed/spawn changes
- `gameOver()` - End session, save score, show results
- `restart()` - Clean up and start fresh

**Important**: Always check `stateManager.isPlaying()` before game logic

### Entity System

**Player** (`src/entities/Player.js`)
- Touch/mouse input handling
- Position clamping (stays on screen)
- **Critical**: Uses `GAME_CONFIG.width` for coordinate mapping (not `canvas.width`)

**FallingItem** (`src/entities/FallingItem.js`)
- Physics: speed, rotation, swing animation
- Configuration-based (no hard-coded types)
- Methods: `isScoreable()`, `isGameOver()`, `getScoreValue()`

### Services

**TelegramService** (`src/services/TelegramService.js`)
- Auto-fill username from Telegram profile
- Haptic feedback (vibration)
- Viewport management (handles keyboard, notches)
- Platform detection (iOS/Android/Web)

**WebSocketService** (`src/services/WebSocketService.js`)
- Real-time communication with `wss://server.pax.lt:8080`
- Auto-reconnect (5 attempts, 3s delay)
- Methods: `submitScore()`, `getLeaderboard()`, `getPlayerStats()`
- **Fallback**: Uses localStorage if WebSocket unavailable

**ScoreService** (`src/services/ScoreService.js`)
- LocalStorage persistence
- Top 100 leaderboard
- Ranking algorithm
- Easy to extend for backend integration

---

## 🎯 Common Tasks

### Adding a New Item

**File**: `src/config.js`

```javascript
// 1. Add to ITEMS_CONFIG
golden_leaf: {
    id: 'golden_leaf',
    nameKey: 'items.goldenLeaf',           // Translation key
    descriptionKey: 'items.goldenLeafDesc',
    texture: 'goldenLeaf',                 // From AssetLoader
    scoreValue: 10,                        // Points (0 = no score)
    gameOver: false,                       // true = ends game
    rarity: 5,                             // Lower = rarer
    color: '#FFD700',                      // Text label color
    particleColor: '#FFA500',              // Effect color
    haptic: 'heavy'                        // Vibration type
}

// 2. Load texture in src/utils/AssetLoader.js
this.textures.goldenLeaf = await PIXI.Assets.load('/assets/golden-leaf.svg');

// 3. Add translation in public/locales/lt.json
"items": {
    "goldenLeaf": "Auksinis lapas",
    "goldenLeafDesc": "+10 taškų (labai retas!)"
}

// 4. Add SVG asset to /assets/ folder
// That's it! Item will spawn automatically based on rarity
```

### Adding a Power-Up

**File**: `src/config.js`

```javascript
// 1. Add to POWERUPS_CONFIG
shield: {
    id: 'shield',
    nameKey: 'powerups.shield',
    descriptionKey: 'powerups.shieldDescription',
    texture: 'shield',
    icon: '🛡️',                           // For timer display
    spawnChance: 0.03,                    // 3% spawn chance
    color: '#00FFFF',
    particleColor: '#00CED1',
    haptic: 'success',
    duration: 8000,                       // Milliseconds
    effectType: 'invincibility',          // Custom type
    effectValue: true
}

// 2. If new effect type, implement in src/Game.js
handlePowerUpCatch(item, position) {
    const config = item.getConfig();

    if (config.effectType === 'speed_multiplier') {
        this.applySpeedMultiplierEffect(config);
    }
    else if (config.effectType === 'invincibility') {
        this.applyInvincibilityEffect(config); // Add this method
    }
}

applyInvincibilityEffect(config) {
    this.invincible = true;
    if (this.powerUpTimer) {
        this.powerUpTimer.start(config.id, config.duration);
    }
    // Timer expiration handled automatically in update()
}
```

### Adding a Translation

**File**: `public/locales/lt.json` (or create `en.json`, etc.)

```json
{
    "game": {
        "title": "Žolės Gaudytojas",
        "start": "Pradėti Žaidimą"
    },
    "items": {
        "newItem": "Naujas daiktas"
    }
}
```

**Usage in code**:
```javascript
import { i18n } from './utils/i18n.js';
const text = i18n.t('game.title'); // "Žolės Gaudytojas"
```

### Adjusting Difficulty

**File**: `src/config.js`

```javascript
export const DIFFICULTY_CONFIG = {
    speedIncreasePerScore: 0.1,    // ↑ Faster progression
    maxSpeedMultiplier: 5,         // ↑ Higher top speed
    spawnRateIncrease: 2,          // ↑ Faster spawn acceleration
    minSpawnInterval: 25           // ↓ Faster minimum spawn
};
```

### Changing Screen Normalization

**File**: `src/config.js` in `getSafeViewportDimensions()`

```javascript
const STANDARD_WIDTH = 430;  // Standard mobile width
const MAX_WIDTH = 500;       // Max width for tablets
```

**Why**: Ensures consistent difficulty across devices by limiting width

---

## 🔧 Configuration Details

### Viewport Management

**Problem Solved**: Telegram apps have dynamic viewports (keyboard, notches, etc.)

**Solution**:
```javascript
// Uses Telegram's stable viewport height
tg.viewportStableHeight  // Doesn't change with keyboard

// Accounts for notches
tg.safeAreaInset.top/bottom

// Normalizes width for consistent difficulty
STANDARD_WIDTH = 430px  // All wide devices use this
```

**Portrait Lock**:
- Meta tags (`index.html`)
- CSS media query warning (`src/styles.css`)
- JavaScript Screen Orientation API (`src/main.js`)
- Config dimension swap if landscape detected

### Touch Input Handling

**Critical Fix Applied**:
```javascript
// ❌ WRONG (causes offset issues)
const scaleX = canvas.width / rect.width;

// ✅ CORRECT (accurate mapping)
const scaleX = GAME_CONFIG.width / rect.width;
```

**Why**: `canvas.width` is physical pixels (e.g., 1290px on Retina), but game logic uses logical pixels (e.g., 430px). Always use `GAME_CONFIG.width` for coordinate mapping.

### State Management

**States**: `LOADING` → `START_SCREEN` → `PLAYING` → `GAME_OVER`

**Usage**:
```javascript
// Check state
if (this.stateManager.isPlaying()) { /* ... */ }

// Change state
this.stateManager.setState(GameState.GAME_OVER);

// Listen to changes
this.stateManager.addListener('myListener', (newState, oldState) => {
    console.log(`State: ${oldState} → ${newState}`);
});
```

### WebSocket Protocol

**Server**: `wss://server.pax.lt:8080`

**Message Format**:
```javascript
// Outgoing
{
    type: 'SUBMIT_SCORE',
    payload: {
        username: 'Player1',
        score: 100,
        telegramUserId: 123456,
        telegramUsername: 'player1'
    }
}

// Incoming
{
    type: 'SCORE_SUBMITTED',
    payload: {
        rank: 5,
        username: 'Player1',
        score: 100
    }
}
```

**Auto-Reconnect**: 5 attempts, 3-second delay between attempts

**Fallback**: Uses `ScoreService` (localStorage) if WebSocket unavailable

---

## 🚨 Critical Rules & Gotchas

### ⚠️ DO NOT

1. **Never use `canvas.width` or `canvas.height` for game logic**
   - Use `GAME_CONFIG.width` and `GAME_CONFIG.height` instead
   - Canvas dimensions are in physical pixels (device pixel ratio)

2. **Never hard-code item types in game logic**
   - Use configuration system: `ITEMS_CONFIG`, `POWERUPS_CONFIG`
   - Check properties: `item.isScoreable()`, `item.isGameOver()`

3. **Never modify dimensions without using `updateGameDimensions()`**
   - Ensures proper recalculation
   - Updates all dependent systems

4. **Never skip cleanup in `destroy()` or `restart()`**
   - Memory leaks are real
   - Remove event listeners, null references, call PIXI.destroy()

5. **Never assume WebSocket is connected**
   - Always check `wsService.isConnected()`
   - Implement localStorage fallback

6. **Never test only in browser**
   - Always test in Telegram app (iOS + Android)
   - Viewport behavior differs significantly

### ✅ DO

1. **Always check game state before operations**
   ```javascript
   if (!this.stateManager.isPlaying()) return;
   ```

2. **Always use configuration for new items/power-ups**
   - Add to `ITEMS_CONFIG` or `POWERUPS_CONFIG`
   - No code changes needed in Game.js

3. **Always provide translations**
   - Add to `public/locales/lt.json`
   - Use `i18n.t('key')` for text

4. **Always implement cleanup methods**
   ```javascript
   destroy() {
       // Remove listeners
       // Null references
       // Call parent destroy
   }
   ```

5. **Always test on multiple screen sizes**
   - Small phone (320px width)
   - Standard phone (375-430px)
   - Large phone (430-500px)
   - Tablet (should cap at 500px)

---

## 🎨 Code Style & Conventions

### File Naming
- Classes: PascalCase (`GameStateManager.js`)
- Utilities: camelCase (`i18n.js`)
- Constants: UPPER_SNAKE_CASE (`GAME_CONFIG`)

### Class Structure
```javascript
export class MyClass {
    // 1. Constructor with properties
    constructor() {
        this.property = value;
    }

    // 2. Public methods
    publicMethod() { }

    // 3. Private methods (prefix with _)
    _privateMethod() { }

    // 4. Cleanup
    destroy() {
        // Clean up resources
    }
}
```

### Comments
```javascript
/**
 * JSDoc for public APIs
 * @param {type} name - Description
 * @returns {type} Description
 */
publicMethod(name) { }

// Inline comments for complex logic
const x = calculateComplexValue(); // Explain why
```

### Logging
- Use `console.log()` for info
- Use `console.warn()` for warnings
- Use `console.error()` for errors
- Prefix logs with context: `console.log('[Game] Starting...')`

---

## 🧪 Testing

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing Checklist

**Browser Testing**:
- [ ] Game loads without errors
- [ ] Username input works
- [ ] Game starts and plays smoothly
- [ ] Touch/mouse controls respond accurately
- [ ] Score increases correctly
- [ ] Items spawn and fall
- [ ] Collisions detected properly
- [ ] Game over triggers correctly
- [ ] Restart works cleanly

**Telegram Testing** (CRITICAL):
- [ ] Open in Telegram iOS app
- [ ] Open in Telegram Android app
- [ ] Username auto-fills from profile
- [ ] Viewport fills screen properly (no black bars)
- [ ] Try rotating device (should warn or lock)
- [ ] Touch controls work accurately
- [ ] Haptic feedback works (vibration)
- [ ] Safe areas respected (no content under notch)
- [ ] Keyboard doesn't break layout
- [ ] WebSocket connects and saves scores

**Device Testing**:
- [ ] iPhone SE (small - 375px)
- [ ] iPhone 14 (standard - 393px)
- [ ] iPhone Pro Max (large - 430px)
- [ ] Android (various sizes)
- [ ] iPad (should cap at 500px width)

### Debug Mode

Add this to check dimensions:
```javascript
console.log('Game dimensions:', GAME_CONFIG.width, GAME_CONFIG.height);
console.log('Canvas dimensions:', canvas.width, canvas.height);
console.log('Screen dimensions:', window.innerWidth, window.innerHeight);
console.log('Device pixel ratio:', window.devicePixelRatio);
```

---

## 🚀 Deployment

### Build Process
```bash
npm run build        # Creates /dist folder
```

### Deployment Target
**Server**: `wss://server.pax.lt:8080`
**Protocol**: Secure WebSocket (WSS) for production

### Files to Deploy
- Upload entire `/dist` folder
- Ensure `index.html` is root
- Configure server for SPA (fallback to index.html)

### Post-Deployment
1. Test WebSocket connection
2. Verify leaderboard updates
3. Check Telegram integration
4. Monitor console for errors

---

## 📚 Key Dependencies

### PixiJS v8
- 2D WebGL rendering engine
- Handles sprites, textures, animations
- Auto-optimizes for device (WebGL/WebGPU)

### Vite
- Build tool & dev server
- Hot module replacement
- Optimized production builds

### Tailwind CSS
- Utility-first CSS framework
- Custom animations in `src/styles.css`
- Configured for dark theme

### Telegram Web App SDK
- Loaded via CDN: `https://telegram.org/js/telegram-web-app.js`
- Provides `window.Telegram.WebApp` API
- Handles viewport, haptics, user info

---

## 🔍 Troubleshooting Guide

### Issue: Touch offset on left side
**Fix**: Ensure using `GAME_CONFIG.width` not `canvas.width` in `Player.js`

### Issue: Game too easy/hard on different devices
**Fix**: Check `STANDARD_WIDTH` in `config.js` → `getSafeViewportDimensions()`

### Issue: Screen rotates to landscape
**Fix**: Check all three locks (meta tags, CSS, JS Screen Orientation API)

### Issue: Black bars in Telegram
**Fix**: Ensure using `tg.viewportStableHeight` and `safeAreaInset` in `config.js`

### Issue: Items not spawning
**Fix**: Check `rarity` values in `ITEMS_CONFIG` (must be > 0)

### Issue: WebSocket won't connect
**Fix**: Check `WS_CONFIG.url` and server status. Game should fallback to localStorage.

### Issue: Player won't move
**Fix**: Check if touch events are being prevented by CSS `touch-action` or other elements

### Issue: Build fails
**Fix**: Clear `node_modules` and `dist`, run `npm install`, then `npm run build`

---

## 📖 Documentation Files

- **README.md** - Project overview, quick start
- **ARCHITECTURE.md** - Detailed architecture, design patterns
- **TELEGRAM_SETUP.md** - Telegram bot setup, deployment guide
- **TELEGRAM_CHANGES.md** - Changelog of Telegram integration
- **ADDING_ITEMS.md** - Step-by-step guide for content
- **DEPLOYMENT.md** - Deployment instructions
- **CLAUDE.md** (this file) - AI assistant reference

---

## 🎯 Quick Reference

### Most Common Changes

| Task | File | Section |
|------|------|---------|
| Add item | `src/config.js` | `ITEMS_CONFIG` |
| Add power-up | `src/config.js` | `POWERUPS_CONFIG` |
| Adjust difficulty | `src/config.js` | `DIFFICULTY_CONFIG` |
| Change screen size | `src/config.js` | `getSafeViewportDimensions()` |
| Fix touch controls | `src/entities/Player.js` | `handleTouch()` / `handleMove()` |
| Modify game loop | `src/Game.js` | `update()` |
| Add translation | `public/locales/lt.json` | Add key-value |
| Change spawn rate | `src/config.js` | `GAME_CONFIG.spawnInterval` |
| Modify WebSocket | `src/services/WebSocketService.js` | Message handlers |

### Key Formulas

**Spawn Chance**:
```javascript
// Items: Weighted random based on rarity
totalWeight = sum(all rarity values)
chance = item.rarity / totalWeight

// Power-ups: Independent spawn chance
if (Math.random() < powerup.spawnChance) { spawn(); }
```

**Difficulty Progression**:
```javascript
// Speed increases per score
newSpeed = oldSpeed + DIFFICULTY_CONFIG.speedIncreasePerScore
newSpeed = Math.min(newSpeed, DIFFICULTY_CONFIG.maxSpeedMultiplier)

// Spawn interval decreases
newInterval = oldInterval - DIFFICULTY_CONFIG.spawnRateIncrease
newInterval = Math.max(newInterval, DIFFICULTY_CONFIG.minSpawnInterval)
```

**Touch Coordinate Mapping**:
```javascript
const rect = canvas.getBoundingClientRect();
const scaleX = GAME_CONFIG.width / rect.width;
const gameX = (event.clientX - rect.left) * scaleX;
```

---

## 🤖 For AI Assistants: Best Practices

### When Reading This Project

1. **Start here** (CLAUDE.md) for context
2. Read `ARCHITECTURE.md` for detailed design
3. Check `src/config.js` for current settings
4. Review `src/Game.js` for game loop logic
5. Check relevant documentation files

### When Making Changes

1. **Always use configuration system** for content changes
2. **Never hard-code** item types or properties
3. **Always test** in both browser and Telegram
4. **Document** any new patterns or gotchas
5. **Follow** existing code style and structure
6. **Update** relevant `.md` files if architecture changes

### When Debugging

1. **Check console** for errors and warnings
2. **Verify** `GAME_CONFIG.width` vs `canvas.width` usage
3. **Test** on multiple devices/screen sizes
4. **Confirm** WebSocket connection status
5. **Review** state management transitions

### When User Asks For Help

1. **Reference** this file for context
2. **Explain** why using config system is better
3. **Provide** concrete code examples
4. **Mention** potential gotchas
5. **Suggest** testing steps

---

## 📝 Version History

### Current Version
- Portrait orientation locked
- Touch controls fixed (accurate coordinate mapping)
- Screen size normalized (430px standard width)
- WebSocket integration (`wss://server.pax.lt:8080`)
- Telegram Web App fully integrated
- Configuration-driven content system
- Real-time leaderboard

### Recent Major Changes
- **2025-01**: Fixed orientation, touch offset, screen normalization
- **2024-12**: WebSocket integration for real-time scoring
- **2024-12**: Telegram Web App integration
- **2024-11**: Configuration system for items/power-ups
- **2024-11**: Architecture refactor (managers, services, systems)

---

## 🎓 Learning Resources

- **PixiJS Docs**: https://pixijs.com/
- **Telegram Web Apps**: https://core.telegram.org/bots/webapps
- **Vite Docs**: https://vitejs.dev/
- **WebSocket API**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

## ✅ Checklist for New AI Sessions

When starting a new conversation:
- [ ] Read this CLAUDE.md file completely
- [ ] Check current `src/config.js` for settings
- [ ] Review recent git commits for context
- [ ] Understand user's goal before suggesting changes
- [ ] Use configuration system for content changes
- [ ] Test changes before marking complete
- [ ] Update documentation if needed

---

**Last Updated**: 2025-01-11
**Maintained By**: Project contributors and AI assistants
**Purpose**: Provide complete context for AI-assisted development

---

*This file should be updated whenever significant changes are made to architecture, patterns, or critical systems.*
