import {GLTFLoader} from "../../lib/GLTFLoader.js";
import * as THREE from '../../lib/three.module.js';
import * as TWEEN from "../../lib/tween.js/dist/tween.esm.js";

const STEERING_ROTATION_SPEED = 100

export class Car {

    modelPromise = null
    carModel = null
    state = {
        wheelRotation: false,
        wheelDirectionFront: true,
        turnLeft: false,
        turnRight: false,
    }


    constructor() {
        const gltfLoader = new GLTFLoader();
        this.modelPromise = new Promise(resolve => {
            const car = new THREE.Group()

            let i = 0

            function elementLoad(model, name) {
                model.scene.rotation.set(Math.PI / 2, -Math.PI / 2, 0, 'XYZ')
                model.scene.position.set(0, -5, 1.2)
                const WHEEL_POSITION_Z = -0.4
                switch (name) {
                    case "front_left":
                        model.scene.position.x += 0.9
                        model.scene.position.y -= 1.43
                        model.scene.position.z += WHEEL_POSITION_Z
                        break
                    case "front_right":
                        model.scene.rotation.y = Math.PI / 2
                        model.scene.position.x -= 0.9
                        model.scene.position.y -= 1.43
                        model.scene.position.z += WHEEL_POSITION_Z
                        break
                    case "rear_left":
                        model.scene.position.x += 0.9
                        model.scene.position.y += 1.08
                        model.scene.position.z += WHEEL_POSITION_Z
                        break
                    case "rear_right":
                        model.scene.rotation.y = Math.PI / 2
                        model.scene.position.x -= 0.9
                        model.scene.position.y += 1.08
                        model.scene.position.z += WHEEL_POSITION_Z
                        break
                }
                model.scene.name = name
                car.add(model.scene)
                i++
                if (i == 5) {
                    resolve(car)
                }
            }

            gltfLoader.load('./../resources/f1_car.gltf', model => elementLoad(model, "car"))
            gltfLoader.load('./../resources/wheel/wheel.gltf', model => elementLoad(model, "front_left"))
            gltfLoader.load('./../resources/wheel/wheel.gltf', model => elementLoad(model, "front_right"))
            gltfLoader.load('./../resources/wheel/wheel.gltf', model => elementLoad(model, "rear_left"))
            gltfLoader.load('./../resources/wheel/wheel.gltf', model => elementLoad(model, "rear_right"))
        })
        this.modelPromise.then(m => {
            this.carModel = m
        })
    }

    _turnLeftAnimation() {
        if (this.carModel == null)
            return
        this.carModel.traverse(m => {
            if (m.name === "front_left") {
                if (m.rotation.y < -Math.PI / 2 + THREE.Math.degToRad(30))
                    m.rotation.y += 0.05
            }
            else if (m.name === "front_right") {
                if (m.rotation.y < Math.PI / 2 + THREE.Math.degToRad(30))
                    m.rotation.y += 0.05
            }
        })
    }

    _turnRightAnimation() {
        if (this.carModel == null)
            return
        this.carModel.traverse(m => {
            if (m.name === "front_left") {
                if (m.rotation.y > -Math.PI / 2 - THREE.Math.degToRad(30))
                    m.rotation.y -= 0.05
            }
            else if (m.name === "front_right") {
                if (m.rotation.y > Math.PI / 2 - THREE.Math.degToRad(30))
                    m.rotation.y -= 0.05
            }
        })
    }

    _steeringCenterAnimation() {
        const CENTER_DEADBAND = THREE.Math.degToRad(5)
        if (this.carModel == null)
            return
        this.carModel.traverse(m => {
            if (m.name === "front_left") {
                if(m.rotation.y - CENTER_DEADBAND > -Math.PI / 2)
                    m.rotation.y -= 0.05
                else if(m.rotation.y + CENTER_DEADBAND < -Math.PI / 2)
                    m.rotation.y += 0.05
            }
            else if (m.name === "front_right") {
                if(m.rotation.y > Math.PI / 2)
                    m.rotation.y -= 0.05
                else if(m.rotation.y < Math.PI / 2)
                    m.rotation.y += 0.05
            }
        })
    }

    _rotateWheelsAnimation(step){
        if (this.carModel == null)
            return
        this.carModel.traverse(m => {
            if (m.name === "front_left") {
                    m.rotation.x += step
            }
            else if (m.name === "front_right") {
                m.rotation.x += step
            }
            else if (m.name === "rear_right") {
                m.rotation.x += step
            }
            else if (m.name === "rear_left") {
                m.rotation.x += step
            }
        })
    }

    getModelPromise() {
        return this.modelPromise
    }

    turnLeft() {
        this.state.turnLeft = true
        this.state.turnRight = false
    }

    turnRight() {
        this.state.turnLeft = false
        this.state.turnRight = true
    }

    centerSteering() {
        this.state.turnLeft = false
        this.state.turnRight = false
    }


    rotateWheelsForward() {
        this.state.wheelRotation = true
        this.state.wheelDirectionFront = true
    }

    rotateWheelsBackward() {
        this.state.wheelRotation = true
        this.state.wheelDirectionFront = false

    }

    stopWheels() {
        this.state.wheelRotation = false
    }


    animate(time) {
        if(this.state.turnLeft)
            this._turnLeftAnimation()
        if(this.state.turnRight)
            this._turnRightAnimation()
        if(!this.state.turnRight && !this.state.turnLeft)
            this._steeringCenterAnimation()
        if(this.state.wheelRotation)
            this._rotateWheelsAnimation(0.05)
    }


}