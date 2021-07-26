import * as THREE from '../../lib/three.module.js';
import {RampGenerator} from "./rampGenerator.js";

const FLOOR_WIDTH = 20
const FLOOR_LENGTH = 500
const FLOOR_HEIGHT = 1

const WALL_HEIGHT = 3
const WALL_THICK = 1

const DISTANCES_BETWEEN_RAMPS = 50

export class MapGenerator {
    carPosition = null
    lastGenerationCarPosition = 0
    generatedMapCounter = 0
    rampGenerator = null

    constructor() {
        this.rampGenerator = new RampGenerator(DISTANCES_BETWEEN_RAMPS);

    }

    _getFloorInstance(firstInstance = false) {
        const bodies = []
        //Floor
        const floorGeometry = new THREE.BoxGeometry(FLOOR_WIDTH, FLOOR_LENGTH, FLOOR_HEIGHT);
        const floorMaterial = new THREE.MeshPhongMaterial({color: '#8AC'});
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);

        const floorBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, 0, 0),
            shape: new CANNON.Box(new CANNON.Vec3(10, 250, 0.5))
        })
        bodies.push(floorBody)

        //Left wall
        const wallGeometryL = new THREE.BoxGeometry(WALL_THICK, FLOOR_LENGTH, WALL_HEIGHT);
        const wallMaterialL = new THREE.MeshPhongMaterial({color: '#8AC'});
        const wallLeft = new THREE.Mesh(wallGeometryL, wallMaterialL)
        wallLeft.position.set(FLOOR_WIDTH / 2, 0, WALL_HEIGHT / 2)

        const WallLeftBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(FLOOR_WIDTH / 2, 0, WALL_HEIGHT / 2),
            shape: new CANNON.Box(new CANNON.Vec3(WALL_THICK / 2, FLOOR_LENGTH / 2, WALL_HEIGHT / 2))
        })
        bodies.push(WallLeftBody)

        //Right wall
        const wallGeometryR = new THREE.BoxGeometry(WALL_THICK, FLOOR_LENGTH, WALL_HEIGHT);
        const wallMaterialR = new THREE.MeshPhongMaterial({color: '#8AF'});
        const wallRight = new THREE.Mesh(wallGeometryR, wallMaterialR);
        wallRight.position.set(-FLOOR_WIDTH / 2, 0, WALL_HEIGHT / 2)

        const WallRightBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(-FLOOR_WIDTH / 2, 0, WALL_HEIGHT / 2),
            shape: new CANNON.Box(new CANNON.Vec3(WALL_THICK / 2, FLOOR_LENGTH / 2, WALL_HEIGHT / 2))
        })
        bodies.push(WallRightBody)

        floor.add(wallLeft)
        floor.add(wallRight)
        const DEADBAND_WITHOUT_RAMPS = 2
        return new Promise(resolve => {
            this.rampGenerator.getRamps(-FLOOR_LENGTH / 2, FLOOR_LENGTH / 2).then(x => {
                x.forEach(ramp => {
                    if (!(firstInstance && ramp.obj.name === "ramp" && ramp.obj.position.x > -DEADBAND_WITHOUT_RAMPS && ramp.obj.position.x < DEADBAND_WITHOUT_RAMPS)) {
                        floor.add(ramp.obj)
                        bodies.push(ramp.body)
                    }
                })
                resolve({obj: floor, bodies: bodies})
            });
        })

    }

    getMapObjects() {
        return new Promise(resolve => {
            this._getFloorInstance(true)
                .then(obj => {
                    obj.obj.position.set(0, 0, 0);
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

                this._getFloorInstance().then(mdl => {
                    mdl.obj.position.y = -FLOOR_LENGTH * this.generatedMapCounter

                    for (let i = 0; i < mdl.bodies.length; i++) {
                        mdl.bodies[i].position.y -= FLOOR_LENGTH * this.generatedMapCounter
                    }
                    res(mdl)
                })
            }
        }))

    }

}