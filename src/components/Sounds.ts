import WalkingAudio from './../assets/sounds/walking.mp3'
import RotatingAudio from './../assets/sounds/rotating.mp3'
import WalkWithItemAudio from './../assets/sounds/walkWithItem.mp3'
import RotateWithItemAudio from './../assets/sounds/rotateWithItem.mp3'
import useItemAudio from './../assets/sounds/useItem.mp3'
import getItemAudio from './../assets/sounds/getItem.mp3'
import getWarheadAudio from './../assets/sounds/getWarhead.mp3'
import placingWarheadAudio from './../assets/sounds/placingWarhead.mp3'
import dieAudio from './../assets/sounds/die.mp3'
export default abstract class Sounds {
    static walking = new Audio(WalkingAudio)
    static rotating = new Audio(RotatingAudio)
    static walkWithItem = new Audio(WalkWithItemAudio)
    static rotateWithItem = new Audio(RotateWithItemAudio)
    static useItem = new Audio(useItemAudio)
    static getItem = new Audio(getItemAudio)
    static getWarhead = new Audio(getWarheadAudio)
    static placingWarhead = new Audio(placingWarheadAudio)
    static die = new Audio(dieAudio)
}