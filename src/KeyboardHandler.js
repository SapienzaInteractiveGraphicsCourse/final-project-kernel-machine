export class KeyboardHandler {
    static EVENTS = {
        WPressed: 1,
        WReleased: 2,
        APressed: 3,
        AReleased: 4,
        SPressed: 5,
        SReleased: 6,
        DPressed: 7,
        DReleased: 8,
        SpacePressed: 9,
        SpaceReleased: 10
    }

    state = {
        W: false,
        A: false,
        S: false,
        D: false,
        Space: false
    }

    onCallback = null

    constructor() {
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
                case "Space":
                    if (!this.state.Space) {
                        this.spacePressed()
                        this.state.Space = true
                    }
                    break
            }
        })

        document.addEventListener('keyup', event => {
            if (event.code == "KeyA") {
                this.state.A = false
                this._callCallback(KeyboardHandler.EVENTS.AReleased)
            }
            else if (event.code == "KeyD") {
                this.state.D = false
                this._callCallback(KeyboardHandler.EVENTS.DReleased)
            }
            else if (event.code == "KeyW") {
                this.state.W = false
                this._callCallback(KeyboardHandler.EVENTS.WReleased)
            }
            else if (event.code == "KeyS") {
                this.state.S = false
                this._callCallback(KeyboardHandler.EVENTS.SReleased)
            }
            else if (event.code == "Space") {
                this.state.Space = false
                this._callCallback(KeyboardHandler.EVENTS.SpaceReleased)
            }
        })
    }

    setCallback(callback) {
        this.onCallback = callback
    }

    _callCallback(event) {
        if (this.onCallback != null && typeof this.onCallback === 'function')
            this.onCallback(event)
    }

    keyWPressed() {
        this._callCallback(KeyboardHandler.EVENTS.WPressed)
    }

    keyAPressed() {
        this._callCallback(KeyboardHandler.EVENTS.APressed)
    }

    keySPressed() {
        this._callCallback(KeyboardHandler.EVENTS.SPressed)
    }

    keyDPressed() {
        this._callCallback(KeyboardHandler.EVENTS.DPressed)
    }

    spacePressed() {
        this._callCallback(KeyboardHandler.EVENTS.SpacePressed)
    }
}