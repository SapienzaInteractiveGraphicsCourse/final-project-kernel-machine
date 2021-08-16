import * as THREE from '../../lib/three.module.js';

const FLOOR_WIDTH = 20
const FLOOR_LENGTH = 500
const FLOOR_HEIGHT = 1

const WALL_HEIGHT = 3
const WALL_THICK = 1


export class MapGenerator {
    carPosition = null
    lastGenerationCarPosition = 0
    generatedMapCounter = 0
    blockGenerator = null

    constructor() {
    }

    _getFloorInstance(firstInstance = false) {
        const bodies = []
        //Floor
        const floorGeometry = new THREE.BoxGeometry(FLOOR_WIDTH, FLOOR_LENGTH, FLOOR_HEIGHT);
        const floorMaterial = new THREE.MeshPhongMaterial({color: '#8AC'});
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);


        //Left wall
        const wallGeometryL = new THREE.BoxGeometry(WALL_THICK, FLOOR_LENGTH, WALL_HEIGHT);
        const wallMaterialL = new THREE.MeshPhongMaterial({color: '#8AC'});
        const wallLeft = new THREE.Mesh(wallGeometryL, wallMaterialL)
        wallLeft.position.set(FLOOR_WIDTH / 2, 0, WALL_HEIGHT / 2)

        //Right wall
        const wallGeometryR = new THREE.BoxGeometry(WALL_THICK, FLOOR_LENGTH, WALL_HEIGHT);
        const wallMaterialR = new THREE.MeshPhongMaterial({color: '#8AF'});
        const wallRight = new THREE.Mesh(wallGeometryR, wallMaterialR);
        wallRight.position.set(-FLOOR_WIDTH / 2, 0, WALL_HEIGHT / 2)


        floor.add(wallLeft)
        floor.add(wallRight)
        const DEADBAND_WITHOUT_RAMPS = 2

        return new Promise(resolve => {
            resolve(floor)

        })

    }

    getMapObjects() {
        return new Promise(resolve => {
            this._getFloorInstance(true)
                .then(obj => {
                    obj.position.set(0, 0, 0);
                    resolve(obj)
                }).finally(() => {

            });
        });
    }

    setCarPosition(carPos) {
        this.carPosition = carPos
        console.log(this.carPosition)
    }


    update() {
        return new Promise((res => {


            if (this.carPosition != null && -this.carPosition.y > this.lastGenerationCarPosition) {
                this.generatedMapCounter += 1
                this.lastGenerationCarPosition = FLOOR_LENGTH * this.generatedMapCounter

                this._getFloorInstance().then(obj => {
                    obj.position.y = -FLOOR_LENGTH * this.generatedMapCounter

                    res({mdl: obj, counter: this.generatedMapCounter})
                })
            }
        }))

    }
}