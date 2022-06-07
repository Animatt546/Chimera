export const BlockColorsMap = new Map([
    ['green', 0],
    ['yellow', 1],
    ['blue', 2],
    ['pink', 3],
    ['red', 4],
    ['white', 5],
])

export const BlockTexturesMap = new Map([
    ['block', 0],
    ['table', 1],
    ['L', 2],
    ['edge', 3],
    ['lasange', 4],
    ['crown', 5],
    ['black', 6],
    ['glasstable', 7],
    ['pandora', 8],
    ['spanner', 9],
    ['radiator', 10],
    ['bread', 11],
    ['toaster', 12],
    ['hourglass', 13],
    ['pyramid', 14],
    ['door', 15],
    ['key', 16],
    ['warhead', 17],
    ['water', 18],
    ['torch', 19],
    ['pc', 20],
    ['gate', 21],
])

export type BlockType =
    'block' |
    'table' |
    'L' |
    'edge' |
    'lasange' |
    'crown' |
    'black' |
    'glasstable' |
    'pandora' |
    'spanner' |
    'radiator' |
    'bread' |
    'toaster' |
    'hourglass' |
    'pyramid' |
    'door' |
    'key' |
    'warhead' |
    'water' |
    'torch' |
    'pc' |
    'gate'

export class Pickup {
    name: string
    id: number
    points: number
    text: string
    constructor(name: string, id: number, points: number, text: string) {
        this.name = name
        this.id = id
        this.points = points
        this.text = text
    }
}


export const pickups = [
    new Pickup("water", 0, 15, "This is a mug."),
    new Pickup("bread", 1, 10, "This is a loaf of bread."),
    new Pickup("spanner", 2, 75, "You have found a spanner."),
    new Pickup("warhead", 3, 100, "You have formed a warhead, take it to a blue room, but hurry..."),
    new Pickup("torch", 4, 75, "You have found a torch."),
    new Pickup("key", 5, 75, "You have found a key."),
    new Pickup("pyramid", 6, 75, "You have found a pyramid."),

]

