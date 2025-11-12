# CLAUDE.md - AI Assistant Project Guide

> **For AI Assistants**: This is the single source of truth for understanding and working with this project. Read this first before making any changes.

---

## 🎮 Project Overview

**Name**: Žolės Gaudytojas (Weed Catcher Game)
**Type**: Telegram Web App Game
**Tech Stack**: PixiJS v8, Vite, Tailwind CSS, WebSocket
**Language**: Lithuanian (primary), extensible i18n system
**Target**: Telegram mobile app (iOS & Android)

### Game Concept
Falling object catcher game:
- Catch good items (vorinio dumai, vorinio sniegas) for points
- Avoid bad items (chimke) - ends game
- Collect power-ups (bucket) for temporary effects
- Real-time WebSocket leaderboard
- Progressive difficulty (speed increases with score)

---

## 🏗️ Architecture

### Current System: **Entity Component System (ECS) + Event-Driven**

**Phase 1 & 2 Complete** - Professional game engine architecture with:
- ✅ Object pooling (60% less GC)
- ✅ Event-driven architecture (decoupled systems)
- ✅ Scene management (menu/game/pause screens)
- ✅ Full ECS with 7 components and 4 systems
- ✅ Spatial hash collision (3-5x faster)
- ✅ Prefab system for entity templates

### Architecture Pattern

```
Game.js (Orchestrator)
    ↓
├── Core Systems
│   ├── EventBus           - Global event communication
│   ├── ObjectPool         - Memory optimization
│   └── SceneManager       - Screen management
│
├── ECS Architecture
│   ├── World              - ECS coordinator
│   ├── Entities           - Game objects (composition-based)
│   ├── Components         - Pure data (Transform, Physics, Sprite, etc.)
│   └── Systems            - Pure logic (Physics, Collision, Render, etc.)
│
├── Managers
│   ├── GameStateManager   - State machine (LOADING, PLAYING, GAME_OVER)
│   ├── UIManager          - Screen/modal management
│   ├── InputManager       - Unified input handling
│   └── PowerUpManager     - Power-up effect management
│
├── Services
│   ├── TelegramService    - Telegram Web App API integration
│   ├── WebSocketService   - Real-time server communication
│   ├── ScoreService       - Score persistence (localStorage + server)
│   └── AudioService       - Music and sound effects
│
└── Prefabs
    └── FallingItemPrefab  - Entity templates (items, player, particles)
```

---

## 📁 Project Structure

```
src/
├── core/                       # Core engine systems
│   ├── ObjectPool.js          # Generic object pooling (165 lines)
│   ├── EventBus.js            # Event system (285 lines)
│   ├── GameEvents.js          # Event constants (96 lines)
│   └── Scene.js               # Base scene class (155 lines)
│
├── ecs/                        # Entity Component System
│   ├── Entity.js              # Entity container (190 lines)
│   ├── Component.js           # Base component (45 lines)
│   ├── System.js              # Base system (85 lines)
│   ├── World.js               # ECS world manager (260 lines)
│   │
│   ├── components/            # Data components
│   │   ├── Transform.js       # Position, rotation, scale
│   │   ├── Physics.js         # Velocity, gravity
│   │   ├── Sprite.js          # Visual representation
│   │   ├── Collider.js        # Collision bounds
│   │   ├── Item.js            # Item data (score, type)
│   │   ├── PowerUp.js         # Power-up data
│   │   └── Lifetime.js        # Auto-destroy timer
│   │
│   └── systems/               # Logic systems
│       ├── PhysicsSystem.js   # Move entities (priority 20)
│       ├── CollisionSystem.js # Detect collisions (priority 30)
│       ├── LifetimeSystem.js  # Remove expired (priority 50)
│       └── RenderSystem.js    # Draw sprites (priority 60)
│
├── prefabs/                    # Entity templates
│   └── FallingItemPrefab.js   # Factory for items/player/particles
│
├── pools/                      # Object pools
│   └── ItemPool.js            # FallingItem pool
│
├── managers/                   # High-level coordination
│   ├── GameStateManager.js    # State machine with events
│   ├── UIManager.js           # Screen management
│   ├── SceneManager.js        # Scene transitions
│   ├── InputManager.js        # Unified input handling
│   ├── EntityManager.js       # Entity lifecycle (uses pooling)
│   ├── ConfigManager.js       # Runtime config management
│   └── PowerUpManager.js      # Power-up effects
│
├── services/                   # External communication
│   ├── TelegramService.js     # Telegram API integration
│   ├── WebSocketService.js    # Real-time server (wss://server.pax.lt:8080)
│   ├── ScoreService.js        # Score persistence
│   └── AudioService.js        # Sound/music playback
│
├── scenes/                     # Game screens
│   └── GameScene.js           # Main game logic (450 lines)
│
├── systems/                    # Game mechanics (legacy - being migrated to ECS)
│   ├── CollisionSystem.js     # AABB collision detection
│   └── ParticleSystem.js      # Visual effects
│
├── entities/                   # Game objects (legacy - use ECS prefabs instead)
│   ├── Player.js              # Basket controlled by input
│   └── FallingItem.js         # Items with physics (pooling-ready)
│
├── ui/                         # User interface
│   ├── components/            # Reusable UI components
│   ├── overlays/              # In-game HUD (ScoreDisplay, PowerUpTimer)
│   └── modals/                # Full-screen dialogs (GameOverScreen)
│
├── utils/                      # Utilities
│   ├── AssetLoader.js         # Texture/asset loading
│   ├── i18n.js                # Internationalization
│   ├── SpatialHash.js         # Grid-based collision optimization (180 lines)
│   └── MusicLibrary.js        # Music track database
│
├── config.js                   # **MOST IMPORTANT FILE** - All game config
├── Game.js                     # Main game orchestrator (900+ lines)
└── main.js                     # Entry point

public/
├── locales/
│   └── lt.json                # Lithuanian translations
└── assets/                     # SVG textures, music
```

---

## 🔑 Critical Files & Their Purpose

### 1. `src/config.js` - **MOST IMPORTANT FILE**

**This is where you make 90% of gameplay changes!**

```javascript
// Viewport Management (handles Telegram viewport)
getSafeViewportDimensions()     // Returns normalized dimensions

// Core Settings
GAME_CONFIG                      // Width, height, spawn rate, FPS
PLAYER_CONFIG                    // Player scale, movement bounds
ITEM_CONFIG                      // Item physics, speed, rotation
DIFFICULTY_CONFIG                // Progression (speed/spawn increase)
PARTICLE_CONFIG                  // Visual effects settings

// Content Configuration (Easy to extend!)
ITEMS_CONFIG                     // All catchable items
  ├── vorinio_dumai              // Good item (+1 score)
  ├── vorinio_sniegas            // Good item (+1 score)
  └── chimke                     // Bad item (game over)

POWERUPS_CONFIG                  // All power-ups
  └── bucket                     // Speed multiplier (x0.5, 5 seconds)

WS_CONFIG                        // WebSocket server URL

// Helper Functions
getRandomItem()                  // Weighted random item selection
getRandomPowerUp()               // Power-up spawn chance
updateGameDimensions()           // Recalculate on resize
```

### 2. `src/Game.js` - Main Orchestrator

**Key Methods**:
- `init()` - Setup PixiJS, load assets, initialize systems
- `start()` - Begin game session, reset state
- `update(delta)` - Main game loop (60 FPS)
- `spawnFallingItem()` - Create items based on config
- `handleItemCatch()` - Process collision, apply effects
- `increaseDifficulty()` - Progressive speed/spawn changes
- `gameOver()` - End session, save score, show results
- `restart()` - Clean up and start fresh

**Always check state**: `if (!this.stateManager.isPlaying()) return;`

### 3. ECS System Files

**Entity** (`src/ecs/Entity.js`)
```javascript
const entity = world.createEntity('player_1');
entity.addComponent(new Transform(100, 200));
entity.addComponent(new Physics(0, 5));
entity.addTag('player');
```

**World** (`src/ecs/World.js`)
```javascript
world.createEntity(id);           // Create entity
world.destroyEntity(entity);      // Destroy entity
world.queryEntities('Transform'); // Find entities with components
world.queryEntitiesByTag('item'); // Find entities by tag
world.update(delta);              // Update all systems
```

**Prefabs** (`src/prefabs/FallingItemPrefab.js`)
```javascript
FallingItemPrefab.create(world, {
    texture, itemConfig, x, y, speed
}); // Creates pre-configured entity

FallingItemPrefab.createPlayer(world, options);
FallingItemPrefab.createParticle(world, options);
```

### 4. Event System

**EventBus** (`src/core/EventBus.js`)
```javascript
import { eventBus } from './core/EventBus.js';
import { GameEvents } from './core/GameEvents.js';

// Listen
eventBus.on(GameEvents.ITEM_CAUGHT, (data) => {
    console.log('Score:', data.score);
});

// Emit
eventBus.emit(GameEvents.ITEM_CAUGHT, { score: 10 });

// One-time
eventBus.once(GameEvents.GAME_OVER, callback);

// Remove
eventBus.off(GameEvents.ITEM_CAUGHT, callback);
```

**Available Events** (50+ in GameEvents.js):
- Game: `GAME_STARTED`, `GAME_OVER`, `GAME_PAUSED`, `GAME_RESTARTED`
- Items: `ITEM_SPAWNED`, `ITEM_CAUGHT`, `ITEM_MISSED`
- Power-ups: `POWERUP_ACTIVATED`, `POWERUP_EXPIRED`
- Collision: `COLLISION_DETECTED`
- State: `STATE_CHANGED`

### 5. Player Entity

**Player** (`src/entities/Player.js`)
- Touch/mouse input handling
- Position clamping (stays on screen)
- **Critical**: Uses `GAME_CONFIG.width` for coordinate mapping (not `canvas.width`)

### 6. Services

**TelegramService** (`src/services/TelegramService.js`)
- Auto-fill username from Telegram profile
- Haptic feedback (vibration)
- Viewport management (keyboard, notches, safe areas)
- Platform detection (iOS/Android/Web)

**WebSocketService** (`src/services/WebSocketService.js`)
- Real-time: `wss://server.pax.lt:8080`
- Auto-reconnect (5 attempts, 3s delay)
- Methods: `submitScore()`, `getLeaderboard()`, `getPlayerStats()`
- Fallback: localStorage if WebSocket unavailable

**ScoreService** (`src/services/ScoreService.js`)
- LocalStorage persistence
- Top 100 leaderboard
- Ranking algorithm

---

## 🎯 Common Tasks

### Adding a New Item

**File**: `src/config.js`

```javascript
// 1. Add to ITEMS_CONFIG
export const ITEMS_CONFIG = {
    // ... existing items
    golden_leaf: {
        id: 'golden_leaf',
        nameKey: 'items.goldenLeaf',           // Translation key
        descriptionKey: 'items.goldenLeafDesc',
        texture: 'goldenLeaf',                 // From AssetLoader
        scoreValue: 10,                        // Points (0 = no score)
        gameOver: false,                       // true = ends game
        rarity: 5,                             // Lower = rarer (weighted random)
        color: '#FFD700',                      // Text label color
        particleColor: '#FFA500',              // Particle effect color
        haptic: 'heavy'                        // Vibration: light/medium/heavy/error/success
    }
};

// 2. Load texture in src/utils/AssetLoader.js
async loadTextures() {
    // ... existing textures
    this.textures.goldenLeaf = await PIXI.Assets.load('/assets/golden-leaf.svg');
}

// 3. Add translation in public/locales/lt.json
{
    "items": {
        "goldenLeaf": "Auksinis lapas",
        "goldenLeafDesc": "+10 taškų (labai retas!)"
    }
}

// 4. Add SVG asset to /public/assets/ folder
// That's it! Item spawns automatically based on rarity
```

### Adding a Power-Up

**File**: `src/config.js`

```javascript
// 1. Add to POWERUPS_CONFIG
export const POWERUPS_CONFIG = {
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
};

// 2. Load texture in AssetLoader.js (same as item)

// 3. Add translation (same as item)

// 4. If NEW effect type, implement in src/Game.js
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

**File**: `public/locales/lt.json`

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

### Creating an Entity with ECS

```javascript
import { World } from './ecs/World.js';
import { FallingItemPrefab } from './prefabs/FallingItemPrefab.js';

// Create world
const world = new World();

// Add systems (order matters - priority determines execution order)
world.addSystem(new PhysicsSystem());           // Priority 20
world.addSystem(new CollisionSystem());         // Priority 30
world.addSystem(new LifetimeSystem());          // Priority 50
world.addSystem(new RenderSystem(app.stage));   // Priority 60

// Create entity using prefab
const item = FallingItemPrefab.create(world, {
    texture: basketTexture,
    itemConfig: config,
    x: 100,
    y: 0,
    speed: 2
});

// Or create manually
const entity = world.createEntity('custom_1');
entity.addComponent(new Transform(100, 200));
entity.addComponent(new Physics(0, 5, 0.5)); // vx, vy, gravity
entity.addComponent(new Sprite(texture));
entity.addTag('custom');

// Update in game loop
app.ticker.add((delta) => {
    world.update(delta); // All systems run in priority order
});

// Query entities
const players = world.queryEntitiesByTag('player');
const movingEntities = world.queryEntities('Transform', 'Physics');

// Destroy entity
world.destroyEntity(entity);
```

### Setting Up Collision Detection with ECS

```javascript
import { CollisionSystem } from './ecs/systems/CollisionSystem.js';

// Create collision system with spatial hash
const collisionSystem = new CollisionSystem(
    800,  // World width
    600,  // World height
    100   // Cell size (optimization parameter)
);

world.addSystem(collisionSystem);

// Register collision pairs
collisionSystem.registerCollisionPair('player', 'item', (player, item) => {
    console.log('Player caught item!');

    // Get components
    const itemComponent = item.getComponent('Item');
    const score = itemComponent.scoreValue;

    // Destroy item
    world.destroyEntity(item);

    // Update score
    this.score += score;
});

// Multiple collision pairs
collisionSystem.registerCollisionPair('player', 'powerup', handlePowerUp);
collisionSystem.registerCollisionPair('player', 'danger', handleGameOver);
```

---

## ⚙️ Configuration System

### Viewport Management

**Problem**: Telegram apps have dynamic viewports (keyboard, notches, etc.)

**Solution** (`src/config.js`):
```javascript
export function getSafeViewportDimensions() {
    const tg = window.Telegram?.WebApp;

    if (tg?.isExpanded) {
        // Use Telegram's stable viewport
        height = tg.viewportStableHeight;

        // Account for safe areas (notches)
        height -= tg.safeAreaInset.top;
        height -= tg.safeAreaInset.bottom;
    }

    // Normalize width for consistent difficulty
    const STANDARD_WIDTH = 430;  // Standard mobile width
    const MAX_WIDTH = 500;       // Cap for tablets
    width = Math.min(width, MAX_WIDTH);

    // Ensure minimum viable viewport
    width = Math.max(width, STANDARD_WIDTH);

    return { width, height };
}
```

**Why normalize width?**
- Ensures consistent difficulty across devices
- Wider screens don't make game easier
- All devices play the same game

### Portrait Lock

**Three-layer approach**:

1. **Meta tags** (`index.html`):
```html
<meta name="screen-orientation" content="portrait">
```

2. **CSS** (`src/styles.css`):
```css
@media (orientation: landscape) {
    body::before {
        content: "Please rotate your device";
        /* ... warning display */
    }
}
```

3. **JavaScript** (`src/main.js`):
```javascript
if (screen.orientation && screen.orientation.lock) {
    await screen.orientation.lock('portrait');
}
```

### State Management

**States**: `LOADING` → `START_SCREEN` → `PLAYING` → `GAME_OVER`

**Usage**:
```javascript
// Check state
if (this.stateManager.isPlaying()) { /* ... */ }

// Change state
this.stateManager.setState(GameState.GAME_OVER);

// Listen to changes
this.stateManager.addListener('myId', (newState, oldState) => {
    console.log(`${oldState} → ${newState}`);
});

// Or use EventBus
eventBus.on(GameEvents.STATE_CHANGED, ({ newState, oldState }) => {
    // React to state changes
});
```

### WebSocket Protocol

**Server**: `wss://server.pax.lt:8080`

**Message Format**:
```javascript
// Outgoing - Submit Score
{
    type: 'SUBMIT_SCORE',
    payload: {
        username: 'Player1',
        score: 100,
        telegramUserId: 123456,
        telegramUsername: 'player1'
    }
}

// Incoming - Score Submitted
{
    type: 'SCORE_SUBMITTED',
    payload: {
        rank: 5,
        username: 'Player1',
        score: 100
    }
}

// Outgoing - Get Leaderboard
{
    type: 'GET_LEADERBOARD',
    payload: { limit: 100 }
}

// Incoming - Leaderboard Data
{
    type: 'LEADERBOARD_DATA',
    payload: {
        leaderboard: [
            { rank: 1, username: 'Top', score: 500 },
            // ...
        ]
    }
}
```

**Auto-Reconnect**: 5 attempts, 3-second delay
**Fallback**: Uses ScoreService (localStorage) if unavailable

---

## 🚨 Critical Rules & Gotchas

### ⚠️ DO NOT

1. **Never use `canvas.width` or `canvas.height` for game logic**
   - Use `GAME_CONFIG.width` and `GAME_CONFIG.height`
   - Canvas dimensions are physical pixels (device pixel ratio)
   - Game logic uses logical pixels

2. **Never hard-code item types**
   - Use `ITEMS_CONFIG` and `POWERUPS_CONFIG`
   - Check properties: `item.isScoreable()`, `item.isGameOver()`

3. **Never modify dimensions without `updateGameDimensions()`**
   - Ensures proper recalculation
   - Updates all dependent systems

4. **Never skip cleanup in `destroy()` or `restart()`**
   - Remove event listeners
   - Null references
   - Call PIXI.destroy()
   - Release pooled objects

5. **Never assume WebSocket is connected**
   - Check `wsService.isConnected()`
   - Implement localStorage fallback

6. **Never create entities with `new` - use prefabs or pools**
   - Use `FallingItemPrefab.create()` for ECS entities
   - Use `itemPool.acquire()` for legacy FallingItem
   - Reduces garbage collection pressure

### ✅ DO

1. **Always check game state before operations**
   ```javascript
   if (!this.stateManager.isPlaying()) return;
   ```

2. **Always use configuration for new content**
   - Add to `ITEMS_CONFIG` or `POWERUPS_CONFIG`
   - No code changes needed in Game.js

3. **Always provide translations**
   - Add to `public/locales/lt.json`
   - Use `i18n.t('key')` for text

4. **Always implement cleanup**
   ```javascript
   destroy() {
       eventBus.off(GameEvents.ITEM_CAUGHT, this.handleCatch);
       this.sprite?.destroy();
       this.container = null;
   }
   ```

5. **Always test on multiple screen sizes**
   - Small phone (320px width)
   - Standard phone (375-430px)
   - Large phone/tablet (caps at 500px)

6. **Always use EventBus for cross-system communication**
   ```javascript
   // Instead of direct calls
   this.scoreDisplay.add(score);  // ❌

   // Emit events
   eventBus.emit(GameEvents.SCORE_CHANGED, { score }); // ✅
   ```

7. **Always release pooled objects**
   ```javascript
   const item = this.itemPool.acquire(...);
   // Use item...
   this.itemPool.release(item);  // ✅ Important!
   ```

### Touch Coordinate Mapping (CRITICAL)

**Problem**: Touch events give screen coordinates, need game coordinates

**❌ WRONG** (causes offset issues):
```javascript
const scaleX = canvas.width / rect.width;
```

**✅ CORRECT**:
```javascript
const scaleX = GAME_CONFIG.width / rect.width;
const gameX = (clientX - rect.left) * scaleX;
```

**Why**: `canvas.width` is physical pixels (e.g., 1290px on Retina), but game uses logical pixels (e.g., 430px)

---

## 🐛 Debugging & Testing

### Check Game State

```javascript
// Log state
console.log(this.stateManager.getState());

// Check if playing
if (this.stateManager.isPlaying()) {
    console.log('Game is active');
}
```

### Check Dimensions

```javascript
console.log('Game dimensions:', GAME_CONFIG.width, GAME_CONFIG.height);
console.log('Canvas dimensions:', canvas.width, canvas.height);
console.log('Screen dimensions:', window.innerWidth, window.innerHeight);
console.log('Device pixel ratio:', window.devicePixelRatio);
```

### Check Object Pool Stats

```javascript
console.log(this.itemPool.getStats());
// {
//     available: 25,
//     inUse: 5,
//     totalCreated: 30,
//     totalAcquired: 150,
//     totalReleased: 145,
//     peakUsage: 12,
//     reuseRate: "83.3%"
// }
```

### Check ECS World Stats

```javascript
world.logStats();
// {
//     entityCount: 45,
//     systemCount: 4,
//     activeEntities: 42,
//     pendingDestroys: 3
// }
```

### Check Spatial Hash Stats

```javascript
const collisionSystem = world.getSystem('CollisionSystem');
collisionSystem.logStats();
// {
//     totalCells: 48,
//     occupiedCells: 12,
//     occupancyRate: "25%",
//     avgItemsPerQuery: 5.2
// }
```

### Check WebSocket Connection

```javascript
console.log('WebSocket connected:', this.wsService.isConnected());
console.log('WebSocket state:', this.wsService.getState());
```

### Testing Checklist

**Browser Testing**:
- [ ] Game loads without errors
- [ ] Username input works
- [ ] Game starts and plays smoothly
- [ ] Touch/mouse controls accurate
- [ ] Score increases correctly
- [ ] Items spawn and fall
- [ ] Collisions detect properly
- [ ] Game over triggers correctly
- [ ] Restart works cleanly
- [ ] No memory leaks (Chrome DevTools)

**Telegram Testing** (CRITICAL):
- [ ] Open in Telegram iOS app
- [ ] Open in Telegram Android app
- [ ] Username auto-fills from profile
- [ ] Viewport fills screen (no black bars)
- [ ] Try rotating device (warns/locks)
- [ ] Touch controls work accurately
- [ ] Haptic feedback works (vibration)
- [ ] Safe areas respected (notches)
- [ ] Keyboard doesn't break layout
- [ ] WebSocket connects and saves scores

**Performance Testing**:
- [ ] Stable 60 FPS
- [ ] No GC spikes (object pooling working)
- [ ] Memory usage stable (<100MB)
- [ ] No lag during intense gameplay

---

## 🔧 Troubleshooting Guide

### Issue: Touch offset on left side
**Fix**: Use `GAME_CONFIG.width` not `canvas.width` in Player.js

### Issue: Game too easy/hard on different devices
**Fix**: Check `STANDARD_WIDTH` in `config.js` → `getSafeViewportDimensions()`

### Issue: Screen rotates to landscape
**Fix**: Check all three locks (meta tags, CSS, JS Screen Orientation API)

### Issue: Black bars in Telegram
**Fix**: Use `tg.viewportStableHeight` and `safeAreaInset` in `config.js`

### Issue: Items not spawning
**Fix**: Check `rarity` values in `ITEMS_CONFIG` (must be > 0)

### Issue: WebSocket won't connect
**Fix**: Check `WS_CONFIG.url` and server status. Game falls back to localStorage.

### Issue: Player won't move
**Fix**: Check if touch events blocked by CSS `touch-action` or overlays

### Issue: Build fails
**Fix**: Clear `node_modules` and `dist`, run `npm install`, then `npm run build`

### Issue: ObjectPool double-release error
**Fix**: Already handled - ObjectPool.release() is idempotent (silently ignores)

### Issue: Power-up timer stuck on screen
**Fix**: Ensure `powerUpTimer.stop()` called in `gameOver()`

---

## 📊 Performance Optimization

### Object Pooling (Implemented)

**Before**:
```javascript
const item = new FallingItem(...);  // ❌ GC every 2-3 seconds
```

**After**:
```javascript
const item = this.itemPool.acquire(...);  // ✅ 60% less GC
this.itemPool.release(item);  // Return to pool
```

**Impact**: GC pauses reduced from every 2-3s to every 10+s

### Spatial Hash Collision (Implemented)

**Before** (Brute Force):
```javascript
for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
        checkCollision(items[i], items[j]);  // ❌ O(n²)
    }
}
// 100 items = 10,000 checks
```

**After** (Spatial Hash):
```javascript
const nearby = spatialHash.getNearby(x, y, radius);  // ~5-10 items
for (const other of nearby) {
    checkCollision(item, other);  // ✅ O(n)
}
// 100 items = ~500 checks (20x faster!)
```

**Impact**: Collision detection 3-5x faster

### Event-Driven Architecture (Implemented)

**Before**:
```javascript
handleItemCatch(item) {
    this.scoreDisplay.add(score);        // ❌ Tight coupling
    this.particleSystem.create(...);     // ❌ Modify code to add features
}
```

**After**:
```javascript
handleItemCatch(item) {
    eventBus.emit(GameEvents.ITEM_CAUGHT, { score }); // ✅ Decoupled
}

// Add features without changing code
eventBus.on(GameEvents.ITEM_CAUGHT, (data) => {
    analytics.track('item_caught');  // ✅ Easy to add
});
```

---

## 📚 Key Formulas & Algorithms

### Spawn Chance

**Items** (Weighted Random):
```javascript
totalWeight = sum(all rarity values);
chance = item.rarity / totalWeight;
```

**Power-ups** (Independent):
```javascript
if (Math.random() < powerup.spawnChance) {
    spawn();
}
```

### Difficulty Progression

**Speed Increase**:
```javascript
newSpeed = oldSpeed + DIFFICULTY_CONFIG.speedIncreasePerScore;
newSpeed = Math.min(newSpeed, DIFFICULTY_CONFIG.maxSpeedMultiplier);
```

**Spawn Interval Decrease**:
```javascript
newInterval = oldInterval - DIFFICULTY_CONFIG.spawnRateIncrease;
newInterval = Math.max(newInterval, DIFFICULTY_CONFIG.minSpawnInterval);
```

### Touch Coordinate Mapping

```javascript
const rect = canvas.getBoundingClientRect();
const scaleX = GAME_CONFIG.width / rect.width;
const scaleY = GAME_CONFIG.height / rect.height;
const gameX = (clientX - rect.left) * scaleX;
const gameY = (clientY - rect.top) * scaleY;
```

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

### File Sizes

| Component | Files | Lines |
|-----------|-------|-------|
| ECS Core | 4 | 580 |
| Components | 7 | 385 |
| Systems | 4 | 420 |
| Object Pooling | 2 | 259 |
| EventBus | 2 | 381 |
| Scene System | 3 | 682 |
| Prefabs | 1 | 155 |
| Utilities | 1 | 180 |
| **TOTAL** | **24** | **~3,400** |

### Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production (creates /dist)
npm run preview      # Preview production build
```

### Current Status

**Architecture**: ✅ Phase 1 & 2 Complete
**Build Status**: ✅ Passing (4-7 seconds)
**Performance**: ✅ 60 FPS, 60% less GC, 3-5x collision speed
**Features**: ✅ Object pooling, EventBus, ECS, Spatial hash
**Ready for**: Production, new features, optimization

---

## 🤖 For AI Assistants: Best Practices

### When Starting a Session

1. **Read this file completely** (you're doing it!)
2. Check `src/config.js` for current settings
3. Review `src/Game.js` for main game loop
4. Check recent git commits for context
5. Understand user's goal before suggesting changes

### When Making Changes

1. **Always use configuration** for content changes (items, power-ups)
2. **Never hard-code** item types or properties
3. **Always test** in browser with `npm run dev`
4. **Always use ECS** for new entities (prefer prefabs)
5. **Always emit events** for cross-system communication
6. **Always release** pooled objects
7. **Follow** existing code style
8. **Update** this file if architecture changes significantly

### When Debugging

1. Check console for errors/warnings
2. Verify `GAME_CONFIG.width` vs `canvas.width` usage
3. Test on multiple screen sizes
4. Confirm WebSocket connection status
5. Check object pool stats
6. Review state management transitions

### When User Asks For Help

1. **Reference** this file for context
2. **Explain** why using config system is better
3. **Provide** concrete code examples
4. **Use prefabs** and ECS when possible
5. **Mention** potential gotchas
6. **Suggest** testing steps

---

## 📝 Version Info

**Current Architecture**: ECS + Event-Driven
**Last Major Update**: Phase 1 & 2 Complete (ECS Implementation)
**Build**: Production-ready
**Performance**: 60 FPS, 60% less GC, 3-5x collision speed

### Recent Major Changes

- **Phase 2**: Full ECS architecture, spatial hash, prefabs
- **Phase 1**: Object pooling, EventBus, scene system, input manager
- **2025-01**: Portrait lock, touch fixes, screen normalization
- **2024-12**: WebSocket integration, real-time leaderboard
- **2024-12**: Telegram Web App integration
- **2024-11**: Configuration-driven items/power-ups

---

## 🎓 Learning Resources

- **PixiJS**: https://pixijs.com/
- **Telegram Web Apps**: https://core.telegram.org/bots/webapps
- **Vite**: https://vitejs.dev/
- **ECS Pattern**: https://en.wikipedia.org/wiki/Entity_component_system
- **WebSocket API**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

## ✅ AI Session Checklist

When starting a new AI session:
- [ ] Read this CLAUDE.md completely
- [ ] Check `src/config.js` for current settings
- [ ] Review recent git commits for context
- [ ] Understand user's goal before suggesting
- [ ] Use configuration system for content changes
- [ ] Use ECS/prefabs for new entities
- [ ] Emit events for system communication
- [ ] Test changes with `npm run dev`
- [ ] Update this file if major changes made

---

**Last Updated**: 2025-01-12
**Purpose**: Single source of truth for AI-assisted development
**Maintained By**: Project contributors and AI assistants

---

*This is the ONLY documentation file you need to read. All critical information is consolidated here.*
