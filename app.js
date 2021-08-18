import * as THREE from './lib/three.module.js';
import {MapGenerator} from './src/map/mapGenerator.js';
import {CameraHandler} from "./src/cameraHandler.js";
import {KeyboardHandler} from "./src/keyboardHandler.js";
import {Character} from "./src/objectes/character.js"
import {CollisionManager} from "./src/CollisionManager.js";
import {BlockGenerator} from "./src/map/BlockGenerator.js";

const FLOOR_LENGTH = 1000 //MUST BE EQUAL TO THE ONE IN MAP GENERATOR

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    const loadManager = new THREE.LoadingManager();

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
    //scene.background = new THREE.Color('#f14063');
    const loader = new THREE.TextureLoader(loadManager);
    const path = window.location.href.substring(0, window.location.href.lastIndexOf("/"))
    loader.load(path + '/resources/textures/space.jpg', function (texture) {
        scene.background = texture;
    });

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.05);
    scene.add(ambientLight)

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(10, 10, 20)
        scene.add(light);
    }

    {
        const color = 0x9999FF;
        const intensity = 0.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, -100, 5)
        light.rotation.set(0,0,0)
        scene.add(light);
    }

    const mapGenerator = new MapGenerator(loadManager)
    const blockGenerator = new BlockGenerator(50, loadManager)

    const character = new Character(loadManager)
    mapGenerator.setCarPosition(character.getModel().position)


    const characterModel = character.getModel()
    characterModel.position.z = 1
    scene.add(characterModel)
    cameraHandler.setTarget(characterModel.position)

    const keyboardHandler = new KeyboardHandler()
    keyboardHandler.setCallback(event => {
        switch (event) {
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
        const blocks = blockGenerator.getBlocks(100, FLOOR_LENGTH / 2)
        blocks.forEach(block => {
            scene.add(block)
        })
        scene.add(map)
    })

    const collisionManager = new CollisionManager(character.getModel().position, blockGenerator, character.hierarchicalModel.body.model.rotation)
    collisionManager._onCollision = function (block) {
        character.stopWalkingImmediate()
        character.stopDirectionAnimation()
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

    let speed = 10
    let lastTimeSpeedChanges = 0 //Last time when speed has changed
    character.isPaused = true
    loadManager.onLoad = (() => {
        document.getElementById("loading_flex").style.display = 'none'
        document.getElementById("distance").style.display = 'block'
        character.isPaused = false
        character.startWalking()
        console.log("LOADED COMPLETE")
    })


    function updateUI(time) {
        const distancesElements = document.getElementsByClassName("score")
        const dist = Math.round(character.getDistance() / 10)
        for (let i = 0; i < distancesElements.length; i++) {
            distancesElements.item(i).innerHTML = dist
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

        if (!character.isPaused) {
            if (Math.round(time) % 5 === 0 && Math.round(time) !== lastTimeSpeedChanges && speed < 100) {
                speed++
                lastTimeSpeedChanges = Math.round(time)
            }
            character.setSpeed(Math.log10(speed))


            collisionManager.updateCollision(1 / 120)
            collisionManager.removeUnusedBlock().forEach(block => {
                scene.remove(block)
            })
        }

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
        updateUI(time)

        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    requestAnimationFrame(render);
}

main();