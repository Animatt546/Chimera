import Block from "./Block"
import Game from "./Game"
import Player from "./Player"
import Room from "./Room"
import Vector2 from "./Vector2"
import { BlockTexturesMap, pickUps } from './BlockData'
import Field from "./Field"
import WalkingAudio from './../assets/sounds/walking.mp3'
import RotatingAudio from './../assets/sounds/rotating.mp3'
import WalkWithItemAudio from './../assets/sounds/walkWithItem.mp3'
import RotateWithItemAudio from './../assets/sounds/rotateWithItem.mp3'
import useItemAudio from './../assets/sounds/useItem.mp3'
import getItemAudio from './../assets/sounds/getItem.mp3'
import getWarheadAudio from './../assets/sounds/getWarhead.mp3'
import placingWarheadAudio from './../assets/sounds/placingWarhead.mp3'
import dieAudio from './../assets/sounds/die.mp3'


type Rotate = "left" | "right"

export default class PlayerController {
    private player: Player
    private room: Room
    private game: Game
    private rotate: Rotate
    private walking = new Audio(WalkingAudio)
    private rotating = new Audio(RotatingAudio)
    private walkWithItem = new Audio(WalkWithItemAudio)
    private rotateWithItem = new Audio(RotateWithItemAudio)
    private useItem = new Audio(useItemAudio)
    private getItem = new Audio(getItemAudio)
    private getWarhead = new Audio(getWarheadAudio)
    private placingWarhead = new Audio(placingWarheadAudio)
    private die = new Audio(dieAudio)
    private move = false
    moveInQueue = false;
    pickUps = [
        'water',
        'bread',
        'spanner',
        'warhead',
        'torch',
        'key',
        'pyramid']
    usableBlocks = [
        'pandora',
        'radiator',
        'toaster',
        'hourglass',
        'door',
        'pc',
        'gate']
    constructor(player: Player, game: Game) {
        this.player = player
        this.game = game
        window.onkeydown = this.keyDown
        window.onkeyup = this.keyUp
        setInterval(() => this.executeMovement(), 200)
    }
    executeMovement() {
        if (this.game.currRoom && !this.game.currRoom.movedField && !this.game.isPlayerDead && this.game.currRoom && !this.game.stoped) {
            if (this.rotate == "left") {
                this.player.rotateLeft()
                if (this.game.currPickUp)
                    this.rotateWithItem.play()
                else
                    this.rotating.play()
            }
            else if (this.rotate == "right") {
                this.player.rotateRight()
                if (this.game.currPickUp)
                    this.rotateWithItem.play()
                else
                    this.rotating.play()
            }
            else if (this.move || this.moveInQueue) {
                const playerField = this.game.currRoom.fields.find(f => f.entity instanceof Player)
                const nextFields = this.game.currRoom.fields.filter(f => f.pos.equals(playerField.pos.add(this.player.rotation)))
                if (nextFields.length == 0) {
                    this.goToAnotherRoom()
                }
                else if (nextFields.every(f => !f.entity)) {
                    const nextField = nextFields.find(f => f.layer == "top")
                    nextField.entity = this.player
                    playerField.entity = null
                    this.game.currRoom.setMoving(nextField.pos, nextField)
                    nextField.pos = playerField.pos
                    if (this.game.currPickUp)
                        this.walkWithItem.play()
                    else
                        this.walking.play()
                }
                this.moveInQueue = false
            }
        }
        this.moveInQueue = null
        this.rotate = null
    }

    private goToAnotherRoom() {
        const playerField = this.game.currRoom.fields.find(f => f.entity instanceof Player)
        this.game.currRoom = this.game.allRooms.find(r => r.pos.equals(this.player.rotation.add(this.game.currRoom.pos)))
        this.game.currRoom = this.game.currRoom
        if (this.player.rotation.equals(Vector2.down)) this.game.currRoom.getTopField(playerField.pos.x, 0).entity = this.player
        else if (this.player.rotation.equals(Vector2.up)) this.game.currRoom.getTopField(playerField.pos.x, 6).entity = this.player
        else if (this.player.rotation.equals(Vector2.left)) this.game.currRoom.getTopField(6, playerField.pos.y).entity = this.player
        else if (this.player.rotation.equals(Vector2.right)) this.game.currRoom.getTopField(0, playerField.pos.y).entity = this.player
        playerField.entity = null
        if (this.game.currRoom.fields.find(f => f.entity instanceof Block && f.entity.type == "radiator"))
            this.game.canvas.getLettersToDraw("The radiator does not help your water supply.")

    }

    private keyDown = (e: KeyboardEvent) => {
        if (e.key == "ArrowLeft") this.rotate = "left"
        if (e.key == "ArrowRight") this.rotate = "right"
        if (e.key == "ArrowUp") {
            this.move = true
            this.moveInQueue = true
        }
        if (e.code == "Space") this.getPickUp()
    }
    private keyUp = (e: KeyboardEvent) => {
        if (e.key == "ArrowUp") this.move = false
    }
    private getPickUp() {
        if (!this.game.currRoom.movedField && !this.game.isPlayerDead && this.game.currRoom) {
            const playerField = this.game.currRoom.fields.find(f => f.entity instanceof Player)
            const nextField = this.game.currRoom.fields.find(f => f.pos.equals(playerField.pos.add(this.player.rotation)) && f.layer == "bottom" && f.entity)
            let entity
            if (nextField && nextField.entity)
                entity = nextField.entity as Block
            if (entity && this.usableBlocks.includes(entity.type)) {
                if (entity.type == "gate")
                    this.usingUsable("spanner", 25, "You have eliminated an electric fence.", nextField)

                if (entity.type == "toaster") {

                    if (this.game.currPickUp == pickUps.get("bread")) {
                        this.game.score += 25
                        this.game.canvas.getLettersToDraw("You have eliminated a toaster, but there is order in chaos, for in its place appears a life saving drink.")
                        nextField.setEntity(new Block('water'))
                        this.useItem.play()

                    }
                    else {
                        this.game.isPlayerDead = true
                        this.die.play()
                    }
                }
                if (entity.type == "hourglass")
                    this.usingUsable("pyramid", 25, "You have eliminated a reverse flowing hourglass.", nextField)


                if (entity.type == "door") {
                    if (this.game.currPickUp == pickUps.get("key")) {
                        this.game.score += 20
                        this.game.canvas.getLettersToDraw("You have unlocked a door.")
                        nextField.entity = null
                        this.useItem.play()

                    }
                    else {
                        this.game.canvas.getLettersToDraw("This is a door.")
                    }
                }
                if (entity.type == "pandora")
                    this.usingUsable("key", 25, "You have eliminated a box that used to belong to pandora.", nextField)
                if (entity.type == "radiator") {
                    this.game.isPlayerDead = true
                    this.die.play()
                }
                if (entity.type == "pc") {
                    if (this.game.currRoom.pos.equals(new Vector2(0, 0)))
                        this.game.canvas.getLettersToDraw("Find a static object besides food or water.")
                    else this.game.canvas.getLettersToDraw("You must find a padlock.")
                    this.game.score += 25
                    this.useItem.play()
                    nextField.entity = null
                }

            }

            else {
                if (this.game.currPickUp == pickUps.get("water")) {
                    this.game.canvas.getLettersToDraw("The mug had a drink in it.")
                    this.game.water += 1500
                    this.game.currPickUp = null
                    this.game.score += 5
                    this.useItem.play()
                }
                else if (this.game.currPickUp == pickUps.get("bread")) {
                    this.game.canvas.getLettersToDraw("The bread raises your food reserves.")
                    this.game.food += 1500
                    this.game.currPickUp = null
                    this.game.score += 5
                    this.useItem.play()
                }
                else if (this.game.currPickUp == pickUps.get("warhead") &&
                    (this.game.currRoom.pos.equals(new Vector2(4, 5)) ||
                        this.game.currRoom.pos.equals(new Vector2(5, 6)) ||
                        this.game.currRoom.pos.equals(new Vector2(7, 1)) ||
                        this.game.currRoom.pos.equals(new Vector2(5, 1))

                    ) &&
                    playerField.pos.y == 1 &&
                    this.game.currRoom.fields.find((f) => f.entity instanceof Block && f.entity.type == 'bread')) {
                    this.game.canvas.getLettersToDraw("You have activated a warhead and the bread substantically increased.")
                    this.placingWarhead.play()
                    this.game.stoped = true

                    this.placingWarhead.onended = () => {
                        this.game.score += 175
                        this.game.food += 2500
                        this.game.currPickUp = null
                        this.game.warheadNumber += 1
                        this.game.stoped = false
                        let breadField = this.game.currRoom.fields.find((f) => f.entity instanceof Block && f.entity.type == 'bread')
                        breadField.entity = new Block('warhead')
                    }
                }
                else {
                    if (nextField && entity) {
                        if (this.pickUps.includes(entity.type)) {
                            if (entity.type == 'warhead' && (this.game.currRoom.pos.equals(new Vector2(4, 5)) ||
                                this.game.currRoom.pos.equals(new Vector2(5, 6)) ||
                                this.game.currRoom.pos.equals(new Vector2(7, 1)) ||
                                this.game.currRoom.pos.equals(new Vector2(5, 1))

                            )) { }
                            else {
                                this.game.currPickUp = pickUps.get(entity.type)
                                nextField.entity = null
                                this.awardPointsAndSubtitlesAfterPickUp()
                                this.game.canvas.getLettersToDraw("Your food is running out faster.")
                                if (this.game.currPickUp == pickUps.get("warhead"))
                                    this.getWarhead.play()
                                else this.getItem.play()
                            }
                        }
                    }
                }
            }
        }
    }
    usingUsable(pickup: string, score: number, text: string, nextField: Field) {
        if (this.game.currPickUp == pickUps.get(pickup)) {
            this.game.score += score
            this.game.canvas.getLettersToDraw(text)
            nextField.entity = null
            this.useItem.play()
        }
        else {
            this.game.isPlayerDead = true
            this.die.play()
        }
    }
    awardPointsAndSubtitlesAfterPickUp() {
        if (this.game.currPickUp == pickUps.get("water")) {
            this.game.score += 15
            this.game.canvas.getLettersToDraw("This is a mug.")

        }
        else if (this.game.currPickUp == pickUps.get("bread")) {
            this.game.score += 10
            this.game.canvas.getLettersToDraw("This is a loaf of bread.")
        }
        else if (this.game.currPickUp == pickUps.get("spanner")) {
            this.game.score += 75
            this.game.canvas.getLettersToDraw("You have found a spanner.")
        }
        else if (this.game.currPickUp == pickUps.get("warhead")) {
            this.game.score += 100
            this.game.canvas.getLettersToDraw("You have formed a warhead, take it to a blue room, but hurry...")
        }
        else if (this.game.currPickUp == pickUps.get("torch")) {
            this.game.score += 75
            this.game.canvas.getLettersToDraw("You have found a torch.")
        }
        else if (this.game.currPickUp == pickUps.get("key")) {
            this.game.score += 75
            this.game.canvas.getLettersToDraw("You have found a key.")
        }
        else if (this.game.currPickUp == pickUps.get("pyramid")) {
            this.game.score += 75
            this.game.canvas.getLettersToDraw("You have found a pyramid.")
        }
    }
}