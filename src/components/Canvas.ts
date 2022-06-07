import Field from "./Field";
import Player from "./Player";
import Vector2 from './Vector2';
import Game from "./Game";
import lettersToNumbers from "./lettersToNumbers";
import { pickUps } from "./BlockData";
import Block from "./Block";
import Assets from "./Assets"

export default class Canvas {
    private canvas: HTMLCanvasElement = document.createElement('canvas')
    private context = this.canvas.getContext('2d')
    private textureSize = new Vector2(32, 32)
    private game: Game
    private moveLetter: NodeJS.Timer
    private letterPlace = 0
    private lettersToDraw: string[] = []
    private chimeraPx = 0
    private counter = 0
    isEven = false
    keyboardEven = false


    get gridSize() {
        return this.textureSize.multiply(0.5)
    }

    constructor(parentElement: HTMLElement, game: Game) {
        this.game = game
        this.context.canvas.width = 320
        this.context.canvas.height = 240
        parentElement.append(this.canvas)
        Assets.load(() => {
            this.context.imageSmoothingEnabled = false;
            this.drawSite(Assets.start)
        })
    }
    changeSite(n: number) {
        if (n == 1)
            this.drawSite(Assets.menuWhenSound)
        if (n == 2)
            this.drawSite(Assets.menu)
    }

    drawSite(image: HTMLImageElement) {
        this.context.drawImage(image,
            0,
            0,
        );


    }

    end() {
        this.drawSite(Assets.gameOver)
        let numbToDraw = this.game.score.toString()
        while (numbToDraw.length < 4) {
            numbToDraw = "0" + numbToDraw
        }
        for (let d = 0; d < 4; d++) {
            this.context.drawImage(Assets.gameOverNumbers,
                parseInt(numbToDraw[d]) * 8,
                this.isEven ? 7 : 0,
                8,
                7,
                192 + d * 8,
                96,
                8,
                8
            );
        }
    }

    win() {
        this.drawSite(Assets.gameWin)
        let numbToDraw = this.game.score.toString()
        while (numbToDraw.length < 4) {
            numbToDraw = "0" + numbToDraw
        }
        for (let d = 0; d < 4; d++) {
            this.context.drawImage(Assets.gameWinNumbers,
                parseInt(numbToDraw[d]) * 16,
                0,
                16,
                9,
                177 + d * 16,
                95,
                16,
                9
            );
        }
    }

    draw(fields: Field[]) {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let f of this.getAllFieldsInDrawOrder(fields)) {
            if (f.entity instanceof Player) {
                this.drawPlayer(f)
            } else {
                if (f.entity instanceof Block && f.entity.type == 'gate') {
                    let height = f.isoPos.y * this.gridSize.x + this.canvas.height / 4
                    if (f.layer == "top") {
                        height -= this.gridSize.x - 1
                    }
                    this.context.drawImage(Assets.gateAnimation,
                        this.game.gAnimation * 32,
                        f.colorNumber * this.textureSize.x,
                        this.textureSize.y,
                        this.textureSize.x,
                        Math.round((f.isoPos.x * this.gridSize.y) / 2) * 2 + 7 * 32 / 5,
                        Math.round(height),
                        this.textureSize.y,
                        this.textureSize.x
                    );
                } else
                    this.drawBlock(f)
            }
        }
        if ((this.game.currRoom.pos.equals(new Vector2(4, 5)) ||
            this.game.currRoom.pos.equals(new Vector2(5, 6)) ||
            this.game.currRoom.pos.equals(new Vector2(7, 1)) ||
            this.game.currRoom.pos.equals(new Vector2(5, 1))

        ) && (this.game.currPickUp == pickUps.get("warhead") || this.game.currRoom.fields.find((f) => f.entity instanceof Block && f.entity.type == 'warhead'))) {
            var imageData = this.context.getImageData(0, 0, this.context.canvas.width, 200);
            for (var i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i] == 0 &&
                    imageData.data[i + 1] == 0 &&
                    imageData.data[i + 2] == 0
                ) {
                    imageData.data[i] = 255;
                    imageData.data[i + 1] = 0;
                    imageData.data[i + 2] = 0;
                }
            }
            this.context.putImageData(imageData, 0, 0);
        }
        if (this.game.currRoom.pos.equals(new Vector2(3, 0))
            && this.game.warheadNumber == 4) {
            var imageData = this.context.getImageData(0, 0, this.context.canvas.width, 200);
            for (var i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i] == 0 &&
                    imageData.data[i + 1] == 0 &&
                    imageData.data[i + 2] == 0
                ) {
                    imageData.data[i] = 0;
                    imageData.data[i + 1] = 255;
                    imageData.data[i + 2] = 0;
                }
            }
            this.context.putImageData(imageData, 0, 0);
        }

        this.drawHud()
        this.drawConsumableCout(this.game.water, 0)
        this.drawConsumableCout(this.game.food, 1)
        this.drawStatsCout(Math.floor(this.game.time), 0)
        this.drawStatsCout(this.game.score, 1)
        if (this.game.currPickUp) this.drawPickUp(this.game.currPickUp)
        if (this.lettersToDraw.length > 0) this.drawSubtitles()
    }

    private getFieldsSorted(fields: Field[]) {
        return [
            ...fields.filter(f => f.layer == "bottom").sort((a, b) => - a.pos.x + a.pos.y + b.pos.x - b.pos.y),
            ...fields.filter(f => f.layer == "top").sort((a, b) => - a.pos.x + a.pos.y + b.pos.x - b.pos.y),
        ].filter(f => f.entity)
    }

    private getFieldsToRedraw(fields: Field[]) {
        const playerField = fields.find((f) => f.entity instanceof Player)
        return this.getFieldsSorted(fields).filter(f => f.pos.x < playerField.pos.x - 0.89 || f.pos.y > playerField.pos.y + 0.89)
    }

    private getAllFieldsInDrawOrder(fields: Field[]) {
        return [
            ...this.getFieldsSorted(fields),
            fields.find(f => f.entity instanceof Player),
            ...this.getFieldsToRedraw(fields),
        ]
    }

    private drawBlock(f: Field) {
        let height = f.isoPos.y * this.gridSize.x + this.canvas.height / 4
        if (f.layer == "top") {
            height -= this.gridSize.x - 1
        }
        this.context.drawImage(f.entity.textureImage,
            f.entity.textureColumn * this.textureSize.y,
            f.colorNumber * this.textureSize.x,
            this.textureSize.y,
            this.textureSize.x,
            Math.round((f.isoPos.x * this.gridSize.y) / 2) * 2 + 7 * 32 / 5,
            Math.round(height),
            this.textureSize.y,
            this.textureSize.x
        );
    }
    private drawPlayer(f: Field) {
        if (f.entity instanceof Player) {
            this.context.drawImage(f.entity.textureImage,
                (f.entity.textureColumn + f.entity.animationTexture) * 26,
                f.colorNumber * 32,
                26,
                32,
                Math.round((f.isoPos.x * this.gridSize.y) / 2) * 2 + 7 * 32 / 5,
                Math.round(f.isoPos.y * this.gridSize.x + this.canvas.height / 4 - this.gridSize.x + 7),
                this.textureSize.y,
                this.textureSize.x * 1.25);
        }
    }
    private drawHud() {
        this.context.drawImage(Assets.hud,
            0,
            0,
            320,
            96,
            0,
            this.context.canvas.height - 105,
            320,
            96
        );
    }
    private drawConsumableCout(number: number, consumable: number,) {
        let numbToDraw = number.toString()
        while (numbToDraw.length < 4) {
            numbToDraw = "0" + numbToDraw
        }

        for (let d = 0; d < 4; d++) {
            this.drawDigitConsumable(parseInt(numbToDraw[d]), consumable, d * 8)
        }
    }
    private drawDigitConsumable(digit: number, consumable: number, x: number) {
        this.context.drawImage(Assets.statsFoodWater,
            digit * 8,
            consumable * 7,
            8,
            7,
            consumable == 0 ? 136 + x : 232 + x,
            167,
            8,
            7
        );
    }
    private drawStatsCout(number: number, stats: number,) {
        let numbToDraw = number.toString()
        while (numbToDraw.length < 4) {
            numbToDraw = "0" + numbToDraw
        }

        for (let d = 0; d < 4; d++) {
            this.drawDigitStats(parseInt(numbToDraw[d]), stats, d * 16)
        }
    }
    private drawDigitStats(digit: number, stats: number, x: number) {
        this.context.drawImage(Assets.statsPointsTime,
            digit * 16,
            stats * 9,
            16,
            9,
            stats == 0 ? 216 + x : 120 + x,
            182,
            16,
            9
        );
    }
    private drawPickUp(n: number) {
        this.context.drawImage(Assets.pickUp,
            n * 32,
            0,
            32,
            32,
            50,
            160,
            32,
            32
        );
    }
    private drawSubtitles() {
        if (!this.moveLetter)
            this.moveLetter = setInterval(() => {
                if (this.chimeraPx != 0) {
                    if (this.counter > 20) {
                        this.chimeraPx -= 1
                        this.letterPlace += 1
                        if (this.letterPlace >= 112) {
                            this.letterPlace = 0
                            this.counter = 0
                        }
                    }
                    else {
                        this.counter++
                    }
                } else {
                    this.letterPlace += 1
                    if (this.letterPlace >= 8) {
                        this.letterPlace = 0
                        this.lettersToDraw.shift()
                        if (this.lettersToDraw.length == 14) {
                            clearInterval(this.moveLetter)
                            this.moveLetter = null
                            this.lettersToDraw = []
                        }
                    }
                }
            }, 25)
        if (this.chimeraPx == 0)
            for (let i = 0; i < 17; i++) {
                this.drawLetter(this.lettersToDraw[i], 104 + i * 8 - this.letterPlace)
            }
        else {
            for (let i = 0; i < 17; i++) {
                this.drawLetter(this.lettersToDraw[i], this.chimeraPx + 104 + i * 8)
            }
            this.drawChimeraSubtitle()
        }
        this.context.fillRect(80, 143, 24, 8)
        this.context.fillRect(216, 143, 104, 8)
    }
    getLettersToDraw(el: string) {
        if (this.lettersToDraw.length == 0) {
            this.chimeraPx = 112
            this.lettersToDraw.push("blank")
        }

        for (let letter of el.toLowerCase()) {
            letter != " " ? this.lettersToDraw.push(letter) : this.lettersToDraw.push("blank")
        }
        for (let i = 0; i < 17; i++)
            this.lettersToDraw.push("blank")
    }
    private drawLetter(letter: string, pxFromLeft: number) {
        this.context.drawImage(Assets.letter,
            lettersToNumbers.get(letter) * 8,
            0,
            8,
            8,
            pxFromLeft,
            143,
            8,
            8
        );
    }
    private drawChimeraSubtitle() {
        this.context.drawImage(Assets.chimeraSubtitle,
            112 - this.chimeraPx,
            0,
            112,
            8,
            104,
            143,
            112,
            8
        );
    }
}