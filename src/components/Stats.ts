export default abstract class Stats {
    static points = 0
    static time = 3000
    static water = 8499
    static food = 5499

    static reset() {
        Stats.points = 0
        Stats.time = 3000
        Stats.water = 8499
        Stats.food = 5499
    }
}