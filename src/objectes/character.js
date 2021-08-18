import * as THREE from '../../lib/three.module.js';

const HIGH_RESOLUTION_SEGMENTS = 64
const MIDDLE_RESOLUTION_SEGMENTS = 32
const LOW_RESOLUTION_SEGMENTS = 16

const DEFAULT_ARM_APERTURE_DEGREE = 18
const UPPER_ARM_LENGTH = 0.8
const LEG_LOWER_LENGTH = 1
const LEG_LOWER_SMALL_RADIUS = 0.15
const LEG_LOWER_LARGE_RADIUS = 0.2
const LEG_UPPER_LENGTH = 0.8
const PELVIS_RADIUS = 0.8
const PELVIS_RADIUS_HEIGHT = 0.65
const BODY_HEIGHT = 1.5
const PIVOT_RADIUS = 0.2

const HEAD_WIDTH = 1.4
const HEAD_HEIGHT = 1.2
const HEAD_DEPTH = 1

const LEG_UPPER_WALK_APERTURE_FRONT = Math.PI / 4
const LEG_UPPER_WALK_APERTURE_REAR = -Math.PI / 4
const LEG_LOWER_WALK_APERTURE_FRONT = Math.PI / 8
const LEG_LOWER_WALK_APERTURE_REAR = 0

const WALKING_Z = 1

const CHARACTER_ACTION = {
    NONE: 0,
    WALKING: 1,
    JUMPING: 2,
    DOWN: 3,
    FALLING: 4
}

export class Character {
    model = null
    rigidBody = null
    hierarchicalModel = {
        body: {
            model: null,
            pelvis: {
                pelvis: null,
                pivot: null,
                LegL: {
                    upperPivot: null,
                    upperLeg: null,
                    lowerPivot: null,
                    lowerLeg: null,
                },
                LegR: {
                    upperPivot: null,
                    upperLeg: null,
                    lowerPivot: null,
                    lowerLeg: null,
                }
            },
            ArmL: {
                upperPivot: null,
                upperArm: null,
                lowerPivot: null,
                lowerArm: null,
            },
            ArmR: {
                upperPivot: null,
                upperArm: null,
                lowerPivot: null,
                lowerArm: null,
            },
            head: {
                pivot: null,
                head: null
            }
        }
    }
    state = {
        currentAction: CHARACTER_ACTION.NONE,
        XPosition: {
            OnLeft: false,
            OnCenter: true,
            OnRight: false,
        },
    }
    speed = 1
    currentTween = null
    directionAnimation = null
    getCenterBodyAnimation = null
    loaderManager = null
    _isPaused = false

    constructor(loaderManager) {
        this.loaderManager = loaderManager
        this.model = new THREE.Object3D()

        const textureLoader = new THREE.TextureLoader(this.loaderManager)
        const path = window.location.href.substring(0, window.location.href.lastIndexOf("/"))
        const blackMetal = new THREE.MeshPhongMaterial({map: textureLoader.load(path + "/resources/textures/black_metal.jpg")});
        const metal = new THREE.MeshPhongMaterial({
            map: textureLoader.load(path + "/resources/textures/robot/ubertexture_metal_spec.jpg"),
            normalMap: textureLoader.load(path + "/resources/textures/robot/ubertexture_metal_normal.jpg")
        });

        const bodyGeometry = new THREE.CylinderGeometry(1, 0.8, BODY_HEIGHT, 64);
        const body = new THREE.Mesh(bodyGeometry, metal);
        body.rotation.x = Math.PI / 2
        body.name = "body"
        this.hierarchicalModel.body.model = body

        const pelvisGeometry = new THREE.ConeGeometry(PELVIS_RADIUS, PELVIS_RADIUS_HEIGHT, MIDDLE_RESOLUTION_SEGMENTS);
        const pelvis = new THREE.Mesh(pelvisGeometry, metal);
        pelvis.rotation.x = Math.PI
        pelvis.position.y -= 0.4
        pelvis.name = "pelvis"
        this.hierarchicalModel.body.pelvis.pelvis = pelvis

        const pivotGeometry = new THREE.SphereGeometry(PIVOT_RADIUS, 64, 64);
        this.hierarchicalModel.body.pelvis.pivot = new THREE.Mesh(pivotGeometry, blackMetal);
        this.hierarchicalModel.body.pelvis.pivot.position.y -= 0.85
        this.hierarchicalModel.body.pelvis.pivot.add(pelvis)

        //Right leg
        this.hierarchicalModel.body.pelvis.LegR.upperPivot = new THREE.Mesh(pivotGeometry, metal);
        this.hierarchicalModel.body.pelvis.LegR.upperPivot.position.set(0.5, 0, 0)

        const legUpperGeometry = new THREE.CylinderGeometry(LEG_LOWER_LARGE_RADIUS, LEG_LOWER_SMALL_RADIUS, LEG_UPPER_LENGTH, HIGH_RESOLUTION_SEGMENTS);
        this.hierarchicalModel.body.pelvis.LegR.upperLeg = new THREE.Mesh(legUpperGeometry, blackMetal);
        this.hierarchicalModel.body.pelvis.LegR.upperLeg.position.set(0, LEG_LOWER_LENGTH / 2, 0)
        this.hierarchicalModel.body.pelvis.LegR.upperPivot.add(this.hierarchicalModel.body.pelvis.LegR.upperLeg)

        this.hierarchicalModel.body.pelvis.LegR.lowerPivot = new THREE.Mesh(pivotGeometry, metal);
        this.hierarchicalModel.body.pelvis.LegR.lowerPivot.position.set(0, UPPER_ARM_LENGTH / 2, 0)

        const legLowerGeometry = new THREE.CylinderGeometry(LEG_LOWER_SMALL_RADIUS, LEG_LOWER_LARGE_RADIUS, LEG_LOWER_LENGTH, HIGH_RESOLUTION_SEGMENTS);
        this.hierarchicalModel.body.pelvis.LegR.lowerLeg = new THREE.Mesh(legLowerGeometry, blackMetal);
        this.hierarchicalModel.body.pelvis.LegR.lowerLeg.position.y = LEG_LOWER_LENGTH / 2

        this.hierarchicalModel.body.pelvis.LegR.lowerPivot.add(this.hierarchicalModel.body.pelvis.LegR.lowerLeg)
        this.hierarchicalModel.body.pelvis.LegR.upperLeg.add(this.hierarchicalModel.body.pelvis.LegR.lowerPivot)
        this.hierarchicalModel.body.pelvis.pelvis.add(this.hierarchicalModel.body.pelvis.LegR.upperPivot)

        //Left leg
        this.hierarchicalModel.body.pelvis.LegL.upperPivot = new THREE.Mesh(pivotGeometry, metal);
        this.hierarchicalModel.body.pelvis.LegL.upperPivot.position.set(-0.5, 0, 0)

        this.hierarchicalModel.body.pelvis.LegL.upperLeg = new THREE.Mesh(legUpperGeometry, blackMetal);
        this.hierarchicalModel.body.pelvis.LegL.upperLeg.position.set(0, LEG_LOWER_LENGTH / 2, 0)
        this.hierarchicalModel.body.pelvis.LegL.upperPivot.add(this.hierarchicalModel.body.pelvis.LegL.upperLeg)

        this.hierarchicalModel.body.pelvis.LegL.lowerPivot = new THREE.Mesh(pivotGeometry, metal);
        this.hierarchicalModel.body.pelvis.LegL.lowerPivot.position.set(0, UPPER_ARM_LENGTH / 2, 0)

        this.hierarchicalModel.body.pelvis.LegL.lowerLeg = new THREE.Mesh(legLowerGeometry, blackMetal);
        this.hierarchicalModel.body.pelvis.LegL.lowerLeg.position.y = LEG_LOWER_LENGTH / 2

        this.hierarchicalModel.body.pelvis.LegL.lowerPivot.add(this.hierarchicalModel.body.pelvis.LegL.lowerLeg)
        this.hierarchicalModel.body.pelvis.LegL.upperLeg.add(this.hierarchicalModel.body.pelvis.LegL.lowerPivot)
        this.hierarchicalModel.body.pelvis.pelvis.add(this.hierarchicalModel.body.pelvis.LegL.upperPivot)

        //Left Arm
        this.hierarchicalModel.body.ArmL.upperPivot = new THREE.Mesh(pivotGeometry, blackMetal);
        this.hierarchicalModel.body.ArmL.upperPivot.position.set(1.2, 0.5, 0)
        this.hierarchicalModel.body.ArmL.upperPivot.rotation.z = THREE.Math.degToRad(DEFAULT_ARM_APERTURE_DEGREE)

        const armUpperGeometry = new THREE.CylinderGeometry(0.2, 0.15, UPPER_ARM_LENGTH, 64);
        this.hierarchicalModel.body.ArmL.upperArm = new THREE.Mesh(armUpperGeometry, blackMetal);
        this.hierarchicalModel.body.ArmL.upperArm.position.y = -UPPER_ARM_LENGTH / 2

        this.hierarchicalModel.body.ArmL.lowerPivot = new THREE.Mesh(pivotGeometry, metal);
        this.hierarchicalModel.body.ArmL.lowerPivot.position.set(0, -UPPER_ARM_LENGTH / 2, 0)
        this.hierarchicalModel.body.ArmL.lowerPivot.rotation.z = -this.hierarchicalModel.body.ArmL.upperPivot.rotation.z

        const armLowerGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.60, 64);
        this.hierarchicalModel.body.ArmL.lowerArm = new THREE.Mesh(armLowerGeometry, metal);
        this.hierarchicalModel.body.ArmL.lowerArm.position.set(0, -0.3, 0)

        this.hierarchicalModel.body.ArmL.lowerPivot.add(this.hierarchicalModel.body.ArmL.lowerArm)
        this.hierarchicalModel.body.ArmL.upperArm.add(this.hierarchicalModel.body.ArmL.lowerPivot)
        this.hierarchicalModel.body.ArmL.upperPivot.add(this.hierarchicalModel.body.ArmL.upperArm)

        //Right Arm
        this.hierarchicalModel.body.ArmR.upperPivot = new THREE.Mesh(pivotGeometry, blackMetal);
        this.hierarchicalModel.body.ArmR.upperPivot.position.set(-1.2, 0.5, 0)
        this.hierarchicalModel.body.ArmR.upperPivot.rotation.z = -THREE.Math.degToRad(DEFAULT_ARM_APERTURE_DEGREE)

        this.hierarchicalModel.body.ArmR.upperArm = new THREE.Mesh(armUpperGeometry, blackMetal);
        this.hierarchicalModel.body.ArmR.upperArm.position.y = -UPPER_ARM_LENGTH / 2

        this.hierarchicalModel.body.ArmR.lowerPivot = new THREE.Mesh(pivotGeometry, metal);
        this.hierarchicalModel.body.ArmR.lowerPivot.position.set(0, -UPPER_ARM_LENGTH / 2, 0)
        this.hierarchicalModel.body.ArmR.lowerPivot.rotation.z = -this.hierarchicalModel.body.ArmR.upperPivot.rotation.z

        this.hierarchicalModel.body.ArmR.lowerArm = new THREE.Mesh(armLowerGeometry, metal);
        this.hierarchicalModel.body.ArmR.lowerArm.position.set(0, -0.3, 0)

        this.hierarchicalModel.body.ArmR.lowerPivot.add(this.hierarchicalModel.body.ArmR.lowerArm)
        this.hierarchicalModel.body.ArmR.upperArm.add(this.hierarchicalModel.body.ArmR.lowerPivot)
        this.hierarchicalModel.body.ArmR.upperPivot.add(this.hierarchicalModel.body.ArmR.upperArm)

        this.hierarchicalModel.body.head.pivot = new THREE.Mesh(pivotGeometry, blackMetal);
        this.hierarchicalModel.body.head.pivot.position.set(0, (PIVOT_RADIUS + BODY_HEIGHT) / 2, 0)

        const headMaterials = [
            metal,
            metal,
            metal,
            metal,
            new THREE.MeshPhongMaterial({
                map: new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/robot/face.png"),
                normalMap: new THREE.TextureLoader(this.loaderManager).load(path + "/resources/textures/robot/face_normal.png")
            }),
            metal
        ]

        const headGeometry = new THREE.BoxGeometry(HEAD_WIDTH, HEAD_HEIGHT, HEAD_DEPTH);
        this.hierarchicalModel.body.head.head = new THREE.Mesh(headGeometry, headMaterials);
        this.hierarchicalModel.body.head.head.position.set(0, (PIVOT_RADIUS + HEAD_HEIGHT) / 2, 0)
        this.hierarchicalModel.body.head.pivot.add(this.hierarchicalModel.body.head.head)

        body.add(this.hierarchicalModel.body.head.pivot)
        body.add(this.hierarchicalModel.body.ArmL.upperPivot)
        body.add(this.hierarchicalModel.body.ArmR.upperPivot)
        body.add(this.hierarchicalModel.body.pelvis.pivot)

        body.position.z += 2.5
        this.model.add(body)


        this.getCenterBodyAnimation = new TWEEN.Tween(this.hierarchicalModel.body.model.rotation).to({y: 0}, 300)

    }

    getModel() {
        return this.model
    }

    getRigidBody() {
        return this.rigidBody
    }

    startWalking() {

        if (this._isPaused)
            return;
        if (!this._isOnFloor())
            return

        this.state.currentAction = CHARACTER_ACTION.WALKING

        const ANIMATION_SPEED = 400 / this.speed
        const keyFrameA = new TWEEN.Tween([
            this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmR.upperPivot.rotation,
            this.hierarchicalModel.body.ArmL.upperPivot.rotation,
            this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmL.lowerPivot.rotation,
            this.hierarchicalModel.body.head.pivot.rotation,
            this.hierarchicalModel.body.model.rotation,
        ])
            .to([{x: LEG_UPPER_WALK_APERTURE_REAR * this.speed}, {x: LEG_UPPER_WALK_APERTURE_FRONT * this.speed}, {x: LEG_LOWER_WALK_APERTURE_FRONT}, {x: LEG_LOWER_WALK_APERTURE_REAR},
                {x: this.speed * Math.PI / 4, z: 0},
                {x: -this.speed * Math.PI / 4, z: 0},
                {x: -Math.PI / 6, z: 0},
                {x: 0, z: 0},
                {y: Math.PI / 16}, {x: Math.PI / 2}], ANIMATION_SPEED)
            .easing(TWEEN.Easing.Circular.None)

        const keyFrameB = new TWEEN.Tween([
            this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmR.upperPivot.rotation,
            this.hierarchicalModel.body.ArmL.upperPivot.rotation,
            this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmL.lowerPivot.rotation,
            this.hierarchicalModel.body.head.pivot.rotation,
            this.hierarchicalModel.body.model.rotation,
        ])
            .to([{x: LEG_UPPER_WALK_APERTURE_FRONT * this.speed}, {x: LEG_UPPER_WALK_APERTURE_REAR * this.speed}, {x: LEG_LOWER_WALK_APERTURE_REAR}, {x: LEG_LOWER_WALK_APERTURE_FRONT},
                {x: -this.speed * Math.PI / 4, z: 0},
                {x: this.speed * Math.PI / 4, z: 0},
                {x: 0, z: 0},
                {x: -Math.PI / 6, z: 0},
                {y: -Math.PI / 16}, {x: Math.PI / 2}, {x: Math.PI / 2}], ANIMATION_SPEED)
            .easing(TWEEN.Easing.Circular.None)

        this._stopAnimation()
        this.currentTween = keyFrameA
        this.currentTween.chain(keyFrameB)
        keyFrameB.chain(this.currentTween)
        this.currentTween.start()
        this.state.walking = true
    }

    stopWalking() {
        this.state.currentAction = CHARACTER_ACTION.NONE
        this._stopAnimation()
        this.currentTween = new TWEEN.Tween([
            this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmR.upperPivot.rotation,
            this.hierarchicalModel.body.ArmL.upperPivot.rotation,
            this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmL.lowerPivot.rotation,
            this.hierarchicalModel.body.head.pivot.rotation,
        ])
            .to([
                {x: 0}, {x: 0}, {x: 0}, {x: 0},
                {x: 0}, {x: 0}, {x: 0}, {x: 0},
                {y: 0}
            ], 300)
            .easing(TWEEN.Easing.Exponential.None)
            .onComplete(() => {
                this.state.walking = false
            })
        this.currentTween.start()


    }

    deltaTime = 0
    lastState = null

    updatePosition(time) {

        if (this._isPaused)
            return

        if (this.state.currentAction !== CHARACTER_ACTION.NONE && this.state.currentAction !== CHARACTER_ACTION.FALLING)
            this.model.position.y -= this.speed

        if (this.state.currentAction == CHARACTER_ACTION.WALKING)
            this.model.position.z = WALKING_Z
    }

    xPositions = {
        LEFT: 6,
        CENTER: 0,
        RIGHT: -6
    }

    goLeft() {
        if (this.state.currentAction !== CHARACTER_ACTION.WALKING || this._isPaused)
            return
        if (this.state.XPosition.OnRight) {
            this.goCenter()
            return
        }
        this.stopDirectionAnimation()
        this.directionAnimation = new TWEEN.Tween([this.model.position, this.hierarchicalModel.body.model.rotation])
            .to([{x: this.xPositions.LEFT}, {y: Math.PI / 8}], 300 / this.speed)
        this.directionAnimation.chain(this.getCenterBodyAnimation)
        this.directionAnimation.start()
        this.state.XPosition.OnRight = false
        this.state.XPosition.OnCenter = false
        this.state.XPosition.OnLeft = true
    }

    goCenter() {
        if (this.state.currentAction !== CHARACTER_ACTION.WALKING || this._isPaused)
            return
        let direction = 0
        if (this.state.XPosition.OnLeft)
            direction = -1
        else if (this.state.XPosition.OnRight)
            direction = 1

        this.directionAnimation = new TWEEN.Tween([this.model.position, this.hierarchicalModel.body.model.rotation])
            .to([{x: this.xPositions.CENTER}, {y: direction * Math.PI / 8}], 300 / this.speed)
        this.directionAnimation.chain(this.getCenterBodyAnimation)
        this.directionAnimation.start()
        this.state.XPosition.OnRight = false
        this.state.XPosition.OnCenter = true
        this.state.XPosition.OnLeft = false
    }

    goRight() {
        if (this.state.currentAction !== CHARACTER_ACTION.WALKING || this._isPaused)
            return
        if (this.state.XPosition.OnLeft) {
            this.goCenter()
            return
        }
        this.directionAnimation = new TWEEN.Tween([this.model.position, this.hierarchicalModel.body.model.rotation])
            .to([{x: this.xPositions.RIGHT}, {y: -Math.PI / 8}], 300)
        this.directionAnimation.chain(this.getCenterBodyAnimation)
        this.directionAnimation.start()
        this.state.XPosition.OnRight = true
        this.state.XPosition.OnCenter = false
        this.state.XPosition.OnLeft = false

    }

    goDown() {
        if (this.state.currentAction === CHARACTER_ACTION.DOWN || this._isPaused)
            return
        this.state.currentAction = CHARACTER_ACTION.DOWN
        const ANIMATION_SPEED = 400 / this.speed
        this._stopAnimation()
        this.state.isDown = true
        this.state.walking = false

        const frameA = new TWEEN.Tween([
            this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmR.upperPivot.rotation,
            this.hierarchicalModel.body.ArmL.upperPivot.rotation,
            this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmL.lowerPivot.rotation,
            this.hierarchicalModel.body.model.rotation,
            this.hierarchicalModel.body.position

        ])
            .to([{x: Math.PI / 4}, {x: Math.PI / 4}, {x: 0}, {x: 0},
                {x: Math.PI / 2}, {x: Math.PI / 2}, {x: -Math.PI / 2}, {x: -Math.PI / 2},
                {x: 0}, {z: -4}], ANIMATION_SPEED * 1.3)
            .easing(TWEEN.Easing.Circular.Out)
        const frameB = new TWEEN.Tween([
            this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
            this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmR.upperPivot.rotation,
            this.hierarchicalModel.body.ArmL.upperPivot.rotation,
            this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
            this.hierarchicalModel.body.ArmL.lowerPivot.rotation,
            this.hierarchicalModel.body.model.rotation,
            this.hierarchicalModel.body.position

        ])
            .to([
                    {x: 0}, {x: 0}, {x: 0}, {x: 0},
                    {z: 0}, {z: 0}, {z: 0}, {z: 0},
                    {x: Math.PI / 2}, {z: 3}],
                ANIMATION_SPEED)
            .easing(TWEEN.Easing.Circular.None)

        this.currentTween = frameA
        this.currentTween.chain(frameB)
        this.currentTween.onComplete(() => {
            this.startWalking()
        })
        this.currentTween.start()

    }

    jump() {
        if (this._isPaused)
            return;

        const ANIMATION_SPEED = 700 / this.speed
        this.state.currentAction = CHARACTER_ACTION.JUMPING
        this._stopAnimation()
        this.currentTween = new TWEEN.Tween([
                this.model.position,
                this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmR.upperPivot.rotation,
                this.hierarchicalModel.body.ArmL.upperPivot.rotation,
                this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmL.lowerPivot.rotation
            ]
        )
            .to([{z: 0},
                {x: -Math.PI * 2 / 3}, {x: -Math.PI * 2 / 3}, {x: Math.PI * 3 / 4}, {x: Math.PI * 3 / 4},
                {z: -Math.PI / 2}, {z: Math.PI / 2}, {z: -Math.PI / 2}, {z: Math.PI / 2}], 0.33 * ANIMATION_SPEED
            )
        const frameB = new TWEEN.Tween(
            [this.model.position,
                this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmR.upperPivot.rotation,
                this.hierarchicalModel.body.ArmL.upperPivot.rotation,
                this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmL.lowerPivot.rotation]
        )
            .to([{z: 5}, {x: 0}, {x: 0}, {x: 0}, {x: 0},
                {z: 0}, {z: 0}, {z: 0}, {z: 0}], ANIMATION_SPEED * 0.66)

        const frameC = new TWEEN.Tween(
            [this.model.position,
                this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmR.upperPivot.rotation,
                this.hierarchicalModel.body.ArmL.upperPivot.rotation,
                this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmL.lowerPivot.rotation]
        )
            .to([{z: WALKING_Z}, {x: 0}, {x: 0}, {x: 0}, {x: 0},
                {z: 0}, {z: 0}, {z: 0}, {z: 0}], ANIMATION_SPEED * 0.66)
            .onComplete(() => {
                this.startWalking()
            })
        frameB.chain(frameC)
        this.currentTween.chain(frameB)
        this.currentTween.start()

    }

    _stopAnimation() {
        if (this.currentTween) {
            this.currentTween.stop();
        }
    }

    setSpeed(speed) {
        const speedHasChanged = this.speed !== speed
        this.speed = speed
        // this.rigidBody.velocity.y = speed * -50
        if (speedHasChanged && this.state.currentAction !== CHARACTER_ACTION.FALLING) {
            this._stopAnimation()
            this.startWalking()
        }
    }

    _isOnFloor() {
        return 1//Math.round(this.rigidBody.position.z) === 3
    }

    getDistance() {
        return -this.model.position.y
    }

    stopWalkingImmediate() {
        this.state.currentAction = CHARACTER_ACTION.NONE
        this._stopAnimation()
    }

    fallIntoTheWall() {
        const ANIMATION_SPEED = 300 // this.speed
        this.state.currentAction = CHARACTER_ACTION.FALLING
        this._stopAnimation()
        this.currentTween = new TWEEN.Tween([
                this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmR.upperPivot.rotation,
                this.hierarchicalModel.body.ArmL.upperPivot.rotation,
                this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmL.lowerPivot.rotation
            ]
        )

        this.currentTween.to([
            {z: -Math.PI / 6, x: 0}, {z: Math.PI / 6, x: 0}, {x: 0}, {x: 0},
            {z: -Math.PI * 2 / 3, x: 0}, {z: Math.PI * 2 / 3, x: 0}, {z: 0}, {z: 0}], ANIMATION_SPEED
        )
        this.currentTween.start()
    }

    fallInTheBack() {
        const ANIMATION_SPEED = 300 // this.speed
        this.state.currentAction = CHARACTER_ACTION.FALLING
        this._stopAnimation()
        this.currentTween = new TWEEN.Tween([
                this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmR.upperPivot.rotation,
                this.hierarchicalModel.body.ArmL.upperPivot.rotation,
                this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmL.lowerPivot.rotation,
                this.model.rotation,
                this.model.position
            ]
        )

        this.currentTween.to([
            {z: -Math.PI / 6, x: Math.PI / 6}, {z: Math.PI / 6, x: Math.PI / 6}, {x: 0}, {x: 0},
            {z: -Math.PI * 2 / 3, x: -Math.PI / 6}, {z: Math.PI * 2 / 3, x: -Math.PI / 6},
            {z: 0, x: 0}, {z: 0, x: 0}, {x: -Math.PI / 2}, {z: WALKING_Z + 0.5}], ANIMATION_SPEED
        )
        this.currentTween.start()
    }

    fallOnTheFront() {
        const ANIMATION_SPEED = 300 // this.speed
        this.state.currentAction = CHARACTER_ACTION.FALLING
        this._stopAnimation()
        this.currentTween = new TWEEN.Tween([
                this.hierarchicalModel.body.pelvis.LegR.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.upperPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegR.lowerPivot.rotation,
                this.hierarchicalModel.body.pelvis.LegL.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmR.upperPivot.rotation,
                this.hierarchicalModel.body.ArmL.upperPivot.rotation,
                this.hierarchicalModel.body.ArmR.lowerPivot.rotation,
                this.hierarchicalModel.body.ArmL.lowerPivot.rotation,
                this.hierarchicalModel.body.model.rotation,
                this.hierarchicalModel.body.head.head.rotation
            ]
        )

        this.currentTween.to([
            {z: -Math.PI / 6, x: -Math.PI / 2}, {z: Math.PI / 6, x: -Math.PI / 2}, {x: 0}, {x: 0},
            {z: -Math.PI * 2 / 3, x: Math.PI / 2}, {
                z: Math.PI * 2 / 3,
                x: Math.PI / 2
            }, {z: 0}, {z: 0}, {x: Math.PI}, {x: Math.PI / 6}], ANIMATION_SPEED
        )


        this.currentTween.start()
    }


    get isPaused() {
        return this._isPaused;
    }

    set isPaused(value) {
        this._isPaused = value;
    }

    stopDirectionAnimation() {
        if (this.directionAnimation)
            this.directionAnimation.stop()
    }
}