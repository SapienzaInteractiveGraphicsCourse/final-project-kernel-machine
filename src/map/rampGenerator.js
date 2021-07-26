import * as THREE from "../../lib/three.module.js";
import {GLTFLoader} from "../../lib/GLTFLoader.js";

export class RampGenerator {
    distanceBetweenRamps = 0;
    rampModelPromise = null
    rampModel = null;

    constructor(distanceBetweenRamps) {
        this._distanceBetweenRamps = distanceBetweenRamps;

        const gltfLoader = new GLTFLoader();
        this.rampModelPromise = new Promise(resolve => {
            gltfLoader.load(window.location.href + 'resources/ramp.gltf', model => {
                this.rampModel = model.scene
                resolve(model.scene)
            })
        })
    }


    get distanceBetweenRamps() {
        return this._distanceBetweenRamps;
    }

    set distanceBetweenRamps(value) {
        this._distanceBetweenRamps = value;
    }

    getRamps(startY = 0, endY) {


        const X_POSITION = [-6, 0, 6]

        return new Promise(resolve => {

            this.getRamp().then(ramp => {

                function processModel(model) {
                    const color = new THREE.Color(Math.random(), Math.random(), Math.random());
                    const scale_vector = [0.45, 1.5 + Math.random() % 0.3, Math.abs(Math.random() % 0.3) + 0.1]
                    model.scale.set(scale_vector[0], scale_vector[1], scale_vector[2])
                    model.rotation.set(0, Math.PI, 0)
                    model.position.z += scale_vector[2] + 1

                    model.traverse(obj => {
                        if (obj.isMesh)
                            obj.material = new THREE.MeshStandardMaterial({color: color.getHex()});
                    })
                    return model;
                }

                const ramps = []
                for (let i = startY; i < endY; i += this._distanceBetweenRamps) {
                    const rampInstance = processModel(ramp.clone())
                    const SCALE_MOLTIPLICATOR = 1.8
                    const scale_vector = [rampInstance.scale.x, rampInstance.scale.y, rampInstance.scale.z]

                    const WIDTH = 10 * scale_vector[0] //* rampInstance.scale.x;
                    const LENGTH = 5.3 * scale_vector[1] * SCALE_MOLTIPLICATOR// * rampInstance.scale.y;
                    const HEIGHT = 5.2 * scale_vector[2] * SCALE_MOLTIPLICATOR// * rampInstance.scale.z;
                    const WIDTH_OFFSET = -WIDTH / 3.33 //* rampInstance.scale.x;
                    const LENGTH_OFFSET = LENGTH// * rampInstance.scale.y;
                    const HEIGHT_OFFSET = -HEIGHT / 1.8// * rampInstance.scale.z;
                    let vertices = [
                        new CANNON.Vec3(0, 0, 0),
                        new CANNON.Vec3(0, -LENGTH, 0),
                        new CANNON.Vec3(0, -LENGTH, HEIGHT),
                        new CANNON.Vec3(WIDTH, 0, 0),
                        new CANNON.Vec3(WIDTH, -LENGTH, 0),
                        new CANNON.Vec3(WIDTH, -LENGTH, HEIGHT),
                    ]
                    console.log(vertices)

                    let faces = [
                        [2, 1, 0],
                        [4, 5, 2, 1],
                        [2, 5, 3, 0],
                        [4, 3, 5],
                        [1, 0, 3, 4],
                    ]

                    var trimeshShape = new CANNON.ConvexPolyhedron(vertices, faces);
                    trimeshShape.create

                    const rampBodyInstance = new CANNON.Body({
                        mass: 0, // kg
                        shape: trimeshShape
                    });

                    rampInstance.position.y -= i
                    rampInstance.position.x = X_POSITION[Math.floor(Math.random() * 3)]

                    rampBodyInstance.position.y = rampInstance.position.y + LENGTH_OFFSET
                    rampBodyInstance.position.x = rampInstance.position.x + WIDTH_OFFSET
                    rampBodyInstance.position.z = rampInstance.position.z + HEIGHT_OFFSET

                    ramps.push({obj: rampInstance, body: rampBodyInstance})
                }

                resolve(ramps)
            })
        })
    }

    getRamp() {
        return new Promise(resolve => {

            this.rampModelPromise.then(x => {
                x.name = "ramp"
                resolve(x)
            })
        })
    }
}