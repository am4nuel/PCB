import * as THREE from 'three';
import { LAYERS, Z_OFFSETS, COLORS } from '../layers/LayerConstants';
import { getMetalMaterial } from '../materials/MetalShader';

export class PadSystem {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.pads = [];
        this.circleMesh = null;
        this.rectMesh = null;
        this.material = null;
    }

    init(count = 1000) {
        this.material = getMetalMaterial();
        this.material.defines = { USE_INSTANCING: '' };
        this.material.uniforms.uColor.value.set(COLORS.COPPER);
        this.material.uniforms.uIsCircle.value = 1.0;

        // Shared attributes setup
        const setupMesh = (mesh, name) => {
            mesh.name = name;
            const hoverAttr = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
            const selectedAttr = new THREE.InstancedBufferAttribute(new Float32Array(count), 1);
            mesh.geometry.setAttribute('aHovered', hoverAttr);
            mesh.geometry.setAttribute('aSelected', selectedAttr);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.count = 0;
            mesh.frustumCulled = false;
            mesh.visible = false;
            this.sceneManager.scene.add(mesh);
        };

        // Circular Geometry
        const circleGeom = new THREE.CircleGeometry(0.5, 32);
        circleGeom.rotateX(-Math.PI / 2);
        this.circleMesh = new THREE.InstancedMesh(circleGeom, this.material, count);
        setupMesh(this.circleMesh, 'SMD_Pads_Circle');

        // Rectangular Geometry
        const rectGeom = new THREE.PlaneGeometry(1, 1);
        rectGeom.rotateX(-Math.PI / 2);
        this.rectMesh = new THREE.InstancedMesh(rectGeom, this.material, count);
        setupMesh(this.rectMesh, 'SMD_Pads_Rect');
    }

    addPad(padData) {
        this.pads.push(padData);
        this.updatePads();
    }

    updatePads() {
        if (!this.circleMesh || !this.rectMesh) return;

        const matrix = new THREE.Matrix4();
        let circleIdx = 0;
        let rectIdx = 0;


        this.circleMesh.geometry.getAttribute('aHovered').array.fill(0);
        this.circleMesh.geometry.getAttribute('aSelected').array.fill(0);
        this.rectMesh.geometry.getAttribute('aHovered').array.fill(0);
        this.rectMesh.geometry.getAttribute('aSelected').array.fill(0);

        this.pads.forEach((pad) => {
            const { pos, size, type, layer } = pad;
            const zOffset = (layer === 'top' ? Z_OFFSETS.TOP_PAD : Z_OFFSETS.BOTTOM_PAD);
            
            matrix.makeScale(size[0], 1, size[1]);
            matrix.setPosition(pos[0], zOffset, pos[2]);
            
            if (type === 'smd_circle') {
                this.circleMesh.setMatrixAt(circleIdx++, matrix);
            } else {
                this.rectMesh.setMatrixAt(rectIdx++, matrix);
            }
        });

        this.circleMesh.count = circleIdx;
        this.circleMesh.visible = circleIdx > 0;
        this.circleMesh.instanceMatrix.needsUpdate = true;
        this.circleMesh.computeBoundingSphere();

        this.rectMesh.count = rectIdx;
        this.rectMesh.visible = rectIdx > 0;
        this.rectMesh.instanceMatrix.needsUpdate = true;
        this.rectMesh.computeBoundingSphere();

        this.circleMesh.geometry.getAttribute('aHovered').needsUpdate = true;
        this.circleMesh.geometry.getAttribute('aSelected').needsUpdate = true;
        this.rectMesh.geometry.getAttribute('aHovered').needsUpdate = true;
        this.rectMesh.geometry.getAttribute('aSelected').needsUpdate = true;
    }

    getPadByInstance(meshName, instanceId) {
        const type = meshName === 'SMD_Pads_Circle' ? 'smd_circle' : 'smd_rect';
        let foundIdx = 0;
        for (const pad of this.pads) {
            if (pad.type === type) {
                if (foundIdx === instanceId) return pad;
                foundIdx++;
            }
        }
        return null;
    }

    deletePad(id) {
        const index = this.pads.findIndex(p => p.id === id);
        if (index !== -1) {
            this.pads.splice(index, 1);
            this.updatePads();
        }
    }

    dispose() {
        if (this.circleMesh) {
            this.circleMesh.geometry.dispose();
            this.sceneManager.scene.remove(this.circleMesh);
        }
        if (this.rectMesh) {
            this.rectMesh.geometry.dispose();
            this.sceneManager.scene.remove(this.rectMesh);
        }
        if (this.material) this.material.dispose();
    }
}
