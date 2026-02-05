import * as THREE from 'three';
import { LAYERS, Z_OFFSETS, COLORS } from '../layers/LayerConstants';

export class Board {
    constructor(sceneManager, options = {}) {
        this.sceneManager = sceneManager;
        this.width = options.width || 100;
        this.height = options.height || 80;
        this.thickness = options.thickness || 1.6;

        this.mesh = null;
        this.create();
    }

    create(holes = []) {
        const shape = new THREE.Shape();
        shape.moveTo(-this.width / 2, -this.height / 2);
        shape.lineTo(this.width / 2, -this.height / 2);
        shape.lineTo(this.width / 2, this.height / 2);
        shape.lineTo(-this.width / 2, this.height / 2);
        shape.closePath();

        // Add physical holes to the shape
        holes.forEach(hole => {
            const hShape = new THREE.Path();
            hShape.absarc(hole.pos[0], hole.pos[2], hole.diameter / 2, 0, Math.PI * 2, true);
            shape.holes.push(hShape);
        });

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: this.thickness,
            bevelEnabled: false
        });

        const material = new THREE.MeshPhongMaterial({
            color: COLORS.BOARD,
            shininess: 30,
            side: THREE.DoubleSide
        });

        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.geometry = geometry;
        } else {
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.receiveShadow = true;
            this.mesh.castShadow = true;
            this.mesh.name = 'PCB_substrate';
            this.sceneManager.scene.add(this.mesh);
        }

        this.mesh.rotation.x = Math.PI / 2;
        this.mesh.position.y = -0.05; // Slightly below Y=0 to avoid Z-fighting
        
        this.mesh.geometry.computeBoundingBox();
        this.mesh.geometry.computeBoundingSphere();
        this.mesh.frustumCulled = false;
    }

    updateDimensions(width, height, thickness, holes = []) {
        this.width = width;
        this.height = height;
        this.thickness = thickness;
        this.create(holes);
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.sceneManager.scene.remove(this.mesh);
        }
    }
}
