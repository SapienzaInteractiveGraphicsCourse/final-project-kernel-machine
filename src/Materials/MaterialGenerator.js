import {Material} from "./Material.js";

export class MaterialGenerator {
    groundMaterial = null
    slipperyMaterial = null

    constructor() {
        this.groundMaterial = this.generateGroundMaterial()
        this.slipperyMaterial = this.generateSlipperyMaterial()
    }

    generateGroundMaterial() {
        const groundMaterial = new CANNON.Material("groundMaterial");

        // Adjust constraint equation parameters for ground/ground contact
        const ground_ground_cm = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
            friction: 0.4,
            restitution: 0.3,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3,
            frictionEquationStiffness: 1e8,
            frictionEquationRegularizationTime: 3,
        });

        return new Material(groundMaterial, ground_ground_cm)
    }

    /*
    * Returns the groundMaterial
    * @returns {Material}
    */
    getGroundMaterial() {
        if (this.groundMaterial == null)
            this.groundMaterial = new this.generateGroundMaterial()
        return this.groundMaterial
    }

    getSlipperyMaterial() {
        if (this.slipperyMaterial == null)
            this.slipperyMaterial = new this.generateSlipperyMaterial()
        return this.slipperyMaterial
    }

    generateSlipperyMaterial() {
        var slipperyMaterial = new CANNON.Material("slipperyMaterial");

        // The ContactMaterial defines what happens when two materials meet.
        // In this case we want friction coefficient = 0.0 when the slippery material touches ground.
        var slippery_ground_cm = new CANNON.ContactMaterial(this.getGroundMaterial(), slipperyMaterial, {
            friction: 0,
            restitution: 0.3,
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3
        });

        return new Material(slipperyMaterial, slippery_ground_cm)
    }
}