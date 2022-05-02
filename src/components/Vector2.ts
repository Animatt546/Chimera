export default class Vector2 {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    static get right() {
        return new Vector2(1, 0)
    }

    static get left() {
        return new Vector2(-1, 0)
    }

    static get up() {
        return new Vector2(0, -1)
    }

    static get down() {
        return new Vector2(0, 1)
    }

    equals(v: Vector2) {
        return this.x == v.x && this.y == v.y
    }

    add(v: Vector2) {
        return new Vector2(this.x + v.x, this.y + v.y)
    }

    substract(v: Vector2) {
        return new Vector2(this.x - v.x, this.y - v.y)
    }

    multiply(value: number) {
        return new Vector2(this.x * value, this.y * value)
    }

    distanceTo(v: Vector2) {
        const difference = v.substract(this)
        return difference.length
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    get clone() {
        return new Vector2(this.x, this.y)
    }
}