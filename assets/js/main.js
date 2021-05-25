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

let player, AnimId, score = 0, highScore = 0, playerName, spawnEnemyCount = 0

const BG_COLOR = 'rgba(0, 0, 0, 0.1)'

let PLAYER_COLOR = 'white'
const PLAYER_RADIUS = 20
const PLAYER_SPEED = 4

const BULLET_SPEED = 4
let BULLET_COLOR = 'white'
const BULLET_RADIUS = 10
const BULLET_DELAY = 400 // 1000 = 1 second
const BULLET_DMG = 15 // X DMG means Radius - X is taken as DMG

const ENEMY_RADIUS_MAX = 60
const ENEMY_RADIUS_MIN = 20
const ENEMY_MIN_RADIUS_TO_LIVE = 15
const ENEMY_SPEED = 60
const ENEMY_SPAWN_DELAY = 1000 // 1000 = 1 second

const PARTICLES_ENABLE = true
const PARTICLE_NO_MULTIPLIER = 0.5 // Number of particles = radius of enemy
const PARTICLE_RADIUS = 2 // 2 is normal
const PARTICLE_SPEED = 8 // 8 is normal
const PARTICLE_SPEED_REDUCTION = 0.02 // 1 is total speed and it is reduced per frame
const PARTICLE_OPACTITY_REDUCTION = 0.01

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

let keyPresses = new Set()
let bullets = new Array()
let enemies = new Array()
let particles = new Array()
let detectors = new Array()

const ua = new UAParser()
const device = ua.getResult().device.type

if (device == 'mobile'){
    mobileCover.style.display = 'block'
    screen.orientation.lock('portrait')
    loadingScreen.style.display = 'none'
    throw new Error('Game not availible for mobile devices at the moment')
} else {
    mobileCover.style.display = 'none'
    startUI.style.display = 'block'
}

init()
loadingScreen.style.display = 'none'
scoreTopLeft.style.display = 'block'

startBtn.addEventListener('click', () => {

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

        if (spawnEnemyCount < 1){
            spawnEnemy()
        }
        start()
        
        spawnEnemyCount += 1
    }
})

mainmenuBtn.addEventListener('click', () => {
    deathUI.style.display = 'none'
    startUI.style.display = 'block'
})