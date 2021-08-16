export class CollisionManager {
    characterPosition = null
    blockGenerator = null
    characterRotation = null
    _onCollision = null
    lastTime = 0

    called = false


    constructor(characterPosition, blocksArray, characterRotation) {
        this.characterPosition = characterPosition;
        this.blockGenerator = blocksArray;
        this.characterRotation = characterRotation;
    }

    updateCollision(interval) {

        const currentTime = new Date().getTime()
        if (currentTime - this.lastTime < (interval * 1000))
            return false

        this.lastTime = currentTime
        const Y_MAX = this.characterPosition.y + 1
        const Y_MIN = this.characterPosition.y - 1
        const X_MAX = this.characterPosition.x + 1
        const X_MIN = this.characterPosition.x - 1
        if (this.blockGenerator) {

            const hittedBlock = this.blockGenerator.getBlockArray().filter(block => block.position.y < this.characterPosition.y + 10).find(block =>
                    Y_MIN < block.position.y && block.position.y < Y_MAX
                    && X_MIN < block.position.x && block.position.x < X_MAX
                    && (
                        (block.name === "block_float" && Math.sin(this.characterRotation.x) * 5 > 4)    //Check impact with floating blocks
                        || (block.name === "block_wall")                                                //Check impact with wall black
                        || (block.name === "block" && this.characterPosition.z < 2)                     //Check impact with bottom block
                    )
            )
            if (this._onCollision && hittedBlock != undefined && !this.called) {
                this.called = true
                this._onCollision(hittedBlock)
            }
            return hittedBlock != undefined
        }
        return false
    }


    set onCollision(value) {
        this._onCollision = value;
    }

    removeUnusedBlock() {
        return this.blockGenerator.removeTheOnesBeforeYPosition(this.characterPosition.y + 10)
    }
}