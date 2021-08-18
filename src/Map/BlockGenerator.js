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
        if (blockName === "block_wall") {
            size[2] = 6
        }
        const blockGeometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const block = new THREE.Mesh(blockGeometry, this.blockMaterial);
        block.name = blockName

        return block
    }

    getBlocks(startY = 0, endY) {


        const X_POSITION = [-6, 0, 6]
        const blocks = []

        for (let i = startY; i < endY; i += this.distanceBetweenBlock) {
            const box = this.getBlock()

            let blockHeight = (box.name === "block_float" ? 4 : 0)
            if (box.name === "block_wall")
                blockHeight = 2

            box.position.y = -i
            box.position.x = X_POSITION[Math.floor(Math.random() * 3)]
            box.position.z = 1.5 + blockHeight

            blocks.push(box)
            this.blockArray.push(box)
        }

        return blocks;
    }

    update() {
        for (let i = 0; i < this.blockArray.length; i++) {

            let target = new CANNON.Vec3(0, 0, 0)
            this.blockArray[i].body.quaternion.toEuler(target, 'YZX')
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