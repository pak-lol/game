# Background Music Folder

This folder contains background music files for the game.

## How to Add Music

1. **Add your MP3 files** to this folder (`/public/music/`)
2. **Supported format**: `.mp3` files only
3. **File naming**: Use any name you want (e.g., `track1.mp3`, `background-music.mp3`)
4. **Multiple tracks**: Add as many MP3 files as you want - the game will randomly select and play them

## How It Works

- When the game loads, it automatically scans this folder for all `.mp3` files
- A random track is selected and played when you start the game
- When a track finishes, another random track is automatically selected and played
- If you only have one track, it will loop continuously
- The system ensures it doesn't play the same track twice in a row (if you have multiple tracks)

## Examples

```
/public/music/
├── track1.mp3
├── track2.mp3
├── epic-music.mp3
└── chill-beats.mp3
```

## Volume Control

- Default volume is set to 50%
- You can toggle music on/off in the game's Options menu
- Music settings are saved in localStorage

## No Music Files?

If no music files are found, the game will start without background music and show a warning in the console.

---

**Note**: After adding new music files, you need to rebuild the project (`npm run dev` or `npm run build`) for the changes to take effect.
