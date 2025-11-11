# Žolės Gaudytojas (Weed Catcher Game)

Lietuviškas PixiJS žaidimas, kuriame reikia gaudyti krentančias žolės lapus.

## Projekto Struktūra

```
├── src/
│   ├── main.js                 # Įėjimo taškas
│   ├── Game.js                 # Pagrindinis žaidimo valdiklis
│   ├── config.js               # Visos žaidimo konfigūracijos
│   ├── entities/               # Žaidimo objektai
│   │   ├── Player.js           # Žaidėjo krepšelis
│   │   └── FallingItem.js      # Krentantys daiktai
│   ├── systems/                # Žaidimo sistemos
│   │   ├── CollisionSystem.js  # Susidūrimų aptikimas
│   │   └── ParticleSystem.js   # Dalelių efektai
│   ├── ui/                     # Vartotojo sąsaja
│   │   └── ScoreDisplay.js     # Taškų rodymas
│   ├── utils/                  # Pagalbinės funkcijos
│   │   ├── AssetLoader.js      # Resursų įkėlimas
│   │   └── i18n.js             # Vertimų sistema
│   └── locales/                # Vertimų failai
│       └── lt.json             # Lietuvių kalba
├── assets/                     # SVG tekstūros
│   ├── background.svg
│   ├── basket.svg
│   ├── weed-leaf.svg
│   └── weed-leaf-brown.svg
├── index.html
└── package.json
```

## Kaip Žaisti

1. Įdiekite priklausomybes:
   ```bash
   npm install
   ```

2. Paleiskite žaidimą:
   ```bash
   npm run dev
   ```

3. Atidarykite naršyklėje nurodytą adresą (paprastai http://localhost:5173)

## Žaidimo Taisyklės

- **Gaudyk tik žalius "vorinio dumai" lapus** - už juos gauni +1 tašką
- **Vengk rudų "chimke" lapų** - jei pagausi, žaidimas baigiasi
- Valdyk krepšelį pelės arba lietimo judesiais

## Technologijos

- **PixiJS v8** - 2D grafikos variklis
- **Vite** - Kūrimo įrankis
- **SVG** - Vektorinė grafika
- **i18n** - Vertimų sistema

## Vertimų Sistema

Visi tekstai yra centralizuoti `src/locales/lt.json` faile. Norint pridėti naują kalbą:

1. Sukurkite naują JSON failą `src/locales/{kalba}.json`
2. Nukopijuokite struktūrą iš `lt.json`
3. Išverskite tekstus
4. Atnaujinkite `GAME_CONFIG.defaultLocale` faile `src/config.js`
