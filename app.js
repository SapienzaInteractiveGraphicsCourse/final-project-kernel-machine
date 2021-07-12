import * as THREE from './lib/three.module.js';
import * as MapGenerator from './src/mapGenerator.js';
import {CameraHandler} from "./src/cameraHandler.js";
import {Car} from "./src/objectes/car.js"
import {KeyboardHandler} from "./src/keyboardHandler.js";
import * as TWEEN from './lib/tween.js/dist/tween.umd.js';

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});

    const fov = 40;
    const aspect = window.innerWidth / window.innerWidth
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 7.15, 7.20);
    //camera.rotation.set(-1.21,1.14,3.14,'XYZ')
    camera.up.set(0, 0, 1);
    //camera.lookAt(0, 0, 0);

    const cameraHandler = new CameraHandler(camera)

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add(ambientLight)

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(10, 10, 20)
        scene.add(light);
    }

    // an array of objects who's rotation to update
    const objects = [];


    const car = new Car()
    car.getModelPromise().then(model=>{
        scene.add(model)
    })

    const keyboardHandler = new KeyboardHandler(car)


    MapGenerator.getMapObjects().forEach(e => {
        scene.add(e)
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

        car.animate(time)
        requestAnimationFrame(render);
        //TWEEN.update(time)
        renderer.render(scene, camera);


    }

    requestAnimationFrame(render);
}

main();