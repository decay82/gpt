# ⚔️ Survival Arena: Hades Edition

A fast-paced Hades-style action game built with HTML5 Canvas. Battle through chambers of enemies, dash through danger, and earn divine blessings from the Greek gods!

**🎮 [Play the 3D Version!](game-3d/) - Third-person 3D action with shoulder-view camera!**

## ✨ Features

### 🏛️ Hades-Style Gameplay
- **Chamber-based combat** - Clear rooms of enemies to progress
- **Dash/Dodge mechanic** - Quick dash with invulnerability frames (Space/Shift)
- **Room progression** - Face increasingly difficult chambers
- **Divine blessings** - Gain power from Greek gods between chambers
- **Auto-attacking weapons** - Multiple weapon types that fire automatically
- **Level-up system** - Choose powerful upgrades as you gain experience
- **Multiple enemy types** - Normal, Fast, and Tank enemies with unique behaviors
- **Smooth controls** - WASD/Arrow keys for movement, Space/Shift to dash

### Visual Effects
- **Pixel art sprites** - Retro-style animated characters and effects
- **Particle systems** - Explosions, sparks, and hit effects
- **Muzzle flashes** - Dynamic weapon fire effects
- **Screen shake** - Impact feedback for explosions
- **Smooth animations** - Frame-based sprite animations

### Weapons
- **Magic Orb** 🔵 - Balanced starting weapon
- **Fireball** 🔥 - High damage, fast projectiles
- **Lightning** ⚡ - Quick firing rate

### 🏛️ Divine Blessings (Upgrades)
- 💚 **Demeter's Blessing** - Restore vitality (+20 Max HP)
- ⚡ **Hermes' Swift Feet** - Gain swiftness (+15% Speed)
- ⚔️ **Ares' Fury** - Empower your strikes (+20% Damage)
- 🔥 **Apollo's Precision** - Quicken your attacks (+15% Attack Speed)
- 🌊 **Poseidon's Reach** - Extend your range (+20% Range)
- ⚡ **Zeus' Arsenal** - Receive a new weapon

## 🚀 Quick Start

### Play Locally
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser!

### ⚔️ Controls
- **Movement**: Arrow Keys or WASD
- **Dash/Dodge**: Space or Shift (while moving)
  - Quick dash in movement direction
  - Invulnerable during dash
  - 0.8 second cooldown
- **Attacks**: Automatic!
- **Mobile**: Touch screen to move character

## 📱 Mobile/Android Build

### Option 1: PWA (Progressive Web App)
The game is ready to be converted to a PWA. Just add:
1. `manifest.json` with app metadata
2. `service-worker.js` for offline support
3. Users can "Add to Home Screen" on mobile

### Option 2: Capacitor (Native App)
```bash
# Install Capacitor
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init SurvivalArena com.yourdomain.survivalarena

# Add Android platform
npx cap add android

# Copy web files
npx cap sync

# Open in Android Studio
npx cap open android
```

## 🎨 Technical Details

### Architecture
- Pure vanilla JavaScript - No frameworks required
- Canvas-based rendering with sprite system
- Modular class-based structure
- Efficient particle system
- Responsive design

### Performance
- Optimized sprite batching
- Efficient collision detection
- Object pooling for particles
- Smooth 60 FPS gameplay

### File Structure
```
├── index.html          # Main HTML file
├── style.css           # Styling and UI
├── sprites.js          # Sprite rendering system
├── game.js            # Game logic and classes
└── README.md          # This file
```

## 🎯 Game Tips

1. **Keep moving** - Don't let enemies surround you
2. **Prioritize upgrades** - Weapon damage and attack speed early game
3. **Collect XP** - Kill enemies to level up faster
4. **Weapon variety** - Multiple weapons = better coverage
5. **Survive the rush** - Enemies spawn faster as time goes on

## 🔧 Customization

### Modify game settings
Edit `CONFIG` object in `game.js`:
```javascript
const CONFIG = {
    canvas: { width: 1200, height: 800 },
    player: { size: 20, speed: 4, maxHp: 100 },
    enemy: { baseSpeed: 1.5, spawnInterval: 2000 },
    weapon: { baseDamage: 15, baseCooldown: 1000 }
};
```

### Add new weapons
Create new weapon types in the `Weapon` class constructor

### Create new enemies
Add enemy types in the `Enemy` class constructor

### Design new upgrades
Extend the `UPGRADES` array with custom power-ups

## 📄 License

This game is open source. Feel free to modify and use it for your projects!

## 🤝 Contributing

Suggestions and improvements are welcome! Some ideas:
- New enemy types
- Boss battles
- More weapons
- Sound effects
- Music
- Achievements
- Leaderboards

---

**Have fun and survive! 🎮**
