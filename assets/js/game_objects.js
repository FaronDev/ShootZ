class Player {
    constructor(xPos, yPos, color, radius, speed, health){
        this.xPos = xPos
        this.yPos = yPos
        this.color = color
        this.radius = radius
        this.speed = speed
        this.health = health
        this.dir = 0
    }

    update(){

        document.onkeydown = (event) => {
            keyPresses.add(event.key)
        }
        document.onkeyup = (event) => {
            keyPresses.delete(event.key)
        }

        player.speed = PLAYER_SPEED

        if (ifShooting || autoShoot){
            player.speed -= PLAYER_GUN_RECOIL 
        }
        if (POWERUP_SPEED_ENABLE){
            player.speed += POWERUP_SPEED_SPEED_INC_BY
        }
    
        keyPresses.forEach((key) => {
            switch(key){
                case 'a':
                    this.xPos -= this.speed
                    break
                case 'd':
                    this.xPos += this.speed
                    break
                case 'w':
                    this.yPos -= this.speed
                    break
                case 's':
                    this.yPos += this.speed
                    break
                default:
                    break
            }
        })

        if (this.xPos < this.radius){
            this.xPos = this.radius
        }
        if (this.xPos > canvas.width - this.radius){
            this.xPos = canvas.width - this.radius
        }
        if (this.yPos < this.radius){
            this.yPos = this.radius
        }
        if (this.yPos > canvas.height - this.radius){
            this.yPos = canvas.height - this.radius
        }

    }

    draw(state){ // 1 - taking damage 

        ctx.beginPath()
        if (state == 1){
            this.color = 'red'
            setTimeout(() => {this.color = PLAYER_COLOR}, 1)
        }

        if (POWERUP_MULTISHOT_ENABLE){
            this.color = '#ff00e1'
        } else if (POWERUP_ADRENALINE_ENABLE){
            this.color = '#fbff00'
        } else if (POWERUP_SPEED_ENABLE){
            this.color = '#00ffea'
        } else if (POWERUP_STRENGTH_ENABLE){
            this.color = '#ff8400'
        } else {
            this.color = PLAYER_COLOR
        } 

        ctx.fillStyle = this.color
        ctx.arc(this.xPos, this.yPos, this.radius, 0, Math.PI * 2, false)
        ctx.fill()
    }
}

class Bullet {
    constructor(xPos, yPos, velocity, color, radius){
        this.xPos = xPos
        this.yPos = yPos
        this.velocity = velocity
        this.color = color
        this.radius = radius
    }

    update(bullet, index){
        this.xPos += this.velocity.x
        this.yPos += this.velocity.y

        if (bullet.xPos < (bullet.radius * -1)){
            bullets.splice(index, 1)
            return 0
        } else if (bullet.xPos > canvas.width + bullet.radius){
            bullets.splice(index, 1)
            return 0
        } else if (bullet.yPos < (bullet.radius * -1)){
            bullets.splice(index, 1)
            return 0
        } else if (bullet.yPos > canvas.height + bullet.radius){
            bullets.splice(index, 1)
            return 0
        }
    }

    draw(){
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.xPos, this.yPos, this.radius, 0, Math.PI * 2, false)
        ctx.fill()
    }
}

class Particle {
    constructor(xPos, yPos, velocity, color, radius, opacity_reduction){
        this.xPos = xPos
        this.yPos = yPos
        this.velocity = velocity
        this.color = color
        this.radius = radius
        this.opacity_reduction = opacity_reduction
        this.opacity = 1
    }

    update(index){

        if (this.opacity <= 0){
            setTimeout(() => {
                particles.splice(index, 1)
            }, 0)
            return 0
        }

        this.xPos += this.velocity.x
        this.yPos += this.velocity.y

        this.velocity.x *= (1 - PARTICLE_SPEED_REDUCTION)


        this.opacity -= this.opacity_reduction
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.opacity
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.xPos, this.yPos, this.radius, 0, Math.PI * 2, false)
        ctx.fill()
        ctx.restore()
    }
}

class Enemy {
    constructor(xPos, yPos, velocity, color, radius){
        this.xPos = xPos
        this.yPos = yPos
        this.velocity = velocity
        this.color = color
        this.radius = radius
    }

    update(){
        this.velocity = enemyVelocity(this.xPos, this.yPos, this.radius)

        this.xPos += this.velocity.x
        this.yPos += this.velocity.y
    }

    draw(){
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.xPos, this.yPos, this.radius, 0, Math.PI * 2, false)
        ctx.fill()
    }
}

class Detector {
    constructor(pos, color, radius, normalOpacity, detectedOpacity, closeOpacity){
        this.pos = pos
        this.color = color
        this.radius = radius
        this.normalOpacity = normalOpacity
        this.detectedOpacity = detectedOpacity
        this.closeOpacity = closeOpacity
        this.currentOpacity = this.normalOpacity
    }

    update(){
        let distPlayer = Math.hypot(this.pos.x - player.xPos, this.pos.y - player.yPos)

        if (distPlayer < DETECTOR_CLOSE_RANGE){
            this.currentOpacity = this.closeOpacity
        } else if (distPlayer < DETECTOR_DETECTION_RANGE){
            this.currentOpacity = this.detectedOpacity
        } else {
            this.currentOpacity = this.normalOpacity
        }
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.currentOpacity
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, false)
        ctx.fill()
        ctx.restore()
    }
}

class PowerUp {
    constructor(pos, size, Ptype){
        this.pos = pos
        this.Ptype = Ptype // Powerup type
        this.size = size
    }

    update(index){
        let dist

        dist = Math.hypot(this.pos.x - player.xPos, this.pos.y - player.yPos)

        if (dist - this.size - player.radius < 1){ // Checking collision of player with powerup

            let type_chance = POWERUP_TYPES.indexOf(this.Ptype) // ['speed 0','strength 0','adrenaline 0','multi-shoot','invincibility']

            switch (type_chance) { 
                
                case 0: // speed
                    POWERUP_SPEED_ENABLE = true
                    setTimeout(() => {POWERUP_SPEED_ENABLE = false}, POWERUP_SPEED_DURATION)
                    console.log('speed')
                    break
                case 1: // strength
                    BULLET_DMG += POWERUP_STRENGTH_DMG_INC_BY
                    POWERUP_STRENGTH_ENABLE = true
                    setTimeout(() => {BULLET_DMG -= POWERUP_STRENGTH_DMG_INC_BY; POWERUP_STRENGTH_ENABLE = false}, POWERUP_STRENGTH_DURATION)
                    console.log('strength')
                    break
                case 2: // adrenaline
                    POWERUP_ADRENALINE_ENABLE = true
                    setTimeout(() => {POWERUP_ADRENALINE_ENABLE = false}, POWERUP_ADRENALINE_DURATION)
                    console.log('adrenaline')
                    break
                case 3:
                    POWERUP_MULTISHOT_ENABLE = true
                    setTimeout(() => {POWERUP_MULTISHOT_ENABLE = false}, POWERUP_MULTISHOT_DURATION)
                    console.log('multi')
                    break
           }

           powerups.splice(index, 1)
        }
    }

    draw(){
        ctx.beginPath()

        switch (POWERUP_TYPES.indexOf(this.Ptype)) {
            case 0:
                ctx.fillStyle = '#00ffea'
                break;
            case 1:
                ctx.fillStyle = '#ff8400'
                break;
            case 2:
                ctx.fillStyle = '#fbff00'
                break;
            case 3:
                ctx.fillStyle = '#ff00e1'
                break;
        }
        ctx.rect(this.pos.x - (this.size/2), this.pos.y - (this.size/2), this.size, this.size)
        ctx.fill()
    }
}