import * as THREE from "../../lib/three.module.js";

const DISTANCES_BETWEEN_RAMPS = 50

export class BlockGenerator {
    distanceBetweenBlock = DISTANCES_BETWEEN_RAMPS
    blockArray = []

    constructor(distanceBetweenBlocks) {
        this.distanceBetweenBlock = distanceBetweenBlocks
    }

    _getRandomBlockType() {
        const randomNumber = Math.random()
        if (randomNumber > 0.66)
            return "block_wall"
        else if (randomNumber < 0.66 && randomNumber > 0.33)
            return "block"
        else
            return "block_float"
    }

    getBlock() {
        const size = [4, 2, 2]
        const blockName = this._getRandomBlockType()
        let color = "#F55" //Block
        if (blockName === "block_wall") {
            color = "#5F5"
            size[2] = 6
        }
        else if (blockName === "block_float")
            color = "#55F"
        const blockGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const blockMaterial = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100
        });
        const block = new THREE.Mesh(blockGeometry, blockMaterial);
        block.name = blockName

        return block
    }

    getBlocks(startY = 0, endY) {


        const X_POSITION = [-6, 0, 6]
        const blocks = []
        console.log("INVOKING", startY, endY)
        for (let i = startY; i < endY; i += this.distanceBetweenBlock) {
            const box = this.getBlock()
            /*
            const SCALE_MOLTIPLICATOR = 1.8
            const scale_vector = [rampInstance.scale.x, rampInstance.scale.y, rampInstance.scale.z]

            const WIDTH = 10 * scale_vector[0] //* rampInstance.scale.x;
            const LENGTH = 5.3 * scale_vector[1] * SCALE_MOLTIPLICATOR// * rampInstance.scale.y;
            const HEIGHT = 5.2 * scale_vector[2] * SCALE_MOLTIPLICATOR// * rampInstance.scale.z;
            const WIDTH_OFFSET = -WIDTH / 3.33 //* rampInstance.scale.x;
            const LENGTH_OFFSET = LENGTH// * rampInstance.scale.y;
            const HEIGHT_OFFSET = -HEIGHT / 1.8// * rampInstance.scale.z;
            */

            let blockHeight = (box.name === "block_float" ? 4 : 0)
            if (box.name === "block_wall")
                blockHeight = 2
            //box.body.position.y -= i
            //box.body.position.x = X_POSITION[Math.floor(Math.random() * 3)]
            //box.body.position.z = 1.5 + blockHeight

            box.position.y = -i//box.body.position.y// + LENGTH_OFFSET
            box.position.x = X_POSITION[Math.floor(Math.random() * 3)]//box.body.position.x// + WIDTH_OFFSET
            box.position.z = 1.5 + blockHeight//box.body.position.z// + HEIGHT_OFFSET

            blocks.push(box/*{obj: box.model, body: box.body}*/)
            this.blockArray.push(/*{obj: box.model, body: box.body}*/box)
        }

        return blocks;
    }

    update() {
        for (let i = 0; i < this.blockArray.length; i++) {

            let target = new CANNON.Vec3(0, 0, 0)
            this.blockArray[i].body.quaternion.toEuler(target, 'YZX')

            //this.blockArray[i].obj.position.y =  this.blockArray[i].body.position.y// + WIDTH_OFFSET
            //this.blockArray[i].obj.position.x =  this.blockArray[i].body.position.x// + WIDTH_OFFSET
            //this.blockArray[i].obj.position.z = this.blockArray[i].body.position.z// + HEIGHT_OFFSET            //this.blockArray[i].obj.rotation.set(target.x, target.y, target.z)
            //console.log(bodyPosition.y == this.blockArray[i].obj.position.y)
        }

    }

    getBlockArray() {
        return this.blockArray
    }

    removeTheOnesBeforeYPosition(yPos) {
        const filtered = this.blockArray.filter(block => block.position.y > yPos)
        this.blockArray = this.blockArray.filter(block => block.position.y < yPos)
        return filtered
    }

}