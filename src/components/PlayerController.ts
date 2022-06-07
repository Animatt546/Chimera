import Block from "./Block"
import Game from "./Game"
import Player from "./Player"
import Room from "./Room"
import Vector2 from "./Vector2"
import { BlockTexturesMap, pickups } from './BlockData'
import Field from "./Field"
import Stats from './Stats'
import Sounds from './Sounds'

type Rotate = "left" | "right"

export default class PlayerController {
    private player: Player
    private room: Room
    private game: Game
    private rotate: Rotate

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
                if (this.game.currPickup)
                    Sounds.rotateWithItem.play()
                else
                    Sounds.rotating.play()
            }
            else if (this.rotate == "right") {
                this.player.rotateRight()
                if (this.game.currPickup)
                    Sounds.rotateWithItem.play()
                else
                    Sounds.rotating.play()
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
                    if (this.game.currPickup)
                        Sounds.walkWithItem.play()
                    else
                        Sounds.walking.play()
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
            let block: Block
            if (nextField && nextField.entity)
                block = nextField.entity as Block
            if (block && this.usableBlocks.includes(block.type)) {
                if (block.type == "gate")
                    this.useUsable("spanner", 25, "You have eliminated an electric fence.", nextField)

                if (block.type == "toaster") {
                    if (this.game.currPickup.name == "bread") {
                        Stats.points += 25
                        this.game.canvas.getLettersToDraw("You have eliminated a toaster, but there is order in chaos, for in its place appears a life saving drink.")
                        nextField.setEntity(new Block('water'))
                        Sounds.useItem.play()

                    }
                    else {
                        this.game.isPlayerDead = true
                        Sounds.die.play()
                    }
                }
                if (block.type == "hourglass")
                    this.useUsable("pyramid", 25, "You have eliminated a reverse flowing hourglass.", nextField)


                if (block.type == "door") {
                    if (this.game.currPickup.name == "key") {
                        Stats.points += 20
                        this.game.canvas.getLettersToDraw("You have unlocked a door.")
                        nextField.entity = null
                        Sounds.useItem.play()

                    }
                    else {
                        this.game.canvas.getLettersToDraw("This is a door.")
                    }
                }
                if (block.type == "pandora")
                    this.useUsable("key", 25, "You have eliminated a box that used to belong to pandora.", nextField)
                if (block.type == "radiator") {
                    this.game.isPlayerDead = true
                    Sounds.die.play()
                }
                if (block.type == "pc") {
                    if (this.game.currRoom.pos.equals(new Vector2(0, 0)))
                        this.game.canvas.getLettersToDraw("Find a static object besides food or water.")
                    else this.game.canvas.getLettersToDraw("You must find a padlock.")
                    Stats.points += 25
                    Sounds.useItem.play()
                    nextField.entity = null
                }

            }

            else {
                if (this.game.currPickup) {
                    if (this.game.currPickup.name == "water") {
                        this.game.canvas.getLettersToDraw("The mug had a drink in it.")
                        Stats.water += 1500
                        this.game.currPickup = null
                        Stats.points += 5
                        Sounds.useItem.play()
                    }
                    else if (this.game.currPickup.name == "bread") {
                        this.game.canvas.getLettersToDraw("The bread raises your food reserves.")
                        Stats.food += 1500
                        this.game.currPickup = null
                        Stats.points += 5
                        Sounds.useItem.play()
                    }
                    else if (this.game.currPickup.name == "warhead" &&
                        (this.game.currRoom.pos.equals(new Vector2(4, 5)) ||
                            this.game.currRoom.pos.equals(new Vector2(5, 6)) ||
                            this.game.currRoom.pos.equals(new Vector2(7, 1)) ||
                            this.game.currRoom.pos.equals(new Vector2(5, 1))

                        ) &&
                        playerField.pos.y == 1 &&
                        this.game.currRoom.fields.find((f) => f.entity instanceof Block && f.entity.type == 'bread')) {
                        this.game.canvas.getLettersToDraw("You have activated a warhead and the bread substantically increased.")
                        Sounds.placingWarhead.play()
                        this.game.stoped = true

                        Sounds.placingWarhead.onended = () => {
                            Stats.points += 175
                            Stats.food += 2500
                            this.game.currPickup = null
                            this.game.warheadNumber += 1
                            this.game.stoped = false
                            let breadField = this.game.currRoom.fields.find((f) => f.entity instanceof Block && f.entity.type == 'bread')
                            breadField.entity = new Block('warhead')
                        }
                    }
                }
                else {
                    if (nextField && block) {
                        if (this.pickUps.includes(block.type)) {
                            if (block.type == 'warhead' && (this.game.currRoom.pos.equals(new Vector2(4, 5)) ||
                                this.game.currRoom.pos.equals(new Vector2(5, 6)) ||
                                this.game.currRoom.pos.equals(new Vector2(7, 1)) ||
                                this.game.currRoom.pos.equals(new Vector2(5, 1))

                            )) { }
                            else {
                                this.game.currPickup = pickups.find(el => el.name == block.type)
                                console.log(this.game.currPickup)
                                nextField.entity = null
                                this.awardPointsAndSubtitlesAfterPickUp()
                                this.game.canvas.getLettersToDraw("Your food is running out faster.")
                                if (this.game.currPickup.name == "warhead")
                                    Sounds.getWarhead.play()
                                else Sounds.getItem.play()
                            }
                        }
                    }
                }
            }
        }
    }
    useUsable(pickup: string, score: number, text: string, nextField: Field) {
        if (this.game.currPickup && this.game.currPickup.name == pickup) {
            Stats.points += score
            this.game.canvas.getLettersToDraw(text)
            nextField.entity = null
            Sounds.useItem.play()
        }
        else {
            this.game.isPlayerDead = true
            Sounds.die.play()
        }
    }
    awardPointsAndSubtitlesAfterPickUp() {
        Stats.points += this.game.currPickup.points
        this.game.canvas.getLettersToDraw(this.game.currPickup.text)
    }
}