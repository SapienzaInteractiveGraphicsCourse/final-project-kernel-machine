import {GLTFLoader} from "../../lib/GLTFLoader.js";
import * as THREE from '../../lib/three.module.js';

const WHEELS_DIAMETER = 0.60

export class Car {

    modelPromise = null
    carModel = null
    state = {
        wheelRotation: false,
        wheelDirectionFront: true,
        turnLeft: false,
        turnRight: false,
        steeringAngle: 0
    }


    constructor() {
        const gltfLoader = new GLTFLoader();
        this.modelPromise = new Promise(resolve => {
            const car = new THREE.Group()

            let i = 0

            function elementLoad(model, name) {
                model.scene.rotation.set(Math.PI / 2, -Math.PI / 2, 0, 'XYZ')
                model.scene.position.set(0, 0, 0.55)

                const WHEEL_POSITION_X = 1
                const WHEEL_POSITION_Y_FRONT = -1.58
                const WHEEL_POSITION_Y_REAR = 0.95
                const WHEEL_POSITION_Z = 0.25

                switch (name) {
                    case "front_left":
                        model.scene.position.x += WHEEL_POSITION_X
                        model.scene.position.y += WHEEL_POSITION_Y_FRONT
                        model.scene.position.z += WHEEL_POSITION_Z
                        break
                    case "front_right":
                        model.scene.rotation.y = Math.PI / 2
                        model.scene.position.x -= WHEEL_POSITION_X
                        model.scene.position.y += WHEEL_POSITION_Y_FRONT
                        model.scene.position.z += WHEEL_POSITION_Z
                        break
                    case "rear_left":
                        model.scene.position.x += WHEEL_POSITION_X
                        model.scene.position.y += WHEEL_POSITION_Y_REAR
                        model.scene.position.z += WHEEL_POSITION_Z
                        break
                    case "rear_right":
                        model.scene.rotation.y = Math.PI / 2
                        model.scene.position.x -= WHEEL_POSITION_X
                        model.scene.position.y += WHEEL_POSITION_Y_REAR
                        model.scene.position.z += WHEEL_POSITION_Z
                        break
                }
                model.scene.name = name
                car.add(model.scene)
                i++
                if (i === 5) {
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
        if (this.state.steeringAngle > THREE.Math.degToRad(-30))
            this.state.steeringAngle -= 0.05
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
        if (this.state.steeringAngle < THREE.Math.degToRad(30))
            this.state.steeringAngle += 0.05
    }

    _steeringCenterAnimation() {
        const CENTER_DEADBAND = THREE.Math.degToRad(5)
        if (this.carModel == null)
            return
        this.carModel.traverse(m => {
            if (m.name === "front_left") {
                if (m.rotation.y - CENTER_DEADBAND > -Math.PI / 2)
                    m.rotation.y -= 0.05
                else if (m.rotation.y + CENTER_DEADBAND < -Math.PI / 2)
                    m.rotation.y += 0.05
            }
            else if (m.name === "front_right") {
                if (m.rotation.y > Math.PI / 2)
                    m.rotation.y -= 0.05
                else if (m.rotation.y < Math.PI / 2)
                    m.rotation.y += 0.05
            }
        })
        if (this.state.steeringAngle - CENTER_DEADBAND > THREE.Math.degToRad(0))
            this.state.steeringAngle -= 0.05
        else if (this.state.steeringAngle + CENTER_DEADBAND < THREE.Math.degToRad(0))
            this.state.steeringAngle += 0.05
        else if (this.state.steeringAngle < CENTER_DEADBAND + 0.05 && this.state.steeringAngle > -CENTER_DEADBAND - 0.05)
            this.state.steeringAngle = 0
    }

    _rotateWheelsAnimation(step) {
        if (this.carModel == null)
            return

        this.carModel.traverse(m => {

            if (m.name === "front_left") {
                m.rotation.z += -step
            }
            else if (m.name === "front_right") {
                m.rotation.z += -step
            }
            else if (m.name === "rear_right") {
                m.rotation.z += -step
            }
            else if (m.name === "rear_left") {
                m.rotation.z += -step
            }
        })
        const translated_distance = (Math.PI * WHEELS_DIAMETER / 360) * THREE.Math.radToDeg(step)
        this._moveCar(translated_distance)
    }

    _moveCar(step) {
        const step_y = Math.cos(this.carModel.rotation.z) * step
        const step_x = Math.sin(this.carModel.rotation.z) * step
        const STEERING_STRENGTH = 30 //From 0 to 1000
        this.carModel.position.y -= step_y
        this.carModel.position.x += step_x
        this.carModel.rotation.z -= this.state.steeringAngle * STEERING_STRENGTH / 1000
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
        if (this.state.turnLeft)
            this._turnLeftAnimation()
        if (this.state.turnRight)
            this._turnRightAnimation()
        if (!this.state.turnRight && !this.state.turnLeft)
            this._steeringCenterAnimation()
        if (this.state.wheelRotation) {
            const incremental_step = 0.2 * (this.state.wheelDirectionFront ? 1 : -1)
            this._rotateWheelsAnimation(incremental_step)
        }
    }


}