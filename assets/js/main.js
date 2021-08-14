const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const scoreTopLeft = document.querySelector('#scoreLabel')
const nameInput = document.querySelector('input#inputName')
const colorInput = document.querySelector('input#inputColor')
const startBtn = document.querySelector('#startBtn')
const startUI = document.querySelector('#startUI')
const deathUI = document.querySelector('#deathUI')
const finalScoreLabel = document.querySelector('#finalScoreLabel')
const highscoreLabel = document.querySelector('#highscoreLabel')
const mainmenuBtn = document.querySelector('#mainmenuBtn')
const needNickLabel = document.querySelector('#needNickLabel')
const nameLabel = document.querySelector('#nameSpan')
const mobileCover = document.querySelector('#mobileCover')
const loadingScreen = document.querySelector('.loadingScreen')
const devData = document.querySelectorAll('.labels') // Shows number of particles, bullets, enemies, health
const currentAmmo = document.querySelector('#currentAmmo')
const totalAmmo = document.querySelector('#totalAmmo')
const gameUI = document.querySelector('#inGameUI')
const health = document.querySelector('#health')


let player, AnimId, score = 0, highScore = 0, playerName, spawnCount = 0
let ammo

const BG_COLOR = 'rgba(0, 0, 0, 0.09)'

let PLAYER_COLOR = 'white'
const PLAYER_HEALTH = 100
const PLAYER_RADIUS = 20
let PLAYER_SPEED = 4
const PLAYER_GUN_AMMO = 30
const PLAYER_GUN_RELOADTIME = 4500 // 1000 = 1sec
const PLAYER_GUN_RECOIL = 2
const PLAYER_DMG_OFFSETX = 15 // It is in pixel values
const PLAYER_DMG_OFFSETY = 15 // This also

const BULLET_SPEED = 8
let BULLET_COLOR = 'white'
const BULLET_RADIUS = 10
let BULLET_DELAY = 350 // 1000 = 1 second // FIRERATE
let BULLET_DMG = 15 // X DMG means => RadiusOfEnemy - X 
const BULLET_AIM_ERROR = 0.1

const ENEMY_RADIUS_MAX = 60
const ENEMY_RADIUS_MIN = 20
const ENEMY_MIN_RADIUS_TO_LIVE = 15
const ENEMY_SPEED = 60
const ENEMY_SPAWN_DELAY = 1100 // 1000 = 1 second
const ENEMY_DMG_MULTIPLIER = 0.5

const PARTICLES_ENABLE = true
const PARTICLE_NO_MULTIPLIER = 0.2 // Number of particles = radius of enemy
const PARTICLE_RADIUS = 2 // 2 is normal
const PARTICLE_DMG_RADIUS = 10
const PARTICLE_SPEED = 8 // 8 is normal
const PARTICLE_DMG_SPEED = 20
const PARTICLE_SPEED_REDUCTION = 0.02 // 1 is total speed and it is reduced per frame
const PARTICLE_DMG_SPEED_REDUCTION = 0.1
const PARTICLE_OPACITY_REDUCTION = 0.01
const PARTICLE_DMG_OPACITY_REDUCTION = 0.01

const DETECTORS_ENABLE = true
const DETECTOR_START_POS = {x:5, y:5}
const DETECTOR_GAP = 40
const DETECTOR_DETECTION_RANGE = DETECTOR_GAP * 3
const DETECTOR_CLOSE_RANGE = DETECTOR_GAP * 2
const DETECTOR_COLOR = 'white'
const DETECTOR_RADIUS = 5
const DETECTOR_NORMAL_OPACITY = 0.008
const DETECTOR_DETECTED_OPACITY = 0.5
const DETECTOR_CLOSE_OPACITY = 0

const POWERUP_SPAWN_DELAY = 20000
const POWERUP_SPAWN_CHANCE = 1
const POWERUP_SIZE = 50 // In pixel value
const POWERUP_MAX = 3
const POWERUP_TYPES = ['speed','strength','adrenaline','multi-shoot']
const POWERUP_SPEED_SPEED_INC_BY = 4
let POWERUP_SPEED_ENABLE = false
const POWERUP_SPEED_DURATION = 10000 // 1000 = 1 sec
const POWERUP_STRENGTH_DMG_INC_BY = 100 // X DMG means => RadiusOfEnemy - X 
let POWERUP_STRENGTH_ENABLE = false
const POWERUP_STRENGTH_DURATION = 15000 // 1000 = 1 sec
const POWERUP_ADRENALINE_FIRERATE_INC_BY = 200 
let POWERUP_ADRENALINE_ENABLE = false
const POWERUP_ADRENALINE_DURATION = 8000 // 1000 = 1 sec 
let POWERUP_MULTISHOT_ENABLE = false
const POWERUP_MULTISHOT_NO_OF_BULLETS = 8
const POWERUP_MULTISHOT_DURATION = 5000 // 1000 = 1 sec
let POWERUP_INVINCIBILITY_ENABLE = false
const POWERUP_INVINCIBILITY_DURATION = 10000 // 1000 = 1 sec

let keyPresses = new Set()
let bullets = new Array()
let enemies = new Array()
let particles = new Array()
let detectors = new Array()
let powerups = new Array()
let bk_music = new Array()

bk_music[0] = new Audio('assets/mp3/ambient3.ogg')


gameUI.style.display = 'none'

const ua = new UAParser()
const device = ua.getResult().device.type

if (device == 'mobile'){
    mobileCover.style.display = 'block'
    screen.orientation.lock('portrait')
    loadingScreen.style.display = 'none'
    throw new Error('Game not availible for mobile devices at the moment')
}

mobileCover.style.display = 'none'
startUI.style.display = 'block'

/* Loading till here */
loadingScreen.style.display = 'none'
scoreTopLeft.style.display = 'block'

startBtn.addEventListener('click', () => {

    music()

    playerName = nameInput.value
    nameLabel.innerHTML = playerName
    PLAYER_COLOR = colorInput.value
    BULLET_COLOR = PLAYER_COLOR

    if (playerName.length == 0){
        needNickLabel.innerHTML = 'We need a Nick name... plzz'
        needNickLabel.style.display = 'inline-block'
    } else if (playerName.length <= 3){
        needNickLabel.innerHTML = 'Nick is too short'
        needNickLabel.style.display = 'inline-block'
    } else if (playerName.length >= 20){
        needNickLabel.innerHTML = 'Nick is too long'
        needNickLabel.style.display = 'inline-block'
    } else {
        
        init()

        startUI.style.display = 'none'

        if (spawnCount < 1){
            spawnEnemy()
        }
        start()
        spawnPowerup()
         
        spawnCount += 1
    }
})

mainmenuBtn.addEventListener('click', () => {
    deathUI.style.display = 'none'
    startUI.style.display = 'block'
})