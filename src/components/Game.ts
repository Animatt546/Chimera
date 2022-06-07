import Canvas from './Canvas'
import Room from './Room'
import Player from './Player'
import PlayerController from './PlayerController'
import FieldData from './FieldData'
import Vector2 from './Vector2'
import { pickups, Pickup } from './BlockData'
import Block from './Block'
import MenuAudio from './../assets/sounds/menu.mp3'
import RadiatorAudio from './../assets/sounds/radiatorInRoom.mp3'
import Stats from './Stats'

interface RoomData {
    x: number,
    y: number,
    color: string,
    top: FieldData[],
    bottom: FieldData[],
}

export default class Game {
    private gameDiv = document.getElementById('game')
    canvas = new Canvas(this.gameDiv, this)
    currRoom: Room
    private player: Player
    private controller: PlayerController
    private roomsData: RoomData[] = []
    private startingAudio = new Audio()
    private radiatorInRoom = new Audio(RadiatorAudio)
    allRooms: Room[] = []

    stoped = false
    gAnimation = 0
    warheadNumber = 0
    currPickup: Pickup = null
    timeSinceLastConsumableChange = 0
    statsInterval: NodeJS.Timer
    deadInterval: NodeJS.Timer
    isEven = false
    isPlayerDead = false
    gameOver = false
    gameWin = false
    constructor() {
        this.startingAudio.src = MenuAudio
        this.startingAudio.onended = () => this.canvas.changeSite(2)
        window.onkeydown = () => this.createMenu(0)

    }
    private createMenu(n: number) {
        this.canvas.changeSite(1)
        window.onkeydown = (e) => this.serviceMenu(e, n)
        this.startingAudio.play()
    }

    private serviceMenu(e: KeyboardEvent, n: number) {
        if (e.key == "0") {
            this.isPlayerDead = false
            this.gameOver = false
            window.onkeydown = null
            n == 0 ? this.createGame() : this.createNewGame()
        }
    }
    private createGame() {
        this.loadRooms().then(() => {
            this.deadInterval = null
            window.onkeydown = null
            this.createRooms()
            this.currRoom = this.allRooms.find(r => r.pos.equals(new Vector2(2, 1)))
            this.player = new Player()
            this.currRoom.getTopField(2, 4).setEntity(this.player)
            this.controller = new PlayerController(this.player, this)
            this.startLoop()
        })
    }


    private async loadRooms() {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                await this.loadRoom(x, y)
            }
        }
    }

    private async loadRoom(x: number, y: number) {
        const l = 'ABCDEFGH'[y]
        await import(`../assets/levels/${l}${x}.json`).then(({ default: room }) => {
            this.roomsData.push({
                x: x,
                y: y,
                color: room.color,
                top: room.top,
                bottom: room.bottom,
            })
        })
    }

    private async createRooms() {
        for (let roomData of this.roomsData) {
            this.allRooms.push(new Room(roomData.top, roomData.bottom, roomData.color, new Vector2(roomData.x, roomData.y)))
        }
    }

    private startLoop() {
        let then = 0
        const render = (now: number) => {
            now *= 0.001  // convert to seconds
            const deltaTime = now - then
            then = now

            this.update(deltaTime)

            requestAnimationFrame(render)

        }
        requestAnimationFrame(render)

        const fixedDelta = 0.02
        setInterval(() => {
            this.fixedUpdate(fixedDelta)
        }, fixedDelta * 1000)
        this.statsInterval = setInterval(() => {
            this.changeStats(fixedDelta)
        }, fixedDelta * 1000)
        setInterval(() => {
            this.canvas.isEven = !this.canvas.isEven
        }, 500)
    }

    private fixedUpdate(deltaTime: number) {
        if (this.currRoom && this.currRoom.movedField) {
            const distanceToDestination = this.currRoom.movedField.pos.distanceTo(this.currRoom.movedFieldDestination)
            let currStep = this.player.rotation.multiply(1 * deltaTime)
            if (distanceToDestination > currStep.length) {
                this.currRoom.movedField.move(this.player.rotation.multiply(1 * deltaTime))
            } else {
                this.currRoom.movedField.pos = this.currRoom.movedFieldDestination
            }
            if (this.currRoom.movedFieldDestination.equals(this.currRoom.movedField.pos)) {
                this.currRoom.movedFieldDestination = null
                this.currRoom.movedField = null
                this.controller.moveInQueue = false
                this.player.animationTexture = 0
            }
        }
        if (this.currRoom && this.currRoom.pos.equals(new Vector2(3, 0))
            && this.warheadNumber == 4) {
            this.gameWin = true
            this.warheadNumber = 0
            this.startingAudio.play()
        }
    }
    private changeStats(deltaTime: number) {
        if (!this.isPlayerDead && !this.stoped && !this.gameWin && this.currRoom) {

            Stats.time -= deltaTime
            this.timeSinceLastConsumableChange += deltaTime
            if (this.timeSinceLastConsumableChange >= 0.3) {
                this.timeSinceLastConsumableChange = 0
                if (this.currRoom.fields.find(f => f.entity instanceof Block && f.entity.type == "radiator")) {
                    if (this.isEven) {
                        Stats.water -= 20
                        this.radiatorInRoom.play()
                    }
                    else Stats.water -= 1
                }
                else Stats.water -= 1
                if (this.currPickup && this.currPickup.name == "warhead") this.isEven ? Stats.food -= 7 : Stats.food -= 4
                else this.currPickup ? Stats.food -= 4 : Stats.food -= 1
                this.isEven = !this.isEven
                if (Stats.water < 0 || Stats.food < 0) {
                    this.gameOver = true
                }
                this.gAnimation += 1
                if (this.gAnimation > 2)
                    this.gAnimation = 0
            }
        }

    }

    private update(deltaTime: number) {
        if (!this.gameOver && !this.gameWin) {
            if (this.currRoom)
                this.canvas.draw(this.currRoom.fields)
            if (this.currRoom.movedField) {
                this.player.updateWalkingAnimationTexture(deltaTime)
            }
            if (this.isPlayerDead && !this.deadInterval) {
                setTimeout(() => {
                    clearInterval(this.deadInterval)
                    this.currRoom.color = "green"
                    this.currRoom.fields.map(f => f.color = 'green')
                    setTimeout(() => {
                        this.currRoom.color = "white"
                        this.currRoom.fields.map(f => f.color = 'white')
                    }, 100)
                    setTimeout(() => {
                        this.currRoom.color = "yellow"
                        this.currRoom.fields.map(f => f.color = 'yellow')
                    }, 200)
                    setTimeout(() => {
                        this.currRoom.color = "pink"
                        this.currRoom.fields.map(f => f.color = 'pink')
                    }, 300)
                    setTimeout(() => {
                        this.currRoom.color = "red"
                        this.currRoom.fields.map(f => f.color = 'red')
                    }, 400)
                    setTimeout(() => {
                        this.currRoom.color = "blue"
                        this.currRoom.fields.map(f => f.color = 'blue')
                    }, 500)
                    setTimeout(() => {
                        this.currRoom.color = "blue"
                        this.currRoom.fields.map(f => f.color = 'blue')
                    }, 500)
                    setTimeout(() => {
                        this.gameOver = true
                    }, 600)
                }, 4000)
                this.deadInterval = setInterval(() => { })
                setTimeout(() => {
                    this.deadInterval = setInterval(() => {
                        this.player.rotateRight()

                    }, 140)
                }, 2275)
            }


        }
        else if (this.gameOver) {
            if (this.currRoom) {

                this.canvas.end()
                window.onkeydown = () => this.newGame()
            }

        }
        else if (this.gameWin) {
            if (this.currRoom) {
                this.canvas.win()
                window.onkeydown = () => {
                    this.gameWin = false
                    this.gameOver = true
                }
            }
        }
    }
    newGame() {
        this.allRooms = []
        this.currRoom = null
        Stats.reset()
        this.warheadNumber = 0
        this.currPickup = null
        this.timeSinceLastConsumableChange = 0
        this.createMenu(1)

    }
    createNewGame() {
        this.loadRooms().then(() => {
            this.deadInterval = null
            window.onkeydown = null
            this.gameWin = false
            this.createRooms()
            this.currRoom = this.allRooms.find(r => r.pos.equals(new Vector2(2, 1)))
            this.player = new Player()
            this.currRoom.getTopField(5, 3).setEntity(this.player)
            this.controller = new PlayerController(this.player, this)
        })
    }

}