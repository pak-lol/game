# How to Add New Items and Power-ups

This guide explains how to easily add new items and power-ups to the game using the new configuration system.

## Adding a New Item

Items are things that fall down and give score or end the game (like chimke, vorinio dumai, vorinio sniegas).

### Step 1: Add SVG Asset (if needed)

If you need a new texture, create or add an SVG file to `/assets/` folder:

```bash
# Example: Add a new leaf type
/assets/golden-leaf.svg
```

### Step 2: Load Asset in AssetLoader

Edit `src/utils/AssetLoader.js` and add your texture:

```javascript
this.textures.goldenLeaf = await PIXI.Assets.load('/assets/golden-leaf.svg');
console.log('✓ Golden leaf loaded');
```

### Step 3: Add Item Configuration

Edit `src/config.js` and add your item to `ITEMS_CONFIG`:

```javascript
export const ITEMS_CONFIG = {
    // ... existing items ...

    golden_leaf: {
        id: 'golden_leaf',                    // Unique ID
        nameKey: 'items.goldenLeaf',          // Translation key for name
        descriptionKey: 'items.goldenLeafDesc', // Translation key for description
        texture: 'goldenLeaf',                // Texture name from AssetLoader
        scoreValue: 10,                       // Points when caught (0 = no score)
        gameOver: false,                      // true = ends game when caught
        rarity: 5,                            // Spawn weight (lower = rarer)
        color: '#FFD700',                     // Text label color
        particleColor: '#FFA500',             // Particle effect color
        haptic: 'heavy'                       // Haptic feedback: 'light', 'medium', 'heavy', 'error', 'success'
    }
};
```

### Step 4: Add Translations

Edit `public/locales/lt.json` and add translations:

```json
"items": {
    "goldenLeaf": "auksinis lapas",
    "goldenLeafDesc": "+10 taškų (labai retas!)"
}
```

### That's it! 🎉

Your new item will automatically:
- Spawn based on rarity weight
- Display with correct color and label
- Give the configured score
- Show particle effects when caught
- Trigger haptic feedback

---

## Adding a New Power-up

Power-ups are special items that give temporary effects (like bucket that slows down speed).

### Step 1: Add SVG Asset (if needed)

```bash
# Example: Add a shield power-up
/assets/shield.svg
```

### Step 2: Load Asset in AssetLoader

```javascript
this.textures.shield = await PIXI.Assets.load('/assets/shield.svg');
console.log('✓ Shield loaded');
```

### Step 3: Add Power-up Configuration

Edit `src/config.js` and add to `POWERUPS_CONFIG`:

```javascript
export const POWERUPS_CONFIG = {
    // ... existing power-ups ...

    shield: {
        id: 'shield',                         // Unique ID
        nameKey: 'powerups.shield',           // Translation key for name
        descriptionKey: 'powerups.shieldDescription', // Translation key for description
        texture: 'shield',                    // Texture name from AssetLoader
        icon: '🛡️',                           // Emoji icon for timer display
        rarity: 5,                            // Spawn weight (not currently used)
        spawnChance: 0.03,                    // 3% chance to spawn
        color: '#00FFFF',                     // Text label color
        particleColor: '#00CED1',             // Particle effect color
        haptic: 'success',                    // Haptic feedback type
        duration: 8000,                       // Effect duration in milliseconds
        effectType: 'invincibility',          // Effect type (see below)
        effectValue: true                     // Effect value
    }
};
```

### Step 4: Add Translations

```json
"powerups": {
    "shield": "Skydas",
    "shieldDescription": "Apsaugo nuo chimke 8 sekundes!"
}
```

### Step 5: Implement Effect (if new type)

If you're using an existing effect type like `speed_multiplier`, you're done!

If you're adding a NEW effect type, edit `src/Game.js` in the `handlePowerUpCatch` method:

```javascript
handlePowerUpCatch(item, position) {
    const config = item.getConfig();

    // ... existing code ...

    // Add your new effect type
    if (config.effectType === 'speed_multiplier') {
        this.applySpeedMultiplierEffect(config);
    }
    else if (config.effectType === 'invincibility') {
        this.applyInvincibilityEffect(config);  // Implement this method
    }
    // Add more effect types here...
}

// Then implement the effect method:
applyInvincibilityEffect(config) {
    this.invincible = true;

    // Update timer
    if (this.powerUpTimer) {
        this.powerUpTimer.start(config.id, config.duration);
    }

    // Timer expiration will be handled automatically
}
```

### That's it! 🎉

---

## Available Effect Types

Current supported effect types:

1. **`speed_multiplier`** - Changes game speed
   - `effectValue: 0.5` = half speed (slower)
   - `effectValue: 2.0` = double speed (faster)

2. **Custom types** - Add your own! Examples:
   - `score_multiplier` - Multiply score for duration
   - `invincibility` - Ignore chimke items
   - `double_score` - All items give 2x score
   - `magnet` - Auto-collect nearby items
   - `freeze` - Stop all falling items

---

## Rarity System

Items spawn based on **weighted rarity**:

```javascript
chimke:          rarity: 60   // 60% of spawns
vorinio_dumai:   rarity: 30   // 30% of spawns
vorinio_sniegas: rarity: 10   // 10% of spawns
```

**Higher rarity = more common**

To make an item **very rare**:
```javascript
diamond_leaf: {
    rarity: 1,  // Very rare!
    scoreValue: 50
}
```

---

## Example: Adding a "Speed Boost" Power-up

```javascript
// 1. In POWERUPS_CONFIG:
speed_boost: {
    id: 'speed_boost',
    nameKey: 'powerups.speedBoost',
    descriptionKey: 'powerups.speedBoostDescription',
    texture: 'rocket',  // You'd need to add rocket.svg
    icon: '🚀',
    spawnChance: 0.02,
    color: '#FF4500',
    particleColor: '#FF6347',
    haptic: 'heavy',
    duration: 3000,
    effectType: 'speed_multiplier',
    effectValue: 2.0  // 2x speed!
}

// 2. In translations:
"powerups": {
    "speedBoost": "Greičio padidinimas",
    "speedBoostDescription": "Padidina greitį 2x!"
}
```

No other code changes needed! The system handles everything automatically.

---

## Tips

- **Testing rarities**: Set high rarity (like 100) temporarily to test your new item
- **Colors**: Use hex colors like `#FF6B6B` (red), `#4CAF50` (green), `#FFD700` (gold)
- **Haptic types**:
  - `light` - gentle tap (good items)
  - `medium` - medium tap (great items)
  - `heavy` - strong tap (power-ups)
  - `error` - error pattern (bad items)
  - `success` - success pattern (rare power-ups)
- **Duration**: In milliseconds (1000 = 1 second, 5000 = 5 seconds)

---

## Need Help?

1. Look at existing items/power-ups in `src/config.js` for examples
2. Check `src/Game.js` to understand how effects work
3. Test in game by adjusting `rarity` to spawn your item more often
