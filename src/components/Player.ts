import Entity from "./Entity"
import texture from "../assets/playerTextures.png"
import Vector2 from "./Vector2"

export default class Player extends Entity {
    textureImage = new Image()
    rotation = Vector2.left
    animationTexture = 0
    constructor() {
        super()
        this.textureImage.src = texture
    }

    get textureColumn() {
        if (this.rotation.equals(Vector2.up)) {
            return 9
        } else if (this.rotation.equals(Vector2.right)) {
            return 0
        } else if (this.rotation.equals(Vector2.down)) {
            return 3
        } else if (this.rotation.equals(Vector2.left)) {
            return 6
        }
    }

    private nextAnimation() {
        this.animationTexture++
        if (this.animationTexture > 2) this.animationTexture = 0
    }

    timeSinceLastAnimationChange = 0
    frameTime = 1 / 6
    updateWalkingAnimationTexture(deltaTime: number) {
        this.timeSinceLastAnimationChange += deltaTime
        if (this.timeSinceLastAnimationChange >= this.frameTime) {
            this.timeSinceLastAnimationChange = 0
            this.nextAnimation()
        }
    }

    rotateLeft() {
        if (this.rotation.equals(Vector2.up)) {
            this.rotation = Vector2.left
        } else if (this.rotation.equals(Vector2.right)) {
            this.rotation = Vector2.up
        } else if (this.rotation.equals(Vector2.down)) {
            this.rotation = Vector2.right
        } else if (this.rotation.equals(Vector2.left)) {
            this.rotation = Vector2.down
        }
    }

    rotateRight() {
        if (this.rotation.equals(Vector2.up)) {
            this.rotation = Vector2.right
        } else if (this.rotation.equals(Vector2.right)) {
            this.rotation = Vector2.down
        } else if (this.rotation.equals(Vector2.down)) {
            this.rotation = Vector2.left
        } else if (this.rotation.equals(Vector2.left)) {
            this.rotation = Vector2.up
        }
    }
}