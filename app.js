import * as THREE from './lib/three.module.js';
import {MapGenerator} from './src/map/mapGenerator.js';
import {CameraHandler} from "./src/cameraHandler.js";
import {Car} from "./src/objectes/car.js"
import {KeyboardHandler} from "./src/keyboardHandler.js";
import {CannonDebugRenderer} from "./lib/CannonDebugRenderer.js"
import {MaterialGenerator} from "./src/Materials/MaterialGenerator.js";
import {Character} from "./src/objectes/character.js"
import {CollisionManager} from "./src/CollisionManager.js";
import {BlockGenerator} from "./src/map/BlockGenerator.js";

const FLOOR_LENGTH = 500 //MUST BE EQUAL TO THE ONE IN MAP GENERATOR

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});

    const gameoverMenu = document.getElementById("gameover")

    const fov = 40;
    const aspect = window.innerWidth / window.innerWidth
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 7.15, 7.20);
    camera.up.set(0, 0, 1);

    const cameraHandler = new CameraHandler(camera)

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    const world = new CANNON.World()
    world.gravity.set(0, 0, -10);

    const cannonDebugRender = new CannonDebugRenderer(scene, world);


    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add(ambientLight)

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(10, 10, 20)
        scene.add(light);
    }

    const mapGenerator = new MapGenerator()
    const blockGenerator = new BlockGenerator(50)

    // an array of objects who's rotation to update
    const objects = [];

    const character = new Character()
    mapGenerator.setCarPosition(character.getModel().position)


    const characterModel = character.getModel()
    characterModel.position.z = 1
    scene.add(characterModel)
    cameraHandler.setTarget(characterModel.position)
    //world.addBody(character.getRigidBody())

    const keyboardHandler = new KeyboardHandler()
    keyboardHandler.setCallback(event => {
        switch (event) {
            case KeyboardHandler.EVENTS.WPressed:
                //character.startWalking()
                break
            case KeyboardHandler.EVENTS.WReleased:
                //character.stopWalking()
                break
            case KeyboardHandler.EVENTS.APressed:
                character.goLeft()
                break
            case KeyboardHandler.EVENTS.DPressed:
                character.goRight()
                break
            case KeyboardHandler.EVENTS.SpacePressed:
                character.jump()
                break
            case KeyboardHandler.EVENTS.SPressed:
                character.goDown()
                break
        }
    })

    mapGenerator.getMapObjects().then((map) => {
        const blocks = blockGenerator.getBlocks(100, 250)
        console.log("BLOCKS", blocks.length)
        blocks.forEach(block => {
            scene.add(block)
        })
        scene.add(map)
    })

    const collisionManager = new CollisionManager(character.getModel().position, blockGenerator, character.hierarchicalModel.body.model.rotation)
    collisionManager._onCollision = function (block) {
        character.stopWalkingImmediate()
        if (block.name === "block_wall") {
            character.fallIntoTheWall()
            character.getModel().position.y += 1.5
        }
        else if (block.name === "block_float")
            character.fallInTheBack()
        else if (block.name === "block") {
            character.fallOnTheFront()
        }
        gameoverMenu.style.display = "block"
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    const FIXED_TIME_STEP = 1.0 / 60.0;
    const MAX_SUBSTEP = 3;

    character.startWalking()
    let speed = 10
    let lastTimeSpeedChanges = 0 //Last time when speed has changed

    function updateUI(time) {
        const distancesElements = document.getElementsByClassName("score")
        const dist = Math.round(character.getDistance() / 10)
        for (let i = 0; i < distancesElements.length; i++) {
            distancesElements.item(i).innerHTML =dist
        }
    }

    let mapCounter = 0

    function render(time) {
        time *= 0.001;


        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        objects.forEach((obj) => {
            obj.rotation.y = time;
        });
        if (Math.round(time) % 5 === 0 && Math.round(time) !== lastTimeSpeedChanges && speed < 100) {
            speed++
            lastTimeSpeedChanges = Math.round(time)
            console.log("SPEED CHANGED", speed)
        }
        character.setSpeed(Math.log10(speed))
        console.log(collisionManager.updateCollision(1 / 120))
        collisionManager.removeUnusedBlock().forEach(block => {
            scene.remove(block)
        })

        cameraHandler.update()
        mapGenerator.update().then(obj => {
            blockGenerator.getBlocks(FLOOR_LENGTH / 2 + FLOOR_LENGTH * (obj.counter - 1), FLOOR_LENGTH / 2 + FLOOR_LENGTH * (obj.counter)).forEach(block => {
                scene.add(block)
            })
            scene.add(obj.mdl)
            mapCounter++
        })
        TWEEN.update()
        character.updatePosition(time)
        world.step(1 / 60);
        updateUI(time)
        cannonDebugRender.update();      // Update the debug renderer
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    requestAnimationFrame(render);
}

main();