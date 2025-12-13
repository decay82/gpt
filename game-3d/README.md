# 🎮 Survival Arena 3D - Hades Edition

A 3D third-person action game built with Three.js. Battle through chambers in full 3D with shoulder-view camera perspective!

## ✨ Features

### 🎯 3D Gameplay
- **Third-Person Shoulder View** - Camera positioned behind and to the side of character
- **Full 3D Movement** - Move freely in 3D space with WASD
- **Mouse Look** - Rotate camera and character with mouse
- **Dash Mechanic** - Quick dash with invulnerability (Space)
- **Chamber System** - Clear rooms to progress (Hades-style)
- **3D Enemies** - Enemies chase you in 3D space
- **Real-time Combat** - Fight enemies in full 3D

### 🏛️ Hades-Style Features
- Chamber-based progression
- Dash with i-frames
- Health restoration between chambers
- Increasing difficulty

## 🚀 Quick Start

### Play Locally
```bash
cd game-3d
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser!

### ⚔️ Controls
- **WASD**: Move character
- **Mouse Move**: Rotate camera/character
- **Space**: Dash (invulnerable during dash)
- **Click**: Lock mouse pointer

## 🎨 Technical Details

### Built With
- **Three.js** - 3D rendering
- **WebGL** - Hardware-accelerated graphics
- **Vanilla JavaScript** - No frameworks

### Features
- Shadow mapping
- Fog effects
- 3D physics
- Smooth camera interpolation
- Pointer lock API

## 🎯 Gameplay Tips

1. **Lock your pointer** - Click to lock mouse for smooth camera control
2. **Use dash wisely** - You're invulnerable while dashing
3. **Keep moving** - Don't let enemies surround you
4. **Watch your HP** - No healing during chamber (only between)
5. **Clear chambers fast** - More enemies spawn as time goes on

## 🔧 Future Enhancements

- [ ] Projectile weapons
- [ ] More enemy types
- [ ] Power-ups and upgrades
- [ ] Better graphics/models
- [ ] Sound effects
- [ ] Particle effects
- [ ] Boss battles

---

**Experience the arena in 3D! ⚔️**
