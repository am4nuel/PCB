import * as THREE from 'three';
import { TransformControls } from 'three-stdlib';

export class InteractionManager {
    constructor(sceneManager, pcbManager) {
        this.sceneManager = sceneManager;
        this.pcbManager = pcbManager;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.hoveredObject = null;
        this.hoveredInstanceId = null;
        this.selectedObject = null;
        this.selectedInstanceId = null;

        this.transformProxy = new THREE.Object3D();
        this.sceneManager.scene.add(this.transformProxy);
        
        this.transformControls = new TransformControls(
            this.sceneManager.camera,
            this.sceneManager.canvas
        );
        this.sceneManager.scene.add(this.transformControls);
        
        // Lock to XZ plane
        this.transformControls.showY = false;
        
        this.setupEvents();
    }

    setupEvents() {
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.sceneManager.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.sceneManager.controls.enabled = !event.value;
        });

        this.transformControls.addEventListener('change', () => {
            if (this.selectedObject) {
                if (this.selectedObject.isInstancedMesh && this.transformProxy.onUpdate) {
                    this.transformProxy.onUpdate();
                } else {
                    this.updateSelectedData();
                }
            }
        });
    }

    onMouseMove(event) {
        const rect = this.sceneManager.canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.checkHover();
    }

    checkHover() {
        if (this.pcbManager.pads.circleMesh) {
            this.pcbManager.pads.circleMesh.updateMatrixWorld();
        }
        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        // Intersect pads and traces
        const intersects = this.raycaster.intersectObjects([
            this.pcbManager.pads.circleMesh,
            this.pcbManager.pads.rectMesh,
            this.pcbManager.traces.group
        ], true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const instanceId = intersects[0].instanceId;
            
            if (this.hoveredObject !== object || (instanceId !== undefined && this.hoveredInstanceId !== instanceId)) {
                this.clearHover();
                this.hoveredObject = object;
                this.hoveredInstanceId = instanceId;
                this.setHoverState(object, instanceId, true);
                this.sceneManager.canvas.style.cursor = 'pointer';
            }
        } else {
            if (this.hoveredObject) {
                this.clearHover();
                this.sceneManager.canvas.style.cursor = 'auto';
            }
        }
    }

    setHoverState(object, instanceId, state) {
        if (object.isInstancedMesh) {
            const attr = object.geometry.getAttribute('aHovered');
            if (attr) {
                attr.setX(instanceId, state ? 1.0 : 0.0);
                attr.needsUpdate = true;
            }
        } else if (object.material && object.material.uniforms) {
            object.material.uniforms.uHovered.value = state ? 1.0 : 0.0;
        }
    }

    clearHover() {
        if (this.hoveredObject) {
            this.setHoverState(this.hoveredObject, this.hoveredInstanceId, false);
            this.hoveredObject = null;
            this.hoveredInstanceId = null;
        }
    }

    onMouseDown(event) {
        this.onMouseMove(event);
        
        if (this.hoveredObject) {
            this.select(this.hoveredObject, this.hoveredInstanceId);
        } else if (!this.transformControls.dragging) {
            this.deselect();
        }
    }

    select(object, instanceId) {
        this.deselect();
        this.selectedObject = object;
        this.selectedInstanceId = instanceId;
        
        if (object.isInstancedMesh) {
            const attr = object.geometry.getAttribute('aSelected');
            if (attr) {
                attr.setX(instanceId, 1.0);
                attr.needsUpdate = true;
            }
        } else if (object.material && object.material.uniforms) {
            object.material.uniforms.uSelected.value = 1.0;
        }

        // Attach transform controls
        if (object.isInstancedMesh) {
            const matrix = new THREE.Matrix4();
            object.getMatrixAt(instanceId, matrix);
            
            matrix.decompose(this.transformProxy.position, this.transformProxy.quaternion, this.transformProxy.scale);
            
            this.transformControls.showY = false;
            this.transformControls.attach(this.transformProxy);
            
            this.transformProxy.onUpdate = () => {
                this.transformProxy.updateMatrix();
                object.setMatrixAt(instanceId, this.transformProxy.matrix);
                object.instanceMatrix.needsUpdate = true;
                this.updateSelectedData();
            };
        } else {
            this.transformControls.attach(object);
        }

        this.updateSelectedData();
    }

    deselect() {
        if (this.selectedObject) {
            if (this.selectedObject.isInstancedMesh) {
                const attr = this.selectedObject.geometry.getAttribute('aSelected');
                if (attr) {
                    attr.setX(this.selectedInstanceId, 0.0);
                    attr.needsUpdate = true;
                }
            } else if (this.selectedObject.material && this.selectedObject.material.uniforms) {
                this.selectedObject.material.uniforms.uSelected.value = 0.0;
            }
            this.transformControls.detach();
            this.selectedObject = null;
            this.selectedInstanceId = null;
            this.transformProxy.onUpdate = null; // Clear callback
            
            if (this.onSelectionChange) {
                this.onSelectionChange(null);
            }
        }
    }

    updateSelectedData() {
        if (!this.selectedObject) return;

        let componentData = null;

        if (this.selectedObject.isInstancedMesh) {
            // Find component data from PCB manager
            const pads = this.pcbManager.pads.pads;
            const padData = pads[this.selectedInstanceId];
            
            if (padData) {
                // Update position in padData
                padData.pos = [
                    this.transformProxy.position.x,
                    this.transformProxy.position.y,
                    this.transformProxy.position.z
                ];
                
                const radius = 0.5 * padData.size[0];
                const area = Math.PI * radius * radius;
                
                componentData = {
                    id: padData.id,
                    type: padData.type === 'smd_circle' ? 'Circular Pad' : 'Pad',
                    pos: padData.pos,
                    size: padData.size,
                    area: area
                };
            }
        } else {
            componentData = {
                id: this.selectedObject.userData.id,
                type: 'path',
                pos: [this.selectedObject.position.x, this.selectedObject.position.y, this.selectedObject.position.z],
                size: [1, 1], // Placeholder
                area: 0 // Placeholder
            };
        }

        if (this.onSelectionChange && componentData) {
            this.onSelectionChange(componentData);
        }
    }

    deleteSelected() {
        if (this.selectedObject) {
            const id = this.selectedObject.isInstancedMesh 
                ? this.pcbManager.pads.pads[this.selectedInstanceId]?.id 
                : this.selectedObject.userData.id;
            
            if (id) {
                this.pcbManager.deleteComponent(id);
                this.deselect();
            }
        }
    }

    dispose() {
        this.transformControls.dispose();
    }
}
