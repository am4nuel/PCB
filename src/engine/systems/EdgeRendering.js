import * as THREE from 'three';
import { getCopperMaterial } from '../materials/CopperShader';

export class EdgeRendering {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.edgeGroups = new THREE.Group();
        this.edgeGroups.name = 'PCB_Edges';
        this.sceneManager.scene.add(this.edgeGroups);
        
        this.edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    }

    addEdge(object) {
        if (!object.geometry) return;
        
        const edges = new THREE.EdgesGeometry(object.geometry);
        const line = new THREE.LineSegments(edges, this.edgeMaterial);
        
        // Match object transform
        line.position.copy(object.position);
        line.rotation.copy(object.rotation);
        line.scale.copy(object.scale);
        
        this.edgeGroups.add(line);
        return line;
    }

    clear() {
        this.edgeGroups.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
        });
        this.edgeGroups.clear();
    }
}
