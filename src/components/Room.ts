import Block from "./Block";
import Field from "./Field";
import FieldData from "./FieldData";
import Vector2 from "./Vector2";

export default class Room {
    fields: Field[] = []
    width = 7
    height = 7
    color: string
    movedFieldDestination: Vector2 | null = null
    movedField: Field = null
    pos: Vector2
    constructor(topFieldDataList: FieldData[], bottomFieldDataList: FieldData[], color: string, pos: Vector2) {
        this.color = color
        this.pos = pos
        this.createFields()
        this.setFields(topFieldDataList, bottomFieldDataList)
    }

    createFields() {
        for (let row = 0; row < this.height; row++) {
            for (let column = 0; column < this.width; column++) {
                this.fields.push(new Field(column, row, this.color, "top"))
                this.fields.push(new Field(column, row, this.color, "bottom"))
            }
        }
    }

    setFields(topFieldDataList: FieldData[], bottomFieldDataList: FieldData[]) {
        for (let fd of topFieldDataList) {
            this.fields.find(f => f.pos.equals(new Vector2(fd.x, fd.y)) && f.layer == "top")?.setEntity(new Block(fd.value))
        }
        for (let fd of bottomFieldDataList) {
            this.fields.find(f => f.pos.equals(new Vector2(fd.x, fd.y)) && f.layer == "bottom")?.setEntity(new Block(fd.value))
        }
    }

    getTopField(x: number, y: number) {
        const pos = new Vector2(x, y)
        return this.fields.find(f => f.pos.equals(pos) && f.layer == "top")
    }
    getBottomField(x: number, y: number) {
        const pos = new Vector2(x, y)
        return this.fields.find(f => f.pos.equals(pos) && f.layer == "bottom")
    }

    setMoving(cords: Vector2, f: Field) {
        this.movedFieldDestination = cords
        this.movedField = f
    }
}