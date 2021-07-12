export class KeyboardHandler {

    state = {
        W: false,
        A: false,
        S: false,
        D: false
    }

    constructor(car) {
        this.car = car
        document.addEventListener('keydown', event => {
            switch (event.code) {
                case "KeyW":
                    if (!this.state.W) {
                        this.keyWPressed()
                        this.state.W = true
                    }
                    break
                case "KeyA":
                    if (!this.state.A) {
                        this.keyAPressed()
                        this.state.A = true
                    }
                    break
                case "KeyS":
                    if (!this.state.S) {
                        this.keySPressed()
                        this.state.S = true
                    }
                    break
                case "KeyD":
                    if (!this.state.D) {
                        this.keyDPressed()
                        this.state.D = true
                    }
                    break
            }
        })

        document.addEventListener('keyup', event => {
            if (event.code == "KeyA") {
                this.state.A = false
                this.car.centerSteering()
            }
            else if (event.code == "KeyD") {
                this.state.D = false
                this.car.centerSteering()
            }
            else if (event.code == "KeyW") {
                this.state.W = false
                this.car.stopWheels()
            }
            else if (event.code == "KeyS") {
                this.state.S = false
                this.car.stopWheels()
            }
        })
    }

    keyWPressed() {
        this.car.rotateWheelsForward()
    }

    keyAPressed() {
        this.car.turnLeft()
    }

    keySPressed() {
        this.car.rotateWheelsBackward()
    }

    keyDPressed() {
        this.car.turnRight()
    }
}