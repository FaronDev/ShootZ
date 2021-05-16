const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth 
canvas.height = innerHeight 

const scoreEl = document.querySelector('#scoreEl')
const finalScoreEl = document.querySelector('#finalScore')
const startBtn = document.querySelector('#startBtn')
const endBox = document.querySelector('#endBox')

let player
let score = 0

class Player {
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 360, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 360, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update(){
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 360, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }

    update(){
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Particle {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 360, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    update(){
        this.x += this.velocity.x
        this.y += this.velocity.y

        this.velocity.x *= 0.98
        this.velocity.y *= 0.98

        this.alpha -= 0.01
    }
}



const playerX = canvas.width / 2
const playerY = canvas.height / 2
let projectiles = []
let enemies = []
let particles = []
const bulletSpeed = 7
let restarts = 0
let enemySpeed = 100

function spawnEnemy() {
    setInterval(() => {

        const enemyRadii = Math.random() * (50 - 10) + 15
        const enemyColor = `hsl(${Math.random() * 360}, 50%, 50%)`
        let enemyX
        let enemyY

        if (Math.random() < 0.5) {
            enemyX = Math.random() < 0.5 ? 0 - enemyRadii : canvas.width + enemyRadii 
            enemyY = Math.random() * canvas.height
        }
        else {
            enemyX = Math.random() * canvas.width 
            enemyY = Math.random() < 0.5 ? 0 - enemyRadii : canvas.height + enemyRadii
        }

        angle2 = Math.atan2(playerY - enemyY, playerX - enemyX)

        let enemyVelocityMultiplier = 1/enemyRadii * enemySpeed
        enemyVelocity = {
            x: Math.cos(angle2) * enemyVelocityMultiplier,
            y: Math.sin(angle2) * enemyVelocityMultiplier
        }


        enemies.push(new Enemy(enemyX, enemyY, enemyRadii, enemyColor, enemyVelocity))
    }, 1000)
}

function animate() {
    animeId = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    projectiles.forEach((projectile, index) => {
        projectile.update()
        projectile.draw()

        if (projectile.x + projectile.radius < 0  || 
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || 
            projectile.y - projectile.radius > canvas.height ){
            
            setTimeout(() => {
                projectiles.splice(index,1)
            }, 0)
        }
    })
    enemies.forEach((enemy,enemyIndex) => {
        enemy.update()
        enemy.draw()

        playerEnemyDist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (playerEnemyDist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animeId)
            endBox.style.display = 'flex'
            finalScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile,index) => {
            projectileEnemyDist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if (projectileEnemyDist - enemy.radius - projectile.radius < 1){

                for (let i = 0; i < (enemy.radius/2); i++) {
                    particles.push(new Particle(enemy.x, enemy.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 8),
                        y: (Math.random() - 0.5) * (Math.random() * 8)
                    }))
                    
                }
                if (enemy.radius - 15 < 15) {
                    score += 100
                    setTimeout(() => {
                        projectiles.splice(index,1)
                        enemies.splice(enemyIndex,1)
                    }, 0)
                } else {
                    score += 20
                    gsap.to(enemy, {radius: enemy.radius - 15})
                    setTimeout(() => {
                        projectiles.splice(index,1)
                    }, 0)
                }
                scoreEl.innerHTML = score
            }
        })
    })

    particles.forEach((particle,index) => {
        particle.update()
        particle.draw()

        if (particle.alpha <= 0) {
            particles.splice(index,1)
        }

        
    })

    player.draw()
}

function init() {
    projectiles = []
    enemies = []
    particles = []
    player = new Player(playerX, playerY, 20, 'white')
    player.draw()
    score = 0
    scoreEl.innerHTML = score
    finalScoreEl.innerHTML = score
}

addEventListener('click', (event) => {
    angle = Math.atan2(event.clientY - playerY, event.clientX - playerX)
    const velocity = {
        x: Math.cos(angle) * bulletSpeed,
        y: Math.sin(angle) * bulletSpeed
    }
    
    projectiles.push(new Projectile(playerX, playerY, 10, 'white', velocity))
})

startBtn.addEventListener('click', () => {
    init()
    endBox.style.display = 'none'
    animate()
    if (restarts < 1) {
        spawnEnemy()
    }
    restarts += 1
})
