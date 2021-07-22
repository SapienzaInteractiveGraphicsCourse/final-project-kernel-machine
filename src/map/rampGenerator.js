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
                    const color = new THREE.Color(Math.random(),Math.random(),Math.random());
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

                    rampInstance.position.y -= i
                    rampInstance.position.x = X_POSITION[Math.floor(Math.random() * 3)]

                    ramps.push(rampInstance)
                }

                resolve(ramps)
            })
        })
    }

    getRamp() {
        return new Promise(resolve => {

            this.rampModelPromise.then(x => {
                resolve((x))
            })
        })
    }
}