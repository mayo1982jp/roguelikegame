const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const titleScreen = document.getElementById('titleScreen');
const startGameButton = document.getElementById('startGameButton');

canvas.width = 800;
canvas.height = 600;

console.log("Endless Survivors script loaded! DOM elements acquired.");

let isGameOver = false;
let gameHasStarted = false;

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    speed: 5,
    color: 'blue',
    dx: 0,
    dy: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 1,
    maxHealth: 100,
    health: 100,
    attackSpeed: 1000,
    lastAttackTime: 0,
    projectileSpeed: 7,
    projectileWidth: 5,
    projectileHeight: 10,
    projectileColor: 'yellow',
    projectileDamage: 1
};

// const keysPressed = {}; // Removed: keyboard input no longer used for movement
const experienceGems = [];
const enemies = [];
const projectiles = [];
let enemySpawnInterval;

// Removed keydown and keyup event listeners as they are no longer needed for movement

// Added mouse position tracking
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    if (!isGameOver && gameHasStarted) {
        ctx.fillStyle = 'red';
        ctx.fillRect(player.x, player.y - 10, player.width, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(player.x, player.y - 10, player.width * (player.health / player.maxHealth), 5);
    }
}

function updatePlayerMovement() {
    const targetX = mouseX - player.width / 2;
    const targetY = mouseY - player.height / 2;

    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Dead zone of 5 pixels around the cursor
    if (distance > 5) {
        const moveX = (dx / distance) * player.speed;
        const moveY = (dy / distance) * player.speed;

        player.x += moveX;
        player.y += moveY;
    }

    // Keep player within canvas bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function spawnExperienceGem(x, y, value) { /* Omitted for brevity, remains unchanged */
    experienceGems.push({ x, y, radius: 5, value, color: 'lime' });
}

function drawExperienceGems() { /* Omitted for brevity, remains unchanged */
    experienceGems.forEach(gem => {
        ctx.beginPath();
        ctx.arc(gem.x, gem.y, gem.radius, 0, Math.PI * 2);
        ctx.fillStyle = gem.color;
        ctx.fill();
        ctx.closePath();
    });
}

canvas.addEventListener('click', (event) => {
    if (isGameOver) {
        startGame();
    }
});


function checkGemCollection() { /* Omitted for brevity, remains unchanged */
    for (let i = experienceGems.length - 1; i >= 0; i--) {
        const gem = experienceGems[i];
        const closestX = Math.max(player.x, Math.min(gem.x, player.x + player.width));
        const closestY = Math.max(player.y, Math.min(gem.y, player.y + player.height));
        const distanceX = gem.x - closestX;
        const distanceY = gem.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        if (distanceSquared < (gem.radius * gem.radius)) {
             player.xp += gem.value;
             experienceGems.splice(i, 1);
             console.log(`Collected XP: ${gem.value}. Total XP: ${player.xp}/${player.xpToNextLevel}. Level: ${player.level}`);
             checkLevelUp();
        }
    }
}

function checkLevelUp() { /* Omitted for brevity, remains unchanged */
    if (player.xp >= player.xpToNextLevel) {
        player.level++;
        player.xp -= player.xpToNextLevel;
        player.xpToNextLevel = player.level;
        console.log(`Level Up! Reached Level: ${player.level}. XP: ${player.xp}/${player.xpToNextLevel}`);
        alert(`Level Up! Reached Level: ${player.level}`);
    }
}

function createEnemy(x, y) { /* Omitted for brevity, remains unchanged */
    return { x: x, y: y, width: 30, height: 30, speed: 1.5, color: 'red', health: 1, damage: 10 };
}

function spawnEnemy() { /* Omitted for brevity, remains unchanged */
    let x, y;
    const side = Math.floor(Math.random() * 4);
    const tempEnemySize = 30;
    if (side === 0) { x = Math.random() * canvas.width; y = -tempEnemySize; }
    else if (side === 1) { x = canvas.width + tempEnemySize; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + tempEnemySize; }
    else { x = -tempEnemySize; y = Math.random() * canvas.height; }
    enemies.push(createEnemy(x,y));
}

function drawEnemies() { /* Omitted for brevity, remains unchanged */
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function updateEnemies() { /* Omitted for brevity, remains unchanged */
    enemies.forEach(enemy => {
        const dxToPlayer = (player.x + player.width / 2) - (enemy.x + enemy.width / 2);
        const dyToPlayer = (player.y + player.height / 2) - (enemy.y + enemy.height / 2);
        const distanceToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dyToPlayer * dyToPlayer);
        if (distanceToPlayer > 0) {
            enemy.x += (dxToPlayer / distanceToPlayer) * enemy.speed;
            enemy.y += (dyToPlayer / distanceToPlayer) * enemy.speed;
        }
    });
}

function fireProjectile() { /* Omitted for brevity, remains unchanged */
    const newProjectile = {
        x: player.x + player.width / 2 - player.projectileWidth / 2, y: player.y,
        width: player.projectileWidth, height: player.projectileHeight, speed: player.projectileSpeed,
        color: player.projectileColor, damage: player.projectileDamage
    };
    projectiles.push(newProjectile);
}

function updateProjectiles() { /* Omitted for brevity, remains unchanged */
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.y -= p.speed;
        if (p.y + p.height < 0) projectiles.splice(i, 1);
    }
}

function drawProjectiles() { /* Omitted for brevity, remains unchanged */
    projectiles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

function checkProjectileHits() { /* Omitted for brevity, remains unchanged */
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y) {
                enemy.health -= projectile.damage;
                projectiles.splice(i, 1);
                if (enemy.health <= 0) {
                    spawnExperienceGem(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 1);
                    enemies.splice(j, 1);
                    console.log("Enemy destroyed. Spawned XP gem.");
                }
                break;
            }
        }
    }
}

function checkPlayerEnemyCollisions() { /* Omitted for brevity, remains unchanged */
    if (isGameOver) return;
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            player.health -= enemy.damage;
            enemies.splice(i, 1);
            console.log(`Player hit! Player HP: ${player.health}/${player.maxHealth}.`);
            if (player.health <= 0) {
                player.health = 0;
                handleGameOver();
                break;
            }
        }
    }
}

function handleGameOver() { /* Omitted for brevity, remains unchanged */
    isGameOver = true;
    gameHasStarted = false;
    clearInterval(enemySpawnInterval);
    console.log("Game Over!");
}

function startGame() { /* Omitted for brevity, remains unchanged */
    gameHasStarted = true;
    isGameOver = false;
    if (titleScreen.style.display !== 'none') {
        titleScreen.style.display = 'none';
    }
    player.health = player.maxHealth;
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height / 2 - player.height / 2;
    player.level = 1;
    player.xp = 0;
    player.xpToNextLevel = 1;
    player.lastAttackTime = Date.now();
    enemies.length = 0;
    experienceGems.length = 0;
    projectiles.length = 0;
    if (enemySpawnInterval) clearInterval(enemySpawnInterval);
    enemySpawnInterval = setInterval(spawnEnemy, 3000);
    console.log(`Game started. Player HP: ${player.health}/${player.maxHealth}`);
}

startGameButton.addEventListener('click', () => {
    startGame();
});

// New function to draw UI elements
function drawUI() {
    ctx.fillStyle = 'white';
    // Using a font stack that prefers Japanese fonts if available
    ctx.font = '20px "Meiryo", "Hiragino Sans", "MS PGothic", sans-serif';
    ctx.textAlign = 'left';

    // Display Level
    ctx.fillText(`レベル：${player.level}`, 10, 30);

    // Display XP
    ctx.fillText(`経験値：${player.xp} / ${player.xpToNextLevel}`, 10, 60);

    // Display HP (Text)
    ctx.fillText(`HP: ${player.health} / ${player.maxHealth}`, 10, 90);
}

// Modified gameLoop function
function gameLoop() {
    if (!gameHasStarted && !isGameOver) {
        if (titleScreen.style.display === 'none') {
            titleScreen.style.display = 'flex';
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif'; // Default font for game over screen is fine
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '24px sans-serif';
        ctx.fillText('Click Canvas to Restart', canvas.width / 2, canvas.height / 2 + 30);
    } else {
        if (titleScreen.style.display !== 'none') {
             titleScreen.style.display = 'none';
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (Date.now() - player.lastAttackTime > player.attackSpeed) {
            fireProjectile();
            player.lastAttackTime = Date.now();
        }

        updatePlayerMovement();
        updateProjectiles();
        updateEnemies();

        checkPlayerEnemyCollisions();
        if (isGameOver) {
            requestAnimationFrame(gameLoop);
            return;
        }
        checkGemCollection();
        checkProjectileHits();

        drawPlayer();
        drawProjectiles();
        drawExperienceGems();
        drawEnemies();
        drawUI(); // Call drawUI here
    }
    requestAnimationFrame(gameLoop);
}

console.log("Initializing game loop for title screen.");
requestAnimationFrame(gameLoop);
