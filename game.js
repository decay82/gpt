// Game Configuration
const CONFIG = {
    canvas: {
        width: 1200,
        height: 800
    },
    player: {
        size: 20,
        speed: 4,
        maxHp: 100,
        baseHp: 100
    },
    enemy: {
        baseSize: 15,
        baseSpeed: 1.5,
        baseHp: 15,
        baseDamage: 10,
        spawnInterval: 4000,
        spawnAcceleration: 0.98
    },
    weapon: {
        baseRange: 200,
        baseDamage: 15,
        baseCooldown: 1000
    }
};

// Game State
const game = {
    canvas: null,
    ctx: null,
    state: 'menu', // menu, playing, levelup, gameover
    player: null,
    enemies: [],
    projectiles: [],
    particles: [],
    effects: [], // Muzzle flashes, etc
    keys: {},
    score: 0,
    kills: 0,
    time: 0,
    lastTime: 0,
    enemySpawnTimer: 0,
    enemySpawnInterval: CONFIG.enemy.spawnInterval,
    spriteSheet: null,
    screenShake: null,
    background: null
};

// Apocalypse Background Class
class ApocalypseBackground {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.debris = [];
        this.burningCars = [];
        this.cracks = [];
        this.generateBackground();
    }

    generateBackground() {
        // Generate road cracks
        for (let i = 0; i < 30; i++) {
            this.cracks.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                length: 20 + Math.random() * 60,
                angle: Math.random() * Math.PI * 2,
                width: 1 + Math.random() * 3
            });
        }

        // Generate burning cars
        for (let i = 0; i < 5; i++) {
            this.burningCars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                type: Math.floor(Math.random() * 2), // Different car types
                firePhase: Math.random() * Math.PI * 2
            });
        }

        // Generate debris
        for (let i = 0; i < 50; i++) {
            this.debris.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 3 + Math.random() * 8,
                type: Math.floor(Math.random() * 3)
            });
        }
    }

    draw(ctx, time) {
        // Dark asphalt background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Add road texture
        ctx.fillStyle = '#252525';
        for (let y = 0; y < this.height; y += 20) {
            for (let x = 0; x < this.width; x += 20) {
                if (Math.random() > 0.7) {
                    ctx.fillRect(x, y, 2, 2);
                }
            }
        }

        // Draw cracks
        ctx.strokeStyle = '#0a0a0a';
        this.cracks.forEach(crack => {
            ctx.lineWidth = crack.width;
            ctx.beginPath();
            ctx.moveTo(crack.x, crack.y);
            ctx.lineTo(
                crack.x + Math.cos(crack.angle) * crack.length,
                crack.y + Math.sin(crack.angle) * crack.length
            );
            ctx.stroke();
        });

        // Draw debris
        this.debris.forEach(d => {
            if (d.type === 0) {
                // Rock
                ctx.fillStyle = '#3a3a3a';
                ctx.fillRect(d.x, d.y, d.size, d.size);
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(d.x + 1, d.y + 1, d.size - 2, d.size - 2);
            } else if (d.type === 1) {
                // Metal piece
                ctx.fillStyle = '#555';
                ctx.fillRect(d.x, d.y, d.size, d.size * 0.5);
            } else {
                // Small rubble
                ctx.fillStyle = '#444';
                ctx.fillRect(d.x, d.y, d.size * 0.7, d.size * 0.7);
            }
        });

        // Draw burning cars
        this.burningCars.forEach(car => {
            car.firePhase += 0.05;

            // Car shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(car.x + 2, car.y + 32, 40, 8);

            // Car body (burnt/destroyed)
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(car.x, car.y + 20, 40, 15); // Body
            ctx.fillRect(car.x + 5, car.y + 10, 30, 15); // Roof

            // Windows (broken/dark)
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(car.x + 8, car.y + 12, 10, 10);
            ctx.fillRect(car.x + 22, car.y + 12, 10, 10);

            // Burnt marks
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(car.x + 2, car.y + 22, 36, 3);
            ctx.fillRect(car.x + 10, car.y + 15, 20, 3);

            // Fire effect
            const fireHeight = 15 + Math.sin(car.firePhase) * 5;
            const fireColors = ['#ff4400', '#ff6600', '#ff8800', '#ffaa00'];

            for (let i = 0; i < 3; i++) {
                const flameX = car.x + 15 + Math.cos(car.firePhase + i) * 8;
                const flameY = car.y + 8 - fireHeight + i * 3;
                const flameSize = 6 + Math.sin(car.firePhase + i * 0.5) * 3;

                ctx.fillStyle = fireColors[i % fireColors.length];
                ctx.fillRect(flameX, flameY, flameSize, flameSize);
            }

            // Smoke particles
            if (Math.random() > 0.7) {
                game.particles.push(new SmokeParticle(
                    car.x + 20 + (Math.random() - 0.5) * 20,
                    car.y + 10
                ));
            }
        });
    }
}

// Smoke Particle Class
class SmokeParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -0.5 - Math.random() * 0.5;
        this.size = 4 + Math.random() * 6;
        this.life = 1;
        this.maxLife = 2000 + Math.random() * 1000;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= deltaTime / this.maxLife;
        this.size += 0.1;
        return this.life > 0;
    }

    draw(ctx) {
        const alpha = this.life * 0.3;
        ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = CONFIG.player.size;
        this.speed = CONFIG.player.speed;
        this.maxHp = CONFIG.player.maxHp;
        this.hp = this.maxHp;
        this.level = 1;
        this.xp = 0;
        this.xpToLevel = 100;
        this.weapons = [new Weapon('orb', this)];
        this.pickupRange = 80;
    }

    update(deltaTime) {
        // Movement
        let dx = 0;
        let dy = 0;

        if (game.keys['ArrowLeft'] || game.keys['a'] || game.keys['A']) dx -= 1;
        if (game.keys['ArrowRight'] || game.keys['d'] || game.keys['D']) dx += 1;
        if (game.keys['ArrowUp'] || game.keys['w'] || game.keys['W']) dy -= 1;
        if (game.keys['ArrowDown'] || game.keys['s'] || game.keys['S']) dy += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        this.x += dx * this.speed;
        this.y += dy * this.speed;

        // Keep player in bounds
        this.x = Math.max(this.size, Math.min(game.canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(game.canvas.height - this.size, this.y));

        // Update weapons
        this.weapons.forEach(weapon => weapon.update(deltaTime));
    }

    draw(ctx) {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + 20, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Player sprite
        game.spriteSheet.drawSprite(ctx, 'player', this.x, this.y, 0.8, game.time);

        // HP bar
        const barWidth = 40;
        const barHeight = 5;
        const barY = this.y - 30;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

        const hpColor = this.hp > this.maxHp * 0.5 ? '#4ecdc4' :
                       this.hp > this.maxHp * 0.25 ? '#ffd93d' : '#ff6b6b';
        ctx.fillStyle = hpColor;
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * (this.hp / this.maxHp), barHeight);
    }

    takeDamage(damage) {
        this.hp -= damage;
        createHitEffect(this.x, this.y, '#ff6b6b');

        if (this.hp <= 0) {
            this.hp = 0;
            gameOver();
        }
    }

    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToLevel) {
            this.levelUp();
        }
        updateUI();
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToLevel;
        this.xpToLevel = Math.floor(this.xpToLevel * 1.2);
        showLevelUpScreen();
    }
}

// Enemy Class
class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = CONFIG.enemy.baseSize;
        this.speed = CONFIG.enemy.baseSpeed;
        this.maxHp = CONFIG.enemy.baseHp;
        this.hp = this.maxHp;
        this.damage = CONFIG.enemy.baseDamage;
        this.xpValue = 10;
        this.lastDamageTime = 0;
        this.damageInterval = 1000;

        // Scale with time
        const timeScale = 1 + (game.time / 60000) * 0.5;
        this.maxHp *= timeScale;
        this.hp = this.maxHp;
        this.damage *= timeScale;
        this.xpValue = Math.floor(this.xpValue * timeScale);

        // Different enemy types
        if (type === 'fast') {
            this.speed *= 1.5;
            this.size *= 0.8;
            this.color = '#ffd93d';
        } else if (type === 'tank') {
            this.speed *= 0.7;
            this.maxHp *= 2;
            this.hp = this.maxHp;
            this.size *= 1.3;
            this.damage *= 1.5;
            this.color = '#ee5a6f';
        } else {
            this.color = '#95e1d3';
        }
    }

    update(deltaTime) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        // Check collision with player
        const playerDist = Math.sqrt(
            Math.pow(this.x - game.player.x, 2) +
            Math.pow(this.y - game.player.y, 2)
        );

        if (playerDist < this.size + game.player.size) {
            const now = Date.now();
            if (now - this.lastDamageTime > this.damageInterval) {
                game.player.takeDamage(this.damage);
                this.lastDamageTime = now;
            }
        }
    }

    draw(ctx) {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        const shadowScale = this.type === 'tank' ? 1.2 : 1;
        ctx.ellipse(this.x, this.y + 15, 15 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Enemy sprite
        const scale = this.type === 'tank' ? 1.2 : this.type === 'fast' ? 0.8 : 1;
        game.spriteSheet.drawSprite(ctx, 'enemy_' + this.type, this.x, this.y, scale, game.time);

        // HP bar
        if (this.hp < this.maxHp) {
            const barWidth = 30;
            const barHeight = 4;
            const barY = this.y - 25;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(this.x - barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

            ctx.fillStyle = '#ff6b6b';
            ctx.fillRect(this.x - barWidth / 2, barY, barWidth * (this.hp / this.maxHp), barHeight);
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        createHitEffect(this.x, this.y, '#fff');

        if (this.hp <= 0) {
            this.onDeath();
            return true;
        }
        return false;
    }

    onDeath() {
        game.player.addXP(this.xpValue);
        game.kills++;
        createExplosion(this.x, this.y, this.color);
        updateUI();
    }
}

// Weapon Class
class Weapon {
    constructor(type, owner) {
        this.type = type;
        this.owner = owner;
        this.level = 1;
        this.damage = CONFIG.weapon.baseDamage;
        this.range = CONFIG.weapon.baseRange;
        this.cooldown = CONFIG.weapon.baseCooldown;
        this.lastFire = 0;
        this.projectileSpeed = 8;

        if (type === 'orb') {
            this.name = 'Magic Orb';
            this.color = '#4ecdc4';
        } else if (type === 'fireball') {
            this.name = 'Fireball';
            this.color = '#ff6b6b';
            this.damage *= 1.5;
            this.projectileSpeed = 12;
        } else if (type === 'lightning') {
            this.name = 'Lightning';
            this.color = '#ffd93d';
            this.cooldown *= 0.7;
        }
    }

    update(deltaTime) {
        const now = Date.now();
        if (now - this.lastFire > this.cooldown) {
            this.fire();
            this.lastFire = now;
        }
    }

    fire() {
        // Find nearest enemy
        let nearest = null;
        let nearestDist = this.range;

        game.enemies.forEach(enemy => {
            const dist = Math.sqrt(
                Math.pow(enemy.x - this.owner.x, 2) +
                Math.pow(enemy.y - this.owner.y, 2)
            );
            if (dist < nearestDist) {
                nearest = enemy;
                nearestDist = dist;
            }
        });

        if (nearest) {
            const angle = Math.atan2(nearest.y - this.owner.y, nearest.x - this.owner.x);
            game.projectiles.push(new Projectile(
                this.owner.x,
                this.owner.y,
                angle,
                this.projectileSpeed,
                this.damage,
                this.color,
                this.type
            ));

            // Muzzle flash effect
            game.effects.push(new MuzzleFlash(this.owner.x, this.owner.y, angle, this.color));
        }
    }

    upgrade() {
        this.level++;
        this.damage *= 1.2;
        this.range *= 1.1;
        this.cooldown *= 0.9;
    }
}

// Projectile Class
class Projectile {
    constructor(x, y, angle, speed, damage, color, type) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.damage = damage;
        this.color = color;
        this.type = type;
        this.size = 8;
        this.lifetime = 3000;
        this.createdAt = Date.now();
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;

        // Check collision with enemies
        for (let i = game.enemies.length - 1; i >= 0; i--) {
            const enemy = game.enemies[i];
            const dist = Math.sqrt(
                Math.pow(this.x - enemy.x, 2) +
                Math.pow(this.y - enemy.y, 2)
            );

            if (dist < this.size + enemy.size) {
                if (enemy.takeDamage(this.damage)) {
                    game.enemies.splice(i, 1);
                }
                return false; // Remove projectile
            }
        }

        // Check lifetime and bounds
        if (Date.now() - this.createdAt > this.lifetime ||
            this.x < 0 || this.x > game.canvas.width ||
            this.y < 0 || this.y > game.canvas.height) {
            return false;
        }

        return true;
    }

    draw(ctx) {
        // Use sprite
        game.spriteSheet.drawSprite(
            ctx,
            'projectile_' + this.type,
            this.x,
            this.y,
            0.8,
            Date.now() - this.createdAt,
            this.angle
        );

        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}

// Particle Class (now using sprites)
class Particle {
    constructor(x, y, vx, vy, type, size, lifetime) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.type = type || 'spark';
        this.size = size;
        this.lifetime = lifetime;
        this.age = 0;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.age += deltaTime;
        this.vy += 0.15; // Gravity
        this.vx *= 0.98; // Air resistance
        this.rotation += this.rotationSpeed;
        return this.age < this.lifetime;
    }

    draw(ctx) {
        const alpha = 1 - (this.age / this.lifetime);
        ctx.globalAlpha = alpha;

        game.spriteSheet.drawSprite(
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

// Visual Effects
function createExplosion(x, y, color) {
    // Add screen shake
    game.screenShake.shake(5, 200);

    // Create explosion particles
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 3 + Math.random() * 4;
        game.particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            'explosion',
            0.8 + Math.random() * 0.5,
            400 + Math.random() * 200
        ));
    }

    // Add sparks
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        game.particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            'spark',
            0.6 + Math.random() * 0.4,
            300 + Math.random() * 200
        ));
    }
}

function createHitEffect(x, y, color) {
    const type = color === '#ff6b6b' ? 'blood' : 'spark';

    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        game.particles.push(new Particle(
            x, y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            type,
            0.5 + Math.random() * 0.5,
            250 + Math.random() * 150
        ));
    }
}

// Enemy Spawning
function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch(side) {
        case 0: // Top
            x = Math.random() * game.canvas.width;
            y = -30;
            break;
        case 1: // Right
            x = game.canvas.width + 30;
            y = Math.random() * game.canvas.height;
            break;
        case 2: // Bottom
            x = Math.random() * game.canvas.width;
            y = game.canvas.height + 30;
            break;
        case 3: // Left
            x = -30;
            y = Math.random() * game.canvas.height;
            break;
    }

    // Determine enemy type
    let type = 'normal';
    const rand = Math.random();
    if (rand < 0.1) type = 'tank';
    else if (rand < 0.3) type = 'fast';

    game.enemies.push(new Enemy(x, y, type));
}

// Upgrade System
const UPGRADES = [
    {
        id: 'hp',
        name: '❤️ Max HP +20',
        description: 'Increase maximum health and heal',
        apply: (player) => {
            player.maxHp += 20;
            player.hp = Math.min(player.hp + 20, player.maxHp);
        }
    },
    {
        id: 'speed',
        name: '⚡ Speed +15%',
        description: 'Move faster',
        apply: (player) => {
            player.speed *= 1.15;
        }
    },
    {
        id: 'weapon_damage',
        name: '⚔️ Weapon Damage +20%',
        description: 'All weapons deal more damage',
        apply: (player) => {
            player.weapons.forEach(w => w.damage *= 1.2);
        }
    },
    {
        id: 'weapon_speed',
        name: '🔥 Attack Speed +15%',
        description: 'Weapons fire faster',
        apply: (player) => {
            player.weapons.forEach(w => w.cooldown *= 0.85);
        }
    },
    {
        id: 'weapon_range',
        name: '🎯 Weapon Range +20%',
        description: 'Attack from further away',
        apply: (player) => {
            player.weapons.forEach(w => w.range *= 1.2);
        }
    },
    {
        id: 'new_weapon',
        name: '✨ New Weapon',
        description: 'Add a random weapon',
        apply: (player) => {
            const types = ['orb', 'fireball', 'lightning'];
            const type = types[Math.floor(Math.random() * types.length)];
            player.weapons.push(new Weapon(type, player));
        }
    }
];

function showLevelUpScreen() {
    game.state = 'levelup';
    document.getElementById('levelup-screen').classList.remove('hidden');

    // Select 3 random upgrades
    const options = [];
    const availableUpgrades = [...UPGRADES];

    for (let i = 0; i < 3 && availableUpgrades.length > 0; i++) {
        const index = Math.floor(Math.random() * availableUpgrades.length);
        options.push(availableUpgrades.splice(index, 1)[0]);
    }

    const container = document.getElementById('upgrade-options');
    container.innerHTML = '';

    options.forEach(upgrade => {
        const div = document.createElement('div');
        div.className = 'upgrade-option';
        div.innerHTML = `
            <h3>${upgrade.name}</h3>
            <p>${upgrade.description}</p>
        `;
        div.onclick = () => selectUpgrade(upgrade);
        container.appendChild(div);
    });
}

function selectUpgrade(upgrade) {
    upgrade.apply(game.player);
    document.getElementById('levelup-screen').classList.add('hidden');
    game.state = 'playing';
    updateUI();
}

// UI Updates
function updateUI() {
    const player = game.player;

    // HP
    const hpPercent = (player.hp / player.maxHp) * 100;
    document.getElementById('hp-fill').style.width = hpPercent + '%';
    document.getElementById('hp-text').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;

    // XP
    const xpPercent = (player.xp / player.xpToLevel) * 100;
    document.getElementById('xp-fill').style.width = xpPercent + '%';
    document.getElementById('level-text').textContent = `Lv.${player.level}`;

    // Timer
    const minutes = Math.floor(game.time / 60000);
    const seconds = Math.floor((game.time % 60000) / 1000);
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Kills
    document.getElementById('kills').textContent = game.kills;
}

// Game Loop
function gameLoop(timestamp) {
    if (game.state !== 'playing') {
        requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = timestamp - game.lastTime;
    game.lastTime = timestamp;
    game.time += deltaTime;

    // Update screen shake
    game.screenShake.update(deltaTime);

    // Draw background (before screen shake)
    if (game.background) {
        game.background.draw(game.ctx, game.time);
    }

    // Apply screen shake
    game.ctx.save();
    const shake = game.screenShake.getOffset();
    game.ctx.translate(shake.x, shake.y);

    // Update
    game.player.update(deltaTime);

    game.enemies.forEach(enemy => enemy.update(deltaTime));

    game.projectiles = game.projectiles.filter(p => p.update(deltaTime));

    game.particles = game.particles.filter(p => p.update(deltaTime));

    game.effects = game.effects.filter(e => e.update(deltaTime));

    // Spawn enemies
    game.enemySpawnTimer += deltaTime;
    if (game.enemySpawnTimer > game.enemySpawnInterval) {
        spawnEnemy();
        game.enemySpawnTimer = 0;
        game.enemySpawnInterval *= CONFIG.enemy.spawnAcceleration;
        game.enemySpawnInterval = Math.max(game.enemySpawnInterval, 500);
    }

    // Draw (back to front)
    game.particles.forEach(p => p.draw(game.ctx));
    game.effects.forEach(e => e.draw(game.ctx));
    game.enemies.forEach(enemy => enemy.draw(game.ctx));
    game.projectiles.forEach(p => p.draw(game.ctx));
    game.player.draw(game.ctx);

    // Restore context
    game.ctx.restore();

    // Update UI
    if (Math.floor(timestamp / 100) !== Math.floor(game.lastTime / 100)) {
        updateUI();
    }

    requestAnimationFrame(gameLoop);
}

// Game Over
function gameOver() {
    game.state = 'gameover';

    const minutes = Math.floor(game.time / 60000);
    const seconds = Math.floor((game.time % 60000) / 1000);

    document.getElementById('final-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('final-kills').textContent = game.kills;
    document.getElementById('final-level').textContent = game.player.level;

    showScreen('gameover-screen');
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Start Game
function startGame() {
    // Reset game state
    game.background = new ApocalypseBackground(CONFIG.canvas.width, CONFIG.canvas.height);
    game.player = new Player(CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
    game.enemies = [];
    game.projectiles = [];
    game.particles = [];
    game.effects = [];
    game.kills = 0;
    game.time = 0;
    game.lastTime = performance.now();
    game.enemySpawnTimer = 0;
    game.enemySpawnInterval = CONFIG.enemy.spawnInterval;
    game.state = 'playing';

    showScreen('game-screen');
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');

    // Initialize sprite system
    console.log('🎨 Initializing sprite system...');
    game.spriteSheet = new SpriteSheet();
    game.spriteSheet.initAll();
    game.screenShake = new ScreenShake();

    // Set canvas size
    const setCanvasSize = () => {
        const maxWidth = window.innerWidth - 40;
        const maxHeight = window.innerHeight - 40;
        const scale = Math.min(maxWidth / CONFIG.canvas.width, maxHeight / CONFIG.canvas.height, 1);

        game.canvas.width = CONFIG.canvas.width;
        game.canvas.height = CONFIG.canvas.height;
        game.canvas.style.width = (CONFIG.canvas.width * scale) + 'px';
        game.canvas.style.height = (CONFIG.canvas.height * scale) + 'px';
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Event Listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);

    // Keyboard input
    window.addEventListener('keydown', (e) => {
        game.keys[e.key] = true;

        // Prevent arrow key scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        game.keys[e.key] = false;
    });

    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    game.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    game.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (game.state !== 'playing') return;

        const touch = e.touches[0];
        const rect = game.canvas.getBoundingClientRect();
        const scaleX = game.canvas.width / rect.width;
        const scaleY = game.canvas.height / rect.height;

        const targetX = (touch.clientX - rect.left) * scaleX;
        const targetY = (touch.clientY - rect.top) * scaleY;

        const dx = targetX - game.player.x;
        const dy = targetY - game.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10) {
            game.player.x += (dx / distance) * game.player.speed;
            game.player.y += (dy / distance) * game.player.speed;

            game.player.x = Math.max(game.player.size, Math.min(game.canvas.width - game.player.size, game.player.x));
            game.player.y = Math.max(game.player.size, Math.min(game.canvas.height - game.player.size, game.player.y));
        }
    });

    game.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
    });

    console.log('🎮 Survival Arena initialized!');
    console.log('Controls: Arrow Keys or WASD to move');
});
