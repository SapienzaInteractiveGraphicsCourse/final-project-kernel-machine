import * as THREE from '../../lib/three.module.js';

const FLOOR_WIDTH = 20
const FLOOR_LENGTH = 1000
const FLOOR_HEIGHT = 1

const WALL_HEIGHT = 3
const WALL_THICK = 1


export class MapGenerator {
    carPosition = null
    lastGenerationCarPosition = 0
    generatedMapCounter = 0
    blockGenerator = null
    loaderManager = null

    constructor(loaderManager) {
        this.loaderManager = loaderManager
    }

    _getFloorInstance() {
        const X_REPEAT_FLOOR = 5
        const Y_REPEAT_FLOOR = FLOOR_WIDTH * (FLOOR_LENGTH / X_REPEAT_FLOOR) / 20
        const X_REPEAT_WALL = 1
        const Y_REPEAT_WALL = FLOOR_WIDTH * (FLOOR_LENGTH / X_REPEAT_WALL) / 100
        const path = window.location.href.substring(0, window.location.href.lastIndexOf("/"))

        const metalDiffuse = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/floor/Metal_Texture_spec.jpg");
        metalDiffuse.wrapS = THREE.RepeatWrapping;
        metalDiffuse.wrapT = THREE.RepeatWrapping;
        metalDiffuse.repeat.set(X_REPEAT_FLOOR, Y_REPEAT_FLOOR);
        metalDiffuse.magFilter = THREE.NearestFilter;
        metalDiffuse.minFilter = THREE.NearestFilter;


        const metalNormals = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/floor/Metal_Texture_normals.jpg");
        metalNormals.wrapS = THREE.RepeatWrapping;
        metalNormals.wrapT = THREE.RepeatWrapping;
        metalNormals.repeat.set(X_REPEAT_FLOOR, Y_REPEAT_FLOOR);
        metalNormals.magFilter = THREE.NearestFilter;
        metalNormals.minFilter = THREE.NearestFilter;

        const metalDiffuseWall = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/floor/Metal_Texture_spec.jpg");
        metalDiffuseWall.wrapS = THREE.RepeatWrapping;
        metalDiffuseWall.wrapT = THREE.RepeatWrapping;
        metalDiffuseWall.repeat.set(X_REPEAT_WALL, Y_REPEAT_WALL);
        metalDiffuseWall.magFilter = THREE.NearestFilter;
        metalDiffuseWall.minFilter = THREE.NearestFilter;


        const metalNormalsWall = new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/floor/Metal_Texture_normals.jpg");
        metalNormalsWall.wrapS = THREE.RepeatWrapping;
        metalNormalsWall.wrapT = THREE.RepeatWrapping;
        metalNormalsWall.repeat.set(X_REPEAT_WALL, Y_REPEAT_WALL);
        metalNormalsWall.magFilter = THREE.NearestFilter;
        metalNormalsWall.minFilter = THREE.NearestFilter;

        const wallMaterial = new THREE.MeshStandardMaterial({
            map: metalDiffuseWall,
            normalMap: metalNormalsWall,
        })

        //Floor
        const floorGeometry = new THREE.BoxGeometry(FLOOR_WIDTH, FLOOR_LENGTH, FLOOR_HEIGHT);
        const floorMaterial = new THREE.MeshPhongMaterial({
            map: metalDiffuse,
            normalMap: metalNormals,
        })        //new THREE.MeshPhongMaterial({color: '#8AC'});
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);


        //Left wall
        const wallGeometryL = new THREE.BoxGeometry(WALL_THICK, FLOOR_LENGTH, WALL_HEIGHT);
        const wallMaterialL = new THREE.MeshPhongMaterial({color: '#8AC'});
        const wallLeft = new THREE.Mesh(wallGeometryL, wallMaterial)
        wallLeft.position.set(FLOOR_WIDTH / 2, 0, WALL_HEIGHT / 2)

        //Right wall
        const wallGeometryR = new THREE.BoxGeometry(WALL_THICK, FLOOR_LENGTH, WALL_HEIGHT);
        const wallMaterialR = new THREE.MeshPhongMaterial({color: '#8AF'});
        const wallRight = new THREE.Mesh(wallGeometryR, wallMaterial);
        wallRight.position.set(-FLOOR_WIDTH / 2, 0, WALL_HEIGHT / 2)


        floor.add(wallLeft)
        floor.add(wallRight)

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