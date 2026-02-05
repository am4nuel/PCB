import * as THREE from 'three';
import { COLORS } from '../layers/LayerConstants';

export class DrillSystem {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.holes = []; // Store hole data: { id, pos, diameter }
        this.instancedMesh = null;
    }

    init(count = 500) {
        // Create a cylindrical tube for the hole
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1, true); // openEnded = true
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x050505, 
            side: THREE.DoubleSide,
            shininess: 10
        });

        this.instancedMesh = new THREE.InstancedMesh(geometry, material, count);
        this.instancedMesh.count = 0;
        this.instancedMesh.visible = false;
        this.instancedMesh.frustumCulled = false;
        this.instancedMesh.name = 'PCB_DrillHoles';
        this.sceneManager.scene.add(this.instancedMesh);
    }

    addHole(holeData) {
        this.holes.push({
            id: holeData.id || `hole_${Math.random().toString(36).substr(2, 5)}`,
            pos: holeData.pos,
            diameter: holeData.diameter
        });
        this.updateHoles();
    }

    updateHoles() {
        const matrix = new THREE.Matrix4();
        const boardThickness = 1.6;

        this.holes.forEach((hole, i) => {
            const { pos, diameter } = hole;
            // pos is [x, y, z] from component data
            const x = pos[0];
            const z = pos[2];
            
            matrix.makeScale(diameter, boardThickness + 0.1, diameter);
            matrix.setPosition(x, -boardThickness / 2, z);
            
            this.instancedMesh.setMatrixAt(i, matrix);
        });

        this.instancedMesh.count = this.holes.length;
        this.instancedMesh.visible = this.holes.length > 0;
        this.instancedMesh.instanceMatrix.needsUpdate = true;
        this.instancedMesh.computeBoundingSphere();
    }

    dispose() {
        if (this.instancedMesh) {
            this.instancedMesh.geometry.dispose();
            this.instancedMesh.material.dispose();
            this.sceneManager.scene.remove(this.instancedMesh);
        }
    }
}
