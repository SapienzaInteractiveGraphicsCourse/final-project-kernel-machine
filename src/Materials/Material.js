export class Material {
    material = null
    contactMaterial = null

    constructor(material, contactMaterial) {
        this.material = material;
        this.contactMaterial = contactMaterial;
    }

    getMaterial() {
        return this.material;
    }

    setMaterial(value) {
        this.material = value;
    }

    getContactMaterial() {
        return this.contactMaterial;
    }

    setContactMaterial(value) {
        this.contactMaterial = value;
    }
}