import hudImage from '../assets/hud.png'
import statsFoodWaterImage from '../assets/numbers w&f.png'
import statsPointsTimeImage from '../assets/numbers s&t.png'
import pickUpImage from '../assets/pickUps.png'
import startImage from '../assets/start.png'
import lettersImage from '../assets/letters.png'
import menuImage from '../assets/menu.png'
import gameOverImage from '../assets/gameOver.png'
import gameWinImage from '../assets/endScreen.png'
import gameOverNumbersImage from '../assets/gameOverNumbers.png'
import gameWinNumbersImage from '../assets/endNumbers.png'
import menuWhenSoundImage from '../assets/whenSoundMenu.png'
import chimeraSubtitleImage from '../assets/chimeraSubtitle.png'
import gateAnimationImage from '../assets/gateAnimations.png'
import keyboardImage from '../assets/keyboard.png'


export default abstract class Assets {
    static hud = new Image()
    static statsFoodWater = new Image()
    static statsPointsTime = new Image()
    static pickUp = new Image()
    static letter = new Image()
    static start = new Image()
    static gameOver = new Image()
    static gameWin = new Image()
    static gameOverNumbers = new Image()
    static gameWinNumbers = new Image()
    static gateAnimation = new Image()
    static keyboard = new Image()
    static menuWhenSound = new Image()
    static menu = new Image()
    static chimeraSubtitle = new Image()

    static async load(callback: () => void) {
        Assets.hud.src = hudImage
        Assets.statsFoodWater.src = statsFoodWaterImage
        Assets.statsPointsTime.src = statsPointsTimeImage
        Assets.start.src = startImage
        Assets.pickUp.src = pickUpImage
        Assets.letter.src = lettersImage
        Assets.menu.src = menuImage
        Assets.gameOver.src = gameOverImage
        Assets.gameWin.src = gameWinImage
        Assets.gameOverNumbers.src = gameOverNumbersImage
        Assets.gameWinNumbers.src = gameWinNumbersImage
        Assets.menuWhenSound.src = menuWhenSoundImage
        Assets.chimeraSubtitle.src = chimeraSubtitleImage
        Assets.gateAnimation.src = gateAnimationImage
        Assets.keyboard.src = keyboardImage
        Assets.start.onload = () => {
            callback()
        }
    }
}