import * as THREE from "../../lib/three.module.js";

const DISTANCES_BETWEEN_RAMPS = 50

export class BlockGenerator {
    distanceBetweenBlock = DISTANCES_BETWEEN_RAMPS
    blockArray = []
    loaderManager = null

    blockMaterial = null

    constructor(distanceBetweenBlocks, loaderManager) {
        this.distanceBetweenBlock = distanceBetweenBlocks
        this.loaderManager = loaderManager

        const path = window.location.href.substring(0, window.location.href.lastIndexOf("/"))

        const blockNormalMap = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/block/ground_0031_normal_2k.png")
        blockNormalMap.wrapS = THREE.RepeatWrapping;
        blockNormalMap.wrapT = THREE.RepeatWrapping;
        blockNormalMap.repeat.set(1,1);
        blockNormalMap.magFilter = THREE.NearestFilter;
        blockNormalMap.minFilter = THREE.NearestFilter;

        const blockRoughnessMap = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/block/ground_0031_roughness_2k.jpg");
        blockRoughnessMap.wrapS = THREE.RepeatWrapping;
        blockRoughnessMap.wrapT = THREE.RepeatWrapping;
        blockRoughnessMap.repeat.set(1,1);
        blockRoughnessMap.magFilter = THREE.NearestFilter;
        blockRoughnessMap.minFilter = THREE.NearestFilter;

        const blockColorMap = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/block/ground_0031_color_2k.jpg");
        blockColorMap.wrapS = THREE.RepeatWrapping;
        blockColorMap.wrapT = THREE.RepeatWrapping;
        blockColorMap.repeat.set(1,1);
        blockColorMap.magFilter = THREE.NearestFilter;
        blockColorMap.minFilter = THREE.NearestFilter;

        const blockHeightMap = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/block/ground_0031_height_2k.png");
        blockHeightMap.wrapS = THREE.RepeatWrapping;
        blockHeightMap.wrapT = THREE.RepeatWrapping;
        blockHeightMap.repeat.set(1,1);
        blockHeightMap.magFilter = THREE.NearestFilter;
        blockHeightMap.minFilter = THREE.NearestFilter

        const blockAoMap = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/block/ground_0031_ao_2k.jpg");
        blockAoMap.wrapS = THREE.RepeatWrapping;
        blockAoMap.wrapT = THREE.RepeatWrapping;
        blockAoMap.repeat.set(1,1);
        blockAoMap.magFilter = THREE.NearestFilter;
        blockAoMap.minFilter = THREE.NearestFilter;

        this.blockMaterial =  new THREE.MeshStandardMaterial({
            map: blockColorMap,
            aoMap: blockAoMap,
            normalMap: blockNormalMap,
            roughnessMap: blockRoughnessMap,
            bumpMap: blockHeightMap,
            side: THREE.DoubleSide
            //emissiveIntensity: 10,
        });
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
        const block = new THREE.Mesh(blockGeometry, this.blockMaterial);
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