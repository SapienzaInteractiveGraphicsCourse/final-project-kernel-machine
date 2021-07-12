import * as THREE from '../lib/three.module.js';
import {GLTFLoader} from "../lib/GLTFLoader.js";

const FLOOR_WIDTH = 20
const FLOOR_LENGTH = 100
const FLOOR_HEIGHT = 1

const WALL_HEIGHT = 3
const WALL_THICK = 1

function getFloorInstance() {
    const floorGeometry = new THREE.BoxGeometry(FLOOR_WIDTH, FLOOR_LENGTH, FLOOR_HEIGHT);
    const floorMaterial = new THREE.MeshPhongMaterial({color: '#8AC'});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);

    const wallGeometryL = new THREE.BoxGeometry(WALL_THICK, FLOOR_LENGTH, WALL_HEIGHT);
    const wallMaterialL = new THREE.MeshPhongMaterial({color: '#8AC'});
    const wallLeft = new THREE.Mesh(wallGeometryL, wallMaterialL)
    wallLeft.position.set(FLOOR_WIDTH/2, 0, WALL_HEIGHT/2)

    const wallGeometryR = new THREE.BoxGeometry(WALL_THICK, FLOOR_LENGTH, WALL_HEIGHT);
    const wallMaterialR = new THREE.MeshPhongMaterial({color: '#8AF'});
    const wallRight = new THREE.Mesh(wallGeometryR, wallMaterialR);
    wallRight.position.set(-FLOOR_WIDTH/2, 0, WALL_HEIGHT/2)

    floor.add(wallLeft)
    floor.add(wallRight)
    return floor;
}

function getMapObjects() {
    let objects = []
    const obj = getFloorInstance();
    obj.position.set(0, -50, 0);
    objects.push(obj)

    return objects
}

export {getMapObjects}