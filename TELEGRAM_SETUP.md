# Telegram Web App Setup Guide

## Overview

Your game is now fully integrated with Telegram Web App API and ready to be deployed as a Telegram bot game!

## What Was Fixed

### 1. **Viewport & Dimensions**
- ✅ Uses Telegram's `viewportStableHeight` for consistent sizing
- ✅ Accounts for safe area insets (notches, navigation bars)
- ✅ Handles dynamic viewport changes (keyboard show/hide)
- ✅ Prevents extreme aspect ratios
- ✅ Minimum dimensions (320x400) enforced
- ✅ Responsive to orientation changes

### 2. **Telegram Integration**
- ✅ TelegramService created (`src/services/TelegramService.js`)
- ✅ Auto-fills username from Telegram profile
- ✅ Haptic feedback on game events (catch items, game over)
- ✅ Proper theme colors set
- ✅ Closing confirmation enabled
- ✅ Viewport change handling
- ✅ Safe area support

### 3. **Mobile Optimizations**
- ✅ Touch controls optimized
- ✅ Prevents pull-to-refresh
- ✅ Prevents text selection
- ✅ Proper touch-action settings
- ✅ Viewport fit=cover for notched devices

## Testing Locally

### Option 1: Test in Browser (No Telegram)
```bash
npm run dev
```
Visit `http://localhost:5173` - Game will work normally without Telegram features.

### Option 2: Test in Telegram (Recommended)

#### Step 1: Deploy to a Public URL
You need a publicly accessible URL. Options:

**A. Using Cloudflare Pages (Already Configured)**
```bash
npm run build
# Deploy dist/ folder to Cloudflare Pages
```

**B. Using ngrok (Quick Testing)**
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Expose with ngrok
npx ngrok http 5173
```
You'll get a URL like `https://xxxx-xx-xx-xx-xx.ngrok-free.app`

**C. Using GitHub Pages**
```bash
npm run build
# Push dist/ to gh-pages branch
```

#### Step 2: Create Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)

2. Send `/newbot` and follow instructions:
   ```
   /newbot
   Name: Žolės Gaudytojas Bot
   Username: zoles_gaudytojas_bot (must end in 'bot')
   ```

3. You'll receive a bot token like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

4. Create a Web App for your bot:
   ```
   /newapp
   ```
   - Select your bot
   - Enter title: **Žolės Gaudytojas**
   - Enter description: **Gaudyk vorinio dumai lapus ir išvenk chimke!**
   - Upload a game photo (512x512 recommended)
   - Upload a demo GIF (optional)
   - Enter your web app URL: `https://your-deployed-url.com`
   - Short name: `play` (users will access via t.me/your_bot/play)

5. Configure Web App settings:
   ```
   /mybots
   → Select your bot
   → Bot Settings
   → Menu Button
   → Enter URL: https://your-deployed-url.com
   ```

#### Step 3: Test in Telegram

1. Open your bot in Telegram
2. Click the menu button or send `/start`
3. Click "Play Game" button
4. Game should open in Telegram's in-app browser

## Features in Telegram

### What Works Automatically

1. **Username Pre-fill**: Username is automatically filled from Telegram profile
2. **Haptic Feedback**:
   - Light vibration when catching good items
   - Error vibration when catching bad items
3. **Safe Area**: Game respects device notches and navigation bars
4. **Viewport**: Adapts to keyboard show/hide
5. **Theme**: Dark theme colors match Telegram's theme

### Telegram API Features Available

Check `src/services/TelegramService.js` for all available methods:

```javascript
// Get user info
telegramService.getUser()
telegramService.getUserDisplayName()

// Haptic feedback
telegramService.hapticFeedback('light')  // or 'medium', 'heavy', 'success', 'error'

// Dialogs
await telegramService.showConfirm('Are you sure?')
await telegramService.showAlert('Game Over!')

// Platform info
telegramService.isRunningInTelegram()
telegramService.getPlatform()  // 'android', 'ios', 'web', etc.
telegramService.isMobile()

// Viewport
telegramService.getViewportDimensions()

// Close app
telegramService.close()
```

## Deploying to Production

### Option 1: Cloudflare Pages (Recommended)

Your project already has `functions/api/_middleware.js` configured.

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Connect your GitHub repo or upload `dist/` folder
   - Build settings:
     - Build command: `npm run build`
     - Build output: `dist`
   - Deploy!

3. Copy the Cloudflare URL (e.g., `https://your-game.pages.dev`)

4. Update in BotFather:
   ```
   /mybots
   → Select your bot
   → Edit Web App
   → Update URL to your Cloudflare URL
   ```

### Option 2: Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 3: Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

## Testing Checklist

### In Browser (Development)
- [ ] Game loads without errors
- [ ] Can enter username
- [ ] Game starts when clicking button
- [ ] Player moves with mouse/touch
- [ ] Items fall and can be caught
- [ ] Score increases on good items
- [ ] Game over on bad items
- [ ] Restart works
- [ ] Leaderboard shows scores
- [ ] Responsive to window resize

### In Telegram
- [ ] Game opens in Telegram's browser
- [ ] Username auto-filled from Telegram
- [ ] Game fills viewport properly (no black bars)
- [ ] Touch controls work smoothly
- [ ] Haptic feedback works on catching items
- [ ] Game over has haptic feedback
- [ ] Viewport adjusts when keyboard appears
- [ ] Works on both Android and iOS
- [ ] Safe areas respected (no content under notch)
- [ ] Orientation changes handled
- [ ] Scores persist after closing/reopening

## Debugging

### Check Telegram Console

In Telegram desktop or web, open DevTools (F12) to see console logs:

```javascript
// Look for these logs:
"Initializing Telegram Web App..."
"Telegram Web App initialized: {...}"
"Running in Telegram: true"
"Platform: android" // or ios
"Viewport dimensions: {...}"
```

### Test Viewport

```javascript
// In browser console:
window.Telegram.WebApp.viewportHeight
window.Telegram.WebApp.viewportStableHeight
window.Telegram.WebApp.safeAreaInset
```

### Common Issues

**Issue**: Game too small/large in Telegram
- Check console for viewport dimensions
- Verify `viewportStableHeight` is being used
- Check safe area insets are applied

**Issue**: Username not pre-filled
- Check if bot has proper permissions
- Verify Telegram Web App is initialized
- Check console for `getUser()` result

**Issue**: Haptic feedback not working
- Only works on mobile devices
- Check Telegram app is up to date
- Verify HapticFeedback API is available

**Issue**: Viewport not updating
- Check `telegramViewportChanged` event is firing
- Verify resize handler is attached
- Look for console logs on viewport change

## Environment Detection

The game automatically detects the environment:

```javascript
// Development (localhost)
- Telegram features: Disabled (fallback)
- Username: Manual input required
- Haptics: No vibration
- Viewport: window.innerWidth/Height

// Production (Telegram)
- Telegram features: Enabled
- Username: Auto-filled
- Haptics: Device vibration
- Viewport: Telegram.WebApp viewport
```

## Performance Tips

1. **Optimize Assets**: Compress images before deployment
2. **Enable Caching**: Set proper cache headers
3. **Minimize Bundle**: Already optimized with Vite
4. **Test on Real Devices**: Use Telegram mobile app for testing
5. **Monitor Metrics**: Use Telegram Analytics

## Security Considerations

### Validate Telegram Data

For production, you should validate `initData`:

```javascript
// Backend validation (Node.js example)
const crypto = require('crypto');

function validateTelegramWebAppData(initData, botToken) {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

    const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    return calculatedHash === hash;
}
```

### Leaderboard Security

Current implementation uses localStorage (client-side). For production:

1. Create a backend API
2. Validate Telegram initData
3. Store scores in database
4. Implement rate limiting
5. Add anti-cheat measures

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Create Telegram Bot with BotFather
3. ✅ Test in Telegram mobile app
4. 🔜 Add backend for leaderboard (optional)
5. 🔜 Submit to Telegram Game Directory
6. 🔜 Add social sharing features
7. 🔜 Implement achievements
8. 🔜 Add sound effects

## Support

- Telegram Web Apps Documentation: https://core.telegram.org/bots/webapps
- PixiJS Documentation: https://pixijs.com/
- Vite Documentation: https://vitejs.dev/

## Resources

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps Guide](https://core.telegram.org/bots/webapps)
- [BotFather Commands](https://core.telegram.org/bots#botfather)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

---

**Your game is ready for Telegram! 🎮🚀**

Deploy it and share with your friends!
