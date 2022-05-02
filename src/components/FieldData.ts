import { BlockType } from "./BlockData"

export default class Field {
    x: number
    y: number
    value: BlockType
    constructor(x: number, y: number, value: BlockType) {
        this.x = x
        this.y = y
        this.value = value
    }
}