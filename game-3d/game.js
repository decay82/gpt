// 3D Survival Arena - Hades Edition
// Using Three.js for 3D rendering

const CONFIG = {
    player: {
        speed: 0.15,
        rotationSpeed: 0.003,
        maxHp: 100,
        dashSpeed: 0.5,
        dashDuration: 150,
        dashCooldown: 800
    },
    camera: {
        distance: 8,
        height: 4,
        offsetX: 2, // Shoulder view offset
        smoothness: 0.1
    },
    enemy: {
        speed: 0.08,
        baseHp: 15,
        damage: 10,
        size: 1
    },
    weapon: {
        damage: 15,
        cooldown: 300,
        projectileSpeed: 0.8,
        projectileSize: 0.3
    },
    room: {
        size: 30,
        wallHeight: 5
    }
};

// Game State
const game = {
    scene: null,
    camera: null,
    renderer: null,
    player: null,
    enemies: [],
    projectiles: [],
    keys: {},
    mouse: { x: 0, y: 0 },
    pointerLocked: false,
    state: 'menu',
    currentChamber: 1,
    enemiesInChamber: 5,
    enemiesSpawned: 0,
    kills: 0,
    level: 1
};

// Initialize Three.js
function init() {
    const canvas = document.getElementById('gameCanvas');

    // Scene
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x1a1a1a);
    game.scene.fog = new THREE.Fog(0x1a1a1a, 10, 40);

    // Camera (Third Person)
    game.camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    // Renderer
    game.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    game.renderer.shadowMap.enabled = true;
    game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    game.scene.add(directionalLight);

    // Create arena
    createArena();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', (e) => game.keys[e.key] = true);
    document.addEventListener('keyup', (e) => game.keys[e.key] = false);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onMouseClick);

    // Pointer lock
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        game.pointerLocked = document.pointerLockElement === canvas;
    });

    // Start button
    document.getElementById('start-btn').addEventListener('click', startGame);

    // Start animation loop
    animate();
}

// Create Arena (Room)
function createArena() {
    const size = CONFIG.room.size;

    // Floor (darker, apocalyptic)
    const floorGeometry = new THREE.PlaneGeometry(size, size);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    game.scene.add(floor);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.9
    });
    const wallHeight = CONFIG.room.wallHeight;
    const wallThickness = 1;

    // North wall
    const northWall = new THREE.Mesh(
        new THREE.BoxGeometry(size, wallHeight, wallThickness),
        wallMaterial
    );
    northWall.position.set(0, wallHeight/2, -size/2);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    game.scene.add(northWall);

    // South wall
    const southWall = northWall.clone();
    southWall.position.z = size/2;
    game.scene.add(southWall);

    // East wall
    const eastWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, size),
        wallMaterial
    );
    eastWall.position.set(size/2, wallHeight/2, 0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    game.scene.add(eastWall);

    // West wall
    const westWall = eastWall.clone();
    westWall.position.x = -size/2;
    game.scene.add(westWall);

    // Add some debris/obstacles
    for (let i = 0; i < 10; i++) {
        const debrisGeometry = new THREE.BoxGeometry(
            Math.random() * 2 + 1,
            Math.random() * 1 + 0.5,
            Math.random() * 2 + 1
        );
        const debrisMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
        const debris = new THREE.Mesh(debrisGeometry, debrisMaterial);
        debris.position.set(
            (Math.random() - 0.5) * (size - 5),
            debrisGeometry.parameters.height / 2,
            (Math.random() - 0.5) * (size - 5)
        );
        debris.castShadow = true;
        debris.receiveShadow = true;
        game.scene.add(debris);
    }
}

// Player Class
class Player {
    constructor() {
        // Player model (using cylinder instead of capsule for compatibility)
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4ecdc4 });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true;
        this.mesh.position.y = 1.5;

        // Head
        const headGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.y = 1.2;
        this.mesh.add(this.head);

        // Bottom sphere for rounded feet
        const feetGeometry = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const feetMaterial = new THREE.MeshStandardMaterial({ color: 0x4ecdc4 });
        this.feet = new THREE.Mesh(feetGeometry, feetMaterial);
        this.feet.position.y = -0.75;
        this.mesh.add(this.feet);

        game.scene.add(this.mesh);

        this.hp = CONFIG.player.maxHp;
        this.maxHp = CONFIG.player.maxHp;
        this.rotation = 0;
        this.isDashing = false;
        this.dashCooldown = 0;
        this.shootCooldown = 0;
        this.dashDirection = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
    }

    shoot() {
        if (this.shootCooldown > 0) return;

        this.shootCooldown = CONFIG.weapon.cooldown;

        // Get shoot direction from camera
        const direction = new THREE.Vector3();
        game.camera.getWorldDirection(direction);
        direction.normalize();

        // Create projectile from player position
        const projectile = new Projectile(
            this.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)),
            direction
        );
        game.projectiles.push(projectile);
    }

    update(delta) {
        // Update cooldowns
        if (this.dashCooldown > 0) {
            this.dashCooldown -= delta * 1000;
        }
        if (this.shootCooldown > 0) {
            this.shootCooldown -= delta * 1000;
        }

        // Rotation (mouse)
        if (game.pointerLocked) {
            this.rotation += game.mouse.x * CONFIG.player.rotationSpeed;
            game.mouse.x = 0;
        }

        // Movement
        const moveVector = new THREE.Vector3();

        if (game.keys['w'] || game.keys['W']) moveVector.z -= 1;
        if (game.keys['s'] || game.keys['S']) moveVector.z += 1;
        if (game.keys['a'] || game.keys['A']) moveVector.x -= 1;
        if (game.keys['d'] || game.keys['D']) moveVector.x += 1;

        if (moveVector.length() > 0) {
            moveVector.normalize();

            // Dash
            if ((game.keys[' '] || game.keys['Shift']) && this.dashCooldown <= 0 && !this.isDashing) {
                this.startDash(moveVector);
            }
        }

        // Apply movement
        if (this.isDashing) {
            this.velocity.copy(this.dashDirection).multiplyScalar(CONFIG.player.dashSpeed);
        } else {
            moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
            this.velocity.copy(moveVector).multiplyScalar(CONFIG.player.speed);
        }

        this.mesh.position.add(this.velocity);

        // Keep in bounds
        const halfSize = CONFIG.room.size / 2 - 1;
        this.mesh.position.x = Math.max(-halfSize, Math.min(halfSize, this.mesh.position.x));
        this.mesh.position.z = Math.max(-halfSize, Math.min(halfSize, this.mesh.position.z));

        // Update mesh rotation
        this.mesh.rotation.y = this.rotation;
    }

    startDash(direction) {
        this.isDashing = true;
        this.dashCooldown = CONFIG.player.dashCooldown;
        this.dashDirection.copy(direction).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);

        // Create dash effect
        createDashEffect(this.mesh.position);

        setTimeout(() => {
            this.isDashing = false;
        }, CONFIG.player.dashDuration);
    }

    takeDamage(damage) {
        if (this.isDashing) return; // Invulnerable during dash

        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            gameOver();
        }
        updateUI();
    }
}

// Enemy Class
class Enemy {
    constructor(position) {
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0xff6b6b });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.position.copy(position);
        this.mesh.position.y = 0.75;

        game.scene.add(this.mesh);

        this.hp = CONFIG.enemy.baseHp;
        this.speed = CONFIG.enemy.speed;
        this.lastDamageTime = 0;
    }

    update(delta) {
        if (!game.player) return;

        // Move towards player
        const direction = new THREE.Vector3();
        direction.subVectors(game.player.mesh.position, this.mesh.position);
        direction.y = 0;
        direction.normalize();

        this.mesh.position.add(direction.multiplyScalar(this.speed));

        // Look at player
        this.mesh.lookAt(game.player.mesh.position);

        // Attack player if close
        const distance = this.mesh.position.distanceTo(game.player.mesh.position);
        if (distance < 2) {
            const now = Date.now();
            if (now - this.lastDamageTime > 1000) {
                game.player.takeDamage(CONFIG.enemy.damage);
                this.lastDamageTime = now;
            }
        }
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    destroy() {
        game.scene.remove(this.mesh);
        game.kills++;
        updateUI();
    }
}

// Projectile Class
class Projectile {
    constructor(position, direction) {
        const geometry = new THREE.SphereGeometry(CONFIG.weapon.projectileSize, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0x44a6ff,
            emissive: 0x44a6ff
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);

        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(CONFIG.weapon.projectileSize * 1.5, 8, 8);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4ecdc4,
            transparent: true,
            opacity: 0.5
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.glow);

        game.scene.add(this.mesh);

        this.direction = direction.clone();
        this.speed = CONFIG.weapon.projectileSpeed;
        this.damage = CONFIG.weapon.damage;
        this.lifetime = 3000; // 3 seconds
        this.createdAt = Date.now();
    }

    update(delta) {
        // Move projectile
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed));

        // Animate glow
        this.glow.rotation.x += 0.1;
        this.glow.rotation.y += 0.1;

        // Check collision with enemies
        for (let i = game.enemies.length - 1; i >= 0; i--) {
            const enemy = game.enemies[i];
            const distance = this.mesh.position.distanceTo(enemy.mesh.position);

            if (distance < 1) {
                // Hit enemy
                if (enemy.takeDamage(this.damage)) {
                    game.enemies.splice(i, 1);
                }
                this.destroy();
                return false;
            }
        }

        // Check lifetime
        if (Date.now() - this.createdAt > this.lifetime) {
            this.destroy();
            return false;
        }

        // Check bounds
        const halfSize = CONFIG.room.size / 2;
        if (Math.abs(this.mesh.position.x) > halfSize ||
            Math.abs(this.mesh.position.z) > halfSize ||
            this.mesh.position.y < 0 || this.mesh.position.y > 10) {
            this.destroy();
            return false;
        }

        return true;
    }

    destroy() {
        game.scene.remove(this.mesh);
    }
}

// Create dash effect
function createDashEffect(position) {
    const geometry = new THREE.RingGeometry(0.5, 2, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0x4ecdc4,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.position.copy(position);
    ring.position.y = 0.1;
    ring.rotation.x = -Math.PI / 2;
    game.scene.add(ring);

    // Fade out and remove
    let opacity = 0.8;
    const fadeInterval = setInterval(() => {
        opacity -= 0.05;
        material.opacity = opacity;
        if (opacity <= 0) {
            game.scene.remove(ring);
            clearInterval(fadeInterval);
        }
    }, 20);
}

// Spawn enemy
function spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const distance = CONFIG.room.size / 2 - 2;
    const position = new THREE.Vector3(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
    );

    const enemy = new Enemy(position);
    game.enemies.push(enemy);
    game.enemiesSpawned++;
}

// Update camera (Third Person Shoulder View)
function updateCamera() {
    if (!game.player) return;

    const player = game.player.mesh;
    const targetPosition = new THREE.Vector3();

    // Shoulder view offset
    const offset = new THREE.Vector3(
        CONFIG.camera.offsetX,
        CONFIG.camera.height,
        CONFIG.camera.distance
    );

    // Rotate offset based on player rotation
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), game.player.rotation);
    targetPosition.copy(player.position).add(offset);

    // Smooth camera movement
    game.camera.position.lerp(targetPosition, CONFIG.camera.smoothness);

    // Look at player
    const lookAt = player.position.clone();
    lookAt.y += 2;
    game.camera.lookAt(lookAt);
}

// Start game
function startGame() {
    game.state = 'playing';
    game.currentChamber = 1;
    game.kills = 0;
    game.enemiesSpawned = 0;
    game.enemiesInChamber = 5;

    // Create player
    game.player = new Player();

    // Spawn initial enemies
    for (let i = 0; i < 3; i++) {
        spawnEnemy();
    }

    document.getElementById('menu-screen').classList.remove('active');
    updateUI();
}

// Game over
function gameOver() {
    game.state = 'gameover';
    alert(`Game Over! Chamber ${game.currentChamber} - Kills: ${game.kills}`);
    location.reload();
}

// Update UI
function updateUI() {
    if (!game.player) return;

    document.getElementById('hp-text').textContent = `${Math.ceil(game.player.hp)}/${game.player.maxHp}`;
    document.getElementById('hp-fill').style.width = (game.player.hp / game.player.maxHp * 100) + '%';

    const dashPercent = Math.max(0, 100 - (game.player.dashCooldown / CONFIG.player.dashCooldown * 100));
    document.getElementById('dash-fill').style.width = dashPercent + '%';

    document.getElementById('chamber-num').textContent = game.currentChamber;
    document.getElementById('enemies-count').textContent = game.enemies.length;
    document.getElementById('kills-count').textContent = game.kills;
    document.getElementById('level-text').textContent = game.level;
}

// Mouse move
function onMouseMove(event) {
    if (game.pointerLocked) {
        game.mouse.x = event.movementX;
        game.mouse.y = event.movementY;
    }
}

// Mouse click (shoot)
function onMouseClick(event) {
    if (game.pointerLocked && game.player && game.state === 'playing') {
        game.player.shoot();
    }
}

// Window resize
function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const delta = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (game.state === 'playing') {
        // Update player
        if (game.player) {
            game.player.update(delta);
        }

        // Update enemies
        game.enemies.forEach(enemy => enemy.update(delta));

        // Update projectiles
        game.projectiles = game.projectiles.filter(p => p.update(delta));

        // Spawn more enemies
        if (game.enemiesSpawned < game.enemiesInChamber) {
            if (Math.random() < 0.005) {
                spawnEnemy();
            }
        }

        // Check chamber complete
        if (game.enemies.length === 0 && game.enemiesSpawned >= game.enemiesInChamber) {
            nextChamber();
        }

        // Update camera
        updateCamera();

        // Update UI
        if (Math.floor(currentTime / 100) !== Math.floor((currentTime - delta * 1000) / 100)) {
            updateUI();
        }
    }

    game.renderer.render(game.scene, game.camera);
}

// Next chamber
function nextChamber() {
    game.currentChamber++;
    game.enemiesInChamber = 5 + game.currentChamber * 2;
    game.enemiesSpawned = 0;

    // Heal player
    if (game.player) {
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + 20);
    }

    alert(`Chamber ${game.currentChamber - 1} Cleared! +20 HP`);

    // Spawn new enemies
    for (let i = 0; i < 3; i++) {
        spawnEnemy();
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
