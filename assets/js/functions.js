function enemyVelocity(x, y, radius){

    let ENEMY_VELOCITY_MULTIPLIER = (1/radius) * ENEMY_SPEED
    
    angle = Math.atan2(player.yPos - y, player.xPos - x)

    velocity = {
        x: Math.cos(angle) * ENEMY_VELOCITY_MULTIPLIER,
        y: Math.sin(angle) * ENEMY_VELOCITY_MULTIPLIER
    }

    return velocity
}

function shoot(event){
    angle = Math.atan2(event.clientY - player.yPos, event.clientX - player.xPos)
    
        velocity = {
            x: Math.cos(angle) * BULLET_SPEED,
            y: Math.sin(angle) * BULLET_SPEED
        }
    
        bullets.push(new Bullet(player.xPos, player.yPos, velocity, BULLET_COLOR, BULLET_RADIUS))
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

function init(){
    needNickLabel.style.display = 'none'
    score = 0

    canvas.width = innerWidth
    canvas.height = innerHeight

    keyPresses = new Set()
    bullets = new Array()
    enemies = new Array()
    particles = new Array()
    detectors = new Array()

    if (DETECTORS_ENABLE){
        setDetector(DETECTOR_START_POS, DETECTOR_GAP)
    }

    player = new Player(canvas.width / 2, canvas.height / 2, PLAYER_COLOR, PLAYER_RADIUS, PLAYER_SPEED)
    
    document.addEventListener('click', (event) => {
        shoot(event)
    })
}

function start(){
    AnimId = requestAnimationFrame(start)
    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (canvas.width != innerWidth){
        canvas.width = innerWidth
    }
    if (canvas.height != innerHeight){
        canvas.height = innerHeight
    }

    detectors.forEach((detector) => {
        detector.update()
        detector.draw()

    })

    bullets.forEach((bullet, index) => {
        bullet.update(bullet, index)
        bullet.draw()
    })

    enemies.forEach((enemy, index) => {
        enemy.update(enemy, index, AnimId)
        enemy.draw()
    })

    if (particles.length > 1){
        particles.forEach((particle, index) => {
            particle.update(index)
            particle.draw()
        })
    }

    scoreTopLeft.innerHTML = score

    player.update()
    player.draw()
}