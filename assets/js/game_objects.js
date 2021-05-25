class Player {
    constructor(xPos, yPos, color, radius, speed){
        this.xPos = xPos
        this.yPos = yPos
        this.color = color
        this.radius = radius
        this.speed = speed
    }

    update(){
        document.onkeydown = (event) => {
            keyPresses.add(event.key)
        }
        document.onkeyup = (event) => {
            keyPresses.delete(event.key)
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

    draw(){
        ctx.beginPath()
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

    update(enemy, enemyIndex, AnimId){
        
        let playerDist, bulDist, exitloop = false, bullet

            for (const bulletIndex in bullets) {
                bullet = bullets[bulletIndex]

                bulDist = Math.hypot(bullet.xPos - enemy.xPos, bullet.yPos - enemy.yPos)

                if (bulDist - enemy.radius - bullet.radius < 1){

                    if (PARTICLES_ENABLE){
                        for (let i = 0; i < (enemy.radius/2); i++){
                            particles.push(new Particle(enemy.xPos, enemy.yPos,{
                                x: (Math.random() - 0.5) * (Math.random() * PARTICLE_SPEED),
                                y: (Math.random() - 0.5) * (Math.random() * PARTICLE_SPEED)
                            }, enemy.color,Math.random() * PARTICLE_RADIUS ,PARTICLE_OPACTITY_REDUCTION))}
                    }
   
                    if (enemy.radius - ENEMY_MIN_RADIUS_TO_LIVE < ENEMY_MIN_RADIUS_TO_LIVE) {
                        score += 100
                            bullets.splice(bulletIndex,1)
                            enemies.splice(enemyIndex,1)
                            exitloop = true
                    } else {
                        score += 20
                        gsap.to(enemy, {radius: enemy.radius - 15})
                        setTimeout(() => {
                            bullets.splice(bulletIndex,1)
                        }, 0)
                    }
                    scoreTopLeft.innerHTML = score
                }

                if (exitloop == true){
                    break
                }
            }

        playerDist = Math.hypot(player.xPos - enemy.xPos, player.yPos - enemy.yPos)

            if (playerDist - enemy.radius - player.radius < 1){
                finalScoreLabel.innerHTML = score

                if (score > highScore){
                    highScore = score
                }

                highscoreLabel.innerHTML = highScore

                cancelAnimationFrame(AnimId)
                document.removeEventListener('click', (event) => {
                    shoot(event)
                })
                deathUI.style.display = 'block'
            }

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
