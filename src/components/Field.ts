import Entity from "./Entity"
import { BlockColorsMap } from './BlockData'
import Vector2 from "./Vector2"
type FieldLayer = "bottom" | "top"

export default class Field {
    pos: Vector2
    color: string
    layer: FieldLayer
    entity: Entity

    constructor(x: number, y: number, color: string, layer: FieldLayer) {
        this.pos = new Vector2(x, y)
        this.color = color
        this.layer = layer
    }

    get colorNumber() {
        return BlockColorsMap.get(this.color)
    }

    get isoPos() {
        const isoX = this.pos.x + this.pos.y
        const isoY = (this.pos.y - this.pos.x) / 2
        return new Vector2(isoX, isoY)
    }

    setEntity(entity: Entity) {
        this.entity = entity
    }
    move(pos: Vector2) {
        this.pos = this.pos.add(pos)
    }

}