// Sprite System for Survival Arena
// Generates pixel art style sprites using Canvas

class SpriteSheet {
    constructor() {
        this.sprites = {};
        this.animations = {};
    }

    // Create a temporary canvas for drawing sprites
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    // Draw pixel art style player
    drawPlayer(color = '#4ecdc4') {
        const size = 48;
        const canvas = this.createCanvas(size * 4, size); // 4 frames
        const ctx = canvas.getContext('2d');

        for (let frame = 0; frame < 4; frame++) {
            const x = frame * size;
            const centerX = x + size / 2;
            const centerY = size / 2;

            // Body
            ctx.fillStyle = color;
            ctx.fillRect(x + 12, 16, 24, 24);

            // Head
            ctx.fillStyle = '#ffd93d';
            ctx.fillRect(x + 14, 8, 20, 20);

            // Eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 18, 14, 4, 4);
            ctx.fillRect(x + 26, 14, 4, 4);

            // Legs (animated)
            const legOffset = frame % 2 === 0 ? 0 : 2;
            ctx.fillStyle = '#2d545e';
            ctx.fillRect(x + 16, 40 + legOffset, 6, 8 - legOffset);
            ctx.fillRect(x + 26, 40 - legOffset, 6, 8 + legOffset);

            // Arms (animated)
            const armOffset = frame % 2 === 0 ? 2 : -2;
            ctx.fillStyle = color;
            ctx.fillRect(x + 8, 20 + armOffset, 6, 12);
            ctx.fillRect(x + 34, 20 - armOffset, 6, 12);

            // Weapon in hand
            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(x + 36, 24 + armOffset, 8, 4);
        }

        this.sprites.player = canvas;
        this.animations.player = { frames: 4, speed: 200 };
        return canvas;
    }

    // Draw enemy sprites
    drawEnemy(type = 'normal') {
        const size = 40;
        const canvas = this.createCanvas(size * 2, size); // 2 frames
        const ctx = canvas.getContext('2d');

        let color, eyeColor;
        switch(type) {
            case 'fast':
                color = '#ffd93d';
                eyeColor = '#ff6b6b';
                break;
            case 'tank':
                color = '#ee5a6f';
                eyeColor = '#000';
                break;
            default:
                color = '#95e1d3';
                eyeColor = '#ff0000';
        }

        for (let frame = 0; frame < 2; frame++) {
            const x = frame * size;
            const centerX = x + size / 2;
            const centerY = size / 2;

            if (type === 'tank') {
                // Tank - larger, armored look
                ctx.fillStyle = '#666';
                ctx.fillRect(x + 6, 12, 28, 20);
                ctx.fillStyle = color;
                ctx.fillRect(x + 8, 14, 24, 16);

                // Spikes
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(x + 8 + i * 6, 10, 4, 4);
                }
            } else if (type === 'fast') {
                // Fast - sleek, elongated
                ctx.fillStyle = color;
                ctx.fillRect(x + 10, 14, 20, 12);
                ctx.fillRect(x + 8, 16, 24, 8);

                // Speed lines
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillRect(x + 4, 18, 6, 2);
                ctx.fillRect(x + 6, 22, 4, 2);
            } else {
                // Normal enemy - blob-like
                ctx.fillStyle = color;
                ctx.fillRect(x + 12, 12, 16, 16);
                ctx.fillRect(x + 10, 14, 20, 12);
                ctx.fillRect(x + 14, 10, 12, 20);
            }

            // Eyes (animated)
            ctx.fillStyle = eyeColor;
            const eyeOffset = frame === 0 ? 0 : 2;
            ctx.fillRect(x + 14, 18 + eyeOffset, 4, 4);
            ctx.fillRect(x + 22, 18 + eyeOffset, 4, 4);

            // Mouth/teeth
            ctx.fillStyle = '#000';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect(x + 14 + i * 4, 26, 2, 2);
            }
        }

        this.sprites['enemy_' + type] = canvas;
        this.animations['enemy_' + type] = { frames: 2, speed: 400 };
        return canvas;
    }

    // Draw weapon projectiles
    drawProjectile(type = 'orb') {
        const size = 24;
        const canvas = this.createCanvas(size * 4, size); // 4 frames for animation
        const ctx = canvas.getContext('2d');

        for (let frame = 0; frame < 4; frame++) {
            const x = frame * size;
            const centerX = x + size / 2;
            const centerY = size / 2;

            switch(type) {
                case 'orb':
                    // Magic orb with glow
                    const gradient = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 10);
                    gradient.addColorStop(0, '#fff');
                    gradient.addColorStop(0.4, '#4ecdc4');
                    gradient.addColorStop(1, 'rgba(78, 205, 196, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x + 2, 2, size - 4, size - 4);

                    // Core
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x + 8 + frame, 8, 8, 8);
                    ctx.fillRect(x + 10, 10, 4, 4);
                    break;

                case 'fireball':
                    // Fireball with tail
                    ctx.fillStyle = '#ff6b6b';
                    ctx.fillRect(x + 10, 8, 10, 8);
                    ctx.fillStyle = '#ffa500';
                    ctx.fillRect(x + 12, 10, 6, 4);
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x + 14, 11, 2, 2);

                    // Flame trail
                    ctx.fillStyle = 'rgba(255, 107, 107, 0.6)';
                    ctx.fillRect(x + 4 - frame * 2, 10, 6, 4);
                    break;

                case 'lightning':
                    // Lightning bolt
                    ctx.fillStyle = '#ffd93d';
                    ctx.fillRect(x + 10, 6, 4, 4);
                    ctx.fillRect(x + 12, 10, 4, 4);
                    ctx.fillRect(x + 10, 14, 4, 4);
                    ctx.fillRect(x + 8, 18, 4, 4);

                    // Glow
                    ctx.fillStyle = 'rgba(255, 217, 61, 0.5)';
                    ctx.fillRect(x + 8, 4, 8, 20);

                    // Spark
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x + 11, 7 + frame * 2, 2, 2);
                    break;
            }
        }

        this.sprites['projectile_' + type] = canvas;
        this.animations['projectile_' + type] = { frames: 4, speed: 100 };
        return canvas;
    }

    // Draw particle effects
    drawParticle(type = 'spark') {
        const size = 16;
        const canvas = this.createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        switch(type) {
            case 'spark':
                ctx.fillStyle = '#fff';
                ctx.fillRect(6, 7, 4, 2);
                ctx.fillRect(7, 6, 2, 4);
                break;
            case 'blood':
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(6, 6, 4, 4);
                ctx.fillRect(7, 7, 2, 2);
                break;
            case 'explosion':
                ctx.fillStyle = '#ffa500';
                ctx.fillRect(4, 6, 8, 4);
                ctx.fillRect(6, 4, 4, 8);
                ctx.fillStyle = '#fff';
                ctx.fillRect(7, 7, 2, 2);
                break;
        }

        this.sprites['particle_' + type] = canvas;
        return canvas;
    }

    // Draw UI icons
    drawUIIcon(type) {
        const size = 32;
        const canvas = this.createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        switch(type) {
            case 'heart':
                ctx.fillStyle = '#ff6b6b';
                ctx.fillRect(8, 12, 6, 6);
                ctx.fillRect(18, 12, 6, 6);
                ctx.fillRect(6, 14, 20, 8);
                ctx.fillRect(8, 22, 16, 4);
                ctx.fillRect(12, 26, 8, 2);
                ctx.fillRect(14, 28, 4, 2);

                // Shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillRect(10, 14, 4, 4);
                break;

            case 'star':
                ctx.fillStyle = '#ffd93d';
                ctx.fillRect(14, 8, 4, 16);
                ctx.fillRect(8, 14, 16, 4);
                ctx.fillRect(10, 10, 12, 12);
                ctx.fillStyle = '#fff';
                ctx.fillRect(15, 15, 2, 2);
                break;

            case 'skull':
                ctx.fillStyle = '#fff';
                ctx.fillRect(10, 10, 12, 14);
                ctx.fillRect(8, 12, 16, 8);
                ctx.fillStyle = '#000';
                ctx.fillRect(12, 14, 3, 4);
                ctx.fillRect(17, 14, 3, 4);
                ctx.fillRect(13, 21, 2, 2);
                ctx.fillRect(17, 21, 2, 2);
                break;

            case 'sword':
                ctx.fillStyle = '#c0c0c0';
                ctx.fillRect(14, 6, 4, 18);
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(12, 22, 8, 6);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(10, 20, 12, 4);
                ctx.fillStyle = '#fff';
                ctx.fillRect(15, 8, 2, 8);
                break;

            case 'shield':
                ctx.fillStyle = '#4169e1';
                ctx.fillRect(10, 8, 12, 16);
                ctx.fillRect(8, 12, 16, 8);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(14, 12, 4, 8);
                ctx.fillRect(12, 16, 8, 4);
                break;

            case 'lightning_icon':
                ctx.fillStyle = '#ffd93d';
                ctx.fillRect(14, 8, 6, 6);
                ctx.fillRect(12, 14, 6, 6);
                ctx.fillRect(14, 20, 6, 6);
                ctx.fillStyle = '#fff';
                ctx.fillRect(15, 10, 2, 2);
                break;
        }

        this.sprites['icon_' + type] = canvas;
        return canvas;
    }

    // Initialize all sprites
    initAll() {
        console.log('🎨 Generating sprites...');

        // Player
        this.drawPlayer();

        // Enemies
        this.drawEnemy('normal');
        this.drawEnemy('fast');
        this.drawEnemy('tank');

        // Projectiles
        this.drawProjectile('orb');
        this.drawProjectile('fireball');
        this.drawProjectile('lightning');

        // Particles
        this.drawParticle('spark');
        this.drawParticle('blood');
        this.drawParticle('explosion');

        // UI Icons
        this.drawUIIcon('heart');
        this.drawUIIcon('star');
        this.drawUIIcon('skull');
        this.drawUIIcon('sword');
        this.drawUIIcon('shield');
        this.drawUIIcon('lightning_icon');

        console.log('✅ All sprites generated!');
    }

    // Get sprite with animation frame
    getSprite(name, time = 0) {
        const sprite = this.sprites[name];
        if (!sprite) return null;

        const anim = this.animations[name];
        if (!anim) {
            return { canvas: sprite, x: 0, y: 0, width: sprite.width, height: sprite.height };
        }

        const frameIndex = Math.floor(time / anim.speed) % anim.frames;
        const frameWidth = sprite.width / anim.frames;

        return {
            canvas: sprite,
            x: frameIndex * frameWidth,
            y: 0,
            width: frameWidth,
            height: sprite.height
        };
    }

    // Draw sprite at position
    drawSprite(ctx, name, x, y, scale = 1, time = 0, rotation = 0) {
        const spriteData = this.getSprite(name, time);
        if (!spriteData) return;

        ctx.save();
        ctx.translate(x, y);
        if (rotation !== 0) ctx.rotate(rotation);

        const drawWidth = spriteData.width * scale;
        const drawHeight = spriteData.height * scale;

        ctx.drawImage(
            spriteData.canvas,
            spriteData.x, spriteData.y,
            spriteData.width, spriteData.height,
            -drawWidth / 2, -drawHeight / 2,
            drawWidth, drawHeight
        );

        ctx.restore();
    }
}

// Particle effect enhancements
class EnhancedParticle {
    constructor(x, y, vx, vy, type, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.lifetime = lifetime;
        this.age = 0;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.size = 0.5 + Math.random() * 0.5;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // Gravity
        this.rotation += this.rotationSpeed;
        this.age += deltaTime;
        this.vx *= 0.98; // Air resistance
        return this.age < this.lifetime;
    }

    draw(ctx, spriteSheet) {
        const alpha = 1 - (this.age / this.lifetime);
        ctx.globalAlpha = alpha;

        spriteSheet.drawSprite(
            ctx,
            'particle_' + this.type,
            this.x,
            this.y,
            this.size,
            0,
            this.rotation
        );

        ctx.globalAlpha = 1;
    }
}

// Muzzle flash effect
class MuzzleFlash {
    constructor(x, y, angle, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.color = color;
        this.lifetime = 100;
        this.age = 0;
    }

    update(deltaTime) {
        this.age += deltaTime;
        return this.age < this.lifetime;
    }

    draw(ctx) {
        const alpha = 1 - (this.age / this.lifetime);
        const size = 20 * (1 - this.age / this.lifetime);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Flash
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(-size, -size/2, size * 2, size);

        ctx.restore();
        ctx.globalAlpha = 1;
    }
}

// Screen shake effect
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
    }

    shake(intensity, duration) {
        this.intensity = Math.max(this.intensity, intensity);
        this.duration = Math.max(this.duration, duration);
    }

    update(deltaTime) {
        if (this.duration > 0) {
            this.duration -= deltaTime;
            if (this.duration <= 0) {
                this.intensity = 0;
                this.duration = 0;
            }
        }
    }

    getOffset() {
        if (this.intensity === 0) return { x: 0, y: 0 };
        return {
            x: (Math.random() - 0.5) * this.intensity,
            y: (Math.random() - 0.5) * this.intensity
        };
    }
}
