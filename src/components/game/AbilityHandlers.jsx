// Ability handlers for special upgrade abilities

export function handleDash(player, keys, createParticles) {
    if (keys.x && player.hasDash && !player.dashActive) {
        const now = Date.now();
        if (!player.lastDash || now - player.lastDash > 5000) {
            player.dashActive = true;
            player.dashEndTime = now + 2000;
            player.lastDash = now;
            return true;
        }
    }
    return false;
}

export function handleAfterimage(player, keys, createParticles, gs) {
    if (keys.v && player.hasAfterimage) {
        const now = Date.now();
        if (!player.lastAfterimage || now - player.lastAfterimage > 20000) {
            player.invisibleUntil = now + 10000;
            player.lastAfterimage = now;
            // Create stationary decoy at current position
            gs.decoy = {
                x: player.x,
                y: player.y,
                lifetime: 10000,
                spawnTime: now
            };
            createParticles(player.x, player.y, '#8844ff', 30, 8);
            return true;
        }
    }
    return false;
}

export function handleTeleport(player, keys, mouse, createParticles, sfx) {
    if (keys.t && player.hasTeleport) {
        const now = Date.now();
        if (!player.lastTeleport || now - player.lastTeleport > 8000) {
            createParticles(player.x, player.y, '#00ffff', 20, 10);
            player.x = mouse.x;
            player.y = mouse.y;
            createParticles(player.x, player.y, '#00ffff', 20, 10);
            player.lastTeleport = now;
            sfx?.upgrade();
            return true;
        }
    }
    return false;
}

export function handleDaze(player, keys, enemies, createParticles, sfx) {
    if (keys.c && player.hasDaze) {
        const now = Date.now();
        if (!player.lastDaze || now - player.lastDaze > 12000) {
            // Stun enemies within 200 radius
            enemies.forEach(e => {
                const dist = Math.hypot(e.x - player.x, e.y - player.y);
                if (dist < 200) {
                    e.stunned = true;
                    e.stunEndTime = now + 3000;
                    createParticles(e.x, e.y, '#ffff00', 10, 5);
                }
            });
            player.lastDaze = now;
            createParticles(player.x, player.y, '#ffff00', 40, 15);
            sfx?.upgrade();
            return true;
        }
    }
    return false;
}

export function handleMedicine(player, keys, sfx) {
    if (keys.m && player.hasMedicine && player.medicineReady) {
        const now = Date.now();
        if (!player.lastMedicine || now - player.lastMedicine > 30000) {
            player.health = Math.min(player.maxHealth, player.health + 25);
            player.lastMedicine = now;
            player.medicineReady = false;
            setTimeout(() => { player.medicineReady = true; }, 30000);
            sfx?.upgrade();
            return true;
        }
    }
    return false;
}