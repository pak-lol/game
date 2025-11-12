# Kaip pridėti naujus Items ir Power-ups

## 🎯 Super Paprastas Būdas!

Dabar pridėti naujus items ir power-ups yra **labai paprasta** - tiesiog redaguok JSON failus!

---

## 📦 Pridėti naują Item (gaudomas daiktas)

### 1. Pridėk SVG failą
Įdėk savo SVG failą į `/public/assets/` arba `/public/` folderį.
Pvz.: `/public/assets/golden_leaf.svg`

### 2. Redaguok JSON
Atidark `public/data/items.json` ir pridėk naują įrašą:

```json
{
  "existing_item": { ... },

  "golden_leaf": {
    "id": "golden_leaf",
    "type": "good",
    "nameKey": "items.goldenLeaf",
    "descriptionKey": "items.goldenLeafDesc",
    "texture": "goldenLeaf",
    "assetPath": "/assets/golden_leaf.svg",
    "scoreValue": 10,
    "gameOver": false,
    "rarity": 5,
    "color": "#FFD700",
    "particleColor": "#FFA500",
    "haptic": "heavy"
  }
}
```

### 3. Pridėk vertimus
Atidark `public/locales/lt.json` ir pridėk:

```json
{
  "items": {
    "goldenLeaf": "Auksinis lapas",
    "goldenLeafDesc": "+10 taškų (labai retas!)"
  }
}
```

### 4. Viskas! 🎉
Žaidimas automatiškai:
- ✅ Užkraus tekstūrą
- ✅ Spawnins itemą pagal rarity
- ✅ Suteiks taškus
- ✅ Parodys pavadinimą

---

## ⚡ Pridėti naują Power-up

### 1. Pridėk SVG failą
Pvz.: `/public/assets/star.svg`

### 2. Redaguok JSON
Atidark `public/data/powerups.json` ir pridėk:

```json
{
  "existing_powerup": { ... },

  "star": {
    "id": "star",
    "type": "powerup",
    "nameKey": "powerups.star",
    "descriptionKey": "powerups.starDescription",
    "texture": "star",
    "assetPath": "/assets/star.svg",
    "icon": "⭐",
    "spawnChance": 0.03,
    "color": "#FFEB3B",
    "particleColor": "#FFC107",
    "haptic": "success",
    "duration": 8000,
    "effectType": "speed_multiplier",
    "effectValue": 0.3,
    "rarity": 5
  }
}
```

### 3. Pridėk vertimus
`public/locales/lt.json`:

```json
{
  "powerups": {
    "star": "Žvaigždė",
    "starDescription": "Dar labiau sulėtina žaidimą!"
  }
}
```

### 4. Viskas! 🎉
Power-up automatiškai veiks!

---

## 📖 Parametrų paaiškinimas

### Item parametrai:

| Parametras | Aprašymas | Pavyzdys |
|------------|-----------|----------|
| `id` | Unikalus ID | `"golden_leaf"` |
| `type` | Tipas | `"good"` arba `"bad"` |
| `nameKey` | Vertimo raktas pavadinimui | `"items.goldenLeaf"` |
| `descriptionKey` | Vertimo raktas apibūdinimui | `"items.goldenLeafDesc"` |
| `texture` | Tekstūros pavadinimas (unikalus) | `"goldenLeaf"` |
| `assetPath` | Kelias į SVG failą | `"/assets/golden_leaf.svg"` |
| `scoreValue` | Taškai (0 = jokių) | `10` |
| `gameOver` | Ar baigia žaidimą? | `true` / `false` |
| `rarity` | Dažnumas (didesnis = dažnesnis) | `60` = dažnai, `10` = retai |
| `color` | Teksto spalva | `"#FFD700"` |
| `particleColor` | Efekto spalva | `"#FFA500"` |
| `haptic` | Vibracija | `"light"` / `"medium"` / `"heavy"` / `"error"` / `"success"` |

### Power-up parametrai:

| Parametras | Aprašymas | Pavyzdys |
|------------|-----------|----------|
| `spawnChance` | Spawn tikimybė (0.0-1.0) | `0.05` = 5% |
| `icon` | Emoji ikonėlė | `"⭐"` |
| `duration` | Trukmė (millisec) | `5000` = 5 sek |
| `effectType` | Efekto tipas | `"speed_multiplier"` |
| `effectValue` | Efekto vertė | `0.5` = 2x lėčiau |

### Effect Types:

- **`speed_multiplier`**: Padaugina greitį
  - `0.5` = 2x lėčiau (50% greičio)
  - `2.0` = 2x greičiau (200% greičio)

---

## 🎨 Rarity (Dažnumo) gidas

Rarity veikia kaip svoris - didesnis skaičius = dažnesnis spawn:

```
Total weight = chimke(60) + vorinio_dumai(30) + vorinio_sniegas(10) = 100

chimke: 60/100 = 60% šansas
vorinio_dumai: 30/100 = 30% šansas
vorinio_sniegas: 10/100 = 10% šansas
```

**Patarimai:**
- Blogas daiktas (game over): rarity ~60
- Normalus daiktas: rarity ~30
- Retas daiktas: rarity ~10
- Labai retas: rarity ~5
- Ultra retas: rarity ~1

---

## ✨ Pavyzdžiai

### Pavyzdys 1: Nuodingas grybas (Game Over)

`public/data/items.json`:
```json
{
  "poison_mushroom": {
    "id": "poison_mushroom",
    "type": "bad",
    "nameKey": "items.poisonMushroom",
    "descriptionKey": "items.poisonMushroomDesc",
    "texture": "poisonMushroom",
    "assetPath": "/assets/poison_mushroom.svg",
    "scoreValue": 0,
    "gameOver": true,
    "rarity": 15,
    "color": "#9C27B0",
    "particleColor": "#7B1FA2",
    "haptic": "error"
  }
}
```

`public/locales/lt.json`:
```json
{
  "items": {
    "poisonMushroom": "Nuodingas Grybas",
    "poisonMushroomDesc": "Blogai! Žaidimas baigsis"
  }
}
```

### Pavyzdys 2: Bonus moneta

`public/data/items.json`:
```json
{
  "coin": {
    "id": "coin",
    "type": "good",
    "nameKey": "items.coin",
    "descriptionKey": "items.coinDesc",
    "texture": "coin",
    "assetPath": "/assets/coin.svg",
    "scoreValue": 20,
    "gameOver": false,
    "rarity": 3,
    "color": "#FFD700",
    "particleColor": "#FFA500",
    "haptic": "heavy"
  }
}
```

### Pavyzdys 3: Turbo Power-up

`public/data/powerups.json`:
```json
{
  "turbo": {
    "id": "turbo",
    "type": "powerup",
    "nameKey": "powerups.turbo",
    "descriptionKey": "powerups.turboDescription",
    "texture": "turbo",
    "assetPath": "/assets/turbo.svg",
    "icon": "🚀",
    "spawnChance": 0.02,
    "color": "#FF5722",
    "particleColor": "#FF9800",
    "haptic": "success",
    "duration": 10000,
    "effectType": "speed_multiplier",
    "effectValue": 2.0,
    "rarity": 5
  }
}
```

---

## 🚀 Deployment

Po pakeitimų:

1. **Build**:
   ```bash
   npm run build
   ```

2. **Git commit**:
   ```bash
   git add .
   git commit -m "Add new items/powerups"
   git push
   ```

3. **Viskas!** Serveris atsinaujins automatiškai.

---

## ⚠️ Svarbu!

1. **Unique ID**: Kiekvienas item/powerup turi turėti unikalų `id`
2. **Unique texture**: Kiekvienas turi turėti unikalų `texture` pavadinimą
3. **SVG failai**: Įsitikink, kad SVG failas egzistuoja nurodytame `assetPath`
4. **Vertimai**: Nepamirški pridėti į `public/locales/lt.json`
5. **JSON syntax**: Tikrink, kad JSON būtų teisingai formatuotas (naudok linter)

---

## 🎯 FAQ

**Q: Kaip pakeisti spawn rate?**
A: Keisk `rarity` parametrą items arba `spawnChance` powerups.

**Q: Kaip pridėti naują effect type?**
A: Reikia redaguoti `src/Game.js` failą `handlePowerUpCatch()` metodą.

**Q: Ar galiu naudoti PNG vietoj SVG?**
A: Taip! Tiesiog nurodyti `.png` failo kelią `assetPath`.

**Q: Kaip padaryti, kad item spawn'intųsi tik kartais?**
A: Sumažink `rarity` iki ~1-5 (labai retam spawnui).

**Q: Kiek power-upų galiu turėti vienu metu?**
A: Tiek kiek nori! Pridėk į `powerups.json`.

---

**Tai tiek! Dabar pridėti naujus items/powerups yra super paprasta! 🎮**
