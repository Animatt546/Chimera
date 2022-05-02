import { BlockType, BlockTexturesMap } from './BlockData'
import Entity from "./Entity";
import texture from "../assets/Textures.png"

export default class Block extends Entity {
    type: BlockType
    textureImage = new Image()

    constructor(type: BlockType) {
        super();
        this.type = type
        this.textureImage.src = texture
    }


    get textureColumn() {
        return BlockTexturesMap.get(this.type)
    }
}