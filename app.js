import * as THREE from './lib/three.module.js';
import {MapGenerator} from './src/map/mapGenerator.js';
import {CameraHandler} from "./src/cameraHandler.js";
import {Car} from "./src/objectes/car.js"
import {KeyboardHandler} from "./src/keyboardHandler.js";
import {CannonDebugRenderer} from "./lib/CannonDebugRenderer.js"

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});

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
    world.gravity.set(0, 0, -9.82);

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

    // an array of objects who's rotation to update
    const objects = [];

    const car = new Car()
    car.getModelPromise()
        .then(car => {
            scene.add(car.car)
            cameraHandler.setTarget(car.car.position)
            mapGenerator.setCarPosition(car.car.position)
            //console.log(car.rigidbody)
            world.addBody(car.rigidbody)
        })

    const keyboardHandler = new KeyboardHandler(car)

    mapGenerator.getMapObjects().then((map) => {
        scene.add(map.obj)
        world.addBody(map.body)
    })


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

        cameraHandler.update()
        mapGenerator.update().then(obj => {
            scene.add(obj.obj)
            world.addBody(obj.body)
        })
        car.animate(time)
        world.step(1 / 60);
        cannonDebugRender.update();      // Update the debug renderer
        requestAnimationFrame(render);
        renderer.render(scene, camera);


    }

    requestAnimationFrame(render);
}

main();