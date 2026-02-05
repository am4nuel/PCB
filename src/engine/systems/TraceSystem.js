import * as THREE from 'three';
import { Z_OFFSETS, COLORS } from '../layers/LayerConstants';
import { getMetalMaterial } from '../materials/MetalShader';

export class TraceSystem {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.traces = []; // Store trace data: { id, points, width, layer }
        this.group = new THREE.Group();
        this.group.name = 'PCB_Traces';
        this.sceneManager.scene.add(this.group);
    }

    addTrace(traceData) {
        if (!traceData.type) traceData.type = 'path';
        this.traces.push(traceData);
        const { points, width, layer } = traceData;
        const zOffset = (layer === 'top' ? Z_OFFSETS.TOP_COPPER : Z_OFFSETS.BOTTOM_COPPER);

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = new THREE.Vector3(points[i][0], zOffset, points[i][1]);
            const p2 = new THREE.Vector3(points[i+1][0], zOffset, points[i+1][1]);
            
            const distance = p1.distanceTo(p2);
            const geometry = new THREE.BoxGeometry(width, 0.01, distance);
            
            const material = getMetalMaterial();
            material.uniforms.uColor.value.set(COLORS.COPPER);
            material.uniforms.uIsCircle.value = 0.0;

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.id = traceData.id;
            
            // Position and rotate the segment
            const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            mesh.position.copy(center);
            mesh.lookAt(p2);
            
            this.group.add(mesh);
        }
    }

    deleteTrace(id) {
        const index = this.traces.findIndex(t => t.id === id);
        if (index !== -1) {
            this.traces.splice(index, 1);
            
            // Remove meshes from group
            const meshesToRemove = [];
            this.group.traverse(child => {
                if (child.userData && child.userData.id === id) {
                    meshesToRemove.push(child);
                }
            });

            meshesToRemove.forEach(mesh => {
                mesh.geometry.dispose();
                mesh.material.dispose();
                this.group.remove(mesh);
            });
        }
    }

    dispose() {
        this.group.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        this.sceneManager.scene.remove(this.group);
    }
}
