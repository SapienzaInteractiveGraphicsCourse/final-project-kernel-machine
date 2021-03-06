import {OrbitControls} from "../lib/OrbitControls.js";

class CameraHandler {
    camera = null

    constructor(camera) {
        this.camera = camera
        document.addEventListener('mousedown', this.onMouseDown)
        document.addEventListener('mouseup', this.onMouseUp)
        document.addEventListener('mousemove', this.onMouseMove)
        this.control = new OrbitControls(camera, document.getElementById("c"))
        this.control.maxDistance = 20
        this.control.maxPolarAngle = Math.PI/2.5
        this.control.minPolarAngle = Math.PI/4

    };

    setTarget(target) {
        this.control.target = target
    }

    onMouseDown() {
        console.log("MOUSE DOWN")
    };

    onMouseUp() {
        console.log("MOUSE UP")
    };

    onMouseMove(event) {
        const xPos = event.clientX
        const yPos = event.clientY
    }

    update() {
        this.control.update()
    }

}

export {CameraHandler}