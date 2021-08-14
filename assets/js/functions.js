let ifShooting = false, autoShoot = false
let mouseEvent, shootID, declarationNumber = 0
let spawnPowerupID, adr_shootID, iterations


function enemyVelocity(x, y, radius){

    let ENEMY_VELOCITY_MULTIPLIER = (1/radius) * ENEMY_SPEED
    
    angle = Math.atan2(player.yPos - y, player.xPos - x)

    velocity = {
        x: Math.cos(angle) * ENEMY_VELOCITY_MULTIPLIER,
        y: Math.sin(angle) * ENEMY_VELOCITY_MULTIPLIER
    }

    return velocity
}


function shootingInit() {
    ifShooting = false
    autoShoot = false

    clearInterval(shootID)

    if (declarationNumber < 1){
        document.addEventListener('mousedown', () => {
            ifShooting = true
        })
        document.addEventListener('mouseup', () => {
            ifShooting = false
        })
        document.addEventListener('mousemove', (event) => {
            mouseEvent = event
        })
    
        document.addEventListener('keydown', (event) => {
            if (event.key == 'r'){
                gunReload()
            }
            else if (event.key == 'x'){
                autoShoot = !autoShoot
            }
        })    
    }

    shootID = setInterval(() => { // This part decides how many bullets to shoot. If we have adrenaline, shoot more, else shoot less
        if ((ifShooting || autoShoot) && (ammo != NaN && ammo > 0)){

            if(POWERUP_ADRENALINE_ENABLE){
                shoot(mouseEvent)
                ammo++
            } else {
                let no_of_bullets = Math.floor(BULLET_DELAY/(BULLET_DELAY - POWERUP_ADRENALINE_FIRERATE_INC_BY))
                if (iterations%no_of_bullets == 0){
                    shoot(mouseEvent)
                }
            }

            currentAmmo.innerHTML = ammo
            iterations++
        } else if (ammo <= 0){ //Auto reload functionality
            gunReload()
        }
    },BULLET_DELAY - POWERUP_ADRENALINE_FIRERATE_INC_BY);

    declarationNumber++
}


function shoot(event){
    let angle

    angle = Math.atan2(event.clientY - player.yPos, event.clientX - player.xPos)
    angle += ((Math.random() - 0.5) * BULLET_AIM_ERROR) 
    
    velocity = {
        x: Math.cos(angle) * BULLET_SPEED ,
        y: Math.sin(angle) * BULLET_SPEED 
    }

    player.dir = angle
    bullets.push(new Bullet(player.xPos, player.yPos, velocity, BULLET_COLOR, BULLET_RADIUS))

    if (POWERUP_MULTISHOT_ENABLE){
        console.log('multishooting')
        inc_angle = 360/POWERUP_MULTISHOT_NO_OF_BULLETS
        console.log(inc_angle)

        for (let i = 1; i < POWERUP_MULTISHOT_NO_OF_BULLETS; i++) {
            angle += (inc_angle * (Math.PI/180))
            console.log(angle)

            velocity = {
                x: Math.cos(angle) * BULLET_SPEED ,
                y: Math.sin(angle) * BULLET_SPEED 
            }

            bullets.push(new Bullet(player.xPos, player.yPos, velocity, BULLET_COLOR, BULLET_RADIUS))
        }
    }

    ammo--
}


function gunReload(){
    ammo = NaN
    setTimeout(() => {
        ammo = PLAYER_GUN_AMMO
        currentAmmo.innerHTML = ammo
    }, PLAYER_GUN_RELOADTIME)
}


function setDetector(startPos, gap){

    let yNumber = Math.floor(canvas.height / gap) + 1
    let xNumber = Math.floor(canvas.width / gap) + 1
    
    let newXPOS = startPos.x
    let newYPOS = startPos.y

    for (let i = 0; i < yNumber; i++) {
        for (let j = 0; j < xNumber; j++) {
            detectors.push(new Detector({x:newXPOS, y:newYPOS}, DETECTOR_COLOR, DETECTOR_RADIUS, DETECTOR_NORMAL_OPACITY, DETECTOR_DETECTED_OPACITY, DETECTOR_CLOSE_OPACITY))
            newXPOS += gap
        }
        newXPOS = startPos.x
        newYPOS += gap
    }

}


function spawnEnemy(){
    setInterval(() => {
        const ENEMY_COLOR = `hsl(${Math.random() * 360}, 50%, 50%)`
        const ENEMY_RADIUS = Math.random() * (ENEMY_RADIUS_MAX - ENEMY_RADIUS_MIN) + ENEMY_RADIUS_MIN

        let x, y
        
        if (Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - ENEMY_RADIUS : canvas.width + ENEMY_RADIUS 
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - ENEMY_RADIUS : canvas.height + ENEMY_RADIUS 
        }

        velocity = enemyVelocity(x, y, ENEMY_RADIUS)
        
        enemies.push(new Enemy(x, y, velocity, ENEMY_COLOR, ENEMY_RADIUS))
    }, ENEMY_SPAWN_DELAY);
}


function music(){
    bk_music[0].play()
    bk_music[0].loop = true
}


function spawnPowerup(){
    spawnPowerupID = setInterval(() => {

        let type = Math.floor(Math.random() * (POWERUP_TYPES.length)), x, y, pos

        x = Math.floor(Math.random() * canvas.width)
        y = Math.floor(Math.random() * canvas.height)
        pos = {x: x, y: y}

        powerups.push(new PowerUp(pos, POWERUP_SIZE, POWERUP_TYPES[type]))

    },POWERUP_SPAWN_DELAY)
}


function init(){
    needNickLabel.style.display = 'none'
    gameUI.style.display = 'block'
    iterations = 0
    score = 0

    canvas.width = innerWidth
    canvas.height = innerHeight
    keyPresses = new Set()
    bullets = new Array()
    enemies = new Array()
    particles = new Array()
    detectors = new Array()
    powerups = new Array()
    ammo = PLAYER_GUN_AMMO

    if (DETECTORS_ENABLE){
        setDetector(DETECTOR_START_POS, DETECTOR_GAP)
    }
    shootingInit()

    totalAmmo.innerHTML = PLAYER_GUN_AMMO
    currentAmmo.innerHTML = totalAmmo.innerHTML

    POWERUP_STRENGTH_ENABLE = false
    POWERUP_SPEED_ENABLE = false
    POWERUP_MULTISHOT_ENABLE = false
    POWERUP_INVINCIBILITY_ENABLE = false
    POWERUP_ADRENALINE_ENABLE = false

    player = new Player(canvas.width / 2, canvas.height / 2, PLAYER_COLOR, PLAYER_RADIUS, PLAYER_SPEED, PLAYER_HEALTH)
    devData[3].innerHTML = player.health
}


function start(){
    AnimId = requestAnimationFrame(start)
    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0 , 0, canvas.width, canvas.height)

    detectors.forEach((detector) => {
        detector.update()
        detector.draw()

    })

    bullets.forEach((bullet, index) => {
        bullet.update(bullet, index)
        bullet.draw()
        
    })

    enemies.forEach((enemy, enemyIndex) => {

        let playerDist, bulDist, exitloop = false, bullet

            for (const bulletIndex in bullets) {
                bullet = bullets[bulletIndex]

                bulDist = Math.hypot(bullet.xPos - enemy.xPos, bullet.yPos - enemy.yPos)

                if (bulDist - enemy.radius - bullet.radius < 1){ // Checking, if bullet collides with enemy

                    if (PARTICLES_ENABLE){ // Creates particles on collision
                        for (let i = 0; i < (enemy.radius/2); i++){
                            particles.push(new Particle(enemy.xPos, enemy.yPos,{
                                x: (Math.random() - 0.5) * (Math.random() * PARTICLE_SPEED),
                                y: (Math.random() - 0.5) * (Math.random() * PARTICLE_SPEED)
                            }, enemy.color,Math.random() * PARTICLE_RADIUS ,PARTICLE_OPACITY_REDUCTION))}
                    }
   
                    if (enemy.radius - BULLET_DMG < ENEMY_MIN_RADIUS_TO_LIVE) { // Killing enemy if too small
                        score += 25
                            bullets.splice(bulletIndex,1)
                            enemies.splice(enemyIndex,1)
                            exitloop = true
                    } else { // Reducing enemy size or reducing health
                        score += 10
                        gsap.to(enemy, {radius: enemy.radius - BULLET_DMG})
                        setTimeout(() => {
                            bullets.splice(bulletIndex,1)
                        }, 0)
                    }
                    scoreTopLeft.innerHTML = score
                }

                if (exitloop == true){ // To avoide enemy deletion bug
                    break
                }
            }

        playerDist = Math.hypot(player.xPos - enemy.xPos, player.yPos - enemy.yPos) // Dist between player and enemy

            if (playerDist - enemy.radius - player.radius < 1){ // Checking if player collides with enemy

                player.health -= enemy.radius * ENEMY_DMG_MULTIPLIER
                devData[3].innerHTML = Math.floor(player.health) // Displays health
                
                if (player.health <= 0){
                    finalScoreLabel.innerHTML = score

                    if (score > highScore){
                        highScore = score
                    }

                    highscoreLabel.innerHTML = highScore

                    cancelAnimationFrame(AnimId) // This stops the animation, shooting intervals, shooting
                    clearInterval(shootID)       // and displays Death msg
                    clearInterval(spawnPowerupID)
                    document.removeEventListener('click', (event) => {
                        shoot(event)
                    })
                    deathUI.style.display = 'block'
                } else {
                    if (PARTICLES_ENABLE){ // Creates particles on collision
                        for (let i = 0; i < 15; i++){
                            particles.push(new Particle(player.xPos, player.yPos,{
                                x: (Math.random() - 0.5) * (Math.random() * PARTICLE_DMG_SPEED),
                                y: (Math.random() - 0.5) * (Math.random() * PARTICLE_DMG_SPEED)
                            }, player.color,Math.random() * PARTICLE_DMG_RADIUS ,PARTICLE_DMG_OPACITY_REDUCTION))}
                    }
                    player.draw(1)
                    enemies.splice(enemyIndex,1)
                }
            }

        enemy.update()
        enemy.draw()
    })

    if (particles.length > 1){
        particles.forEach((particle, index) => {
            particle.update(index)
            particle.draw()
        })
    }

    if (powerups.length > 1){
        powerups.forEach((powerup, index) => {
            powerup.update(index)
            powerup.draw()  
        })
    }

    scoreTopLeft.innerHTML = score

    player.update()
    player.draw(0)

    devData[0].innerHTML = bullets.length
    devData[1].innerHTML = enemies.length
    devData[2].innerHTML = particles.length
    health.value = player.health
}