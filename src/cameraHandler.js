import {OrbitControls} from "../lib/OrbitControls.js";

class CameraHandler {
    camera = null
    constructor(camera) {
        this.camera = camera
        document.addEventListener('mousedown', this.onMouseDown)
        document.addEventListener('mouseup', this.onMouseUp)
        document.addEventListener('mousemove',this.onMouseMove)
        this.control = new OrbitControls(camera, document.getElementById("c"))
    };

    onMouseDown(){
        console.log("MOUSE DOWN")
    };
    onMouseUp(){
        console.log("MOUSE UP")
    };
    onMouseMove(event){
        const xPos = event.clientX
        const yPos = event.clientY
    }
}

export {CameraHandler}