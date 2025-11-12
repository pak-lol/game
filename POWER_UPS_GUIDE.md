# Power-Up System Guide

## Overview

The game now has a **fully extensible power-up system** that makes it trivial to add new effects without touching Game.js code!

## Architecture

```
PowerUpEffectManager (src/managers/PowerUpEffectManager.js)
├── Handles all power-up effects
├── Automatic timer management
├── Effect stacking logic
└── Easy to extend with new effects
```

## Available Effect Types

### 1. `speed_multiplier` - Slow Down Items
**Example**: Bucket (🪣)
- Multiplies falling speed by `effectValue` (e.g., 0.5 = half speed)
- Already implemented

### 2. `score_multiplier` - Multiply Score
**Example**: Mushroom (🍄)
- Multiplies all scores by `effectValue` (e.g., 2.0 = double points)
- Already implemented

### 3. `clear_chimke` - Clear & Block Bad Items
**Example**: Tablet (💊)
- Removes all chimke from screen
- Blocks chimke spawning during duration
- Already implemented

### 4. `invincibility` - Can't Die
**Status**: ✅ Implemented, not yet configured
- Player becomes invincible to chimke
- Gold visual effect on player
- Catches chimke without dying

### 5. `freeze_items` - Freeze All Items
**Status**: ✅ Implemented, not yet configured
- Stops all items from falling
- Items frozen in place for duration
- Good for catching up!

### 6. `double_points` - Double Score
**Status**: ✅ Implemented (alias for score_multiplier)
- Same as score_multiplier with value 2.0
- Kept separate for different power-up types

## How to Add a New Power-Up

### Step 1: Create the SVG Asset
Place your SVG file in `/public/assets/` or `/assets/`

Example: `shield.svg`

### Step 2: Add to `public/data/powerups.json`

```json
{
  "shield": {
    "id": "shield",
    "type": "powerup",
    "nameKey": "powerups.shield",
    "descriptionKey": "powerups.shieldDescription",
    "texture": "shield",
    "assetPath": "/assets/shield.svg",
    "icon": "🛡️",
    "spawnChance": 0.02,
    "color": "#00FFFF",
    "particleColor": "#00CED1",
    "haptic": "success",
    "duration": 10000,
    "effectType": "invincibility",
    "effectValue": true,
    "rarity": 5
  }
}
```

### Step 3: Add Translations to `public/locales/lt.json`

```json
{
  "powerups": {
    "shield": "Skydas",
    "shieldDescription": "Negali mirti 10 sekundžių!"
  }
}
```

### Step 4: That's It!

The power-up will now:
- ✅ Automatically load
- ✅ Spawn based on `spawnChance`
- ✅ Apply the effect
- ✅ Show timer in UI
- ✅ Remove effect when timer expires
- ✅ Stack properly if caught again

## Example: Adding Invincibility Power-Up

### 1. Add to powerups.json

```json
{
  "star": {
    "id": "star",
    "type": "powerup",
    "nameKey": "powerups.star",
    "descriptionKey": "powerups.starDescription",
    "texture": "star",
    "assetPath": "/assets/star.svg",
    "icon": "⭐",
    "spawnChance": 0.01,
    "color": "#FFD700",
    "particleColor": "#FFA500",
    "haptic": "heavy",
    "duration": 8000,
    "effectType": "invincibility",
    "effectValue": true,
    "rarity": 3
  }
}
```

### 2. Add translations

```json
{
  "powerups": {
    "star": "Žvaigždė",
    "starDescription": "Nepažeidžiamas 8 sekundės!"
  }
}
```

### 3. Create `public/assets/star.svg`

Done! The invincibility effect is already implemented in PowerUpEffectManager.

## Example: Adding Freeze Power-Up

### 1. Add to powerups.json

```json
{
  "snowflake": {
    "id": "snowflake",
    "type": "powerup",
    "nameKey": "powerups.snowflake",
    "descriptionKey": "powerups.snowflakeDescription",
    "texture": "snowflake",
    "assetPath": "/assets/snowflake.svg",
    "icon": "❄️",
    "spawnChance": 0.015,
    "color": "#00FFFF",
    "particleColor": "#87CEEB",
    "haptic": "medium",
    "duration": 3000,
    "effectType": "freeze_items",
    "effectValue": true,
    "rarity": 4
  }
}
```

### 2. Add translations

```json
{
  "powerups": {
    "snowflake": "Snaigė",
    "snowflakeDescription": "Užšaldo visus daiktus 3 sekundes!"
  }
}
```

### 3. Create `public/assets/snowflake.svg`

Done! The freeze effect is already implemented.

## Adding a Completely New Effect Type

If you want to add a totally new effect type (not in the list above):

### 1. Edit `src/managers/PowerUpEffectManager.js`

Add your effect to the `effectHandlers` map in the constructor:

```javascript
this.effectHandlers = new Map([
    // ... existing handlers ...
    ['my_new_effect', {
        apply: (config) => this.applyMyNewEffect(config),
        remove: () => this.removeMyNewEffect()
    }]
]);
```

### 2. Implement the effect methods

```javascript
/**
 * My New Effect - Does something cool
 */
applyMyNewEffect(config) {
    // Save current state if needed
    this.savedStates.myState = this.game.someValue;

    // Apply effect
    this.game.someValue = config.effectValue;

    console.log(`[PowerUpEffects] My effect applied!`);
}

removeMyNewEffect() {
    // Restore state
    this.game.someValue = this.savedStates.myState;

    console.log(`[PowerUpEffects] My effect removed!`);
}
```

### 3. Add to powerups.json with `"effectType": "my_new_effect"`

## Configuration Options

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `type` | string | Always `"powerup"` |
| `nameKey` | string | Translation key for name |
| `descriptionKey` | string | Translation key for description |
| `texture` | string | Texture name (matches AssetLoader) |
| `assetPath` | string | Path to SVG file |
| `icon` | string | Emoji icon for UI timer |
| `spawnChance` | number | 0.0-1.0 (e.g., 0.05 = 5% chance) |
| `color` | string | Hex color for text |
| `particleColor` | string | Hex color for particles |
| `haptic` | string | `light`, `medium`, `heavy`, `success`, `error` |
| `duration` | number | Milliseconds (e.g., 5000 = 5 seconds) |
| `effectType` | string | Effect type (see list above) |
| `effectValue` | any | Effect-specific value |
| `rarity` | number | Weight for random selection (higher = more common) |

## Spawn Chance Guide

- `0.001` = 0.1% (very rare)
- `0.005` = 0.5% (rare) - tablet
- `0.01` = 1% (uncommon)
- `0.02` = 2% (common)
- `0.03` = 3% (common) - mushroom
- `0.05` = 5% (very common) - bucket
- `0.10` = 10% (abundant)

## Testing Your Power-Up

1. **Build**: `npm run dev`
2. **Play the game**: Wait for your power-up to spawn
3. **Check console**: Look for `[PowerUpEffects]` logs
4. **Verify**:
   - Power-up spawns
   - Effect applies correctly
   - Timer shows in UI
   - Effect removes when timer expires
   - Can stack if caught again

## Debugging

Enable detailed logging by checking the console for:
- `[PowerUpEffects] Applying <effectType> for <duration>ms`
- `[PowerUpEffects] <effectType> already active - restarting timer`
- `[PowerUpEffects] Removing <effectType>`
- `[PowerUpEffects] Error applying <effectType>:`

## Math Bug Fixes Applied

### ✅ Bucket Speed Multiplier Bug Fixed
**Problem**: `Math.max(1.0, speed * 0.5)` prevented slowdown below 1.0x

**Fix**: Removed `Math.max` constraint - now properly slows to 0.5x at all speeds

### ✅ All Math Validated
- ✅ Spawn timing calculations
- ✅ Difficulty progression
- ✅ Score multipliers
- ✅ Particle effects
- ✅ Random generation

## Benefits of New System

### Before
- ❌ All power-up logic in Game.js (1046 lines)
- ❌ Hard to add new effects
- ❌ Complex timer management
- ❌ Effect restoration bugs
- ❌ No effect stacking

### After
- ✅ Power-up logic in PowerUpEffectManager (362 lines)
- ✅ Add effects without touching code
- ✅ Automatic timer management
- ✅ Clean effect restoration
- ✅ Proper effect stacking
- ✅ Game.js reduced to 883 lines

## Summary

**To add a new power-up**:
1. Create SVG asset
2. Add entry to `powerups.json`
3. Add translations to `lt.json`
4. Done! (if using existing effect type)

**6 effect types ready to use**:
- `speed_multiplier` - Slow down
- `score_multiplier` - More points
- `clear_chimke` - Clear bad items
- `invincibility` - Can't die
- `freeze_items` - Freeze all
- `double_points` - 2x score

**Adding custom effect**:
- Add handler to PowerUpEffectManager
- Implement apply/remove methods
- Use in powerups.json

🎮 **Happy power-up creating!**
